import type { HeroContent, CtaBannerContent } from './types/sections';
import { P } from './pricing';

/** Shopify handle for the Pulse Sauna Sensor product. */
export const PRODUCT_HANDLE = 'pulse-sauna-sensor';

/* ── SEO ──────────────────────────────────────────────────── */

export const SEO = {
  title: 'Pulse Sauna Sensor \u2014 Upgrade Any Sauna | Yutori Labs',
  description:
    'A Bluetooth temperature and humidity sensor that turns any sauna into a measured, coach-guided practice with the Yutori app.',
  path: '/sauna-sensor',
};

/* ── Hero ─────────────────────────────────────────────────── */

export const HERO: HeroContent = {
  badge: 'Bluetooth sensor',
  title: 'Pulse Sauna Sensor',
  fallbackPrice: P.sensor,
  priceNote: 'one-time',
  description:
    'A RuuviTag Pro\u2013class Bluetooth sensor plus the Yutori app. Mount it in your existing sauna and get live temperature and humidity, automatic session logging, HR/HRV integration, and Live Coach guidance \u2014 no new heater or cabin required.',
  imagePlaceholder: 'Product imagery coming soon',
  ctaLabel: `Add to cart \u2014 ${P.sensor}`,
  ctaLoadingLabel: 'Adding to cart\u2026',
  ctaUnavailableLabel: 'Currently unavailable',
  ctaError: 'Unable to add to cart. Please try again.',
  ctaUnavailableHelp:
    'Checkout is temporarily unavailable. Refresh this page or contact support@yutorilabs.com.',
  depositNote: 'Ships directly \u00b7 No subscription required',
  quickStats: [
    { value: '185\u00b0F', label: 'Max temp' },
    { value: '\u00b10.2\u00b0C', label: 'Accuracy' },
    { value: 'IP67+', label: 'Protection' },
    { value: '1\u20132 yr', label: 'Battery' },
  ],
};

/* ── Compatibility ────────────────────────────────────────── */

export const COMPATIBILITY = {
  label: 'Compatibility',
  heading: 'Works with any sauna you already own.',
  description:
    'If the space gets hot and your phone can see Bluetooth, Pulse Sauna Sensor can instrument it.',
  cards: [
    {
      title: 'Traditional saunas',
      body: 'Electric, wood-fired, barrel, indoor, or outdoor. Any traditional sauna that heats to bench temperatures.',
    },
    {
      title: 'Infrared saunas',
      body: 'You still see temperature curves and timing at lower temps. Sensor reads ambient air, not IR panel output.',
    },
    {
      title: 'Wearable integration',
      body: 'Apple Watch via Apple Health for heart rate and HRV. Other wearables supported through health connectors.',
    },
  ],
};

/* ── What the App Does ────────────────────────────────────── */

export const APP_SECTION = {
  label: 'The Yutori App',
  heading: 'Sensors, coaching, and safety\u00a0\u2014 built\u00a0in.',
  description:
    'The sensor broadcasts temperature and humidity. The app reads your wearable for HR and HRV. Everything else follows from the data.',
  features: [
    {
      badge: 'Live',
      badgeColor: 'bg-accent text-accent-fg',
      title: 'Live Dashboard',
      body: 'Real-time temperature and relative humidity from the sensor at bench height, plus session timer, heart rate, and HRV from your wearable.',
    },
    {
      badge: 'Auto',
      badgeColor: 'bg-heat text-heat-fg',
      title: 'Automatic Logging',
      body: 'Every session is saved with duration, temperature curve, humidity trend, peak heart rate, and HRV change. Written into Apple Health as a workout.',
    },
    {
      badge: 'Coach',
      badgeColor: 'bg-surface-raised text-fg-muted',
      title: 'Live Coach',
      body: 'Builds a personal timing window from your last sessions, current temperature zone, and demographics. Simple states: \u201cbuilding up,\u201d \u201cin the zone,\u201d \u201ctime to wrap.\u201d',
    },
    {
      badge: 'Trends',
      badgeColor: 'bg-surface-raised text-fg-muted',
      title: 'Trends & Protocols',
      body: 'Aggregates 30\u201390 days into average durations, peak temps, HRV trends, and usage patterns. AI-generated insights and multi-week protocols.',
    },
  ],
  emergency: {
    title: 'Safety Net',
    body: 'Customizable alerts, session timers, and emergency contacts. If a session looks seriously wrong, the app escalates with louder alerts, notifies your contacts, and where supported, initiates an emergency call workflow.',
    disclaimer:
      'Depends on your phone, network, and configuration. This is a backup, not a medical monitor.',
  },
};

/* ── Humidity Cues ────────────────────────────────────────── */

export const HUMIDITY = {
  label: 'Smart Humidity',
  heading: 'Comfort cues from the data.',
  description:
    'Because the sensor measures humidity as well as temperature, the app can guide your session comfort.',
  cards: [
    {
      icon: 'beaker',
      iconLabel: 'Water droplet',
      title: 'Low Humidity Alert',
      body: 'When humidity is very low at a given temperature, the app gently suggests adding water to the rocks for softer, less harsh heat.',
      highlight: false,
    },
    {
      icon: 'sun',
      iconLabel: 'Thermometer',
      title: 'High Humidity Warning',
      body: 'When both humidity and temperature are high, it recommends shorter rounds and longer cool-downs since high humidity impairs evaporative cooling.',
      highlight: true,
    },
    {
      icon: 'sparkles',
      iconLabel: 'Snowflake',
      title: '\u201cSauna Ready\u201d Alerts',
      body: 'Set your preferred temperature and get notified when the room reaches it \u2014 not a generic number, your number.',
      highlight: false,
    },
  ],
};

/* ── Pricing ──────────────────────────────────────────────── */

export const PRICING = {
  label: 'Pricing',
  heading: `${P.sensor}, shipped.`,
  description:
    'One-time purchase. The free tier includes live temp, humidity, and basic session history. Premium coaching is optional.',
  cards: [
    {
      value: P.sensor,
      title: 'Sensor + App',
      body: 'Hardware sensor, live temperature and humidity, \u201csauna ready\u201d alerts, basic session history.',
      highlight: true,
    },
    {
      value: P.appMonthly,
      title: 'Yutori Premium',
      body: 'HR/HRV integration, Live Coach timing windows and guardrails, long-term trends, AI insights, protocols, and safety workflows.',
      highlight: false,
    },
  ],
  finePrint:
    `Premium is ${P.appMonthlyShort}/month or $39.99/year. Included with every Pulse Sauna purchase (lifetime Premium for that unit\u2019s owner).`,
};

/* ── Specs ─────────────────────────────────────────────────── */

export const SPECS_SECTION = {
  label: 'Specifications',
  heading: 'Full specs.',
};

export const SPECS: [string, string][] = [
  ['Product', 'Yutori Labs: Pulse Sauna Sensor'],
  ['Type', 'BLE environmental sensor + Yutori mobile app'],
  ['Measurements', 'Temperature, humidity, pressure, motion'],
  ['Temp range', '\u221240 to 85\u00a0\u00b0C (\u221240 to 185\u00a0\u00b0F), typical \u00b10.1\u20130.2\u00a0\u00b0C in 5\u201360\u00a0\u00b0C'],
  ['Humidity', '0\u201395% RH (non-condensing), typical \u00b12% in 20\u201380% RH'],
  ['Protection', 'IP67/IP68/IP69K polycarbonate enclosure'],
  ['Battery', 'CR2477T coin cell, user-replaceable, ~1\u20132 years typical'],
  ['Radio', 'BLE 5.0, ~5\u201320\u00a0m indoor range'],
  ['Platforms', 'iOS; Apple Health integration, others via connectors'],
  ['Placement', 'Bench height, away from direct heater exhaust'],
];

/* ── Safety ───────────────────────────────────────────────── */

export const SAFETY = {
  label: 'Important',
  heading: 'Safety & limitations.',
  description:
    'Pulse Sauna Sensor and the Yutori app are tools for awareness, not guarantees of safety.',
  disclaimers: [
    {
      title: 'Not a medical device',
      body: 'The sensor and app are not medical devices and do not diagnose, treat, cure, or prevent any disease. They should not replace medical advice or supervision.',
    },
    {
      title: 'Connectivity-dependent alerts',
      body: 'Emergency workflows depend on your phone, sensors, and network. If connectivity is poor, alerts may be delayed or unavailable. Do not rely on the system as your sole layer of safety.',
    },
    {
      title: 'User configuration required',
      body: 'You must configure emergency contacts and allow necessary permissions. Children and people with significant cardiovascular or neurological conditions should only use the sauna under direct supervision and medical guidance.',
    },
    {
      title: 'Heed your own limits',
      body: 'Live Coach guidance is conservative by design, but it is still an estimate. If you feel unwell, end the session immediately and seek help \u2014 regardless of what the app shows.',
    },
  ],
};

/* ── Bottom CTA ───────────────────────────────────────────── */

export const CTA: CtaBannerContent = {
  heading: 'Turn any sauna into a measured practice.',
  description:
    `${P.sensor}, one-time. Pair with the Yutori app for live data, coaching, and safety rails.`,
  primaryLabel: 'Add to cart',
  primaryLoadingLabel: 'Adding to cart\u2026',
  primaryUnavailableLabel: 'Currently unavailable',
  secondaryLabel: 'View all products',
};
