import { createServerFn } from '@tanstack/react-start';

type ShopifyEnv = {
  storeDomain: string;
  storefrontToken: string;
  apiVersion: string;
};

function getShopifyEnv(): ShopifyEnv {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? '2024-10';

  if (!storeDomain || !storefrontToken) {
    throw new Error(
      'Missing Shopify env vars. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.',
    );
  }

  return { storeDomain, storefrontToken, apiVersion };
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
      `Shopify request failed (${res.status}): ${JSON.stringify(jsonObj)?.slice(0, 500)}`,
    );
  }

  const errors = jsonObj?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(
      `Shopify GraphQL errors: ${JSON.stringify(errors).slice(0, 500)}`,
    );
  }

  const data = jsonObj?.data;
  if (!data) {
    throw new Error('Shopify response missing data');
  }
  return data as T;
}

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: {url: string; altText: string | null} | null;
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
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
    product: { title: string; handle: string; featuredImage: { url: string; altText: string | null } | null };
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

const PRODUCTS_QUERY = `#graphql
query Products($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        handle
        title
        description
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
}
`;

const PRODUCT_BY_HANDLE_QUERY = `#graphql
query ProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    id
    handle
    title
    description
    featuredImage {
      url
      altText
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
}
`;

const PRODUCT_VARIANTS_QUERY = `#graphql
query ProductVariants($handle: String!) {
  productByHandle(handle: $handle) {
    variants(first: 20) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
}
`;

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
    const data = await shopifyGraphql<{
      productByHandle: { variants: { edges: { node: ShopifyVariant }[] } } | null;
    }>(PRODUCT_VARIANTS_QUERY, { handle: ctx.data.handle });

    return data.productByHandle?.variants.edges.map((e) => e.node) ?? [];
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
    const data = await shopifyGraphql<{
      cartCreate: { cart: ShopifyCart; userErrors: { field: string; message: string }[] };
    }>(CART_CREATE_MUTATION, { lines: ctx.data.lines });

    if (data.cartCreate.userErrors.length > 0) {
      throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(', '));
    }
    return data.cartCreate.cart;
  });

export const addCartLines = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const cartId = obj?.cartId;
    const lines = obj?.lines;
    if (typeof cartId !== 'string') throw new Error('cartId is required');
    if (!Array.isArray(lines) || lines.length === 0) throw new Error('lines is required');
    return { cartId, lines: lines as Array<{ merchandiseId: string; quantity: number }> };
  })
  .handler(async (ctx) => {
    const data = await shopifyGraphql<{
      cartLinesAdd: { cart: ShopifyCart; userErrors: { field: string; message: string }[] };
    }>(CART_LINES_ADD_MUTATION, { cartId: ctx.data.cartId, lines: ctx.data.lines });

    if (data.cartLinesAdd.userErrors.length > 0) {
      throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(', '));
    }
    return data.cartLinesAdd.cart;
  });

export const getCart = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const cartId = obj?.cartId;
    if (typeof cartId !== 'string') throw new Error('cartId is required');
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
    if (typeof cartId !== 'string') throw new Error('cartId is required');
    if (!Array.isArray(lineIds) || lineIds.length === 0) throw new Error('lineIds is required');
    return { cartId, lineIds: lineIds as string[] };
  })
  .handler(async (ctx) => {
    const data = await shopifyGraphql<{
      cartLinesRemove: { cart: ShopifyCart; userErrors: { field: string; message: string }[] };
    }>(CART_LINES_REMOVE_MUTATION, { cartId: ctx.data.cartId, lineIds: ctx.data.lineIds });

    if (data.cartLinesRemove.userErrors.length > 0) {
      throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(', '));
    }
    return data.cartLinesRemove.cart;
  });

export const getProducts = createServerFn({ method: 'GET' }).handler(async () => {
  const data = await shopifyGraphql<{
    products: { edges: { node: ShopifyProduct }[] }
  }>(PRODUCTS_QUERY, { first: 12 });

  return data.products.edges.map((e) => e.node);
});

export const getProductByHandle = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj =
      input && typeof input === 'object'
        ? (input as Record<string, unknown>)
        : null;
    const handle = obj?.handle;
    if (typeof handle !== 'string' || handle.trim().length === 0) {
      throw new Error('handle is required');
    }
    return { handle };
  })
  .handler(async (ctx) => {
    const handle = ctx.data.handle;

    const data = await shopifyGraphql<{ productByHandle: ShopifyProduct | null }>(
      PRODUCT_BY_HANDLE_QUERY,
      { handle },
    );

    return data.productByHandle;
  });
