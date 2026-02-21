import type { ReactNode } from 'react';
import {
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import appCss from '../styles.css?url';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Yutori — Thermal Wellness, Measured' },
      { name: 'description', content: 'Sensor-connected sauna and cold plunge hardware with an app that tracks temperature, HRV, and session history automatically.' },
      { property: 'og:title', content: 'Yutori — Thermal Wellness, Measured' },
      { property: 'og:description', content: 'Sensor-connected sauna and cold plunge hardware with an app that tracks temperature, HRV, and session history automatically.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Yutori — Thermal Wellness, Measured' },
      { name: 'twitter:description', content: 'Track your heat. Time your sauna. Know your cold.' },
      { name: 'theme-color', content: '#141726' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/png', href: '/symbol.png' },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'apple-touch-icon', href: '/logo192.png' },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  const showDevtools = import.meta.env.DEV;

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />

        {children}

        <Footer />

        {showDevtools ? (
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
          />
        ) : null}

        <Scripts />
      </body>
    </html>
  );
}
