import type { AreaPoint, Platform, StackedBarPoint } from '../lib/stats'
import { compactCount, downsample } from '../lib/stats'
import { clsxm } from '../lib/clsxm'

export const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: '#FF54AD',
  bilibili: '#4989E8',
  xiaoyuzhou: '#6159DA',
}

const MAX_CHART_POINTS = 96

type StackedBarChartProps = {
  points: StackedBarPoint[]
}

function yTicks(max: number): number[] {
  if (max <= 0) {
    return [0, 1]
  }
  const raw = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const nice = Math.ceil(raw / magnitude) * magnitude
  return [0, nice, nice * 2, nice * 3, nice * 4]
}

export function StackedBarChart({ points }: StackedBarChartProps) {
  const sampled = downsample(points, MAX_CHART_POINTS)
  const width = 640
  const height = 220
  const pad = { top: 12, right: 12, bottom: 28, left: 44 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const max = Math.max(1, ...sampled.map((point) => point.total))
  const ticks = yTicks(max)
  const chartMax = ticks[ticks.length - 1] ?? max
  const gap = sampled.length > 40 ? 0.5 : 1.5
  const barSlot = sampled.length === 0 ? plotW : plotW / sampled.length
  const barW = Math.max(1, barSlot - gap)

  return (
    <svg
      data-chart="stacked-bar"
      viewBox={`0 0 ${width} ${height}`}
      className="h-56 w-full"
      role="img"
      aria-label="Stacked bar chart of total subscribers, views, or comments"
    >
      {ticks.map((tick) => {
        const y = pad.top + plotH - (tick / chartMax) * plotH
        return (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y}
              y2={y}
              className="stroke-stone-200 dark:stroke-neutral-800"
              strokeWidth="1"
            />
            <text
              x={pad.left - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-stone-400 dark:fill-neutral-500"
              fontSize="10"
            >
              {compactCount(tick)}
            </text>
          </g>
        )
      })}
      {sampled.map((point, index) => {
        const x = pad.left + index * barSlot + (barSlot - barW) / 2
        const hYt = (point.youtube / chartMax) * plotH
        const hBili = (point.bilibili / chartMax) * plotH
        const hXyz = (point.xiaoyuzhou / chartMax) * plotH
        const yXyz = pad.top + plotH - hXyz
        const yBili = yXyz - hBili
        const yYt = yBili - hYt
        return (
          <g key={point.date}>
            <rect
              x={x}
              y={yXyz}
              width={barW}
              height={Math.max(0, hXyz)}
              fill={PLATFORM_COLORS.xiaoyuzhou}
            />
            <rect
              x={x}
              y={yBili}
              width={barW}
              height={Math.max(0, hBili)}
              fill={PLATFORM_COLORS.bilibili}
            />
            <rect
              x={x}
              y={yYt}
              width={barW}
              height={Math.max(0, hYt)}
              fill={PLATFORM_COLORS.youtube}
            />
          </g>
        )
      })}
      {sampled.length > 0 && (
        <>
          <text
            x={pad.left}
            y={height - 8}
            className="fill-stone-400 dark:fill-neutral-500"
            fontSize="10"
          >
            {sampled[0]!.date}
          </text>
          <text
            x={width - pad.right}
            y={height - 8}
            textAnchor="end"
            className="fill-stone-400 dark:fill-neutral-500"
            fontSize="10"
          >
            {sampled[sampled.length - 1]!.date}
          </text>
        </>
      )}
    </svg>
  )
}

type AreaChartProps = {
  points: AreaPoint[]
  platform: Platform
}

export function AreaChart({ points, platform }: AreaChartProps) {
  const sampled = downsample(points, MAX_CHART_POINTS)
  const width = 640
  const height = 220
  const pad = { top: 12, right: 12, bottom: 28, left: 44 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const max = Math.max(1, ...sampled.map((point) => point.value))
  const ticks = yTicks(max)
  const chartMax = ticks[ticks.length - 1] ?? max
  const color = PLATFORM_COLORS[platform]
  const coords = sampled.map((point, index) => {
    const x =
      sampled.length === 1
        ? pad.left + plotW / 2
        : pad.left + (index / (sampled.length - 1)) * plotW
    const y = pad.top + plotH - (point.value / chartMax) * plotH
    return { x, y }
  })
  const line = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ')
  const area =
    coords.length === 0
      ? ''
      : `${line} L${coords[coords.length - 1]!.x} ${pad.top + plotH} L${coords[0]!.x} ${pad.top + plotH} Z`

  return (
    <svg
      data-chart="area"
      data-platform={platform}
      viewBox={`0 0 ${width} ${height}`}
      className="h-56 w-full"
      role="img"
      aria-label={`${platform} area chart`}
    >
      {ticks.map((tick) => {
        const y = pad.top + plotH - (tick / chartMax) * plotH
        return (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y}
              y2={y}
              className="stroke-stone-200 dark:stroke-neutral-800"
              strokeWidth="1"
            />
            <text
              x={pad.left - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-stone-400 dark:fill-neutral-500"
              fontSize="10"
            >
              {compactCount(tick)}
            </text>
          </g>
        )
      })}
      {area && <path d={area} fill={color} opacity="0.22" />}
      {line && (
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {sampled.length > 0 && (
        <>
          <text
            x={pad.left}
            y={height - 8}
            className="fill-stone-400 dark:fill-neutral-500"
            fontSize="10"
          >
            {sampled[0]!.date}
          </text>
          <text
            x={width - pad.right}
            y={height - 8}
            textAnchor="end"
            className="fill-stone-400 dark:fill-neutral-500"
            fontSize="10"
          >
            {sampled[sampled.length - 1]!.date}
          </text>
        </>
      )}
    </svg>
  )
}

export function ChartLegend() {
  return (
    <ul className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-stone-500 dark:text-neutral-400">
      {(
        [
          ['youtube', 'YouTube'],
          ['bilibili', 'Bilibili'],
          ['xiaoyuzhou', 'Xiaoyuzhou'],
        ] as const
      ).map(([platform, label]) => (
        <li key={platform} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: PLATFORM_COLORS[platform] }}
          />
          {label}
        </li>
      ))}
    </ul>
  )
}

export function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={clsxm(
        'relative px-3 py-1.5 text-sm font-medium transition',
        selected
          ? 'text-stone-900 dark:text-neutral-100'
          : 'text-stone-400 hover:text-stone-700 dark:text-neutral-500 dark:hover:text-neutral-300',
      )}
    >
      {children}
      <span
        className={clsxm(
          'absolute inset-x-2 -bottom-px h-0.5 rounded-full',
          selected
            ? 'bg-gradient-to-r from-[#4989E8] via-[#6159DA] to-[#FF54AD]'
            : 'bg-transparent',
        )}
      />
    </button>
  )
}
