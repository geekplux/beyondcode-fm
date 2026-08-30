import { describe, expect, it } from 'vitest'

import {
  episodePath,
  homePath,
  parsePath,
  pathToHtmlFile,
  prerenderPathList,
  statsPath,
  stripLocalePrefix,
} from './locale'

describe('paths', () => {
  it('uses unprefixed home, stats, and episode URLs', () => {
    expect(homePath()).toBe('/')
    expect(statsPath()).toBe('/stats')
    expect(episodePath('plain-guid-001')).toBe('/plain-guid-001')
  })

  it('parses home, episode, and nested unknown paths', () => {
    expect(parsePath('/')).toEqual({
      episodeId: null,
      notFound: false,
      isStats: false,
    })
    expect(parsePath('/plain-guid-001')).toEqual({
      episodeId: 'plain-guid-001',
      notFound: false,
      isStats: false,
    })
    expect(parsePath('/a/b')).toEqual({
      episodeId: null,
      notFound: true,
      isStats: false,
    })
  })

  it('reserves /stats as a stats path, never an episode id', () => {
    expect(parsePath('/stats')).toEqual({
      episodeId: null,
      notFound: false,
      isStats: true,
    })
    expect(parsePath('/en/stats')).toEqual({
      episodeId: null,
      notFound: false,
      isStats: true,
    })
    expect(parsePath('/zh-CN/stats')).toEqual({
      episodeId: null,
      notFound: false,
      isStats: true,
    })
    expect(parsePath('/stats/extra')).toEqual({
      episodeId: null,
      notFound: true,
      isStats: false,
    })
  })

  it('maps routes onto prerender HTML files', () => {
    expect(pathToHtmlFile('/')).toBe('index.html')
    expect(pathToHtmlFile('/plain-guid-001')).toBe('plain-guid-001/index.html')
    expect(pathToHtmlFile('/stats')).toBe('stats/index.html')
  })

  it('includes /stats in the prerender path list ahead of episode ids', () => {
    expect(prerenderPathList(['plain-guid-001', 'url-guid-ep'])).toEqual([
      '/',
      '/stats',
      '/plain-guid-001',
      '/url-guid-ep',
    ])
    expect(prerenderPathList(['stats'])).toEqual(['/', '/stats', '/stats'])
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
      isStats: false,
    })
  })
})
