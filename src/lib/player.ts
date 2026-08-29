export type AudioTrack = {
  src: string
  type: string
}

export type AudioData = {
  audio: AudioTrack
  title: string
  link: string
}

export type PlayerState = {
  playing: boolean
  muted: boolean
  duration: number
  currentTime: number
  meta: AudioData | null
}

export const initialPlayerState: PlayerState = {
  playing: false,
  muted: false,
  duration: 0,
  currentTime: 0,
  meta: null,
}

export type PlayerAction =
  | { type: 'SET_META'; payload: AudioData }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }

export function audioReducer(
  state: PlayerState,
  action: PlayerAction,
): PlayerState {
  switch (action.type) {
    case 'SET_META':
      return { ...state, meta: action.payload }
    case 'PLAY':
      return { ...state, playing: true }
    case 'PAUSE':
      return { ...state, playing: false }
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted }
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload }
    case 'SET_DURATION':
      return { ...state, duration: action.payload }
    default:
      return state
  }
}

export type AudioLike = {
  src: string
  currentSrc: string
  currentTime: number
  duration: number
  playbackRate: number
  muted: boolean
  paused: boolean
  play: () => void | Promise<void>
  pause: () => void
  load: () => void
}

export function play(
  audio: AudioLike | null,
  data: AudioData | undefined,
  dispatch: (action: PlayerAction) => void,
) {
  if (data) {
    dispatch({ type: 'SET_META', payload: data })

    if (audio?.currentSrc !== data.audio.src && audio) {
      const playbackRate = audio.playbackRate
      audio.src = data.audio.src
      audio.load()
      audio.pause()
      audio.playbackRate = playbackRate
      audio.currentTime = 0
    }
  }

  void audio?.play()
}

export function pause(audio: AudioLike | null) {
  audio?.pause()
}

export function isPlaying(
  playing: boolean,
  audio: AudioLike | null,
  data: AudioData | undefined,
) {
  return data ? playing && audio?.currentSrc === data.audio.src : playing
}

export function toggle(
  audio: AudioLike | null,
  data: AudioData | undefined,
  playing: boolean,
  dispatch: (action: PlayerAction) => void,
) {
  if (isPlaying(playing, audio, data)) {
    pause(audio)
  } else {
    play(audio, data, dispatch)
  }
}

export function seekBy(audio: AudioLike | null, amount: number) {
  if (!audio) return
  audio.currentTime += amount
}

export function seek(audio: AudioLike | null, time: number) {
  if (!audio) return
  audio.currentTime = time
}

export function setPlaybackRate(audio: AudioLike | null, rate: number) {
  if (!audio) return
  audio.playbackRate = rate
}

export function toggleMute(dispatch: (action: PlayerAction) => void) {
  dispatch({ type: 'TOGGLE_MUTE' })
}

export function onPlay(dispatch: (action: PlayerAction) => void) {
  dispatch({ type: 'PLAY' })
}

export function onPause(dispatch: (action: PlayerAction) => void) {
  dispatch({ type: 'PAUSE' })
}

export function onTimeUpdate(
  currentTime: number,
  dispatch: (action: PlayerAction) => void,
) {
  dispatch({
    type: 'SET_CURRENT_TIME',
    payload: Math.floor(currentTime),
  })
}

export function onDurationChange(
  duration: number,
  dispatch: (action: PlayerAction) => void,
) {
  dispatch({
    type: 'SET_DURATION',
    payload: Math.floor(duration),
  })
}
