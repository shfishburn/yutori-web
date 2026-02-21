import {
  getProductByHandle,
  getProductVariants,
  type ShopifyProduct,
  type ShopifyVariant,
} from '../server/shopify';

export type ProductCommerceLoaderData = {
  product: ShopifyProduct | null;
  variants: ShopifyVariant[];
  loaderError: string | null;
};

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown Shopify error';
  }
}

export async function loadProductCommerceByHandle(
  handle: string,
): Promise<ProductCommerceLoaderData> {
  const [productResult, variantsResult] = await Promise.allSettled([
    getProductByHandle({ data: { handle } }),
    getProductVariants({ data: { handle } }),
  ]);

  const product = productResult.status === 'fulfilled' ? productResult.value : null;
  const variants = variantsResult.status === 'fulfilled' ? variantsResult.value : [];

  const errors: string[] = [];
  if (productResult.status === 'rejected') {
    errors.push(`product=${toErrorMessage(productResult.reason)}`);
  }
  if (variantsResult.status === 'rejected') {
    errors.push(`variants=${toErrorMessage(variantsResult.reason)}`);
  }

  const loaderError = errors.length > 0 ? errors.join(' | ') : null;
  if (loaderError) {
    console.error(`[commerce] Failed Shopify load for "${handle}": ${loaderError}`);
  }

  return { product, variants, loaderError };
}
