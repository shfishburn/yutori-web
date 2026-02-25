import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { NAV } from '../content/common';
import { useAuth } from '../lib/auth';
import { Icon } from './Icon';

const MENU_ITEMS = [
  { label: NAV.dashboard, to: '/dashboard' as const },
  { label: NAV.insights, to: '/insights' as const },
  { label: NAV.protocol, to: '/protocol' as const },
  { label: NAV.account, to: '/account' as const },
];

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="User menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg border border-edge px-2.5 py-2 text-fg-muted transition-colors hover:bg-surface hover:text-fg"
      >
        <Icon name="user" className="h-4.5 w-4.5" aria-hidden="true" />
        <Icon name="chevron-down" className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-edge bg-canvas py-1.5 shadow-lg">
          {/* Email header */}
          <div className="px-3 py-2 text-xs text-fg-muted truncate">
            {user.email ?? 'Account'}
          </div>
          <div className="mx-2 border-t border-edge" />

          {/* Nav links */}
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className="block px-3 py-2 mx-1.5 rounded-lg text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg [&.active]:text-accent"
            >
              {item.label}
            </Link>
          ))}

          <div className="mx-2 border-t border-edge" />

          {/* Sign out */}
          <button
            type="button"
            onClick={() => {
              close();
              void signOut().then(() =>
                navigate({ to: '/auth', search: { mode: 'signin' } }),
              );
            }}
            className="block w-full px-3 py-2 mx-1.5 rounded-lg text-left text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            style={{ width: 'calc(100% - 0.75rem)' }}
          >
            {NAV.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
