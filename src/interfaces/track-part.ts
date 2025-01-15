import {Group, Mesh} from 'three'

export interface TrackGround {
  grass: Mesh
  concrete: Mesh
}
export interface TrackChicanes extends Group {
  children: [Mesh, Mesh]
}

export interface TrackPart {
  track: Mesh
  trackLines: Mesh
  chicanes: TrackChicanes
  ground: TrackGround
  startLights: [Mesh, Mesh, Mesh, Mesh, Mesh]
}
