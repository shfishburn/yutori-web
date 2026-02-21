import { useState } from 'react';
import type { ShopifyImage } from '../server/shopify';

type Props = {
  images: ShopifyImage[];
  productTitle: string;
  /** Placeholder shown when images array is empty */
  emptyIcon?: string;
  emptyLabel?: string;
};

/**
 * Stacked product image gallery.
 * Desktop: large hero image + vertical thumbnail strip.
 * Mobile: large hero image + horizontal scrollable thumbnail strip.
 * Clicking a thumbnail swaps it into the hero slot.
 */
export function ProductGallery({
  images,
  productTitle,
  emptyIcon = '\ud83d\uddbc\ufe0f',
  emptyLabel = 'Product images coming soon',
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-4/3 w-full overflow-hidden rounded-2xl border border-edge bg-surface-raised">
        <div className="flex h-full items-center justify-center text-fg-subtle">
          <div className="text-center">
            <div className="text-5xl" role="img" aria-label={productTitle}>{emptyIcon}</div>
            <p className="mt-3 text-sm">{emptyLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0];

  if (images.length === 1) {
    return (
      <div className="aspect-4/3 w-full overflow-hidden rounded-2xl border border-edge bg-surface-raised">
        <img
          src={active.url}
          alt={active.altText ?? productTitle}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Hero image */}
      <div className="aspect-4/3 w-full overflow-hidden rounded-2xl border border-edge bg-surface-raised">
        <img
          src={active.url}
          alt={active.altText ?? productTitle}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={i === activeIndex ? 'true' : undefined}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
              i === activeIndex
                ? 'border-heat ring-1 ring-heat/30'
                : 'border-edge hover:border-edge-strong'
            }`}
          >
            <img
              src={img.url}
              alt={img.altText ?? `${productTitle} thumbnail ${i + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
