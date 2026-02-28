import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "https://qxxgzstpnjytositftvm.supabase.co",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }

  // Read the raw body for signature verification
  const body = await req.text();

  // Verify the Terra webhook signature (mandatory)
  const terraSecret = Deno.env.get("TERRA_SIGNING_SECRET");
  if (!terraSecret) {
    console.error("TERRA_SIGNING_SECRET not configured — refusing all webhooks");
    return new Response(
      JSON.stringify({ error: "Webhook authentication not configured" }),
      { status: 503, headers: { "Content-Type": "application/json", ...CORS } },
    );
  }
  {
    const signature = req.headers.get("terra-signature") ?? "";
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // Verify HMAC-SHA256 signature (constant-time comparison)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(terraSecret);
    const messageData = encoder.encode(body);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    // Validate hex format before parsing
    if (!/^[0-9a-fA-F]+$/.test(signature) || signature.length % 2 !== 0) {
      return new Response(JSON.stringify({ error: "Invalid signature format" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // Use crypto.subtle.verify for constant-time comparison instead of string equality
    const signatureBytes = new Uint8Array(
      (signature.match(/.{2}/g) ?? []).map(b => parseInt(b, 16))
    );

    const valid = await crypto.subtle.verify("HMAC", cryptoKey, signatureBytes, messageData);
    if (!valid) {
      // Never log the expected signature — prevents timing attack vectors
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(
      JSON.stringify({ error: "Server misconfigured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS } },
    );
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload = JSON.parse(body);
    const eventType = payload.type ?? payload.event ?? "unknown";

    // W2-4 fix: log only metadata (not full biometric payload) to reduce
    // data privacy liability, and wrap in try/catch so a logging failure
    // doesn't return 500 to Terra (which would cause retries).
    try {
      await supabase.from("terra_webhook_log").insert({
        event_type: eventType,
        payload: {
          has_user: !!payload.user?.reference_id,
          data_entries: Array.isArray(payload.data) ? payload.data.length : (payload.data ? 1 : 0),
        },
      });
    } catch (logErr) {
      console.warn("terra_webhook_log insert failed:", logErr);
    }

    // Process health data payloads
    if (eventType === "body" || eventType === "daily" || eventType === "activity") {
      const user = payload.user;
      const data = payload.data ?? [];

      // reference_id is the Supabase user UUID we passed during initTerra()
      // Treat empty string the same as missing (Terra test payloads send "")
      const referenceId = user?.reference_id || null;
      // W2-1 fix: validate reference_id is a UUID before using as user_id
      // to prevent data insertion against invalid/unexpected user identifiers.
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const userId: string | null = (referenceId && UUID_RE.test(referenceId)) ? referenceId : null;

      if (!userId) {
        // Terra test payloads have empty/invalid reference_id — return 200 to prevent retries.
        console.warn(`[terra-webhook] skipping ${eventType}: no valid reference_id`);
        return new Response(
          JSON.stringify({ status: "skipped", reason: "no reference_id" }),
          { headers: { "Content-Type": "application/json", ...CORS } },
        );
      }

      for (const entry of !userId ? [] : Array.isArray(data) ? data : [data]) {
        // Extract heart rate samples
        const hrSamples = entry?.heart_rate_data?.detailed?.hr_samples ?? [];
        const hrvSamples =
          entry?.heart_rate_data?.detailed?.hrv_samples_sdnn ??
          entry?.heart_rate_data?.detailed?.hrv_samples ??
          [];

        // Build a map of HRV by timestamp for joining
        const hrvByTime: Record<number, number> = {};
        for (const s of hrvSamples) {
          const ts = typeof s.timestamp === "string"
            ? new Date(s.timestamp).getTime()
            : s.timestamp;
          hrvByTime[ts] = s.hrv_sdnn ?? s.hrv ?? s.rmssd ?? 0;
        }

        const healthRows = hrSamples
          .map((s: Record<string, unknown>) => {
            const ts = typeof s.timestamp === "string"
              ? new Date(s.timestamp as string).getTime()
              : (s.timestamp as number);

            // Validate timestamp is reasonable (not NaN, not in far future)
            if (!isFinite(ts) || ts > Date.now() + 86_400_000) return null;

            const hr = Number(s.bpm ?? s.hr ?? 0);
            // Validate heart rate is within physiological range
            if (!isFinite(hr) || hr < 20 || hr > 250) return null;

            const hrvVal = hrvByTime[ts] ?? null;
            // Validate HRV if present
            if (hrvVal !== null && (!isFinite(hrvVal) || hrvVal < 0 || hrvVal > 500)) return null;

            return {
              user_id: userId,
              heart_rate: hr,
              hrv: hrvVal,
              source: `terra:${user?.provider ?? "unknown"}`,
              recorded_at: new Date(ts).toISOString(),
            };
          })
          .filter((row: {
            user_id: string;
            heart_rate: number;
            hrv: number | null;
            source: string;
            recorded_at: string;
          } | null): row is {
            user_id: string;
            heart_rate: number;
            hrv: number | null;
            source: string;
            recorded_at: string;
          } => row !== null);

        if (healthRows.length > 0) {
          const { error } = await supabase
            .from("health_samples")
            .insert(healthRows);

          if (error) {
            console.error("Failed to insert health samples:", error);
            // Return 500 so the webhook provider can retry
            return new Response(
              JSON.stringify({ error: "Database insert failed" }),
              { status: 500, headers: { "Content-Type": "application/json", ...CORS } },
            );
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json", ...CORS },
    });
  } catch (err) {
    console.error("terra-webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS } },
    );
  }
});
