import { createFileRoute } from '@tanstack/react-router';
import Terms, { title } from '../content/terms.mdx';

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [{ title: `Yutori — ${title}` }],
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
