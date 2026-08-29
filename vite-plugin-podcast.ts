import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin, ViteDevServer } from 'vite'

import { loadPodcastFeed } from './src/lib/load-rss'
import { resolveRssUrl } from './src/lib/podcast-config'
import { pathToHtmlFile, stripDefaultLocalePrefix } from './src/lib/locale'
import { applyHtmlTemplate } from './src/lib/ssr-template'

const VIRTUAL_ID = 'virtual:podcast-feed'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`

type FeedModule = {
  podcast: {
    title: string
    description: string
    link: string
    coverArt: string
  }
  episodes: unknown[]
  rssUrl: string
}

function isViteInternal(url: string) {
  const pathname = url.split('?')[0] ?? url
  if (
    pathname.startsWith('/@') ||
    pathname.startsWith('/node_modules') ||
    pathname.startsWith('/src/') ||
    pathname.startsWith('/__') ||
    pathname.startsWith('/.vite')
  ) {
    return true
  }
  const base = path.posix.basename(pathname)
  return base.includes('.') && !pathname.endsWith('.html')
}

export function podcastPlugin(): Plugin {
  let feed: FeedModule = {
    podcast: { title: '', description: '', link: '', coverArt: '' },
    episodes: [],
    rssUrl: resolveRssUrl(),
  }

  async function loadFeed() {
    const loaded = await loadPodcastFeed()
    feed = {
      podcast: loaded.podcast,
      episodes: loaded.episodes,
      rssUrl: loaded.rssUrl,
    }
    if (loaded.usedFallback) {
      console.warn(
        `[podcast] live feed unavailable; prerender/dev using fixture (${loaded.source})`,
      )
    } else {
      console.log(
        `[podcast] loaded ${loaded.episodes.length} episodes from ${loaded.source}`,
      )
    }
  }

  async function renderHtml(
    server: ViteDevServer,
    url: string,
    templateSource: string,
  ) {
    const template = await server.transformIndexHtml(url, templateSource)
    const mod = await server.ssrLoadModule('/src/entry-server.tsx')
    const result = mod.render(url)
    return {
      html: applyHtmlTemplate(template, result),
      status: result.status as number,
    }
  }

  return {
    name: 'podcast-feed',
    async buildStart() {
      if (process.env.VITEST) return
      await loadFeed()
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return `export const podcast = ${JSON.stringify(feed.podcast)};
export const episodes = ${JSON.stringify(feed.episodes)};
export const rssUrl = ${JSON.stringify(feed.rssUrl)};`
      }
    },
    configureServer(server) {
      if (process.env.VITEST) return
      const indexPath = path.resolve(server.config.root, 'index.html')
      server.middlewares.use(
        async (req: IncomingMessage, res: ServerResponse, next) => {
          try {
            const url =
              (req as IncomingMessage & { originalUrl?: string }).originalUrl ??
              req.url ??
              '/'
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              next()
              return
            }
            if (isViteInternal(url)) {
              next()
              return
            }
            const urlPath = decodeURIComponent(url.split('?')[0] ?? '/')
            const redirectTo = stripDefaultLocalePrefix(urlPath)
            if (redirectTo) {
              res.statusCode = 301
              res.setHeader('Location', redirectTo)
              res.end()
              return
            }
            const templateSource = fs.readFileSync(indexPath, 'utf8')
            const rendered = await renderHtml(server, url, templateSource)
            res.statusCode = rendered.status
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(rendered.html)
          } catch (error) {
            if (error instanceof Error) {
              server.ssrFixStacktrace(error)
            }
            next(error)
          }
        },
      )
    },
    configurePreviewServer(server) {
      const dist = path.resolve(server.config.root, 'dist')
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }
        const urlPath = decodeURIComponent(
          ((req as IncomingMessage & { originalUrl?: string }).originalUrl ??
            req.url ??
            '/'
          ).split('?')[0] ?? '/',
        )
        const redirectTo = stripDefaultLocalePrefix(urlPath)
        if (redirectTo) {
          res.statusCode = 301
          res.setHeader('Location', redirectTo)
          res.end()
          return
        }
        const ext = path.extname(urlPath)
        if (ext && ext !== '.html') {
          next()
          return
        }

        const candidates: string[] = []
        if (urlPath === '/' || urlPath === '') {
          candidates.push(path.join(dist, 'index.html'))
        } else {
          const rel = urlPath.replace(/^\/+/, '').replace(/\/+$/, '')
          candidates.push(path.join(dist, pathToHtmlFile('/' + rel)))
          candidates.push(path.join(dist, rel, 'index.html'))
          candidates.push(path.join(dist, `${rel}.html`))
          if (rel.endsWith('.html')) {
            candidates.push(path.join(dist, rel))
          }
        }

        for (const file of candidates) {
          if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(fs.readFileSync(file))
            return
          }
        }

        const notFound = path.join(dist, '404.html')
        if (fs.existsSync(notFound)) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(fs.readFileSync(notFound))
          return
        }
        next()
      })
    },
  }
}
