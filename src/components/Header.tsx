import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-lg font-extrabold tracking-tight text-fg transition-opacity hover:opacity-80"
        >
          Yutori
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/products"
            className="text-fg-muted transition-colors hover:text-fg [&.active]:text-accent"
          >
            Products
          </Link>
        </nav>

        <Link
          to="/products"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
        >
          Shop now
        </Link>
      </div>
    </header>
  )
}
