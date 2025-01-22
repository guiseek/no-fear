import {Object3D, Raycaster, Vector3, Vector3Like} from 'three'
import {TrackPartMap, TrackSoundMap} from '../interfaces'
import {GLTF} from 'three/examples/jsm/Addons.js'
import {Vehicle} from '../vehicle'
import {Entity} from '../core'

export abstract class Track<
  P extends TrackPartMap,
  S extends TrackSoundMap
> extends Entity {
  #model: Object3D

  get model() {
    return this.#model
  }

  protected raycaster = new Raycaster()
  protected direction = new Vector3(0, -1, 0)

  protected lapStartTime?: DOMHighResTimeStamp
  protected currentLapTime?: number
  protected bestLapTime = Infinity

  abstract get part(): P

  abstract trackSound: S

  constructor({scene}: GLTF, protected vehicle: Vehicle) {
    super()
    this.#model = scene
  }

  abstract checkStartLap(position: Vector3Like): void

  abstract checkFinishLap(position: Vector3Like): void

  protected detectContact = (
    object: Object3D,
    objects: Object3D[],
    recursive = false
  ) => {
    const position = new Vector3()
    object.getWorldPosition(position)

    this.raycaster.set(position, this.direction)

    return this.raycaster.intersectObjects(objects, recursive)
  }
}
