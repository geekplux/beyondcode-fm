import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { episodes, podcast } from 'virtual:podcast-feed'

import { Root } from './Root'
import { findEpisode } from './lib/episode-id'
import { htmlToText } from './lib/html'
import { normalizePathname, parsePath } from './lib/locale'
import type { RenderResult } from './lib/ssr-template'

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

  if (parsed.notFound) {
    status = 404
    title = `404 | ${podcast.title}`
  } else if (parsed.episodeId) {
    const episode = findEpisode(episodes, parsed.episodeId)
    if (!episode) {
      status = 404
      title = `404 | ${podcast.title}`
    } else {
      title = `${episode.title} | ${podcast.title}`
      description = htmlToText(episode.description).split('\n').join(' ')
    }
  }

  const html = renderToString(
    <StaticRouter location={pathname}>
      <Root />
    </StaticRouter>,
  )

  const head = [
    `<link rel="icon" href="${escapeAttribute(podcast.coverArt)}" />`,
    `<link rel="apple-touch-icon" href="${escapeAttribute(podcast.coverArt)}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    `<meta name="keywords" content="${escapeAttribute(podcast.title)}" />`,
  ].join('')

  return {
    html,
    status,
    lang: parsed.locale,
    title,
    description,
    head,
    path: pathname,
  }
}

export function getPrerenderPaths() {
  const paths = ['/', '/zh-CN']
  for (const episode of episodes) {
    paths.push(`/${episode.id}`)
    paths.push(`/zh-CN/${episode.id}`)
  }
  return paths
}
