import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = dirname(fileURLToPath(new URL('.', import.meta.url)))
const pkg = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
) as {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

describe('vanilla React stack', () => {
  it('does not ship Next.js runtime packages', () => {
    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    }
    expect(deps.next).toBeUndefined()
    expect(deps['next-intl']).toBeUndefined()
    expect(deps['next-themes']).toBeUndefined()
    expect(deps.react).toBeDefined()
    expect(deps['react-dom']).toBeDefined()
    expect(deps.vite).toBeDefined()
  })
})
