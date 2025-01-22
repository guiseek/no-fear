import { Loader } from '../core'
import {TrackBufferMap, TrackSoundChicane, TrackSoundMap} from '../interfaces'
import {Audio, AudioListener, PositionalAudio} from 'three'

export class TrackSound implements TrackSoundMap {
  startLight: Audio

  chicane: TrackSoundChicane

  constructor(listener: AudioListener, buffer: TrackBufferMap) {
    this.startLight = new Audio(listener)
    this.startLight.setBuffer(buffer.startLight)

    this.chicane = {
      left: new PositionalAudio(listener),
      right: new PositionalAudio(listener),
    }

    this.chicane.left.setBuffer(buffer.chicane)
    this.chicane.left.setPlaybackRate(0.3)
    this.chicane.left.setRolloffFactor(1)
    this.chicane.left.setRefDistance(1)
    this.chicane.left.setVolume(0.4)
    this.chicane.left.setLoop(true)

    this.chicane.right.setBuffer(buffer.chicane)
    this.chicane.right.setPlaybackRate(0.3)
    this.chicane.right.setRolloffFactor(1)
    this.chicane.right.setRefDistance(1)
    this.chicane.right.setVolume(0.4)
    this.chicane.right.setLoop(true)
  }
}

export const loadTrackSound = async (listener: AudioListener) => {
  const loader = Loader.getInstance()

  const chicane = await loader.loadAudio('chicane.wav', 'Chicane sound')
  const startLight = await loader.loadAudio('start-light.wav', 'Start light')

  return new TrackSound(listener, {chicane, startLight})
}
