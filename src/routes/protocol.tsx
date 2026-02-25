import { useEffect, useState } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Icon } from '../components/Icon';
import { useAuth } from '../lib/auth';
import { buildSeoHead } from '../lib/seo';
import {
  getUserProtocols,
  type ProtocolSummary,
  type ScheduleWeek,
} from '../server/coach';
import { PROTOCOL } from '../content/protocol';

export const Route = createFileRoute('/protocol')({
  head: () =>
    buildSeoHead({
      title: PROTOCOL.seo.title,
      description: PROTOCOL.seo.description,
      path: PROTOCOL.seo.path,
    }),
  component: ProtocolPage,
});

/* ── Week Card ─────────────────────────────────────────────────── */

function WeekCard({
  week,
  note,
  benchmark,
}: {
  week: ScheduleWeek;
  note: string;
  benchmark: string;
}) {
  return (
    <div className="rounded-2xl border border-edge bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-fg">
          {PROTOCOL.weekHeading(week.weekNumber)}
        </h3>
        {week.focus ? (
          <span className="rounded-lg bg-canvas px-2.5 py-1 text-xs font-semibold text-fg-subtle">
            {week.focus}
          </span>
        ) : null}
      </div>

      {/* Schedule grid */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-fg-subtle">
            {PROTOCOL.frequencyLabel}
          </p>
          <p className="mt-0.5 text-sm font-bold text-fg">{week.frequency || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-fg-subtle">
            {PROTOCOL.durationLabel}
          </p>
          <p className="mt-0.5 text-sm font-bold text-fg">{week.duration || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-fg-subtle">
            {PROTOCOL.temperatureLabel}
          </p>
          <p className="mt-0.5 text-sm font-bold text-fg">{week.temperature || '—'}</p>
        </div>
      </div>

      {/* Narrative: weekly notes + benchmark */}
      {note ? (
        <div className="mt-4 border-t border-edge pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-fg-subtle">
            {PROTOCOL.notesLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">{note}</p>
        </div>
      ) : null}
      {benchmark ? (
        <div className="mt-3 border-t border-edge pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-fg-subtle">
            {PROTOCOL.benchmarkLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">{benchmark}</p>
        </div>
      ) : null}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

function ProtocolPage() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const [protocols, setProtocols] = useState<ProtocolSummary[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
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

    getUserProtocols({ data: { accessToken: session.accessToken } })
      .then((data) => {
        if (active) setProtocols(data);
      })
      .catch(() => {
        if (active) setError(PROTOCOL.error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session?.accessToken, user]);

  const selected = protocols[selectedIdx] ?? null;

  if (authLoading || (!user && !error)) {
    return (
      <main className="flex-1 bg-canvas">
        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-lg bg-surface" />
            <div className="h-4 w-64 rounded bg-surface" />
            <div className="h-48 rounded-3xl bg-surface" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-canvas">
      <section className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <h1 className="text-3xl font-bold text-fg">{PROTOCOL.heading}</h1>
        <p className="mt-2 text-sm text-fg-muted">{PROTOCOL.subtitle}</p>

        {/* Loading */}
        {loading ? (
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-32 rounded-3xl bg-surface" />
            <div className="h-28 rounded-2xl bg-surface" />
            <div className="h-28 rounded-2xl bg-surface" />
          </div>
        ) : error ? (
          /* Error */
          <div className="mt-8 rounded-2xl border border-danger/30 bg-danger/10 p-6">
            <p className="text-sm font-medium text-danger">{error}</p>
          </div>
        ) : protocols.length === 0 ? (
          /* Empty state */
          <div className="mt-8 rounded-3xl border border-edge bg-surface p-8 text-center">
            <Icon name="clipboard-document-list" className="mx-auto h-10 w-10 text-fg-subtle" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-fg">{PROTOCOL.emptyHeading}</h2>
            <p className="mt-2 text-sm text-fg-muted">{PROTOCOL.emptyBody}</p>
          </div>
        ) : selected ? (
          /* Protocol content */
          <div className="mt-8 space-y-6">
            {/* Protocol selector (if multiple) */}
            {protocols.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {protocols.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedIdx(i)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                      i === selectedIdx
                        ? 'border-heat bg-heat/10 text-heat'
                        : 'border-edge text-fg-muted hover:bg-surface hover:text-fg'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Protocol title + metadata */}
            <div>
              <h2 className="text-xl font-bold text-fg">{selected.title}</h2>
              <p className="mt-1 text-xs font-medium text-fg-subtle">
                {PROTOCOL.typeLabels[selected.protocolType] ?? selected.protocolType} protocol
                {' · '}Generated{' '}
                {new Date(selected.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Overview */}
            {selected.narrative.overview ? (
              <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
                <h2 className="text-lg font-bold text-fg">{PROTOCOL.overviewHeading}</h2>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {selected.narrative.overview}
                </p>
              </div>
            ) : null}

            {/* Week-by-week cards */}
            <div className="space-y-4">
              {selected.schedule.map((week, i) => (
                <WeekCard
                  key={week.weekNumber}
                  week={week}
                  note={selected.narrative.weeklyNotes[i] ?? ''}
                  benchmark={selected.narrative.weeklyBenchmarks[i] ?? ''}
                />
              ))}
            </div>

            {/* Progress marker */}
            {selected.narrative.progressMarker ? (
              <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Icon name="chart-bar" className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-fg">{PROTOCOL.progressHeading}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {selected.narrative.progressMarker}
                </p>
              </div>
            ) : null}

            {/* Safety notes */}
            {selected.narrative.notes ? (
              <div className="rounded-3xl border border-warning/30 bg-warning/5 p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Icon name="exclamation-triangle" className="h-5 w-5 text-warning" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-fg">{PROTOCOL.safetyHeading}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {selected.narrative.notes}
                </p>
              </div>
            ) : null}

            {/* AI disclaimer */}
            <p className="rounded-2xl border border-edge bg-surface/50 p-4 text-xs text-fg-subtle">
              {PROTOCOL.disclaimer}
            </p>
          </div>
        ) : null}

        {/* Back link */}
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
          >
            <Icon name="arrow-left" className="h-4 w-4" aria-hidden="true" />
            {PROTOCOL.backToDashboard}
          </Link>
        </div>
      </section>
    </main>
  );
}
