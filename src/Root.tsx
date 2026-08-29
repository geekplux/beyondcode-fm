import type React from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { episodes, podcast } from 'virtual:podcast-feed'

import { AudioProvider } from './components/audio/AudioProvider'
import { EpisodePage } from './components/EpisodePage'
import { Episodes } from './components/Episodes'
import { NotFoundPage } from './components/NotFoundPage'
import { PodcastLayout } from './components/PodcastLayout'
import { ThemeProvider } from './components/ThemeProvider'
import { findEpisode } from './lib/episode-id'
import { I18nProvider } from './lib/i18n'
import type { Locale } from './lib/locale'

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

function LocaleShell({ locale }: { locale: Locale }) {
  return (
    <I18nProvider locale={locale}>
      <PodcastLayout podcast={podcast}>
        <Outlet />
      </PodcastLayout>
    </I18nProvider>
  )
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

function EnEpisodeRedirect() {
  const { episode } = useParams()
  return <Navigate to={`/${episode ?? ''}`} replace />
}

export function Root() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <StripTrailingSlash>
          <Routes>
            <Route path="/en" element={<Navigate to="/" replace />} />
            <Route path="/en/:episode" element={<EnEpisodeRedirect />} />
            <Route path="/zh-CN" element={<LocaleShell locale="zh-CN" />}>
              <Route index element={<HomeRoute />} />
              <Route path=":episode" element={<EpisodeRoute />} />
            </Route>
            <Route path="/" element={<LocaleShell locale="en" />}>
              <Route index element={<HomeRoute />} />
              <Route path=":episode" element={<EpisodeRoute />} />
            </Route>
            <Route
              path="*"
              element={
                <I18nProvider locale="en">
                  <PodcastLayout podcast={podcast}>
                    <NotFoundPage />
                  </PodcastLayout>
                </I18nProvider>
              }
            />
          </Routes>
        </StripTrailingSlash>
      </AudioProvider>
    </ThemeProvider>
  )
}
