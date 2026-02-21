import type { PricingCard } from '../../content/types/sections';

type Props = {
  label?: string;
  labelColor?: string;
  heading: string;
  description?: string;
  cards: PricingCard[];
  columns?: 2 | 3;
  finePrint?: string;
};

export function SectionPricingCards({
  label,
  labelColor = 'text-heat',
  heading,
  description,
  cards,
  columns = 3,
  finePrint,
}: Props) {
  const gridCols =
    columns === 2
      ? 'sm:grid-cols-2'
      : 'sm:grid-cols-3';

  return (
    <>
      {label && (
        <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${labelColor}`}>
          {label}
        </p>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
        {heading}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fg-muted">
          {description}
        </p>
      )}

      <div className={`mt-12 grid grid-cols-1 gap-6 ${gridCols}`}>
        {cards.map((c) => (
          <div
            key={c.title}
            className={`rounded-2xl border p-7 ${
              c.highlight
                ? 'border-heat-dim/40 bg-heat-subtle'
                : 'border-edge bg-canvas'
            }`}
          >
            <div className={`text-2xl font-bold ${c.highlight ? 'text-heat' : 'text-fg'}`}>
              {c.value}
            </div>
            <h3 className="mt-2 font-bold text-fg">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.body}</p>
          </div>
        ))}
      </div>

      {finePrint && (
        <p className="mt-8 text-xs text-fg-subtle">{finePrint}</p>
      )}
    </>
  );
}
