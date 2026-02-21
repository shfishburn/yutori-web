/* ── SEO ──────────────────────────────────────────────────── */

export const SEO = {
  title: 'Pulse Sensors \u2014 Upgrade Any Sauna or Cold Plunge | Yutori Labs',
  description:
    'Small Bluetooth sensors plus the Yutori app that upgrade any sauna or cold plunge you already own. Live temperature, coaching, and safety.',
  path: '/sensors',
};

/* ── Hero ─────────────────────────────────────────────────── */

export const HERO = {
  badge: 'Pulse Sensors',
  title: 'Instrument your rituals,\nnot just your step count.',
  description:
    'Pulse Sensors are small Bluetooth sensors plus the Yutori app that upgrade any sauna or cold plunge you already own. Pick sauna, plunge, or both \u2014 and get live temperature, automatic session logging, HR/HRV integration, coaching, and an emergency-aware safety layer.',
  cta: 'Explore sensors below',
};

/* ── How It Works ─────────────────────────────────────────── */

export const HOW_IT_WORKS = {
  label: 'How It Works',
  heading: 'Same hardware, same app \u2014 just pointed at heat, cold, or both.',
  steps: [
    {
      icon: '\ud83d\udce1',
      iconLabel: 'Sensor',
      title: 'Sensor in the environment',
      body: 'A RuuviTag Pro\u2013class sensor measures temperature (plus humidity for sauna) at the point your body actually experiences it.',
    },
    {
      icon: '\ud83d\udcf1',
      iconLabel: 'Phone',
      title: 'App on your phone + watch',
      body: 'Yutori reads sensor data over Bluetooth, pulls HR and HRV from Apple Health, and turns each heat or cold round into a structured session.',
    },
    {
      icon: '\ud83e\udde0',
      iconLabel: 'Brain',
      title: 'Coach in the background',
      body: 'Live Coach builds personal timing windows, watches heart-rate and temperature guardrails, and logs trends over weeks with optional protocols and emergency alerts.',
    },
  ],
};

/* ── Product Cards ────────────────────────────────────────── */

export const PRODUCTS_SECTION = {
  label: 'Choose Your Setup',
  heading: 'One sensor platform, three options.',
};

export const PRODUCT_CARDS = [
  {
    title: 'Pulse Sauna Sensor',
    price: '$60',
    audience: 'For people who already own a sauna.',
    bullets: [
      'Live bench-height temperature and humidity',
      '\u201cSauna ready\u201d alerts at your preferred temperature',
      'Auto logging, HR/HRV, Live Coach, and safety rails with Premium',
    ],
    href: '/sensors/sauna',
    accentColor: 'heat' as const,
  },
  {
    title: 'Pulse Plunge Sensor',
    price: '$60',
    audience: 'For any cold tub or plunge system.',
    bullets: [
      'Live water temperature to the degree',
      'Automatic plunge logging with duration and temp curve',
      'Live Coach for cold, cold-shock HR trends, and safety alerts with Premium',
    ],
    href: '/sensors/plunge',
    accentColor: 'accent' as const,
  },
  {
    title: 'Pulse Contrast Bundle',
    price: '$109',
    audience: 'For people running hot and cold.',
    bullets: [
      'Two sensors (one sauna, one plunge) under one account',
      'Contrast-aware tracking: alternating rounds as a single session',
      'Live Coach adjusts for where you are in the hot\u2013cold cycle',
    ],
    href: '/sensors/bundle',
    accentColor: 'heat' as const,
    savings: 'Save $11 vs. buying separately',
  },
];

/* ── Premium ──────────────────────────────────────────────── */

export const PREMIUM = {
  label: 'Yutori Premium',
  heading: 'One subscription for everything.',
  description:
    'Optional upgrade layer. Applies across all sensors on your account. Start with the free tier and upgrade when you\u2019re ready to train more deliberately.',
  price: '$4.99/mo or $39.99/yr',
  features: [
    'HR/HRV integration from wearables',
    'Live Coach timing windows and guardrails for sauna, plunge, and contrast',
    'Long-term trends (HRV, resting HR, tolerance, usage)',
    'AI-generated insights and multi-week protocols',
    'Safety workflows with emergency contact escalation',
  ],
};

/* ── Comparison Table ─────────────────────────────────────── */

export const COMPARISON = {
  label: 'Compare',
  heading: 'Quick comparison.',
  columns: ['Option', 'Hardware', 'Best for', 'Price'] as const,
  rows: [
    ['Pulse Sauna Sensor', '1\u00d7 sauna sensor', 'Existing sauna owners', '$60'],
    ['Pulse Plunge Sensor', '1\u00d7 plunge sensor', 'Any cold plunge / tub', '$60'],
    ['Pulse Contrast Bundle', '2\u00d7 sensors', 'Sauna + plunge, contrast sessions', '$109'],
  ],
};
