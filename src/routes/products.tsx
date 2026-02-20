import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { getProducts, type ShopifyProduct } from '../server/shopify';

export const Route = createFileRoute('/products')({
  loader: async () => {
    return await getProducts();
  },
  head: () => ({
    meta: [{ title: 'Yutori — Products' }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const products = (Route.useLoaderData() ?? []) as ShopifyProduct[];

  return (
    <React.Fragment>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <p className="mt-2 text-slate-300">
          Shop saunas, cold plunges, sensors, and bundles.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: ShopifyProduct) => (
            <Link
              key={p.id}
              to="/products/$handle"
              params={{handle: p.handle}}
              className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 hover:border-slate-500 transition"
            >
              {p.featuredImage ? (
                <img
                  src={p.featuredImage.url}
                  alt={p.featuredImage.altText ?? p.title}
                  className="h-44 w-full rounded-xl object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-44 w-full rounded-xl bg-slate-800" />
              )}
              <div className="mt-4">
                <div className="text-lg font-semibold text-white">{p.title}</div>
                <div className="mt-1 text-sm text-slate-300 line-clamp-2">
                  {p.description || ' '}
                </div>
                <div className="mt-3 text-sm font-semibold text-cyan-300">
                  From {p.priceRange.minVariantPrice.amount}{' '}
                  {p.priceRange.minVariantPrice.currencyCode}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-sm text-slate-400">
          Note: Product data is pulled from Shopify. Configure env vars before deploying.
        </div>
      </main>
    </React.Fragment>
  );
}
