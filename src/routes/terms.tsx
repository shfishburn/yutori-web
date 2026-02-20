import { createFileRoute } from '@tanstack/react-router'
import Terms, { title } from '../content/terms.mdx'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [{ title: `Yutori — ${title}` }],
  }),
  component: Page,
})

function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-invert">
      <Terms />
    </main>
  )
}
