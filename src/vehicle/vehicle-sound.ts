import {TwoSides, VehicleBufferMap, VehicleSoundMap} from '../interfaces'
import {Audio, AudioListener, PositionalAudio} from 'three'

export class VehicleSound implements VehicleSoundMap {
  skidding: Audio

  chicane: TwoSides<PositionalAudio>

  constructor(listener: AudioListener, buffer: VehicleBufferMap) {
    this.skidding = new Audio(listener)
    this.skidding.setBuffer(buffer.skidding)
    this.skidding.setLoop(true)
    this.skidding.setVolume(0)
    this.skidding.play()

    this.chicane = {
      left: new PositionalAudio(listener),
      right: new PositionalAudio(listener),
    }

    this.chicane.left.setDistanceModel('linear')
    this.chicane.left.setPlaybackRate(0.5)
    this.chicane.left.setRolloffFactor(10)
    this.chicane.left.setRefDistance(0.5)
    this.chicane.left.setBuffer(buffer.chicane)
    // this.chicane.left.setLoop(true)
    this.chicane.left.setVolume(0.4)

    this.chicane.right.setDistanceModel('linear')
    this.chicane.right.setPlaybackRate(0.5)
    this.chicane.right.setRolloffFactor(10)
    this.chicane.right.setRefDistance(0.5)
    this.chicane.right.setBuffer(buffer.chicane)
    // this.chicane.right.setLoop(true)
    this.chicane.right.setVolume(0.4)
  }

  get isSkidding() {
    return this.skidding.getVolume() > 0
  }

  skid(state = true) {
    this.skidding.setVolume(state ? 0.3 : 0)
  }
}
