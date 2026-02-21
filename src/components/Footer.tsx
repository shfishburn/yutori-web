import { Link } from '@tanstack/react-router';
import { BRAND, FOOTER_COLUMNS, FOOTER_SUPPORT_HEADING, FOOTER_COPYRIGHT } from '../content/common';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-edge">
      <div className="mx-auto max-w-6xl px-gutter py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="shrink-0">
            <Link to="/" className="text-base font-semibold tracking-tight text-fg opacity-70">
              {BRAND.name}
            </Link>
            <p className="mt-3 text-sm text-fg-subtle">
              {BRAND.tagline}
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-x-12 gap-y-8">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">
                  {col.heading}
                </p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="text-sm text-fg-muted transition-colors hover:text-fg"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">
                {FOOTER_SUPPORT_HEADING}
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    href={`mailto:${BRAND.supportEmail}`}
                    className="text-sm text-fg-muted transition-colors hover:text-fg"
                  >
                    {BRAND.supportEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-edge pt-6 text-xs text-fg-subtle">
          {FOOTER_COPYRIGHT(new Date().getFullYear())}
        </div>
      </div>
    </footer>
  );
}
