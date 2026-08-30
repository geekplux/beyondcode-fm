## BeyondCodeFM (React)

Vanilla React port of the old `headless` Next.js site (Vite + React Router + Tailwind). The site builds to a static Cloudflare Pages `dist/` folder (prerendered routes plus `404.html`). Open Graph images are generated at request time by a Pages Function using [`@cloudflare/pages-plugin-vercel-og`](https://developers.cloudflare.com/pages/functions/plugins/vercel-og/) (`GET /api/og?cover=`).

Coding agents: start at [`AGENTS.md`](AGENTS.md), then [`docs/architecture.md`](docs/architecture.md).

Host: Cloudflare Pages (`beyondcode-fm`).

## Environment

```dotenv
PODCAST_RSS_URL="https://feed.xyzfm.space/nfm8cu8deycn"
NEXT_PUBLIC_OG_URL="https://beyondcodefm.com"
```

The RSS feed is loaded at dev/build time (not by a browser CORS fetch), then pages are server-rendered in `dev` and prerendered on `build`. If the live feed cannot be fetched, the committed fixture at `src/lib/fixtures/feed.xml` is used so the build still produces HTML.

`NEXT_PUBLIC_OG_URL` is the absolute origin baked into `og:image`. Without it, the tag is a relative `/api/og?cover=…` path, which most crawlers will ignore.

## Running locally

```bash
npm install
npm run dev
```

Routes are unprefixed (`/`, `/{episodeId}`). Legacy `/zh-CN` and `/en` URLs redirect to those paths. Theme is light → dark → system (button in the top-right).

`npm run dev` / `npm run preview` serve the static site only. To exercise the OG Function locally:

```bash
npm run pages:dev
```

Then open `/api/og?cover=` with a real cover URL (the podcast cover from the feed).

## Test / build / preview

```bash
npm test
npm run build
npm run preview
```

## Deploy to Cloudflare Pages

Repo config lives in `wrangler.jsonc` (project name `beyondcode-fm`, output `dist`, `nodejs_compat`). Static HTML is unlimited; `_routes.json` only invokes Functions on `/api/og`.

### Option A — Git integration (recommended)

This is dashboard work you do once. Cloudflare will build on every push.

1. Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub and select **`geekplux/beyondcode-fm`**.
3. Setup:
   - **Project name:** `beyondcode-fm`
   - **Production branch:** `main`
   - **Preview:** all non-production branches (or restrict as you prefer)
   - **Framework preset:** None (or Vite)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** leave empty (the GitHub repo root *is* the site)
4. Environment variables (Production **and** Preview):
   - `PODCAST_RSS_URL` = `https://feed.xyzfm.space/nfm8cu8deycn`
   - `NEXT_PUBLIC_OG_URL` = `https://beyondcodefm.com`
5. **Save and Deploy.** You get `https://beyondcode-fm.pages.dev`.

### Option B — CLI from this repo

```bash
npx wrangler login          # once, in the browser
npm run pages:deploy        # uploads dist + functions/
```

### Custom domain

1. Pages project → **Custom domains** → add `beyondcodefm.com` (and `www` if you use it).
2. In DNS (Cloudflare DNS if the zone is on Cloudflare):
   - Apex: `CNAME beyondcodefm.com` → `beyondcode-fm.pages.dev` (proxied), **or** use the dashboard “add domain” flow which writes the record.
