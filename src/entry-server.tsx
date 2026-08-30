import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { episodes, podcast } from 'virtual:podcast-feed'

import { Root } from './Root'
import { findEpisode } from './lib/episode-id'
import { htmlToText } from './lib/html'
import { normalizePathname, parsePath, prerenderPathList } from './lib/locale'
import { OG_HEIGHT, OG_WIDTH, ogImageUrl } from './lib/og'
import type { RenderResult } from './lib/ssr-template'

/** Shared by vite-plugin-podcast (dev SSR) and scripts/prerender.js. */

function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function render(url: string): RenderResult {
  const pathname = normalizePathname(url)
  const parsed = parsePath(pathname)
  let status = 200
  let title = podcast.title
  let description = htmlToText(podcast.description).split('\n').join(' ')
  let cover = podcast.coverArt

  if (parsed.notFound) {
    status = 404
    title = `404 | ${podcast.title}`
  } else if (parsed.isStats) {
    title = `Statistics | ${podcast.title}`
    description = 'Total subscribers, views, and comments across YouTube, Bilibili, and Xiaoyuzhou.'
  } else if (parsed.episodeId) {
    const episode = findEpisode(episodes, parsed.episodeId)
    if (!episode) {
      status = 404
      title = `404 | ${podcast.title}`
    } else {
      title = `${episode.title} | ${podcast.title}`
      description = htmlToText(episode.description).split('\n').join(' ')
      cover = episode.coverArt || podcast.coverArt
    }
  }

  const html = renderToString(
    <StaticRouter location={pathname}>
      <Root />
    </StaticRouter>,
  )

  const image = ogImageUrl(cover)
  const head = [
    `<link rel="icon" href="${escapeAttribute(podcast.coverArt)}" />`,
    `<link rel="apple-touch-icon" href="${escapeAttribute(podcast.coverArt)}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="en" />`,
    `<meta property="og:image" content="${escapeAttribute(image)}" />`,
    `<meta property="og:image:width" content="${OG_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_HEIGHT}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}" />`,
    `<meta name="twitter:image" content="${escapeAttribute(image)}" />`,
    `<meta name="keywords" content="${escapeAttribute(podcast.title)}" />`,
  ].join('')

  return {
    html,
    status,
    lang: 'en',
    title,
    description,
    head,
    path: pathname,
  }
}

export function getPrerenderPaths() {
  return prerenderPathList(episodes.map((episode) => episode.id))
}
