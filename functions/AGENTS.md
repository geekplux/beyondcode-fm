# `functions`

Cloudflare Pages Functions, not Vite middleware.

- `api/og.tsx` — `GET /api/og?cover=`. Validates the cover with `parseCoverUrl`, renders `OgCard` via `ImageResponse`.
- Shares `src/lib/og.ts` and `src/lib/og-image.tsx`. Satori requires `display: flex` on every box.
- `public/_routes.json` must keep `include` as `["/api/og"]` so the rest of the site stays static.
- `nodejs_compat` in `wrangler.jsonc` is required by `@cloudflare/pages-plugin-vercel-og`.
- Local: `npm run pages:dev`. `npm run dev` / `preview` do not run this Function.
