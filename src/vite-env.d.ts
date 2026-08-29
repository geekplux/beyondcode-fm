/// <reference types="vite/client" />

declare module 'virtual:podcast-feed' {
  import type { Episode, Podcast } from './types'

  export const podcast: Podcast
  export const episodes: Episode[]
  export const rssUrl: string
}
