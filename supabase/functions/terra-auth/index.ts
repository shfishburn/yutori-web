import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const TERRA_API_BASE = "https://api.tryterra.co/v2";

// Mobile apps don't enforce CORS, but restrict for defense-in-depth.
function getCorsOrigin(req?: Request): string {
  const origin = req?.headers?.get("origin") ?? "";
  const allowed: string[] = [
    "https://qxxgzstpnjytositftvm.supabase.co",
  ];
  const env = Deno.env.get("ENVIRONMENT") ?? "";
  if (env === "local" || env === "development") {
    allowed.push("http://localhost:8081", "http://localhost:3000");
  }
  return allowed.includes(origin) ? origin : allowed[0];
}

const corsHeaders = (req?: Request) => ({
  "Access-Control-Allow-Origin": getCorsOrigin(req),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Vary": "Origin",
});

function jsonResponse(body: unknown, status = 200, req?: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  });
}

async function authenticateUser(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.warn("[terra-auth] No Authorization header present");
    return null;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    console.error("[terra-auth] Missing env vars — SUPABASE_URL:", !!supabaseUrl, "SERVICE_ROLE_KEY:", !!serviceKey);
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const token = authHeader.replace("Bearer ", "");

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error("[terra-auth] getUser error:", error.message);
      return null;
    }
    if (!user?.id) {
      console.warn("[terra-auth] getUser returned no user");
      return null;
    }
    return user.id;
  } catch (err) {
    console.error("[terra-auth] getUser threw:", err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, req);
  }

  const devId = Deno.env.get("TERRA_DEV_ID");
  const apiKey = Deno.env.get("TERRA_API_KEY");

  if (!devId || !apiKey) {
    console.error("[terra-auth] Missing Terra env vars — DEV_ID:", !!devId, "API_KEY:", !!apiKey);
    return jsonResponse({ error: "Terra credentials not configured" }, 500, req);
  }

  try {
    // Extract authenticated user ID from JWT — never trust client-supplied reference_id
    const referenceId = await authenticateUser(req);
    if (!referenceId) {
      return jsonResponse({ error: "Authentication required" }, 401, req);
    }

    // Generate a short-lived auth token for the mobile SDK
    const resp = await fetch(`${TERRA_API_BASE}/auth/generateAuthToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "dev-id": devId,
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        reference_id: referenceId,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[terra-auth] Terra auth failed:", resp.status, errText);
      // W2-11 fix: don't leak Terra's error body or status to the client.
      return jsonResponse(
        { error: "Terra auth request failed" },
        502,
        req,
      );
    }

    const terraData = await resp.json();
    const token =
      terraData?.token ??
      terraData?.auth_token ??
      terraData?.data?.token ??
      terraData?.data?.auth_token ??
      null;

    if (!token || typeof token !== "string") {
      console.error("[terra-auth] Terra response missing token. Keys:", Object.keys(terraData ?? {}));
      return jsonResponse(
        { error: "Terra did not return auth token" },
        502,
        req,
      );
    }

    // Return a stable shape for the mobile client.
    return jsonResponse({ token }, 200, req);
  } catch (err) {
    console.error("[terra-auth] error:", err);
    return jsonResponse({ error: "Internal server error" }, 500, req);
  }
});
