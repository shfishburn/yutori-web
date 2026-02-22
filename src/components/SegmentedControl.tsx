import { useState, useRef, useLayoutEffect, useCallback } from 'react';

export type Segment<T extends string = string> = {
  key: T;
  label: string;
};

type Props<T extends string> = {
  segments: Segment<T>[];
  selected: T;
  onChange: (key: T) => void;
};

/**
 * Accessible segmented control with animated pill indicator.
 * Uses semantic design tokens throughout.
 */
export function SegmentedControl<T extends string>({
  segments,
  selected,
  onChange,
}: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  const updatePill = useCallback(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector<HTMLButtonElement>(
      `[data-segment="${selected}"]`,
    );
    if (activeBtn) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setPill({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [selected]);

  useLayoutEffect(() => {
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [updatePill]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      className="relative inline-flex rounded-xl border border-edge bg-canvas p-1"
    >
      {/* Animated pill */}
      <div
        className="absolute top-1 h-[calc(100%-0.5rem)] rounded-lg bg-surface shadow-sm transition-all duration-200 ease-out"
        style={{ left: pill.left, width: pill.width }}
        aria-hidden="true"
      />

      {segments.map((seg) => {
        const isActive = seg.key === selected;
        return (
          <button
            key={seg.key}
            role="tab"
            type="button"
            data-segment={seg.key}
            aria-selected={isActive}
            onClick={() => onChange(seg.key)}
            className={`relative z-10 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'text-fg'
                : 'text-fg-muted hover:text-fg-subtle'
            }`}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
