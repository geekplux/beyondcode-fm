import { describe, expect, it } from 'vitest'

import {
  type AudioData,
  type AudioLike,
  type PlayerState,
  audioReducer,
  initialPlayerState,
  isPlaying,
  onDurationChange,
  onPause,
  onPlay,
  onTimeUpdate,
  play,
  seek,
  seekBy,
  setPlaybackRate,
  toggle,
  toggleMute,
} from './player'

function createFakeAudio(overrides: Partial<AudioLike> = {}): AudioLike {
  const audio = {
    src: '',
    currentSrc: '',
    currentTime: 0,
    duration: 100,
    playbackRate: 1,
    muted: false,
    paused: true,
    play() {
      audio.paused = false
    },
    pause() {
      audio.paused = true
    },
    load() {},
    ...overrides,
  } as AudioLike

  return new Proxy(audio, {
    set(target, property, value) {
      Reflect.set(target, property, value)
      if (property === 'src') {
        target.currentSrc = String(value)
      }
      return true
    },
  })
}

const trackA: AudioData = {
  title: 'Fixture Episode A',
  link: '/ep-a',
  audio: { src: 'https://example.com/a.mp3', type: 'audio/mpeg' },
}

const trackB: AudioData = {
  title: 'Fixture Episode B',
  link: '/ep-b',
  audio: { src: 'https://example.com/b.mp3', type: 'audio/mpeg' },
}

describe('audio player state', () => {
  it('plays, pauses, and toggles the current track', () => {
    let state: PlayerState = initialPlayerState
    const dispatch = (action: Parameters<typeof audioReducer>[1]) => {
      state = audioReducer(state, action)
    }
    const audio = createFakeAudio()

    play(audio, trackA, dispatch)
    expect(state.meta).toEqual(trackA)
    expect(audio.src).toBe(trackA.audio.src)
    expect(audio.currentTime).toBe(0)
    expect(audio.paused).toBe(false)

    onPlay(dispatch)
    expect(state.playing).toBe(true)
    expect(isPlaying(state.playing, audio, trackA)).toBe(true)

    toggle(audio, trackA, state.playing, dispatch)
    expect(audio.paused).toBe(true)
    onPause(dispatch)
    expect(state.playing).toBe(false)
    expect(isPlaying(state.playing, audio, trackA)).toBe(false)

    toggle(audio, trackA, state.playing, dispatch)
    expect(audio.paused).toBe(false)
    onPlay(dispatch)
    expect(state.playing).toBe(true)
  })

  it('seeks, seeks by ±10, mutes, and cycles playback rate', () => {
    let state: PlayerState = initialPlayerState
    const dispatch = (action: Parameters<typeof audioReducer>[1]) => {
      state = audioReducer(state, action)
    }
    const audio = createFakeAudio({ currentTime: 40, playbackRate: 1 })

    play(audio, trackA, dispatch)
    onPlay(dispatch)
    onDurationChange(audio.duration, dispatch)
    onTimeUpdate(40, dispatch)

    expect(state.duration).toBe(100)
    expect(state.currentTime).toBe(40)

    seek(audio, 12)
    expect(audio.currentTime).toBe(12)

    seekBy(audio, 10)
    expect(audio.currentTime).toBe(22)

    seekBy(audio, -10)
    expect(audio.currentTime).toBe(12)

    expect(state.muted).toBe(false)
    toggleMute(dispatch)
    expect(state.muted).toBe(true)
    toggleMute(dispatch)
    expect(state.muted).toBe(false)

    setPlaybackRate(audio, 1.5)
    expect(audio.playbackRate).toBe(1.5)
    setPlaybackRate(audio, 2)
    expect(audio.playbackRate).toBe(2)
    setPlaybackRate(audio, 1)
    expect(audio.playbackRate).toBe(1)
  })

  it('does not treat a different track as playing', () => {
    let state: PlayerState = initialPlayerState
    const dispatch = (action: Parameters<typeof audioReducer>[1]) => {
      state = audioReducer(state, action)
    }
    const audio = createFakeAudio()

    play(audio, trackA, dispatch)
    onPlay(dispatch)

    expect(isPlaying(state.playing, audio, trackA)).toBe(true)
    expect(isPlaying(state.playing, audio, trackB)).toBe(false)
  })
})
