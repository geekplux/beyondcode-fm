import { describe, expect, it } from 'vitest'

import { applyHtmlTemplate } from './ssr-template'

const template = `<!doctype html>
<html lang="en">
  <head>
    <title><!--app-title--></title>
    <meta name="description" content="<!--app-description-->" />
    <!--app-head-->
  </head>
  <body>
    <div id="root"><!--app-html--></div>
  </body>
</html>`

describe('applyHtmlTemplate', () => {
  it('injects title, description, lang, path, head, and body into the shell', () => {
    const html = applyHtmlTemplate(template, {
      html: '<h1>Plain Guid Episode</h1>',
      status: 200,
      lang: 'zh-CN',
      title: 'Plain Guid Episode | Fixture Podcast',
      description: 'Show notes HTML for plain guid.',
      head: '<link rel="icon" href="https://example.com/cover.jpg" />',
      path: '/zh-CN/plain-guid-001',
    })

    expect(html).toContain('lang="zh-CN"')
    expect(html).toContain('<title>Plain Guid Episode | Fixture Podcast</title>')
    expect(html).toContain(
      'content="Show notes HTML for plain guid."',
    )
    expect(html).toContain('data-path="/zh-CN/plain-guid-001"')
    expect(html).toContain('<h1>Plain Guid Episode</h1>')
    expect(html).toContain('href="https://example.com/cover.jpg"')
  })
})
