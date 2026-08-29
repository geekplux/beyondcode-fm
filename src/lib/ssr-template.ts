export type RenderResult = {
  html: string
  status: number
  lang: string
  title: string
  description: string
  head: string
  path: string
}

function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function applyHtmlTemplate(template: string, result: RenderResult) {
  return template
    .replace(/lang="en"/, `lang="${result.lang}"`)
    .replace('<!--app-title-->', escapeAttribute(result.title))
    .replace(
      'content="<!--app-description-->"',
      `content="${escapeAttribute(result.description)}"`,
    )
    .replace('<!--app-head-->', result.head)
    .replace('<div id="root">', `<div id="root" data-path="${escapeAttribute(result.path)}">`)
    .replace('<!--app-html-->', result.html)
}
