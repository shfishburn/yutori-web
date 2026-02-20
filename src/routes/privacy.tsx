import { createFileRoute } from '@tanstack/react-router'
import Privacy, { title } from '../content/privacy.mdx'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [{ title: `Yutori — ${title}` }],
  }),
  component: Page,
})

function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-invert">
      <Privacy />
    </main>
  )
}
