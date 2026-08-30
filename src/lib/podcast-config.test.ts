import { describe, expect, it } from 'vitest'

import { DEFAULT_RSS_URL, resolveRssUrl } from './podcast-config'

describe('resolveRssUrl', () => {
  it('prefers PODCAST_RSS_URL, then the production default', () => {
    expect(
      resolveRssUrl({
        PODCAST_RSS_URL: 'https://a.example/feed',
      }),
    ).toBe('https://a.example/feed')
    expect(resolveRssUrl({})).toBe(DEFAULT_RSS_URL)
    expect(DEFAULT_RSS_URL).toBe('https://feed.xyzfm.space/nfm8cu8deycn')
  })
})
