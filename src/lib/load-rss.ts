import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { PodcastFeed } from '../types'
import { resolveRssUrl } from './podcast-config'
import { parsePodcastFeed } from './rss'

/** Node-side RSS load. Never call this from a browser component. */

export const FIXTURE_FEED_PATH = fileURLToPath(
  new URL('./fixtures/feed.xml', import.meta.url),
)

export type LoadedFeed = PodcastFeed & {
  rssUrl: string
  usedFallback: boolean
  source: string
}

export function readLocalRss(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

type FetchLike = (
  input: string,
) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>

export async function readRssXml(
  rssUrl: string,
  fetchImpl: FetchLike = fetch,
): Promise<string> {
  if (rssUrl.startsWith('file:')) {
    return readLocalRss(fileURLToPath(rssUrl))
  }

  if (!/^[a-z][a-z0-9+.-]*:/i.test(rssUrl)) {
    return readLocalRss(path.resolve(rssUrl))
  }

  const response = await fetchImpl(rssUrl)
  if (!response.ok) {
    throw new Error(`Failed to load RSS feed ${rssUrl}: ${response.status}`)
  }
  return response.text()
}

export async function loadPodcastFeed(options?: {
  rssUrl?: string
  fetchImpl?: FetchLike
  fallbackPath?: string
}): Promise<LoadedFeed> {
  const rssUrl = options?.rssUrl ?? resolveRssUrl()
  const fallbackPath = options?.fallbackPath ?? FIXTURE_FEED_PATH
  const fetchImpl = options?.fetchImpl ?? fetch

  try {
    const xml = await readRssXml(rssUrl, fetchImpl)
    return {
      ...parsePodcastFeed(xml),
      rssUrl,
      usedFallback: false,
      source: rssUrl,
    }
  } catch (error) {
    const xml = readLocalRss(fallbackPath)
    console.warn(
      `[podcast] Failed to load RSS from ${rssUrl}; using committed fixture ${fallbackPath}`,
      error,
    )
    return {
      ...parsePodcastFeed(xml),
      rssUrl,
      usedFallback: true,
      source: fallbackPath,
    }
  }
}
