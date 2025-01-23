import {TrackBufferMap, TrackSoundChicane, TrackSoundMap} from '../interfaces'
import {Audio, AudioListener, PositionalAudio} from 'three'

export class TrackSound implements TrackSoundMap {
  startLight: Audio

  checkpoint: Audio

  chicane: TrackSoundChicane

  constructor(listener: AudioListener, buffer: TrackBufferMap) {
    this.startLight = new Audio(listener)
    this.startLight.setBuffer(buffer.startLight)

    this.checkpoint = new Audio(listener)
    this.checkpoint.setBuffer(buffer.checkpoint)
    this.checkpoint.setLoop(false)

    this.chicane = {
      left: new PositionalAudio(listener),
      right: new PositionalAudio(listener),
    }

    this.chicane.left.setDistanceModel('linear')
    this.chicane.left.setPlaybackRate(0.3)
    this.chicane.left.setRolloffFactor(1)
    this.chicane.left.setRefDistance(0.5)
    this.chicane.left.setBuffer(buffer.chicane)
    this.chicane.left.setVolume(1)
    this.chicane.left.setLoop(true)

    this.chicane.right.setDistanceModel('linear')
    this.chicane.right.setPlaybackRate(0.2)
    this.chicane.right.setRolloffFactor(0.5)
    this.chicane.right.setRefDistance(1)
    this.chicane.right.setBuffer(buffer.chicane)
    this.chicane.right.setLoop(true)
    this.chicane.right.setVolume(1)
  }
}
