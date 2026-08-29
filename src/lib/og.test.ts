import { describe, expect, it } from 'vitest'

import {
  ogBarHeights,
  ogImagePath,
  ogImageUrl,
  parseCoverUrl,
  resolveOgBaseUrl,
} from './og'

describe('parseCoverUrl', () => {
  it('accepts http(s) cover URLs from the feed', () => {
    expect(parseCoverUrl('https://example.com/cover.jpg')).toBe(
      'https://example.com/cover.jpg',
    )
    expect(parseCoverUrl('http://example.com/ep.png')).toBe(
      'http://example.com/ep.png',
    )
  })

  it('rejects missing, non-http, and credentialed URLs', () => {
    expect(parseCoverUrl(null)).toBeNull()
    expect(parseCoverUrl('')).toBeNull()
    expect(parseCoverUrl('not-a-url')).toBeNull()
    expect(parseCoverUrl('javascript:alert(1)')).toBeNull()
    expect(parseCoverUrl('https://user:pass@example.com/cover.jpg')).toBeNull()
  })
})

describe('ogImageUrl', () => {
  it('builds the same /api/og?cover= path the Next route used', () => {
    const cover = 'https://example.com/cover.jpg'
    expect(ogImagePath(cover)).toBe(
      '/api/og?cover=https%3A%2F%2Fexample.com%2Fcover.jpg',
    )
    expect(ogImageUrl(cover, '')).toBe(
      '/api/og?cover=https%3A%2F%2Fexample.com%2Fcover.jpg',
    )
    expect(ogImageUrl(cover, 'https://beyondcodefm.com')).toBe(
      'https://beyondcodefm.com/api/og?cover=https%3A%2F%2Fexample.com%2Fcover.jpg',
    )
  })

  it('reads OG_PUBLIC_URL then NEXT_PUBLIC_OG_URL', () => {
    expect(resolveOgBaseUrl({ OG_PUBLIC_URL: 'https://a.example/' })).toBe(
      'https://a.example',
    )
    expect(
      resolveOgBaseUrl({ NEXT_PUBLIC_OG_URL: 'https://beyondcodefm.com' }),
    ).toBe('https://beyondcodefm.com')
    expect(resolveOgBaseUrl({})).toBe('')
  })
})

describe('ogBarHeights', () => {
  it('returns a stable waveform used by the OG card', () => {
    const bars = ogBarHeights()
    expect(bars).toHaveLength(80)
    expect(bars.every((height) => height >= 18 && height <= 66)).toBe(true)
    expect(ogBarHeights()).toEqual(bars)
  })
})
