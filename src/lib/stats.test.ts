import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { parsePath, prerenderPathList, statsPath } from './locale'
import {
  compactCount,
  currentTotals,
  downsample,
  finiteNumber,
  formatCount,
  historyUrl,
  latestUsablePoint,
  loadStatsHistory,
  normalizeHistory,
  platformSeries,
  resolveStatsApiUrl,
  stackedSeries,
  type HistoryPayload,
} from './stats'

const history: HistoryPayload = {
  youtube: [
    { date: '2023-08-12', subscribers: 10, views: 100, comments: 1 },
    { date: '2023-08-13', subscribers: 20, views: 200, comments: 2 },
  ],
  bilibili: [
    { date: '2023-08-12', subscribers: 5, views: 50, comments: 3 },
  ],
  xiaoyuzhou: [
    { date: '2023-08-13', subscribers: 7, views: 70, comments: 4 },
  ],
}

describe('stats routing', () => {
  it('treats /stats as a stats path, not an episode', () => {
    expect(statsPath()).toBe('/stats')
    expect(parsePath('/stats').isStats).toBe(true)
    expect(parsePath('/stats').episodeId).toBeNull()
    expect(parsePath('/stats').notFound).toBe(false)
  })

  it('includes /stats in the prerender path list', () => {
    expect(prerenderPathList(['plain-guid-001'])).toContain('/stats')
    expect(prerenderPathList(['plain-guid-001'])[1]).toBe('/stats')
  })
})

describe('currentTotals', () => {
  it('equals the sum of each platform’s latest usable point', () => {
    const totals = currentTotals(history)
    expect(totals.subscribers).toBe(20 + 5 + 7)
    expect(totals.views).toBe(200 + 50 + 70)
    expect(totals.comments).toBe(2 + 3 + 4)
    expect(totals.platforms.youtube.subscribers).toBe(20)
    expect(totals.platforms.bilibili.views).toBe(50)
    expect(totals.platforms.xiaoyuzhou.comments).toBe(4)
  })

  it('ignores trailing unusable and all-zero points when summing totals', () => {
    const totals = currentTotals({
      ...history,
      youtube: [
        ...history.youtube,
        { date: 'not-a-date', subscribers: 999, views: 999, comments: 999 },
        { date: '2023-08-14', subscribers: 0, views: 0, comments: 0 },
      ],
    })
    expect(totals.platforms.youtube.subscribers).toBe(20)
    expect(totals.subscribers).toBe(32)
  })
})

describe('stackedSeries', () => {
  it('aligns dates and stacks YouTube + Bilibili + Xiaoyuzhou', () => {
    const series = stackedSeries(history, 'subscribers')
    expect(series).toEqual([
      {
        date: '2023-08-12',
        youtube: 10,
        bilibili: 5,
        xiaoyuzhou: 0,
        total: 15,
      },
      {
        date: '2023-08-13',
        youtube: 20,
        bilibili: 0,
        xiaoyuzhou: 7,
        total: 27,
      },
    ])
    expect(series.every((point) => Number.isFinite(point.total))).toBe(true)
  })
})

describe('platformSeries', () => {
  it('emits only that platform’s metric', () => {
    const youtube = platformSeries(history, 'youtube', 'views')
    expect(youtube).toEqual([
      { date: '2023-08-12', value: 100 },
      { date: '2023-08-13', value: 200 },
    ])
    expect(platformSeries(history, 'bilibili', 'comments')).toEqual([
      { date: '2023-08-12', value: 3 },
    ])
    expect(platformSeries(history, 'xiaoyuzhou', 'subscribers')).toEqual([
      { date: '2023-08-13', value: 7 },
    ])
  })
})

describe('missing and zero days', () => {
  it('does not produce NaN for missing, zero, or junk values', () => {
    const broken = normalizeHistory({
      youtube: [
        { date: '2023-08-12', subscribers: 0, views: null, comments: 'nope' },
        { date: '2023-08-13', subscribers: undefined, views: Number.NaN, comments: 0 },
      ],
      bilibili: [{ date: '2023-08-12' }],
      xiaoyuzhou: [{ date: 'bad', subscribers: 8, views: 8, comments: 8 }],
    })

    const totals = currentTotals(broken)
    expect(Number.isFinite(totals.subscribers)).toBe(true)
    expect(Number.isFinite(totals.views)).toBe(true)
    expect(Number.isFinite(totals.comments)).toBe(true)
    expect(totals.subscribers).toBe(0)
    expect(totals.views).toBe(0)
    expect(totals.comments).toBe(0)

    const stacked = stackedSeries(broken, 'subscribers')
    expect(stacked.every((point) => Number.isFinite(point.youtube))).toBe(true)
    expect(stacked.every((point) => Number.isFinite(point.bilibili))).toBe(true)
    expect(stacked.every((point) => Number.isFinite(point.xiaoyuzhou))).toBe(
      true,
    )
    expect(stacked.every((point) => Number.isFinite(point.total))).toBe(true)
    expect(stacked.some((point) => Number.isNaN(point.total))).toBe(false)

    const area = platformSeries(broken, 'youtube', 'views')
    expect(area.every((point) => Number.isFinite(point.value))).toBe(true)
    expect(finiteNumber(Number.NaN)).toBe(0)
    expect(latestUsablePoint(broken.xiaoyuzhou)).toBeNull()
  })
})

describe('format helpers', () => {
  it('formats finite counts and never prints NaN', () => {
    expect(formatCount(12345)).toBe('12,345')
    expect(formatCount(Number.NaN)).toBe('0')
    expect(compactCount(1500)).toBe('1.5k')
    expect(compactCount(Number.NaN)).toBe('0')
  })

  it('downsamples without inventing points', () => {
    const points = [1, 2, 3, 4, 5]
    expect(downsample(points, 10)).toEqual(points)
    expect(downsample(points, 3)).toEqual([1, 3, 5])
  })

  it('reads the stats API origin from VITE_FMSTATS_URL', () => {
    expect(resolveStatsApiUrl({})).toBe('https://fmstats.fum.workers.dev')
    expect(resolveStatsApiUrl({ VITE_FMSTATS_URL: 'http://127.0.0.1:8787/' })).toBe(
      'http://127.0.0.1:8787',
    )
  })

  it('loadStatsHistory fetches /history from the shipped API entry', async () => {
    const base = resolveStatsApiUrl({})
    expect(historyUrl(base)).toBe('https://fmstats.fum.workers.dev/history')

    const fetchFn: typeof fetch = async (input) => {
      expect(String(input)).toBe('https://fmstats.fum.workers.dev/history')
      return new Response(
        JSON.stringify({
          youtube: [
            { date: '2023-08-12', subscribers: 1, views: 2, comments: 3 },
          ],
          bilibili: [],
          xiaoyuzhou: [],
        }),
      )
    }

    const payload = await loadStatsHistory(base, fetchFn)
    expect(payload.youtube[0]).toEqual({
      date: '2023-08-12',
      subscribers: 1,
      views: 2,
      comments: 3,
    })
  })

  it('accepts captured_on as the date key from fmstats snapshots', () => {
    const payload = normalizeHistory({
      youtube: [
        {
          captured_on: '2023-08-12',
          subscribers: 4,
          views: 5,
          comments: 6,
        },
      ],
    })
    expect(payload.youtube[0]?.date).toBe('2023-08-12')
    expect(payload.youtube[0]?.subscribers).toBe(4)
  })
})

describe('entry-server prerender wiring', () => {
  it('calls prerenderPathList so /stats is in the shipped path list', () => {
    const root = dirname(fileURLToPath(new URL('.', import.meta.url)))
    const src = readFileSync(join(root, 'entry-server.tsx'), 'utf8')
    expect(src).toContain('prerenderPathList')
    expect(src).toContain('parsed.isStats')
  })
})
