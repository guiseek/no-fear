import {Group, Mesh, Object3D} from 'three'

export interface TrackGround {
  grass: Mesh
  concrete: Mesh
}
export interface TrackChicanes extends Group {
  children: [Mesh, Mesh]
}

export interface TrackScreen {
  lapTime: Mesh
  bestLapTime: Mesh
}

export interface TrackCollision {
  startLap: Mesh
  finishLap: Mesh
}

export interface TrackPart {
  track: Mesh
  trackLines: Mesh
  screenTimes: TrackScreen
  chicanes: TrackChicanes
  ground: TrackGround
  collision: TrackCollision
  startLights: [Mesh, Mesh, Mesh, Mesh, Mesh]
  startLightsParent: Object3D
}
