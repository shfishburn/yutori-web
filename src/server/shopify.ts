import { createServerFn } from '@tanstack/react-start';

type ShopifyAdminEnv = {
  storeDomain: string;
  adminToken: string;
  apiVersion: string;
};

const QUOTED_VALUE_PATTERN = /^(['"])(.*)\1$/;

function cleanEnvValue(value: string | undefined): string | undefined {
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

function normalizeStoreDomain(value: string | undefined): string | undefined {
  const cleaned = cleanEnvValue(value);
  if (!cleaned) {
    return undefined;
  }

  return cleaned.replace(/^https?:\/\//i, '').replace(/\/+$/g, '');
}

function getShopifyAdminEnv(): ShopifyAdminEnv {
  const storeDomain = normalizeStoreDomain(
    process.env.SHOPIFY_ADMIN_STORE_DOMAIN ?? process.env.SHOPIFY_STORE_DOMAIN,
  );
  const adminToken = cleanEnvValue(
    process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  );
  const apiVersion = cleanEnvValue(process.env.SHOPIFY_ADMIN_API_VERSION) ?? '2024-01';

  if (!storeDomain || !adminToken) {
    const missing: string[] = [];
    if (!storeDomain) missing.push('SHOPIFY_ADMIN_STORE_DOMAIN or SHOPIFY_STORE_DOMAIN');
    if (!adminToken) missing.push('SHOPIFY_ADMIN_ACCESS_TOKEN');
    throw new Error(`Missing Shopify Admin env vars: ${missing.join(', ')}`);
  }

  return { storeDomain, adminToken, apiVersion };
}

/* ── Admin REST API helper ────────────────────────────────── */

async function shopifyAdminRest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
): Promise<T> {
  const { storeDomain, adminToken, apiVersion } = getShopifyAdminEnv();
  const url = `https://${storeDomain}/admin/api/${apiVersion}/${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      'X-Shopify-Access-Token': adminToken,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (method === 'DELETE') {
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Shopify Admin ${res.status}: ${text.slice(0, 500)}`);
    }
    return {} as T;
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Shopify Admin ${res.status}: ${JSON.stringify(json).slice(0, 500)}`);
  }
  return json as T;
}

type AdminProduct = {
  id: number;
  handle: string;
  title: string;
  body_html: string | null;
  images: { id: number; src: string; alt: string | null }[];
  variants: {
    id: number;
    title: string;
    price: string;
    available?: boolean;
  }[];
};

function mapAdminProductToShopify(p: AdminProduct): ShopifyProduct {
  const images = p.images.map((img) => ({ url: img.src, altText: img.alt }));
  const prices = p.variants.map((v) => parseFloat(v.price)).filter((n) => !isNaN(n));
  const minPrice = prices.length > 0 ? Math.min(...prices).toFixed(2) : '0.00';
  const maxPrice = prices.length > 0 ? Math.max(...prices).toFixed(2) : '0.00';

  return {
    id: `gid://shopify/Product/${p.id}`,
    handle: p.handle,
    title: p.title,
    description: p.body_html?.replace(/<[^>]*>/g, '') ?? '',
    featuredImage: images[0] ?? null,
    images: { edges: images.map((node) => ({ node })) },
    priceRange: {
      minVariantPrice: { amount: minPrice, currencyCode: 'USD' },
      maxVariantPrice: { amount: maxPrice, currencyCode: 'USD' },
    },
  };
}

function mapAdminVariantToShopify(
  v: AdminProduct['variants'][number],
): ShopifyVariant {
  return {
    id: `gid://shopify/ProductVariant/${v.id}`,
    title: v.title,
    availableForSale: v.available !== false,
    price: { amount: parseFloat(v.price).toFixed(2), currencyCode: 'USD' },
  };
}

/* ── Draft Order helpers ──────────────────────────────────── */

function extractNumericId(gid: string): number {
  const parts = gid.split('/');
  return parseInt(parts[parts.length - 1] ?? '0', 10);
}

type AdminDraftOrderLineItem = {
  id: number;
  variant_id: number | null;
  title: string;
  variant_title: string | null;
  quantity: number;
  price: string;
  product_id: number | null;
  image?: { src: string; alt?: string | null } | null;
};

type AdminDraftOrder = {
  id: number;
  invoice_url: string;
  total_price: string;
  currency: string;
  line_items: AdminDraftOrderLineItem[];
  status: string;
};

function mapDraftOrderToShopifyCart(order: AdminDraftOrder): ShopifyCart {
  return {
    id: `gid://shopify/DraftOrder/${order.id}`,
    checkoutUrl: order.invoice_url,
    totalQuantity: order.line_items.reduce((sum, li) => sum + li.quantity, 0),
    cost: {
      totalAmount: {
        amount: order.total_price,
        currencyCode: order.currency,
      },
    },
    lines: {
      edges: order.line_items.map((li) => ({
        node: {
          id: String(li.id),
          quantity: li.quantity,
          merchandise: {
            id: li.variant_id ? `gid://shopify/ProductVariant/${li.variant_id}` : '',
            title: li.variant_title ?? 'Default Title',
            product: {
              title: li.title,
              handle: '',
              featuredImage: li.image
                ? { url: li.image.src, altText: li.image.alt ?? null }
                : null,
            },
            price: { amount: li.price, currencyCode: order.currency },
          },
        },
      })),
    },
  };
}

export type ShopifyImage = { url: string; altText: string | null };

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
      featuredImage: { url: string; altText: string | null } | null;
    };
    price: { amount: string; currencyCode: string };
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  lines: { edges: { node: ShopifyCartLine }[] };
};

export const getProductVariants = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const handle = obj?.handle;
    if (typeof handle !== 'string' || handle.trim().length === 0) {
      throw new Error('handle is required');
    }
    return { handle };
  })
  .handler(async (ctx) => {
    // Use Admin REST API — find product by handle, then return its variants
    const data = await shopifyAdminRest<{ products: AdminProduct[] }>(
      `products.json?handle=${encodeURIComponent(ctx.data.handle)}&fields=id,handle,variants`,
    );
    const product = data.products[0];
    if (!product) return [];
    return product.variants.map(mapAdminVariantToShopify);
  });

export const createCart = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const lines = obj?.lines;
    if (!Array.isArray(lines) || lines.length === 0) {
      throw new Error('lines is required');
    }
    return { lines: lines as Array<{ merchandiseId: string; quantity: number }> };
  })
  .handler(async (ctx) => {
    const lineItems = ctx.data.lines.map((line) => ({
      variant_id: extractNumericId(line.merchandiseId),
      quantity: line.quantity,
    }));
    const data = await shopifyAdminRest<{ draft_order: AdminDraftOrder }>(
      'draft_orders.json',
      'POST',
      { draft_order: { line_items: lineItems } },
    );
    return mapDraftOrderToShopifyCart(data.draft_order);
  });

export const addCartLines = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const cartId = obj?.cartId;
    const lines = obj?.lines;
    if (typeof cartId !== 'string' || cartId.trim().length === 0) {
      throw new Error('cartId is required');
    }
    if (!Array.isArray(lines) || lines.length === 0) {
      throw new Error('lines is required');
    }
    return {
      cartId,
      lines: lines as Array<{ merchandiseId: string; quantity: number }>,
    };
  })
  .handler(async (ctx) => {
    const orderId = extractNumericId(ctx.data.cartId);
    const current = await shopifyAdminRest<{ draft_order: AdminDraftOrder }>(
      `draft_orders/${orderId}.json`,
    );
    const existingLines = current.draft_order.line_items.map((li) => ({ id: li.id }));
    const newLines = ctx.data.lines.map((line) => ({
      variant_id: extractNumericId(line.merchandiseId),
      quantity: line.quantity,
    }));
    const data = await shopifyAdminRest<{ draft_order: AdminDraftOrder }>(
      `draft_orders/${orderId}.json`,
      'PUT',
      { draft_order: { line_items: [...existingLines, ...newLines] } },
    );
    return mapDraftOrderToShopifyCart(data.draft_order);
  });

export const getCart = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const cartId = obj?.cartId;
    if (typeof cartId !== 'string' || cartId.trim().length === 0) {
      throw new Error('cartId is required');
    }
    return { cartId };
  })
  .handler(async (ctx) => {
    const orderId = extractNumericId(ctx.data.cartId);
    try {
      const data = await shopifyAdminRest<{ draft_order: AdminDraftOrder }>(
        `draft_orders/${orderId}.json`,
      );
      return mapDraftOrderToShopifyCart(data.draft_order);
    } catch (error) {
      if (error instanceof Error && /\b404\b/.test(error.message)) {
        return null;
      }
      throw error;
    }
  });

export const removeCartLines = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const cartId = obj?.cartId;
    const lineIds = obj?.lineIds;
    if (typeof cartId !== 'string' || cartId.trim().length === 0) {
      throw new Error('cartId is required');
    }
    if (!Array.isArray(lineIds) || lineIds.length === 0) {
      throw new Error('lineIds is required');
    }
    return { cartId, lineIds: lineIds as string[] };
  })
  .handler(async (ctx) => {
    const orderId = extractNumericId(ctx.data.cartId);
    const lineIdsToRemove = new Set(ctx.data.lineIds.map(Number));
    const current = await shopifyAdminRest<{ draft_order: AdminDraftOrder }>(
      `draft_orders/${orderId}.json`,
    );
    const remaining = current.draft_order.line_items.filter(
      (li) => !lineIdsToRemove.has(li.id),
    );
    if (remaining.length === 0) {
      await shopifyAdminRest(`draft_orders/${orderId}.json`, 'DELETE');
      return {
        id: current.draft_order.id.toString(),
        checkoutUrl: '',
        totalQuantity: 0,
        cost: { totalAmount: { amount: '0.00', currencyCode: current.draft_order.currency } },
        lines: { edges: [] as ShopifyCart['lines']['edges'] },
      } satisfies ShopifyCart;
    }
    const data = await shopifyAdminRest<{ draft_order: AdminDraftOrder }>(
      `draft_orders/${orderId}.json`,
      'PUT',
      { draft_order: { line_items: remaining.map((li) => ({ id: li.id })) } },
    );
    return mapDraftOrderToShopifyCart(data.draft_order);
  });

export const getProducts = createServerFn({ method: 'GET' }).handler(async () => {
  const data = await shopifyAdminRest<{ products: AdminProduct[] }>(
    'products.json?limit=12&status=active',
  );
  return data.products.map(mapAdminProductToShopify);
});

export const getProductByHandle = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const handle = obj?.handle;
    if (typeof handle !== 'string' || handle.trim().length === 0) {
      throw new Error('handle is required');
    }
    return { handle };
  })
  .handler(async (ctx) => {
    const data = await shopifyAdminRest<{ products: AdminProduct[] }>(
      `products.json?handle=${encodeURIComponent(ctx.data.handle)}&status=active`,
    );
    const product = data.products[0];
    return product ? mapAdminProductToShopify(product) : null;
  });
