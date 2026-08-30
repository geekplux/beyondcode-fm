import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { pathToHtmlFile } from './lib/locale'

const root = dirname(fileURLToPath(new URL('.', import.meta.url)))

describe('architecture contracts', () => {
  it('keeps the SSR placeholders in index.html', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8')
    expect(html).toContain('<!--app-title-->')
    expect(html).toContain('<!--app-description-->')
    expect(html).toContain('<!--app-head-->')
    expect(html).toContain('<!--app-html-->')
    expect(html).toContain('<div id="root">')
  })

  it('limits Pages Functions to /api/og', () => {
    const routes = JSON.parse(
      readFileSync(join(root, 'public/_routes.json'), 'utf8'),
    ) as { include: string[] }
    expect(routes.include).toEqual(['/api/og'])
  })

  it('keeps leftover locale redirects', () => {
    const redirects = readFileSync(join(root, 'public/_redirects'), 'utf8')
    expect(redirects).toMatch(/\/en\s+\/\s+301/)
    expect(redirects).toMatch(/\/en\/\*\s+\/:splat\s+301/)
    expect(redirects).toMatch(/\/zh-CN\s+\/\s+301/)
    expect(redirects).toMatch(/\/zh-CN\/\*\s+\/:splat\s+301/)
  })

  it('declares the virtual feed module exports', () => {
    const types = readFileSync(join(root, 'src/vite-env.d.ts'), 'utf8')
    expect(types).toContain("declare module 'virtual:podcast-feed'")
    expect(types).toContain('export const podcast')
    expect(types).toContain('export const episodes')
    expect(types).toContain('export const rssUrl')
  })

  it('maps episode routes onto prerender HTML files', () => {
    expect(pathToHtmlFile('/abc')).toBe('abc/index.html')
  })
})
