import { createStorefrontApiClient } from '@shopify/storefront-api-client';
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

/* ── Storefront API client ────────────────────────────────── */

function getStorefrontClient() {
  const storeDomain = normalizeStoreDomain(process.env.SHOPIFY_STORE_DOMAIN);
  const accessToken = cleanEnvValue(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
  const apiVersion = cleanEnvValue(process.env.SHOPIFY_STOREFRONT_API_VERSION) ?? '2024-10';

  if (!storeDomain || !accessToken) {
    const missing: string[] = [];
    if (!storeDomain) missing.push('SHOPIFY_STORE_DOMAIN');
    if (!accessToken) missing.push('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
    throw new Error(`Missing Shopify Storefront env vars: ${missing.join(', ')}`);
  }

  return createStorefrontApiClient({
    storeDomain: `https://${storeDomain}`,
    publicAccessToken: accessToken,
    apiVersion,
  });
}

async function storefrontRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const client = getStorefrontClient();
  const { data, errors } = await client.request<T>(query, { variables });
  if (errors) {
    throw new Error(
      `Storefront API error: ${JSON.stringify(errors.graphQLErrors ?? errors.message ?? errors)}`,
    );
  }
  if (!data) {
    throw new Error('Storefront API returned no data');
  }
  return data;
}

/* ── Storefront GraphQL fragments & operations ──────────────── */

const CART_FIELDS = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          sellingPlanAllocation {
            sellingPlan { id name }
            priceAdjustments {
              price { amount currencyCode }
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price { amount currencyCode }
              product {
                title
                handle
                featuredImage { url altText }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FIELDS}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FIELDS}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_QUERY = /* GraphQL */ `
  ${CART_FIELDS}
  query GetCart($id: ID!) {
    cart(id: $id) { ...CartFields }
  }
`;

const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FIELDS}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

type StorefrontCartLine = {
  id: string;
  quantity: number;
  sellingPlanAllocation?: {
    sellingPlan: { id: string; name: string };
    priceAdjustments: Array<{ price: { amount: string; currencyCode: string } }>;
  } | null;
  merchandise: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    product: {
      title: string;
      handle: string;
      featuredImage: { url: string; altText: string | null } | null;
    };
  };
};

type StorefrontCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  lines: { edges: Array<{ node: StorefrontCartLine }> };
};

function mapStorefrontCart(cart: StorefrontCart): ShopifyCart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: cart.cost,
    lines: {
      edges: cart.lines.edges.map(({ node }) => ({
        node: {
          id: node.id,
          quantity: node.quantity,
          sellingPlanAllocation: node.sellingPlanAllocation ?? null,
          merchandise: {
            id: node.merchandise.id,
            title: node.merchandise.title,
            product: node.merchandise.product,
            price: node.merchandise.price,
          },
        },
      })),
    },
  };
}

function throwUserErrors(userErrors: Array<{ field: string[] | null; message: string }> | undefined) {
  if (userErrors && userErrors.length > 0) {
    throw new Error(`Storefront cart error: ${userErrors.map((e) => e.message).join(', ')}`);
  }
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
  sellingPlanAllocation?: {
    sellingPlan: { id: string; name: string };
    priceAdjustments: Array<{ price: { amount: string; currencyCode: string } }>;
  } | null;
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
    return {
      lines: lines as Array<{ merchandiseId: string; quantity: number; sellingPlanId?: string }>,
    };
  })
  .handler(async (ctx) => {
    const cartLines = ctx.data.lines.map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity,
      ...(line.sellingPlanId ? { sellingPlanId: line.sellingPlanId } : {}),
    }));
    const result = await storefrontRequest<{
      cartCreate: { cart: StorefrontCart | null; userErrors: Array<{ field: string[] | null; message: string }> };
    }>(CART_CREATE_MUTATION, {
      input: {
        lines: cartLines,
        buyerIdentity: { countryCode: 'US' },
      },
    });
    throwUserErrors(result.cartCreate.userErrors);
    if (!result.cartCreate.cart) throw new Error('cartCreate returned no cart');
    return mapStorefrontCart(result.cartCreate.cart);
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
    const cartLines = ctx.data.lines.map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity,
      ...(line.sellingPlanId ? { sellingPlanId: line.sellingPlanId } : {}),
    }));
    const result = await storefrontRequest<{
      cartLinesAdd: { cart: StorefrontCart | null; userErrors: Array<{ field: string[] | null; message: string }> };
    }>(CART_LINES_ADD_MUTATION, { cartId: ctx.data.cartId, lines: cartLines });
    throwUserErrors(result.cartLinesAdd.userErrors);
    if (!result.cartLinesAdd.cart) throw new Error('cartLinesAdd returned no cart');
    return mapStorefrontCart(result.cartLinesAdd.cart);
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
    const result = await storefrontRequest<{ cart: StorefrontCart | null }>(CART_QUERY, {
      id: ctx.data.cartId,
    });
    if (!result.cart) return null;
    return mapStorefrontCart(result.cart);
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
    const result = await storefrontRequest<{
      cartLinesRemove: { cart: StorefrontCart | null; userErrors: Array<{ field: string[] | null; message: string }> };
    }>(CART_LINES_REMOVE_MUTATION, { cartId: ctx.data.cartId, lineIds: ctx.data.lineIds });
    throwUserErrors(result.cartLinesRemove.userErrors);
    if (!result.cartLinesRemove.cart) throw new Error('cartLinesRemove returned no cart');
    return mapStorefrontCart(result.cartLinesRemove.cart);
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
