function toHeaderValue(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join(',');
  }
  return null;
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function getBaseUrl(req) {
  const proto = toHeaderValue(req.headers?.['x-forwarded-proto']) || 'https';
  const host =
    toHeaderValue(req.headers?.['x-forwarded-host']) ||
    toHeaderValue(req.headers?.host) ||
    'yutorilabs.com';

  return `${proto}://${host}`;
}

function getShopifyEnv() {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? '2024-10';

  if (!storeDomain || !storefrontToken) {
    return null;
  }

  return { storeDomain, storefrontToken, apiVersion };
}

async function shopifyGraphql(query, variables = {}) {
  const env = getShopifyEnv();
  if (!env) {
    return null;
  }

  const response = await fetch(
    `https://${env.storeDomain}/api/${env.apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': env.storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  const json = await response.json().catch(() => null);
  const jsonObj =
    json && typeof json === 'object' ? json : null;

  if (!response.ok) {
    throw new Error(
      `Shopify request failed (${response.status}): ${JSON.stringify(jsonObj)?.slice(0, 500)}`,
    );
  }

  if (Array.isArray(jsonObj?.errors) && jsonObj.errors.length > 0) {
    throw new Error(
      `Shopify GraphQL errors: ${JSON.stringify(jsonObj.errors).slice(0, 500)}`,
    );
  }

  return jsonObj?.data ?? null;
}

const PRODUCT_SITEMAP_QUERY = `#graphql
query ProductSitemap($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    edges {
      cursor
      node {
        handle
        updatedAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;

async function getProductEntries() {
  const env = getShopifyEnv();
  if (!env) {
    return [];
  }

  const first = 100;
  let after = null;
  const products = [];

  for (let i = 0; i < 20; i += 1) {
    const data = await shopifyGraphql(PRODUCT_SITEMAP_QUERY, { first, after });
    if (!data?.products?.edges || !data.products.pageInfo) {
      break;
    }

    for (const edge of data.products.edges) {
      const handle = edge?.node?.handle;
      if (typeof handle === 'string' && handle.length > 0) {
        products.push({
          handle,
          updatedAt:
            typeof edge?.node?.updatedAt === 'string' ? edge.node.updatedAt : null,
        });
      }
    }

    if (!data.products.pageInfo.hasNextPage) {
      break;
    }
    after = data.products.pageInfo.endCursor;
    if (!after) {
      break;
    }
  }

  return products;
}

function xmlUrlTag({ loc, changefreq, priority, lastmod }) {
  const lastmodTag = lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : '';

  return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <changefreq>${xmlEscape(changefreq)}</changefreq>
    <priority>${xmlEscape(priority)}</priority>${lastmodTag}
  </url>`;
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export default async function handler(req, res) {
  const method = String(req.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }

  const baseUrl = getBaseUrl(req);
  let productEntries = [];

  try {
    productEntries = await getProductEntries();
  } catch (error) {
    console.error('sitemap generation warning:', error);
  }

  const staticEntries = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/products', changefreq: 'weekly', priority: '0.9' },
    { path: '/privacy', changefreq: 'monthly', priority: '0.3' },
    { path: '/terms', changefreq: 'monthly', priority: '0.3' },
  ];

  const dynamicEntries = productEntries.map((product) => ({
    path: `/products/${encodeURIComponent(product.handle)}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: toIsoDate(product.updatedAt),
  }));

  const allEntries = [
    ...staticEntries.map((entry) => ({
      ...entry,
      loc: `${baseUrl}${entry.path === '/' ? '/' : entry.path}`,
    })),
    ...dynamicEntries.map((entry) => ({
      ...entry,
      loc: `${baseUrl}${entry.path}`,
    })),
  ];

  const urlTags = allEntries.map(xmlUrlTag).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>
`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  );

  if (method === 'HEAD') {
    res.end();
    return;
  }

  res.end(xml);
}
