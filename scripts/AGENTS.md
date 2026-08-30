# `scripts`

- `prerender.js` runs after `vite build`. It fails if `dist/index.html` is missing.
- Loads `render` / `getPrerenderPaths` from `src/entry-server.tsx` through a Vite SSR server.
- Writes `dist/{path}/index.html` for `/` and each episode id, plus `dist/404.html` from a missing episode id.
- Path → file mapping is `pathToHtmlFile` in `src/lib/locale.ts`.
