import {EngineSound} from './engine-sound'
import {GearSettings} from '../interfaces'
import {AudioListener} from 'three'
import {Loader} from '../core'

export const loadEngineSound = async (audioListener: AudioListener) => {
  const loader = Loader.getInstance()

  const start = await loader.audio.loadAsync('start.wav')
  const buffer = await loader.audio.loadAsync('engine.wav')

  const gearSettings: GearSettings[] = [
    {
      minRPM: 0,
      maxRPM: 500,
      basePlaybackRate: 0.4,
      maxPlaybackRate: 1,
      baseVolume: 0.4,
      maxVolume: 0.6,
    },
    {
      minRPM: 500,
      maxRPM: 1000,
      basePlaybackRate: 0.6,
      maxPlaybackRate: 1.2,
      baseVolume: 0.4,
      maxVolume: 0.8,
    },
    {
      minRPM: 1000,
      maxRPM: 2000,
      basePlaybackRate: 0.8,
      maxPlaybackRate: 1.6,
      baseVolume: 0.6,
      maxVolume: 1,
    },
    {
      minRPM: 2000,
      maxRPM: 4000,
      basePlaybackRate: 1,
      maxPlaybackRate: 1.8,
      baseVolume: 0.6,
      maxVolume: 1,
    },
    {
      minRPM: 4000,
      maxRPM: 6000,
      basePlaybackRate: 1.2,
      maxPlaybackRate: 2,
      baseVolume: 0.6,
      maxVolume: 1,
    },
    {
      minRPM: 6000,
      maxRPM: 8000,
      basePlaybackRate: 1.4,
      maxPlaybackRate: 2,
      baseVolume: 0.6,
      maxVolume: 1,
    },
    {
      minRPM: 8000,
      maxRPM: 12000,
      basePlaybackRate: 1.6,
      maxPlaybackRate: 2.2,
      baseVolume: 0.6,
      maxVolume: 1,
    },
  ]

  return new EngineSound(audioListener, start, buffer, gearSettings)
}
