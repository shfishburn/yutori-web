import { Link } from '@tanstack/react-router';

const FOOTER_LINKS: Array<{
  heading: string
  links: Array<{ label: string; href: string }>
}> = [
  {
    heading: 'Shop',
    links: [{ label: 'Products', href: '/products' }],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-edge">
      <div className="mx-auto max-w-6xl px-gutter py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="shrink-0">
            <Link to="/">
              <img
                src="/yutori_logo.png"
                alt="Yutori"
                className="h-6 w-auto"
                style={{ filter: 'brightness(0) invert(1)', opacity: 0.7 }}
              />
            </Link>
            <p className="mt-3 text-sm text-fg-subtle">
              Thermal wellness, measured.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-x-12 gap-y-8">
            {FOOTER_LINKS.map((col) => (
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
                Support
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:support@yutorilabs.com"
                    className="text-sm text-fg-muted transition-colors hover:text-fg"
                  >
                    support@yutorilabs.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-edge pt-6 text-xs text-fg-subtle">
          © {new Date().getFullYear()} Yutori Labs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
