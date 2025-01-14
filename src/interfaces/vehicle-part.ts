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

export interface VehiclePanel {
  rpm: Mesh
  gear: Mesh
  velocity: Mesh
}

export interface VehiclePart {
  wheel: Wheel
  steering: Object3D
  gearSwitch: Mesh
  lightBack: Mesh
  panel: VehiclePanel
  body: Mesh
}
