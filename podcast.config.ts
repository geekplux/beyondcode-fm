import { cache } from 'react'
import { parse } from 'rss-to-json'

import type { SupportedDirectory } from './app/[locale]/PodcastDirectoryLink'

type PodcastConfig = {
  directories: SupportedDirectory[]
  hosts: Host[]
}

/**
 * TODO: Add your podcast config here
 */
export const podcastConfig: PodcastConfig = {
  /**
   * Step 1. Add your podcast directories here
   * We support links from:
   *   Apple Podcasts, Google Podcasts, Spotify, Stitcher, Overcast,
   *   Pocket Casts Castro, 小宇宙, 哔哩哔哩, YouTube
   */
  directories: [
    'https://podcasts.apple.com/us/podcast/%E4%BB%A3%E7%A0%81%E4%B9%8B%E5%A4%96-beyondcode/id1688972924',
    'https://open.spotify.com/show/4SQGjdFrUwoE21iVoeHnjC',
    'https://www.youtube.com/@BeyondCodeFM/featured',
    'https://space.bilibili.com/3494350879198031',
    'https://www.xiaoyuzhoufm.com/podcast/6194d973c14c9a0db82de1ea',
    'https://overcast.fm/itunes1688972924/beyondcode',
    'https://castro.fm/podcast/e4f04012-a815-43ad-83f6-d60b34afe365',
    'https://pca.st/ysrcs057',
  ],
  /**
   * Step 2. Add your podcast hosts here
   */
  hosts: [
    { name: 'GeekPlux', link: 'https://geekplux.com' },
    { name: 'Randy', link: 'https://lutaonan.com' },
  ],
}

/**
 * Get podcast via RSS feed.
 */
export const getPodcast = cache(async () => {
  const feed = await parse(process.env.NEXT_PUBLIC_PODCAST_RSS || '')
  const podcast: Podcast = {
    title: feed.title,
    description: feed.description,
    link: feed.link,
    coverArt: feed.image,
  }

  return podcast
})

/**
 * Encode episode id.
 * (Certain episode id contains special characters that are not allowed in URL)
 */
function encodeEpisodeId(raw: string): string {
  if (!raw.startsWith('http')) {
    return raw
  }

  const url = new URL(raw)
  const path = url.pathname.split('/')
  const lastPathname = path[path.length - 1]

  if (lastPathname === '' && url.search) {
    return url.search.slice(1)
  }

  return lastPathname
}

/**
 * Get podcast episodes via RSS feed.
 */
export const getPodcastEpisodes = cache(async () => {
  const feed = await parse(process.env.NEXT_PUBLIC_PODCAST_RSS || '')
  const episodes: Episode[] = feed.items.map((item) => ({
    id: encodeEpisodeId(item.id ?? item.link),
    title: item.title,
    description: item.description,
    link: item.link,
    published: item.published,
    content: item.content,
    duration: item.itunes_duration,
    enclosure: item.enclosures[0],
    coverArt: item.itunes_image?.href,
  }))

  return episodes
})

/**
 * Get podcast episode by id.
 */
export const getPodcastEpisode = cache(async (id: string) => {
  const episodes = await getPodcastEpisodes()
  const decodedId = decodeURIComponent(id)
  return episodes.find(
    (episode) => episode.id === decodedId || episode.link.endsWith(decodedId)
  )
})
