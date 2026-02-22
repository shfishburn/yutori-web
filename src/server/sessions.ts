import { createServerFn } from '@tanstack/react-start';

type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export type SessionSummary = {
  id: string;
  sessionType: 'sauna' | 'cold_plunge';
  startedAt: string;
  endedAt: string | null;
  durationMs: number;
  peakTempC: number | null;
  minTempC: number | null;
  avgHumidityPct: number | null;
  peakHumidityPct: number | null;
  hrvTrend: number | null;
  totalKcal: number | null;
  calorieConfidence: string | null;
  rltActive: boolean;
  contrastId: string | null;
  splitIndex: number;
  aiInsight: string | null;
  safetyWarningCount: number;
};

export type SessionHistoryResponse = {
  sessions: SessionSummary[];
};

/* ── Env helpers ───────────────────────────────────────────────── */

function cleanEnvValue(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.replace(/\r?\n/g, '').replace(/\\n/g, '').trim();
  if (trimmed.length === 0) return undefined;
  const m = trimmed.match(/^(['"])(.*)\1$/);
  return m ? (m[2]?.trim() || undefined) : trimmed;
}

function getSupabaseEnv(): SupabaseEnv {
  const url = cleanEnvValue(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.replace(
    /\/+$/g,
    '',
  );
  const anonKey = cleanEnvValue(
    process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
  );
  if (!url || !anonKey) {
    throw new Error('Missing Supabase env vars: SUPABASE_URL and SUPABASE_ANON_KEY');
  }
  return { url, anonKey };
}

/* ── Token verification ────────────────────────────────────────── */

async function verifySupabaseToken(accessToken: string): Promise<{ id: string; email: string | null }> {
  const env = getSupabaseEnv();
  const response = await fetch(`${env.url}/auth/v1/user`, {
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = (await response.json().catch(() => null)) as
    | { id?: string; email?: string | null; msg?: string }
    | null;
  if (!response.ok || !json?.id) {
    const message = json?.msg ? String(json.msg) : `Token verification failed (${response.status})`;
    throw new Error(message);
  }
  return { id: json.id, email: typeof json.email === 'string' ? json.email : null };
}

/* ── Supabase REST query ───────────────────────────────────────── */

type SupabaseSessionRow = {
  id: string;
  session_type: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  peak_temp_c: number | null;
  min_temp_c: number | null;
  avg_humidity_pct: number | null;
  peak_humidity_pct: number | null;
  hrv_trend: number | null;
  total_kcal: number | null;
  calorie_confidence: string | null;
  rlt_active: boolean | null;
  contrast_id: string | null;
  split_index: number | null;
  ai_insight: string | null;
  safety_warning_count: number | null;
};

const SESSION_SELECT_FIELDS = [
  'id',
  'session_type',
  'started_at',
  'ended_at',
  'duration_ms',
  'peak_temp_c',
  'min_temp_c',
  'avg_humidity_pct',
  'peak_humidity_pct',
  'hrv_trend',
  'total_kcal',
  'calorie_confidence',
  'rlt_active',
  'contrast_id',
  'split_index',
  'ai_insight',
  'safety_warning_count',
].join(',');

async function fetchUserSessions(
  accessToken: string,
  limit: number,
  offset: number,
): Promise<SupabaseSessionRow[]> {
  const env = getSupabaseEnv();

  const params = new URLSearchParams({
    select: SESSION_SELECT_FIELDS,
    order: 'started_at.desc',
    limit: String(limit),
    offset: String(offset),
  });

  // RLS filters to user_id = auth.uid() automatically
  const response = await fetch(`${env.url}/rest/v1/sessions?${params}`, {
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sessions (${response.status})`);
  }

  return (await response.json()) as SupabaseSessionRow[];
}

function mapRow(row: SupabaseSessionRow): SessionSummary {
  return {
    id: row.id,
    sessionType: row.session_type === 'cold_plunge' ? 'cold_plunge' : 'sauna',
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMs: row.duration_ms ?? 0,
    peakTempC: row.peak_temp_c,
    minTempC: row.min_temp_c,
    avgHumidityPct: row.avg_humidity_pct,
    peakHumidityPct: row.peak_humidity_pct,
    hrvTrend: row.hrv_trend,
    totalKcal: row.total_kcal,
    calorieConfidence: row.calorie_confidence,
    rltActive: row.rlt_active ?? false,
    contrastId: row.contrast_id,
    splitIndex: row.split_index ?? 0,
    aiInsight: row.ai_insight,
    safetyWarningCount: row.safety_warning_count ?? 0,
  };
}

/* ── Dashboard aggregation helpers ─────────────────────────────── */

export type WeeklyBucket = {
  weekLabel: string;
  weekStart: string;
  saunaCount: number;
  coldCount: number;
  totalCount: number;
};

export type TempDataPoint = {
  date: string;
  sessionType: 'sauna' | 'cold_plunge';
  tempF: number;
};

export type DashboardStats = {
  totalSessions: number;
  saunaCount: number;
  coldCount: number;
  currentStreakDays: number;
  totalDurationMs: number;
  avgDurationMs: number;
  weeklyBuckets: WeeklyBucket[];
  tempTrends: TempDataPoint[];
  recentSessions: SessionSummary[];
};

function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/** Get the Monday of the week containing `date`. */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday → previous Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function computeStreak(sessions: SessionSummary[]): number {
  if (sessions.length === 0) return 0;
  const sessionDates = new Set(
    sessions.map((s) => s.startedAt.slice(0, 10)),
  );
  let streak = 0;
  const now = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (sessionDates.has(dateStr)) {
      streak++;
    } else if (i === 0) {
      // Today has no session yet — check yesterday
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function computeWeeklyBuckets(sessions: SessionSummary[]): WeeklyBucket[] {
  const now = new Date();
  const buckets = new Map<string, WeeklyBucket>();

  for (let i = 11; i >= 0; i--) {
    const monday = getMonday(new Date(now.getTime() - i * 7 * 86_400_000));
    const key = monday.toISOString().slice(0, 10);
    const label = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    buckets.set(key, { weekLabel: label, weekStart: key, saunaCount: 0, coldCount: 0, totalCount: 0 });
  }

  for (const s of sessions) {
    const monday = getMonday(new Date(s.startedAt));
    const key = monday.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.totalCount++;
    if (s.sessionType === 'sauna') bucket.saunaCount++;
    else bucket.coldCount++;
  }

  return Array.from(buckets.values());
}

function computeTempTrends(sessions: SessionSummary[]): TempDataPoint[] {
  const points: TempDataPoint[] = [];
  for (const s of sessions) {
    if (s.sessionType === 'sauna' && s.peakTempC != null) {
      points.push({ date: s.startedAt, sessionType: 'sauna', tempF: cToF(s.peakTempC) });
    } else if (s.sessionType === 'cold_plunge' && s.minTempC != null) {
      points.push({ date: s.startedAt, sessionType: 'cold_plunge', tempF: cToF(s.minTempC) });
    }
    if (points.length >= 20) break;
  }
  return points.reverse();
}

function buildDashboardStats(sessions: SessionSummary[]): DashboardStats {
  const saunaCount = sessions.filter((s) => s.sessionType === 'sauna').length;
  const coldCount = sessions.filter((s) => s.sessionType === 'cold_plunge').length;
  const totalDurationMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);

  return {
    totalSessions: sessions.length,
    saunaCount,
    coldCount,
    currentStreakDays: computeStreak(sessions),
    totalDurationMs,
    avgDurationMs: sessions.length > 0 ? Math.round(totalDurationMs / sessions.length) : 0,
    weeklyBuckets: computeWeeklyBuckets(sessions),
    tempTrends: computeTempTrends(sessions),
    recentSessions: sessions.slice(0, 5),
  };
}

/* ── Server functions ──────────────────────────────────────────── */

export const getSessionHistory = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const accessToken = obj?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      throw new Error('accessToken is required');
    }
    const limit = typeof obj?.limit === 'number' ? Math.min(obj.limit, 100) : 50;
    const offset = typeof obj?.offset === 'number' ? Math.max(obj.offset, 0) : 0;
    return { accessToken, limit, offset };
  })
  .handler(async (ctx): Promise<SessionHistoryResponse> => {
    // Verify the token is valid (also ensures RLS works correctly)
    await verifySupabaseToken(ctx.data.accessToken);

    const rows = await fetchUserSessions(
      ctx.data.accessToken,
      ctx.data.limit,
      ctx.data.offset,
    );

    return {
      sessions: rows.map(mapRow),
    };
  });

export const getDashboardStats = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const accessToken = obj?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      throw new Error('accessToken is required');
    }
    return { accessToken };
  })
  .handler(async (ctx): Promise<DashboardStats> => {
    await verifySupabaseToken(ctx.data.accessToken);

    const rows = await fetchUserSessions(ctx.data.accessToken, 500, 0);
    const sessions = rows.map(mapRow);

    return buildDashboardStats(sessions);
  });
