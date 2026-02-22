import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Icon } from '../components/Icon';
import { SessionCard } from '../components/SessionCard';
import { useAuth } from '../lib/auth';
import { formatPrice } from '../lib/format';
import { buildSeoHead } from '../lib/seo';
import { getAccountSnapshot, type AccountSnapshot } from '../server/account';
import { getSessionHistory, type SessionSummary } from '../server/sessions';
import { SESSIONS } from '../content/account';

export const Route = createFileRoute('/account')({
  head: () =>
    buildSeoHead({
      title: 'Account | Yutori Labs',
      description: 'View your Yutori orders and account status.',
      path: '/account',
    }),
  component: AccountPage,
});

const SESSION_PAGE_SIZE = 50;

function getFinancialLabel(status: string | null): string {
  switch (status) {
    case 'paid':
      return 'Paid in full';
    case 'partially_paid':
      return 'Deposit paid';
    case 'pending':
      return 'Payment pending';
    case 'authorized':
      return 'Authorized';
    case 'partially_refunded':
      return 'Partially refunded';
    case 'refunded':
      return 'Refunded';
    case 'voided':
      return 'Voided';
    default:
      return 'Unknown';
  }
}

function statusToneClass(status: string | null): string {
  if (status === 'paid') {
    return 'ui-chip-status-success';
  }
  if (status === 'partially_paid' || status === 'pending' || status === 'authorized') {
    return 'ui-chip-status-warning';
  }
  return 'ui-chip-status-muted';
}

/* ── Page ───────────────────────────────────────────────────────── */

function AccountPage() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [snapshot, setSnapshot] = useState<AccountSnapshot | null>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMoreSessions, setLoadingMoreSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessionsOffset, setSessionsOffset] = useState(0);
  const [hasMoreSessions, setHasMoreSessions] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      void navigate({ to: '/auth', search: { mode: 'signin' } });
    }
  }, [authLoading, navigate, user]);

  // Fetch account snapshot (orders)
  useEffect(() => {
    if (!session?.accessToken || !user) {
      return;
    }

    let active = true;
    setLoadingSnapshot(true);
    setSnapshotError(null);

    getAccountSnapshot({ data: { accessToken: session.accessToken } })
      .then((data) => {
        if (active) setSnapshot(data);
      })
      .catch((error: unknown) => {
        if (active) setSnapshotError(error instanceof Error ? error.message : 'Could not load account data.');
      })
      .finally(() => {
        if (active) setLoadingSnapshot(false);
      });

    return () => { active = false; };
  }, [session?.accessToken, user]);

  // Fetch session history
  useEffect(() => {
    if (!session?.accessToken || !user) {
      return;
    }

    let active = true;
    setLoadingSessions(true);
    setSessionsError(null);
    setSessionsOffset(0);
    setHasMoreSessions(false);

    getSessionHistory({
      data: {
        accessToken: session.accessToken,
        limit: SESSION_PAGE_SIZE,
        offset: 0,
      },
    })
      .then((data) => {
        if (active) {
          setSessions(data.sessions);
          setSessionsOffset(data.sessions.length);
          setHasMoreSessions(data.sessions.length === SESSION_PAGE_SIZE);
        }
      })
      .catch((error: unknown) => {
        if (active) setSessionsError(error instanceof Error ? error.message : SESSIONS.error);
      })
      .finally(() => {
        if (active) setLoadingSessions(false);
      });

    return () => { active = false; };
  }, [session?.accessToken, user]);

  const loadMoreSessions = useCallback(() => {
    if (!session?.accessToken || !user || loadingMoreSessions || !hasMoreSessions) {
      return;
    }

    setLoadingMoreSessions(true);
    setSessionsError(null);

    getSessionHistory({
      data: {
        accessToken: session.accessToken,
        limit: SESSION_PAGE_SIZE,
        offset: sessionsOffset,
      },
    })
      .then((data) => {
        setSessions((prev) => [...prev, ...data.sessions]);
        setSessionsOffset((prev) => prev + data.sessions.length);
        setHasMoreSessions(data.sessions.length === SESSION_PAGE_SIZE);
      })
      .catch((error: unknown) => {
        setSessionsError(error instanceof Error ? error.message : SESSIONS.error);
      })
      .finally(() => {
        setLoadingMoreSessions(false);
      });
  }, [
    hasMoreSessions,
    loadingMoreSessions,
    session?.accessToken,
    sessionsOffset,
    user,
  ]);

  const orders = snapshot?.orders ?? [];
  const customerName = useMemo(() => {
    const firstName = snapshot?.customer?.firstName?.trim();
    const lastName = snapshot?.customer?.lastName?.trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    return fullName.length > 0 ? fullName : null;
  }, [snapshot?.customer?.firstName, snapshot?.customer?.lastName]);

  if (authLoading || !user) {
    return (
      <main className="flex-1 bg-canvas">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="animate-pulse rounded-2xl border border-edge bg-surface p-6">
            <div className="h-3 w-24 rounded-full bg-edge" />
            <div className="mt-3 h-5 w-48 rounded-full bg-edge" />
            <div className="mt-3 h-3 w-36 rounded-full bg-edge" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-canvas">
      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* Account header */}
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-edge bg-surface p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg">
              {customerName ?? 'Your Yutori account'}
            </h1>
            <p className="mt-3 text-sm text-fg-muted">
              Signed in as <span className="font-medium text-fg">{snapshot?.email ?? user.email}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              signOut()
                .then(() => navigate({ to: '/auth', search: { mode: 'signin' } }))
                .catch(() => navigate({ to: '/auth', search: { mode: 'signin' } }));
            }}
            className="rounded-lg border border-edge px-4 py-2 text-sm font-semibold text-fg-muted transition-colors hover:bg-canvas hover:text-fg"
          >
            Sign out
          </button>
        </div>

        {/* Order status */}
        <div className="mt-6 rounded-3xl border border-edge bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold text-fg">Order status</h2>
          <p className="mt-2 text-sm text-fg-muted">
            Track your deposit orders and check payment status for remaining balances.
          </p>

          {loadingSnapshot ? (
            <div className="animate-pulse mt-6 rounded-2xl border border-edge bg-canvas p-5 space-y-3">
              <div className="h-3 w-40 rounded-full bg-edge" />
              <div className="h-3 w-56 rounded-full bg-edge" />
              <div className="h-3 w-32 rounded-full bg-edge" />
            </div>
          ) : null}

          {snapshotError ? (
            <div className="ui-alert-danger mt-6">
              {snapshotError}
            </div>
          ) : null}

          {!loadingSnapshot && !snapshotError && orders.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-edge bg-canvas p-5 text-sm text-fg-muted">
              No Shopify orders were found for this account yet. Once you place a deposit order, it
              will appear here.
            </div>
          ) : null}

          {!loadingSnapshot && !snapshotError && orders.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {orders.map((order) => {
                const financialLabel = getFinancialLabel(order.financialStatus);
                const hasOutstandingBalance = order.financialStatus === 'partially_paid';

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-edge bg-canvas p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-fg">{order.name}</h3>
                        <p className="mt-1 text-sm text-fg-muted">
                          {new Date(order.createdAt).toLocaleDateString()} · {order.itemSummary}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-fg">
                          {formatPrice(order.totalPrice, order.currency)}
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusToneClass(order.financialStatus)}`}
                        >
                          {financialLabel}
                        </span>
                      </div>
                    </div>

                    {hasOutstandingBalance ? (
                      <p className="ui-alert-warning mt-4">
                        Remaining balance is still due for this order.
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      {order.orderStatusUrl ? (
                        <a
                          href={order.orderStatusUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-edge px-3 py-1.5 text-sm font-semibold text-fg transition-colors hover:bg-surface"
                        >
                          Order status
                          <Icon name="arrow-top-right" className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                      <Link to="/cart" className="text-fg-muted underline underline-offset-4">
                        Go to cart
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Session history */}
        <div id="session-history" className="mt-6 rounded-3xl border border-edge bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold text-fg">{SESSIONS.heading}</h2>
          <p className="mt-2 text-sm text-fg-muted">{SESSIONS.description}</p>

          {loadingSessions ? (
            <div className="animate-pulse mt-6 rounded-2xl border border-edge bg-canvas p-5 space-y-3">
              <div className="h-3 w-40 rounded-full bg-edge" />
              <div className="h-3 w-56 rounded-full bg-edge" />
              <div className="h-3 w-32 rounded-full bg-edge" />
            </div>
          ) : null}

          {sessionsError ? (
            <div className="ui-alert-danger mt-6">
              {sessionsError}
            </div>
          ) : null}

          {!loadingSessions && !sessionsError && sessions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-edge bg-canvas p-5 text-sm text-fg-muted">
              {SESSIONS.emptyState}
            </div>
          ) : null}

          {!loadingSessions && !sessionsError && sessions.length > 0 ? (
            <>
              <div className="mt-6 grid gap-3">
                {sessions.map((s) => (
                  <SessionCard key={s.id} s={s} />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-fg-subtle">
                  Showing {sessions.length} sessions
                </p>
                {hasMoreSessions ? (
                  <button
                    type="button"
                    onClick={loadMoreSessions}
                    disabled={loadingMoreSessions}
                    className="rounded-lg border border-edge px-3 py-1.5 text-sm font-semibold text-fg-muted transition-colors hover:bg-canvas hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMoreSessions ? 'Loading...' : 'Load more sessions'}
                  </button>
                ) : (
                  <p className="text-xs text-fg-subtle">You have reached the end of your history.</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
