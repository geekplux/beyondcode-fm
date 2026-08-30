import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { findEpisode } from './episode-id'
import { episodePath, homePath, parsePath } from './locale'
import { parsePodcastFeed } from './rss'

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  'fixtures/feed.xml',
)

const xml = readFileSync(fixturePath, 'utf8')

describe('parsePodcastFeed', () => {
  it('maps channel metadata from the fixture RSS XML', () => {
    const { podcast, episodes } = parsePodcastFeed(xml)

    expect(podcast.title).toBe('Fixture Podcast')
    expect(podcast.description).toContain('fixture')
    expect(podcast.link).toBe('https://example.com/show')
    expect(podcast.coverArt).toBe('https://example.com/cover.jpg')
    expect(episodes).toHaveLength(3)
  })

  it('maps item fields including enclosure, duration, cover, and content HTML', () => {
    const { episodes } = parsePodcastFeed(xml)
    const episode = episodes[0]

    expect(episode.title).toBe('Plain Guid Episode')
    expect(episode.id).toBe('plain-guid-001')
    expect(episode.link).toBe('https://example.com/episodes/plain-guid-episode')
    expect(episode.duration).toBe('01:02:03')
    expect(episode.coverArt).toBe('https://example.com/ep1.jpg')
    expect(episode.enclosure).toEqual({
      url: 'https://example.com/a.mp3',
      type: 'audio/mpeg',
      length: '123',
    })
    expect(episode.content).toContain('<h2>Notes</h2>')
    expect(episode.content).toContain('Show notes HTML for plain guid.')
    expect(episode.published).toBe(Date.parse('Mon, 01 Jan 2024 00:00:00 GMT'))
    expect(episodes[1].id).toBe('url-guid-ep')
    expect(episodes[2].id).toBe('ep=query-guid')
  })
})

describe('episode lookup against parsed fixture', () => {
  it('finds an episode by encoded id and by link suffix', () => {
    const { episodes } = parsePodcastFeed(xml)

    expect(findEpisode(episodes, 'plain-guid-001')?.title).toBe(
      'Plain Guid Episode',
    )
    expect(findEpisode(episodes, 'url-guid-ep')?.title).toBe('URL Guid Episode')
    expect(findEpisode(episodes, encodeURIComponent('ep=query-guid'))?.title).toBe(
      'Query Guid Episode',
    )
    expect(findEpisode(episodes, 'plain-guid-episode')?.title).toBe(
      'Plain Guid Episode',
    )
    expect(findEpisode(episodes, 'missing-id')).toBeUndefined()
  })

  it('builds home and episode paths from parsed ids', () => {
    const { episodes } = parsePodcastFeed(xml)
    const id = episodes[0]!.id

    expect(homePath()).toBe('/')
    expect(episodePath(id)).toBe('/plain-guid-001')
    expect(parsePath(episodePath(id))).toEqual({
      episodeId: id,
      notFound: false,
      isStats: false,
    })
    expect(findEpisode(episodes, parsePath(episodePath(id)).episodeId ?? '')?.id).toBe(
      id,
    )
  })
})
