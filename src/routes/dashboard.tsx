import { useEffect, useState } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Icon } from '../components/Icon';
import { SessionCard, formatDuration } from '../components/SessionCard';
import { useAuth } from '../lib/auth';
import { buildSeoHead } from '../lib/seo';
import { getDashboardStats, type DashboardStats, type TempDataPoint } from '../server/sessions';
import { DASHBOARD } from '../content/dashboard';

export const Route = createFileRoute('/dashboard')({
  head: () =>
    buildSeoHead({
      title: DASHBOARD.seo.title,
      description: DASHBOARD.seo.description,
      path: DASHBOARD.seo.path,
    }),
  component: DashboardPage,
});

/* ── Helpers ───────────────────────────────────────────────────── */

function formatTotalTime(ms: number): string {
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ── Summary Card ──────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  icon?: string;
  iconColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-edge bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-2xl font-bold text-fg">{value}</p>
        {icon ? (
          <Icon name={icon} className={`h-6 w-6 ${iconColor ?? 'text-fg-muted'}`} aria-hidden="true" />
        ) : null}
      </div>
    </div>
  );
}

/* ── Weekly Activity Chart ─────────────────────────────────────── */

function WeeklyChart({ stats }: { stats: DashboardStats }) {
  const { weeklyBuckets } = stats;
  const maxCount = Math.max(...weeklyBuckets.map((b) => b.totalCount), 1);

  return (
    <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-bold text-fg">{DASHBOARD.weeklyHeading}</h2>
      <p className="mt-2 text-sm text-fg-muted">{DASHBOARD.weeklyDescription}</p>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs font-medium text-fg-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-heat" />
          {DASHBOARD.saunaLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent" />
          {DASHBOARD.coldLabel}
        </span>
      </div>

      {weeklyBuckets.every((b) => b.totalCount === 0) ? (
        <p className="mt-6 text-sm text-fg-muted">{DASHBOARD.weeklyEmpty}</p>
      ) : (
        <>
          {/* Bar chart */}
          <div className="mt-5 flex h-40 items-end gap-1.5 rounded-xl bg-canvas px-3 pb-3 pt-2">
            {weeklyBuckets.map((bucket) => {
              const saunaH = (bucket.saunaCount / maxCount) * 100;
              const coldH = (bucket.coldCount / maxCount) * 100;
              return (
                <div key={bucket.weekStart} className="flex flex-1 flex-col items-stretch justify-end h-full gap-0.5">
                  {bucket.coldCount > 0 ? (
                    <div
                      style={{ height: `${coldH}%` }}
                      className="rounded-t-sm bg-accent opacity-80"
                    />
                  ) : null}
                  {bucket.saunaCount > 0 ? (
                    <div
                      style={{ height: `${saunaH}%` }}
                      className={`bg-heat opacity-80 ${bucket.coldCount > 0 ? 'rounded-b-sm' : 'rounded-sm'}`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div className="mt-2 flex gap-1.5 px-3">
            {weeklyBuckets.map((bucket) => (
              <div key={bucket.weekStart} className="flex-1 text-center text-[10px] text-fg-subtle">
                {bucket.weekLabel}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Temperature Trends ────────────────────────────────────────── */

function TempTrends({ trends }: { trends: TempDataPoint[] }) {
  if (trends.length === 0) {
    return (
      <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
        <h2 className="text-xl font-bold text-fg">{DASHBOARD.tempHeading}</h2>
        <p className="mt-2 text-sm text-fg-muted">{DASHBOARD.tempDescription}</p>
        <p className="mt-6 text-sm text-fg-muted">{DASHBOARD.tempEmpty}</p>
      </div>
    );
  }

  const saunaTemps = trends.filter((t) => t.sessionType === 'sauna');
  const coldTemps = trends.filter((t) => t.sessionType === 'cold_plunge');

  const saunaMin = saunaTemps.length > 0 ? Math.min(...saunaTemps.map((t) => t.tempF)) : 0;
  const saunaMax = saunaTemps.length > 0 ? Math.max(...saunaTemps.map((t) => t.tempF)) : 0;
  const coldMin = coldTemps.length > 0 ? Math.min(...coldTemps.map((t) => t.tempF)) : 0;
  const coldMax = coldTemps.length > 0 ? Math.max(...coldTemps.map((t) => t.tempF)) : 0;

  return (
    <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-bold text-fg">{DASHBOARD.tempHeading}</h2>
      <p className="mt-2 text-sm text-fg-muted">{DASHBOARD.tempDescription}</p>

      {/* Sauna temps */}
      {saunaTemps.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-heat">
            Peak sauna
          </p>
          <div className="mt-3 flex h-20 items-end gap-1 rounded-xl bg-canvas px-3 pb-2">
            {saunaTemps.map((t, i) => {
              const range = saunaMax - saunaMin || 1;
              const h = 20 + ((t.tempF - saunaMin) / range) * 80;
              return (
                <div
                  key={i}
                  className="group relative flex-1 rounded-t-sm bg-heat opacity-80 transition-opacity hover:opacity-100"
                  style={{ height: `${h}%` }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-heat opacity-0 transition-opacity group-hover:opacity-100">
                    {t.tempF}°F
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between px-3 text-[10px] text-fg-subtle">
            <span>{saunaMin}°F</span>
            <span>{saunaMax}°F</span>
          </div>
        </div>
      ) : null}

      {/* Cold plunge temps */}
      {coldTemps.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Low cold plunge
          </p>
          <div className="mt-3 flex h-20 items-end gap-1 rounded-xl bg-canvas px-3 pb-2">
            {coldTemps.map((t, i) => {
              const range = coldMax - coldMin || 1;
              // Invert: lower temp = taller bar (colder is more impressive)
              const h = 20 + ((coldMax - t.tempF) / range) * 80;
              return (
                <div
                  key={i}
                  className="group relative flex-1 rounded-t-sm bg-accent opacity-80 transition-opacity hover:opacity-100"
                  style={{ height: `${h}%` }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    {t.tempF}°F
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between px-3 text-[10px] text-fg-subtle">
            <span>{coldMin}°F</span>
            <span>{coldMax}°F</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Session Breakdown ─────────────────────────────────────────── */

function Breakdown({ stats }: { stats: DashboardStats }) {
  const total = stats.totalSessions || 1;
  const saunaPct = Math.round((stats.saunaCount / total) * 100);
  const coldPct = 100 - saunaPct;

  return (
    <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-bold text-fg">{DASHBOARD.breakdownHeading}</h2>

      <div className="mt-5 flex h-3 overflow-hidden rounded-full">
        {stats.saunaCount > 0 ? (
          <div style={{ width: `${saunaPct}%` }} className="bg-heat" />
        ) : null}
        {stats.coldCount > 0 ? (
          <div style={{ width: `${coldPct}%` }} className="bg-accent" />
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-heat" />
          <span className="text-fg-muted">{DASHBOARD.breakdownSauna}:</span>
          <span className="font-semibold text-fg">{stats.saunaCount}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent" />
          <span className="text-fg-muted">{DASHBOARD.breakdownCold}:</span>
          <span className="font-semibold text-fg">{stats.coldCount}</span>
        </span>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

function DashboardPage() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      void navigate({ to: '/auth', search: { mode: 'signin' } });
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!session?.accessToken || !user) return;

    let active = true;
    setLoading(true);
    setError(null);

    getDashboardStats({ data: { accessToken: session.accessToken } })
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : DASHBOARD.error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [session?.accessToken, user]);

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
        {/* Header */}
        <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle">
            {DASHBOARD.heading}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg">
            {DASHBOARD.subtitle}
          </h1>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="mt-6 animate-pulse rounded-3xl border border-edge bg-surface p-6 space-y-3">
            <div className="h-3 w-40 rounded-full bg-edge" />
            <div className="h-3 w-56 rounded-full bg-edge" />
            <div className="h-3 w-32 rounded-full bg-edge" />
          </div>
        ) : null}

        {/* Error */}
        {error ? (
          <div className="ui-alert-danger mt-6">{error}</div>
        ) : null}

        {/* Empty state */}
        {!loading && !error && stats && stats.totalSessions === 0 ? (
          <div className="mt-6 rounded-3xl border border-edge bg-surface p-6 sm:p-8 text-sm text-fg-muted">
            {DASHBOARD.emptyState}
          </div>
        ) : null}

        {/* Dashboard content */}
        {!loading && !error && stats && stats.totalSessions > 0 ? (
          <>
            {/* Summary cards */}
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label={DASHBOARD.totalSessions}
                value={String(stats.totalSessions)}
              />
              <StatCard
                label={DASHBOARD.currentStreak}
                value={`${stats.currentStreakDays} ${DASHBOARD.streakUnit}`}
                icon="fire"
                iconColor="text-heat"
              />
              <StatCard
                label={DASHBOARD.totalTime}
                value={formatTotalTime(stats.totalDurationMs)}
              />
              <StatCard
                label={DASHBOARD.avgDuration}
                value={formatDuration(stats.avgDurationMs)}
              />
            </div>

            {/* Weekly activity */}
            <div className="mt-6">
              <WeeklyChart stats={stats} />
            </div>

            {/* Temperature trends */}
            <div className="mt-6">
              <TempTrends trends={stats.tempTrends} />
            </div>

            {/* Session breakdown */}
            <div className="mt-6">
              <Breakdown stats={stats} />
            </div>

            {/* Recent sessions */}
            <div className="mt-6 rounded-3xl border border-edge bg-surface p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-bold text-fg">{DASHBOARD.recentHeading}</h2>
                <Link
                  to="/account"
                  className="text-sm font-semibold text-fg-muted underline underline-offset-4 transition-colors hover:text-fg"
                >
                  {DASHBOARD.recentViewAll}
                </Link>
              </div>

              {stats.recentSessions.length === 0 ? (
                <p className="mt-4 text-sm text-fg-muted">{DASHBOARD.recentEmpty}</p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {stats.recentSessions.map((s) => (
                    <SessionCard key={s.id} s={s} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
