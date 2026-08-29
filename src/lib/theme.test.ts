import { describe, expect, it } from 'vitest'

import { nextTheme, readStoredTheme, resolveTheme } from './theme'

describe('resolveTheme', () => {
  it('follows the OS only when the preference is system', () => {
    expect(resolveTheme('system', 'dark')).toBe('dark')
    expect(resolveTheme('system', 'light')).toBe('light')
    expect(resolveTheme('dark', 'light')).toBe('dark')
    expect(resolveTheme('light', 'dark')).toBe('light')
  })
})

describe('nextTheme', () => {
  it('cycles light → dark → system → light', () => {
    expect(nextTheme('light')).toBe('dark')
    expect(nextTheme('dark')).toBe('system')
    expect(nextTheme('system')).toBe('light')
  })
})

describe('readStoredTheme', () => {
  it('keeps a valid stored preference and falls back to system', () => {
    expect(readStoredTheme('dark')).toBe('dark')
    expect(readStoredTheme('light')).toBe('light')
    expect(readStoredTheme('system')).toBe('system')
    expect(readStoredTheme(null)).toBe('system')
    expect(readStoredTheme('nope')).toBe('system')
  })
})
