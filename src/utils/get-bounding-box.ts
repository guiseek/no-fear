import {BufferGeometry} from 'three'

export const getBoundingBox = (geometry: BufferGeometry) => {
  geometry.computeBoundingBox()

  if (!geometry.boundingBox) {
    throw `Geometry haven't boundingBox`
  }

  const x = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2
  const y = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2
  const z = (geometry.boundingBox.max.z - geometry.boundingBox.min.z) / 2

  return {x, y, z}
}
