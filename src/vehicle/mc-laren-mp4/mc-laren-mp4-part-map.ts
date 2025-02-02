import {TwoSides, VehiclePartMap} from '../../interfaces'
import {Mesh, Object3D} from 'three'

export interface McLarenMP4Wheel {
  front: TwoSides
  hub: TwoSides
  parent: TwoSides
  back: TwoSides
}

export interface McLarenMP4Panel {
  rpm: Mesh
  gear: Mesh
  velocity: Mesh
}

export interface McLarenMP4Senna {
  head: Object3D
}

export interface McLarenMP4PartMap extends VehiclePartMap {
  senna: McLarenMP4Senna
  wheel: McLarenMP4Wheel
  steering: Object3D
  gearSwitch: Object3D
  lightBack: Mesh
  panel: McLarenMP4Panel
  body: Object3D
  flag: Object3D
  mirror: TwoSides<Mesh>
}
