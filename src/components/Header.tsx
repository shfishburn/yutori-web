import { useState } from 'react';
import { Link } from '@tanstack/react-router';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
          {/* Full wordmark on sm+, symbol-only on mobile */}
          <img
            src="/yutori_logo.png"
            alt="Yutori"
            className="hidden h-7 w-auto sm:block"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <img
            src="/symbol.png"
            alt="Yutori"
            className="block h-8 w-auto sm:hidden"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link
            to="/products"
            className="text-fg-muted transition-colors hover:text-fg [&.active]:text-accent"
          >
            Products
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden sm:block">
          <Link
            to="/products"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
          >
            Shop now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge text-fg-muted transition-colors hover:bg-surface sm:hidden"
        >
          {open ? (
            /* X icon */
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-edge bg-canvas px-6 pb-6 pt-4 sm:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
            >
              Products
            </Link>
            <Link
              to="/privacy"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            >
              Terms
            </Link>
          </nav>
          <div className="mt-4 border-t border-edge pt-4">
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="block w-full rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
            >
              Shop now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

