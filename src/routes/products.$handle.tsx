import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useCart } from '../lib/cart';
import { selectCheckoutVariant } from '../lib/shopifyVariants';
import { ProductGallery } from '../components/ProductGallery';
import { getProductByHandle, getProductVariants } from '../server/shopify';
import {
  buildSeoHead,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
  toMetaDescription,
} from '../lib/seo';
import {
  DETAIL_SEO,
  DETAIL_ERROR,
  DETAIL_NOT_FOUND,
  DETAIL_APP_CALLOUT,
  DETAIL_CTA,
} from '../content/products';

export const Route = createFileRoute('/products/$handle')({
  loader: async ({ params }) => {
    const [product, variants] = await Promise.all([
      getProductByHandle({
        data: { handle: params.handle },
      }),
      getProductVariants({
        data: { handle: params.handle },
      }).catch(() => []),
    ]);
    return { product, variants };
  },
  head: ({ loaderData, params }) => {
    const product = loaderData?.product;
    const title = product ? `Yutori \u2014 ${product.title}` : DETAIL_SEO.fallbackTitle;
    const description = toMetaDescription(
      product?.description,
      DETAIL_SEO.fallbackDescription,
    );

    if (product?.featuredImage?.url) {
      return {
        ...buildSeoHead({
          title,
          description,
          path: `/products/${encodeURIComponent(params.handle)}`,
          ogType: 'product',
          imageUrl: product.featuredImage.url,
        }),
      };
    }

    return {
      ...buildSeoHead({
        title,
        description,
        path: `/products/${encodeURIComponent(params.handle)}`,
        ogType: 'product',
        imageUrl: DEFAULT_OG_IMAGE_URL,
        imageWidth: DEFAULT_OG_IMAGE_WIDTH,
        imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
        imageType: DEFAULT_OG_IMAGE_TYPE,
      }),
    };
  },
  component: ProductPage,
  errorComponent: ProductError,
});

function ProductError() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-20 text-center">
      <p className="text-2xl font-bold text-fg">{DETAIL_ERROR.heading}</p>
      <p className="mt-2 text-fg-muted">{DETAIL_ERROR.body}</p>
      <Link
        to="/products"
        className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
      >
        {DETAIL_ERROR.ctaLabel}
      </Link>
    </main>
  );
}

function ProductPage() {
  const { product, variants } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addItem, loading: cartLoading } = useCart();
  const [cartError, setCartError] = useState<string | null>(null);
  const checkoutVariant = selectCheckoutVariant(variants, { preferDepositTitle: true });

  const handleAddToCart = async () => {
    if (!checkoutVariant) return;
    setCartError(null);
    try {
      await addItem(checkoutVariant.id);
      await navigate({ to: '/cart' });
    } catch {
      setCartError(DETAIL_CTA.errorMessage);
    }
  };

  if (!product) {
    return (
      <main className="flex-1 mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-2xl font-bold text-fg">{DETAIL_NOT_FOUND.heading}</p>
        <p className="mt-2 text-fg-muted">{DETAIL_NOT_FOUND.body}</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
        >
          {DETAIL_NOT_FOUND.ctaLabel}
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-fg-subtle">
            <Link to="/products" className="transition-colors hover:text-fg-muted">Products</Link>
            <span>/</span>
            <span className="text-fg-muted">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Images */}
          <ProductGallery
            images={product.images.edges.map((e) => e.node)}
            productTitle={product.title}
          />

          {/* Details */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-fg">{product.title}</h1>
            <div className="mt-3 text-2xl font-bold text-accent">
              {product.priceRange.minVariantPrice.amount}{' '}{product.priceRange.minVariantPrice.currencyCode}
            </div>
            <p className="mt-5 text-base leading-relaxed text-fg-muted whitespace-pre-line">{product.description}</p>

            {/* App callout */}
            <div className="mt-8 rounded-2xl border border-accent-dim/40 bg-accent-subtle p-5">
              <p className="text-sm font-semibold text-accent">{DETAIL_APP_CALLOUT.title}</p>
              <p className="mt-1 text-sm text-fg-muted">
                {DETAIL_APP_CALLOUT.body}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8">
              {checkoutVariant ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  aria-describedby="cart-status"
                  className="w-full rounded-xl bg-accent px-6 py-4 font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cartLoading ? DETAIL_CTA.loadingLabel : DETAIL_CTA.label}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-describedby="cart-status"
                  className="w-full cursor-not-allowed rounded-xl bg-accent px-6 py-4 font-semibold text-accent-fg opacity-50"
                >
                  {DETAIL_CTA.unavailableLabel}
                </button>
              )}
              <p id="cart-status" className="mt-2 text-center text-xs text-fg-subtle">
                {checkoutVariant ? DETAIL_CTA.statusAvailable : DETAIL_CTA.statusUnavailable}
              </p>
              {cartError ? (
                <p role="alert" className="mt-2 text-center text-xs text-red-600">
                  {cartError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
