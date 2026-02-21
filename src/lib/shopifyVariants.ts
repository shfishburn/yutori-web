import type { ShopifyVariant } from '../server/shopify';

type SelectCheckoutVariantOptions = {
  preferredVariantId?: string | null;
  preferDepositTitle?: boolean;
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
