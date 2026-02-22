import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  getProductByHandle,
  getProductVariants,
  type ShopifyProduct,
  type ShopifyVariant,
  type ShopifyImage,
} from '../server/shopify';
import { useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { withCtaPrice } from '../lib/ctaLabel';
import { selectCheckoutVariant, selectDisplayVariant } from '../lib/shopifyVariants';
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
  COMPATIBILITY,
  APP_SECTION,
  TRENDS,
  PRICING,
  SPECS_SECTION,
  SPECS,
  SAFETY,
  CTA,
} from '../content/plunge-sensor';

import { SectionHero } from '../components/sections/SectionHero';
import { SectionWrapper } from '../components/sections/SectionWrapper';
import { SectionFeatureCards } from '../components/sections/SectionFeatureCards';
import { SectionBadgeFeatureGrid } from '../components/sections/SectionBadgeFeatureGrid';
import { SectionIconFeatureCards } from '../components/sections/SectionIconFeatureCards';
import { SectionPricingCards } from '../components/sections/SectionPricingCards';
import { SectionSpecsTable } from '../components/sections/SectionSpecsTable';
import { SectionDisclaimersStack } from '../components/sections/SectionDisclaimersStack';
import { SectionCtaBanner } from '../components/sections/SectionCtaBanner';

export const Route = createFileRoute('/sensors/plunge')({
  loader: async () => {
    try {
      const [product, variants] = await Promise.all([
        getProductByHandle({ data: { handle: PRODUCT_HANDLE } }),
        getProductVariants({ data: { handle: PRODUCT_HANDLE } }),
      ]);
      return { product, variants };
    } catch {
      return {
        product: null as ShopifyProduct | null,
        variants: [] as ShopifyVariant[],
      };
    }
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    const imageUrl = product?.featuredImage?.url ?? DEFAULT_OG_IMAGE_URL;

    return buildSeoHead({
      title: SEO.title,
      description: SEO.description,
      path: '/sensors/plunge',
      ogType: 'product',
      imageUrl,
      imageWidth: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_HEIGHT,
      imageType: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_TYPE,
    });
  },
  component: PlungeSensorPage,
});

function PlungeSensorPage() {
  const { product, variants } = Route.useLoaderData();
  const { addItem, loading: cartLoading } = useCart();
  const [cartError, setCartError] = useState<string | null>(null);

  const checkoutVariant = selectCheckoutVariant(variants);
  const displayVariant = selectDisplayVariant(variants);
  const checkoutAvailable = Boolean(checkoutVariant);

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

  const handleAddToCart = async () => {
    if (!checkoutVariant) return;
    setCartError(null);
    try {
      const invoiceUrl = await addItem(checkoutVariant.id);
      window.location.assign(invoiceUrl);
    } catch {
      setCartError(HERO.ctaError);
    }
  };

  const images: ShopifyImage[] = product?.images?.edges.map((e) => e.node) ?? [];

  return (
    <main className="flex-1">
      <SectionHero
        content={heroContent}
        images={images}
        livePrice={livePrice}
        checkoutAvailable={checkoutAvailable}
        cartLoading={cartLoading}
        cartError={cartError}
        onAddToCart={handleAddToCart}
        accentColor="accent"
        emptyIcon={'\u2744\ufe0f'}
      />

      <SectionWrapper variant="surface">
        <SectionFeatureCards {...COMPATIBILITY} labelColor="text-accent" />
      </SectionWrapper>

      <SectionWrapper>
        <SectionBadgeFeatureGrid
          {...APP_SECTION}
          callout={APP_SECTION.emergency}
        />
      </SectionWrapper>

      <SectionWrapper variant="surface">
        <SectionIconFeatureCards {...TRENDS} labelColor="text-accent" />
      </SectionWrapper>

      <SectionWrapper variant="surface" id="pricing">
        <SectionPricingCards {...PRICING} columns={2} labelColor="text-accent" />
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
        cartLoading={cartLoading}
        onAddToCart={handleAddToCart}
        accentColor="accent"
      />
    </main>
  );
}
