import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useCart } from '../lib/cart';
import { BRAND, NAV } from '../content/common';

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
            to="/sauna-sensor"
            className="text-fg-muted transition-colors hover:text-fg [&.active]:text-heat"
          >
            {NAV.saunaSensor}
          </Link>
          <Link
            to="/plunge-sensor"
            className="text-fg-muted transition-colors hover:text-fg [&.active]:text-accent"
          >
            {NAV.plungeSensor}
          </Link>
          <Link
            to="/products"
            className="text-fg-muted transition-colors hover:text-fg [&.active]:text-accent"
          >
            {NAV.products}
          </Link>
        </nav>

        {/* Desktop CTA + cart */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-edge text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            aria-label={`${NAV.cartLabel}${cartCount > 0 ? ` (${cartCount} item${cartCount > 1 ? 's' : ''})` : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-heat text-[10px] font-bold text-heat-fg">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/products"
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
              to="/sauna-sensor"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-heat"
            >
              {NAV.saunaSensor}
            </Link>
            <Link
              to="/plunge-sensor"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
            >
              {NAV.plungeSensor}
            </Link>
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
            >
              {NAV.products}
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
          <div className="mt-4 border-t border-edge pt-4 flex flex-col gap-3">
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-edge bg-surface px-4 py-3 text-sm font-semibold text-fg transition-colors hover:bg-overlay"
            >
              {NAV.cartLabel}{cartCount > 0 && ` (${cartCount})`}
            </Link>
            <Link
              to="/products"
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
