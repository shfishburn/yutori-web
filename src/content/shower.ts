import { P } from './pricing';

/** Shopify handle for the Pulse Shower product. */
export const PRODUCT_HANDLE = 'pulse-shower';

/* ── SEO ──────────────────────────────────────────────────── */

export const SEO = {
  title: 'Pulse Shower \u2014 Cedar Outdoor Shower by Yutori Labs',
  description:
    'A clear-cedar outdoor shower with full copper plumbing, built to live between your sauna and plunge. Garden-hose hookup, optional tankless propane heater.',
  path: '/shower',
};

/* ── Hero ─────────────────────────────────────────────────── */

export const HERO = {
  badge: 'Outdoor shower',
  title: 'Pulse Shower',
  fallbackPrice: `From ${P.showerWithout}`,
  priceNote: 'plus freight',
  description:
    'A clear-cedar outdoor shower with full copper plumbing, built to match Pulse Sauna and Pulse Plunge. Privacy-height enclosure, exposed copper riser and oversized rain head, garden-hose hookup\u00a0\u2014 with or without a tankless propane heater.',
  imagePlaceholder: 'Product imagery coming soon',
  ctaLabel: `Add deposit to cart \u2014 ${P.showerWithoutDeposit}`,
  ctaLoadingLabel: 'Adding to cart\u2026',
  ctaUnavailableLabel: 'Add to cart unavailable',
  ctaError: 'Unable to add the deposit to your cart. Please try again.',
  ctaUnavailableHelp:
    'Checkout is temporarily unavailable. Refresh this page or contact support@yutorilabs.com.',
  depositNote: '20% non-refundable deposit \u00b7 12-week lead time',
  quickStats: [
    { value: 'Cedar', label: 'Clear WRC' },
    { value: 'Copper', label: 'Plumbing' },
    { value: 'Hose', label: 'Garden fitting' },
    { value: '2', label: 'Configurations' },
  ],
};

/* ── The Structure ───────────────────────────────────────── */

export const THE_STRUCTURE = {
  label: 'The Structure',
  heading: 'A cedar shower that belongs with your sauna.',
  description:
    'Vertical cedar, clean lines, and exposed copper piping make it feel like part of the same small bathhouse, not an afterthought.',
  cards: [
    {
      title: 'Clear Western Red Cedar',
      body: 'Posts, walls, and trim in clear cedar. Privacy-height enclosure with open sky above the shower head.',
    },
    {
      title: 'Cedar bench and floor grate',
      body: 'Stand on warm wood, not plastic or concrete. Drain bed underneath for easy water management.',
    },
    {
      title: 'Full copper plumbing',
      body: 'Exposed copper riser, manifold, valves, and oversized round rain-head arm. Architectural feel with garden-hose simplicity.',
    },
  ],
};

/* ── Copper Plumbing ─────────────────────────────────────── */

export const COPPER = {
  label: 'Plumbing',
  heading: 'Real copper, real water, simple hookup.',
  description:
    'All visible plumbing is copper: riser, mixing runs, valves, and the oversized round rain-head arm. Connect directly to an exterior hose bib\u2014no house re-plumbing required.',
  cards: [
    {
      icon: '\ud83d\udeb0',
      iconLabel: 'Faucet',
      title: 'Garden-hose feed',
      body: 'Standard garden-hose fitting connects to an exterior hose bib. No house re-plumbing required.',
      highlight: false,
    },
    {
      icon: '\ud83d\udd27',
      iconLabel: 'Wrench',
      title: 'Full copper manifold',
      body: 'Individual shutoffs so a plumber can isolate or service the heater and lines easily.',
      highlight: false,
    },
    {
      icon: '\ud83d\udca7',
      iconLabel: 'Water drop',
      title: 'Oversized rain head',
      body: 'Copper-finish round rain head for a calm, soaking spray. Mounted on an exposed copper arm.',
      highlight: true,
    },
  ],
};

/* ── Two Configurations ──────────────────────────────────── */

export const CONFIGURATIONS = {
  label: 'Two Configurations',
  heading: 'With or without heat.',
  cards: [
    {
      icon: '\ud83d\udd25',
      iconLabel: 'Fire',
      title: 'With Eccotemp heater',
      body: 'Includes an Eccotemp L5-class 1.5\u00a0GPM outdoor propane tankless heater. Cold feed from your garden hose runs into the heater; hot outlet plus cold bypass feed a copper mixing valve for true hot-and-cold control.',
      highlight: true,
    },
    {
      icon: '\u2744\ufe0f',
      iconLabel: 'Snowflake',
      title: 'Without heater (cold-only / BYO)',
      body: 'Same cedar structure, copper riser, manifold, and rain head. Hose-bib feed runs directly to the shower line. Hot side capped and mounting panel prepped for a future heater.',
      highlight: false,
    },
  ],
};

/* ── System Fit ──────────────────────────────────────────── */

export const SYSTEM_FIT = {
  label: 'Part of the System',
  heading: 'The reset point between hot and cold.',
  description:
    'Pulse Shower is designed to sit within a few steps of Pulse Sauna and Pulse Plunge. It doesn\u2019t need sensors or an app\u2014it\u2019s the reset point between the instrumented parts of your practice.',
  cards: [
    {
      title: 'Before cold',
      body: 'Quick rinse to keep sweat, oils, and debris out of your asnaro plunge, extending water life between changes.',
    },
    {
      title: 'Between hot and cold',
      body: 'Short rinse between sauna rounds without tracking water through the house.',
    },
    {
      title: 'After cold',
      body: 'Comfortable warm shower (with the Eccotemp option) so you can re-warm and finish the ritual outside.',
    },
  ],
};

/* ── Pricing & Delivery ──────────────────────────────────── */

export const PRICING = {
  label: 'Pricing & Delivery',
  heading: `From ${P.showerWithout}, plus freight.`,
  description:
    'Two configurations. Same cedar enclosure, copper plumbing, and rain head. Add the Eccotemp tankless heater for year-round hot-and-cold.',
  cards: [
    {
      value: P.showerWithout,
      title: 'Without Heater',
      body: 'Cedar enclosure, full copper plumbing, rain head, hose-bib connection. Hot side capped and mounting panel prepped for a future heater.',
      highlight: false,
    },
    {
      value: P.showerWith,
      title: 'With Eccotemp Heater',
      body: 'Everything above plus Eccotemp L5-class outdoor propane tankless heater, propane hose/regulator, and copper mixing valve for hot-and-cold control.',
      highlight: true,
    },
    {
      value: '~12 wks',
      title: 'Lead time',
      body: 'Target delivery within 12 weeks of signed agreement. 20% non-refundable deposit due at order to reserve your build slot.',
      highlight: false,
    },
  ],
  finePrint:
    'Deposit is non-refundable and reserves your build slot. Remaining 80% plus actual shipping cost due prior to shipment or at delivery. Full terms specified in the purchase agreement.',
};

/* ── Specs ────────────────────────────────────────────────── */

export const SPECS_SECTION = {
  label: 'Specifications',
  heading: 'Full specs.',
};

export const SPECS: [string, string][] = [
  ['Product name', 'Yutori Labs: Pulse Shower'],
  ['Structure', 'Clear Western Red Cedar posts, privacy walls, bench, floor grate'],
  ['Plumbing', 'Exposed copper riser, manifold, valves, rain-head arm'],
  ['Water feed', 'Standard garden-hose fitting to exterior spigot'],
  ['Heater option', 'Eccotemp L5-class 1.5\u00a0GPM outdoor propane tankless heater'],
  ['Fuel', '20\u00a0lb propane cylinder with hose and regulator (heater option)'],
  ['Configurations', '1) With heater (hot + cold) \u00a02) Without heater (cold-only / BYO)'],
  ['Use case', 'Outdoor shower beside Pulse Sauna and Pulse Plunge'],
  ['Pricing', `${P.showerWithout} without heater \u00b7 ${P.showerWith} with heater \u00b7 freight additional`],
  ['Lead time', '\u224812 weeks \u00b7 20% non-refundable deposit at order'],
];

/* ── Safety & Limitations ────────────────────────────────── */

export const SAFETY = {
  label: 'Important',
  heading: 'Safety & limitations.',
  description:
    'Pulse Shower is a simple outdoor fixture. Please observe the following.',
  disclaimers: [
    {
      title: 'Propane safety (heater option)',
      body: 'The Eccotemp heater runs on propane. Follow all manufacturer instructions for ventilation, gas hookup, and storage. Keep the propane cylinder upright, outdoors, and away from ignition sources.',
    },
    {
      title: 'Plumbing and drainage',
      body: 'Ensure adequate drainage at the shower location. Grade the pad so water flows away from the structure and any adjacent buildings. In freezing climates, drain lines before winter to prevent pipe damage.',
    },
    {
      title: 'Local codes',
      body: 'Outdoor plumbing and propane installations may require permits or inspections in your area. Consult local building codes before installation.',
    },
  ],
};

/* ── Bottom CTA ──────────────────────────────────────────── */

export const CTA = {
  heading: 'Complete the bathhouse.',
  description:
    `From ${P.showerWithout} plus freight. 20% deposit reserves your build slot. Target delivery within 12\u00a0weeks of signed agreement.`,
  primaryLabel: 'Add deposit to cart',
  primaryLoadingLabel: 'Adding to cart\u2026',
  primaryUnavailableLabel: 'Checkout unavailable',
  secondaryLabel: 'View all products',
};
