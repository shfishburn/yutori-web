import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { selectDisplayVariant } from '../lib/shopifyVariants';
import { ProductGallery } from '../components/ProductGallery';
import {
  buildVariantEnvKeyFromHandle,
  getCheckoutUnavailableHelp,
  isCheckoutInfrastructureError,
  resolveCheckoutVariant,
} from '../lib/checkoutState';
import { loadProductCommerceByHandle } from '../lib/productCommerce';
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
  loader: async ({ params }) => loadProductCommerceByHandle(params.handle),
  head: ({ loaderData, params }) => {
    const product = loaderData?.product;
    const title = product ? `Yutori — ${product.title}` : DETAIL_SEO.fallbackTitle;
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
        to="/"
        className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
      >
        {DETAIL_ERROR.ctaLabel}
      </Link>
    </main>
  );
}

function ProductPage() {
  const { handle } = Route.useParams();
  const { product, variants, loaderError } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addItem, loading: cartLoading } = useCart();
  const [cartError, setCartError] = useState<string | null>(null);

  const { checkoutVariantId } = resolveCheckoutVariant({
    variants,
    fallbackEnvKeys: [buildVariantEnvKeyFromHandle(handle)],
    preferDepositTitle: true,
  });
  const checkoutAvailable =
    Boolean(checkoutVariantId) && !isCheckoutInfrastructureError(loaderError);
  const statusUnavailable = getCheckoutUnavailableHelp(
    loaderError,
    DETAIL_CTA.statusUnavailable,
  );
  const displayVariant = selectDisplayVariant(variants);

  const handleAddToCart = async () => {
    if (!checkoutVariantId || !checkoutAvailable) return;
    setCartError(null);
    try {
      await addItem(checkoutVariantId);
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
          to="/"
          className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
        >
          {DETAIL_NOT_FOUND.ctaLabel}
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-fg-subtle">
            <Link to="/" className="transition-colors hover:text-fg-muted">Home</Link>
            <span>/</span>
            <span className="text-fg-muted">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <ProductGallery
            images={product.images.edges.map((e) => e.node)}
            productTitle={product.title}
          />

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-fg">{product.title}</h1>
            <div className="mt-3 text-2xl font-bold text-accent">
              {displayVariant
                ? formatPrice(displayVariant.price.amount, displayVariant.price.currencyCode)
                : formatPrice(
                    product.priceRange.maxVariantPrice.amount,
                    product.priceRange.maxVariantPrice.currencyCode,
                  )}
            </div>
            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-fg-muted">
              {product.description}
            </p>

            <div className="mt-8 rounded-2xl border border-accent-dim/40 bg-accent-subtle p-5">
              <p className="text-sm font-semibold text-accent">{DETAIL_APP_CALLOUT.title}</p>
              <p className="mt-1 text-sm text-fg-muted">{DETAIL_APP_CALLOUT.body}</p>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!checkoutAvailable || cartLoading}
                aria-describedby="cart-status"
                className={`w-full rounded-xl bg-accent px-6 py-4 font-semibold text-accent-fg transition-opacity hover:opacity-90 ${
                  !checkoutAvailable || cartLoading
                    ? 'cursor-not-allowed opacity-60'
                    : ''
                }`}
              >
                {checkoutAvailable
                  ? cartLoading
                    ? DETAIL_CTA.loadingLabel
                    : DETAIL_CTA.label
                  : DETAIL_CTA.unavailableLabel}
              </button>
              <p id="cart-status" className="mt-2 text-center text-xs text-fg-subtle">
                {checkoutAvailable ? DETAIL_CTA.statusAvailable : statusUnavailable}
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
