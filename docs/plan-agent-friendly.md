# Plan: agent-friendly, no behavior change

## Goal

Make the repo readable by a coding agent. Keep every function and all UI/UX exactly as they are.

## How the site works

RSS is not fetched in the browser. At `vite` `buildStart` / dev, `vite-plugin-podcast.ts` calls `loadPodcastFeed()` (`src/lib/load-rss.ts`). That fetches `PODCAST_RSS_URL` (Xiaoyuzhou, default in `src/lib/podcast-config.ts`), or falls back to `src/lib/fixtures/feed.xml`. `parsePodcastFeed` in `src/lib/rss.ts` is the only XML → `Episode` boundary. The plugin injects the result as virtual module `virtual:podcast-feed`. `src/Root.tsx` reads that module. `scripts/prerender.js` writes `dist/` HTML. OG is `functions/api/og.tsx` (`GET /api/og?cover=`).

`Episode` today: `{ id, title, description, link, published, content, duration, coverArt?, enclosure }`. The list (`src/components/Episodes.tsx`) and episode page (`src/components/EpisodePage.tsx`) both dump `htmlToText(episode.description)`. There is no series field. Do not add one in this cut.

## This cut (docs only)

Touch only:

- `AGENTS.md` — four project rules
- `docs/plan-agent-friendly.md` — this file

Do not edit `src/`, `functions/`, `vite-plugin-podcast.ts`, `scripts/prerender.js`, or `package.json`.

## Files an agent may not touch until a later contract

- `src/lib/rss.ts` / `src/types.ts` — ingest shape
- `src/components/Episodes.tsx` / `EpisodePage.tsx` / `PodcastLayout.tsx` — UI
- `src/lib/series.ts` — does not exist; series/chips/`displayTitle`/excerpt are parked

## Prove the UI did not move

1. `git diff main --stat` is only `AGENTS.md` and `docs/plan-agent-friendly.md`.
2. `npm test` and `npm run check` pass (existing vitest in `src/lib/*.test.ts`).
3. `npm run build` still prerenders `dist/`. Homepage and episode HTML still contain full `htmlToText(description)` cards — no chips, no truncated excerpt.

If a later PR changes `src/`, that PR is a different cut and needs its own contract.

## Out of scope (parked, not cancelled)

Architect’s `SeriesId` / `displayTitle` / `excerpt` Episode contract. Designer chips. Writer chip copy. Do not implement them here.

## Done when

This PR is on `main`. The two files above are the only diff. Tests pass.
