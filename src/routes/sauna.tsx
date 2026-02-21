import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  getProductByHandle,
  getProductVariants,
  type ShopifyProduct,
  type ShopifyVariant,
} from '../server/shopify';
import { useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { selectCheckoutVariant } from '../lib/shopifyVariants';
import {
  buildSeoHead,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
} from '../lib/seo';
import {
  PRODUCT_HANDLE,
  SEO,
  HERO,
  THE_SPACE,
  HEAT_CLIMATE,
  LIGHT_THERAPY,
  APP_SECTION,
  SCIENCE,
  INSTALLATION,
  PRICING,
  SPECS_SECTION,
  SPECS,
  SAFETY,
  CTA,
} from '../content/sauna';

export const Route = createFileRoute('/sauna')({
  loader: async () => {
    try {
      const [product, variants] = await Promise.all([
        getProductByHandle({ data: { handle: PRODUCT_HANDLE } }),
        getProductVariants({ data: { handle: PRODUCT_HANDLE } }),
      ]);
      return { product, variants };
    } catch {
      return {
        product: null as ShopifyProduct | null,
        variants: [] as ShopifyVariant[],
      };
    }
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    const imageUrl = product?.featuredImage?.url ?? DEFAULT_OG_IMAGE_URL;

    return buildSeoHead({
      title: SEO.title,
      description: SEO.description,
      path: SEO.path,
      ogType: 'product',
      imageUrl,
      imageWidth: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_HEIGHT,
      imageType: product?.featuredImage ? undefined : DEFAULT_OG_IMAGE_TYPE,
    });
  },
  component: SaunaPage,
});

/* ── Page ───────────────────────────────────────────────────── */

function SaunaPage() {
  const { product, variants } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addItem, loading: cartLoading } = useCart();
  const [cartError, setCartError] = useState<string | null>(null);

  const price = product?.priceRange?.minVariantPrice;
  const image = product?.featuredImage;
  const preferredDepositVariantId =
    import.meta.env.VITE_SHOPIFY_PULSE_SAUNA_DEPOSIT_VARIANT_ID as string | undefined;

  const depositVariant = selectCheckoutVariant(variants, {
    preferredVariantId: preferredDepositVariantId,
    preferDepositTitle: true,
  });

  const handleAddToCart = async () => {
    if (!depositVariant) return;
    setCartError(null);
    try {
      await addItem(depositVariant.id);
      await navigate({ to: '/cart' });
    } catch {
      setCartError(HERO.ctaError);
    }
  };

  return (
    <main className="flex-1">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-canvas">
        <div className="pointer-events-none absolute -top-40 left-1/3 h-120 w-120 -translate-x-1/2 rounded-full bg-heat/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-heat/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 lg:pt-28">
          <nav className="mb-8 flex items-center gap-2 text-sm text-fg-subtle">
            <Link to="/products" className="transition-colors hover:text-fg-muted">Products</Link>
            <span>/</span>
            <span className="text-fg-muted">{HERO.title}</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            <div className="aspect-4/3 w-full overflow-hidden rounded-2xl border border-edge bg-surface-raised">
              {image ? (
                <img
                  src={image.url}
                  alt={image.altText ?? HERO.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-fg-subtle">
                  <div className="text-center">
                    <div className="text-5xl" role="img" aria-label="Sauna">{'\ud83d\udd25'}</div>
                    <p className="mt-3 text-sm">{HERO.imagePlaceholder}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-heat-dim/40 bg-heat-subtle px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-heat">
                <span className="h-1.5 w-1.5 rounded-full bg-heat" />
                {HERO.badge}
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
                {HERO.title}
              </h1>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-heat">
                  {price ? formatPrice(price.amount, price.currencyCode) : HERO.fallbackPrice}
                </span>
                <span className="text-sm text-fg-muted">{HERO.priceNote}</span>
              </div>

              <p className="mt-4 text-lg leading-relaxed text-fg-muted">
                {HERO.description}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {HERO.quickStats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-edge bg-surface px-4 py-3 text-center">
                    <div className="text-lg font-bold text-heat">{s.value}</div>
                    <div className="mt-0.5 text-xs text-fg-subtle">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                {depositVariant ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className="block w-full rounded-xl bg-heat px-6 py-4 text-center font-semibold text-heat-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cartLoading ? HERO.ctaLoadingLabel : HERO.ctaLabel}
                  </button>
                ) : (
                  <a
                    href="#pricing"
                    className="block w-full rounded-xl bg-heat px-6 py-4 text-center font-semibold text-heat-fg transition-opacity hover:opacity-90"
                  >
                    {HERO.ctaFallbackLabel}
                  </a>
                )}
                <p className="mt-2 text-center text-xs text-fg-subtle">
                  {HERO.depositNote}
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
      </section>

      {/* ── The Space ──────────────────────────────────────── */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-heat">{THE_SPACE.label}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            {THE_SPACE.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fg-muted">
            {THE_SPACE.description}
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {THE_SPACE.cards.map((c) => (
              <div key={c.title} className="rounded-2xl border border-edge bg-canvas p-6">
                <h3 className="font-semibold text-fg">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Heat & Climate ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-heat">{HEAT_CLIMATE.label}</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {HEAT_CLIMATE.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fg-muted">
          {HEAT_CLIMATE.description}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {HEAT_CLIMATE.cards.map((c) => (
            <div
              key={c.title}
              className={`rounded-2xl border p-7 ${c.highlight ? 'border-heat-dim/40 bg-heat-subtle' : 'border-edge bg-surface'}`}
            >
              <div className="text-2xl" role="img" aria-label={c.iconLabel}>{c.icon}</div>
              <h3 className={`mt-4 font-bold ${c.highlight ? 'text-heat' : 'text-fg'}`}>{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Red / NIR Light ────────────────────────────────── */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{LIGHT_THERAPY.label}</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
                {LIGHT_THERAPY.heading}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-fg-muted">
                {LIGHT_THERAPY.description}
              </p>
              <ul className="mt-8 space-y-3">
                {LIGHT_THERAPY.bulletPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-fg-muted">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-heat" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="aspect-square w-64 rounded-2xl border border-edge bg-canvas p-8 sm:w-72">
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <div className="flex gap-2">
                    {LIGHT_THERAPY.wavelengths.map((nm) => (
                      <div key={nm} className="flex flex-col items-center gap-1">
                        <div
                          className="h-10 w-3 rounded-sm"
                          style={{
                            backgroundColor:
                              parseInt(nm) < 700
                                ? `hsl(${Math.round(0 + (parseInt(nm) - 630) * 0.5)}, 80%, 50%)`
                                : `hsl(340, 60%, ${35 + (parseInt(nm) - 810) * 0.3}%)`,
                            opacity: 0.8,
                          }}
                        />
                        <span className="text-[10px] text-fg-subtle">{nm}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-fg-subtle">{LIGHT_THERAPY.spectrumLabel}</p>
                  <p className="text-[10px] text-fg-subtle">{LIGHT_THERAPY.spectrumUnit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Yutori App ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">{APP_SECTION.label}</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {APP_SECTION.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fg-muted">
          {APP_SECTION.description}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {APP_SECTION.features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-edge bg-surface p-7">
              <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${f.badgeColor}`}>
                {f.badge}
              </span>
              <h3 className="mt-4 text-lg font-bold text-fg">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-heat-dim/40 bg-heat-subtle p-7">
          <div className="flex items-start gap-4">
            <div className="text-2xl" role="img" aria-label="Emergency">{'\ud83d\udea8'}</div>
            <div>
              <h3 className="font-bold text-heat">{APP_SECTION.emergency.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {APP_SECTION.emergency.body}
              </p>
              <p className="mt-3 text-xs text-fg-subtle italic">
                {APP_SECTION.emergency.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Science ────────────────────────────────────── */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{SCIENCE.label}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            {SCIENCE.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fg-muted">
            {SCIENCE.description}
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SCIENCE.modalities.map((s) => (
              <div key={s.title} className={`rounded-2xl border ${s.color} p-6`}>
                <h3 className={`text-lg font-bold ${s.titleColor}`}>{s.title}</h3>
                <ul className="mt-4 space-y-3">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm leading-snug text-fg-muted">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-fg-subtle" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-fg-subtle">
            {SCIENCE.disclaimer}
          </p>
        </div>
      </section>

      {/* ── Installation ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{INSTALLATION.label}</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {INSTALLATION.heading}
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {INSTALLATION.requirements.map((r) => (
            <div key={r.title} className="rounded-2xl border border-edge bg-surface p-7">
              <h3 className="font-bold text-fg">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing & Delivery ──────────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-heat">{PRICING.label}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            {PRICING.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fg-muted">
            {PRICING.description}
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PRICING.cards.map((c) => (
              <div
                key={c.title}
                className={`rounded-2xl border p-7 ${c.highlight ? 'border-heat-dim/40 bg-heat-subtle' : 'border-edge bg-canvas'}`}
              >
                <div className={`text-2xl font-bold ${c.highlight ? 'text-heat' : 'text-fg'}`}>{c.value}</div>
                <h3 className="mt-2 font-bold text-fg">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-fg-subtle">
            {PRICING.finePrint}
          </p>
        </div>
      </section>

      {/* ── Full Specs ─────────────────────────────────────── */}
      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{SPECS_SECTION.label}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            {SPECS_SECTION.heading}
          </h2>

          <div className="mt-12 overflow-hidden rounded-2xl border border-edge">
            <table className="w-full text-sm">
              <tbody>
                {SPECS.map(([label, value], i) => (
                  <tr key={label} className={i % 2 === 0 ? 'bg-canvas' : 'bg-surface'}>
                    <td className="px-6 py-4 font-medium text-fg-muted whitespace-nowrap align-top w-48">
                      {label}
                    </td>
                    <td className="px-6 py-4 text-fg">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Safety & Limitations ───────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{SAFETY.label}</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {SAFETY.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fg-muted">
          {SAFETY.description}
        </p>

        <div className="mt-12 space-y-6">
          {SAFETY.disclaimers.map((d) => (
            <div key={d.title} className="rounded-2xl border border-edge bg-surface p-7">
              <h3 className="font-semibold text-fg">{d.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-edge bg-surface-raised p-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-heat/5 via-transparent to-accent/5" />
          <h2 className="relative text-3xl font-extrabold text-fg sm:text-4xl">
            {CTA.heading}
          </h2>
          <p className="relative mt-4 mx-auto max-w-xl text-fg-muted">
            {CTA.description}
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            {depositVariant ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="rounded-xl bg-heat px-8 py-3.5 font-semibold text-heat-fg transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {cartLoading ? CTA.primaryLoadingLabel : CTA.primaryLabel}
              </button>
            ) : (
              <a
                href="#pricing"
                className="rounded-xl bg-heat px-8 py-3.5 font-semibold text-heat-fg transition-opacity hover:opacity-90"
              >
                {CTA.primaryFallbackLabel}
              </a>
            )}
            <Link
              to="/products"
              className="rounded-xl border border-edge-strong bg-surface px-8 py-3.5 font-semibold text-fg transition-colors hover:bg-overlay"
            >
              {CTA.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
