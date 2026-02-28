import { createServerFn } from '@tanstack/react-start';
import {
  getSupabaseEnv,
  verifySupabaseToken,
  buildQueryString,
  isMissingTableResponse,
} from './supabase';

/* ── Types ─────────────────────────────────────────────────────── */

export type CoachInsight = {
  title: string;
  body: string;
  metric: string;
  sentiment: 'positive' | 'neutral' | 'negative';
};

export type CoachAnalysisResponse = {
  summary: string;
  insights: CoachInsight[];
  pattern: string;
  suggestion: string;
  generatedAt: string;
};

export type ScheduleWeek = {
  weekNumber: number;
  focus: string;
  frequency: string;
  duration: string;
  temperature: string;
};

export type ProtocolNarrative = {
  overview: string;
  notes: string;
  progressMarker: string;
  weeklyNotes: string[];
  weeklyBenchmarks: string[];
};

export type ProtocolSummary = {
  id: string;
  protocolType: string;
  title: string;
  schedule: ScheduleWeek[];
  narrative: ProtocolNarrative;
  createdAt: string;
};

/* ── Row types ─────────────────────────────────────────────────── */

type SupabaseAnalysisRow = {
  analysis: unknown;
  created_at: string;
};

type SupabaseProtocolRow = {
  id: string;
  protocol_type: string;
  title: string;
  schedule: unknown;
  narrative: unknown;
  created_at: string;
};

/* ── Mapping helpers ───────────────────────────────────────────── */

function mapAnalysis(row: SupabaseAnalysisRow): CoachAnalysisResponse | null {
  const a = row.analysis;
  if (!a || typeof a !== 'object') return null;
  const obj = a as Record<string, unknown>;
  return {
    summary: typeof obj.summary === 'string' ? obj.summary : '',
    // W2-6 fix: filter out non-object array elements (null, string, number)
    // that can appear in malformed AI responses cached in the DB.
    insights: Array.isArray(obj.insights)
      ? (obj.insights as unknown[])
          .filter((i): i is Record<string, unknown> => i != null && typeof i === 'object' && !Array.isArray(i))
          .map((i) => ({
            title: typeof i.title === 'string' ? i.title : '',
            body: typeof i.body === 'string' ? i.body : '',
            metric: typeof i.metric === 'string' ? i.metric : '',
            sentiment: (['positive', 'neutral', 'negative'].includes(i.sentiment as string)
              ? i.sentiment
              : 'neutral') as CoachInsight['sentiment'],
          }))
      : [],
    pattern: typeof obj.pattern === 'string' ? obj.pattern : '',
    suggestion: typeof obj.suggestion === 'string' ? obj.suggestion : '',
    generatedAt: typeof obj.generatedAt === 'string' ? obj.generatedAt : row.created_at,
  };
}

function mapProtocol(row: SupabaseProtocolRow): ProtocolSummary {
  const sched = Array.isArray(row.schedule) ? row.schedule : [];
  const narr = row.narrative && typeof row.narrative === 'object'
    ? (row.narrative as Record<string, unknown>)
    : {};

  return {
    id: row.id,
    protocolType: row.protocol_type,
    title: row.title,
    schedule: sched.map((w: Record<string, unknown>) => ({
      weekNumber: typeof w.weekNumber === 'number' ? w.weekNumber : 0,
      focus: typeof w.focus === 'string' ? w.focus : '',
      frequency: typeof w.frequency === 'string' ? w.frequency : '',
      duration: typeof w.duration === 'string' ? w.duration : '',
      temperature: typeof w.temperature === 'string' ? w.temperature : '',
    })),
    narrative: {
      overview: typeof narr.overview === 'string' ? narr.overview : '',
      notes: typeof narr.notes === 'string' ? narr.notes : '',
      progressMarker: typeof narr.progressMarker === 'string' ? narr.progressMarker : '',
      weeklyNotes: Array.isArray(narr.weeklyNotes)
        ? narr.weeklyNotes.map((n: unknown) => (typeof n === 'string' ? n : ''))
        : [],
      weeklyBenchmarks: Array.isArray(narr.weeklyBenchmarks)
        ? narr.weeklyBenchmarks.map((b: unknown) => (typeof b === 'string' ? b : ''))
        : [],
    },
    createdAt: row.created_at,
  };
}

/* ── Server functions ──────────────────────────────────────────── */

export const getLatestAnalysis = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const accessToken = obj?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      throw new Error('accessToken is required');
    }
    return { accessToken };
  })
  .handler(async (ctx): Promise<CoachAnalysisResponse | null> => {
    await verifySupabaseToken(ctx.data.accessToken);
    const env = getSupabaseEnv();

    const query = buildQueryString({
      select: 'analysis,created_at',
      order: 'created_at.desc',
      limit: 1,
      expires_at: `gt.${new Date().toISOString()}`,
    });

    const response = await fetch(`${env.url}/rest/v1/coach_analyses?${query}`, {
      headers: {
        apikey: env.anonKey,
        Authorization: `Bearer ${ctx.data.accessToken}`,
      },
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      if (isMissingTableResponse(response.status, payload)) return null;
      throw new Error(`Failed to fetch analysis (${response.status})`);
    }

    if (!Array.isArray(payload) || payload.length === 0) return null;
    return mapAnalysis(payload[0] as SupabaseAnalysisRow);
  });

export const getUserProtocols = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const accessToken = obj?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      throw new Error('accessToken is required');
    }
    return { accessToken };
  })
  .handler(async (ctx): Promise<ProtocolSummary[]> => {
    await verifySupabaseToken(ctx.data.accessToken);
    const env = getSupabaseEnv();

    const query = buildQueryString({
      select: 'id,protocol_type,title,schedule,narrative,created_at',
      order: 'created_at.desc',
      limit: 20,
    });

    const response = await fetch(`${env.url}/rest/v1/coach_protocols?${query}`, {
      headers: {
        apikey: env.anonKey,
        Authorization: `Bearer ${ctx.data.accessToken}`,
      },
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      if (isMissingTableResponse(response.status, payload)) return [];
      throw new Error(`Failed to fetch protocols (${response.status})`);
    }

    if (!Array.isArray(payload)) return [];
    return payload.map((row: SupabaseProtocolRow) => mapProtocol(row));
  });
