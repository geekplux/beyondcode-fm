export type Theme = 'system' | 'light' | 'dark'

export function resolveTheme(
  theme: Theme,
  system: 'light' | 'dark',
): 'light' | 'dark' {
  return theme === 'system' ? system : theme
}

/** light → dark → system → light so every click is a visible, predictable step. */
export function nextTheme(theme: Theme): Theme {
  if (theme === 'light') return 'dark'
  if (theme === 'dark') return 'system'
  return 'light'
}

export function readStoredTheme(raw: string | null): Theme {
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'
}
