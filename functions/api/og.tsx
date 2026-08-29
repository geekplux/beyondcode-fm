import React from 'react'
import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api'

import { OgCard } from '../../src/lib/og-image'
import { OG_HEIGHT, OG_WIDTH, parseCoverUrl } from '../../src/lib/og'

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url)
  const cover = parseCoverUrl(url.searchParams.get('cover'))
  if (!cover) {
    return new Response('Missing or invalid cover URL', { status: 400 })
  }

  return new ImageResponse(<OgCard cover={cover} />, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
  })
}
