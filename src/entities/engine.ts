import {GearOptions} from '../interfaces'
import {AudioListener} from 'three'
import {Loader} from '../core'
import {Gear} from './gear'

export class Engine {
  #gears: Gear[]

  #gear = 0

  get gear() {
    return this.#gear
  }

  constructor(
    listener: AudioListener,
    buffer: AudioBuffer,
    options: GearOptions[]
  ) {
    this.#gears = options.map((opt, i) => {
      return new Gear(listener, buffer, i, opt)
    })

    this.#gears[this.#gear].unmute()
  }

  update(rpm: number) {
    const gear = this.#gears[this.#gear]

    gear.update(rpm)

    if (rpm > gear.options.rpm.max && this.#gear < this.#gears.length - 1) {
      this.#gears[this.#gear].mute()
      this.#gear++
      this.#gears[this.#gear].unmute()
    } else if (rpm < gear.options.rpm.min && this.#gear > 0) {
      this.#gears[this.#gear].mute()
      this.#gear--
      this.#gears[this.#gear].unmute()
    }
  }
}

export const loadEngine = async (listener: AudioListener) => {
  const loader = Loader.getInstance()

  const buffer = await loader.loadAudio('engine.wav', 'Engine audio')

  const options: GearOptions[] = [
    {
      rpm: {min: 0, max: 10},
      playbackRate: {min: 0.8, max: 0.8},
      volume: {min: 0.6, max: 1},
    },
    {
      rpm: {min: 10, max: 1200},
      playbackRate: {min: 0.8, max: 1.2},
      volume: {min: 0.6, max: 1},
    },
    {
      rpm: {min: 1000, max: 2200},
      playbackRate: {min: 1, max: 1.4},
      volume: {min: 0.6, max: 1},
    },
    {
      rpm: {min: 2200, max: 3400},
      playbackRate: {min: 1.2, max: 1.6},
      volume: {min: 0.6, max: 1},
    },
    {
      rpm: {min: 3400, max: 5400},
      playbackRate: {min: 1.2, max: 1.6},
      volume: {min: 0.8, max: 1},
    },
    {
      rpm: {min: 5400, max: 8200},
      playbackRate: {min: 1.2, max: 1.6},
      volume: {min: 0.8, max: 1},
    },
    {
      rpm: {min: 8200, max: 12000},
      playbackRate: {min: 1.2, max: 1.8},
      volume: {min: 0.8, max: 1},
    },
  ]

  return new Engine(listener, buffer, options)
}
