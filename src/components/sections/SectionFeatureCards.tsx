import type { FeatureCard } from '../../content/types/sections';

type Props = {
  label?: string;
  labelColor?: string;
  heading: string;
  description?: string;
  cards: FeatureCard[];
  columns?: 2 | 3;
};

export function SectionFeatureCards({
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
      : 'sm:grid-cols-2 lg:grid-cols-3';

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
          <div key={c.title} className="rounded-2xl border border-edge bg-canvas p-6">
            <h3 className="font-semibold text-fg">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
