import type { ShopifyVariant } from '../server/shopify';

type SelectCheckoutVariantOptions = {
  preferredVariantId?: string | null;
  preferDepositTitle?: boolean;
};

type SelectDisplayVariantOptions = {
  preferredVariantId?: string | null;
};

const DEPOSIT_TITLE_PATTERN = /\bdeposit\b/i;

export function selectCheckoutVariant(
  variants: ShopifyVariant[],
  options: SelectCheckoutVariantOptions = {},
): ShopifyVariant | null {
  if (variants.length === 0) {
    return null;
  }

  const available = variants.filter((variant) => variant.availableForSale);
  const candidates = available.length > 0 ? available : variants;

  const preferredVariantId = options.preferredVariantId?.trim();
  if (preferredVariantId) {
    const explicitMatch = candidates.find((variant) => variant.id === preferredVariantId);
    if (explicitMatch) {
      return explicitMatch;
    }
  }

  if (options.preferDepositTitle ?? true) {
    const depositMatch = candidates.find((variant) => DEPOSIT_TITLE_PATTERN.test(variant.title));
    if (depositMatch) {
      return depositMatch;
    }
  }

  return candidates[0] ?? null;
}

export function selectDisplayVariant(
  variants: ShopifyVariant[],
  options: SelectDisplayVariantOptions = {},
): ShopifyVariant | null {
  if (variants.length === 0) {
    return null;
  }

  const available = variants.filter((variant) => variant.availableForSale);
  const candidates = available.length > 0 ? available : variants;

  const preferredVariantId = options.preferredVariantId?.trim();
  if (preferredVariantId) {
    const explicitMatch = candidates.find((variant) => variant.id === preferredVariantId);
    if (explicitMatch) {
      return explicitMatch;
    }
  }

  const nonDeposit = candidates.find((variant) => !DEPOSIT_TITLE_PATTERN.test(variant.title));
  if (nonDeposit) {
    return nonDeposit;
  }

  let best = candidates[0] ?? null;
  let bestPrice = best ? parseFloat(best.price.amount) : Number.NEGATIVE_INFINITY;

  for (const variant of candidates) {
    const n = parseFloat(variant.price.amount);
    if (!Number.isFinite(n)) {
      continue;
    }
    if (!best || !Number.isFinite(bestPrice) || n > bestPrice) {
      best = variant;
      bestPrice = n;
    }
  }

  return best;
}
