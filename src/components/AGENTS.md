# `src/components`

Rendered UI. Do not restyle or replace brand marks while working on unrelated tasks.

| File | Purpose |
|---|---|
| `PodcastLayout.tsx` | Shell: cover, about, listen row, hosts, seeded waveform, player dock, theme button |
| `Episodes.tsx` | Home list |
| `EpisodePage.tsx` | Show notes + large play button |
| `PodcastDirectoryLink.tsx` | Brand icons for `podcastConfig.directories` + RSS. Not Lucide stand-ins. |
| `ThemeProvider.tsx` / `ThemeSwitcher.tsx` | `localStorage.theme`; cycle light → dark → system |
| `audio/AudioProvider.tsx` | React adapter over `src/lib/player.ts` |
| `audio/*Button.tsx`, `Slider.tsx`, `AudioPlayer.tsx` | Player chrome |
| `Container.tsx`, `FormattedDate.tsx`, `NotFoundPage.tsx` | Shared bits |

Copy comes from `src/messages/en.json` via `useTranslations`. There is no language switcher.
