export function homePath(): string {
  return '/'
}

export function episodePath(id: string): string {
  return `/${id}`
}

export function normalizePathname(pathname: string): string {
  const noQuery = pathname.split('?')[0] ?? pathname
  if (noQuery.length > 1 && noQuery.endsWith('/')) {
    return noQuery.replace(/\/+$/, '') || '/'
  }
  return noQuery || '/'
}

const LEGACY_PREFIXES = ['/zh-CN', '/en'] as const

/** Old locale prefixes redirect to unprefixed routes. */
export function stripLocalePrefix(pathname: string): string | null {
  const clean = normalizePathname(pathname)
  for (const prefix of LEGACY_PREFIXES) {
    if (clean === prefix) return '/'
    if (clean.startsWith(`${prefix}/`)) return clean.slice(prefix.length) || '/'
  }
  return null
}

export function pathToHtmlFile(pathname: string): string {
  const clean = normalizePathname(pathname)
  if (clean === '/') return 'index.html'
  return `${clean.replace(/^\//, '')}/index.html`
}

export type ParsedPath = {
  episodeId: string | null
  notFound: boolean
}

export function parsePath(pathname: string): ParsedPath {
  const canonical = stripLocalePrefix(pathname) ?? normalizePathname(pathname)
  const parts = canonical.split('/').filter(Boolean)

  if (parts.length === 0) {
    return { episodeId: null, notFound: false }
  }
  if (parts.length === 1) {
    return { episodeId: parts[0], notFound: false }
  }
  return { episodeId: null, notFound: true }
}
