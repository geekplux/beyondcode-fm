import type { Host } from '../types'

export const DEFAULT_RSS_URL = 'https://feed.xyzfm.space/nfm8cu8deycn'

type PodcastConfig = {
  directories: string[]
  hosts: Host[]
}

export const podcastConfig: PodcastConfig = {
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
  hosts: [
    { name: 'GeekPlux', link: 'https://geekplux.com' },
    { name: 'Randy', link: 'https://lutaonan.com' },
  ],
}

/** Cloudflare sets PODCAST_RSS_URL. DEFAULT_RSS_URL is the local fallback. */
export function resolveRssUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.PODCAST_RSS_URL || DEFAULT_RSS_URL
}
