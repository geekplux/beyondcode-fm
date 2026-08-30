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

  it('maps /stats onto prerender HTML and never treats it as an episode file', () => {
    expect(pathToHtmlFile('/stats')).toBe('stats/index.html')
  })

  it('reserves a Statistics control and four dashboard sections in shipped UI', () => {
    const layout = readFileSync(join(root, 'src/components/PodcastLayout.tsx'), 'utf8')
    const page = readFileSync(join(root, 'src/components/StatsPage.tsx'), 'utf8')
    const charts = readFileSync(join(root, 'src/components/StatsCharts.tsx'), 'utf8')
    const routes = readFileSync(join(root, 'src/Root.tsx'), 'utf8')
    const messages = JSON.parse(
      readFileSync(join(root, 'src/messages/en.json'), 'utf8'),
    ) as {
      Layout: { statistics: string }
      StatsPage: Record<string, string>
    }

    expect(layout).toContain('paths.stats')
    expect(layout).toContain("t('statistics')")
    expect(routes).toContain('path="stats"')
    expect(routes).toContain('StatsPage')
    expect(messages.Layout.statistics).toBe('Statistics')
    expect(messages.StatsPage.total_subscribers).toBe('Total Subscribers')
    expect(messages.StatsPage.total_views).toBe('Total Views')
    expect(messages.StatsPage.total_comments).toBe('Total Comments')
    expect(messages.StatsPage.subscribers).toMatch(/Subscribers/)
    expect(messages.StatsPage.views).toMatch(/Views|listens/)
    expect(messages.StatsPage.comments).toBe('Comments')
    expect(messages.StatsPage.tab_total).toBe('Total')
    expect(messages.StatsPage.tab_bilibili).toBe('Bilibili')
    expect(messages.StatsPage.tab_youtube).toBe('YouTube')
    expect(messages.StatsPage.tab_xiaoyuzhou).toBe('Xiaoyuzhou')
    expect(page).toContain("t('total_subscribers')")
    expect(page).toContain("t('total_views')")
    expect(page).toContain("t('total_comments')")
    expect(page).toContain('StackedBarChart')
    expect(page).toContain('AreaChart')
    expect(charts).toContain('data-chart="stacked-bar"')
    expect(charts).toContain('data-chart="area"')
  })
})
