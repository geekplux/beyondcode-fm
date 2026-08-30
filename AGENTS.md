After finishing a task, open a PR.

Do not treat docs as gospel. If a document conflicts with what the code actually does, the code wins.

After each task, consider updating the docs. Keep them aligned with code behavior. Archive documents that are obsolete.

Always choose an implementation from first principles, follow KISS software principle.

## How this site works

RSS is not fetched in the browser. At Vite `buildStart` / dev, `vite-plugin-podcast.ts` calls `loadPodcastFeed()` in `src/lib/load-rss.ts`. That fetches `PODCAST_RSS_URL` (Xiaoyuzhou, default in `src/lib/podcast-config.ts`) or falls back to `src/lib/fixtures/feed.xml`. `parsePodcastFeed` in `src/lib/rss.ts` is the only XML → Episode boundary. The plugin injects `virtual:podcast-feed`. `src/Root.tsx` reads it. `scripts/prerender.js` writes `dist/`. OG is `functions/api/og.tsx` (`GET /api/og?cover=`).

Episode is `{ id, title, description, link, published, content, duration, coverArt?, enclosure }`. The list (`src/components/Episodes.tsx`) and the episode page (`src/components/EpisodePage.tsx`) both dump `htmlToText(episode.description)`. There is no series field.

## Do not

Do not add series, chips, `displayTitle`, or excerpts until there is a contract for that cut.

Do not change UI or ingest unless that is the task. Prove it: `git diff` stays on the files you meant to touch, `npm test` and `npm run check` pass, `npm run build` still prerenders `dist/`.
