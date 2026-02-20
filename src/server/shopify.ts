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
