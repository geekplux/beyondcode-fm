# `src/lib`

Pure data and helpers. No page chrome. Tests sit next to the module (`*.test.ts`).

| File | Purpose |
|---|---|
| `load-rss.ts` | Node-side fetch of `PODCAST_RSS_URL`; falls back to `fixtures/feed.xml` |
| `rss.ts` | Parse RSS XML (`fast-xml-parser`, itunes tags, CDATA) |
| `episode-id.ts` | URL GUIDs → path id; `findEpisode` matches id or `link` suffix |
| `locale.ts` | Unprefixed paths; reserved `/stats`; legacy `/en` `/zh-CN` redirects; prerender filenames |
| `stats.ts` | Dashboard totals/series transforms + `loadStatsHistory` |
| `player.ts` | Audio reducer + DOM helpers. React must not duplicate this. |
| `theme.ts` | `system` / `light` / `dark`; cycle light → dark → system |
| `podcast-config.ts` | Hosts, directory URLs, `PODCAST_RSS_URL` / `DEFAULT_RSS_URL` |
| `og.ts` | Cover URL allowlist, `NEXT_PUBLIC_OG_URL`, seeded OG bars |
| `og-image.tsx` | Satori OG card (every box `display: flex`) |
| `i18n.tsx` | English messages only; `formatMessage` for ICU-lite tokens |
| `format-message.ts` | `{name}` and `{n, plural, =1 {…} other {…}}` |
| `ssr-template.ts` | Fills `index.html` placeholders; sets `data-path` |
| `html.ts` | `html-to-text` for meta and list excerpts |
| `clsxm.ts` | `clsx` wrapper |
| `fixtures/feed.xml` | Committed feed used when live RSS fails |

Client code reads the feed from `virtual:podcast-feed`, not from these loaders. The stats dashboard fetches `fmstats` `/history` in the browser (`https://fmstats.fum.workers.dev` by default).
