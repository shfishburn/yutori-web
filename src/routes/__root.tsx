import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Yutori',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const showDevtools = import.meta.env.DEV

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-slate-950 text-white">
        <header className="border-b border-slate-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to="/" className="text-lg font-extrabold tracking-tight">
              Yutori
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-200">
              <Link to="/products" className="hover:text-white">
                Products
              </Link>
              <Link to="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white">
                Terms
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="border-t border-slate-800">
          <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate-400">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/privacy" className="hover:text-slate-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-slate-200">
                Terms
              </Link>
              <a
                href="mailto:support@thermalwellness.app"
                className="hover:text-slate-200"
              >
                support@thermalwellness.app
              </a>
            </div>
            <div className="mt-4">© {new Date().getFullYear()} Yutori</div>
          </div>
        </footer>

        {showDevtools ? (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}

        <Scripts />
      </body>
    </html>
  )
}
