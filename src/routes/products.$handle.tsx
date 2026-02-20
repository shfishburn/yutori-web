import * as React from 'react';
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
      <React.Fragment>
        <main className="mx-auto max-w-3xl px-6 py-12 text-white">
          <p>Product not found.</p>
          <Link to="/products" className="mt-4 inline-block text-cyan-300">
            Back to products
          </Link>
        </main>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/products" className="text-cyan-300 text-sm">
          ← Back to products
        </Link>

        <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            {product.featuredImage ? (
              <img
                src={product.featuredImage.url}
                alt={product.featuredImage.altText ?? product.title}
                className="w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="h-80 w-full rounded-2xl bg-slate-800" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">{product.title}</h1>
            <div className="mt-3 text-cyan-300 font-semibold">
              {product.priceRange.minVariantPrice.amount}{' '}
              {product.priceRange.minVariantPrice.currencyCode}
            </div>
            <p className="mt-4 text-slate-300 whitespace-pre-line">
              {product.description}
            </p>

            <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/40 p-5 text-slate-300">
              Checkout wiring is next: create a cart via Shopify Storefront API and redirect to checkout.
            </div>
          </div>
        </div>
      </main>
    </React.Fragment>
  );
}
