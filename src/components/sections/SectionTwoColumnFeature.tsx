import type { ReactNode } from 'react';

type Props = {
  label?: string;
  labelColor?: string;
  heading: string;
  description?: string;
  bulletPoints: string[];
  children: ReactNode;
};

export function SectionTwoColumnFeature({
  label,
  labelColor = 'text-fg-subtle',
  heading,
  description,
  bulletPoints,
  children,
}: Props) {
  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <div>
        {label && (
          <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${labelColor}`}>
            {label}
          </p>
        )}
        <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {heading}
        </h2>
        {description && (
          <p className="mt-4 text-lg leading-relaxed text-fg-muted">
            {description}
          </p>
        )}
        <ul className="mt-8 space-y-3">
          {bulletPoints.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-fg-muted">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-heat" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center">{children}</div>
    </div>
  );
}
