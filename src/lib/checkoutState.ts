import type { ShopifyVariant } from '../server/shopify';
import { selectCheckoutVariant } from './shopifyVariants';

type ResolveCheckoutVariantOptions = {
  variants: ShopifyVariant[];
  preferredVariantId?: string | null;
  fallbackEnvKeys?: string[];
  preferDepositTitle?: boolean;
};

const QUOTED_VALUE_PATTERN = /^(['"])(.*)\1$/;
const CHECKOUT_INFRASTRUCTURE_ERROR_PATTERN =
  /Missing Shopify env vars|Shopify request failed \((401|403|404)\)|Shopify GraphQL errors:.*(ACCESS_DENIED|NOT_FOUND|access denied|forbidden|unauthorized|invalid|not found)/i;

export function normalizeConfigValue(
  value: string | null | undefined,
): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const withoutNewlines = value.replace(/\r?\n/g, '').replace(/\\n/g, '');
  const trimmed = withoutNewlines.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  const quotedMatch = trimmed.match(QUOTED_VALUE_PATTERN);
  if (quotedMatch) {
    const unwrapped = quotedMatch[2]?.trim();
    return unwrapped && unwrapped.length > 0 ? unwrapped : undefined;
  }

  return trimmed;
}

export function readPublicEnvValue(key: string): string | undefined {
  const raw = (import.meta.env as Record<string, unknown>)[key];
  if (typeof raw !== 'string') {
    return undefined;
  }

  return normalizeConfigValue(raw);
}

export function resolvePreferredVariantIdFromEnv(
  envKeys: string[] = [],
): string | undefined {
  for (const key of envKeys) {
    const value = readPublicEnvValue(key);
    if (value) {
      return value;
    }
  }
  return undefined;
}

export function resolveCheckoutVariant(
  options: ResolveCheckoutVariantOptions,
): {
  checkoutVariant: ShopifyVariant | null;
  checkoutVariantId: string | null;
} {
  const preferredVariantId =
    normalizeConfigValue(options.preferredVariantId) ??
    resolvePreferredVariantIdFromEnv(options.fallbackEnvKeys ?? []);

  const checkoutVariant = selectCheckoutVariant(options.variants, {
    preferredVariantId,
    preferDepositTitle: options.preferDepositTitle,
  });

  return {
    checkoutVariant,
    checkoutVariantId: checkoutVariant?.id ?? preferredVariantId ?? null,
  };
}

export function isCheckoutInfrastructureError(loaderError: string | null): boolean {
  if (!loaderError) {
    return false;
  }

  return CHECKOUT_INFRASTRUCTURE_ERROR_PATTERN.test(loaderError);
}

export function getCheckoutUnavailableHelp(
  loaderError: string | null,
  fallbackMessage: string,
): string {
  if (!loaderError) {
    return fallbackMessage;
  }

  if (isCheckoutInfrastructureError(loaderError)) {
    return 'Checkout is not configured correctly. Contact support@yutorilabs.com.';
  }

  return 'Checkout is temporarily unavailable. Refresh and try again.';
}

export function buildVariantEnvKeyFromHandle(handle: string): string {
  const normalizedHandle = handle
    .trim()
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  return `VITE_SHOPIFY_${normalizedHandle}_VARIANT_ID`;
}
