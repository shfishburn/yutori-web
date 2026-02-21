import { createFileRoute } from '@tanstack/react-router';
import Terms, { title } from '../content/terms.mdx';
import {
  buildSeoHead,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
} from '../lib/seo';

export const Route = createFileRoute('/terms')({
  head: () => ({
    ...buildSeoHead({
      title: `Yutori — ${title}`,
      description:
        'Terms governing use of the Yutori website, mobile app, and connected devices.',
      path: '/terms',
      imageWidth: DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
      imageType: DEFAULT_OG_IMAGE_TYPE,
    }),
  }),
  component: Page,
});

function Page() {
  return (
    <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-16">
      <article className="prose prose-invert prose-sm sm:prose-base">
        <Terms />
      </article>
    </main>
  );
}
