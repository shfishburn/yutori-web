import { createFileRoute, Link } from '@tanstack/react-router';
import { getProductByHandle } from '../server/shopify';

export const Route = createFileRoute('/products/$handle')({
  loader: async ({ params }) => {
    const product = await getProductByHandle({
      data: { handle: params.handle },
    });
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.product
          ? `Yutori — ${loaderData.product.title}`
          : 'Yutori — Product',
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();

  if (!product) {
    return (
      <main className="flex-1 mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-2xl font-bold text-fg">Product not found</p>
        <p className="mt-2 text-fg-muted">This product may have been removed or the link is incorrect.</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
        >
          Back to products
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
          {/* Image */}
          <div>
            {product.featuredImage ? (
              <img
                src={product.featuredImage.url}
                alt={product.featuredImage.altText ?? product.title}
                className="w-full rounded-2xl border border-edge object-cover"
              />
            ) : (
              <div className="aspect-square w-full rounded-2xl border border-edge bg-overlay" />
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-fg">{product.title}</h1>
            <div className="mt-3 text-2xl font-bold text-accent">
              {product.priceRange.minVariantPrice.amount}{' '}{product.priceRange.minVariantPrice.currencyCode}
            </div>
            <p className="mt-5 text-base leading-relaxed text-fg-muted whitespace-pre-line">{product.description}</p>

            {/* App callout */}
            <div className="mt-8 rounded-2xl border border-accent-dim/40 bg-accent-subtle p-5">
              <p className="text-sm font-semibold text-accent">App-connected</p>
              <p className="mt-1 text-sm text-fg-muted">
                Pair this product with a Yutori sensor to automatically log every session —
                temperature curves, duration, and recovery data — in the app.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-accent px-6 py-4 font-semibold text-accent-fg opacity-50"
              >
                Add to cart — coming soon
              </button>
              <p className="mt-2 text-center text-xs text-fg-subtle">Checkout wiring in progress</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
