import type { IconFeatureCard } from '../../content/types/sections';

type Props = {
  label?: string;
  labelColor?: string;
  heading: string;
  description?: string;
  cards: IconFeatureCard[];
  columns?: 2 | 3;
};

export function SectionIconFeatureCards({
  label,
  labelColor = 'text-heat',
  heading,
  description,
  cards,
  columns = 3,
}: Props) {
  const gridCols =
    columns === 2
      ? 'sm:grid-cols-2'
      : 'grid-cols-1 lg:grid-cols-3';

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
      <div className={`mt-12 grid gap-8 ${gridCols}`}>
        {cards.map((c) => (
          <div
            key={c.title}
            className={`rounded-2xl border p-7 ${
              c.highlight
                ? 'border-heat-dim/40 bg-heat-subtle'
                : 'border-edge bg-surface'
            }`}
          >
            <div className="text-2xl" role="img" aria-label={c.iconLabel}>{c.icon}</div>
            <h3 className={`mt-4 font-bold ${c.highlight ? 'text-heat' : 'text-fg'}`}>
              {c.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
