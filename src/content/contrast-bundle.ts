import type { HeroContent, CtaBannerContent } from './types/sections';
import { P } from './pricing';

/** Shopify handle for the Pulse Contrast Bundle product. */
export const PRODUCT_HANDLE = 'pulse-contrast-bundle';

/* ── SEO ──────────────────────────────────────────────────── */

export const SEO = {
  title: 'Pulse Contrast Bundle \u2014 Sauna + Plunge Sensors | Yutori Labs',
  description:
    'Two Bluetooth sensors (one sauna, one plunge) plus the Yutori app. Track alternating hot and cold as a single contrast session with coaching and safety rails.',
  path: '/sensors/bundle',
};

/* ── Hero ─────────────────────────────────────────────────── */

export const HERO: HeroContent = {
  badge: 'Contrast bundle',
  title: 'Pulse Contrast Bundle',
  fallbackPrice: P.bundle,
  priceNote: `one-time \u00b7 save ${P.bundleSavings}`,
  description:
    'Two Bluetooth sensors \u2014 one for sauna, one for plunge \u2014 plus the Yutori app. Drop the plunge sensor in your cold tub, mount the sauna sensor at bench height, and track alternating hot and cold as a single contrast session with Live Coach guidance and an emergency-aware safety layer.',
  imagePlaceholder: 'Product imagery coming soon',
  ctaLabel: `Add to cart \u2014 ${P.bundle}`,
  ctaLoadingLabel: 'Adding to cart\u2026',
  ctaUnavailableLabel: 'Currently unavailable',
  ctaError: 'Unable to add to cart. Please try again.',
  ctaUnavailableHelp:
    'Checkout is temporarily unavailable. Refresh this page or contact support@yutorilabs.com.',
  depositNote: 'Ships directly \u00b7 No subscription required',
  quickStats: [
    { value: '2\u00d7', label: 'Sensors' },
    { value: P.bundleSavings, label: 'Savings' },
    { value: 'BLE 5.0', label: 'Radio' },
    { value: '1\u20132 yr', label: 'Battery each' },
  ],
};

/* ── What\u2019s Included ─────────────────────────────────────── */

export const WHATS_INCLUDED = {
  label: 'What\u2019s Included',
  heading: 'Everything for hot, cold, and the transition.',
  description:
    'The bundle ships two sensors identical to the individual Pulse Sauna and Plunge Sensors, paired under one account for contrast tracking.',
  cards: [
    {
      title: 'Pulse Sauna Sensor',
      body: 'Temperature + humidity at bench height. IP67+ polycarbonate enclosure rated to 120\u00a0\u00b0C. Mounts with included suction cup.',
    },
    {
      title: 'Pulse Plunge Sensor',
      body: 'Water temperature to \u00b10.1\u00a0\u00b0C. IP68 submersible enclosure. Drop it in or mount just below the waterline.',
    },
    {
      title: 'Yutori App',
      body: 'Both sensors connect to one account. Free tier includes live temp for each. Premium unlocks contrast session tracking, coaching, and trends.',
    },
  ],
};

/* ── Contrast Session ─────────────────────────────────────── */

export const CONTRAST_SESSION = {
  label: 'Contrast Sessions',
  heading: 'Hot and cold, tracked as one practice.',
  description:
    'The app detects when you move between sauna and plunge and stitches the rounds into a single session with timing, temperature curves, and biometric overlays.',
  features: [
    {
      badge: 'Auto',
      badgeColor: 'bg-heat text-heat-fg',
      title: 'Round Detection',
      body: 'The app detects transitions between heat and cold automatically \u2014 no manual tagging. Each round is logged with environment temperature and duration.',
    },
    {
      badge: 'Live',
      badgeColor: 'bg-accent text-accent-fg',
      title: 'Dual-Sensor Dashboard',
      body: 'See sauna and plunge temperatures simultaneously on one screen. Know exactly what you\u2019re walking into before each round.',
    },
    {
      badge: 'Coach',
      badgeColor: 'bg-surface-raised text-fg-muted',
      title: 'Contrast-Aware Coaching',
      body: 'Live Coach adjusts timing windows and commentary based on where you are in the hot\u2013cold cycle, your cumulative heat/cold exposure, and current biometrics.',
    },
    {
      badge: 'Trends',
      badgeColor: 'bg-surface-raised text-fg-muted',
      title: 'Contrast Trends',
      body: 'Total rounds per session, average round durations, HR/HRV across the hot\u2013cold transition, and adaptation over weeks.',
    },
  ],
  emergency: {
    title: 'Safety Across Both Environments',
    body: 'The same emergency workflows run in both sauna and plunge rounds. Heart-rate ceiling alerts, overexposure timers, and escalation to emergency contacts.',
    disclaimer:
      'Depends on your phone, sensors, and network. This is a backup layer, not a medical monitor or replacement for supervision.',
  },
};

/* ── Pricing ──────────────────────────────────────────────── */

export const PRICING = {
  label: 'Pricing',
  heading: `${P.bundle}, shipped.`,
  description:
    'One-time purchase for both sensors. The free tier includes live temperature from both sensors and basic session history. Premium coaching is optional.',
  cards: [
    {
      value: P.bundle,
      title: 'Contrast Bundle',
      body: 'Two sensors (sauna + plunge), live temperature for each, automatic contrast session logging, basic session history.',
      highlight: true,
    },
    {
      value: P.appMonthly,
      title: 'Yutori Premium',
      body: 'HR/HRV integration, Live Coach for sauna, plunge, and contrast, long-term trends, AI insights, protocols, and safety workflows.',
      highlight: false,
    },
  ],
  finePrint:
    `Premium is ${P.appMonthlyShort}/month or $39.99/year. Covers all sensors on your account. Individual sensors also available at ${P.sensor} each.`,
};

/* ── Specs ─────────────────────────────────────────────────── */

export const SPECS_SECTION = {
  label: 'Specifications',
  heading: 'Full specs.',
};

export const SPECS: [string, string][] = [
  ['Product', 'Yutori Labs: Pulse Contrast Bundle'],
  ['Contents', '1\u00d7 Sauna Sensor + 1\u00d7 Plunge Sensor + suction-cup mount'],
  ['Sauna sensor', 'Temperature + humidity, IP67+, \u221240 to 120\u00a0\u00b0C, suction-cup mount'],
  ['Plunge sensor', 'Water temperature \u00b10.1\u00a0\u00b0C, IP68 submersible, \u221240 to 85\u00a0\u00b0C'],
  ['Battery', 'CR2477 coin cell per sensor, user-replaceable, ~1\u20132 years each'],
  ['Radio', 'BLE 5.0, ~5\u201320\u00a0m indoor/outdoor range per sensor'],
  ['Platforms', 'iOS; Apple Health integration, others via connectors'],
  ['Contrast tracking', 'Automatic round detection when both sensors are paired'],
  ['Premium', `${P.appMonthlyOrAnnual} \u2014 covers all sensors on the account`],
];

/* ── Safety ───────────────────────────────────────────────── */

export const SAFETY = {
  label: 'Important',
  heading: 'Safety & limitations.',
  description:
    'The Pulse Contrast Bundle and the Yutori app are tools for awareness, not guarantees of safety.',
  disclaimers: [
    {
      title: 'Not a medical device',
      body: 'The sensors and app are not medical devices and do not diagnose, treat, cure, or prevent any disease. They should not replace medical advice or supervision.',
    },
    {
      title: 'Connectivity-dependent alerts',
      body: 'Emergency workflows depend on your phone, sensors, and network. If connectivity is poor, alerts may be delayed or unavailable.',
    },
    {
      title: 'Thermal stress risks',
      body: 'Alternating extreme heat and cold amplifies cardiovascular stress. Consult a physician before starting contrast therapy, especially if you have heart conditions, blood pressure concerns, or are pregnant.',
    },
    {
      title: 'Heed your own limits',
      body: 'If you feel dizziness, chest pain, numbness, confusion, or distress in either environment, stop immediately and seek help \u2014 regardless of what the app shows.',
    },
  ],
};

/* ── Bottom CTA ───────────────────────────────────────────── */

export const CTA: CtaBannerContent = {
  heading: 'One kit for hot and cold.',
  description:
    `${P.bundle}, one-time. Two sensors, one app, contrast session tracking from day one.`,
  primaryLabel: 'Add to cart',
  primaryLoadingLabel: 'Adding to cart\u2026',
  primaryUnavailableLabel: 'Currently unavailable',
  secondaryLabel: 'View all sensors',
};
