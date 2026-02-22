export const SITE_URL = 'https://yutorilabs.com';
export const DEFAULT_OG_IMAGE_URL =
  'https://cdn.shopify.com/s/files/1/0670/8035/6015/files/pulse-contrast-bundle.webp?v=1771722300';
export const DEFAULT_OG_IMAGE_WIDTH = 1104;
export const DEFAULT_OG_IMAGE_HEIGHT = 828;
export const DEFAULT_OG_IMAGE_TYPE = 'image/webp';

type BuildSeoHeadOptions = {
  title: string;
  description: string;
  path: string;
  ogType?: 'website' | 'article' | 'product';
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
};

export function absoluteUrl(path: string): string {
  if (path === '/' || path.length === 0) {
    return SITE_URL;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function toMetaDescription(
  value: string | null | undefined,
  fallback: string,
  maxLength = 160,
): string {
  const source = (value ?? '').trim();
  if (source.length === 0) {
    return fallback;
  }

  const collapsed = source.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= maxLength) {
    return collapsed;
  }

  return `${collapsed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildSeoHead(options: BuildSeoHeadOptions) {
  const canonicalUrl = absoluteUrl(options.path);
  const ogImage = options.imageUrl ?? DEFAULT_OG_IMAGE_URL;
  const ogType = options.ogType ?? 'website';
  const twitterCard = options.twitterCard ?? 'summary_large_image';

  const meta: Array<Record<string, string>> = [
    { title: options.title },
    { name: 'description', content: options.description },
    { property: 'og:title', content: options.title },
    { property: 'og:description', content: options.description },
    { property: 'og:type', content: ogType },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'Yutori Labs' },
    { property: 'og:image', content: ogImage },
    { name: 'twitter:card', content: twitterCard },
    { name: 'twitter:title', content: options.title },
    { name: 'twitter:description', content: options.description },
    { name: 'twitter:image', content: ogImage },
  ];

  if (options.imageWidth && options.imageHeight) {
    meta.push(
      { property: 'og:image:width', content: String(options.imageWidth) },
      { property: 'og:image:height', content: String(options.imageHeight) },
    );
  }

  if (options.imageType) {
    meta.push({ property: 'og:image:type', content: options.imageType });
  }

  return {
    meta,
    links: [{ rel: 'canonical', href: canonicalUrl }],
  };
}
