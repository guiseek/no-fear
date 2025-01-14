import {GearOptions, RangeValue} from '../interfaces'
import {Audio, AudioListener} from 'three'

export class Gear {
  #audio: Audio

  constructor(
    listener: AudioListener,
    buffer: AudioBuffer,
    readonly index: number,
    readonly options: GearOptions
  ) {
    this.#audio = new Audio(listener)
    this.#audio.setBuffer(buffer)
    this.#audio.setLoop(true)
    this.#audio.setVolume(0)
    this.#audio.play()
  }

  mute() {
    this.#audio.setVolume(0)
  }

  unmute() {
    this.#audio.setVolume(1)
  }

  update(rpm: number) {
    const normalized = this.#normalize(rpm)

    const playbackRate = this.#normalizeRange(
      this.options.playbackRate,
      normalized
    )
    this.#audio.setPlaybackRate(playbackRate)

    const volume = this.#normalizeRange(this.options.volume, normalized)
    this.#audio.setVolume(volume)
  }

  #normalizeRange(range: RangeValue, rpm: number) {
    return range.min + rpm * (range.max - range.min)
  }

  #normalize(rpm: number): number {
    const {min, max} = this.options.rpm
    if (rpm < min) return 0
    if (rpm > max) return 1
    return (rpm - min) / (max - min)
  }
}
