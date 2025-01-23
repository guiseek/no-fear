import {EngineOptions, GearConfig, RangeValue} from '../interfaces'
import {Audio, AudioListener} from 'three'
import {Loader} from '../core'
import {delay} from '../utils'

export class Engine {
  #gear = 0

  get gear() {
    return this.#gear
  }

  constructor(private options: EngineOptions) {}

  update(rpm: number) {
    const gear = this.options.gears[this.#gear]

    this.#determineGear(rpm)

    const normalized = this.#normalize(rpm)

    const playbackRate = this.#normalizeRange(gear.rate, normalized)
    gear.audio.setPlaybackRate(playbackRate)
    gear.audio.setDetune(playbackRate * 100 * -1)

    const volume = this.#normalizeRange({min: 0.4, max: 1}, normalized)
    gear.audio.setVolume(volume)
  }

  #determineGear(rpm: number) {
    const gear = this.options.gears[this.#gear]

    if (rpm > gear.rpm.max && this.#gear < this.options.gears.length - 1) {
      this.options.gears[this.#gear].audio.setVolume(0)
      this.#gear++
      this.options.gears[this.#gear].audio.setVolume(0.2)
    } else if (rpm < gear.rpm.min && this.#gear > 0) {
      this.options.gears[this.#gear].audio.setVolume(0)
      this.#gear--
      this.options.gears[this.#gear].audio.setVolume(0.2)
    }
  }

  #normalizeRange(range: RangeValue, rpm: number) {
    return range.min + rpm * (range.max - range.min)
  }

  #normalize(rpm: number): number {
    const gear = this.options.gears[this.#gear]

    if (rpm < gear.rpm.min) return 0
    if (rpm > gear.rpm.max) return 1

    return (rpm - gear.rpm.min) / (gear.rpm.max - gear.rpm.min)
  }
}

export const loadEngine = async (listener: AudioListener) => {
  const loader = Loader.getInstance()

  const start = new Audio(listener)
  start.setBuffer(await loader.loadAudio('start.wav'))
  start.setVolume(0.2)
  start.setLoop(false)
  start.play()

  await delay(1600)

  const running = new Audio(listener)
  running.setBuffer(await loader.loadAudio('running.wav'))
  running.setVolume(0.2)
  running.setLoop(true)
  running.play()

  const gears: GearConfig[] = [
    // 0ª
    {
      audio: running,
      rpm: {min: 0, max: 10},
      rate: {min: 0.8, max: 0.9},
    },
    // 1ª
    {
      audio: running,
      rpm: {min: 10, max: 1000},
      rate: {min: 0.8, max: 1.2},
    },
    // 2ª
    {
      audio: running,
      rpm: {min: 1000, max: 2200},
      rate: {min: 1, max: 1.2},
    },
    // 3ª
    {
      audio: running,
      rpm: {min: 2200, max: 3600},
      rate: {min: 1, max: 1.4},
    },
    // 4ª
    {
      audio: running,
      rpm: {min: 3600, max: 5200},
      rate: {min: 1, max: 1.4},
    },
    // 5ª
    {
      audio: running,
      rpm: {min: 5200, max: 7500},
      rate: {min: 1, max: 1.4},
    },
    // 6ª
    {
      audio: running,
      rpm: {min: 7500, max: 12000},
      rate: {min: 1, max: 1.6},
    },
  ]

  return new Engine({start, gears})
}
