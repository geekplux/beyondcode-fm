# BeyondCodeFM — agent notes

Static podcast site. Vite + React 18 + React Router 6 + Tailwind. Hosted on Cloudflare Pages (`dist/` HTML + `functions/` for OG images). Vanilla React port of an old Next.js app — do not add Next.js back.

The code is the source of truth. If this file disagrees with the code, follow the code and update the docs.

1. After finishing a task, open a PR.
2. Do not treat docs as gospel. If a document conflicts with what the code actually does, the code wins.
3. After each task, consider updating the docs. Keep them aligned with code behavior. Archive documents that are obsolete.
4. Always choose an implementation from first principles.

Full map: [`docs/architecture.md`](docs/architecture.md). Nested notes: `src/lib/AGENTS.md`, `src/components/AGENTS.md`, `functions/AGENTS.md`, `scripts/AGENTS.md`.

## Commands

```bash
npm run dev          # Vite custom server, SSR per request
npm test             # vitest run (node env)
npm run check        # tsc --noEmit
npm run build        # vite build && node scripts/prerender.js
npm run preview      # static dist/ (no OG Function)
npm run pages:dev    # wrangler pages dev — needed for GET /api/og
```

## Directory map

| Path | Role |
|---|---|
| `src/Root.tsx` | Routes |
| `src/main.tsx` | Client hydrate vs mount |
| `src/entry-server.tsx` | SSR HTML + meta; prerender path list |
| `src/lib/` | Feed, ids, player, theme, OG, i18n (no React chrome) |
| `src/components/` | Layout, episode list/page, player UI, theme button |
| `src/messages/en.json` | UI copy |
| `src/lib/fixtures/feed.xml` | Build fallback when live RSS fails |
| `vite-plugin-podcast.ts` | Load RSS, virtual module, dev SSR, preview HTML |
| `scripts/prerender.js` | Writes `dist/{id}/index.html` + `404.html` |
| `functions/api/og.tsx` | Pages Function `GET /api/og?cover=` |
| `public/_routes.json` | Functions only on `/api/og` |
| `public/_redirects` | Legacy `/en` and `/zh-CN` 301s |
| `wrangler.jsonc` | Pages project `beyondcode-fm`, `nodejs_compat` |

## Data flow

```
PODCAST_RSS_URL
  → loadPodcastFeed (Node, not the browser)
  → parsePodcastFeed
  → virtual:podcast-feed  { podcast, episodes, rssUrl }
  → Root / entry-server
```

If the live feed cannot be fetched, use `src/lib/fixtures/feed.xml`. Tests skip the plugin feed load (`VITEST`).

## Routes

| URL | Behavior |
|---|---|
| `/` | Episode list |
| `/:episode` | Episode page, or 404 if id unknown |
| `/en`, `/en/:episode`, `/zh-CN`, `/zh-CN/:episode` | Redirect to unprefixed paths |
| `/api/og?cover=` | PNG (Pages Function only) |

## Env (Cloudflare build)

- `PODCAST_RSS_URL` — feed URL. Code default: `DEFAULT_RSS_URL` in `src/lib/podcast-config.ts`.
- `NEXT_PUBLIC_OG_URL` — absolute origin for `og:image`. Historical name; still the Cloudflare var. Without it, the tag is a relative `/api/og?cover=…` path and crawlers ignore it.

Do not rename these. Do not invent extra aliases.

## Do not break

- RSS is loaded at **dev/build time**, never via a browser CORS fetch.
- Three runtimes share the feed: Vite plugin (dev SSR), `scripts/prerender.js`, `functions/api/og.tsx`.
- `index.html` placeholders (`<!--app-title-->`, `<!--app-description-->`, `<!--app-head-->`, `<!--app-html-->`) are consumed by `applyHtmlTemplate`. Hydration uses `data-path` on `#root`.
- Episode ids are encoded (`encodeEpisodeId`); `findEpisode` matches id or `link` suffix.
- Theme cycle is light → dark → system. Storage key `theme`. The FOUC script in `index.html` must stay consistent with `ThemeProvider`.
- Waveform in `PodcastLayout` and OG bars in `ogBarHeights` are seeded, not `Math.random()`.
- `PodcastDirectoryLink` icons are brand marks, not Lucide stand-ins.
- `_routes.json` must keep Functions limited to `/api/og`.
- Locale prefixes are redirects, not a live language switcher. Copy is English via `src/messages/en.json`.

## Where to change what

- UI / copy: `src/components`, `src/messages/en.json`, `src/index.css`
- Routing: `src/Root.tsx`, `src/lib/locale.ts`
- Feed parse: `src/lib/rss.ts`, `src/lib/load-rss.ts`
- Player logic: `src/lib/player.ts` (React wrapper is `AudioProvider`)
- OG card: `src/lib/og-image.tsx`, `src/lib/og.ts`, `functions/api/og.tsx`
