import type { Episode } from '../types'

/**
 * RSS GUIDs that are URLs are illegal as path segments. Non-http ids stay as-is.
 * http(s) ids become the last pathname segment, or the query string if the
 * pathname is empty. findEpisode matches that id or a `link` suffix.
 */
export function encodeEpisodeId(raw: string): string {
  if (!raw.startsWith('http')) {
    return raw
  }

  const url = new URL(raw)
  const path = url.pathname.split('/')
  const lastPathname = path[path.length - 1]

  if (lastPathname === '' && url.search) {
    return url.search.slice(1)
  }

  return lastPathname
}

export function findEpisode(
  episodes: Episode[],
  id: string,
): Episode | undefined {
  const decodedId = decodeURIComponent(id)
  return episodes.find(
    (episode) => episode.id === decodedId || episode.link.endsWith(decodedId),
  )
}
