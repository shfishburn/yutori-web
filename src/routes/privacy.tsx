import { createFileRoute } from '@tanstack/react-router';
import Privacy, { title } from '../content/privacy.mdx';
import {
  buildSeoHead,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
} from '../lib/seo';

export const Route = createFileRoute('/privacy')({
  head: () => ({
    ...buildSeoHead({
      title: `Yutori — ${title}`,
      description: 'How Yutori handles your account, wellness, and session data.',
      path: '/privacy',
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
        <Privacy />
      </article>
    </main>
  );
}
