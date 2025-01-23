import {Object3D} from 'three'

export interface TrackCheckpointMap extends Object3D {
  children: Object3D[]
}

export interface TrackCollision {
  startLap: Object3D
  finishLap: Object3D
  checkpoints: TrackCheckpointMap
}

export interface TrackPartMap {
  collision: TrackCollision
  track: Object3D
}
