import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { BRAND, NAV } from '../content/common';
import { useCart } from '../lib/cart';

export function Header() {
  const [open, setOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart?.totalQuantity ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="shrink-0 text-lg font-semibold tracking-tight text-fg" onClick={() => setOpen(false)}>
          {BRAND.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link
            to="/sauna"
            className="text-fg-muted transition-colors hover:text-fg [&.active]:text-heat"
          >
            {NAV.pulseSauna}
          </Link>
          <Link
            to="/plunge"
            className="text-fg-muted transition-colors hover:text-fg [&.active]:text-accent"
          >
            {NAV.pulsePlunge}
          </Link>
          <Link
            to="/shower"
            className="text-fg-muted transition-colors hover:text-fg [&.active]:text-heat"
          >
            {NAV.pulseShower}
          </Link>
          <Link
            to="/sensors"
            className="text-fg-muted transition-colors hover:text-fg [&.active]:text-accent"
          >
            {NAV.sensors}
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/cart"
            aria-label={`${NAV.cartLabel}${cartCount > 0 ? ` (${cartCount})` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-edge text-fg-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-heat px-1.5 py-0.5 text-[10px] font-semibold text-heat-fg">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            to="/sauna"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
          >
            {NAV.shopNow}
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
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
              to="/sauna"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-heat"
            >
              {NAV.pulseSauna}
            </Link>
            <Link
              to="/plunge"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
            >
              {NAV.pulsePlunge}
            </Link>
            <Link
              to="/shower"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-heat"
            >
              {NAV.pulseShower}
            </Link>
            <Link
              to="/sensors"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
            >
              {NAV.sensors}
            </Link>
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
            >
              {NAV.cartLabel}
              {cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>
            <Link
              to="/privacy"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            >
              {NAV.privacy}
            </Link>
            <Link
              to="/terms"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            >
              {NAV.terms}
            </Link>
          </nav>
          <div className="mt-4 border-t border-edge pt-4">
            <Link
              to="/sauna"
              onClick={() => setOpen(false)}
              className="block w-full rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
            >
              {NAV.shopNow}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
