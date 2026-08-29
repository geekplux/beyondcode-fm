import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

import { FIXTURE_FEED_PATH, loadPodcastFeed, readLocalRss } from './load-rss'
import { parsePodcastFeed } from './rss'

describe('loadPodcastFeed', () => {
  it('reads the committed RSS fixture from disk without the network', () => {
    const xml = readLocalRss(FIXTURE_FEED_PATH)
    const parsed = parsePodcastFeed(xml)
    expect(parsed.podcast.title).toBe('Fixture Podcast')
    expect(parsed.episodes.map((episode) => episode.id)).toEqual([
      'plain-guid-001',
      'url-guid-ep',
      'ep=query-guid',
    ])
  })

  it('loads a file: URL through the shipped loader', async () => {
    const loaded = await loadPodcastFeed({
      rssUrl: pathToFileURL(FIXTURE_FEED_PATH).href,
    })
    expect(loaded.usedFallback).toBe(false)
    expect(loaded.podcast.title).toBe('Fixture Podcast')
    expect(loaded.episodes[0]?.title).toBe('Plain Guid Episode')
  })

  it('falls back to the committed fixture when the remote feed cannot be fetched', async () => {
    const loaded = await loadPodcastFeed({
      rssUrl: 'https://example.invalid/feed.xml',
      fetchImpl: async () => {
        throw new Error('network down')
      },
      fallbackPath: FIXTURE_FEED_PATH,
    })
    expect(loaded.usedFallback).toBe(true)
    expect(loaded.source).toBe(FIXTURE_FEED_PATH)
    expect(loaded.podcast.title).toBe('Fixture Podcast')
    expect(loaded.rssUrl).toBe('https://example.invalid/feed.xml')
  })
})
