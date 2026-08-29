export const LOCALES = ['en', 'zh-CN'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export function homePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}`
}

export function episodePath(locale: Locale, id: string): string {
  const base = homePath(locale)
  return base === '/' ? `/${id}` : `${base}/${id}`
}

export function normalizePathname(pathname: string): string {
  const noQuery = pathname.split('?')[0] ?? pathname
  if (noQuery.length > 1 && noQuery.endsWith('/')) {
    return noQuery.replace(/\/+$/, '') || '/'
  }
  return noQuery || '/'
}

/** next-intl default-locale-as-needed: `/en` and `/en/...` redirect to unprefixed paths. */
export function stripDefaultLocalePrefix(pathname: string): string | null {
  const clean = normalizePathname(pathname)
  if (clean === '/en') return '/'
  if (clean.startsWith('/en/')) return clean.slice(3) || '/'
  return null
}

export function pathToHtmlFile(pathname: string): string {
  const clean = normalizePathname(pathname)
  if (clean === '/') return 'index.html'
  return `${clean.replace(/^\//, '')}/index.html`
}

export type ParsedPath = {
  locale: Locale
  episodeId: string | null
  notFound: boolean
}

export function parsePath(pathname: string): ParsedPath {
  const clean = normalizePathname(pathname)
  const parts = clean.split('/').filter(Boolean)

  if (parts.length === 0) {
    return { locale: DEFAULT_LOCALE, episodeId: null, notFound: false }
  }

  if (parts[0] === 'zh-CN') {
    if (parts.length === 1) {
      return { locale: 'zh-CN', episodeId: null, notFound: false }
    }
    if (parts.length === 2) {
      return { locale: 'zh-CN', episodeId: parts[1], notFound: false }
    }
    return { locale: 'zh-CN', episodeId: null, notFound: true }
  }

  if (parts.length === 1) {
    return { locale: DEFAULT_LOCALE, episodeId: parts[0], notFound: false }
  }

  return { locale: DEFAULT_LOCALE, episodeId: null, notFound: true }
}
