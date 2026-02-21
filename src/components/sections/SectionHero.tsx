import { Link } from '@tanstack/react-router';
import type { ShopifyImage } from '../../server/shopify';
import type { HeroContent } from '../../content/types/sections';
import { ProductGallery } from '../ProductGallery';

type Props = {
  content: HeroContent;
  images: ShopifyImage[];
  livePrice: string | null;
  checkoutAvailable: boolean;
  cartLoading: boolean;
  cartError: string | null;
  onAddToCart: () => void;
  accentColor?: 'heat' | 'accent';
  emptyIcon?: string;
};

const colorMap = {
  heat: {
    badgeBorder: 'border-heat-dim/40',
    badgeBg: 'bg-heat-subtle',
    badgeText: 'text-heat',
    badgeDot: 'bg-heat',
    priceText: 'text-heat',
    statText: 'text-heat',
    btnBg: 'bg-heat',
    btnText: 'text-heat-fg',
    blur1: 'bg-heat/10',
    blur2: 'bg-heat/5',
  },
  accent: {
    badgeBorder: 'border-accent-dim/40',
    badgeBg: 'bg-accent-subtle',
    badgeText: 'text-accent',
    badgeDot: 'bg-accent',
    priceText: 'text-accent',
    statText: 'text-accent',
    btnBg: 'bg-accent',
    btnText: 'text-accent-fg',
    blur1: 'bg-accent/10',
    blur2: 'bg-accent/5',
  },
} as const;

export function SectionHero({
  content,
  images,
  livePrice,
  checkoutAvailable,
  cartLoading,
  cartError,
  onAddToCart,
  accentColor = 'heat',
  emptyIcon = '\ud83d\uddbc\ufe0f',
}: Props) {
  const c = colorMap[accentColor];

  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className={`pointer-events-none absolute -top-40 left-1/3 h-120 w-120 -translate-x-1/2 rounded-full ${c.blur1} blur-3xl`} />
      <div className={`pointer-events-none absolute -top-32 right-1/4 h-96 w-96 translate-x-1/2 rounded-full ${c.blur2} blur-3xl`} />

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 lg:pt-28">
        <nav className="mb-8 flex items-center gap-2 text-sm text-fg-subtle">
          <Link to="/products" className="transition-colors hover:text-fg-muted">Products</Link>
          <span>/</span>
          <span className="text-fg-muted">{content.title}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <ProductGallery
            images={images}
            productTitle={content.title}
            emptyIcon={emptyIcon}
            emptyLabel={content.imagePlaceholder}
          />

          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border ${c.badgeBorder} ${c.badgeBg} px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${c.badgeText}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${c.badgeDot}`} />
              {content.badge}
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
              {content.title}
            </h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className={`text-2xl font-bold ${c.priceText}`}>
                {livePrice ?? content.fallbackPrice}
              </span>
              <span className="text-sm text-fg-muted">{content.priceNote}</span>
            </div>

            <p className="mt-4 text-lg leading-relaxed text-fg-muted">
              {content.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {content.quickStats.map((s) => (
                <div key={s.label} className="rounded-xl border border-edge bg-surface px-4 py-3 text-center">
                  <div className={`text-lg font-bold ${c.statText}`}>{s.value}</div>
                  <div className="mt-0.5 text-xs text-fg-subtle">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={onAddToCart}
                disabled={!checkoutAvailable || cartLoading}
                className={`block w-full rounded-xl ${c.btnBg} px-6 py-4 text-center font-semibold ${c.btnText} transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {checkoutAvailable
                  ? cartLoading
                    ? content.ctaLoadingLabel
                    : content.ctaLabel
                  : content.ctaUnavailableLabel}
              </button>
              <p className="mt-2 text-center text-xs text-fg-subtle">
                {content.depositNote}
              </p>
              {!checkoutAvailable ? (
                <p role="status" className="mt-2 text-center text-xs text-fg-subtle">
                  {content.ctaUnavailableHelp}
                </p>
              ) : null}
              {cartError ? (
                <p role="alert" className="mt-2 text-center text-xs text-red-600">
                  {cartError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
