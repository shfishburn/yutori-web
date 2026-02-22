import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { buildSeoHead } from '../lib/seo';
import { useAuth } from '../lib/auth';

type AuthSearch = {
  mode?: 'signin' | 'signup' | 'reset';
};

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode:
      search.mode === 'signup'
        ? 'signup'
        : search.mode === 'reset'
          ? 'reset'
          : 'signin',
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
  const isResetMode = search.mode === 'reset';
  const { user, loading, authError, signIn, signUp, requestPasswordReset, updatePasswordWithToken } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: '/account' });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;

    if (!hash) {
      return;
    }

    const params = new URLSearchParams(hash);
    if (params.get('type') !== 'recovery') {
      return;
    }

    const accessToken = params.get('access_token');
    if (!accessToken) {
      return;
    }

    setRecoveryToken(accessToken);
    setNotice(null);
    setFormError(null);

    // Hide tokens from the URL after parsing.
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  }, []);

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
    () => {
      if (recoveryToken) {
        return 'Set a new password';
      }
      if (isResetMode) {
        return 'Reset your password';
      }
      return isSignUp ? 'Create your account' : 'Sign in to your account';
    },
    [isResetMode, isSignUp, recoveryToken],
  );

  const modeCta = recoveryToken
    ? 'Update password'
    : isResetMode
      ? 'Send reset link'
      : isSignUp
        ? 'Create account'
        : 'Sign in';

  const toggleMode = () => {
    setFormError(null);
    setNotice(null);
    void navigate({
      to: '/auth',
      search: { mode: isSignUp ? 'signin' : 'signup' },
    });
  };

  const goToReset = () => {
    setFormError(null);
    setNotice(null);
    void navigate({
      to: '/auth',
      search: { mode: 'reset' },
    });
  };

  const goToSignIn = () => {
    setFormError(null);
    setNotice(null);
    setRecoveryToken(null);
    setPassword('');
    setConfirmPassword('');
    void navigate({
      to: '/auth',
      search: { mode: 'signin' },
    });
  };

  const handleSubmit = async () => {
    setFormError(null);
    setNotice(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (recoveryToken) {
      if (!password) {
        setFormError('Enter a new password.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
      setSubmitting(true);
      try {
        await updatePasswordWithToken(recoveryToken, password);
        setNotice('Password updated. You can now sign in with your new password.');
        setRecoveryToken(null);
        setPassword('');
        setConfirmPassword('');
        goToSignIn();
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Password reset failed.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (isResetMode) {
      if (!trimmedEmail) {
        setFormError('Enter your email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        setFormError('Enter a valid email address.');
        return;
      }
      setSubmitting(true);
      try {
        await requestPasswordReset(trimmedEmail);
        setNotice('Check your email for a password reset link.');
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Could not send reset email.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

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
                disabled={Boolean(recoveryToken)}
              />
            </label>

            {!isResetMode ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-fg">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignUp || recoveryToken ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-edge bg-canvas px-4 py-3 pr-11 text-sm text-fg outline-none ring-0 transition-colors focus:border-accent"
                    placeholder={
                      recoveryToken
                        ? 'Create a new password'
                        : isSignUp
                          ? 'Create a password'
                          : 'Enter your password'
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-fg-subtle hover:text-fg"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {!isSignUp && !recoveryToken ? (
                  <button
                    type="button"
                    onClick={goToReset}
                    disabled={submitting}
                    className="w-fit text-xs font-medium text-fg-muted underline underline-offset-4 transition-colors hover:text-fg disabled:opacity-60"
                  >
                    Forgot password?
                  </button>
                ) : null}
              </label>
            ) : null}

            {recoveryToken ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-fg">Confirm new password</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-edge bg-canvas px-4 py-3 text-sm text-fg outline-none ring-0 transition-colors focus:border-accent"
                  placeholder="Re-enter your password"
                />
              </label>
            ) : isSignUp ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-fg">Confirm password</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-edge bg-canvas px-4 py-3 pr-11 text-sm text-fg outline-none ring-0 transition-colors focus:border-accent"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-fg-subtle hover:text-fg"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
            ) : null}

            {isResetMode ? (
              <p className="text-sm text-fg-muted">
                Enter your email and we’ll send you a reset link.
              </p>
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

            {recoveryToken ? (
              <button
                type="button"
                onClick={goToSignIn}
                disabled={submitting}
                className="text-sm font-medium text-fg-muted underline underline-offset-4 transition-colors hover:text-fg disabled:opacity-60"
              >
                Back to sign in
              </button>
            ) : isResetMode ? (
              <button
                type="button"
                onClick={goToSignIn}
                disabled={submitting}
                className="text-sm font-medium text-fg-muted underline underline-offset-4 transition-colors hover:text-fg disabled:opacity-60"
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleMode}
                disabled={submitting}
                className="text-sm font-medium text-fg-muted underline underline-offset-4 transition-colors hover:text-fg disabled:opacity-60"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
