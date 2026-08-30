# Architecture

Derived from the code. If this disagrees with the code, the code wins.

## What it is

BeyondCodeFM is a static podcast website. The UI is vanilla React (Vite, React Router 6, Tailwind). Pages are prerendered to `dist/` and hosted on Cloudflare Pages. The only dynamic endpoint is Open Graph image generation.

This replaced a Next.js App Router app. `package.json` must not gain `next`, `next-intl`, or `next-themes`.

## Three runtimes

All three consume the same parsed feed and the same React tree (`src/Root.tsx`).

### 1. `npm run dev` — Vite custom server

`vite.config.ts` sets `appType: 'custom'` for `serve`. `vite-plugin-podcast.ts`:

1. On `buildStart`, `loadPodcastFeed()` fetches `PODCAST_RSS_URL` (Node `fetch`). On failure it reads `src/lib/fixtures/feed.xml`.
2. Exposes `virtual:podcast-feed` exporting `{ podcast, episodes, rssUrl }` as JSON.
3. Installs middleware that SSR-renders every non-Vite GET: `ssrLoadModule('/src/entry-server.tsx')` → `applyHtmlTemplate` into `index.html`.
4. Legacy `/en` and `/zh-CN` prefixes 301 via `stripLocalePrefix`.

Vitest sets `VITEST`, which skips feed load and the middleware.

### 2. `npm run build` — static HTML

`vite build` emits the client bundle and an `index.html` shell into `dist/`. Then `scripts/prerender.js`:

1. Requires `dist/index.html` already present.
2. Starts a Vite SSR server, loads `render` / `getPrerenderPaths` from `src/entry-server.tsx`.
3. Writes one HTML file per path using `pathToHtmlFile` (`/` → `index.html`, `/id` → `id/index.html`).
4. Writes `dist/404.html` from a missing episode id.

`npm run preview` serves `dist/` only. The plugin’s preview middleware repeats the locale 301s and maps URLs onto those HTML files.

### 3. Cloudflare Pages Function — OG PNG

`functions/api/og.tsx` handles `GET /api/og?cover=`. It is **not** a Vite route. `public/_routes.json` invokes Functions only for `/api/og`; everything else is static.

`parseCoverUrl` accepts only `http:` / `https:` URLs with no credentials. The card layout is `src/lib/og-image.tsx` (Satori: every box `display: flex`). `nodejs_compat` in `wrangler.jsonc` is required by `@cloudflare/pages-plugin-vercel-og`.

`ogImageUrl` prefixes `/api/og?cover=` with `NEXT_PUBLIC_OG_URL` when set. Crawlers need that absolute origin.

## Virtual module

Typed in `src/vite-env.d.ts`:

```ts
declare module 'virtual:podcast-feed' {
  export const podcast: Podcast
  export const episodes: Episode[]
  export const rssUrl: string
}
```

This is the only client-side feed source. Components must not fetch RSS.

## SSR template and hydration

`index.html` contains placeholders:

- `<!--app-title-->`
- `content="<!--app-description-->"`
- `<!--app-head-->`
- `<!--app-html-->`

`src/lib/ssr-template.ts` substitutes them and adds `data-path` on `#root`. `src/main.tsx` hydrates only when `data-path` matches the current pathname; otherwise it `createRoot`s. Changing placeholders without updating `applyHtmlTemplate` (or vice versa) breaks every page.

The inline theme script in `index.html` reads `localStorage.theme` and toggles `html.dark` before paint. `ThemeProvider` must keep using the same key and the same `light` / `dark` / `system` values.

## Routing

Canonical paths are unprefixed (`/`, `/stats`, `/{episodeId}`). `/stats` is reserved and is never treated as an episode id.

`src/lib/locale.ts`:

- `homePath` / `statsPath` / `episodePath` build those URLs
- `prerenderPathList` is `/`, `/stats`, then each episode id
- `stripLocalePrefix` maps `/en` and `/zh-CN` (and nested episode paths) to the unprefixed form
- `parsePath` is used by SSR meta: `/stats` sets `isStats`, one other segment = episode id, extra segments = 404
- `pathToHtmlFile` is the prerender filename convention (`/stats` → `stats/index.html`)

`src/Root.tsx` mirrors this with `<Navigate>` routes for `/en` and `/zh-CN`, plus `StripTrailingSlash`. Cloudflare `_redirects` repeats the same 301s at the edge.

There is no language switcher. `src/lib/i18n.tsx` reads English strings from `src/messages/en.json` and interpolates with `formatMessage` (ICU-lite `{name}` and `{n, plural, =1 {…} other {…}}`).

## Episode identity

RSS GUIDs that are URLs are illegal as path segments. `encodeEpisodeId` keeps non-http ids as-is; for `http(s)` it uses the last pathname segment, or the query string if the pathname is empty.

`findEpisode` `decodeURIComponent`s the route param and matches `episode.id` or a `link` suffix.

## Player

Headless state lives in `src/lib/player.ts` (`audioReducer` + play/pause/seek helpers). `AudioProvider` is a thin React adapter around an `<audio>` element. UI buttons must call those helpers, not duplicate the reducer.

## Theme

`src/lib/theme.ts`: stored preference is `system` | `light` | `dark`. `nextTheme` cycles light → dark → system. `ThemeSwitcher` only calls `cycleTheme`. `applyTheme` writes `html.dark` and `colorScheme`, with a one-frame transition disable.

## Statistics dashboard

`/stats` is a first-class route. The sidebar Statistics control (`PodcastLayout`) switches the main pane to `StatsPage`. Totals and chart series are computed by pure helpers in `src/lib/stats.ts` (`currentTotals`, `stackedSeries`, `platformSeries`). The page fetches `GET {VITE_FMSTATS_URL}/history` in the browser (`https://fmstats.fum.workers.dev` when the env var is unset). Charts are inline SVG: Total tab is a stacked bar; Bilibili / YouTube / Xiaoyuzhou tabs are area charts. Missing days are zero, never NaN.

The stats API lives in the sibling `fmstats/` Worker (not in this Pages project). `_routes.json` stays Functions-only on `/api/og`.

## Directory icons

`podcastConfig.directories` + RSS are rendered by `PodcastDirectoryLink`. Icons are brand SVGs or `/…webp` assets. Do not replace them with Lucide icons.

`PodcastLayout`’s decorative waveform uses a seeded PRNG so SSR HTML is stable. `ogBarHeights` is likewise seeded.

## Env

Cloudflare build settings set only:

| Var | Used by |
|---|---|
| `PODCAST_RSS_URL` | `resolveRssUrl` |
| `NEXT_PUBLIC_OG_URL` | `resolveOgBaseUrl` |
| `VITE_FMSTATS_URL` | Optional. Stats dashboard `GET {origin}/history`. Defaults to `https://fmstats.fum.workers.dev`. |

`DEFAULT_RSS_URL` in `podcast-config.ts` is the local/dev fallback when `PODCAST_RSS_URL` is unset. Do not rename the Cloudflare vars.

## Deploy

`wrangler.jsonc`: project `beyondcode-fm`, output `./dist`, `nodejs_compat`. Build command `npm run build`. Git integration or `npm run pages:deploy`.
