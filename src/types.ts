export type Podcast = {
  title: string
  description: string
  link: string
  coverArt: string
}

export type Episode = {
  id: string
  title: string
  description: string
  link: string
  published: number
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
