import { P } from './pricing';

/* ── Products listing page ─────────────────────────────────── */

export const LISTING_SEO = {
  title: 'Yutori \u2014 Products',
  description:
    'Saunas, cold plunges, and Bluetooth sensors built for the serious thermal wellness practitioner.',
  path: '/products',
};

export const LISTING = {
  heading: 'Products',
  subheading: 'Saunas, cold plunges, and sensors \u2014 built for the serious practitioner.',
  emptyMessage: 'No products yet. Check back soon.',
  unavailableMessage:
    'Shopify catalog is temporarily unavailable. Browse currently implemented products below.',
  viewLabel: 'View \u2192',
  pricePrefix: 'From',
};

export const LISTING_FALLBACK_PRODUCTS = [
  {
    id: 'fallback-pulse-sauna',
    title: 'Pulse Sauna',
    description: 'Clear-cedar sauna with sensor-guided protocols and safety workflows.',
    href: '/sauna',
    priceLabel: P.sauna,
  },
  {
    id: 'fallback-pulse-plunge',
    title: 'Pulse Plunge',
    description: 'Copper plunge system with guided contrast-ready integration.',
    href: '/plunge',
    priceLabel: P.plunge,
  },
  {
    id: 'fallback-pulse-shower',
    title: 'Pulse Shower',
    description: 'Cold rinse and transition station for contrast workflows.',
    href: '/shower',
    priceLabel: `From ${P.showerWithout}`,
  },
  {
    id: 'fallback-sauna-sensor',
    title: 'Pulse Sauna Sensor',
    description: 'Bluetooth sauna sensor for any existing sauna setup.',
    href: '/sensors/sauna',
    priceLabel: P.sensor,
  },
  {
    id: 'fallback-plunge-sensor',
    title: 'Pulse Plunge Sensor',
    description: 'Bluetooth water temperature sensor for any plunge setup.',
    href: '/sensors/plunge',
    priceLabel: P.sensor,
  },
  {
    id: 'fallback-contrast-bundle',
    title: 'Pulse Contrast Bundle',
    description: 'Sauna + plunge sensors with bundle pricing.',
    href: '/sensors/bundle',
    priceLabel: P.bundle,
  },
];

export const LISTING_ERROR = {
  heading: 'Unable to load products',
  body: 'Please try again in a moment.',
  ctaLabel: 'Back to home',
};

/* ── Product detail page ──────────────────────────────────── */

export const DETAIL_SEO = {
  fallbackTitle: 'Yutori \u2014 Product',
  fallbackDescription:
    'Shop Yutori sauna, cold plunge, and Bluetooth sensor hardware.',
};

export const DETAIL_ERROR = {
  heading: 'Unable to load product',
  body: 'Please try again in a moment.',
  ctaLabel: 'Back to products',
};

export const DETAIL_NOT_FOUND = {
  heading: 'Product not found',
  body: 'This product may have been removed or the link is incorrect.',
  ctaLabel: 'Back to products',
};

export const DETAIL_APP_CALLOUT = {
  title: 'App-connected',
  body: 'Pair this product with a Yutori sensor to automatically log every session \u2014 temperature curves, duration, and recovery data \u2014 in the app.',
};

export const DETAIL_CTA = {
  label: 'Add to cart',
  loadingLabel: 'Adding\u2026',
  unavailableLabel: 'Unavailable',
  statusAvailable: 'Secure checkout via Shopify',
  statusUnavailable: 'This product is currently unavailable for checkout',
  errorMessage: 'Unable to add this item to cart. Please try again.',
};
