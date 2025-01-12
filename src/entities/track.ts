import {GLTF} from 'three/examples/jsm/Addons.js'
import {TrackPart} from '../interfaces'
import {getByName} from '../utils'
import {Group} from 'three'

export class Track {
  #model: Group

  get model() {
    return this.#model
  }

  #part: TrackPart

  get part() {
    return this.#part
  }

  constructor({scene}: GLTF) {
    this.#model = scene

    this.#part = {
      fence: getByName(this.model, 'FENCE'),
    }
  }
}

export const loadTrack = (gltf: GLTF) => new Track(gltf)
