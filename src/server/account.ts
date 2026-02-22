import { createServerFn } from '@tanstack/react-start';

type SupabaseEnv = {
  url: string;
  anonKey: string;
};

type ShopifyAdminEnv = {
  storeDomain: string;
  adminToken: string;
  apiVersion: string;
};

type ShopifyCustomer = {
  id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  state: string | null;
};

type ShopifyOrder = {
  id: number;
  name: string;
  created_at: string;
  financial_status: string | null;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  order_status_url: string | null;
  line_items: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
};

export type AccountOrder = {
  id: string;
  name: string;
  createdAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: string;
  currency: string;
  orderStatusUrl: string | null;
  itemSummary: string;
};

export type AccountSnapshot = {
  email: string;
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    state: string | null;
  } | null;
  orders: AccountOrder[];
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

function getSupabaseEnv(): SupabaseEnv {
  const url = cleanEnvValue(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.replace(
    /\/+$/g,
    '',
  );
  const anonKey = cleanEnvValue(
    process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
  );
  if (!url || !anonKey) {
    throw new Error('Missing Supabase env vars: SUPABASE_URL and SUPABASE_ANON_KEY');
  }
  return { url, anonKey };
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
    throw new Error('Missing Shopify Admin env vars');
  }
  return { storeDomain, adminToken, apiVersion };
}

async function shopifyAdminRest<T>(
  path: string,
  searchParams: Record<string, string | number | undefined> = {},
): Promise<T> {
  const { storeDomain, adminToken, apiVersion } = getShopifyAdminEnv();
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) {
      continue;
    }
    params.set(key, String(value));
  }
  const query = params.toString();
  const url = `https://${storeDomain}/admin/api/${apiVersion}/${path}${query ? `?${query}` : ''}`;
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': adminToken,
    },
  });
  const json = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    throw new Error(`Shopify request failed (${response.status})`);
  }
  return json as T;
}

async function verifySupabaseToken(accessToken: string): Promise<{ id: string; email: string | null }> {
  const env = getSupabaseEnv();
  const response = await fetch(`${env.url}/auth/v1/user`, {
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = (await response.json().catch(() => null)) as
    | { id?: string; email?: string | null; msg?: string }
    | null;
  if (!response.ok || !json?.id) {
    const message = json?.msg ? String(json.msg) : `Token verification failed (${response.status})`;
    throw new Error(message);
  }
  return {
    id: json.id,
    email: typeof json.email === 'string' ? json.email : null,
  };
}

async function findCustomerByEmail(email: string): Promise<ShopifyCustomer | null> {
  const data = await shopifyAdminRest<{ customers: ShopifyCustomer[] }>(
    'customers/search.json',
    {
      query: `email:${email}`,
      fields: 'id,email,first_name,last_name,state',
      limit: 1,
    },
  );
  return data.customers[0] ?? null;
}

async function findOrdersByCustomerId(customerId: number): Promise<ShopifyOrder[]> {
  const data = await shopifyAdminRest<{ orders: ShopifyOrder[] }>('orders.json', {
    customer_id: customerId,
    status: 'any',
    order: 'created_at desc',
    limit: 20,
    fields:
      'id,name,created_at,financial_status,fulfillment_status,total_price,currency,order_status_url,line_items',
  });
  return data.orders ?? [];
}

function mapOrder(order: ShopifyOrder): AccountOrder {
  const firstItem = order.line_items[0]?.title ?? 'No items';
  const extraItems = Math.max(0, order.line_items.length - 1);
  const itemSummary = extraItems > 0 ? `${firstItem} +${extraItems} more` : firstItem;

  return {
    id: String(order.id),
    name: order.name,
    createdAt: order.created_at,
    financialStatus: order.financial_status,
    fulfillmentStatus: order.fulfillment_status,
    totalPrice: order.total_price,
    currency: order.currency,
    orderStatusUrl: order.order_status_url,
    itemSummary,
  };
}

export const getAccountSnapshot = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
    const accessToken = obj?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      throw new Error('accessToken is required');
    }
    return { accessToken };
  })
  .handler(async (ctx): Promise<AccountSnapshot> => {
    const user = await verifySupabaseToken(ctx.data.accessToken);
    const email = user.email?.trim().toLowerCase();
    if (!email) {
      throw new Error('Authenticated user is missing an email address');
    }

    const customer = await findCustomerByEmail(email);
    if (!customer) {
      return {
        email,
        customer: null,
        orders: [],
      };
    }

    const orders = await findOrdersByCustomerId(customer.id);

    return {
      email,
      customer: {
        id: String(customer.id),
        firstName: customer.first_name ?? null,
        lastName: customer.last_name ?? null,
        state: customer.state ?? null,
      },
      orders: orders.map(mapOrder),
    };
  });
