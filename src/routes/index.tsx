import { createFileRoute, Link } from '@tanstack/react-router';
import {
  buildSeoHead,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
} from '../lib/seo';

export const Route = createFileRoute('/')({
  head: () =>
    buildSeoHead({
      title: 'Yutori — Thermal Wellness, Measured',
      description:
        'Sensor-connected sauna and cold plunge hardware with an app that tracks temperature, HRV, and session history automatically.',
      path: '/',
      imageWidth: DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
      imageType: DEFAULT_OG_IMAGE_TYPE,
    }),
  component: HomePage,
});

const BENEFITS = [
  { icon: '⚡', iconLabel: 'Lightning bolt', label: 'Recovery', body: 'Heat stimulates HSP70 proteins that accelerate muscle repair between sessions.' },
  { icon: '😴', iconLabel: 'Sleeping face', label: 'Sleep', body: 'Post-sauna temperature drop primes your body for deep slow-wave sleep.' },
  { icon: '🧠', iconLabel: 'Brain', label: 'Mental clarity', body: 'Cold exposure spikes norepinephrine — the focus and mood neurotransmitter.' },
  { icon: '❤️', iconLabel: 'Heart', label: 'Cardiovascular', body: 'Regular heat sessions lower resting heart rate and improve arterial function.' },
  { icon: '🔥', iconLabel: 'Fire', label: 'Metabolism', body: 'Brown adipose activation from cold exposure increases caloric burn at rest.' },
  { icon: '🛡️', iconLabel: 'Shield', label: 'Immunity', body: 'Hyperthermia stimulates white blood cell production and immune response.' },
  { icon: '📉', iconLabel: 'Chart decreasing', label: 'Inflammation', body: 'Contrast therapy cycles reduce systemic inflammation markers (IL-6, CRP).' },
  { icon: '🧬', iconLabel: 'DNA', label: 'Longevity', body: 'Heat shock proteins and cold adaptation are linked to healthspan markers.' },
];

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
            Sensor-connected sauna &amp; cold plunge
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-fg sm:text-6xl lg:text-7xl">
            Track your heat.<br />
            <span className="text-heat">Time your sauna.</span><br />
            <span className="text-accent">Know your cold.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">
            Yutori pairs sauna and cold plunge hardware with sensors and an app that
            tells you exactly what happened — and when to go again. No guesswork. No manual logging.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="rounded-xl bg-accent px-7 py-3.5 font-semibold text-accent-fg transition-opacity hover:opacity-90"
            >
              Shop hardware
            </Link>
            <a
              href="#app"
              className="rounded-xl border border-edge-strong bg-surface px-7 py-3.5 font-semibold text-fg transition-colors hover:bg-overlay"
            >
              See the app
            </a>
          </div>
          <div className="mt-16 mx-auto grid max-w-lg grid-cols-3 divide-x divide-edge overflow-hidden rounded-2xl border border-edge bg-surface">
            {[
              { value: '50°F', label: 'avg cold plunge' },
              { value: '180°F', label: 'avg sauna temp' },
              { value: '30 min', label: 'avg session' },
            ].map((s) => (
              <div key={s.label} className="py-5 px-3 sm:px-4">
                <div className="text-lg font-bold text-fg sm:text-xl">{s.value}</div>
                <div className="mt-0.5 text-xs text-fg-subtle leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: '🔥',
                iconLabel: 'Fire',
                ringColor: 'border-heat-dim/40 bg-heat-subtle',
                titleColor: 'text-heat',
                title: 'Sauna',
                body: 'Precision-built heat chambers with embedded sensors that track temperature curves, session duration, and your physiological response.',
              },
              {
                icon: '🧊',
                iconLabel: 'Ice cube',
                ringColor: 'border-accent-dim/40 bg-accent-subtle',
                titleColor: 'text-accent',
                title: 'Cold Plunge',
                body: 'Chiller-powered plunge tubs that hold exact temperatures and sync with the app — so every cold exposure is recorded and repeatable.',
              },
              {
                icon: '📡',
                iconLabel: 'Satellite antenna',
                ringColor: 'border-edge bg-overlay',
                titleColor: 'text-fg-muted',
                title: 'Sensors',
                body: 'Bluetooth sensors install in minutes and stream ambient temperature, session start/end, and duration directly to the Yutori app.',
              },
            ].map((p) => (
              <div key={p.title} className={`rounded-2xl border ${p.ringColor} p-7`}>
                <div className="text-3xl" role="img" aria-label={p.iconLabel}>{p.icon}</div>
                <h3 className={`mt-4 text-lg font-bold ${p.titleColor}`}>{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App section */}
      <section id="app" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">The Yutori App</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-fg">
              Your sessions,<br />visualized.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-fg-muted">
              See your temperature curve, HRV response, and streak — all synced
              automatically from the sensor. No manual logging. No estimating.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { dot: 'bg-heat', text: 'Live session temperature graph' },
                { dot: 'bg-accent', text: 'Cold exposure depth and duration' },
                { dot: 'bg-fg-muted', text: 'Streak tracking and session history' },
                { dot: 'bg-fg-subtle', text: 'Safety alerts and exit guidance' },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-fg-muted">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${f.dot}`} />
                  {f.text}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex gap-3">
              <span className="rounded-xl border border-edge bg-surface px-5 py-2.5 text-sm font-semibold text-fg-subtle">App Store — coming soon</span>
              <span className="rounded-xl border border-edge bg-surface px-5 py-2.5 text-sm font-semibold text-fg-subtle">Google Play — coming soon</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-56 sm:w-64 rounded-[2.5rem] border-4 border-edge-strong bg-canvas p-4 shadow-2xl ring-1 ring-white/5">
              <div className="mb-4 flex items-center justify-between px-1 text-xs text-fg-subtle">
                <span>9:41</span><span>●●●</span>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <div className="text-xs text-fg-subtle">Active session</div>
                <div className="mt-1 text-2xl font-bold text-heat">174°F</div>
                <div className="mt-3 flex h-16 w-full items-end gap-1 rounded-lg bg-heat-subtle px-2 pb-2">
                  {[40,55,65,72,80,85,90,88,92,95,94,92].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-sm bg-heat opacity-70" />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs text-fg-subtle">
                  <span>18:30 elapsed</span>
                  <span className="text-heat">● Live</span>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-surface p-4">
                <div className="text-xs text-fg-subtle">Last cold plunge</div>
                <div className="mt-1 text-2xl font-bold text-accent">52°F</div>
                <div className="mt-2 flex justify-between text-xs text-fg-subtle">
                  <span>3 min 12 sec</span><span>Yesterday</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface p-4">
                <div>
                  <div className="text-xs text-fg-subtle">Current streak</div>
                  <div className="text-xl font-bold text-fg">12 days</div>
                </div>
                <div className="text-3xl" role="img" aria-label="Fire streak">🔥</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-fg-subtle">Why thermal therapy</p>
            <h2 className="text-3xl font-extrabold text-fg">8 proven benefits</h2>
            <p className="mx-auto mt-3 max-w-xl text-fg-muted">Decades of peer-reviewed research back the effects of heat and cold on the human body.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.label} className="rounded-2xl border border-edge bg-canvas p-5">
                <div className="text-2xl" role="img" aria-label={b.iconLabel}>{b.icon}</div>
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
          <h2 className="relative text-3xl font-extrabold text-fg sm:text-4xl">Start your first session today.</h2>
          <p className="relative mt-4 mx-auto max-w-xl text-fg-muted">Pick your hardware, pair the sensor, and let the app do the rest.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/products" className="rounded-xl bg-accent px-8 py-3.5 font-semibold text-accent-fg transition-opacity hover:opacity-90">Shop hardware</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
