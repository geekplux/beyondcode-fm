import { useEffect, useMemo, useState } from 'react'

import { useTranslations } from '../lib/i18n'
import {
  currentTotals,
  EMPTY_HISTORY,
  formatCount,
  loadStatsHistory,
  platformSeries,
  resolveStatsApiUrl,
  stackedSeries,
  type HistoryPayload,
  type Metric,
  type Platform,
  type Totals,
} from '../lib/stats'
import { AreaChart, ChartLegend, StackedBarChart, TabButton } from './StatsCharts'
import { Container } from './Container'

const TABS = ['total', 'bilibili', 'youtube', 'xiaoyuzhou'] as const
type Tab = (typeof TABS)[number]

const TAB_LABEL: Record<Tab, 'tab_total' | 'tab_bilibili' | 'tab_youtube' | 'tab_xiaoyuzhou'> = {
  total: 'tab_total',
  bilibili: 'tab_bilibili',
  youtube: 'tab_youtube',
  xiaoyuzhou: 'tab_xiaoyuzhou',
}

function TotalCard({
  title,
  value,
  platforms,
  metric,
}: {
  title: string
  value: number
  platforms: Totals['platforms']
  metric: Metric
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#4989E8] via-[#6159DA] to-[#FF54AD]" />
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-neutral-400">
        {title}
      </h2>
      <p className="mt-3 font-sans text-4xl font-bold tabular-nums tracking-tight text-stone-900 dark:text-neutral-50">
        {formatCount(value)}
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-[11px] leading-4 text-stone-500 dark:text-neutral-400">
        <div>
          <dt>YouTube</dt>
          <dd className="font-medium tabular-nums text-stone-800 dark:text-neutral-200">
            {formatCount(platforms.youtube[metric])}
          </dd>
        </div>
        <div>
          <dt>Bilibili</dt>
          <dd className="font-medium tabular-nums text-stone-800 dark:text-neutral-200">
            {formatCount(platforms.bilibili[metric])}
          </dd>
        </div>
        <div>
          <dt>Xiaoyuzhou</dt>
          <dd className="font-medium tabular-nums text-stone-800 dark:text-neutral-200">
            {formatCount(platforms.xiaoyuzhou[metric])}
          </dd>
        </div>
      </dl>
    </article>
  )
}

function MetricSection({
  title,
  metric,
  history,
}: {
  title: string
  metric: Metric
  history: HistoryPayload
}) {
  const t = useTranslations('StatsPage')
  const [tab, setTab] = useState<Tab>('total')
  const stacked = useMemo(() => stackedSeries(history, metric), [history, metric])
  const areas = useMemo(
    () => ({
      bilibili: platformSeries(history, 'bilibili', metric),
      youtube: platformSeries(history, 'youtube', metric),
      xiaoyuzhou: platformSeries(history, 'xiaoyuzhou', metric),
    }),
    [history, metric],
  )

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-bold text-stone-900 dark:text-neutral-100">
          {title}
        </h2>
        <div
          role="tablist"
          aria-label={title}
          className="flex border-b border-stone-200 dark:border-neutral-800"
        >
          {TABS.map((id) => (
            <TabButton
              key={id}
              selected={tab === id}
              onClick={() => setTab(id)}
            >
              {t(TAB_LABEL[id])}
            </TabButton>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-stone-200 bg-white px-3 py-4 dark:border-neutral-800 dark:bg-neutral-950 sm:px-5">
        <div hidden={tab !== 'total'}>
          <StackedBarChart points={stacked} />
          <ChartLegend />
        </div>
        {(
          [
            ['bilibili', areas.bilibili],
            ['youtube', areas.youtube],
            ['xiaoyuzhou', areas.xiaoyuzhou],
          ] as const
        ).map(([platform, points]) => (
          <div key={platform} hidden={tab !== platform}>
            <AreaChart points={points} platform={platform as Platform} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function StatsPage() {
  const t = useTranslations('StatsPage')
  const [history, setHistory] = useState<HistoryPayload>(EMPTY_HISTORY)
  const [failed, setFailed] = useState(false)
  const totals = currentTotals(history)

  useEffect(() => {
    const api = resolveStatsApiUrl({
      VITE_FMSTATS_URL: import.meta.env.VITE_FMSTATS_URL,
    })
    let cancelled = false
    loadStatsHistory(api)
      .then((payload) => {
        if (!cancelled) {
          setHistory(payload)
          setFailed(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="pb-12 pt-16 sm:pb-4 lg:pt-12">
      <Container>
        <header className="max-w-2xl">
          <p className="font-mono text-sm leading-7 text-stone-500 dark:text-neutral-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-bold text-stone-900 dark:text-neutral-100">
            {t('title')}
          </h1>
          <p className="mt-3 text-base leading-7 text-stone-500 dark:text-neutral-400">
            {t('lede')}
          </p>
          {failed && (
            <p className="mt-2 text-sm text-stone-400 dark:text-neutral-500">
              {t('unavailable')}
            </p>
          )}
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Totals">
          <TotalCard
            title={t('total_subscribers')}
            value={totals.subscribers}
            platforms={totals.platforms}
            metric="subscribers"
          />
          <TotalCard
            title={t('total_views')}
            value={totals.views}
            platforms={totals.platforms}
            metric="views"
          />
          <TotalCard
            title={t('total_comments')}
            value={totals.comments}
            platforms={totals.platforms}
            metric="comments"
          />
        </section>

        <MetricSection
          title={t('subscribers')}
          metric="subscribers"
          history={history}
        />
        <MetricSection title={t('views')} metric="views" history={history} />
        <MetricSection
          title={t('comments')}
          metric="comments"
          history={history}
        />
      </Container>
    </div>
  )
}
