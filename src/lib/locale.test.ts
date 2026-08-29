import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LOCALE,
  episodePath,
  homePath,
  isLocale,
  parsePath,
  pathToHtmlFile,
  stripDefaultLocalePrefix,
} from './locale'

describe('locale path rules', () => {
  it('omits a prefix for the default locale and prefixes zh-CN', () => {
    expect(DEFAULT_LOCALE).toBe('en')
    expect(homePath('en')).toBe('/')
    expect(homePath('zh-CN')).toBe('/zh-CN')
    expect(episodePath('en', 'plain-guid-001')).toBe('/plain-guid-001')
    expect(episodePath('zh-CN', 'plain-guid-001')).toBe(
      '/zh-CN/plain-guid-001',
    )
  })

  it('parses home, episode, and nested unknown paths', () => {
    expect(parsePath('/')).toEqual({
      locale: 'en',
      episodeId: null,
      notFound: false,
    })
    expect(parsePath('/zh-CN')).toEqual({
      locale: 'zh-CN',
      episodeId: null,
      notFound: false,
    })
    expect(parsePath('/zh-CN/')).toEqual({
      locale: 'zh-CN',
      episodeId: null,
      notFound: false,
    })
    expect(parsePath('/plain-guid-001')).toEqual({
      locale: 'en',
      episodeId: 'plain-guid-001',
      notFound: false,
    })
    expect(parsePath('/zh-CN/plain-guid-001')).toEqual({
      locale: 'zh-CN',
      episodeId: 'plain-guid-001',
      notFound: false,
    })
    expect(parsePath('/zh-CN/a/b')).toEqual({
      locale: 'zh-CN',
      episodeId: null,
      notFound: true,
    })
    expect(parsePath('/a/b')).toEqual({
      locale: 'en',
      episodeId: null,
      notFound: true,
    })
  })

  it('recognizes supported locales only', () => {
    expect(isLocale('en')).toBe(true)
    expect(isLocale('zh-CN')).toBe(true)
    expect(isLocale('fr')).toBe(false)
  })

  it('maps routes onto prerender HTML files', () => {
    expect(pathToHtmlFile('/')).toBe('index.html')
    expect(pathToHtmlFile('/zh-CN')).toBe('zh-CN/index.html')
    expect(pathToHtmlFile('/plain-guid-001')).toBe('plain-guid-001/index.html')
    expect(pathToHtmlFile('/zh-CN/plain-guid-001')).toBe(
      'zh-CN/plain-guid-001/index.html',
    )
  })

  it('strips the default-locale prefix so /en behaves as unprefixed English', () => {
    expect(stripDefaultLocalePrefix('/en')).toBe('/')
    expect(stripDefaultLocalePrefix('/en/plain-guid-001')).toBe(
      '/plain-guid-001',
    )
    expect(stripDefaultLocalePrefix('/zh-CN')).toBeNull()
    expect(stripDefaultLocalePrefix('/plain-guid-001')).toBeNull()
  })
})
