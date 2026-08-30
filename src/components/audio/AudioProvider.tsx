import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'

import {
  type AudioData,
  type AudioLike,
  initialPlayerState,
  isPlaying as isPlayingTrack,
  audioReducer,
  onDurationChange,
  onPause,
  onPlay,
  onTimeUpdate,
  pause as pauseAudio,
  play as playAudio,
  seek as seekAudio,
  seekBy as seekByAudio,
  setPlaybackRate as setAudioPlaybackRate,
  toggle as toggleAudio,
  toggleMute as toggleMuteAudio,
} from '../../lib/player'

/** Thin React adapter over src/lib/player.ts. */

type Player = {
  playing: boolean
  muted: boolean
  duration: number
  currentTime: number
  meta: AudioData | null
} & Partial<{
  play: (data: AudioData | undefined) => void
  pause: () => void
  toggle: (data: AudioData | undefined) => void
  seekBy: (amount: number) => void
  seek: (time: number) => void
  playbackRate: (rate: number) => void
  toggleMute: () => void
  isPlaying: (data: AudioData | undefined) => boolean
}>

const AudioPlayerContext = createContext<Player | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialPlayerState)
  const playerRef = useRef<HTMLAudioElement>(null)

  const actions = useMemo(() => {
    const audio = () => playerRef.current as AudioLike | null
    return {
      play(data: AudioData | undefined) {
        playAudio(audio(), data, dispatch)
      },
      pause() {
        pauseAudio(audio())
      },
      toggle(data: AudioData | undefined) {
        toggleAudio(audio(), data, state.playing, dispatch)
      },
      seekBy(amount: number) {
        seekByAudio(audio(), amount)
      },
      seek(time: number) {
        seekAudio(audio(), time)
      },
      playbackRate(rate: number) {
        setAudioPlaybackRate(audio(), rate)
      },
      toggleMute() {
        toggleMuteAudio(dispatch)
      },
      isPlaying(data: AudioData | undefined) {
        return isPlayingTrack(state.playing, audio(), data)
      },
    }
  }, [state.playing])

  const api = useMemo(() => ({ ...state, ...actions }), [state, actions])

  return (
    <>
      <AudioPlayerContext.Provider value={api}>
        {children}
      </AudioPlayerContext.Provider>
      <audio
        ref={playerRef}
        onPlay={() => onPlay(dispatch)}
        onPause={() => onPause(dispatch)}
        onTimeUpdate={(event) => {
          onTimeUpdate(event.currentTarget.currentTime, dispatch)
        }}
        onDurationChange={(event) => {
          onDurationChange(event.currentTarget.duration, dispatch)
        }}
        muted={state.muted}
      />
    </>
  )
}

export function useAudioPlayer(data: AudioData | undefined) {
  const player = useContext(AudioPlayerContext)

  return useMemo(
    () => ({
      ...player,
      play() {
        player?.play?.(data)
      },
      toggle() {
        player?.toggle?.(data)
      },
      get playing() {
        return player?.isPlaying?.(data) ?? false
      },
    }),
    [player, data],
  )
}
