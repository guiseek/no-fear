import {GearSettings, GearSound} from './gear-sound'
import {AudioListener} from 'three'

export type SoundKey = 'idle' | 'low' | 'med' | 'high'
export type BufferMap = Record<SoundKey, AudioBuffer>

export class EngineSound {
  private gears: GearSound[]
  private activeGearIndex = 0

  constructor(
    listener: AudioListener,
    buffers: AudioBuffer[],
    gearSettings: GearSettings[]
  ) {
    if (buffers.length !== gearSettings.length) {
      throw new Error(
        'Buffers e configurações de marchas devem ter o mesmo comprimento'
      )
    }

    this.gears = buffers.map(
      (buffer, index) => new GearSound(listener, buffer, gearSettings[index])
    )

    // Ativa inicialmente a primeira marcha (idle)
    this.gears[0].setVolume(1)
  }

  start() {
    this.gears[this.activeGearIndex].play()
  }

  stop() {
    this.gears[this.activeGearIndex].play()
  }

  pause() {
    if (this.gears[this.activeGearIndex].isPlaying) {
      this.gears[this.activeGearIndex].pause()
    } else {
      this.gears[this.activeGearIndex].play()
    }
  }

  update(rpm: number) {
    const activeGear = this.gears[this.activeGearIndex]
    activeGear.update(rpm)

    // Transição de marcha se o RPM exceder os limites
    if (
      rpm > activeGear.settings.maxRPM &&
      this.activeGearIndex < this.gears.length - 1
    ) {
      this.shiftUp()
    } else if (rpm < activeGear.settings.minRPM && this.activeGearIndex > 0) {
      this.shiftDown()
    }
  }

  private shiftUp() {
    this.gears[this.activeGearIndex].setVolume(0)
    this.activeGearIndex++
    this.gears[this.activeGearIndex].setVolume(1)
  }

  private shiftDown() {
    this.gears[this.activeGearIndex].setVolume(0)
    this.activeGearIndex--
    this.gears[this.activeGearIndex].setVolume(1)
  }
}
