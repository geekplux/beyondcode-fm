import { describe, expect, it } from 'vitest'

import { DEFAULT_RSS_URL, resolveRssUrl } from './podcast-config'

describe('resolveRssUrl', () => {
  it('prefers PODCAST_RSS_URL, then the Next/Vite public names, then the production default', () => {
    expect(
      resolveRssUrl({
        PODCAST_RSS_URL: 'https://a.example/feed',
        NEXT_PUBLIC_PODCAST_RSS: 'https://b.example/feed',
        VITE_PODCAST_RSS: 'https://c.example/feed',
      }),
    ).toBe('https://a.example/feed')
    expect(
      resolveRssUrl({
        NEXT_PUBLIC_PODCAST_RSS: 'https://b.example/feed',
        VITE_PODCAST_RSS: 'https://c.example/feed',
      }),
    ).toBe('https://b.example/feed')
    expect(resolveRssUrl({ VITE_PODCAST_RSS: 'https://c.example/feed' })).toBe(
      'https://c.example/feed',
    )
    expect(resolveRssUrl({})).toBe(DEFAULT_RSS_URL)
    expect(DEFAULT_RSS_URL).toBe('https://feed.xyzfm.space/nfm8cu8deycn')
  })
})
