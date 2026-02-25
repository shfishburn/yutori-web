import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  SYSTEM_PROMPT,
  SESSION_SYSTEM_PROMPT,
  WELCOME_SYSTEM_PROMPT,
  PROTOCOL_SYSTEM_PROMPT,
} from "./prompts.ts";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Minimal DB typing for `coach_analyses` to keep Deno/TS happy.
// This does not affect runtime behavior.
type Database = {
  public: {
    Tables: {
      coach_analyses: {
        Row: {
          id: string;
          user_id: string;
          input_hash: string;
          analysis: Json;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          user_id: string;
          input_hash: string;
          analysis: Json;
          expires_at?: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          user_id?: string;
          input_hash?: string;
          analysis?: Json;
          expires_at?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ── Helpers ────────────────────────────────────────────────────
// Mobile apps don't enforce CORS, but restrict for defense-in-depth.
// Allow Supabase's own domain and localhost for local dev.
function getCorsOrigin(req?: Request): string {
  const origin = req?.headers?.get("origin") ?? "";
  const allowed: string[] = [
    "https://qxxgzstpnjytositftvm.supabase.co",
  ];
  // Only allow localhost in local/dev environments
  const env = Deno.env.get("ENVIRONMENT") ?? "";
  if (env === "local" || env === "development") {
    allowed.push("http://localhost:8081", "http://localhost:3000");
  }
  return allowed.includes(origin) ? origin : allowed[0];
}

const corsHeaders = (req?: Request) => ({
  "Access-Control-Allow-Origin": getCorsOrigin(req),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Vary": "Origin",
});

const OPENROUTER_HEADERS = (apiKey: string) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${apiKey}`,
  "HTTP-Referer": "https://yutorilabs.com",
  "X-Title": "Yutori Coach",
});

/** OpenRouter model slug — single source of truth. */
const AI_MODEL = "anthropic/claude-opus-4.6";

function jsonResponse(body: unknown, status = 200, req?: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  });
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Strip characters that could be used for prompt injection */
function sanitizeString(value: unknown, maxLen = 50): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^\p{L}\p{N}\s\-'.]/gu, "").slice(0, maxLen);
}

/** Validate enumerated gender values */
function sanitizeGender(value: unknown): string | null {
  if (value === "male" || value === "female" || value === "other") return value;
  return null;
}

/** Validate numeric profile field */
function sanitizeNumber(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !isFinite(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

/** Authenticate request and return user ID, or null on failure.
 *  Logs every failure path so we can diagnose 401s from server-side logs. */
async function authenticateUser(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.warn("[auth] No Authorization header present");
    return null;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    console.error("[auth] Missing env vars — SUPABASE_URL:", !!supabaseUrl, "SERVICE_ROLE_KEY:", !!serviceKey);
    return null;
  }

  const supabase = createClient<Database>(supabaseUrl, serviceKey);
  const token = authHeader.replace("Bearer ", "");

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error("[auth] getUser error:", error.message);
      return null;
    }
    if (!user) {
      console.warn("[auth] getUser returned no user");
      return null;
    }
    // user.id intentionally not logged in production
    return user.id;
  } catch (err) {
    console.error("[auth] getUser threw:", err);
    return null;
  }
}

/** Strip markdown code fences from AI response */
function stripCodeFences(text: string): string {
  if (text.startsWith("```")) {
    return text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return text;
}

// ── Governance / Output Gating ─────────────────────────────────
// Runs AFTER AI response parsing, BEFORE returning to client.
// Three layers: claim filter, duration clamp, protocol safety check.

/** Terms that must never appear in mobile-facing AI output. Case-insensitive. */
const BLOCKED_TERM_PATTERNS = [
  /\bHSP\d*\b/i,
  /\bgrowth\s+hormone\b/i,
  /\bnorepinephrine\b/i,
  /\bcytochrome\b/i,
  /\bATP\b/,
  /\bbrown\s+fat\b/i,
  /\bthermogenesis\b/i,
  /\bcold\s+shock\s+proteins?\b/i,
  /\bdiagnos/i,
  /\btreat(?:ment|ing|s)?\b/i,
  /\bcure[sd]?\b/i,
  /\bprescri/i,
  /\babnormal/i,
  /\bconcerning/i,
  /\bdangerous/i,
  /\balarming/i,
];

/** Hard safety ceilings from thermal.ts — duplicated here as a server-side safety net. */
const ABSOLUTE_LIMITS = {
  sauna: { maxTempC: 110, maxDurationMin: 30 },
  cold_plunge: { maxDurationMin: 15 },
};

/** Redact sentences in a text string that contain blocked terms. */
function redactBlockedClaims(text: string): string {
  if (!text) return text;
  // Split into sentences, filter out any containing blocked terms
  const sentences = text.split(/(?<=[.!?])\s+/);
  const clean = sentences.filter(
    (s) => !BLOCKED_TERM_PATTERNS.some((p) => p.test(s)),
  );
  return clean.join(" ").trim() || text; // fall back to original if everything gets filtered
}

/**
 * Govern a full analysis response — redact blocked claims from all text fields.
 * Mutates the analysis object in place.
 */
function governAnalysis(analysis: Record<string, unknown>): void {
  if (typeof analysis.summary === "string") {
    analysis.summary = redactBlockedClaims(analysis.summary);
  }

  if (Array.isArray(analysis.insights)) {
    for (const insight of analysis.insights) {
      if (typeof insight === "object" && insight !== null) {
        const ins = insight as Record<string, unknown>;
        if (typeof ins.body === "string") {
          ins.body = redactBlockedClaims(ins.body);
        }
        if (typeof ins.title === "string") {
          ins.title = redactBlockedClaims(ins.title);
        }
      }
    }
  }

  if (typeof analysis.pattern === "string") {
    analysis.pattern = redactBlockedClaims(analysis.pattern);
  }
  if (typeof analysis.suggestion === "string") {
    analysis.suggestion = redactBlockedClaims(analysis.suggestion);
  }
}

/** Extract the first number from a string like "25 min" or "12-15 min". Returns the max. */
function extractMaxMinutes(s: string): number | null {
  const nums = [...s.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1]));
  return nums.length > 0 ? Math.max(...nums) : null;
}

/** Extract max temperature in °C from strings like "78-82°C" or "172-180°F". */
function extractMaxTempC(s: string): number | null {
  // Try Celsius first
  const cMatch = [...s.matchAll(/(\d+(?:\.\d+)?)\s*°?\s*C/gi)].map((m) => parseFloat(m[1]));
  if (cMatch.length > 0) return Math.max(...cMatch);
  // Try Fahrenheit, convert
  const fMatch = [...s.matchAll(/(\d+(?:\.\d+)?)\s*°?\s*F/gi)].map((m) => parseFloat(m[1]));
  if (fMatch.length > 0) return Math.round((Math.max(...fMatch) - 32) * 5 / 9);
  return null;
}

/**
 * Govern a protocol response — redact blocked claims and clamp durations/temps.
 * Mutates the protocol object in place.
 */
function governProtocol(protocol: Record<string, unknown>): void {
  // Redact text fields
  if (typeof protocol.overview === "string") {
    protocol.overview = redactBlockedClaims(protocol.overview);
  }
  if (typeof protocol.safetyNotes === "string") {
    protocol.safetyNotes = redactBlockedClaims(protocol.safetyNotes);
  }
  if (typeof protocol.notes === "string") {
    protocol.notes = redactBlockedClaims(protocol.notes);
  }
  if (typeof protocol.adaptationSignal === "string") {
    protocol.adaptationSignal = redactBlockedClaims(protocol.adaptationSignal);
  }
  if (typeof protocol.progressMarker === "string") {
    protocol.progressMarker = redactBlockedClaims(protocol.progressMarker);
  }

  // Determine modality limits
  const pType = protocol.protocolType as string;
  const isContrast = pType === "contrast";
  const saunaLimits = ABSOLUTE_LIMITS.sauna;
  const coldLimits = ABSOLUTE_LIMITS.cold_plunge;

  // Check each week
  if (Array.isArray(protocol.weeks)) {
    for (const week of protocol.weeks) {
      if (typeof week !== "object" || week === null) continue;
      const w = week as Record<string, unknown>;
      const sessions = w.sessions as Record<string, unknown> | undefined;
      if (!sessions) continue;

      // Redact notes
      if (typeof sessions.notes === "string") {
        sessions.notes = redactBlockedClaims(sessions.notes);
      }
      if (typeof w.benchmark === "string") {
        w.benchmark = redactBlockedClaims(w.benchmark);
      }

      // Duration safety clamp
      if (typeof sessions.duration === "string") {
        const maxMin = extractMaxMinutes(sessions.duration);
        if (maxMin !== null) {
          const limit = (pType === "cold_plunge") ? coldLimits.maxDurationMin : saunaLimits.maxDurationMin;
          if (maxMin > limit) {
            sessions.duration = `${limit} min (capped at safety limit)`;
            console.warn(`[govern] Clamped duration from ${maxMin} to ${limit} min`);
          }
        }
      }

      // Temperature safety clamp (sauna and contrast only)
      if (typeof sessions.temperature === "string" && (pType === "sauna" || isContrast)) {
        const maxC = extractMaxTempC(sessions.temperature);
        if (maxC !== null && maxC > saunaLimits.maxTempC) {
          sessions.temperature = `${saunaLimits.maxTempC}°C (${Math.round(saunaLimits.maxTempC * 9 / 5 + 32)}°F) — capped at safety limit`;
          console.warn(`[govern] Clamped temperature from ${maxC}°C to ${saunaLimits.maxTempC}°C`);
        }
      }
    }
  }
}

// ── Main handler ───────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, req);
  }

  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY not configured");
    return jsonResponse({ error: "AI service not configured" }, 500, req);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400, req);
  }

  const VALID_MODES = ["full", "session", "welcome", "protocol"] as const;
  type Mode = (typeof VALID_MODES)[number];
  const rawMode = typeof body.mode === "string" ? body.mode : "full";
  const mode: Mode = (VALID_MODES as readonly string[]).includes(rawMode)
    ? (rawMode as Mode)
    : "full";

  try {

    // ── Auth gate — all modes require authenticated user ──────
    const userId = await authenticateUser(req);
    if (!userId) {
      return jsonResponse({ error: "Authentication required" }, 401, req);
    }

    // ── Per-session mode (lightweight) ─────────────────────────
    if (mode === "session") {
      const sessionData = body.sessionData;
      if (!sessionData) {
        return jsonResponse({ error: "sessionData required for mode=session" }, 400, req);
      }

      // Sanitize session data — only allow expected numeric/string values
      const safeType = sessionData.sessionType === "cold_plunge" ? "cold_plunge" : "sauna";
      const safeDuration = sanitizeNumber(sessionData.durationMinutes, 0, 600) ?? "N/A";
      let safePeakTemp = sanitizeNumber(sessionData.peakTempF, -50, 300);
      let safeMinTemp = sanitizeNumber(sessionData.minTempF, -50, 300);
      const safePeakHR = sanitizeNumber(sessionData.peakHR, 20, 300);
      const safeHRVTrend = sanitizeNumber(sessionData.hrvTrend, -500, 500);
      const safeSamples = sanitizeNumber(sessionData.sampleCount, 0, 100000) ?? 0;
      const safeAvgHumidity = sanitizeNumber(sessionData.avgHumidityPct, 0, 100);

      // Cross-field validation: minTemp must be ≤ peakTemp
      if (safePeakTemp != null && safeMinTemp != null && safeMinTemp > safePeakTemp) {
        // Swap — likely a client-side labeling error
        [safePeakTemp, safeMinTemp] = [safeMinTemp, safePeakTemp];
      }

      const aiResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: OPENROUTER_HEADERS(apiKey),
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 256,
          messages: [
            { role: "system", content: SESSION_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analyze this ${safeType} session:\n\nDuration: ${safeDuration} minutes\nPeak Temp: ${safePeakTemp ?? "N/A"}°F\nMin Temp: ${safeMinTemp ?? "N/A"}°F\nPeak HR: ${safePeakHR ?? "N/A"} BPM\nHRV Trend: ${safeHRVTrend ?? "N/A"} ms\nAvg Humidity: ${safeAvgHumidity != null ? safeAvgHumidity + "%" : "N/A"}\nSamples: ${safeSamples} data points`,
            },
          ],
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("OpenRouter error (session):", aiResp.status, errText);
        return jsonResponse({ error: "analysis_unavailable" }, 503, req);
      }

      const aiData = await aiResp.json();
      const insight = aiData.choices?.[0]?.message?.content?.trim() ?? null;

      return jsonResponse({ insight }, 200, req);
    }

    // ── Welcome mode (new user greeting) ───────────────────────
    if (mode === "welcome") {
      const profile = body.userProfile ?? {};
      const profileLines: string[] = [];

      const safeGender = sanitizeGender(profile.gender);
      const safeAge = sanitizeNumber(profile.age, 1, 120);
      const safeWeight = sanitizeNumber(profile.weightKg, 20, 500);
      const safeHeight = sanitizeNumber(profile.heightCm, 50, 300);

      if (safeGender) profileLines.push(`Gender: ${safeGender}`);
      if (safeAge) profileLines.push(`Age: ${safeAge}`);
      if (safeWeight) profileLines.push(`Weight: ${safeWeight} kg`);
      if (safeHeight) profileLines.push(`Height: ${safeHeight} cm`);

      const profileText = profileLines.length > 0
        ? `User profile:\n${profileLines.join("\n")}`
        : "No demographic data provided.";

      const aiResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: OPENROUTER_HEADERS(apiKey),
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 256,
          messages: [
            { role: "system", content: WELCOME_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Write a welcome message for a new user.\n\n${profileText}`,
            },
          ],
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("OpenRouter error (welcome):", aiResp.status, errText);
        return jsonResponse({ error: "welcome_unavailable" }, 503, req);
      }

      const aiData = await aiResp.json();
      const welcome = aiData.choices?.[0]?.message?.content?.trim() ?? null;

      return jsonResponse({ welcome }, 200, req);
    }

    // ── Protocol mode (personalized protocol generation) ───────
    if (mode === "protocol") {
      const protocolType = body.protocolType;
      if (!protocolType || !["sauna", "cold_plunge", "contrast"].includes(protocolType)) {
        return jsonResponse({ error: "protocolType must be 'sauna', 'cold_plunge', or 'contrast'" }, 400, req);
      }

      const sessionData = body.sessionData ?? {};
      const profile = body.userProfile ?? {};

      // Build user context string from session data
      const contextLines: string[] = [];
      contextLines.push(`Protocol type requested: ${protocolType}`);
      contextLines.push(`Total sessions: ${sanitizeNumber(sessionData.totalSessions, 0, 10000) ?? 0}`);

      const safeGender = sanitizeGender(profile.gender);
      const safeAge = sanitizeNumber(profile.age, 1, 120);
      const safeWeight = sanitizeNumber(profile.weightKg, 20, 500);
      const safeHeight = sanitizeNumber(profile.heightCm, 50, 300);

      if (safeGender) contextLines.push(`Gender: ${safeGender}`);
      if (safeAge) contextLines.push(`Age: ${safeAge}`);
      if (safeWeight) contextLines.push(`Weight: ${safeWeight} kg`);
      if (safeHeight) contextLines.push(`Height: ${safeHeight} cm`);

      // Sauna stats
      if (sessionData.saunaSessions) {
        const s = sessionData.saunaSessions;
        contextLines.push(`\nSauna sessions: ${sanitizeNumber(s.count, 0, 10000) ?? 0}`);
        if (s.avgDurationMinutes) contextLines.push(`  Avg duration: ${sanitizeNumber(s.avgDurationMinutes, 0, 120) ?? "N/A"} min`);
        if (s.avgPeakTempF) contextLines.push(`  Avg peak temp: ${sanitizeNumber(s.avgPeakTempF, 50, 300) ?? "N/A"}°F`);
        if (s.avgPeakHR) contextLines.push(`  Avg peak HR: ${sanitizeNumber(s.avgPeakHR, 30, 250) ?? "N/A"} BPM`);
      }

      // Cold stats
      if (sessionData.coldPlungeSessions) {
        const c = sessionData.coldPlungeSessions;
        contextLines.push(`\nCold plunge sessions: ${sanitizeNumber(c.count, 0, 10000) ?? 0}`);
        if (c.avgDurationMinutes) contextLines.push(`  Avg duration: ${sanitizeNumber(c.avgDurationMinutes, 0, 60) ?? "N/A"} min`);
        if (c.avgWaterTempF) contextLines.push(`  Avg water temp: ${sanitizeNumber(c.avgWaterTempF, 20, 100) ?? "N/A"}°F`);
        if (c.avgPeakHR) contextLines.push(`  Avg peak HR: ${sanitizeNumber(c.avgPeakHR, 30, 250) ?? "N/A"} BPM`);
      }

      // Zones
      if (sessionData.saunaZone) contextLines.push(`Most common sauna zone: ${sanitizeString(sessionData.saunaZone, 20)}`);
      if (sessionData.coldZone) contextLines.push(`Most common cold zone: ${sanitizeString(sessionData.coldZone, 20)}`);

      // Frequency
      if (sessionData.frequency) {
        const f = sessionData.frequency;
        if (f.sessionsPerWeek) contextLines.push(`\nFrequency: ${sanitizeNumber(f.sessionsPerWeek, 0, 50) ?? "N/A"} sessions/week`);
        if (f.mostCommonDayOfWeek) contextLines.push(`  Most common day: ${sanitizeString(f.mostCommonDayOfWeek, 15)}`);
        if (f.mostCommonTimeOfDay) contextLines.push(`  Most common time: ${sanitizeString(f.mostCommonTimeOfDay, 15)}`);
      }

      const aiResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: OPENROUTER_HEADERS(apiKey),
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 2048,
          messages: [
            { role: "system", content: PROTOCOL_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Generate a ${protocolType} protocol for this user:\n\n${contextLines.join("\n")}`,
            },
          ],
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("OpenRouter error (protocol):", aiResp.status, errText);
        return jsonResponse({ error: "protocol_unavailable" }, 503, req);
      }

      const aiData = await aiResp.json();
      let content = stripCodeFences(aiData.choices?.[0]?.message?.content?.trim() ?? "");

      let protocol;
      try {
        protocol = JSON.parse(content);
      } catch {
        console.error("Protocol JSON parse failed, retrying...");
        const retryResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: OPENROUTER_HEADERS(apiKey),
          body: JSON.stringify({
            model: AI_MODEL,
            max_tokens: 2048,
            temperature: 0.3,
            messages: [
              { role: "system", content: PROTOCOL_SYSTEM_PROMPT },
              {
                role: "user",
                content: `Generate a ${protocolType} protocol for this user:\n\n${contextLines.join("\n")}`,
              },
            ],
          }),
        });

        if (!retryResp.ok) {
          return jsonResponse({ error: "protocol_unavailable" }, 503, req);
        }

        const retryData = await retryResp.json();
        const retryContent = stripCodeFences(retryData.choices?.[0]?.message?.content?.trim() ?? "");

        try {
          protocol = JSON.parse(retryContent);
        } catch {
          console.error("Protocol JSON parse failed on retry");
          return jsonResponse({ error: "protocol_unavailable", message: "Could not parse AI response." }, 503, req);
        }
      }

      // Validate required fields
      if (!protocol.title || !Array.isArray(protocol.weeks) || protocol.weeks.length === 0) {
        return jsonResponse({ error: "protocol_unavailable", message: "AI response was malformed." }, 503, req);
      }

      // ── Governance gate ──────────────────────────────────
      governProtocol(protocol as Record<string, unknown>);

      protocol.generatedAt = new Date().toISOString();

      // ── Persist to coach_protocols (fire-and-forget) ─────
      // Split the protocol into deterministic schedule vs AI narrative
      // so mobile reads only schedule, web reads both.
      const supabaseUrlP = Deno.env.get("SUPABASE_URL") ?? "";
      const serviceKeyP = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      if (supabaseUrlP && serviceKeyP) {
        const sbProto = createClient<Database>(supabaseUrlP, serviceKeyP);
        const weeks = Array.isArray(protocol.weeks) ? protocol.weeks : [];

        const scheduleWeeks = weeks.map((w: Record<string, unknown>, idx: number) => {
          const sess = (w.sessions ?? {}) as Record<string, unknown>;
          return {
            weekNumber: typeof w.weekNumber === "number" ? w.weekNumber : idx + 1,
            focus: typeof w.focus === "string" ? w.focus : "",
            frequency: typeof sess.frequency === "string" ? sess.frequency : "",
            duration: typeof sess.duration === "string" ? sess.duration : "",
            temperature: typeof sess.temperature === "string" ? sess.temperature : "",
          };
        });

        const weeklyNotes = weeks.map((w: Record<string, unknown>) => {
          const sess = (w.sessions ?? {}) as Record<string, unknown>;
          return typeof sess.notes === "string" ? sess.notes : "";
        });

        const weeklyBenchmarks = weeks.map((w: Record<string, unknown>) =>
          typeof w.benchmark === "string" ? w.benchmark : ""
        );

        const narrativeObj = {
          overview: typeof protocol.overview === "string" ? protocol.overview : "",
          notes: typeof protocol.notes === "string" ? protocol.notes : (typeof protocol.safetyNotes === "string" ? protocol.safetyNotes : ""),
          progressMarker: typeof protocol.progressMarker === "string" ? protocol.progressMarker : (typeof protocol.adaptationSignal === "string" ? protocol.adaptationSignal : ""),
          weeklyNotes,
          weeklyBenchmarks,
        };

        sbProto.from("coach_protocols").insert({
          user_id: userId,
          protocol_type: protocolType as string,
          title: typeof protocol.title === "string" ? protocol.title : "Protocol",
          schedule: scheduleWeeks,
          narrative: narrativeObj,
        }).then(({ error: insErr }) => {
          if (insErr) console.warn("[protocol-cache] insert failed:", insErr.message);
          else console.log("[protocol-cache] saved for user", userId);
        });
      }

      return jsonResponse({ protocol }, 200, req);
    }

    // ── Full analysis mode ─────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mode: _mode, ...input } = body; // separate mode without mutating body

    // Sanitize userFirstName to prevent prompt injection
    const userFirstName = sanitizeString(input.userFirstName, 30) || "there";
    input.userFirstName = userFirstName;

    // ── Cache check ──────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = supabaseUrl && serviceKey
      ? createClient<Database>(supabaseUrl, serviceKey)
      : null;

    if (supabase) {
      const inputHash = await sha256(JSON.stringify(input));

      const { data: cached } = await supabase
        .from("coach_analyses")
        .select("analysis")
        .eq("user_id", userId)
        .eq("input_hash", inputHash)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (cached?.analysis) {
        return jsonResponse(cached.analysis as Json, 200, req);
      }
    }

    // ── Call OpenRouter ──────────────────────────────────────
    const userMessage = `Analyze this thermal wellness data for ${userFirstName}:\n\n${JSON.stringify(input, null, 2)}`;

    const aiResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: OPENROUTER_HEADERS(apiKey),
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 2048,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("OpenRouter error (full):", aiResp.status, errText);
      return jsonResponse(
        { error: "analysis_unavailable", message: "Coach analysis is temporarily unavailable. Please try again later." },
        503,
        req,
      );
    }

    const aiData = await aiResp.json();
    let content = stripCodeFences(aiData.choices?.[0]?.message?.content?.trim() ?? "");

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      // Retry once with temperature nudge to get different output
      console.warn("First parse failed, retrying OpenRouter call...");
      const retryResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: OPENROUTER_HEADERS(apiKey),
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 2048,
          temperature: 0.3,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (!retryResp.ok) {
        return jsonResponse({ error: "analysis_unavailable" }, 503, req);
      }

      const retryData = await retryResp.json();
      const retryContent = stripCodeFences(retryData.choices?.[0]?.message?.content?.trim() ?? "");

      try {
        analysis = JSON.parse(retryContent);
      } catch {
        console.error("JSON parse failed on retry");
        return jsonResponse({ error: "analysis_unavailable", message: "Could not parse AI response." }, 503, req);
      }
    }

    // ── Validate response schema ─────────────────────────────
    if (
      typeof analysis.summary !== "string" ||
      !Array.isArray(analysis.insights) ||
      analysis.insights.length === 0
    ) {
      console.error("AI response missing required fields");
      return jsonResponse({ error: "analysis_unavailable", message: "AI response was malformed." }, 503, req);
    }

    // ── Governance gate ──────────────────────────────────
    governAnalysis(analysis as Record<string, unknown>);

    // Add timestamp
    (analysis as Record<string, unknown>).generatedAt = new Date().toISOString();

    // ── Cache the result ─────────────────────────────────────
    if (supabase) {
      const inputHash = await sha256(JSON.stringify(input));

      // Delete only expired analyses for this user (avoid race conditions)
      const { error: delErr } = await supabase
        .from("coach_analyses")
        .delete()
        .eq("user_id", userId)
        .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      if (delErr) {
        console.warn("[cache] delete expired failed:", delErr.message);
      }

      // Insert new
      const { error: insErr } = await supabase.from("coach_analyses").insert({
        user_id: userId,
        analysis: analysis as Json,
        input_hash: inputHash,
      });
      if (insErr) {
        console.warn("[cache] insert failed:", insErr.message);
      }
    }

    return jsonResponse(analysis, 200, req);
  } catch (err) {
    console.error("yutori-coach-analyze error:", err);
    return jsonResponse({ error: "Internal server error" }, 500, req);
  }
});
