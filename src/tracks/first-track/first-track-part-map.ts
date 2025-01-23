import {TrackCollision, TrackPartMap} from '../../interfaces'
import {Group, Mesh, Object3D} from 'three'

export interface FirstTrackGround {
  grass: Mesh
  concrete: Mesh
}

export interface FirstTrackChicanes extends Group {
  children: [Mesh, Mesh]
}

export interface FirstTrackScreen {
  lapTime: Mesh
  bestLapTime: Mesh
}

export interface FirstTrackPartMap extends TrackPartMap {
  track: Mesh
  trackLines: Mesh
  screenTimes: FirstTrackScreen
  chicanes: FirstTrackChicanes
  ground: FirstTrackGround
  collision: TrackCollision
  startLights: [Mesh, Mesh, Mesh, Mesh, Mesh]
  startLightsParent: Object3D
}
