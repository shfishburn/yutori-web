import type { BadgeFeatureCard, EmergencyCallout } from '../../content/types/sections';

type Props = {
  label?: string;
  labelColor?: string;
  heading: string;
  description?: string;
  features: BadgeFeatureCard[];
  callout?: EmergencyCallout;
};

export function SectionBadgeFeatureGrid({
  label,
  labelColor = 'text-accent',
  heading,
  description,
  features,
  callout,
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

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-edge bg-surface p-7">
            <span className={`inline-block rounded-full px-3 py-1 text-micro font-bold uppercase tracking-wider ${f.badgeColor}`}>
              {f.badge}
            </span>
            <h3 className="mt-4 text-lg font-bold text-fg">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{f.body}</p>
          </div>
        ))}
      </div>

      {callout && (
        <div className="mt-8 rounded-2xl border border-heat-dim/40 bg-heat-subtle p-7">
          <div className="flex items-start gap-4">
            <div className="text-2xl" role="img" aria-label="Emergency">{'\ud83d\udea8'}</div>
            <div>
              <h3 className="font-bold text-heat">{callout.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{callout.body}</p>
              {callout.disclaimer && (
                <p className="mt-3 text-xs text-fg-subtle italic">{callout.disclaimer}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
