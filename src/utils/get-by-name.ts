import {Object3D} from 'three'

export function getByName<R extends Object3D>(group: Object3D, name: string) {
  const child = group.getObjectByName(name)
  if (!child) throw `${name} not found in ${group.name}`
  return child as R
}
