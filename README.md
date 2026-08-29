## BeyondCodeFM (React)

Vanilla React port of the production `headless` site (Vite + React Router + Tailwind). Next.js (`next`, `next-intl`, `next-themes`, App Router) has been removed. The site builds to a static, Cloudflare Pages-compatible `dist/` folder (prerendered routes plus `404.html`).

Production DNS/Vercel is unchanged until you cut over. `npm run build` writes static files to `dist/`; Cloudflare Pages can host that output as-is.

## Environment

```dotenv
PODCAST_RSS_URL="https://feed.xyzfm.space/nfm8cu8deycn"
```

`NEXT_PUBLIC_PODCAST_RSS` and `VITE_PODCAST_RSS` are also accepted. The RSS feed is loaded at dev/build time (not by a browser CORS fetch), then pages are server-rendered in `dev` and prerendered on `build`. If the live feed cannot be fetched, the committed fixture at `src/lib/fixtures/feed.xml` is used so the build still produces HTML.

## Running locally

```bash
npm install
npm run dev
```

English is unprefixed (`/`, `/{episodeId}`). Simplified Chinese is prefixed (`/zh-CN`, `/zh-CN/{episodeId}`). `/en` redirects to the unprefixed paths.

## Test / build / preview

```bash
npm test
npm run build
npm run preview
```
