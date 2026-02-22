import type { IconFeatureCard } from '../../content/types/sections';
import { Icon } from '../Icon';

type Props = {
  label?: string;
  labelColor?: string;
  heading: string;
  description?: string;
  cards: IconFeatureCard[];
  columns?: 2 | 3;
  accentColor?: 'heat' | 'accent';
};

export function SectionIconFeatureCards({
  label,
  labelColor = 'text-heat',
  heading,
  description,
  cards,
  columns = 3,
  accentColor = 'heat',
}: Props) {
  const hlBorder = accentColor === 'heat' ? 'border-heat-dim/40' : 'border-accent-dim/40';
  const hlBg = accentColor === 'heat' ? 'bg-heat-subtle' : 'bg-accent-subtle';
  const hlText = accentColor === 'heat' ? 'text-heat' : 'text-accent';
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
                ? `${hlBorder} ${hlBg}`
                : 'border-edge bg-surface'
            }`}
          >
            <Icon name={c.icon} className="h-6 w-6 text-fg-muted" aria-label={c.iconLabel} />
            <h3 className={`mt-4 font-bold ${c.highlight ? hlText : 'text-fg'}`}>
              {c.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
