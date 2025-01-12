import {Audio, AudioListener} from 'three'
import {GearSettings} from '../interfaces'

export class GearSound extends Audio {
  constructor(
    listener: AudioListener,
    buffer: AudioBuffer,
    public settings: GearSettings
  ) {
    super(listener)
    this.settings = settings
    this.setBuffer(buffer)
    this.setLoop(true)
    this.setVolume(0) // Inicia silencioso
    this.play()
  }

  update(rpm: number) {
    const normalizedRPM = this.normalizeRPM(rpm)

    this.setPlaybackRate(
      this.settings.basePlaybackRate +
        normalizedRPM *
          (this.settings.maxPlaybackRate - this.settings.basePlaybackRate)
    )

    this.setVolume(
      this.settings.baseVolume +
        normalizedRPM * (this.settings.maxVolume - this.settings.baseVolume)
    )
  }

  private normalizeRPM(rpm: number): number {
    const {minRPM, maxRPM} = this.settings
    if (rpm < minRPM) return 0
    if (rpm > maxRPM) return 1
    return (rpm - minRPM) / (maxRPM - minRPM)
  }
}
