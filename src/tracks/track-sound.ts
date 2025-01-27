import {TrackBufferMap, TrackSoundMap} from '../interfaces'
import {Audio, AudioListener} from 'three'

export class TrackSound implements TrackSoundMap {
  startLight: Audio

  checkpoint: Audio

  lapTime: Audio

  bestLapTime: Audio

  victoryTheme: Audio

  constructor(listener: AudioListener, buffer: TrackBufferMap) {
    this.startLight = new Audio(listener)
    this.startLight.setBuffer(buffer.startLight)

    this.checkpoint = new Audio(listener)
    this.checkpoint.setBuffer(buffer.checkpoint)

    this.lapTime = new Audio(listener)
    this.lapTime.setBuffer(buffer.lapTime)

    this.bestLapTime = new Audio(listener)
    this.bestLapTime.setBuffer(buffer.bestLapTime)
    this.lapTime.setBuffer(buffer.lapTime)

    this.victoryTheme = new Audio(listener)
    this.victoryTheme.setBuffer(buffer.victoryTheme)
  }
}
