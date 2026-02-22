import { createServerFn } from '@tanstack/react-start';

/* ── Types ─────────────────────────────────────────────────────── */

export type UserProfile = {
  gender: 'male' | 'female' | 'other' | null;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  restingHr: number | null;
  bodyFatPct: number | null;
  saunaType: 'finnish' | 'infrared' | 'steam' | null;
  rltEnabled: boolean;
  rltPanel: Record<string, NonNullable<unknown>> | null;
};

type SupabaseProfileRow = {
  gender: string | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  resting_hr: number | null;
  body_fat_pct: number | null;
  sauna_type: string | null;
  rlt_enabled: boolean | null;
  rlt_panel: Record<string, NonNullable<unknown>> | null;
};

/* ── Env helpers (shared with sessions.ts) ─────────────────────── */

function cleanEnvValue(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.replace(/\r?\n/g, '').replace(/\\n/g, '').trim();
  if (trimmed.length === 0) return undefined;
  const m = trimmed.match(/^(['"])(.*)\1$/);
  return m ? (m[2]?.trim() || undefined) : trimmed;
}

function getSupabaseEnv() {
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

async function verifySupabaseToken(accessToken: string): Promise<{ id: string }> {
  const env = getSupabaseEnv();
  const response = await fetch(`${env.url}/auth/v1/user`, {
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = (await response.json().catch(() => null)) as
    | { id?: string; msg?: string }
    | null;
  if (!response.ok || !json?.id) {
    const message = json?.msg ? String(json.msg) : `Token verification failed (${response.status})`;
    throw new Error(message);
  }
  return { id: json.id };
}

/* ── Helpers ───────────────────────────────────────────────────── */

const VALID_GENDERS = new Set(['male', 'female', 'other']);
const VALID_SAUNA_TYPES = new Set(['finnish', 'infrared', 'steam']);

function mapRowToProfile(row: SupabaseProfileRow): UserProfile {
  return {
    gender: VALID_GENDERS.has(row.gender ?? '') ? (row.gender as UserProfile['gender']) : null,
    age: typeof row.age === 'number' ? row.age : null,
    weightKg: typeof row.weight_kg === 'number' ? row.weight_kg : null,
    heightCm: typeof row.height_cm === 'number' ? row.height_cm : null,
    restingHr: typeof row.resting_hr === 'number' ? row.resting_hr : null,
    bodyFatPct: typeof row.body_fat_pct === 'number' ? row.body_fat_pct : null,
    saunaType: VALID_SAUNA_TYPES.has(row.sauna_type ?? '') ? (row.sauna_type as UserProfile['saunaType']) : null,
    rltEnabled: row.rlt_enabled ?? true,
    rltPanel: row.rlt_panel ?? null,
  };
}

function profileToRow(
  userId: string,
  profile: UserProfile,
): Record<string, unknown> {
  return {
    user_id: userId,
    gender: profile.gender,
    age: profile.age,
    weight_kg: profile.weightKg,
    height_cm: profile.heightCm,
    resting_hr: profile.restingHr,
    body_fat_pct: profile.bodyFatPct,
    sauna_type: profile.saunaType,
    rlt_enabled: profile.rltEnabled,
    rlt_panel: profile.rltPanel,
  };
}

const EMPTY_PROFILE: UserProfile = {
  gender: null,
  age: null,
  weightKg: null,
  heightCm: null,
  restingHr: null,
  bodyFatPct: null,
  saunaType: null,
  rltEnabled: true,
  rltPanel: null,
};

/* ── Server functions ──────────────────────────────────────────── */

export const getProfile = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const accessToken = obj?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      throw new Error('accessToken is required');
    }
    return { accessToken };
  })
  .handler(async (ctx): Promise<UserProfile> => {
    const user = await verifySupabaseToken(ctx.data.accessToken);
    const env = getSupabaseEnv();

    const url = `${env.url}/rest/v1/user_profiles?user_id=eq.${user.id}&select=gender,age,weight_kg,height_cm,resting_hr,body_fat_pct,sauna_type,rlt_enabled,rlt_panel&limit=1`;
    const response = await fetch(url, {
      headers: {
        apikey: env.anonKey,
        Authorization: `Bearer ${ctx.data.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile (${response.status})`);
    }

    const rows = (await response.json()) as SupabaseProfileRow[];
    if (rows.length === 0) return EMPTY_PROFILE;
    return mapRowToProfile(rows[0]!);
  });

export const upsertProfile = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const accessToken = obj?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      throw new Error('accessToken is required');
    }
    const profile = obj?.profile;
    if (!profile || typeof profile !== 'object') {
      throw new Error('profile is required');
    }
    return { accessToken, profile: profile as UserProfile };
  })
  .handler(async (ctx): Promise<UserProfile> => {
    const user = await verifySupabaseToken(ctx.data.accessToken);
    const env = getSupabaseEnv();
    const row = profileToRow(user.id, ctx.data.profile);

    const response = await fetch(`${env.url}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: {
        apikey: env.anonKey,
        Authorization: `Bearer ${ctx.data.accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(row),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Failed to save profile (${response.status}): ${body}`);
    }

    const rows = (await response.json()) as SupabaseProfileRow[];
    if (rows.length === 0) return ctx.data.profile;
    return mapRowToProfile(rows[0]!);
  });
