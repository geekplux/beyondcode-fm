/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FMSTATS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Only client-side feed source. Filled by vite-plugin-podcast at dev/build time. */
declare module 'virtual:podcast-feed' {
  import type { Episode, Podcast } from './types'

  export const podcast: Podcast
  export const episodes: Episode[]
  export const rssUrl: string
}
