import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { buildSeoHead } from '../lib/seo';
import { Icon } from '../components/Icon';
import { SEO, PAGE, DEPOSIT_NOTICE, TERMS, CHECKOUT } from '../content/cart';

const DEPOSIT_PATTERN = /\bdeposit\b/i;

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
  const { cart, loading, removeItem } = useCart();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  const isEmpty = lines.length === 0;
  const hasDepositLine = lines.some(
    (line) =>
      line.sellingPlanAllocation != null ||
      DEPOSIT_PATTERN.test(line.merchandise.title) ||
      DEPOSIT_PATTERN.test(line.merchandise.product.title),
  );

  const handleRemove = async (lineId: string) => {
    setCartError(null);
    try {
      await removeItem(lineId);
    } catch {
      setCartError('Unable to update your cart right now. Please refresh and try again.');
    }
  };

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-fg">{PAGE.heading}</h1>

        {isEmpty ? (
          <div className="mt-12 text-center">
            <Icon name="shopping-bag" className="mx-auto mb-4 h-12 w-12 text-fg-subtle" aria-hidden="true" />
            <p className="text-lg text-fg-muted">{PAGE.emptyMessage}</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
            >
              {PAGE.emptyCtaLabel}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 divide-y divide-edge rounded-2xl border border-edge">
              {lines.map((line) => (
                <div key={line.id} className="flex items-start gap-4 p-5">
                  {line.merchandise.product.featuredImage ? (
                    <img
                      src={line.merchandise.product.featuredImage.url}
                      alt={
                        line.merchandise.product.featuredImage.altText ??
                        line.merchandise.product.title
                      }
                      className="h-20 w-20 shrink-0 rounded-xl border border-edge object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 shrink-0 rounded-xl border border-edge bg-surface" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-fg">{line.merchandise.product.title}</p>
                    {line.merchandise.title !== 'Default Title' ? (
                      <p className="mt-0.5 text-sm text-fg-muted">{line.merchandise.title}</p>
                    ) : null}
                    <p className="mt-1 text-sm font-medium text-heat">
                      {formatPrice(
                        line.merchandise.price.amount,
                        line.merchandise.price.currencyCode,
                      )}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-surface px-2 py-0.5 text-xs text-fg-muted">
                      {PAGE.qtyLabel} {line.quantity}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(line.id)}
                    disabled={loading}
                    aria-label={PAGE.removeLabel}
                    className="shrink-0 rounded-lg border border-edge p-1.5 text-fg-muted transition-colors hover:bg-surface hover:text-fg disabled:opacity-50"
                  >
                    <Icon name="x-mark" className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <hr className="mt-8 border-edge" />

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-edge bg-surface p-5">
              <span className="font-semibold text-fg">{PAGE.totalLabel}</span>
              <span className="text-xl font-bold text-heat">
                {formatPrice(
                  cart?.cost.totalAmount.amount ?? '0',
                  cart?.cost.totalAmount.currencyCode ?? 'USD',
                )}
              </span>
            </div>

            {hasDepositLine ? (
              <div className="mt-6 rounded-2xl border border-heat-dim/40 bg-heat-subtle p-5">
                <p className="text-sm font-semibold text-heat">{DEPOSIT_NOTICE.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                  You are checking out for a <strong>{DEPOSIT_NOTICE.boldPhrase}</strong>. The
                  remaining balance is due based on your purchase agreement.
                </p>
              </div>
            ) : null}

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-edge bg-surface p-5 transition-colors hover:bg-overlay">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-edge accent-heat"
              />
              <span className="text-sm leading-relaxed text-fg-muted">
                {TERMS.prefix} <strong>{TERMS.boldWord}</strong> {TERMS.middle}{' '}
                <Link to="/terms" className="font-medium text-fg underline underline-offset-2">
                  {TERMS.termsLabel}
                </Link>{' '}
                {TERMS.conjunction}{' '}
                <Link to="/privacy" className="font-medium text-fg underline underline-offset-2">
                  {TERMS.privacyLabel}
                </Link>
                .
              </span>
            </label>

            <a
              href={termsAccepted ? cart?.checkoutUrl : undefined}
              onClick={(e) => {
                if (!termsAccepted) {
                  e.preventDefault();
                }
              }}
              aria-disabled={!termsAccepted || loading}
              className={`mt-6 block w-full rounded-xl px-6 py-4 text-center font-semibold transition-opacity bg-heat text-heat-fg hover:opacity-90 ${                !termsAccepted || loading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {loading ? CHECKOUT.loadingLabel : CHECKOUT.label}
            </a>

            <p className="mt-3 text-center text-xs text-fg-subtle">{CHECKOUT.redirectNote}</p>
            {cartError ? (
              <p role="alert" className="mt-2 text-center text-xs text-danger">
                {cartError}
              </p>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
