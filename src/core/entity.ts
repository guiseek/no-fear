import {BufferGeometry, Object3D} from 'three'

export abstract class Entity {
  abstract get model(): Object3D

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

  protected getByName<R extends Object3D>(name: string) {
    const child = this.model.getObjectByName(name)
    if (!child) throw `${name} not found in ${this.model.name}`
    return child as R
  }
}
