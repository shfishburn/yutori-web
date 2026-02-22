import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const SESSION_STORAGE_KEY = 'yutori_supabase_session_v1';
const SESSION_REFRESH_SKEW_SECONDS = 60;

type SupabaseEnv = {
  url: string;
  anonKey: string;
};

type SupabaseUser = {
  id: string;
  email: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: SupabaseUser;
};

type SignUpResult = {
  requiresEmailConfirmation: boolean;
};

type AuthContextValue = {
  user: SupabaseUser | null;
  session: AuthSession | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getSupabaseEnv(): SupabaseEnv | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/g, '') ?? '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}

function getErrorMessage(status: number, payload: unknown): string {
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const candidates = [
      data.error_description,
      data.msg,
      data.message,
      data.error,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
    }
  }
  return `Auth request failed (${status})`;
}

async function requestSupabaseJson<T>(
  env: SupabaseEnv,
  path: string,
  options: {
    method?: 'GET' | 'POST';
    accessToken?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    apikey: env.anonKey,
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(`${env.url}/${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON response (e.g. proxy error page)
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, payload));
  }

  return payload as T;
}

function extractSession(payload: unknown): AuthSession | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const source =
    root.session && typeof root.session === 'object'
      ? (root.session as Record<string, unknown>)
      : root;

  const accessToken =
    typeof source.access_token === 'string'
      ? source.access_token
      : null;
  const refreshToken =
    typeof source.refresh_token === 'string'
      ? source.refresh_token
      : null;
  const userValue =
    source.user && typeof source.user === 'object'
      ? (source.user as Record<string, unknown>)
      : root.user && typeof root.user === 'object'
        ? (root.user as Record<string, unknown>)
        : null;

  const userId = typeof userValue?.id === 'string' ? userValue.id : null;
  const email = typeof userValue?.email === 'string' ? userValue.email : null;

  const expiresAtValue =
    typeof source.expires_at === 'number'
      ? source.expires_at
      : typeof source.expires_in === 'number'
        ? Math.floor(Date.now() / 1000) + source.expires_in
        : null;

  if (!accessToken || !refreshToken || !userId || !expiresAtValue) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAtValue,
    user: {
      id: userId,
      email,
    },
  };
}

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession> | null;
    if (!parsed) {
      return null;
    }
    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      !parsed.user ||
      typeof parsed.user.id !== 'string'
    ) {
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      expiresAt: parsed.expiresAt,
      user: {
        id: parsed.user.id,
        email: typeof parsed.user.email === 'string' ? parsed.user.email : null,
      },
    };
  } catch {
    return null;
  }
}

async function fetchUser(env: SupabaseEnv, accessToken: string): Promise<SupabaseUser> {
  const user = await requestSupabaseJson<{ id: string; email: string | null }>(
    env,
    'auth/v1/user',
    { accessToken },
  );
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

async function refreshWithToken(env: SupabaseEnv, refreshToken: string): Promise<AuthSession> {
  const payload = await requestSupabaseJson<unknown>(
    env,
    'auth/v1/token?grant_type=refresh_token',
    {
      method: 'POST',
      body: { refresh_token: refreshToken },
    },
  );
  const nextSession = extractSession(payload);
  if (!nextSession) {
    throw new Error('Unable to refresh session');
  }
  return nextSession;
}

function shouldRefreshSoon(expiresAt: number): boolean {
  return expiresAt <= Math.floor(Date.now() / 1000) + SESSION_REFRESH_SKEW_SECONDS;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const env = useMemo(() => getSupabaseEnv(), []);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const persistSession = useCallback((nextSession: AuthSession) => {
    setSession(nextSession);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    }
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!env) {
      throw new Error('Auth is not configured for this environment.');
    }
    if (!session?.refreshToken) {
      clearSession();
      return;
    }
    const nextSession = await refreshWithToken(env, session.refreshToken);
    persistSession(nextSession);
    setAuthError(null);
  }, [clearSession, env, persistSession, session?.refreshToken]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!env) {
        throw new Error('Auth is not configured for this environment.');
      }
      const payload = await requestSupabaseJson<unknown>(
        env,
        'auth/v1/token?grant_type=password',
        {
          method: 'POST',
          body: { email, password },
        },
      );
      const nextSession = extractSession(payload);
      if (!nextSession) {
        throw new Error('Sign in failed: session was not returned.');
      }
      persistSession(nextSession);
      setAuthError(null);
    },
    [env, persistSession],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      if (!env) {
        throw new Error('Auth is not configured for this environment.');
      }
      const payload = await requestSupabaseJson<unknown>(
        env,
        'auth/v1/signup',
        {
          method: 'POST',
          body: { email, password },
        },
      );

      const nextSession = extractSession(payload);
      if (nextSession) {
        persistSession(nextSession);
        setAuthError(null);
        return { requiresEmailConfirmation: false };
      }

      clearSession();
      return { requiresEmailConfirmation: true };
    },
    [clearSession, env, persistSession],
  );

  const signOut = useCallback(async () => {
    if (env && session?.accessToken) {
      try {
        await requestSupabaseJson(env, 'auth/v1/logout', {
          method: 'POST',
          accessToken: session.accessToken,
        });
      } catch {
        // Always clear local auth state, even if network logout fails.
      }
    }
    clearSession();
  }, [clearSession, env, session?.accessToken]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!env) {
        setAuthError('Auth is not configured for this environment.');
        setLoading(false);
        return;
      }

      const stored = readStoredSession();
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        let nextSession = stored;
        if (shouldRefreshSoon(stored.expiresAt)) {
          nextSession = await refreshWithToken(env, stored.refreshToken);
        } else {
          const user = await fetchUser(env, stored.accessToken);
          nextSession = { ...stored, user };
        }

        if (!cancelled) {
          persistSession(nextSession);
          setAuthError(null);
        }
      } catch (error) {
        if (!cancelled) {
          clearSession();
          setAuthError(
            error instanceof Error
              ? error.message
              : 'Could not restore your session. Please sign in again.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [clearSession, env, persistSession]);

  useEffect(() => {
    if (!env || !session) {
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const secondsUntilRefresh = Math.max(
      5,
      session.expiresAt - now - SESSION_REFRESH_SKEW_SECONDS,
    );

    const timer = window.setTimeout(() => {
      refreshSession().catch(() => {
        clearSession();
      });
    }, secondsUntilRefresh * 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [clearSession, env, refreshSession, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      authError,
      signIn,
      signUp,
      signOut,
      refreshSession,
    }),
    [authError, loading, refreshSession, session, signIn, signOut, signUp],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return value;
}
