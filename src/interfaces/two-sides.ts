import {Object3D} from 'three'

export interface TwoSides<T = Object3D> {
  left: T
  right: T
}
