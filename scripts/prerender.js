import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const templatePath = path.join(dist, 'index.html')

if (!fs.existsSync(templatePath)) {
  throw new Error('Missing dist/index.html. Run vite build first.')
}

const template = fs.readFileSync(templatePath, 'utf8')

const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { render, getPrerenderPaths } = await vite.ssrLoadModule(
    '/src/entry-server.tsx',
  )
  const { applyHtmlTemplate } = await vite.ssrLoadModule(
    '/src/lib/ssr-template.ts',
  )
  const { pathToHtmlFile } = await vite.ssrLoadModule('/src/lib/locale.ts')

  function urlToFile(url) {
    return path.join(dist, pathToHtmlFile(url))
  }

  const paths = getPrerenderPaths()
  for (const url of paths) {
    const result = render(url)
    const html = applyHtmlTemplate(template, result)
    const outPath = urlToFile(url)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, html)
  }

  const notFound = render('/missing-episode-id')
  fs.writeFileSync(
    path.join(dist, '404.html'),
    applyHtmlTemplate(template, notFound),
  )

  console.log(`Prerendered ${paths.length} routes + 404.html`)
} finally {
  await vite.close()
}
