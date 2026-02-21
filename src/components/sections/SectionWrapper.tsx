import type { ReactNode } from 'react';

type Props = {
  variant?: 'surface' | 'transparent';
  id?: string;
  className?: string;
  children: ReactNode;
};

export function SectionWrapper({
  variant = 'transparent',
  id,
  className,
  children,
}: Props) {
  const outer =
    variant === 'surface' ? 'border-y border-edge bg-surface' : '';

  return (
    <section
      id={id}
      className={`${outer} ${id ? 'scroll-mt-20' : ''} ${className ?? ''}`.trim()}
    >
      <div className="mx-auto max-w-6xl px-6 py-20">{children}</div>
    </section>
  );
}
