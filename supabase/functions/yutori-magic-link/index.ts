import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ── CORS ─────────────────────────────────────────────────────
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
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, x-client-info",
  "Vary": "Origin",
});

function jsonResponse(body: unknown, status = 200, req?: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  });
}

// ── Allowed redirect origins (prevent open redirect) ─────────
// W2-3 fix: only allow localhost in local/development environments
// to prevent open-redirect in production.
function getAllowedRedirectPrefixes(): string[] {
  const prefixes = ["https://thermalwellness.app"];
  const env = Deno.env.get("ENVIRONMENT") ?? "";
  if (env === "local" || env === "development") {
    prefixes.push("http://localhost:3000");
  }
  return prefixes;
}

function isAllowedRedirect(url: string): boolean {
  return getAllowedRedirectPrefixes().some((prefix) => url.startsWith(prefix));
}

// ── Handler ──────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, req);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    console.error("[magic-link] Missing env vars");
    return jsonResponse({ error: "Server misconfigured" }, 500, req);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // ── Authenticate caller ────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Authentication required" }, 401, req);
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user?.id || !user.email) {
    console.error("[magic-link] auth failed:", authError?.message ?? "no user/email");
    return jsonResponse({ error: "Authentication required" }, 401, req);
  }

  // ── Parse body ─────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400, req);
  }

  const redirectTo = typeof body.redirectTo === "string" ? body.redirectTo : "";
  if (!redirectTo || !isAllowedRedirect(redirectTo)) {
    return jsonResponse(
      { error: "Invalid or missing redirectTo — must start with https://thermalwellness.app" },
      400,
      req,
    );
  }

  // ── Generate magic link via admin API ──────────────────────
  // generateLink produces a URL with #access_token=...&refresh_token=...
  // without sending an email — the mobile app opens it directly in Safari.
  try {
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
      options: {
        redirectTo,
      },
    });

    if (linkError || !data?.properties?.action_link) {
      console.error("[magic-link] generateLink failed:", linkError?.message ?? "no action_link");
      return jsonResponse({ error: "Could not generate link" }, 500, req);
    }

    return jsonResponse({ url: data.properties.action_link }, 200, req);
  } catch (err) {
    console.error("[magic-link] unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500, req);
  }
});
