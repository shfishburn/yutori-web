/* ── Shared types for reusable product page sections ────── */

/** Simple feature card (title + body). */
export type FeatureCard = {
  title: string;
  body: string;
};

/** Feature card with icon and optional highlight. */
export type IconFeatureCard = {
  icon: string;
  iconLabel: string;
  title: string;
  body: string;
  highlight?: boolean;
};

/** Feature card with badge pill. */
export type BadgeFeatureCard = {
  badge: string;
  badgeColor: string;
  title: string;
  body: string;
};

/** Modality card with colored border and bullet points. */
export type ModalityCard = {
  color: string;
  titleColor: string;
  title: string;
  points: string[];
};

/** Pricing card with value and optional highlight. */
export type PricingCard = {
  value: string;
  title: string;
  body: string;
  highlight?: boolean;
};

/** Disclaimer card (title + body). */
export type DisclaimerCard = {
  title: string;
  body: string;
};

/** Quick-stat pill for the hero section. */
export type QuickStat = {
  value: string;
  label: string;
};

/** Emergency/safety callout box. */
export type EmergencyCallout = {
  title: string;
  body: string;
  disclaimer?: string;
};

/** Static text content for the hero section. */
export type HeroContent = {
  badge: string;
  title: string;
  fallbackPrice: string;
  priceNote: string;
  description: string;
  imagePlaceholder: string;
  ctaLabel: string;
  ctaLoadingLabel: string;
  ctaUnavailableLabel: string;
  ctaError: string;
  ctaUnavailableHelp: string;
  depositNote: string;
  quickStats: QuickStat[];
};

/** Static text content for the bottom CTA banner. */
export type CtaBannerContent = {
  heading: string;
  description: string;
  primaryLabel: string;
  primaryLoadingLabel: string;
  primaryUnavailableLabel: string;
  secondaryLabel: string;
};
