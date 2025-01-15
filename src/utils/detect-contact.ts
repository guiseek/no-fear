import {Object3D, Raycaster, Vector3} from 'three'

const downVector = new Vector3(0, -1, 0)
const raycaster = new Raycaster()

export const detectContact = (
  object: Object3D,
  objects: Object3D[],
  recursive = false
) => {
  const position = new Vector3()
  object.getWorldPosition(position)

  raycaster.set(position, downVector)

  return raycaster.intersectObjects(objects, recursive)
}
