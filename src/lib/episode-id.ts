import type { Episode } from '../types'

/**
 * Encode episode id.
 * (Certain episode id contains special characters that are not allowed in URL)
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
