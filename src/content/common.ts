/* ── Brand ─────────────────────────────────────────────────── */

export const BRAND = {
  name: 'Yutori Labs',
  tagline: 'Thermal wellness, measured.',
  supportEmail: 'support@yutorilabs.com',
};

/* ── Navigation ───────────────────────────────────────────── */

export const NAV = {
  pulseSauna: 'Pulse Sauna',
  products: 'Products',
  privacy: 'Privacy',
  terms: 'Terms',
  shopNow: 'Shop now',
  cartLabel: 'Cart',
};

/* ── Footer ───────────────────────────────────────────────── */

export const FOOTER_COLUMNS = [
  {
    heading: 'Shop',
    links: [{ label: 'Products', href: '/products' }],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export const FOOTER_SUPPORT_HEADING = 'Support';

export const FOOTER_COPYRIGHT = (year: number) =>
  `© ${year} ${BRAND.name}. All rights reserved.`;
