import { createFileRoute, Link } from '@tanstack/react-router';
import { getProducts, type ShopifyProduct } from '../server/shopify';
import {
  buildSeoHead,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
} from '../lib/seo';

export const Route = createFileRoute('/products')({
  loader: async () => {
    return await getProducts();
  },
  head: () => ({
    ...buildSeoHead({
      title: 'Yutori — Products',
      description:
        'Saunas, cold plunges, and Bluetooth sensors built for the serious thermal wellness practitioner.',
      path: '/products',
      imageWidth: DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
      imageType: DEFAULT_OG_IMAGE_TYPE,
    }),
  }),
  component: ProductsPage,
  errorComponent: ProductsError,
});

function ProductsError() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-20 text-center">
      <p className="text-2xl font-bold text-fg">Unable to load products</p>
      <p className="mt-2 text-fg-muted">Please try again in a moment.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  );
}

function ProductsPage() {
  const products = (Route.useLoaderData() ?? []) as ShopifyProduct[];

  return (
    <main className="flex-1">
      <div className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-fg">Products</h1>
          <p className="mt-2 text-lg text-fg-muted">Saunas, cold plunges, and sensors — built for the serious practitioner.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-edge bg-surface p-12 text-center">
            <p className="text-fg-muted">No products yet. Check back soon.</p>
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
                  <div className="text-base font-semibold text-fg transition-colors group-hover:text-accent">{p.title}</div>
                  <div className="mt-1.5 text-sm text-fg-muted line-clamp-2">{p.description || '\u00a0'}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-accent">From {p.priceRange.minVariantPrice.amount} {p.priceRange.minVariantPrice.currencyCode}</span>
                    <span className="text-xs text-fg-subtle transition-colors group-hover:text-fg-muted">View →</span>
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
