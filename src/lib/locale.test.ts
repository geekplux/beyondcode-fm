import { describe, expect, it } from 'vitest'

import {
  episodePath,
  homePath,
  parsePath,
  pathToHtmlFile,
  stripLocalePrefix,
} from './locale'

describe('paths', () => {
  it('uses unprefixed home and episode URLs', () => {
    expect(homePath()).toBe('/')
    expect(episodePath('plain-guid-001')).toBe('/plain-guid-001')
  })

  it('parses home, episode, and nested unknown paths', () => {
    expect(parsePath('/')).toEqual({ episodeId: null, notFound: false })
    expect(parsePath('/plain-guid-001')).toEqual({
      episodeId: 'plain-guid-001',
      notFound: false,
    })
    expect(parsePath('/a/b')).toEqual({ episodeId: null, notFound: true })
  })

  it('maps routes onto prerender HTML files', () => {
    expect(pathToHtmlFile('/')).toBe('index.html')
    expect(pathToHtmlFile('/plain-guid-001')).toBe('plain-guid-001/index.html')
  })

  it('redirects legacy locale prefixes to unprefixed paths', () => {
    expect(stripLocalePrefix('/en')).toBe('/')
    expect(stripLocalePrefix('/en/plain-guid-001')).toBe('/plain-guid-001')
    expect(stripLocalePrefix('/zh-CN')).toBe('/')
    expect(stripLocalePrefix('/zh-CN/plain-guid-001')).toBe('/plain-guid-001')
    expect(stripLocalePrefix('/plain-guid-001')).toBeNull()
    expect(parsePath('/zh-CN/plain-guid-001')).toEqual({
      episodeId: 'plain-guid-001',
      notFound: false,
    })
  })
})
