import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  getProductByHandle,
  getProductVariants,
  type ShopifyProduct,
  type ShopifyVariant,
  type ShopifyImage,
} from '../server/shopify';
import { useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { selectCheckoutVariant } from '../lib/shopifyVariants';
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
  HUMIDITY,
  PRICING,
  SPECS_SECTION,
  SPECS,
  SAFETY,
  CTA,
} from '../content/sauna-sensor';

import { SectionHero } from '../components/sections/SectionHero';
import { SectionWrapper } from '../components/sections/SectionWrapper';
import { SectionFeatureCards } from '../components/sections/SectionFeatureCards';
import { SectionBadgeFeatureGrid } from '../components/sections/SectionBadgeFeatureGrid';
import { SectionIconFeatureCards } from '../components/sections/SectionIconFeatureCards';
import { SectionPricingCards } from '../components/sections/SectionPricingCards';
import { SectionSpecsTable } from '../components/sections/SectionSpecsTable';
import { SectionDisclaimersStack } from '../components/sections/SectionDisclaimersStack';
import { SectionCtaBanner } from '../components/sections/SectionCtaBanner';

export const Route = createFileRoute('/sauna-sensor')({
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
      path: SEO.path,
      ogType: 'product',
      imageUrl,
      imageWidth: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_HEIGHT,
      imageType: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_TYPE,
    });
  },
  component: SaunaSensorPage,
});

function SaunaSensorPage() {
  const { product, variants } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addItem, loading: cartLoading } = useCart();
  const [cartError, setCartError] = useState<string | null>(null);

  const checkoutVariant = selectCheckoutVariant(variants);
  const checkoutAvailable = Boolean(checkoutVariant);

  const handleAddToCart = async () => {
    if (!checkoutVariant) return;
    setCartError(null);
    try {
      await addItem(checkoutVariant.id);
      await navigate({ to: '/cart' });
    } catch {
      setCartError(HERO.ctaError);
    }
  };

  const images: ShopifyImage[] = product?.images?.edges.map((e) => e.node) ?? [];
  const price = product?.priceRange?.minVariantPrice;
  const livePrice = price ? formatPrice(price.amount, price.currencyCode) : null;

  return (
    <main className="flex-1">
      <SectionHero
        content={HERO}
        images={images}
        livePrice={livePrice}
        checkoutAvailable={checkoutAvailable}
        cartLoading={cartLoading}
        cartError={cartError}
        onAddToCart={handleAddToCart}
        emptyIcon={'\ud83c\udf21\ufe0f'}
      />

      <SectionWrapper variant="surface">
        <SectionFeatureCards {...COMPATIBILITY} />
      </SectionWrapper>

      <SectionWrapper>
        <SectionBadgeFeatureGrid
          {...APP_SECTION}
          callout={APP_SECTION.emergency}
        />
      </SectionWrapper>

      <SectionWrapper variant="surface">
        <SectionIconFeatureCards {...HUMIDITY} />
      </SectionWrapper>

      <SectionWrapper variant="surface" id="pricing">
        <SectionPricingCards {...PRICING} columns={2} />
      </SectionWrapper>

      <SectionWrapper variant="surface">
        <SectionSpecsTable {...SPECS_SECTION} specs={SPECS} />
      </SectionWrapper>

      <SectionWrapper>
        <SectionDisclaimersStack {...SAFETY} />
      </SectionWrapper>

      <SectionCtaBanner
        content={CTA}
        checkoutAvailable={checkoutAvailable}
        cartLoading={cartLoading}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
}
