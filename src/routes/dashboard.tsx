import { useCallback, useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Icon } from '../components/Icon';
import { ProfileEditor } from '../components/ProfileEditor';
import { SegmentedControl, type Segment } from '../components/SegmentedControl';
import { SessionCard, formatDuration } from '../components/SessionCard';
import { useAuth } from '../lib/auth';
import { buildSeoHead } from '../lib/seo';
import { tempValue, tempUnit, type UnitSystem } from '../lib/units';
import { getDashboardStats, getSessionHistory, type DashboardStats, type TempDataPoint, type HealthDataPoint, type SessionSummary } from '../server/sessions';
import { getProfile } from '../server/profile';
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

function getAchievementLabel(key: string): string {
  const labels = DASHBOARD.achievementLabels as Record<string, string>;
  return labels[key] ?? key.replace(/_/g, ' ');
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

function TempTrends({ trends, units }: { trends: TempDataPoint[]; units: UnitSystem }) {
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

  const saunaVals = saunaTemps.map((t) => tempValue(t.tempC, units));
  const coldVals = coldTemps.map((t) => tempValue(t.tempC, units));

  const saunaMin = saunaVals.length > 0 ? Math.min(...saunaVals) : 0;
  const saunaMax = saunaVals.length > 0 ? Math.max(...saunaVals) : 0;
  const coldMin = coldVals.length > 0 ? Math.min(...coldVals) : 0;
  const coldMax = coldVals.length > 0 ? Math.max(...coldVals) : 0;
  const unit = tempUnit(units);

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
            {saunaVals.map((val, i) => {
              const range = saunaMax - saunaMin || 1;
              const h = 20 + ((val - saunaMin) / range) * 80;
              return (
                <div
                  key={i}
                  className="group relative flex-1 rounded-t-sm bg-heat opacity-80 transition-opacity hover:opacity-100"
                  style={{ height: `${h}%` }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-heat opacity-0 transition-opacity group-hover:opacity-100">
                    {val}{unit}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between px-3 text-[10px] text-fg-subtle">
            <span>{saunaMin}{unit}</span>
            <span>{saunaMax}{unit}</span>
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
            {coldVals.map((val, i) => {
              const range = coldMax - coldMin || 1;
              // Invert: lower temp = taller bar (colder is more impressive)
              const h = 20 + ((coldMax - val) / range) * 80;
              return (
                <div
                  key={i}
                  className="group relative flex-1 rounded-t-sm bg-accent opacity-80 transition-opacity hover:opacity-100"
                  style={{ height: `${h}%` }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    {val}{unit}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between px-3 text-[10px] text-fg-subtle">
            <span>{coldMin}{unit}</span>
            <span>{coldMax}{unit}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Health Impact ──────────────────────────────────────────────── */

function HealthMetricsSection({ stats }: { stats: DashboardStats }) {
  const { healthMetrics } = stats;

  // No health data at all
  if (
    healthMetrics.avgHeartRate == null &&
    healthMetrics.avgHrv == null &&
    healthMetrics.totalCalories == null &&
    healthMetrics.trends.length === 0
  ) {
    return (
      <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
        <h2 className="text-xl font-bold text-fg">{DASHBOARD.healthHeading}</h2>
        <p className="mt-2 text-sm text-fg-muted">{DASHBOARD.healthDescription}</p>
        <p className="mt-6 text-sm text-fg-muted">{DASHBOARD.healthEmpty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {healthMetrics.avgHeartRate != null ? (
          <StatCard
            label={DASHBOARD.healthAvgHr}
            value={`${healthMetrics.avgHeartRate}`}
            icon="heart"
            iconColor="text-danger"
          />
        ) : null}
        {healthMetrics.peakHeartRate != null ? (
          <StatCard
            label={DASHBOARD.healthPeakHr}
            value={`${healthMetrics.peakHeartRate}`}
            icon="trending-up"
            iconColor="text-danger"
          />
        ) : null}
        {healthMetrics.avgHrv != null ? (
          <StatCard
            label={DASHBOARD.healthAvgHrv}
            value={`${healthMetrics.avgHrv}`}
            icon="signal"
            iconColor="text-success"
          />
        ) : null}
        {healthMetrics.totalCalories != null ? (
          <StatCard
            label={DASHBOARD.healthTotalCal}
            value={`${healthMetrics.totalCalories.toLocaleString()}`}
            icon="fire"
            iconColor="text-warning"
          />
        ) : null}
        {healthMetrics.avgCaloriesPerSession != null ? (
          <StatCard
            label={DASHBOARD.healthAvgCal}
            value={`${healthMetrics.avgCaloriesPerSession}`}
            icon="bolt"
            iconColor="text-warning"
          />
        ) : null}
      </div>

      {/* Trend charts */}
      {healthMetrics.trends.length > 1 ? (
        <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold text-fg">{DASHBOARD.healthHeading}</h2>
          <p className="mt-2 text-sm text-fg-muted">{DASHBOARD.healthDescription}</p>

          {/* Heart Rate trend */}
          <HealthTrendChart
            heading={DASHBOARD.healthHrTrendHeading}
            unit={DASHBOARD.healthHrUnit}
            data={healthMetrics.trends}
            getValue={(d) => d.avgHr}
            barColor="bg-danger"
            labelColor="text-danger"
          />

          {/* HRV trend */}
          <HealthTrendChart
            heading={DASHBOARD.healthHrvTrendHeading}
            unit={DASHBOARD.healthHrvUnit}
            data={healthMetrics.trends}
            getValue={(d) => d.avgHrv}
            barColor="bg-success"
            labelColor="text-success"
          />

          {/* Calories trend */}
          <HealthTrendChart
            heading={DASHBOARD.healthCalTrendHeading}
            unit={DASHBOARD.healthCalUnit}
            data={healthMetrics.trends}
            getValue={(d) => d.kcal}
            barColor="bg-warning"
            labelColor="text-warning"
          />
        </div>
      ) : null}
    </div>
  );
}

function HealthTrendChart({
  heading,
  unit,
  data,
  getValue,
  barColor,
  labelColor,
}: {
  heading: string;
  unit: string;
  data: HealthDataPoint[];
  getValue: (d: HealthDataPoint) => number | null;
  barColor: string;
  labelColor: string;
}) {
  const points = data.filter((d) => getValue(d) != null);
  if (points.length < 2) return null;

  const values = points.map((d) => getValue(d) as number);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  // Compute simple trend: compare last 5 avg to first 5 avg
  const recent = values.slice(-5);
  const early = values.slice(0, 5);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
  const trendPct = earlyAvg > 0 ? ((recentAvg - earlyAvg) / earlyAvg) * 100 : 0;
  const trendLabel =
    Math.abs(trendPct) < 1
      ? 'Stable'
      : `${trendPct > 0 ? '+' : ''}${trendPct.toFixed(1)}%`;

  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between">
        <p className={`text-xs font-semibold uppercase tracking-widest ${labelColor}`}>
          {heading}
        </p>
        <span className="text-xs font-medium text-fg-muted">
          {trendLabel} recent trend
        </span>
      </div>
      <div className="mt-3 flex h-24 items-end gap-1 rounded-xl bg-canvas px-3 pb-2">
        {points.map((d, i) => {
          const v = getValue(d) as number;
          const h = 15 + ((v - minV) / range) * 85;
          const isSauna = d.sessionType === 'sauna';
          return (
            <div
              key={i}
              className={`group relative flex-1 rounded-t-sm opacity-80 transition-opacity hover:opacity-100 ${barColor}`}
              style={{ height: `${h}%` }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-fg px-1.5 py-0.5 text-[10px] font-medium text-canvas opacity-0 transition-opacity group-hover:opacity-100">
                {Math.round(v)} {unit} · {isSauna ? '🔥' : '🧊'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between px-3 text-[10px] text-fg-subtle">
        <span>
          {Math.round(minV)} {unit}
        </span>
        <span>
          {Math.round(maxV)} {unit}
        </span>
      </div>
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
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-fg-subtle" />
          <span className="text-fg-muted">{DASHBOARD.breakdownContrast}:</span>
          <span className="font-semibold text-fg">{stats.gamification.contrastCompletedCount}</span>
        </span>
      </div>
    </div>
  );
}

function Achievements({ stats }: { stats: DashboardStats }) {
  const unlockedKeys = new Set(stats.gamification.achievements.map((a) => a.key));
  const entries = Object.entries(DASHBOARD.achievementLabels);

  return (
    <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-fg">{DASHBOARD.achievementsHeading}</h2>
          <p className="mt-2 text-sm text-fg-muted">{DASHBOARD.achievementsDescription}</p>
        </div>
        <div className="rounded-full border border-edge bg-canvas px-3 py-1 text-xs font-semibold text-fg-muted">
          {stats.gamification.achievements.length}/{entries.length}
        </div>
      </div>

      {stats.gamification.achievements.length === 0 ? (
        <p className="mt-6 text-sm text-fg-muted">{DASHBOARD.achievementsEmpty}</p>
      ) : null}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {entries.map(([key]) => {
          const unlocked = unlockedKeys.has(key);
          return (
            <div
              key={key}
              className={`rounded-xl border px-3 py-2 text-sm ${
                unlocked
                  ? 'border-heat-dim/40 bg-heat-subtle text-fg'
                  : 'border-edge bg-canvas text-fg-subtle'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  name={unlocked ? 'sparkles' : 'shield-check'}
                  className={`h-4 w-4 ${unlocked ? 'text-heat' : 'text-fg-subtle'}`}
                  aria-hidden="true"
                />
                <span className="font-medium">{getAchievementLabel(key)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {stats.gamification.source === 'derived' ? (
        <p className="mt-4 text-xs text-fg-subtle">
          Showing derived progress. Run the gamification migration in Supabase to enable authoritative XP and achievement history.
        </p>
      ) : null}
    </div>
  );
}

/* ── Segments ───────────────────────────────────────────────────── */

type Tab = 'overview' | 'health' | 'history' | 'progress' | 'profile';

const TABS: Segment<Tab>[] = [
  { key: 'overview', label: DASHBOARD.segmentOverview },
  { key: 'health', label: DASHBOARD.segmentHealth },
  { key: 'history', label: DASHBOARD.segmentHistory },
  { key: 'progress', label: DASHBOARD.segmentProgress },
  { key: 'profile', label: DASHBOARD.segmentProfile },
];

const VALID_TABS = new Set<string>(TABS.map((t) => t.key));

function getTabFromHash(): Tab {
  const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  return VALID_TABS.has(hash) ? (hash as Tab) : 'overview';
}

const HISTORY_PAGE_SIZE = 50;

/* ── Page ───────────────────────────────────────────────────────── */

function DashboardPage() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(getTabFromHash);
  const [units, setUnits] = useState<UnitSystem>('imperial');

  // History tab state
  const [historySessions, setHistorySessions] = useState<SessionSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyMoreLoading, setHistoryMoreLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);

  // Sync tab ↔ URL hash
  const handleTabChange = useCallback((next: Tab) => {
    setTab(next);
    window.history.replaceState(null, '', `#${next}`);
  }, []);

  // Listen for back/forward navigation
  useEffect(() => {
    const onHash = () => setTab(getTabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

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

    // Fetch profile for unit preference (non-blocking)
    getProfile({ data: { accessToken: session.accessToken } })
      .then((p) => {
        if (active) setUnits(p.unitPreference);
      })
      .catch(() => { /* keep default */ });

    return () => { active = false; };
  }, [session?.accessToken, user]);

  // Lazy-fetch history when the tab is first selected
  useEffect(() => {
    if (tab !== 'history' || historyFetched || !session?.accessToken || !user) return;

    let active = true;
    setHistoryLoading(true);
    setHistoryError(null);

    getSessionHistory({ data: { accessToken: session.accessToken, limit: HISTORY_PAGE_SIZE, offset: 0 } })
      .then((data) => {
        if (!active) return;
        setHistorySessions(data.sessions);
        setHistoryOffset(data.sessions.length);
        setHistoryHasMore(data.sessions.length === HISTORY_PAGE_SIZE);
        setHistoryFetched(true);
      })
      .catch((err: unknown) => {
        if (active) setHistoryError(err instanceof Error ? err.message : DASHBOARD.historyError);
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });

    return () => { active = false; };
  }, [tab, historyFetched, session?.accessToken, user]);

  const loadMoreHistory = useCallback(() => {
    if (!session?.accessToken || !user || historyMoreLoading || !historyHasMore) return;

    setHistoryMoreLoading(true);
    setHistoryError(null);

    getSessionHistory({ data: { accessToken: session.accessToken, limit: HISTORY_PAGE_SIZE, offset: historyOffset } })
      .then((data) => {
        setHistorySessions((prev) => [...prev, ...data.sessions]);
        setHistoryOffset((prev) => prev + data.sessions.length);
        setHistoryHasMore(data.sessions.length === HISTORY_PAGE_SIZE);
      })
      .catch((err: unknown) => {
        setHistoryError(err instanceof Error ? err.message : DASHBOARD.historyError);
      })
      .finally(() => {
        setHistoryMoreLoading(false);
      });
  }, [historyHasMore, historyMoreLoading, historyOffset, session?.accessToken, user]);

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
        {/* Header + Segmented Control */}
        <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle">
            {DASHBOARD.heading}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg">
            {DASHBOARD.subtitle}
          </h1>
          <div className="mt-5">
            <SegmentedControl segments={TABS} selected={tab} onChange={handleTabChange} />
          </div>
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

        {/* Empty state (only on data tabs) */}
        {!loading && !error && stats && stats.totalSessions === 0 && tab !== 'profile' ? (
          <div className="mt-6 rounded-3xl border border-edge bg-surface p-6 sm:p-8 text-sm text-fg-muted">
            {DASHBOARD.emptyState}
          </div>
        ) : null}

        {/* ── Overview tab ─────────────────────────────────────── */}
        {tab === 'overview' && !loading && !error && stats && stats.totalSessions > 0 ? (
          <>
            {/* Summary cards */}
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
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
                label={DASHBOARD.bestStreak}
                value={`${stats.gamification.bestStreakDays} ${DASHBOARD.streakUnit}`}
                icon="trending-up"
                iconColor="text-heat"
              />
              <StatCard
                label={DASHBOARD.level}
                value={`Lv ${stats.gamification.level}`}
                icon="bolt"
                iconColor="text-accent"
              />
              <StatCard
                label={DASHBOARD.xp}
                value={String(stats.gamification.xp)}
                icon="sparkles"
                iconColor="text-accent"
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

            {/* Session breakdown */}
            <div className="mt-6">
              <Breakdown stats={stats} />
            </div>

            {/* Recent sessions */}
            <div className="mt-6 rounded-3xl border border-edge bg-surface p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-bold text-fg">{DASHBOARD.recentHeading}</h2>
                <button
                  type="button"
                  onClick={() => handleTabChange('history')}
                  className="text-sm font-semibold text-fg-muted underline underline-offset-4 transition-colors hover:text-fg"
                >
                  {DASHBOARD.recentViewAll}
                </button>
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

        {/* ── Health tab ───────────────────────────────────────── */}
        {tab === 'health' && !loading && !error && stats && stats.totalSessions > 0 ? (
          <>
            {/* Temperature trends */}
            <div className="mt-6">
              <TempTrends trends={stats.tempTrends} units={units} />
            </div>

            {/* Health impact metrics */}
            <div className="mt-6">
              <HealthMetricsSection stats={stats} />
            </div>
          </>
        ) : null}

        {/* ── History tab ──────────────────────────────────────── */}
        {tab === 'history' ? (
          <div className="mt-6 rounded-3xl border border-edge bg-surface p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Icon name="clock" className="h-5 w-5 text-fg-muted" aria-hidden="true" />
              <h2 className="text-xl font-bold text-fg">{DASHBOARD.historyHeading}</h2>
            </div>
            <p className="mt-2 text-sm text-fg-muted">{DASHBOARD.historyDescription}</p>

            {historyLoading ? (
              <div className="animate-pulse mt-6 space-y-3">
                <div className="h-3 w-40 rounded-full bg-edge" />
                <div className="h-3 w-56 rounded-full bg-edge" />
                <div className="h-3 w-32 rounded-full bg-edge" />
              </div>
            ) : null}

            {historyError ? (
              <div className="ui-alert-danger mt-6">{historyError}</div>
            ) : null}

            {!historyLoading && !historyError && historySessions.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-edge bg-canvas p-5 text-sm text-fg-muted">
                {DASHBOARD.historyEmpty}
              </div>
            ) : null}

            {!historyLoading && !historyError && historySessions.length > 0 ? (
              <>
                <div className="mt-6 grid gap-3">
                  {historySessions.map((s) => (
                    <SessionCard key={s.id} s={s} />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-fg-subtle">
                    Showing {historySessions.length} sessions
                  </p>
                  {historyHasMore ? (
                    <button
                      type="button"
                      onClick={loadMoreHistory}
                      disabled={historyMoreLoading}
                      className="rounded-lg border border-edge px-3 py-1.5 text-sm font-semibold text-fg-muted transition-colors hover:bg-canvas hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {historyMoreLoading ? 'Loading...' : 'Load more sessions'}
                    </button>
                  ) : (
                    <p className="text-xs text-fg-subtle">You have reached the end of your history.</p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {/* ── Progress tab ─────────────────────────────────────── */}
        {tab === 'progress' && !loading && !error && stats && stats.totalSessions > 0 ? (
          <div className="mt-6">
            <Achievements stats={stats} />
          </div>
        ) : null}

        {/* ── Profile tab ──────────────────────────────────────── */}
        {tab === 'profile' ? (
          <div className="mt-6">
            <ProfileEditor />
          </div>
        ) : null}
      </section>
    </main>
  );
}
