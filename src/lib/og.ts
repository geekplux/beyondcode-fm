export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

export function parseCoverUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}

export function resolveOgBaseUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  return (env.NEXT_PUBLIC_OG_URL || '').replace(/\/+$/, '')
}

export function ogImagePath(cover: string): string {
  return `/api/og?cover=${encodeURIComponent(cover)}`
}

export function ogImageUrl(cover: string, baseUrl = resolveOgBaseUrl()): string {
  const path = ogImagePath(cover)
  return baseUrl ? `${baseUrl}${path}` : path
}

export function ogBarHeights(count = 80): number[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = Math.sin(index * 12.9898) * 43758.5453
    const unit = seed - Math.floor(seed)
    return Math.floor(18 + unit * 48)
  })
}
