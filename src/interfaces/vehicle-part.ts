import {Mesh, Object3D} from 'three'
import {TwoSides} from './two-sides'

export interface VehicleWheel {
  front: TwoSides
  hub: TwoSides
  parent: TwoSides
  back: TwoSides
}

export interface VehiclePanel {
  rpm: Mesh
  gear: Mesh
  velocity: Mesh
}

export interface VehicleCollisionWheel {
  front: TwoSides<Mesh>
  back: TwoSides<Mesh>
}

export interface VehicleCollision {
  body: Mesh
  wheel: VehicleCollisionWheel
}

export interface VehicleSenna {
  head: Object3D
}

export interface VehiclePart {
  collision: VehicleCollision
  senna: VehicleSenna
  wheel: VehicleWheel
  steering: Object3D
  gearSwitch: Mesh
  lightBack: Mesh
  panel: VehiclePanel
  body: Mesh
}
