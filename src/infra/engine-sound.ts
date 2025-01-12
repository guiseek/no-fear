import {GearSettings} from '../interfaces'
import {Audio, AudioListener} from 'three'
import {GearSound} from './gear-sound'
import {Loader} from '../core'

export type SoundKey = 'idle' | 'low' | 'med' | 'high'
export type BufferMap = Record<SoundKey, AudioBuffer>

export class EngineSound {
  #gears: GearSound[]

  #activeGearIndex = 0

  #start: Audio

  constructor(
    listener: AudioListener,
    initBuffer: AudioBuffer,
    engineBuffer: AudioBuffer,
    gearSettings: GearSettings[]
  ) {
    this.#start = new Audio(listener)
    this.#start.setBuffer(initBuffer)
    this.#start.setLoop(false)
    this.#start.setVolume(0.6)
    this.#start.play()

    this.#gears = gearSettings.map(
      (gear) => new GearSound(listener, engineBuffer, gear)
    )

    this.#gears[0].setVolume(1)
  }

  start() {
    this.#gears[this.#activeGearIndex].play()
  }

  stop() {
    this.#gears[this.#activeGearIndex].play()
  }

  pause() {
    if (this.#gears[this.#activeGearIndex].isPlaying) {
      this.#gears[this.#activeGearIndex].pause()
    } else {
      this.#gears[this.#activeGearIndex].play()
    }
  }

  update(rpm: number) {
    const activeGear = this.#gears[this.#activeGearIndex]
    activeGear.update(rpm)

    // Transição de marcha se o RPM exceder os limites
    if (
      rpm > activeGear.settings.maxRPM &&
      this.#activeGearIndex < this.#gears.length - 1
    ) {
      this.shiftUp()
    } else if (rpm < activeGear.settings.minRPM && this.#activeGearIndex > 0) {
      this.shiftDown()
    }
  }

  private shiftUp() {
    this.#gears[this.#activeGearIndex].setVolume(0)
    this.#activeGearIndex++
    this.#gears[this.#activeGearIndex].setVolume(1)
  }

  private shiftDown() {
    this.#gears[this.#activeGearIndex].setVolume(0)
    this.#activeGearIndex--
    this.#gears[this.#activeGearIndex].setVolume(1)
  }
}

export const loadEngineSound = async (audioListener: AudioListener) => {
  const loader = Loader.getInstance()

  const start = await loader.audio.loadAsync('start.wav')
  const buffer = await loader.audio.loadAsync('engine.wav')

  const gearSettings: GearSettings[] = [
    {
      minRPM: 0,
      maxRPM: 400,
      basePlaybackRate: 0.8,
      maxPlaybackRate: 1,
      baseVolume: 0.6,
      maxVolume: 0.8,
    },
    {
      minRPM: 400,
      maxRPM: 900,
      basePlaybackRate: 1,
      maxPlaybackRate: 1.2,
      baseVolume: 0.6,
      maxVolume: 0.8,
    },
    {
      minRPM: 900,
      maxRPM: 2200,
      basePlaybackRate: 1,
      maxPlaybackRate: 1.6,
      baseVolume: 0.6,
      maxVolume: 1,
    },
    {
      minRPM: 2200,
      maxRPM: 4400,
      basePlaybackRate: 1,
      maxPlaybackRate: 1.8,
      baseVolume: 0.6,
      maxVolume: 1,
    },
    {
      minRPM: 4400,
      maxRPM: 7200,
      basePlaybackRate: 1.1,
      maxPlaybackRate: 2,
      baseVolume: 0.8,
      maxVolume: 1,
    },
    {
      minRPM: 7200,
      maxRPM: 10000,
      basePlaybackRate: 1.2,
      maxPlaybackRate: 2,
      baseVolume: 0.8,
      maxVolume: 1,
    },
    {
      minRPM: 10000,
      maxRPM: 13000,
      basePlaybackRate: 1.3,
      maxPlaybackRate: 2.2,
      baseVolume: 0.8,
      maxVolume: 1,
    },
  ]

  return new EngineSound(audioListener, start, buffer, gearSettings)
}
