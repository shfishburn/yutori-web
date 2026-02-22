import { createFileRoute, Link } from '@tanstack/react-router';
import { buildSeoHead } from '../lib/seo';
import { Icon } from '../components/Icon';
import {
  SEO,
  HERO,
  HOW_IT_WORKS,
  PRODUCTS_SECTION,
  PRODUCT_CARDS,
  PREMIUM,
  COMPARISON,
} from '../content/sensors';

export const Route = createFileRoute('/sensors/')({
  head: () =>
    buildSeoHead({
      title: SEO.title,
      description: SEO.description,
      path: SEO.path,
    }),
  component: SensorsLandingPage,
});

function SensorsLandingPage() {
  return (
    <main className="flex-1">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-canvas">
        <div className="pointer-events-none absolute -top-40 left-1/4 h-120 w-120 -translate-x-1/2 rounded-full bg-heat/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-40 right-1/4 h-120 w-120 translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 lg:pt-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-4 py-1.5 text-xs font-medium text-fg-muted mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-heat" />
            {HERO.badge}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-fg sm:text-5xl lg:text-6xl whitespace-pre-line">
            {HERO.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">
            {HERO.description}
          </p>
          <a
            href="#choose"
            className="mt-8 inline-block rounded-xl border border-edge-strong bg-surface px-7 py-3.5 font-semibold text-fg transition-colors hover:bg-overlay"
          >
            {HERO.cta}
          </a>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">
            {HOW_IT_WORKS.label}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            {HOW_IT_WORKS.heading}
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-edge bg-canvas p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                    <Icon name={s.icon} className="h-5 w-5 text-fg-muted" aria-label={s.iconLabel} />
                  </span>
                  <span className="text-xs font-bold text-fg-subtle uppercase tracking-wider">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-fg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Choose Your Setup ──────────────────────────────── */}
      <section id="choose" className="scroll-mt-20 mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-heat">
          {PRODUCTS_SECTION.label}
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {PRODUCTS_SECTION.heading}
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRODUCT_CARDS.map((card) => {
            const isAccent = card.accentColor === 'accent';
            const borderColor = isAccent ? 'border-accent-dim/40' : 'border-heat-dim/40';
            const priceColor = isAccent ? 'text-accent' : 'text-heat';
            const btnBg = isAccent ? 'bg-accent' : 'bg-heat';
            const btnText = isAccent ? 'text-accent-fg' : 'text-heat-fg';
            const dotColor = isAccent ? 'bg-accent' : 'bg-heat';

            return (
              <div
                key={card.title}
                className={`flex flex-col rounded-2xl border ${borderColor} bg-surface p-7`}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-bold text-fg">{card.title}</h3>
                  <span className={`text-2xl font-bold ${priceColor}`}>{card.price}</span>
                </div>
                <p className="mt-2 text-sm text-fg-muted">{card.audience}</p>
                {'savings' in card && card.savings && (
                  <p className={`mt-1 text-xs font-semibold ${priceColor}`}>{card.savings}</p>
                )}
                <ul className="mt-5 flex-1 space-y-2">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-fg-muted">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to={card.href}
                  className={`mt-6 block w-full rounded-xl ${btnBg} px-4 py-3 text-center text-sm font-semibold ${btnText} transition-opacity hover:opacity-90`}
                >
                  Learn more
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Premium ────────────────────────────────────────── */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
                {PREMIUM.label}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
                {PREMIUM.heading}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-fg-muted">
                {PREMIUM.description}
              </p>
              <ul className="mt-8 space-y-3">
                {PREMIUM.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-fg-muted">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="rounded-2xl border border-accent-dim/40 bg-accent-subtle p-10 text-center">
                <p className="text-sm font-semibold text-accent uppercase tracking-wider">Premium</p>
                <p className="mt-3 text-3xl font-extrabold text-fg">{PREMIUM.price}</p>
                <p className="mt-2 text-sm text-fg-muted">Applies across all sensors on your account</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ───────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">
          {COMPARISON.label}
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {COMPARISON.heading}
        </h2>
        <div className="mt-12 overflow-hidden rounded-2xl border border-edge">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface">
                {COMPARISON.columns.map((col) => (
                  <th key={col} className="px-6 py-4 text-left font-semibold text-fg">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.rows.map((row, i) => (
                <tr key={row[0]} className={i % 2 === 0 ? 'bg-canvas' : 'bg-surface'}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-6 py-4 ${j === 0 ? 'font-medium text-fg' : 'text-fg-muted'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-edge bg-surface-raised p-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-heat/5 via-transparent to-accent/5" />
          <h2 className="relative text-3xl font-extrabold text-fg sm:text-4xl">
            Start measuring what matters.
          </h2>
          <p className="relative mt-4 mx-auto max-w-xl text-fg-muted">
            From $60. No subscription required for basic features. Ships directly.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#choose"
              className="rounded-xl bg-heat px-8 py-3.5 font-semibold text-heat-fg transition-opacity hover:opacity-90"
            >
              Choose your sensor
            </a>
            <Link
              to="/sauna"
              className="rounded-xl border border-edge-strong bg-surface px-8 py-3.5 font-semibold text-fg transition-colors hover:bg-overlay"
            >
              Explore Pulse Sauna
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
