import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { BRAND, NAV } from '../content/common';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { Icon } from './Icon';

export function Header() {
  const [open, setOpen] = useState(false);
  const { cart } = useCart();
  const { user, signOut } = useAuth();
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
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg border border-edge px-3 py-2 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface hover:text-fg"
              >
                {NAV.dashboard}
              </Link>
              <Link
                to="/account"
                className="rounded-lg border border-edge px-3 py-2 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface hover:text-fg"
              >
                {NAV.account}
              </Link>
              <button
                type="button"
                onClick={() => {
                  void signOut();
                }}
                className="rounded-lg border border-edge px-3 py-2 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface hover:text-fg"
              >
                {NAV.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: 'signin' }}
                className="rounded-lg border border-edge px-3 py-2 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface hover:text-fg"
              >
                {NAV.signIn}
              </Link>
              <Link
                to="/auth"
                search={{ mode: 'signup' }}
                className="rounded-lg bg-heat px-3 py-2 text-sm font-semibold text-heat-fg transition-opacity hover:opacity-90"
              >
                {NAV.signUp}
              </Link>
            </>
          )}
          <Link
            to="/cart"
            aria-label={`${NAV.cartLabel}${cartCount > 0 ? ` (${cartCount})` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-edge text-fg-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <Icon name="shopping-bag" className="h-4.5 w-4.5" aria-hidden="true" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-heat px-1.5 py-0.5 text-2xs font-semibold text-heat-fg">
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
            <Icon name="x-mark" className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Icon name="bars-3" className="h-5 w-5" aria-hidden="true" />
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
            {user ? (
              <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
              >
                {NAV.dashboard}
              </Link>
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
              >
                {NAV.account}
              </Link>
              </>
            ) : (
              <Link
                to="/auth"
                search={{ mode: 'signin' }}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
              >
                {NAV.signIn}
              </Link>
            )}
            {!user ? (
              <Link
                to="/auth"
                search={{ mode: 'signup' }}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-heat"
              >
                {NAV.signUp}
              </Link>
            ) : null}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
              >
                {NAV.signOut}
              </button>
            ) : null}
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
