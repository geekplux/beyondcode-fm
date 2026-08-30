/// <reference types="vite/client" />

/** Only client-side feed source. Filled by vite-plugin-podcast at dev/build time. */
declare module 'virtual:podcast-feed' {
  import type { Episode, Podcast } from './types'

  export const podcast: Podcast
  export const episodes: Episode[]
  export const rssUrl: string
}
