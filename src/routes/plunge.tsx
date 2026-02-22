import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { type ShopifyImage } from '../server/shopify';
import { useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { withCtaPrice } from '../lib/ctaLabel';
import {
  buildVariantEnvKeyFromHandle,
  getCheckoutUnavailableHelp,
  isCheckoutInfrastructureError,
  resolveCheckoutVariant,
} from '../lib/checkoutState';
import { selectDisplayVariant } from '../lib/shopifyVariants';
import { loadProductCommerceByHandle } from '../lib/productCommerce';
import {
  buildSeoHead,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
} from '../lib/seo';
import {
  PRODUCT_HANDLE,
  SEO,
  HERO,
  THE_TUB,
  NO_CHILLER,
  WATER_CARE,
  APP_SECTION,
  INSTALLATION,
  PRICING,
  SPECS_SECTION,
  SPECS,
  SAFETY,
  CTA,
} from '../content/plunge';

import { SectionHero } from '../components/sections/SectionHero';
import { SectionWrapper } from '../components/sections/SectionWrapper';
import { SectionFeatureCards } from '../components/sections/SectionFeatureCards';
import { SectionIconFeatureCards } from '../components/sections/SectionIconFeatureCards';
import { SectionBadgeFeatureGrid } from '../components/sections/SectionBadgeFeatureGrid';
import { SectionPricingCards } from '../components/sections/SectionPricingCards';
import { SectionSpecsTable } from '../components/sections/SectionSpecsTable';
import { SectionDisclaimersStack } from '../components/sections/SectionDisclaimersStack';
import { SectionCtaBanner } from '../components/sections/SectionCtaBanner';

export const Route = createFileRoute('/plunge')({
  loader: async () => loadProductCommerceByHandle(PRODUCT_HANDLE),
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    const imageUrl = product?.featuredImage?.url ?? DEFAULT_OG_IMAGE_URL;

    return buildSeoHead({
      title: SEO.title,
      description: SEO.description,
      path: SEO.path,
      ogType: 'product',
      imageUrl,
      imageWidth: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_HEIGHT,
      imageType: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_TYPE,
    });
  },
  component: PlungePage,
});

/* ── Page ───────────────────────────────────────────────────── */

function PlungePage() {
  const { product, variants, loaderError } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addItem, loading: cartLoading } = useCart();
  const [cartError, setCartError] = useState<string | null>(null);

  const images: ShopifyImage[] = product?.images?.edges.map((e) => e.node) ?? [];
  const { checkoutVariant, checkoutVariantId } = resolveCheckoutVariant({
    variants,
    fallbackEnvKeys: [
      'VITE_SHOPIFY_PULSE_PLUNGE_DEPOSIT_VARIANT_ID',
      buildVariantEnvKeyFromHandle(PRODUCT_HANDLE),
    ],
    preferDepositTitle: true,
  });

  const displayVariant = selectDisplayVariant(variants);
  const displayPrice = displayVariant?.price ?? product?.priceRange?.maxVariantPrice ?? null;
  const livePrice = displayPrice
    ? formatPrice(displayPrice.amount, displayPrice.currencyCode)
    : null;

  const checkoutPrice = checkoutVariant
    ? formatPrice(checkoutVariant.price.amount, checkoutVariant.price.currencyCode)
    : null;

  const heroContent = checkoutPrice
    ? { ...HERO, ctaLabel: withCtaPrice(HERO.ctaLabel, checkoutPrice) }
    : HERO;
  const ctaContent = checkoutPrice
    ? { ...CTA, primaryLabel: withCtaPrice(CTA.primaryLabel, checkoutPrice) }
    : CTA;
  const checkoutAvailable =
    Boolean(checkoutVariantId) && !isCheckoutInfrastructureError(loaderError);
  const checkoutUnavailableHelp = getCheckoutUnavailableHelp(
    loaderError,
    HERO.ctaUnavailableHelp,
  );

  const handleAddToCart = async () => {
    if (!checkoutVariantId || !checkoutAvailable) return;
    setCartError(null);
    try {
      await addItem(checkoutVariantId);
      await navigate({ to: '/cart' });
    } catch {
      setCartError(HERO.ctaError);
    }
  };

  return (
    <main className="flex-1">
      <SectionHero
        content={heroContent}
        images={images}
        livePrice={livePrice}
        checkoutAvailable={checkoutAvailable}
        checkoutUnavailableHelp={checkoutUnavailableHelp}
        cartLoading={cartLoading}
        cartError={cartError}
        onAddToCart={handleAddToCart}
        accentColor="accent"
        emptyIcon={'\u2744\ufe0f'}
      />

      <SectionWrapper variant="surface">
        <SectionFeatureCards {...THE_TUB} />
      </SectionWrapper>

      <SectionWrapper>
        <SectionIconFeatureCards
          {...NO_CHILLER}
          columns={2}
          labelColor="text-accent"
          accentColor="accent"
        />
      </SectionWrapper>

      <SectionWrapper variant="surface">
        <SectionIconFeatureCards
          {...WATER_CARE}
          columns={2}
          labelColor="text-fg-subtle"
          accentColor="accent"
        />
      </SectionWrapper>

      <SectionWrapper>
        <SectionBadgeFeatureGrid
          {...APP_SECTION}
          callout={APP_SECTION.emergency}
        />
      </SectionWrapper>

      <SectionWrapper variant="surface">
        <SectionFeatureCards
          label={INSTALLATION.label}
          heading={INSTALLATION.heading}
          cards={INSTALLATION.requirements}
          columns={2}
          labelColor="text-fg-subtle"
        />
      </SectionWrapper>

      <SectionWrapper variant="surface" id="pricing">
        <SectionPricingCards {...PRICING} />
      </SectionWrapper>

      <SectionWrapper variant="surface">
        <SectionSpecsTable {...SPECS_SECTION} specs={SPECS} />
      </SectionWrapper>

      <SectionWrapper>
        <SectionDisclaimersStack {...SAFETY} />
      </SectionWrapper>

      <SectionCtaBanner
        content={ctaContent}
        checkoutAvailable={checkoutAvailable}
        checkoutUnavailableHelp={checkoutUnavailableHelp}
        cartLoading={cartLoading}
        onAddToCart={handleAddToCart}
        accentColor="accent"
      />
    </main>
  );
}
