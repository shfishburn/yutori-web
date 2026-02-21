/* ── SEO ──────────────────────────────────────────────────── */

export const SEO = {
  title: 'Yutori \u2014 Thermal Wellness, Measured',
  description:
    'Sensor-connected sauna and cold plunge hardware with an app that tracks temperature, HRV, and session history automatically.',
  path: '/',
};

/* ── Hero ─────────────────────────────────────────────────── */

export const HERO = {
  badge: 'Sensor-connected sauna & cold plunge',
  titleLines: [
    'Track your heat.',
    'Time your sauna.',
    'Know your cold.',
  ],
  description:
    'Yutori pairs sauna and cold plunge hardware with sensors and an app that tells you exactly what happened \u2014 and when to go again. No guesswork. No manual logging.',
  primaryCta: 'Shop hardware',
  secondaryCta: 'See the app',
  stats: [
    { value: '50\u00b0F', label: 'avg cold plunge' },
    { value: '180\u00b0F', label: 'avg sauna temp' },
    { value: '30 min', label: 'avg session' },
  ],
};

/* ── Three pillars ────────────────────────────────────────── */

export const PILLARS = [
  {
    icon: '\ud83d\udd25',
    iconLabel: 'Fire',
    ringColor: 'border-heat-dim/40 bg-heat-subtle',
    titleColor: 'text-heat',
    title: 'Sauna',
    body: 'Precision-built heat chambers with embedded sensors that track temperature curves, session duration, and your physiological response.',
  },
  {
    icon: '\ud83e\uddca',
    iconLabel: 'Ice cube',
    ringColor: 'border-accent-dim/40 bg-accent-subtle',
    titleColor: 'text-accent',
    title: 'Cold Plunge',
    body: 'Chiller-powered plunge tubs that hold exact temperatures and sync with the app \u2014 so every cold exposure is recorded and repeatable.',
  },
  {
    icon: '\ud83d\udce1',
    iconLabel: 'Satellite antenna',
    ringColor: 'border-edge bg-overlay',
    titleColor: 'text-fg-muted',
    title: 'Sensors',
    body: 'Bluetooth sensors install in minutes and stream ambient temperature, session start/end, and duration directly to the Yutori app.',
  },
];

/* ── App section ──────────────────────────────────────────── */

export const APP_SECTION = {
  label: 'The Yutori App',
  heading: 'Your sessions,\nvisualized.',
  description:
    'See your temperature curve, HRV response, and streak \u2014 all synced automatically from the sensor. No manual logging. No estimating.',
  features: [
    { dot: 'bg-heat', text: 'Live session temperature graph' },
    { dot: 'bg-accent', text: 'Cold exposure depth and duration' },
    { dot: 'bg-fg-muted', text: 'Streak tracking and session history' },
    { dot: 'bg-fg-subtle', text: 'Safety alerts and exit guidance' },
  ],
  appStoreLabel: 'App Store \u2014 coming soon',
  playStoreLabel: 'Google Play \u2014 coming soon',
};

/* ── Phone mockup ─────────────────────────────────────────── */

export const PHONE_MOCKUP = {
  sessionLabel: 'Active session',
  sessionTemp: '174\u00b0F',
  sessionElapsed: '18:30 elapsed',
  sessionLive: 'Live',
  /** Bar chart heights (percent) for the temperature graph mockup. */
  chartBars: [40, 55, 65, 72, 80, 85, 90, 88, 92, 95, 94, 92],
  coldLabel: 'Last cold plunge',
  coldTemp: '52\u00b0F',
  coldDuration: '3 min 12 sec',
  coldWhen: 'Yesterday',
  streakLabel: 'Current streak',
  streakValue: '12 days',
};

/* ── Benefits ─────────────────────────────────────────────── */

export const BENEFITS_SECTION = {
  label: 'Why thermal therapy',
  heading: '8 proven benefits',
  description:
    'Decades of peer-reviewed research back the effects of heat and cold on the human body.',
};

export const BENEFITS = [
  { icon: '\u26a1', iconLabel: 'Lightning bolt', label: 'Recovery', body: 'Heat stimulates HSP70 proteins that accelerate muscle repair between sessions.' },
  { icon: '\ud83d\ude34', iconLabel: 'Sleeping face', label: 'Sleep', body: 'Post-sauna temperature drop primes your body for deep slow-wave sleep.' },
  { icon: '\ud83e\udde0', iconLabel: 'Brain', label: 'Mental clarity', body: 'Cold exposure spikes norepinephrine \u2014 the focus and mood neurotransmitter.' },
  { icon: '\u2764\ufe0f', iconLabel: 'Heart', label: 'Cardiovascular', body: 'Regular heat sessions lower resting heart rate and improve arterial function.' },
  { icon: '\ud83d\udd25', iconLabel: 'Fire', label: 'Metabolism', body: 'Brown adipose activation from cold exposure increases caloric burn at rest.' },
  { icon: '\ud83d\udee1\ufe0f', iconLabel: 'Shield', label: 'Immunity', body: 'Hyperthermia stimulates white blood cell production and immune response.' },
  { icon: '\ud83d\udcc9', iconLabel: 'Chart decreasing', label: 'Inflammation', body: 'Contrast therapy cycles reduce systemic inflammation markers (IL-6, CRP).' },
  { icon: '\ud83e\uddec', iconLabel: 'DNA', label: 'Longevity', body: 'Heat shock proteins and cold adaptation are linked to healthspan markers.' },
];

/* ── Bottom CTA ───────────────────────────────────────────── */

export const CTA = {
  heading: 'Start your first session today.',
  description: 'Pick your hardware, pair the sensor, and let the app do the rest.',
  ctaLabel: 'Shop hardware',
};
