import { TwoSides } from "./two-sides"
import { Object3D } from "three"

export interface VehicleCollisionWheel {
  front: TwoSides<Object3D>
  back: TwoSides<Object3D>
}

export interface VehicleCollision {
  body: Object3D
  wheel: VehicleCollisionWheel
}

export interface VehiclePartMap {
  collision: VehicleCollision
}