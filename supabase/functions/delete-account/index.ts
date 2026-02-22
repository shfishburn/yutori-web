import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ── CORS (mirrors terra-auth pattern) ────────────────────────
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

// ── Tables that store per-user data ──────────────────────────
const USER_DATA_TABLES = [
  "telemetry_events",
  "coach_analyses",
  "health_samples",
] as const;

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
    console.error(
      "[delete-account] Missing env vars — SUPABASE_URL:",
      !!supabaseUrl,
      "SERVICE_ROLE_KEY:",
      !!serviceKey,
    );
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

  if (authError || !user?.id) {
    console.error("[delete-account] auth failed:", authError?.message ?? "no user");
    return jsonResponse({ error: "Authentication required" }, 401, req);
  }

  const userId = user.id;

  // ── Delete user data from all tables ───────────────────────
  const failures: string[] = [];

  for (const table of USER_DATA_TABLES) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error(`[delete-account] Failed to delete from ${table}:`, error.message);
      failures.push(table);
    }
  }

  if (failures.length > 0) {
    return jsonResponse(
      { error: "Failed to delete data from: " + failures.join(", ") },
      500,
      req,
    );
  }

  // ── Delete the auth user ───────────────────────────────────
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error("[delete-account] Failed to delete auth user:", deleteError.message);
    return jsonResponse({ error: "Failed to delete account" }, 500, req);
  }

  console.log("[delete-account] Account deleted successfully");
  return jsonResponse({ success: true }, 200, req);
});
