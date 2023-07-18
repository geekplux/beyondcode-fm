import { cache } from 'react'
import { parse } from 'rss-to-json'

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
    'https://open.spotify.com/show/4SQGjdFrUwoE21iVoeHnjC?si=b7200059391c47f5',
    'https://www.youtube.com/@BeyondCodeFM/featured',
    'https://space.bilibili.com/3494350879198031?spm_id_from=333.1007.0.0',
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

export const getPodcastEpisodes = cache(async () => {
  const feed = await parse(process.env.NEXT_PUBLIC_PODCAST_RSS || '')
  const episodes: Episode[] = feed.items.map((item) => ({
    id: item.id.split('/').pop(),
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

export const getPodcastEpisode = cache(async (id: string) => {
  const episodes = await getPodcastEpisodes()
  return episodes.find((episode) => episode.id.endsWith(id))
})
