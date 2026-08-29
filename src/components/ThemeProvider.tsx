import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  nextTheme,
  readStoredTheme,
  resolveTheme,
  type Theme,
} from '../lib/theme'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme, getSystemTheme())
  const root = document.documentElement
  const style = document.createElement('style')
  style.appendChild(
    document.createTextNode('*,*::before,*::after{transition:none!important}'),
  )
  document.head.appendChild(style)
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
  window.getComputedStyle(style).opacity
  document.head.removeChild(style)
  return resolved
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readStoredTheme(window.localStorage.getItem('theme'))
    setThemeState(stored)
    setResolvedTheme(applyTheme(stored))
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const resolved = applyTheme(theme)
    setResolvedTheme(resolved)
    window.localStorage.setItem('theme', theme)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (theme === 'system') {
        setResolvedTheme(applyTheme('system'))
      }
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme, ready])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState((current) => nextTheme(current))
  }, [])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, cycleTheme }),
    [theme, resolvedTheme, setTheme, cycleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
