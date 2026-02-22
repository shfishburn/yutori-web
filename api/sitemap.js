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

const QUOTED_VALUE_PATTERN = /^(['"])(.*)\1$/;

function cleanEnvValue(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const withoutNewlines = value.replace(/\r?\n/g, '').replace(/\\n/g, '');
  const trimmed = withoutNewlines.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const quotedMatch = trimmed.match(QUOTED_VALUE_PATTERN);
  if (quotedMatch) {
    const unwrapped = (quotedMatch[2] || '').trim();
    return unwrapped.length > 0 ? unwrapped : null;
  }

  return trimmed;
}

function normalizeStoreDomain(value) {
  const cleaned = cleanEnvValue(value);
  if (!cleaned) {
    return null;
  }

  return cleaned.replace(/^https?:\/\//i, '').replace(/\/+$/g, '');
}

function getShopifyEnv() {
  const storeDomain = normalizeStoreDomain(process.env.SHOPIFY_STORE_DOMAIN);
  const adminToken = cleanEnvValue(process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN);
  const apiVersion = cleanEnvValue(process.env.SHOPIFY_ADMIN_API_VERSION) ?? '2025-01';

  if (!storeDomain || !adminToken) {
    return null;
  }

  return { storeDomain, adminToken, apiVersion };
}

async function shopifyAdminRest(path, searchParams = {}) {
  const env = getShopifyEnv();
  if (!env) {
    return null;
  }

  const url = new URL(`https://${env.storeDomain}/admin/api/${env.apiVersion}/${path.replace(/^\/+/, '')}`);
  for (const [key, value] of Object.entries(searchParams || {})) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': env.adminToken,
    },
  });

  const json = await response.json().catch(() => null);
  const jsonObj = json && typeof json === 'object' ? json : null;

  if (!response.ok) {
    throw new Error(
      `Shopify request failed (${response.status}): ${JSON.stringify(jsonObj)?.slice(0, 500)}`,
    );
  }

  return jsonObj;
}

async function getProductEntries() {
  const env = getShopifyEnv();
  if (!env) {
    return [];
  }

  const limit = 250;
  let sinceId = 0;
  const products = [];

  for (let i = 0; i < 20; i += 1) {
    const data = await shopifyAdminRest('products.json', {
      limit,
      since_id: sinceId,
      status: 'active',
      fields: 'id,handle,updated_at',
    });

    const batch = Array.isArray(data?.products) ? data.products : null;
    if (!batch) {
      break;
    }

    for (const product of batch) {
      const handle = product?.handle;
      if (typeof handle === 'string' && handle.length > 0) {
        products.push({
          handle,
          updatedAt:
            typeof product?.updated_at === 'string' ? product.updated_at : null,
        });
      }
    }

    if (batch.length < limit) {
      break;
    }

    const lastId = batch[batch.length - 1]?.id;
    if (typeof lastId !== 'number' || !Number.isFinite(lastId) || lastId <= sinceId) break;
    sinceId = lastId;
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
