import { describe, expect, it } from 'vitest';
import { selectCheckoutVariant } from './shopifyVariants';
import type { ShopifyVariant } from '../server/shopify';

function variant(overrides: Partial<ShopifyVariant>): ShopifyVariant {
  return {
    id: 'gid://shopify/ProductVariant/default',
    title: 'Default Title',
    availableForSale: true,
    price: { amount: '2500.00', currencyCode: 'USD' },
    ...overrides,
  };
}

describe('selectCheckoutVariant', () => {
  it('returns null when no variants exist', () => {
    expect(selectCheckoutVariant([])).toBeNull();
  });

  it('prefers explicit variant id when present', () => {
    const variants = [
      variant({ id: 'gid://shopify/ProductVariant/1', title: 'Full Price' }),
      variant({ id: 'gid://shopify/ProductVariant/2', title: '$2,500 Deposit' }),
    ];

    const selected = selectCheckoutVariant(variants, {
      preferredVariantId: 'gid://shopify/ProductVariant/1',
    });

    expect(selected?.id).toBe('gid://shopify/ProductVariant/1');
  });

  it('prefers deposit title when no explicit id is provided', () => {
    const variants = [
      variant({ id: 'gid://shopify/ProductVariant/1', title: 'Full Price' }),
      variant({ id: 'gid://shopify/ProductVariant/2', title: '$2,500 Deposit' }),
    ];

    const selected = selectCheckoutVariant(variants);

    expect(selected?.id).toBe('gid://shopify/ProductVariant/2');
  });

  it('falls back to first available variant when no deposit variant exists', () => {
    const variants = [
      variant({ id: 'gid://shopify/ProductVariant/1', title: 'Full Price - Walnut' }),
      variant({ id: 'gid://shopify/ProductVariant/2', title: 'Full Price - Cedar' }),
    ];

    const selected = selectCheckoutVariant(variants);

    expect(selected?.id).toBe('gid://shopify/ProductVariant/1');
  });
});
