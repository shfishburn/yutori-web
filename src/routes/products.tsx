import { createFileRoute, Link } from '@tanstack/react-router';
import { getProducts, type ShopifyProduct } from '../server/shopify';
import { formatPrice } from '../lib/format';
import {
  buildSeoHead,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
} from '../lib/seo';
import {
  LISTING_SEO,
  LISTING,
  LISTING_FALLBACK_PRODUCTS,
} from '../content/products';

type ProductsLoaderData = {
  products: ShopifyProduct[];
  loaderError: string | null;
};

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export const Route = createFileRoute('/products')({
  loader: async (): Promise<ProductsLoaderData> => {
    try {
      const products = await getProducts();
      return {
        products,
        loaderError: products.length === 0 ? 'empty_catalog' : null,
      };
    } catch (error) {
      const loaderError = toErrorMessage(error);
      console.error(`[commerce] Failed Shopify product listing: ${loaderError}`);
      return { products: [], loaderError };
    }
  },
  head: () => ({
    ...buildSeoHead({
      title: LISTING_SEO.title,
      description: LISTING_SEO.description,
      path: LISTING_SEO.path,
      imageWidth: DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
      imageType: DEFAULT_OG_IMAGE_TYPE,
    }),
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products, loaderError } = Route.useLoaderData();
  const showFallback = products.length === 0 && loaderError !== null;

  return (
    <main className="flex-1">
      <div className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-fg">{LISTING.heading}</h1>
          <p className="mt-2 text-lg text-fg-muted">{LISTING.subheading}</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {products.length === 0 ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-edge bg-surface p-8 text-center">
              <p className="text-fg-muted">
                {showFallback ? LISTING.unavailableMessage : LISTING.emptyMessage}
              </p>
            </div>

            {showFallback ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {LISTING_FALLBACK_PRODUCTS.map((p) => (
                  <Link
                    key={p.id}
                    to={p.href}
                    className="group rounded-2xl border border-edge bg-surface p-5 transition-all hover:border-edge-strong hover:bg-surface-raised"
                  >
                    <div className="h-48 w-full rounded-xl bg-overlay" />
                    <div className="mt-5">
                      <div className="text-base font-semibold text-fg transition-colors group-hover:text-accent">
                        {p.title}
                      </div>
                      <div className="mt-1.5 text-sm text-fg-muted line-clamp-2">
                        {p.description}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-accent">
                          {LISTING.pricePrefix} {p.priceLabel}
                        </span>
                        <span className="text-xs text-fg-subtle transition-colors group-hover:text-fg-muted">
                          {LISTING.viewLabel}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p: ShopifyProduct) => (
              <Link
                key={p.id}
                to="/products/$handle"
                params={{ handle: p.handle }}
                className="group rounded-2xl border border-edge bg-surface p-5 transition-all hover:border-edge-strong hover:bg-surface-raised"
              >
                {p.featuredImage ? (
                  <img
                    src={p.featuredImage.url}
                    alt={p.featuredImage.altText ?? p.title}
                    className="h-48 w-full rounded-xl object-cover transition-transform group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-48 w-full rounded-xl bg-overlay" />
                )}
                <div className="mt-5">
                  <div className="text-base font-semibold text-fg transition-colors group-hover:text-accent">
                    {p.title}
                  </div>
                  <div className="mt-1.5 text-sm text-fg-muted line-clamp-2">
                    {p.description || '\u00a0'}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-accent">
                      {LISTING.pricePrefix}{' '}
                      {formatPrice(
                        p.priceRange.maxVariantPrice.amount,
                        p.priceRange.maxVariantPrice.currencyCode,
                      )}
                    </span>
                    <span className="text-xs text-fg-subtle transition-colors group-hover:text-fg-muted">
                      {LISTING.viewLabel}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
