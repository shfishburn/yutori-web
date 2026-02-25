/**
 * Shared Supabase helpers for server functions.
 * Provides env configuration, token verification, and query building.
 */

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export function cleanEnvValue(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.replace(/\r?\n/g, '').replace(/\\n/g, '').trim();
  if (trimmed.length === 0) return undefined;
  const m = trimmed.match(/^(['"])(.*)\1$/);
  return m ? (m[2]?.trim() || undefined) : trimmed;
}

export function getSupabaseEnv(): SupabaseEnv {
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

export async function verifySupabaseToken(
  accessToken: string,
): Promise<{ id: string; email: string | null }> {
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

type QueryValue = string | number | boolean;

export function buildQueryString(query: Record<string, QueryValue | QueryValue[] | undefined>): string {
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

type SupabaseErrorPayload = {
  code?: string;
};

export function parseSupabaseErrorCode(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const code = (payload as SupabaseErrorPayload).code;
  return typeof code === 'string' ? code : null;
}

export function isMissingTableResponse(status: number, payload: unknown): boolean {
  const code = parseSupabaseErrorCode(payload);
  return status === 404 || code === '42P01';
}
