import {AudioListener, PositionalAudio} from 'three'
import {SoundPart} from '../interfaces'
import {Loader} from '../core'

export interface SoundBufferMap {
  chicane: AudioBuffer
}

export class Sound {
  #part: SoundPart

  get part() {
    return this.#part
  }

  constructor(listener: AudioListener, {chicane}: SoundBufferMap) {
    this.#part = {
      chicane: {
        left: new PositionalAudio(listener),
        right: new PositionalAudio(listener),
      },
    }

    this.#setupChicane(this.part.chicane.left, chicane)
    this.#setupChicane(this.part.chicane.right, chicane)
  }

  #setupChicane(audio: PositionalAudio, buffer: AudioBuffer) {
    audio.setDistanceModel('linear')
    audio.setPlaybackRate(0.3)
    audio.setRolloffFactor(1)
    audio.setRefDistance(1)
    audio.setBuffer(buffer)
    audio.setLoop(true)
    audio.setVolume(0.2)
  }
}

export const loadSound = async (listener: AudioListener) => {
  const loader = Loader.getInstance()

  const chicane = await loader.loadAudio('chicane.wav', 'Chicane sound')

  return new Sound(listener, {chicane})
}
