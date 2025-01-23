import {BufferGeometry, Object3D} from 'three'
import {GLTF} from 'three/examples/jsm/Addons.js'

export abstract class Entity {
  #model: Object3D

  get model() {
    return this.#model
  }

  constructor({scene}: GLTF) {
    this.#model = scene
  }

  abstract update(delta: number): void

  protected getBoundingBox(geometry: BufferGeometry) {
    geometry.computeBoundingBox()

    if (!geometry.boundingBox) {
      throw `Geometry haven't boundingBox`
    }

    return {
      x: (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2,
      y: (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2,
      z: (geometry.boundingBox.max.z - geometry.boundingBox.min.z) / 2,
    }
  }

  protected getBoundingSphere(geometry: BufferGeometry) {
    geometry.computeBoundingSphere()

    if (!geometry.boundingSphere) {
      throw `Geometry haven't boundingSphere`
    }

    return geometry.boundingSphere
  }

  protected getByName<R extends Object3D>(name: string) {
    const child = this.model.getObjectByName(name)
    if (!child) throw `${name} not found in ${this.model.name}`
    return child as R
  }
}
