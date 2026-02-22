import { createServerFn } from '@tanstack/react-start';

type SupabaseEnv = {
  url: string;
  anonKey: string;
};

const COMPLETED_SESSION_MIN_DURATION_MS = 60_000;
const COMPLETED_SESSION_MAX_DURATION_MS = 21_600_000;
const SESSION_HISTORY_DEFAULT_LIMIT = 50;
const SESSION_HISTORY_MAX_LIMIT = 100;
const DASHBOARD_RECENT_WINDOW_LIMIT = 500;

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

export type AchievementSummary = {
  key: string;
  earnedAt: string;
  meta: Record<string, NonNullable<unknown>>;
};

export type GamificationSnapshot = {
  source: 'authoritative' | 'derived';
  xp: number;
  level: number;
  saunaCompletedCount: number;
  plungeCompletedCount: number;
  contrastCompletedCount: number;
  currentStreakDays: number;
  bestStreakDays: number;
  achievements: AchievementSummary[];
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

type FetchUserSessionsOptions = {
  completedOnly?: boolean;
};

type QueryValue = string | number | boolean;

function buildQueryString(query: Record<string, QueryValue | QueryValue[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined) continue;
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        params.append(key, String(value));
      }
      continue;
    }
    params.set(key, String(rawValue));
  }
  return params.toString();
}

async function fetchUserSessions(
  accessToken: string,
  limit: number,
  offset: number,
  options: FetchUserSessionsOptions = {},
): Promise<SupabaseSessionRow[]> {
  const env = getSupabaseEnv();

  const query: Record<string, QueryValue | QueryValue[] | undefined> = {
    select: SESSION_SELECT_FIELDS,
    order: 'started_at.desc',
    limit,
    offset,
  };

  if (options.completedOnly) {
    query.ended_at = 'not.is.null';
    query.duration_ms = `gte.${COMPLETED_SESSION_MIN_DURATION_MS}`;
    query.session_type = 'in.(sauna,cold_plunge)';
  }

  // RLS filters to user_id = auth.uid() automatically
  const response = await fetch(`${env.url}/rest/v1/sessions?${buildQueryString(query)}`, {
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

function isSessionType(value: string | null): value is SessionSummary['sessionType'] {
  return value === 'sauna' || value === 'cold_plunge';
}

function toUtcDay(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function isCompletedSessionRow(row: SupabaseSessionRow): boolean {
  if (!isSessionType(row.session_type)) return false;
  if (!row.ended_at) return false;
  if (typeof row.duration_ms !== 'number' || !Number.isFinite(row.duration_ms)) return false;
  if (
    row.duration_ms < COMPLETED_SESSION_MIN_DURATION_MS ||
    row.duration_ms > COMPLETED_SESSION_MAX_DURATION_MS
  ) {
    return false;
  }

  const startedAtMs = Date.parse(row.started_at);
  const endedAtMs = Date.parse(row.ended_at);
  if (!Number.isFinite(startedAtMs) || !Number.isFinite(endedAtMs)) return false;
  return startedAtMs < endedAtMs;
}

function mapRow(row: SupabaseSessionRow): SessionSummary | null {
  if (!isSessionType(row.session_type)) return null;
  return {
    id: row.id,
    sessionType: row.session_type,
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

function toSessionSummaries(rows: SupabaseSessionRow[], completedOnly: boolean): SessionSummary[] {
  const mapped: SessionSummary[] = [];
  for (const row of rows) {
    if (completedOnly && !isCompletedSessionRow(row)) continue;
    const session = mapRow(row);
    if (!session) continue;
    mapped.push(session);
  }
  return mapped;
}

type SupabaseGamificationStateRow = {
  xp: number | null;
  level: number | null;
  sauna_completed_count: number | null;
  plunge_completed_count: number | null;
  contrast_completed_count: number | null;
  current_streak_days: number | null;
  best_streak_days: number | null;
};

type SupabaseAchievementRow = {
  achievement_key: string | null;
  earned_at: string | null;
  meta: unknown;
};

type SupabaseErrorPayload = {
  code?: string;
};

function parseSupabaseErrorCode(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const code = (payload as SupabaseErrorPayload).code;
  return typeof code === 'string' ? code : null;
}

function isMissingTableResponse(status: number, payload: unknown): boolean {
  const code = parseSupabaseErrorCode(payload);
  return status === 404 || code === '42P01';
}

function parseNonNegativeInt(value: number | null | undefined, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.trunc(value));
}

async function fetchGamificationState(
  accessToken: string,
): Promise<SupabaseGamificationStateRow | null> {
  const env = getSupabaseEnv();
  const query = buildQueryString({
    select: [
      'xp',
      'level',
      'sauna_completed_count',
      'plunge_completed_count',
      'contrast_completed_count',
      'current_streak_days',
      'best_streak_days',
    ].join(','),
    limit: 1,
  });

  const response = await fetch(`${env.url}/rest/v1/user_gamification_state?${query}`, {
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    if (isMissingTableResponse(response.status, payload)) return null;
    throw new Error(`Failed to fetch gamification state (${response.status})`);
  }

  if (!Array.isArray(payload) || payload.length === 0) return null;
  return payload[0] as SupabaseGamificationStateRow;
}

async function fetchAchievements(accessToken: string): Promise<AchievementSummary[]> {
  const env = getSupabaseEnv();
  const query = buildQueryString({
    select: 'achievement_key,earned_at,meta',
    order: 'earned_at.desc',
    limit: 24,
  });

  const response = await fetch(`${env.url}/rest/v1/user_achievements?${query}`, {
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    if (isMissingTableResponse(response.status, payload)) return [];
    throw new Error(`Failed to fetch achievements (${response.status})`);
  }

  if (!Array.isArray(payload)) return [];
  const rows = payload as SupabaseAchievementRow[];
  return rows.flatMap((row) => {
    if (typeof row.achievement_key !== 'string' || typeof row.earned_at !== 'string') {
      return [];
    }
    return [{
      key: row.achievement_key,
      earnedAt: row.earned_at,
      meta: row.meta && typeof row.meta === 'object' ? (row.meta as Record<string, NonNullable<unknown>>) : {},
    }];
  });
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

export type HealthDataPoint = {
  date: string;
  sessionType: 'sauna' | 'cold_plunge';
  avgHr: number | null;
  peakHr: number | null;
  avgHrv: number | null;
  kcal: number | null;
};

export type HealthMetrics = {
  /** Avg HR across all sessions (bpm) */
  avgHeartRate: number | null;
  /** Peak HR ever recorded (bpm) */
  peakHeartRate: number | null;
  /** Avg HRV across all sessions (ms) */
  avgHrv: number | null;
  /** Total estimated calories burned */
  totalCalories: number | null;
  /** Avg calories per session */
  avgCaloriesPerSession: number | null;
  /** Per-session health data for trend charts (chronological) */
  trends: HealthDataPoint[];
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
  gamification: GamificationSnapshot;
  healthMetrics: HealthMetrics;
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

export function computeStreak(sessions: SessionSummary[], now: Date = new Date()): number {
  if (sessions.length === 0) return 0;
  const sessionDates = new Set<string>();
  for (const session of sessions) {
    const day = toUtcDay(session.endedAt);
    if (day) sessionDates.add(day);
  }
  if (sessionDates.size === 0) return 0;

  const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let streak = 0;
  for (let i = 0; i <= 365; i++) {
    const d = new Date(utcToday);
    d.setUTCDate(utcToday.getUTCDate() - i);
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

export function computeWeeklyBuckets(sessions: SessionSummary[]): WeeklyBucket[] {
  const now = new Date();
  const buckets = new Map<string, WeeklyBucket>();

  for (let i = 11; i >= 0; i--) {
    const monday = getMonday(new Date(now.getTime() - i * 7 * 86_400_000));
    const key = monday.toISOString().slice(0, 10);
    const label = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    buckets.set(key, { weekLabel: label, weekStart: key, saunaCount: 0, coldCount: 0, totalCount: 0 });
  }

  for (const s of sessions) {
    if (!s.endedAt) continue;
    const endedAt = new Date(s.endedAt);
    if (!Number.isFinite(endedAt.getTime())) continue;
    const monday = getMonday(endedAt);
    const key = monday.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.totalCount++;
    if (s.sessionType === 'sauna') bucket.saunaCount++;
    else bucket.coldCount++;
  }

  return Array.from(buckets.values());
}

/* ── Health metrics ─────────────────────────────────────────────── */

type SupabaseHealthSampleRow = {
  session_id: string;
  heart_rate: number | null;
  hrv: number | null;
  recorded_at: string;
};

async function fetchHealthSamples(
  accessToken: string,
  limit: number = 2000,
): Promise<SupabaseHealthSampleRow[]> {
  const env = getSupabaseEnv();
  const query = buildQueryString({
    select: 'session_id,heart_rate,hrv,recorded_at',
    order: 'recorded_at.desc',
    limit,
  });

  const response = await fetch(`${env.url}/rest/v1/health_samples?${query}`, {
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    // health_samples may not exist yet — graceful fallback
    return [];
  }

  return (await response.json()) as SupabaseHealthSampleRow[];
}

function computeHealthMetrics(
  sessions: SessionSummary[],
  healthSamples: SupabaseHealthSampleRow[],
): HealthMetrics {
  // Build per-session aggregate from raw health_samples
  const sessionAggs = new Map<
    string,
    { hrs: number[]; hrvs: number[] }
  >();
  for (const hs of healthSamples) {
    if (!hs.session_id) continue;
    let agg = sessionAggs.get(hs.session_id);
    if (!agg) {
      agg = { hrs: [], hrvs: [] };
      sessionAggs.set(hs.session_id, agg);
    }
    if (typeof hs.heart_rate === 'number' && Number.isFinite(hs.heart_rate) && hs.heart_rate > 0) {
      agg.hrs.push(hs.heart_rate);
    }
    if (typeof hs.hrv === 'number' && Number.isFinite(hs.hrv) && hs.hrv > 0) {
      agg.hrvs.push(hs.hrv);
    }
  }

  // Build per-session health data points (chronological)
  const trends: HealthDataPoint[] = [];
  const allHrs: number[] = [];
  const allHrvs: number[] = [];
  let totalKcal = 0;
  let sessionsWithKcal = 0;

  // Process sessions oldest-first for chronological trends
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  for (const s of sorted) {
    const agg = sessionAggs.get(s.id);
    const avgHr =
      agg && agg.hrs.length > 0
        ? Math.round(agg.hrs.reduce((a, b) => a + b, 0) / agg.hrs.length)
        : null;
    const peakHr =
      agg && agg.hrs.length > 0 ? Math.round(Math.max(...agg.hrs)) : null;
    const avgHrv =
      agg && agg.hrvs.length > 0
        ? Math.round(agg.hrvs.reduce((a, b) => a + b, 0) / agg.hrvs.length)
        : null;
    const kcal = s.totalKcal;

    if (avgHr != null) allHrs.push(avgHr);
    if (peakHr != null) allHrs.push(peakHr);
    if (avgHrv != null) allHrvs.push(avgHrv);
    if (typeof kcal === 'number' && kcal > 0) {
      totalKcal += kcal;
      sessionsWithKcal++;
    }

    // Only include data points that have at least some health data
    if (avgHr != null || avgHrv != null || kcal != null) {
      trends.push({
        date: s.endedAt ?? s.startedAt,
        sessionType: s.sessionType,
        avgHr,
        peakHr,
        avgHrv,
        kcal,
      });
    }
  }

  // Keep last 20 for chart readability
  const trimmedTrends = trends.slice(-20);

  const globalAvgHr =
    allHrs.length > 0
      ? Math.round(allHrs.reduce((a, b) => a + b, 0) / allHrs.length)
      : null;
  const globalPeakHr =
    allHrs.length > 0 ? Math.round(Math.max(...allHrs)) : null;
  const globalAvgHrv =
    allHrvs.length > 0
      ? Math.round(allHrvs.reduce((a, b) => a + b, 0) / allHrvs.length)
      : null;

  return {
    avgHeartRate: globalAvgHr,
    peakHeartRate: globalPeakHr,
    avgHrv: globalAvgHrv,
    totalCalories: totalKcal > 0 ? Math.round(totalKcal) : null,
    avgCaloriesPerSession:
      sessionsWithKcal > 0 ? Math.round(totalKcal / sessionsWithKcal) : null,
    trends: trimmedTrends,
  };
}

function computeTempTrends(sessions: SessionSummary[]): TempDataPoint[] {
  const points: TempDataPoint[] = [];
  for (const s of sessions) {
    const pointDate = s.endedAt ?? s.startedAt;
    if (s.sessionType === 'sauna' && s.peakTempC != null) {
      points.push({ date: pointDate, sessionType: 'sauna', tempF: cToF(s.peakTempC) });
    } else if (s.sessionType === 'cold_plunge' && s.minTempC != null) {
      points.push({ date: pointDate, sessionType: 'cold_plunge', tempF: cToF(s.minTempC) });
    }
    if (points.length >= 20) break;
  }
  return points.reverse();
}

function computeContrastCount(sessions: SessionSummary[]): number {
  const groups = new Map<string, Set<SessionSummary['sessionType']>>();
  for (const session of sessions) {
    if (!session.contrastId) continue;
    const existing = groups.get(session.contrastId) ?? new Set<SessionSummary['sessionType']>();
    existing.add(session.sessionType);
    groups.set(session.contrastId, existing);
  }
  let count = 0;
  for (const modalities of groups.values()) {
    if (modalities.has('sauna') && modalities.has('cold_plunge')) count++;
  }
  return count;
}

function deriveGamificationSnapshot(sessions: SessionSummary[]): GamificationSnapshot {
  const saunaCount = sessions.filter((s) => s.sessionType === 'sauna').length;
  const plungeCount = sessions.filter((s) => s.sessionType === 'cold_plunge').length;
  const contrastCount = computeContrastCount(sessions);
  const xp = (saunaCount + plungeCount) * 10 + contrastCount * 20;
  const streak = computeStreak(sessions);
  return {
    source: 'derived',
    xp,
    level: 1 + Math.floor(xp / 100),
    saunaCompletedCount: saunaCount,
    plungeCompletedCount: plungeCount,
    contrastCompletedCount: contrastCount,
    currentStreakDays: streak,
    bestStreakDays: streak,
    achievements: [],
  };
}

async function fetchAuthoritativeGamificationSnapshot(
  accessToken: string,
): Promise<GamificationSnapshot | null> {
  const [stateRow, achievements] = await Promise.all([
    fetchGamificationState(accessToken),
    fetchAchievements(accessToken),
  ]);
  if (!stateRow) return null;
  return {
    source: 'authoritative',
    xp: parseNonNegativeInt(stateRow.xp, 0),
    level: Math.max(1, parseNonNegativeInt(stateRow.level, 1)),
    saunaCompletedCount: parseNonNegativeInt(stateRow.sauna_completed_count, 0),
    plungeCompletedCount: parseNonNegativeInt(stateRow.plunge_completed_count, 0),
    contrastCompletedCount: parseNonNegativeInt(stateRow.contrast_completed_count, 0),
    currentStreakDays: parseNonNegativeInt(stateRow.current_streak_days, 0),
    bestStreakDays: parseNonNegativeInt(stateRow.best_streak_days, 0),
    achievements,
  };
}

function buildDashboardStats(
  sessions: SessionSummary[],
  authoritativeGamification: GamificationSnapshot | null,
  healthSamples: SupabaseHealthSampleRow[],
): DashboardStats {
  const gamification = authoritativeGamification ?? deriveGamificationSnapshot(sessions);
  const totalSessions = gamification.saunaCompletedCount + gamification.plungeCompletedCount;
  const totalDurationMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);

  return {
    totalSessions,
    saunaCount: gamification.saunaCompletedCount,
    coldCount: gamification.plungeCompletedCount,
    currentStreakDays: gamification.currentStreakDays,
    totalDurationMs,
    avgDurationMs: sessions.length > 0 ? Math.round(totalDurationMs / sessions.length) : 0,
    weeklyBuckets: computeWeeklyBuckets(sessions),
    tempTrends: computeTempTrends(sessions),
    recentSessions: sessions.slice(0, 5),
    gamification,
    healthMetrics: computeHealthMetrics(sessions, healthSamples),
  };
}

/* ── Server functions ──────────────────────────────────────────── */

export function sanitizeLimit(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return SESSION_HISTORY_DEFAULT_LIMIT;
  }
  const normalized = Math.trunc(value);
  if (normalized < 1) return SESSION_HISTORY_DEFAULT_LIMIT;
  return Math.min(normalized, SESSION_HISTORY_MAX_LIMIT);
}

export function sanitizeOffset(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

export const getSessionHistory = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const accessToken = obj?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      throw new Error('accessToken is required');
    }
    const limit = sanitizeLimit(obj?.limit);
    const offset = sanitizeOffset(obj?.offset);
    return { accessToken, limit, offset };
  })
  .handler(async (ctx): Promise<SessionHistoryResponse> => {
    // Verify the token is valid (also ensures RLS works correctly)
    await verifySupabaseToken(ctx.data.accessToken);

    const rows = await fetchUserSessions(
      ctx.data.accessToken,
      ctx.data.limit,
      ctx.data.offset,
      { completedOnly: true },
    );

    return {
      sessions: toSessionSummaries(rows, true),
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

    const [rows, gamification, healthSamples] = await Promise.all([
      fetchUserSessions(
        ctx.data.accessToken,
        DASHBOARD_RECENT_WINDOW_LIMIT,
        0,
        { completedOnly: true },
      ),
      fetchAuthoritativeGamificationSnapshot(ctx.data.accessToken).catch(() => null),
      fetchHealthSamples(ctx.data.accessToken).catch(() => [] as SupabaseHealthSampleRow[]),
    ]);
    const sessions = toSessionSummaries(rows, true);

    return buildDashboardStats(sessions, gamification, healthSamples);
  });
