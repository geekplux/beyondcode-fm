import { XMLParser } from 'fast-xml-parser'

import type { Episode, Podcast, PodcastFeed } from '../types'
import { encodeEpisodeId } from './episode-id'

/** Parse a podcast RSS document into Podcast + Episode[]. */

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  trimValues: false,
})

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

function textOf(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (typeof node === 'object') {
    const record = node as Record<string, unknown>
    if (typeof record.__cdata === 'string') return record.__cdata
    if (typeof record['#text'] === 'string') return record['#text']
    if (record.__cdata != null) return textOf(record.__cdata)
    if (record['#text'] != null) return textOf(record['#text'])
  }
  return ''
}

function hrefOf(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'object') {
    const record = node as Record<string, unknown>
    if (typeof record['@_href'] === 'string') return record['@_href']
    if (typeof record.href === 'string') return record.href
    if (typeof record.url === 'string') return record.url
    if (record.url != null) return textOf(record.url)
  }
  return textOf(node)
}

function enclosureOf(item: Record<string, unknown>): Episode['enclosure'] {
  const raw = asArray(item.enclosure)[0] as Record<string, unknown> | undefined
  if (!raw) {
    return { url: '', type: '', length: '' }
  }
  return {
    url: String(raw['@_url'] ?? raw.url ?? ''),
    type: String(raw['@_type'] ?? raw.type ?? ''),
    length: String(raw['@_length'] ?? raw.length ?? ''),
  }
}

function publishedOf(item: Record<string, unknown>): number {
  const raw = textOf(item.pubDate) || textOf(item.published)
  const timestamp = Date.parse(raw)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function parsePodcastFeed(xml: string): PodcastFeed {
  const parsed = parser.parse(xml) as {
    rss?: { channel?: Record<string, unknown> }
    channel?: Record<string, unknown>
  }
  const channel = (parsed.rss?.channel ?? parsed.channel ?? {}) as Record<
    string,
    unknown
  >

  const coverArt =
    hrefOf(channel['itunes:image']) ||
    hrefOf(channel.image) ||
    textOf((channel.image as Record<string, unknown> | undefined)?.url)

  const podcast: Podcast = {
    title: textOf(channel.title),
    description: textOf(channel.description),
    link: textOf(channel.link),
    coverArt,
  }

  const episodes: Episode[] = asArray(
    channel.item as Record<string, unknown> | Record<string, unknown>[],
  ).map((item) => {
    const guid = textOf(item.guid)
    const link = textOf(item.link)
    const description = textOf(item.description)
    const content = textOf(item['content:encoded']) || description
    const itunesImage = item['itunes:image']

    return {
      id: encodeEpisodeId(guid || link),
      title: textOf(item.title),
      description,
      link,
      published: publishedOf(item),
      content,
      duration: textOf(item['itunes:duration']),
      coverArt: hrefOf(itunesImage) || undefined,
      enclosure: enclosureOf(item),
    }
  })

  return { podcast, episodes }
}
