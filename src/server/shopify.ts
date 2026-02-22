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
  const storeDomain = normalizeStoreDomain(process.env.SHOPIFY_STORE_DOMAIN);
  const adminToken = cleanEnvValue(process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN);
  const apiVersion = cleanEnvValue(process.env.SHOPIFY_ADMIN_API_VERSION) ?? '2025-01';

  const missingEnvVars: string[] = [];
  if (!storeDomain) {
    missingEnvVars.push('SHOPIFY_STORE_DOMAIN');
  }
  if (!adminToken) {
    missingEnvVars.push('SHOPIFY_ADMIN_API_ACCESS_TOKEN');
  }

  if (missingEnvVars.length > 0 || !storeDomain || !adminToken) {
    throw new Error(`Missing Shopify env vars: ${missingEnvVars.join(', ')}`);
  }

  return { storeDomain, adminToken, apiVersion };
}

type AdminRestError = {
  errors?: unknown;
};

async function shopifyAdminRest<T>(
  path: string,
  init: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> } = {},
): Promise<T> {
  const { storeDomain, adminToken, apiVersion } = getShopifyAdminEnv();
  const url = `https://${storeDomain}/admin/api/${apiVersion}/${path.replace(/^\/+/, '')}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
      ...(init.headers ?? {}),
    },
  });

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = JSON.stringify(json)?.slice(0, 500);
    throw new Error(`Shopify admin request failed (${res.status}): ${msg}`);
  }

  // Some Admin REST errors still return 200 with an {errors: ...} shape.
  const maybeErr = json as AdminRestError | null;
  if (maybeErr && typeof maybeErr === 'object' && 'errors' in maybeErr && maybeErr.errors) {
    throw new Error(`Shopify admin errors: ${JSON.stringify(maybeErr.errors).slice(0, 500)}`);
  }

  return json as T;
}

const gidFor = (type: 'Product' | 'ProductVariant', id: number): string =>
  `gid://shopify/${type}/${id}`;

const parseVariantNumericId = (gid: string): number | null => {
  const m = String(gid).match(/ProductVariant\/(\d+)$/);
  if (!m) return null;
  const n = parseInt(m[1] ?? '', 10);
  return Number.isFinite(n) ? n : null;
};

let _cachedCurrency: { code: string; at: number } | null = null;
async function getShopCurrencyCode(): Promise<string> {
  const now = Date.now();
  if (_cachedCurrency && now - _cachedCurrency.at < 10 * 60_000) {
    return _cachedCurrency.code;
  }

  const data = await shopifyAdminRest<{ shop: { currency: string } }>('shop.json', {
    method: 'GET',
  });
  const code = data?.shop?.currency || 'USD';
  _cachedCurrency = { code, at: now };
  return code;
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

type AdminRestImage = {
  src: string;
  alt?: string | null;
};

type AdminRestVariant = {
  id: number;
  title: string;
  price: string;
  inventory_quantity?: number;
};

type AdminRestProduct = {
  id: number;
  handle: string;
  title: string;
  body_html?: string;
  image?: AdminRestImage | null;
  images?: AdminRestImage[];
  variants?: AdminRestVariant[];
};

function mapAdminProductToShopify(
  product: AdminRestProduct,
  currencyCode: string,
): ShopifyProduct {
  const images = Array.isArray(product.images) ? product.images : [];
  const featured = product.image?.src
    ? { url: product.image.src, altText: product.image.alt ?? null }
    : images[0]?.src
      ? { url: images[0].src, altText: images[0].alt ?? null }
      : null;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const { minPrice, maxPrice } = (() => {
    const prices = variants
      .map((v) => parseFloat(v.price))
      .filter((n) => Number.isFinite(n));
    if (prices.length === 0) {
      return { minPrice: '0', maxPrice: '0' };
    }
    return {
      minPrice: String(Math.min(...prices)),
      maxPrice: String(Math.max(...prices)),
    };
  })();

  return {
    id: gidFor('Product', product.id),
    handle: product.handle,
    title: product.title,
    description: String(product.body_html ?? '').replace(/<[^>]*>/g, '').trim(),
    featuredImage: featured,
    images: {
      edges: images.slice(0, 20).map((img) => ({
        node: { url: img.src, altText: img.alt ?? null },
      })),
    },
    priceRange: {
      minVariantPrice: {
        amount: minPrice,
        currencyCode,
      },
      maxVariantPrice: {
        amount: maxPrice,
        currencyCode,
      },
    },
  };
}

function mapAdminVariantToShopify(
  variant: AdminRestVariant,
  currencyCode: string,
): ShopifyVariant {
  const inv = typeof variant.inventory_quantity === 'number' ? variant.inventory_quantity : null;
  return {
    id: gidFor('ProductVariant', variant.id),
    title: variant.title,
    availableForSale: inv == null ? true : inv > 0,
    price: {
      amount: String(variant.price),
      currencyCode,
    },
  };
}

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
    const currency = await getShopCurrencyCode();
    const products = await shopifyAdminRest<{ products: AdminRestProduct[] }>(
      'products.json?limit=250',
      { method: 'GET' },
    );
    const p = (products.products ?? []).find((x) => x.handle === ctx.data.handle) ?? null;
    const variants = Array.isArray(p?.variants) ? p!.variants! : [];
    return variants.slice(0, 20).map((v) => mapAdminVariantToShopify(v, currency));
  });

export const createDraftOrder = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const variantId = obj?.variantId;
    const quantity = obj?.quantity;
    if (typeof variantId !== 'string' || variantId.trim().length === 0) {
      throw new Error('variantId is required');
    }
    const q = typeof quantity === 'number' && Number.isFinite(quantity) && quantity > 0
      ? Math.floor(quantity)
      : 1;
    return { variantId, quantity: q };
  })
  .handler(async (ctx) => {
    const numericVariantId = parseVariantNumericId(ctx.data.variantId);
    if (!numericVariantId) {
      throw new Error('variantId must be a Shopify ProductVariant gid');
    }

    const payload = {
      draft_order: {
        line_items: [
          {
            variant_id: numericVariantId,
            quantity: ctx.data.quantity,
          },
        ],
        note: 'Yutori web checkout',
        tags: 'yutori_web',
      },
    };

    const data = await shopifyAdminRest<{ draft_order: { invoice_url: string | null } }>(
      'draft_orders.json',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    const url = data?.draft_order?.invoice_url;
    if (!url) {
      throw new Error('Draft order created but invoice_url was missing');
    }

    return { invoiceUrl: url };
  });

export const getProducts = createServerFn({ method: 'GET' }).handler(async () => {
  const currency = await getShopCurrencyCode();
  const data = await shopifyAdminRest<{ products: AdminRestProduct[] }>(
    'products.json?limit=12',
    { method: 'GET' },
  );
  return (data.products ?? []).map((p) => mapAdminProductToShopify(p, currency));
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
    const currency = await getShopCurrencyCode();
    const products = await shopifyAdminRest<{ products: AdminRestProduct[] }>(
      'products.json?limit=250',
      { method: 'GET' },
    );
    const p = (products.products ?? []).find((x) => x.handle === ctx.data.handle) ?? null;
    return p ? mapAdminProductToShopify(p, currency) : null;
  });
