import { useState } from 'react';
import { Icon } from './Icon';
import type { SessionSummary } from '../server/sessions';
import { SESSIONS } from '../content/account';

/* ── Helpers ───────────────────────────────────────────────────── */

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

/* ── Session Card ──────────────────────────────────────────────── */

export function SessionCard({ s }: { s: SessionSummary }) {
  const [insightOpen, setInsightOpen] = useState(false);
  const isSauna = s.sessionType === 'sauna';

  const tempDisplay = isSauna
    ? s.peakTempC != null
      ? `${SESSIONS.peakLabel}: ${cToF(s.peakTempC)}°F`
      : null
    : s.minTempC != null
      ? `${SESSIONS.lowLabel}: ${cToF(s.minTempC)}°F`
      : null;

  return (
    <article className="rounded-2xl border border-edge bg-canvas p-5">
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSauna ? 'bg-heat-subtle' : 'bg-accent-subtle'}`}>
          <Icon
            name={isSauna ? 'fire' : 'beaker'}
            className={`h-5 w-5 ${isSauna ? 'text-heat' : 'text-accent'}`}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-bold text-fg">
              {isSauna ? SESSIONS.saunaLabel : SESSIONS.coldPlungeLabel}
            </h3>
            <span className="text-sm text-fg-muted">
              {formatDuration(s.durationMs)}
            </span>
          </div>

          <p className="mt-1 text-sm text-fg-muted">
            {new Date(s.startedAt).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>

          {/* Stats row */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {tempDisplay ? (
              <span className={isSauna ? 'text-heat' : 'text-accent'}>{tempDisplay}</span>
            ) : null}
            {isSauna && s.avgHumidityPct != null ? (
              <span className="text-fg-muted">{SESSIONS.humidityLabel}: {Math.round(s.avgHumidityPct)}%</span>
            ) : null}
            {s.hrvTrend != null ? (
              <span className="text-fg-muted">{SESSIONS.hrvLabel}: {s.hrvTrend > 0 ? '+' : ''}{s.hrvTrend.toFixed(1)}</span>
            ) : null}
            {s.totalKcal != null ? (
              <span className="text-fg-muted">{SESSIONS.caloriesLabel}: ~{Math.round(s.totalKcal)}</span>
            ) : null}
          </div>

          {/* Badges */}
          {(s.rltActive || s.contrastId || s.safetyWarningCount > 0) ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {s.rltActive ? (
                <span className="rounded-full border border-heat-dim/40 bg-heat-subtle px-2 py-0.5 text-xs font-semibold text-heat">
                  {SESSIONS.rltBadge}
                </span>
              ) : null}
              {s.contrastId ? (
                <span className="rounded-full border border-edge bg-surface px-2 py-0.5 text-xs font-semibold text-fg-muted">
                  {SESSIONS.contrastBadge} R{s.splitIndex + 1}
                </span>
              ) : null}
              {s.safetyWarningCount > 0 ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {SESSIONS.safetyBadge}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* AI Insight */}
          {s.aiInsight ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setInsightOpen((v) => !v)}
                className="text-xs font-semibold text-fg-muted underline underline-offset-4 transition-colors hover:text-fg"
              >
                {SESSIONS.insightToggle} {insightOpen ? '▾' : '▸'}
              </button>
              {insightOpen ? (
                <p className="mt-2 rounded-xl border border-edge bg-surface px-4 py-3 text-sm leading-relaxed text-fg-muted">
                  {s.aiInsight}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
