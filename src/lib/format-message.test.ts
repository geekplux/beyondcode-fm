import { describe, expect, it } from 'vitest'

import { formatMessage } from './format-message'

describe('formatMessage', () => {
  it('interpolates simple tokens used by episode aria labels', () => {
    expect(
      formatMessage('Play episode {episode}', { episode: 'Plain Guid Episode' }),
    ).toBe('Play episode Plain Guid Episode')
  })

  it('resolves the next-intl-style plural used by rewind/forward', () => {
    expect(
      formatMessage(
        'Rewind {s, plural, =1 {1 second} other {# seconds}}',
        { s: 1 },
      ),
    ).toBe('Rewind 1 second')
    expect(
      formatMessage(
        'Rewind {s, plural, =1 {1 second} other {# seconds}}',
        { s: 10 },
      ),
    ).toBe('Rewind 10 seconds')
  })
})
