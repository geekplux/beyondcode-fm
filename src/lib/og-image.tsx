import type { ReactElement } from 'react'

import { ogBarHeights } from './og'

/**
 * Satori layout for the OG card. Every box must be `display: flex`.
 * Matches the old Next.js /api/og look: gradient, waveform, cover art.
 */
export function OgCard({ cover }: { cover: string }): ReactElement {
  const bars = ogBarHeights()

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundImage: 'linear-gradient(to bottom, #dbf4ff, #fff1f1)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 66,
          opacity: 0.25,
          alignItems: 'flex-end',
        }}
      >
        {bars.map((height, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              width: 6,
              height,
              marginLeft: index === 0 ? 5 : 5.5,
              borderRadius: 3,
              backgroundImage: 'linear-gradient(to bottom, #ADB5FF, #FF9BE3)',
            }}
          />
        ))}
      </div>
      <img
        src={cover}
        alt=""
        width={450}
        height={450}
        style={{
          borderRadius: 36,
          boxShadow: '0 0 30px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  )
}
