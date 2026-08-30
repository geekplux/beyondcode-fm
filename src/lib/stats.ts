/** Pure dashboard math. React only renders the result. */

export const PLATFORMS = ['youtube', 'bilibili', 'xiaoyuzhou'] as const
export type Platform = (typeof PLATFORMS)[number]

export const METRICS = ['subscribers', 'views', 'comments'] as const
export type Metric = (typeof METRICS)[number]

export type PlatformPoint = {
  date: string
  subscribers: number
  views: number
  comments: number
}

export type HistoryPayload = Record<Platform, PlatformPoint[]>

export type PlatformTotals = {
  subscribers: number
  views: number
  comments: number
  date: string | null
}

export type Totals = {
  subscribers: number
  views: number
  comments: number
  platforms: Record<Platform, PlatformTotals>
}

export type StackedBarPoint = {
  date: string
  youtube: number
  bilibili: number
  xiaoyuzhou: number
  total: number
}

export type AreaPoint = {
  date: string
  value: number
}

export const EMPTY_HISTORY: HistoryPayload = {
  youtube: [],
  bilibili: [],
  xiaoyuzhou: [],
}

export function finiteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return 0
}

function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function normalizePoint(raw: unknown): PlatformPoint | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const row = raw as Record<string, unknown>
  const dateRaw =
    typeof row.date === 'string'
      ? row.date
      : typeof row.captured_on === 'string'
        ? row.captured_on
        : ''
  const date = dateRaw.slice(0, 10)
  if (!isDateKey(date)) {
    return null
  }
  return {
    date,
    subscribers: finiteNumber(row.subscribers),
    views: finiteNumber(row.views),
    comments: finiteNumber(row.comments),
  }
}

export function normalizeHistory(raw: unknown): HistoryPayload {
  const source =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const history = { ...EMPTY_HISTORY }
  for (const platform of PLATFORMS) {
    const rows = Array.isArray(source[platform]) ? source[platform] : []
    const points = rows
      .map((row) => normalizePoint(row))
      .filter((row): row is PlatformPoint => row !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
    history[platform] = points
  }
  return history
}

/**
 * Latest point with a date and at least one non-zero metric.
 * All-zero days (failed scrapes) are skipped; NaN is treated as 0.
 */
export function latestUsablePoint(
  series: PlatformPoint[] | undefined,
): PlatformPoint | null {
  if (!series || series.length === 0) {
    return null
  }
  for (let i = series.length - 1; i >= 0; i--) {
    const point = series[i]
    if (!point || !isDateKey(point.date)) {
      continue
    }
    const subscribers = finiteNumber(point.subscribers)
    const views = finiteNumber(point.views)
    const comments = finiteNumber(point.comments)
    if (subscribers === 0 && views === 0 && comments === 0) {
      continue
    }
    return { ...point, subscribers, views, comments }
  }
  return null
}

export function currentTotals(history: HistoryPayload): Totals {
  const platforms = {} as Record<Platform, PlatformTotals>
  let subscribers = 0
  let views = 0
  let comments = 0

  for (const platform of PLATFORMS) {
    const latest = latestUsablePoint(history[platform])
    const slice: PlatformTotals = latest
      ? {
          subscribers: finiteNumber(latest.subscribers),
          views: finiteNumber(latest.views),
          comments: finiteNumber(latest.comments),
          date: latest.date,
        }
      : { subscribers: 0, views: 0, comments: 0, date: null }
    platforms[platform] = slice
    subscribers += slice.subscribers
    views += slice.views
    comments += slice.comments
  }

  return { subscribers, views, comments, platforms }
}

function indexByDate(
  series: PlatformPoint[],
  metric: Metric,
): Map<string, number> {
  const map = new Map<string, number>()
  for (const point of series) {
    if (!isDateKey(point.date)) {
      continue
    }
    map.set(point.date, finiteNumber(point[metric]))
  }
  return map
}

/** Date-aligned stack of the three platforms. Missing days are 0, never NaN. */
export function stackedSeries(
  history: HistoryPayload,
  metric: Metric,
): StackedBarPoint[] {
  const youtube = indexByDate(history.youtube ?? [], metric)
  const bilibili = indexByDate(history.bilibili ?? [], metric)
  const xiaoyuzhou = indexByDate(history.xiaoyuzhou ?? [], metric)
  const dates = new Set<string>([
    ...youtube.keys(),
    ...bilibili.keys(),
    ...xiaoyuzhou.keys(),
  ])
  return [...dates]
    .sort((a, b) => a.localeCompare(b))
    .map((date) => {
      const yt = finiteNumber(youtube.get(date))
      const bili = finiteNumber(bilibili.get(date))
      const xyz = finiteNumber(xiaoyuzhou.get(date))
      return {
        date,
        youtube: yt,
        bilibili: bili,
        xiaoyuzhou: xyz,
        total: yt + bili + xyz,
      }
    })
}

/** One platform's metric over time. Missing/zero days stay numeric. */
export function platformSeries(
  history: HistoryPayload,
  platform: Platform,
  metric: Metric,
): AreaPoint[] {
  const series = history[platform] ?? []
  return series
    .filter((point) => isDateKey(point.date))
    .map((point) => ({
      date: point.date,
      value: finiteNumber(point[metric]),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function downsample<T>(points: T[], maxPoints: number): T[] {
  if (maxPoints < 1 || points.length <= maxPoints) {
    return points
  }
  if (maxPoints === 1) {
    return [points[points.length - 1]!]
  }
  const out: T[] = []
  const last = points.length - 1
  const step = last / (maxPoints - 1)
  for (let i = 0; i < maxPoints; i++) {
    out.push(points[Math.round(i * step)]!)
  }
  return out
}

export function formatCount(value: number): string {
  const n = finiteNumber(value)
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}

export function compactCount(value: number): string {
  const n = Math.abs(finiteNumber(value))
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  }
  return String(Math.round(n))
}

export function resolveStatsApiUrl(
  env: Record<string, string | undefined> = {},
): string {
  const fromEnv = env.VITE_FMSTATS_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '')
  }
  return 'https://fmstats.fum.workers.dev'
}

export function historyUrl(apiBase: string): string {
  return `${apiBase.replace(/\/+$/, '')}/history`
}

export async function loadStatsHistory(
  apiBase: string,
  fetchFn: typeof fetch = fetch,
): Promise<HistoryPayload> {
  const response = await fetchFn(historyUrl(apiBase))
  if (!response.ok) {
    throw new Error(`stats history ${response.status}`)
  }
  return normalizeHistory(await response.json())
}
