import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { podcastPlugin } from './vite-plugin-podcast'

export default defineConfig(({ command }) => ({
  appType: process.env.VITEST ? 'spa' : command === 'serve' ? 'custom' : 'mpa',
  plugins: [react(), podcastPlugin()],
  optimizeDeps: {
    include: ['html-to-text'],
  },
  ssr: {
    noExternal: ['html-to-text', 'react-markdown', 'remark-gfm'],
  },
  preview: {
    port: 4173,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
