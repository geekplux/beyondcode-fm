export type Podcast = {
  title: string
  description: string
  link: string
  coverArt: string
}

export type Episode = {
  /** Encoded by encodeEpisodeId — not always the raw RSS guid. */
  id: string
  title: string
  description: string
  link: string
  /** Epoch milliseconds from pubDate. */
  published: number
  /** content:encoded when present, otherwise description. */
  content: string
  duration: string
  coverArt?: string
  enclosure: {
    url: string
    type: string
    length: string
  }
}

export type Host = {
  name: string
  link: string
}

export type PodcastFeed = {
  podcast: Podcast
  episodes: Episode[]
}
