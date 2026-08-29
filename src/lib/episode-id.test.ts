import { describe, expect, it } from 'vitest'

import type { Episode } from '../types'
import { encodeEpisodeId, findEpisode } from './episode-id'

function episode(partial: Partial<Episode> & Pick<Episode, 'id' | 'link'>): Episode {
  return {
    title: partial.title ?? partial.id,
    description: '',
    published: 0,
    content: '',
    duration: '',
    enclosure: { url: '', type: '', length: '' },
    ...partial,
  }
}

describe('encodeEpisodeId', () => {
  it('keeps non-http identifiers unchanged', () => {
    expect(encodeEpisodeId('plain-guid-001')).toBe('plain-guid-001')
  })

  it('uses the last pathname segment for http identifiers', () => {
    expect(
      encodeEpisodeId('https://cdn.example.com/episodes/url-guid-ep'),
    ).toBe('url-guid-ep')
  })

  it('uses the query string when the pathname is empty', () => {
    expect(encodeEpisodeId('https://example.com/?ep=query-guid')).toBe(
      'ep=query-guid',
    )
  })
})

describe('findEpisode', () => {
  const episodes = [
    episode({
      id: 'plain-guid-001',
      link: 'https://example.com/episodes/plain-guid-episode',
    }),
    episode({
      id: 'url-guid-ep',
      link: 'https://cdn.example.com/episodes/url-guid-ep',
    }),
  ]

  it('matches a decoded id', () => {
    expect(findEpisode(episodes, 'plain-guid-001')?.id).toBe('plain-guid-001')
  })

  it('matches when the episode link ends with the decoded id', () => {
    expect(findEpisode(episodes, 'url-guid-ep')?.id).toBe('url-guid-ep')
  })

  it('returns undefined when nothing matches', () => {
    expect(findEpisode(episodes, 'does-not-exist')).toBeUndefined()
  })
})
