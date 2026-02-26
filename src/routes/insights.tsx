import { useEffect, useState } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Icon } from '../components/Icon';
import { useAuth } from '../lib/auth';
import { buildSeoHead } from '../lib/seo';
import { getLatestAnalysis, type CoachAnalysisResponse, type CoachInsight } from '../server/coach';
import { INSIGHTS } from '../content/insights';

export const Route = createFileRoute('/insights')({
  head: () =>
    buildSeoHead({
      title: INSIGHTS.seo.title,
      description: INSIGHTS.seo.description,
      path: INSIGHTS.seo.path,
    }),
  component: InsightsPage,
});

/* ── Sentiment helpers ─────────────────────────────────────────── */

function sentimentIcon(sentiment: CoachInsight['sentiment']): string {
  switch (sentiment) {
    case 'positive':
      return 'trending-up';
    case 'negative':
      return 'trending-down';
    default:
      return 'minus';
  }
}

function sentimentAccent(sentiment: CoachInsight['sentiment']): {
  icon: string;
  border: string;
  bg: string;
} {
  switch (sentiment) {
    case 'positive':
      return { icon: 'text-success', border: 'border-success/20', bg: 'bg-success/5' };
    case 'negative':
      return { icon: 'text-danger', border: 'border-danger/20', bg: 'bg-danger/5' };
    default:
      return { icon: 'text-fg-muted', border: 'border-edge', bg: 'bg-surface' };
  }
}

/* ── Insight Card ──────────────────────────────────────────────── */

function InsightCard({ insight }: { insight: CoachInsight }) {
  const accent = sentimentAccent(insight.sentiment);

  return (
    <div className={`flex gap-4 rounded-2xl border p-5 ${accent.border} ${accent.bg}`}>
      <div className="shrink-0 pt-0.5">
        <Icon
          name={sentimentIcon(insight.sentiment)}
          className={`h-5 w-5 ${accent.icon}`}
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-fg">{insight.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{insight.body}</p>
        {insight.metric ? (
          <span className="mt-3 inline-block rounded-lg bg-canvas px-2.5 py-1 text-xs font-semibold text-fg-subtle">
            {insight.metric}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

function InsightsPage() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<CoachAnalysisResponse | null>(null);
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

    getLatestAnalysis({ data: { accessToken: session.accessToken } })
      .then((data) => {
        if (active) setAnalysis(data);
      })
      .catch(() => {
        if (active) setError(INSIGHTS.error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session?.accessToken, user]);

  if (authLoading || (!user && !error)) {
    return (
      <main className="flex-1 bg-canvas">
        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-lg bg-surface" />
            <div className="h-4 w-64 rounded bg-surface" />
            <div className="h-32 rounded-2xl bg-surface" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-canvas">
      <section className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <h1 className="text-3xl font-bold text-fg">{INSIGHTS.heading}</h1>
        <p className="mt-2 text-sm text-fg-muted">{INSIGHTS.subtitle}</p>

        {/* Loading */}
        {loading ? (
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-32 rounded-3xl bg-surface" />
            <div className="h-28 rounded-2xl bg-surface" />
            <div className="h-28 rounded-2xl bg-surface" />
            <div className="h-24 rounded-3xl bg-surface" />
          </div>
        ) : error ? (
          /* Error */
          <div className="mt-8 rounded-2xl border border-danger/30 bg-danger/10 p-6">
            <p className="text-sm font-medium text-danger">{error}</p>
          </div>
        ) : !analysis ? (
          /* Empty state */
          <div className="mt-8 rounded-3xl border border-edge bg-surface p-8 text-center">
            <Icon name="sparkles" className="mx-auto h-10 w-10 text-fg-subtle" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-fg">{INSIGHTS.emptyHeading}</h2>
            <p className="mt-2 text-sm text-fg-muted">{INSIGHTS.emptyBody}</p>
          </div>
        ) : (
          /* Analysis content */
          <div className="mt-8 space-y-5">
            {/* Generated date */}
            <p className="text-xs font-medium text-fg-subtle">
              Generated {new Date(analysis.generatedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>

            {/* Summary */}
            <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Icon name="sparkles" className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="text-lg font-bold text-fg">{INSIGHTS.summaryHeading}</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{analysis.summary}</p>
            </div>

            {/* Insights — single column */}
            {analysis.insights.length > 0 ? (
              <div>
                <h2 className="mb-4 text-lg font-bold text-fg">{INSIGHTS.insightsHeading}</h2>
                <div className="space-y-3">
                  {analysis.insights.map((insight, i) => (
                    <InsightCard key={i} insight={insight} />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Pattern */}
            {analysis.pattern ? (
              <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Icon name="magnifying-glass" className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-fg">{INSIGHTS.patternHeading}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{analysis.pattern}</p>
              </div>
            ) : null}

            {/* Suggestion */}
            {analysis.suggestion ? (
              <div className="rounded-3xl border border-heat/30 bg-heat/5 p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Icon name="light-bulb" className="h-5 w-5 text-heat" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-fg">{INSIGHTS.suggestionHeading}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{analysis.suggestion}</p>
              </div>
            ) : null}

            {/* AI disclaimer */}
            <p className="rounded-2xl border border-edge bg-surface/50 p-4 text-xs text-fg-subtle">
              {INSIGHTS.disclaimer}
            </p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
          >
            <Icon name="arrow-left" className="h-4 w-4" aria-hidden="true" />
            {INSIGHTS.backToDashboard}
          </Link>
        </div>
      </section>
    </main>
  );
}
