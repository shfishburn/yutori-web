import { createFileRoute, Link } from '@tanstack/react-router';
import { Icon } from '../components/Icon';
import {
  buildSeoHead,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
} from '../lib/seo';
import {
  SEO,
  HERO,
  PILLARS,
  PRODUCTS_SECTION,
  PRODUCTS,
  APP_SECTION,
  PHONE_MOCKUP,
  BENEFITS_SECTION,
  BENEFITS,
  CTA,
} from '../content/home';

export const Route = createFileRoute('/')({
  head: () =>
    buildSeoHead({
      title: SEO.title,
      description: SEO.description,
      path: SEO.path,
      imageWidth: DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
      imageType: DEFAULT_OG_IMAGE_TYPE,
    }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-canvas">
        <div className="pointer-events-none absolute -top-40 left-1/4 h-120 w-120 -translate-x-1/2 rounded-full bg-heat/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-40 right-1/4 h-120 w-120 translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center lg:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-4 py-1.5 text-xs font-medium text-fg-muted mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {HERO.badge}
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-fg sm:text-6xl lg:text-7xl">
            {HERO.titleLines[0]}<br />
            <span className="text-heat">{HERO.titleLines[1]}</span><br />
            <span className="text-accent">{HERO.titleLines[2]}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">
            {HERO.description}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/sauna"
              className="rounded-xl bg-accent px-7 py-3.5 font-semibold text-accent-fg transition-opacity hover:opacity-90"
            >
              {HERO.primaryCta}
            </Link>
            <a
              href="#app"
              className="rounded-xl border border-edge-strong bg-surface px-7 py-3.5 font-semibold text-fg transition-colors hover:bg-overlay"
            >
              {HERO.secondaryCta}
            </a>
          </div>
          <div className="mt-16 mx-auto grid max-w-lg grid-cols-3 divide-x divide-edge overflow-hidden rounded-2xl border border-edge bg-surface">
            {HERO.stats.map((s) => (
              <div key={s.label} className="py-5 px-3 sm:px-4">
                <div className="text-lg font-bold text-fg sm:text-xl">{s.value}</div>
                <div className="mt-0.5 text-xs text-fg-subtle leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <Link
                key={p.title}
                to={p.href}
                className={`group rounded-2xl border ${p.ringColor} p-7 transition-colors hover:border-edge-strong`}
              >
                <Icon name={p.icon} className="h-7 w-7" aria-label={p.iconLabel} />
                <h3 className={`mt-4 text-lg font-bold ${p.titleColor}`}>{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product lineup */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-fg-subtle">
            {PRODUCTS_SECTION.label}
          </p>
          <h2 className="text-3xl font-extrabold text-fg">{PRODUCTS_SECTION.heading}</h2>
          <p className="mx-auto mt-3 max-w-xl text-fg-muted">{PRODUCTS_SECTION.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <Link
              key={p.href}
              to={p.href}
              className="group flex flex-col rounded-2xl border border-edge bg-surface p-7 transition-all hover:border-edge-strong hover:bg-surface-raised"
            >
              <Icon name={p.icon} className="h-7 w-7" aria-label={p.iconLabel} />
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{p.subtitle}</p>
              <h3 className="mt-1 text-xl font-bold text-fg">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">{p.description}</p>
              <span className={`mt-6 text-sm font-semibold ${p.accentClass} transition-opacity group-hover:opacity-80`}>
                {p.ctaLabel}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* App section */}
      <section id="app" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">{APP_SECTION.label}</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-fg">
              Your sessions,<br />visualized.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-fg-muted">
              {APP_SECTION.description}
            </p>
            <ul className="mt-8 space-y-4">
              {APP_SECTION.features.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-fg-muted">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${f.dot}`} />
                  {f.text}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex gap-3">
              <span className="rounded-xl border border-edge bg-surface px-5 py-2.5 text-sm font-semibold text-fg-subtle">{APP_SECTION.appStoreLabel}</span>
              <span className="rounded-xl border border-edge bg-surface px-5 py-2.5 text-sm font-semibold text-fg-subtle">{APP_SECTION.playStoreLabel}</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-56 sm:w-64 rounded-[2.5rem] border-4 border-edge-strong bg-canvas p-4 shadow-2xl ring-1 ring-white/5">
              <div className="mb-4 flex items-center justify-between px-1 text-xs text-fg-subtle">
                <span>9:41</span><span>{'\u25cf\u25cf\u25cf'}</span>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <div className="text-xs text-fg-subtle">{PHONE_MOCKUP.sessionLabel}</div>
                <div className="mt-1 text-2xl font-bold text-heat">{PHONE_MOCKUP.sessionTemp}</div>
                <div className="mt-3 flex h-16 w-full items-end gap-1 rounded-lg bg-heat-subtle px-2 pb-2">
                  {PHONE_MOCKUP.chartBars.map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-sm bg-heat opacity-70" />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs text-fg-subtle">
                  <span>{PHONE_MOCKUP.sessionElapsed}</span>
                  <span className="text-heat">{'\u25cf'} {PHONE_MOCKUP.sessionLive}</span>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-surface p-4">
                <div className="text-xs text-fg-subtle">{PHONE_MOCKUP.coldLabel}</div>
                <div className="mt-1 text-2xl font-bold text-accent">{PHONE_MOCKUP.coldTemp}</div>
                <div className="mt-2 flex justify-between text-xs text-fg-subtle">
                  <span>{PHONE_MOCKUP.coldDuration}</span><span>{PHONE_MOCKUP.coldWhen}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface p-4">
                <div>
                  <div className="text-xs text-fg-subtle">{PHONE_MOCKUP.streakLabel}</div>
                  <div className="text-xl font-bold text-fg">{PHONE_MOCKUP.streakValue}</div>
                </div>
                <Icon name="fire" className="h-7 w-7 text-heat" aria-label="Fire streak" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{BENEFITS_SECTION.label}</p>
            <h2 className="text-3xl font-extrabold text-fg">{BENEFITS_SECTION.heading}</h2>
            <p className="mx-auto mt-3 max-w-xl text-fg-muted">{BENEFITS_SECTION.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.label} className="rounded-2xl border border-edge bg-canvas p-5">
                <Icon name={b.icon} className="h-6 w-6 text-fg-muted" aria-label={b.iconLabel} />
                <div className="mt-3 font-semibold text-fg">{b.label}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-edge bg-surface-raised p-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-heat/5 via-transparent to-accent/5" />
          <h2 className="relative text-3xl font-extrabold text-fg sm:text-4xl">{CTA.heading}</h2>
          <p className="relative mt-4 mx-auto max-w-xl text-fg-muted">{CTA.description}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={CTA.primaryLink.href}
              className="rounded-xl bg-accent px-8 py-3.5 font-semibold text-accent-fg transition-opacity hover:opacity-90"
            >
              {CTA.primaryLink.label}
            </Link>
            {CTA.secondaryLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="rounded-xl border border-edge bg-surface px-6 py-3 text-sm font-semibold text-fg transition-colors hover:bg-overlay"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
