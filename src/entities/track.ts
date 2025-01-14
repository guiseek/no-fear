import {GLTF} from 'three/examples/jsm/Addons.js'
import {Group} from 'three'

export class Track {
  #model: Group

  get model() {
    return this.#model
  }
  constructor({scene}: GLTF) {
    this.#model = scene
  }
}

export const loadTrack = (gltf: GLTF) => new Track(gltf)
