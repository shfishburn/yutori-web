import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { buildSeoHead } from '../lib/seo';
import { useAuth } from '../lib/auth';

type AuthSearch = {
  mode?: 'signin' | 'signup';
};

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search.mode === 'signup' ? 'signup' : 'signin',
  }),
  head: () =>
    buildSeoHead({
      title: 'Sign in | Yutori Labs',
      description: 'Sign in to your Yutori account to manage your orders and account settings.',
      path: '/auth',
    }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const isSignUp = search.mode === 'signup';
  const { user, loading, authError, signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: '/account' });
    }
  }, [loading, navigate, user]);

  if (user) {
    return (
      <main className="flex-1 bg-canvas">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-edge bg-surface p-6 text-sm text-fg-muted">
            Redirecting to your account...
          </div>
        </section>
      </main>
    );
  }

  const activeError = formError ?? authError;

  const modeTitle = useMemo(
    () => (isSignUp ? 'Create your account' : 'Sign in to your account'),
    [isSignUp],
  );

  const modeCta = isSignUp ? 'Create account' : 'Sign in';

  const toggleMode = () => {
    setFormError(null);
    setNotice(null);
    void navigate({
      to: '/auth',
      search: { mode: isSignUp ? 'signin' : 'signup' },
    });
  };

  const handleSubmit = async () => {
    setFormError(null);
    setNotice(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setFormError('Enter your email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Enter a valid email address.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        const result = await signUp(trimmedEmail, password);
        if (result.requiresEmailConfirmation) {
          setNotice('Check your email to confirm your account, then sign in.');
          return;
        }
      } else {
        await signIn(trimmedEmail, password);
      }

      await navigate({ to: '/account' });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-canvas">
      <section className="mx-auto flex max-w-3xl px-6 py-16">
        <div className="w-full rounded-3xl border border-edge bg-surface p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle">
            Shared account
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg">{modeTitle}</h1>
          <p className="mt-3 text-sm text-fg-muted">
            Use the same email and password as the mobile app.
          </p>

          <form
            className="mt-8 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium text-fg">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-edge bg-canvas px-4 py-3 text-sm text-fg outline-none ring-0 transition-colors focus:border-accent"
                placeholder="you@example.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-fg">Password</span>
              <input
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-edge bg-canvas px-4 py-3 text-sm text-fg outline-none ring-0 transition-colors focus:border-accent"
                placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
              />
            </label>

            {isSignUp ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-fg">Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-edge bg-canvas px-4 py-3 text-sm text-fg outline-none ring-0 transition-colors focus:border-accent"
                  placeholder="Re-enter your password"
                />
              </label>
            ) : null}

            {activeError ? (
              <p role="alert" className="ui-alert-danger">
                {activeError}
              </p>
            ) : null}

            {notice ? (
              <p className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-fg">
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || loading}
              className="mt-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Working...' : modeCta}
            </button>

            <button
              type="button"
              onClick={toggleMode}
              disabled={submitting}
              className="text-sm font-medium text-fg-muted underline underline-offset-4 transition-colors hover:text-fg disabled:opacity-60"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
