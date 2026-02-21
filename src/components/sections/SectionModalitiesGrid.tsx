import type { ModalityCard } from '../../content/types/sections';

type Props = {
  label?: string;
  labelColor?: string;
  heading: string;
  description?: string;
  modalities: ModalityCard[];
  disclaimer?: string;
};

export function SectionModalitiesGrid({
  label,
  labelColor = 'text-fg-subtle',
  heading,
  description,
  modalities,
  disclaimer,
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

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {modalities.map((m) => (
          <div key={m.title} className={`rounded-2xl border ${m.color} p-6`}>
            <h3 className={`text-lg font-bold ${m.titleColor}`}>{m.title}</h3>
            <ul className="mt-4 space-y-3">
              {m.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm leading-snug text-fg-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-fg-subtle" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {disclaimer && (
        <p className="mt-8 text-center text-sm text-fg-subtle">{disclaimer}</p>
      )}
    </>
  );
}
