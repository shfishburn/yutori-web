import { createServerFn } from '@tanstack/react-start';

type ShopifyEnv = {
  storeDomain: string;
  storefrontToken: string;
  apiVersion: string;
};

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

function getShopifyEnv(): ShopifyEnv {
  const storeDomain = normalizeStoreDomain(process.env.SHOPIFY_STORE_DOMAIN);
  const storefrontToken = cleanEnvValue(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
  const apiVersion = cleanEnvValue(process.env.SHOPIFY_STOREFRONT_API_VERSION) ?? '2024-10';

  const missingEnvVars: string[] = [];
  if (!storeDomain) {
    missingEnvVars.push('SHOPIFY_STORE_DOMAIN');
  }
  if (!storefrontToken) {
    missingEnvVars.push('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  }

  if (missingEnvVars.length > 0 || !storeDomain || !storefrontToken) {
    throw new Error(`Missing Shopify env vars: ${missingEnvVars.join(', ')}`);
  }

  return { storeDomain, storefrontToken, apiVersion };
}

/* ── Admin REST API helper ────────────────────────────────── */

async function shopifyAdminRest<T>(path: string): Promise<T> {
  const { storeDomain, adminToken, apiVersion } = getShopifyAdminEnv();
  const url = `https://${storeDomain}/admin/api/${apiVersion}/${path}`;

  const res = await fetch(url, {
    headers: { 'X-Shopify-Access-Token': adminToken },
  });

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

/* ── Storefront GraphQL helper ────────────────────────────── */

function summarizePayload(payload: unknown): string {
  try {
    return JSON.stringify(payload).slice(0, 500);
  } catch {
    return String(payload).slice(0, 500);
  }
}

async function shopifyGraphql<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const { storeDomain, storefrontToken, apiVersion } = getShopifyEnv();

  const url = `https://${storeDomain}/api/${apiVersion}/graphql.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json: unknown = await res.json().catch(() => null);
  const jsonObj =
    json && typeof json === 'object' ? (json as Record<string, unknown>) : null;

  if (!res.ok) {
    throw new Error(
      `Shopify request failed (${res.status}): ${summarizePayload(jsonObj)}`,
    );
  }

  const errors = jsonObj?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(`Shopify GraphQL errors: ${summarizePayload(errors)}`);
  }

  const data = jsonObj?.data;
  if (!data) {
    throw new Error('Shopify response missing data');
  }
  return data as T;
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

/* Storefront product queries removed — product reads now use Admin REST API */

const CART_CREATE_MUTATION = `#graphql
mutation CartCreate($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) {
    cart {
      id
      checkoutUrl
      totalQuantity
      cost { totalAmount { amount currencyCode } }
      lines(first: 20) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title handle featuredImage { url altText } }
                price { amount currencyCode }
              }
            }
          }
        }
      }
    }
    userErrors { field message }
  }
}
`;

const CART_LINES_ADD_MUTATION = `#graphql
mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      checkoutUrl
      totalQuantity
      cost { totalAmount { amount currencyCode } }
      lines(first: 20) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title handle featuredImage { url altText } }
                price { amount currencyCode }
              }
            }
          }
        }
      }
    }
    userErrors { field message }
  }
}
`;

const CART_QUERY = `#graphql
query Cart($cartId: ID!) {
  cart(id: $cartId) {
    id
    checkoutUrl
    totalQuantity
    cost { totalAmount { amount currencyCode } }
    lines(first: 20) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product { title handle featuredImage { url altText } }
              price { amount currencyCode }
            }
          }
        }
      }
    }
  }
}
`;

const CART_LINES_REMOVE_MUTATION = `#graphql
mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
      id
      checkoutUrl
      totalQuantity
      cost { totalAmount { amount currencyCode } }
      lines(first: 20) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title handle featuredImage { url altText } }
                price { amount currencyCode }
              }
            }
          }
        }
      }
    }
    userErrors { field message }
  }
}
`;

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
    return { lines: lines as Array<{ merchandiseId: string; quantity: number; sellingPlanId?: string }> };
  })
  .handler(async (ctx) => {
    const data = await shopifyGraphql<{
      cartCreate: { cart: ShopifyCart | null; userErrors: { field: string; message: string }[] };
    }>(CART_CREATE_MUTATION, { lines: ctx.data.lines });

    if (data.cartCreate.userErrors.length > 0) {
      throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(', '));
    }

    if (!data.cartCreate.cart) {
      throw new Error('Shopify cartCreate returned null cart');
    }

    return data.cartCreate.cart;
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
      lines: lines as Array<{ merchandiseId: string; quantity: number; sellingPlanId?: string }>,
    };
  })
  .handler(async (ctx) => {
    const data = await shopifyGraphql<{
      cartLinesAdd: { cart: ShopifyCart | null; userErrors: { field: string; message: string }[] };
    }>(CART_LINES_ADD_MUTATION, { cartId: ctx.data.cartId, lines: ctx.data.lines });

    if (data.cartLinesAdd.userErrors.length > 0) {
      throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(', '));
    }

    if (!data.cartLinesAdd.cart) {
      throw new Error('Shopify cartLinesAdd returned null cart');
    }

    return data.cartLinesAdd.cart;
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
    const data = await shopifyGraphql<{ cart: ShopifyCart | null }>(CART_QUERY, {
      cartId: ctx.data.cartId,
    });
    return data.cart;
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
    const data = await shopifyGraphql<{
      cartLinesRemove: { cart: ShopifyCart | null; userErrors: { field: string; message: string }[] };
    }>(CART_LINES_REMOVE_MUTATION, { cartId: ctx.data.cartId, lineIds: ctx.data.lineIds });

    if (data.cartLinesRemove.userErrors.length > 0) {
      throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(', '));
    }

    if (!data.cartLinesRemove.cart) {
      throw new Error('Shopify cartLinesRemove returned null cart');
    }

    return data.cartLinesRemove.cart;
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
