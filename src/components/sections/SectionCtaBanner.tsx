import { Link } from '@tanstack/react-router';
import type { CtaBannerContent } from '../../content/types/sections';

type Props = {
  content: CtaBannerContent;
  checkoutAvailable: boolean;
  cartLoading: boolean;
  onAddToCart: () => void;
  secondaryLink?: string;
  accentColor?: 'heat' | 'accent';
};

export function SectionCtaBanner({
  content,
  checkoutAvailable,
  cartLoading,
  onAddToCart,
  secondaryLink = '/products',
  accentColor = 'heat',
}: Props) {
  const btnBg = accentColor === 'heat' ? 'bg-heat' : 'bg-accent';
  const btnText = accentColor === 'heat' ? 'text-heat-fg' : 'text-accent-fg';
  const gradFrom = accentColor === 'heat' ? 'from-heat/5' : 'from-accent/5';
  const gradTo = accentColor === 'heat' ? 'to-accent/5' : 'to-heat/5';

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="relative overflow-hidden rounded-3xl border border-edge bg-surface-raised p-10 text-center">
        <div className={`pointer-events-none absolute inset-0 bg-linear-to-r ${gradFrom} via-transparent ${gradTo}`} />
        <h2 className="relative text-3xl font-extrabold text-fg sm:text-4xl">
          {content.heading}
        </h2>
        <p className="relative mt-4 mx-auto max-w-xl text-fg-muted">
          {content.description}
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!checkoutAvailable || cartLoading}
            className={`rounded-xl ${btnBg} px-8 py-3.5 font-semibold ${btnText} transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {checkoutAvailable
              ? cartLoading
                ? content.primaryLoadingLabel
                : content.primaryLabel
              : content.primaryUnavailableLabel}
          </button>
          <Link
            to={secondaryLink}
            className="rounded-xl border border-edge-strong bg-surface px-8 py-3.5 font-semibold text-fg transition-colors hover:bg-overlay"
          >
            {content.secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
