import {Box3, Object3D, Vector3} from 'three'

export function getBounds(object: Object3D) {
  const boundingBox = new Box3().setFromObject(object)

  const min = boundingBox.min.clone().applyMatrix4(object.matrixWorld)
  const max = boundingBox.max.clone().applyMatrix4(object.matrixWorld)

  const radius = (max.x - min.x) / 2

  const start = new Vector3(min.x, min.y, min.z)
  const end = new Vector3(max.x, max.y, max.z)

  return {start, end, radius}
}
