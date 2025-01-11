import {Mesh, Object3D} from 'three'

interface DoubleSides {
  left: Object3D
  right: Object3D
}

interface Wheel {
  front: DoubleSides
  hub: DoubleSides
  parent: DoubleSides
  back: DoubleSides
}

export interface VehiclePart {
  wheel: Wheel
  steering: Object3D
  speedometer: Mesh
  gearSwitch: Mesh
  lightBack: Mesh
  body: Mesh
}
