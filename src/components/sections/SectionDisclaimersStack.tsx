import type { DisclaimerCard } from '../../content/types/sections';

type Props = {
  label?: string;
  labelColor?: string;
  heading: string;
  description?: string;
  disclaimers: DisclaimerCard[];
};

export function SectionDisclaimersStack({
  label,
  labelColor = 'text-fg-subtle',
  heading,
  description,
  disclaimers,
}: Props) {
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

      <div className="mt-12 space-y-6">
        {disclaimers.map((d) => (
          <div key={d.title} className="rounded-2xl border border-edge bg-surface p-7">
            <h3 className="font-semibold text-fg">{d.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{d.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
