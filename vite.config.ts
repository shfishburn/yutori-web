import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    // MDX for in-repo content pages (privacy/terms/FAQ)
    // Note: plugin order matters; MDX should run before tanstackStart/viteReact.
    mdx({
      remarkPlugins: [remarkGfm],
    }),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
