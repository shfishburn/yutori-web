import { createFileRoute, Link } from '@tanstack/react-router';
import { buildSeoHead } from '../lib/seo';
import { SEO, PAGE } from '../content/cart';

export const Route = createFileRoute('/cart')({
  head: () =>
    buildSeoHead({
      title: SEO.title,
      description: SEO.description,
      path: SEO.path,
    }),
  component: CartPage,
});

function CartPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-fg">{PAGE.heading}</h1>
        <p className="mt-4 text-lg text-fg-muted">{PAGE.emptyMessage}</p>
        <p className="mt-2 text-sm text-fg-subtle">{PAGE.checkoutNote}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/sauna"
            className="rounded-xl bg-heat px-6 py-3 text-sm font-semibold text-heat-fg transition-opacity hover:opacity-90"
          >
            {PAGE.viewSauna}
          </Link>
          <Link
            to="/sensors"
            className="rounded-xl border border-edge bg-surface px-6 py-3 text-sm font-semibold text-fg transition-colors hover:bg-overlay"
          >
            {PAGE.viewSensors}
          </Link>
        </div>
      </div>
    </main>
  );
}
