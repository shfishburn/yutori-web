import { P } from './pricing';

/** Shopify handle for the Pulse Plunge product. */
export const PRODUCT_HANDLE = 'pulse-plunge';

/* ── SEO ──────────────────────────────────────────────────── */

export const SEO = {
  title: 'Pulse Plunge \u2014 Asnaro Cold Tub by Yutori Labs',
  description:
    'A hand-crafted asnaro cold tub with live water-temperature tracking, structured timing, and trend analysis through the Yutori app\u2014no chiller, no complexity.',
  path: '/plunge',
};

/* ── Hero ─────────────────────────────────────────────────── */

export const HERO = {
  badge: 'Japanese cold tub',
  title: 'Pulse Plunge',
  fallbackPrice: P.plunge,
  priceNote: 'plus freight',
  description:
    'A hand-crafted asnaro cold tub that turns deliberate cold exposure into a calm, measurable practice\u00a0\u2014 with live water-temperature tracking, structured timing, and trend analysis through the Yutori app.',
  imagePlaceholder: 'Product imagery coming soon',
  ctaLabel: `Add deposit to cart \u2014 ${P.plungeDeposit}`,
  ctaLoadingLabel: 'Adding to cart\u2026',
  ctaUnavailableLabel: 'Add to cart unavailable',
  ctaError: 'Unable to add the deposit to your cart. Please try again.',
  ctaUnavailableHelp:
    'Checkout is temporarily unavailable. Refresh this page or contact support@yutorilabs.com.',
  depositNote: '20% non-refundable deposit \u00b7 12-week lead time',
  quickStats: [
    { value: '56\u2033\u00d730\u2033', label: 'Exterior' },
    { value: 'Asnaro', label: 'Hiba wood' },
    { value: 'IP68', label: 'Sensor rated' },
    { value: '1', label: 'User' },
  ],
};

/* ── The Tub ─────────────────────────────────────────────── */

export const THE_TUB = {
  label: 'The Tub',
  heading: 'Asnaro: built to live outdoors.',
  description:
    'A deep, single-person Japanese ofuro, hand-built in asnaro (Hiba) and designed specifically for outdoor cold-water use. Asnaro\u2019s tight grain and natural resins make it more resistant to rot and checking than soft hinoki.',
  cards: [
    {
      title: 'Outdoor-ready durability',
      body: 'Asnaro has higher natural resistance to decay, insects, and long-term water exposure than soft hinoki, making it better suited for frequent filling and draining outside.',
    },
    {
      title: 'Warm, understated look',
      body: 'Pale golden wood that harmonizes with your clear-cedar Pulse Sauna without trying to match every board.',
    },
    {
      title: 'Traditional construction',
      body: 'Thick asnaro staves, stainless/brass hardware where needed, smooth interior surfaces, and simple, rectilinear lines that feel timeless.',
    },
  ],
};

/* ── Why No Chiller ──────────────────────────────────────── */

export const NO_CHILLER = {
  label: 'Design Philosophy',
  heading: 'Why no chiller?',
  description:
    'Pulse Plunge is intentionally passive: a hand-built asnaro tub plus a sensor and app, not a noisy machine.',
  cards: [
    {
      icon: 'sparkles',
      iconLabel: 'Sparkle',
      title: 'Less complexity, more reliability',
      body: 'Chillers add pumps, fans, compressor noise, plumbing, and new failure points. A passive tub means quieter operation and fewer things to maintain or repair.',
      highlight: false,
    },
    {
      icon: 'sun',
      iconLabel: 'Thermometer',
      title: '\u201cCold enough\u201d for adaptation',
      body: 'Most people experience strong responses in the 45\u201360\u00a0\u00b0F range. With shade, overnight cooling, and occasional ice, this is achievable without mechanical chilling.',
      highlight: true,
    },
    {
      icon: 'building-library',
      iconLabel: 'Lantern',
      title: 'Traditional ofuro philosophy',
      body: 'Japanese ofuro are treated as a ritual rather than a precisely controlled system. We preserve that simplicity: a tub you fill, cool naturally, and step into.',
      highlight: false,
    },
    {
      icon: 'wrench',
      iconLabel: 'Wrench',
      title: 'Future flexibility',
      body: 'Your chiller options and your tub are decoupled. Add any third-party chiller later and use Pulse Plunge as the vessel; the sensor and app will still track actual water temperature.',
      highlight: false,
    },
  ],
};

/* ── Water Care ──────────────────────────────────────────── */

export const WATER_CARE = {
  label: 'Water Management',
  heading: 'Practical water guidance.',
  description:
    'Without integrated filtration or chilling, treat Pulse Plunge like a high-end soaking tub, not a permanent pool. Short, regular water changes are the safer default for a cold, outdoor tub.',
  cards: [
    {
      icon: 'beaker',
      iconLabel: 'Water drop',
      title: 'Regular water changes',
      body: 'Daily use (1\u20132 people): change every 2\u20134 days. Heavy use: daily or every other day. Watch for cloudiness, odor, or surface film.',
      highlight: false,
    },
    {
      icon: 'cloud',
      iconLabel: 'Shower',
      title: 'Pre-shower rule',
      body: 'Rinse off first to keep sweat, skin oils, and sunscreen out. Standard practice in Japan and makes a noticeable difference in water clarity.',
      highlight: false,
    },
    {
      icon: 'globe',
      iconLabel: 'Leaf',
      title: 'Shade and cover',
      body: 'Use a fitted wooden or insulated cover when not in use. Reduces UV-driven algae growth, organic debris, and temperature swings.',
      highlight: false,
    },
    {
      icon: 'sparkles',
      iconLabel: 'Broom',
      title: 'Simple skimming',
      body: 'Use a small hand skimmer after sessions to remove leaves or insects. Rinse interior surfaces with fresh water before refilling.',
      highlight: false,
    },
  ],
};

/* ── Yutori App ──────────────────────────────────────────── */

export const APP_SECTION = {
  label: 'The Yutori App',
  heading: 'Sensor, coaching, and safety\u00a0\u2014 built\u00a0in.',
  description:
    'Every Pulse Plunge ships with a Pulse Plunge Sensor and the Yutori mobile app. Submerged Bluetooth sensor reports water temperature in real time to your phone.',
  features: [
    {
      badge: 'Live',
      badgeColor: 'bg-accent text-accent-fg',
      title: 'Live Water Temperature',
      body: 'Submerged sensor reports water temperature in real time. See exactly how cold the water is\u2014not just \u201cabout mid-40s.\u201d IP68/IP69K housing handles ice baths, splashes, and hose-downs.',
    },
    {
      badge: 'Auto',
      badgeColor: 'bg-accent text-accent-fg',
      title: 'Automatic Plunge Logging',
      body: 'Each plunge captured with duration, start/end temps, complete water-temperature curve, and peak heart rate and HRV change when paired with a compatible wearable.',
    },
    {
      badge: 'Coach',
      badgeColor: 'bg-accent text-accent-fg',
      title: 'Live Coach',
      body: 'Builds a personal cold-exposure window from your recent sessions, current water-temperature zone, and demographic factors. Simple states: \u201cshort primer dip,\u201d \u201cstrong round,\u201d or \u201ctime to get out.\u201d',
    },
    {
      badge: 'Trends',
      badgeColor: 'bg-surface-raised text-fg-muted',
      title: 'Long-term Analysis',
      body: 'Average plunge duration, typical temperature range, cold-shock peak heart rate, and how long you can stay at a given temperature while staying within guardrails.',
    },
  ],
  emergency: {
    title: 'Emergency Alert System',
    body: 'Monitors for signs of serious trouble during plunge sessions. If thresholds are met, the app triggers escalating alerts on your phone, notifies pre-selected emergency contacts, and where supported, initiates an emergency call workflow.',
    disclaimer:
      'This system is a backup, not a guarantee. It depends on sensor data, device connectivity, and local emergency-call capabilities.',
  },
};

/* ── Site & Integration ──────────────────────────────────── */

export const INSTALLATION = {
  label: 'Site & Integration',
  heading: 'What you need on-site.',
  requirements: [
    {
      title: 'Level, well-drained pad',
      body: 'Pavers or concrete sized to the tub with space to step in and out. Grade sloped so splash and rinse water moves away from the base.',
    },
    {
      title: 'Water source',
      body: 'Fill-and-refresh cold tub. Use ambient well/city water, ice, or pre-chilled water if you have a separate system\u2014no integrated chiller required.',
    },
    {
      title: 'Wi-Fi or Bluetooth coverage',
      body: 'Reliable signal at the tub so Yutori can log data and, if needed, run emergency alerts.',
    },
    {
      title: 'Optional: Pulse Sauna pairing',
      body: 'Designed to sit beside Pulse Sauna for contrast sessions. Yutori treats alternating hot and cold as a single contrast session with adjusted timing.',
    },
  ],
};

/* ── Pricing & Delivery ──────────────────────────────────── */

export const PRICING = {
  label: 'Pricing & Delivery',
  heading: `${P.plunge}, plus freight.`,
  description:
    'Hand-crafted asnaro cold tub with Pulse Plunge Sensor and lifetime Yutori Premium. Actual shipping quoted based on location and access.',
  cards: [
    {
      value: P.plungeDeposit,
      title: 'Deposit',
      body: '20% non-refundable deposit due at order signing to secure your build slot and materials.',
      highlight: true,
    },
    {
      value: P.plungeBalance,
      title: 'Balance',
      body: 'Remaining 80% plus actual shipping cost due prior to shipment or at delivery, per your purchase agreement.',
      highlight: false,
    },
    {
      value: '~12 wks',
      title: 'Lead time',
      body: 'Target delivery within 12 weeks of signed agreement, subject to asnaro availability and international freight timing.',
      highlight: false,
    },
  ],
  finePrint:
    'Deposit is non-refundable and reserves your build slot. Full terms specified in the purchase agreement signed at contract.',
};

/* ── Specs ────────────────────────────────────────────────── */

export const SPECS_SECTION = {
  label: 'Specifications',
  heading: 'Full specs.',
};

export const SPECS: [string, string][] = [
  ['Product name', 'Yutori Labs: Pulse Plunge'],
  ['Tub type', 'Asnaro (Hiba) Japanese ofuro, hand-crafted for outdoor cold use'],
  ['Exterior size', 'Approx. 56\u2033 L \u00d7 30\u2033 W \u00d7 26\u201328\u2033 H'],
  ['Interior depth', '~22\u201324\u2033 water depth for seated full immersion'],
  ['Material', 'Solid asnaro staves, traditional joinery, stainless/brass hardware'],
  ['Finish', 'Smooth interior, natural asnaro surface'],
  ['Use case', 'Outdoor cold plunge, no integrated chiller'],
  ['Sensor', 'Pulse Plunge Sensor (RuuviTag Pro-class, temp + motion)'],
  ['Sensor temp range', '\u221240 to 85\u00a0\u00b0C (\u221240 to 185\u00a0\u00b0F)'],
  ['Sensor protection', 'IP68/IP69K housing for submersion and spray'],
  ['App', 'Yutori iOS app with Apple Health integration, HR/HRV, Live Coach'],
  ['Included access', 'Lifetime Yutori Premium for this tub\u2019s owner'],
  ['Price', `${P.plunge} USD plus freight \u00b7 12-week lead time \u00b7 20% non-refundable deposit`],
];

/* ── Safety & Limitations ────────────────────────────────── */

export const SAFETY = {
  label: 'Important',
  heading: 'Safety & limitations.',
  description:
    'Pulse Plunge and the Yutori app make cold exposure easier to structure and safer to explore, but there are important limits to keep in mind.',
  disclaimers: [
    {
      title: 'Not a medical device',
      body: 'Pulse Plunge, the plunge sensor, and the Yutori app are not medical devices and are not intended to diagnose, treat, cure, or prevent any disease. They should not replace medical advice, screening, or supervision from your healthcare team.',
    },
    {
      title: 'Hypothermia risk',
      body: 'Cold water immersion carries inherent risks including hypothermia, cold shock response, and cardiac stress. Start conservatively, follow the Live Coach\u2019s recommendations, and never plunge alone without safety measures in place.',
    },
    {
      title: 'Connectivity-dependent emergency alerts',
      body: 'The emergency alert system depends on your phone, sensors, and network. If Wi-Fi or cellular service is poor, if your phone battery is dead, or if permissions are disabled, emergency workflows may be delayed or unavailable.',
    },
    {
      title: 'Heed your own limits',
      body: 'The Live Coach\u2019s guidance is conservative by design, but it is still an estimate. If you feel unwell, confused, or distressed, end the session immediately and seek help\u2014regardless of what the app is showing.',
    },
  ],
};

/* ── Bottom CTA ──────────────────────────────────────────── */

export const CTA = {
  heading: 'Your cold practice. Your data. Your ritual.',
  description:
    `${P.plunge} plus freight. 20% deposit reserves your build slot. Target delivery within 12\u00a0weeks of signed agreement.`,
  primaryLabel: 'Add deposit to cart',
  primaryLoadingLabel: 'Adding to cart\u2026',
  primaryUnavailableLabel: 'Checkout unavailable',
  secondaryLabel: 'View all products',
};
