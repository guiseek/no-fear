import {GearSettings} from '../interfaces'
import {Audio, AudioListener} from 'three'
import {GearSound} from './gear-sound'

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
