import type React from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { episodes, podcast } from 'virtual:podcast-feed'

import { AudioProvider } from './components/audio/AudioProvider'
import { EpisodePage } from './components/EpisodePage'
import { Episodes } from './components/Episodes'
import { NotFoundPage } from './components/NotFoundPage'
import { PodcastLayout } from './components/PodcastLayout'
import { StatsPage } from './components/StatsPage'
import { ThemeProvider } from './components/ThemeProvider'
import { findEpisode } from './lib/episode-id'

function StripTrailingSlash({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
    return (
      <Navigate
        to={`${location.pathname.replace(/\/+$/, '')}${location.search}`}
        replace
      />
    )
  }
  return <>{children}</>
}

function HomeRoute() {
  return <Episodes episodes={episodes} />
}

function EpisodeRoute() {
  const { episode: episodeId } = useParams()
  const episode = findEpisode(episodes, episodeId ?? '')
  if (!episode) {
    return <NotFoundPage />
  }
  return <EpisodePage episode={episode} />
}

function LegacyEpisodeRedirect() {
  const { episode } = useParams()
  return <Navigate to={`/${episode ?? ''}`} replace />
}

function Layout() {
  return (
    <PodcastLayout podcast={podcast}>
      <Outlet />
    </PodcastLayout>
  )
}

/** Canonical unprefixed routes plus leftover /en and /zh-CN redirects. */
export function Root() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <StripTrailingSlash>
          <Routes>
            <Route path="/en" element={<Navigate to="/" replace />} />
            <Route path="/en/:episode" element={<LegacyEpisodeRedirect />} />
            <Route path="/zh-CN" element={<Navigate to="/" replace />} />
            <Route path="/zh-CN/:episode" element={<LegacyEpisodeRedirect />} />
            <Route element={<Layout />}>
              <Route index element={<HomeRoute />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path=":episode" element={<EpisodeRoute />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </StripTrailingSlash>
      </AudioProvider>
    </ThemeProvider>
  )
}
