import type { HeroContent, CtaBannerContent } from './types/sections';
import { P } from './pricing';

/** Shopify handle for the Pulse Plunge Sensor product. */
export const PRODUCT_HANDLE = 'pulse-plunge-sensor';

/* ── SEO ──────────────────────────────────────────────────── */

export const SEO = {
  title: 'Pulse Plunge Sensor \u2014 Precise Cold Exposure | Yutori Labs',
  description:
    'A Bluetooth water temperature sensor that turns any cold plunge into a precise, coach-guided cold-exposure practice with the Yutori app.',
  path: '/plunge-sensor',
};

/* ── Hero ─────────────────────────────────────────────────── */

export const HERO: HeroContent = {
  badge: 'Cold plunge sensor',
  title: 'Pulse Plunge Sensor',
  fallbackPrice: P.sensor,
  priceNote: 'one-time',
  description:
    'A compact Bluetooth temperature sensor plus the Yutori app. Drop it into your existing cold tub or mount it just below the waterline and get accurate water temperature, automatic session logging, and Live Coach guidance \u2014 no chiller or hardware changes required.',
  imagePlaceholder: 'Product imagery coming soon',
  ctaLabel: `Add to cart \u2014 ${P.sensor}`,
  ctaLoadingLabel: 'Adding to cart\u2026',
  ctaUnavailableLabel: 'Currently unavailable',
  ctaError: 'Unable to add to cart. Please try again.',
  ctaUnavailableHelp:
    'Checkout is temporarily unavailable. Refresh this page or contact support@yutorilabs.com.',
  depositNote: 'Ships directly \u00b7 No subscription required',
  quickStats: [
    { value: '\u00b10.1\u00b0C', label: 'Accuracy' },
    { value: 'IP68', label: 'Submersible' },
    { value: 'BLE 5.0', label: 'Radio' },
    { value: '1\u20132 yr', label: 'Battery' },
  ],
};

/* ── Compatibility ────────────────────────────────────────── */

export const COMPATIBILITY = {
  label: 'Compatibility',
  heading: 'Works with any cold plunge.',
  description:
    'If it holds water and you can reach it with your phone, Pulse Plunge Sensor can instrument it.',
  cards: [
    {
      title: 'Stock tanks & chest freezers',
      body: 'Galvanized, plastic, or converted chest-freezer tubs. Any DIY cold plunge setup.',
    },
    {
      title: 'Purpose-built plunges',
      body: 'Commercial cold plunge systems from any brand. The sensor simply sits in the water.',
    },
    {
      title: 'Indoor or outdoor',
      body: 'IP68 submersible enclosure handles cold water and splashes easily. \u221240 to 85\u00a0\u00b0C operating range.',
    },
  ],
};

/* ── What the App Does ────────────────────────────────────── */

export const APP_SECTION = {
  label: 'The Yutori App',
  heading: 'Know exactly how cold you\u2019re training.',
  description:
    'The sensor gives you the number. The app gives you the context, coaching, and safety layer.',
  features: [
    {
      badge: 'Live',
      badgeColor: 'bg-accent text-accent-fg',
      title: 'Live Water Temperature',
      body: 'Real-time water temperature displayed on your phone. Clear indication of your usual training range vs today\u2019s actual temperature \u2014 so \u201c45\u00a0\u00b0F plunge\u201d is a number, not a guess.',
    },
    {
      badge: 'Auto',
      badgeColor: 'bg-accent text-accent-fg',
      title: 'Automatic Logging',
      body: 'Every plunge is logged with duration, start/end water temperature, temperature curve, peak heart rate, and HRV change. Written into Apple Health as a workout.',
    },
    {
      badge: 'Coach',
      badgeColor: 'bg-surface-raised text-fg-muted',
      title: 'Live Coach for Cold',
      body: 'Estimates a safe time window using your history, current water temp zone, and demographics. Monitors HR ceiling, dangerous cold zones, and max durations.',
    },
    {
      badge: 'Contrast',
      badgeColor: 'bg-surface-raised text-fg-muted',
      title: 'Contrast Session Tracking',
      body: 'Used with a sauna sensor, it tracks alternating hot and cold as a single practice. Live Coach adjusts commentary for where you are in the hot\u2013cold cycle.',
    },
  ],
  emergency: {
    title: 'Safety Net for Cold',
    body: 'Customizable session timers and prompts (\u201ctake your hands out,\u201d \u201ctime to come up\u201d). Emergency contacts stored on your device. If a plunge appears to go seriously wrong, the app escalates with stronger alerts and notifications.',
    disclaimer:
      'Depends on your phone, sensors, and network. This is a backup layer, not a medical monitor or replacement for supervision.',
  },
};

/* ── Cold Trends ──────────────────────────────────────────── */

export const TRENDS = {
  label: 'Cold Adaptation',
  heading: 'Watch your relationship with cold change.',
  description:
    'Over weeks, the same data becomes a picture of your cold adaptation.',
  cards: [
    {
      icon: 'trending-up',
      iconLabel: 'Chart',
      title: 'Duration Trends',
      body: 'Average cold plunge duration and typical water temps, tracked over weeks and months.',
      highlight: false,
    },
    {
      icon: 'heart',
      iconLabel: 'Heart',
      title: 'Cold-Shock HR',
      body: 'Peak heart rate in early vs later sessions. See your autonomic adaptation in real numbers.',
      highlight: true,
    },
    {
      icon: 'sparkles',
      iconLabel: 'Snowflake',
      title: 'Tolerance Tracking',
      body: 'How long you can stay in a given temperature band comfortably, tracked and trended over time.',
      highlight: false,
    },
  ],
};

/* ── Pricing ──────────────────────────────────────────────── */

export const PRICING = {
  label: 'Pricing',
  heading: `${P.sensor}, shipped.`,
  description:
    'One-time purchase. The free tier includes live water temperature and basic session history. Premium coaching is optional.',
  cards: [
    {
      value: P.sensor,
      title: 'Sensor + App',
      body: 'Hardware sensor, live water temperature, automatic plunge logging, basic session history.',
      highlight: true,
    },
    {
      value: P.appMonthly,
      title: 'Yutori Premium',
      body: 'HR/HRV integration, Live Coach for cold exposure, long-term trends, AI insights, cold and contrast protocols, and safety workflows.',
      highlight: false,
    },
  ],
  finePrint:
    `Premium is ${P.appMonthlyShort}/month or $39.99/year. Sauna + plunge setups can run two sensors under the same account for contrast session tracking.`,
};

/* ── Specs ─────────────────────────────────────────────────── */

export const SPECS_SECTION = {
  label: 'Specifications',
  heading: 'Full specs.',
};

export const SPECS: [string, string][] = [
  ['Product', 'Yutori Labs: Pulse Plunge Sensor'],
  ['Type', 'BLE water temperature sensor + Yutori mobile app'],
  ['Measurement', 'Water temperature (TMP117-class), motion available'],
  ['Temp range', '\u221240 to 85\u00a0\u00b0C (\u221240 to 185\u00a0\u00b0F), typical \u00b10.1\u20130.2\u00a0\u00b0C in 0\u201325\u00a0\u00b0C'],
  ['Protection', 'IP68/IP69K polycarbonate enclosure, submersible'],
  ['Battery', 'CR2477T coin cell, user-replaceable, ~1\u20132 years typical'],
  ['Radio', 'BLE 5.0, ~5\u201320\u00a0m indoor/outdoor range'],
  ['Platforms', 'iOS; Apple Health integration, others via connectors'],
  ['Placement', 'Just below the waterline, away from direct chiller inlets'],
  ['Cross-use', 'Integrates with sauna sensor for contrast session tracking'],
];

/* ── Safety ───────────────────────────────────────────────── */

export const SAFETY = {
  label: 'Important',
  heading: 'Safety & limitations.',
  description:
    'Pulse Plunge Sensor and the Yutori app are tools for awareness, not guarantees of safety.',
  disclaimers: [
    {
      title: 'Not a medical device',
      body: 'The sensor and app are not medical devices and do not diagnose, treat, cure, or prevent any disease. They should not replace medical advice or supervision.',
    },
    {
      title: 'Connectivity-dependent alerts',
      body: 'Emergency workflows depend on your phone, sensors, and network. If connectivity is poor, alerts may be delayed or unavailable.',
    },
    {
      title: 'Hypothermia risk',
      body: 'Cold water exposure carries real risk. Never plunge alone without a safety plan. The app\u2019s timers and guardrails are estimates, not substitutes for judgment.',
    },
    {
      title: 'Heed your own limits',
      body: 'If you feel numbness, confusion, or distress, exit the water immediately and seek help \u2014 regardless of what the app shows.',
    },
  ],
};

/* ── Bottom CTA ───────────────────────────────────────────── */

export const CTA: CtaBannerContent = {
  heading: 'Know your cold. Train your cold.',
  description:
    `${P.sensor}, one-time. Pair with the Yutori app for precise temperature, coaching, and safety rails.`,
  primaryLabel: 'Add to cart',
  primaryLoadingLabel: 'Adding to cart\u2026',
  primaryUnavailableLabel: 'Currently unavailable',
  secondaryLabel: 'View all products',
};
