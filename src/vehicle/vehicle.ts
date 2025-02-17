import {VehiclePartMap, VehicleSettings} from '../interfaces'
import {BufferGeometry, Object3D, Vector3} from 'three'
import {GLTF} from 'three/examples/jsm/Addons.js'
import {VehicleSound} from './vehicle-sound'

export abstract class Vehicle<P extends VehiclePartMap> {
  #model: Object3D

  get model() {
    return this.#model
  }

  protected abstract settings: VehicleSettings

  protected state = {
    rpm: 0,
    angle: 0,
    steering: 0,
    velocity: new Vector3(0, 0, 0),
    acceleration: new Vector3(),
    netForce: new Vector3(),
    tractionForce: new Vector3(),
    resistanceForce: new Vector3(),
    angularVelocity: 0,
  }

  get currentSpeed() {
    return this.state.velocity.length()
  }

  get currentMaxSpeed() {
    return this.settings.maxSpeed
  }

  get currentDirection() {
    return this.state.velocity.clone().normalize()
  }

  abstract get part(): P
  abstract vehicleSound: VehicleSound

  abstract celebrate(): void

  constructor({scene}: GLTF) {
    this.#model = scene
  }

  applyOutOfTrackPenalty() {
    this.state.velocity.multiplyScalar(this.settings.frictionFactorOutOfTrack)
  }

  protected resetState() {
    this.state = {
      rpm: 0,
      angle: 0,
      steering: 0,
      velocity: new Vector3(0, 0, 0),
      acceleration: new Vector3(),
      netForce: new Vector3(),
      tractionForce: new Vector3(),
      resistanceForce: new Vector3(),
      angularVelocity: 0,
    }
  }

  setMaxSpeed(maxSpeed: number) {
    this.settings.maxSpeed = maxSpeed
  }

  protected getBoundingBox(geometry: BufferGeometry) {
    geometry.computeBoundingBox()

    if (!geometry.boundingBox) {
      throw `Geometry haven't boundingBox`
    }

    return {
      x: (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2,
      y: (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2,
      z: (geometry.boundingBox.max.z - geometry.boundingBox.min.z) / 2,
    }
  }

  protected getByName<R extends Object3D>(name: string) {
    const child = this.model.getObjectByName(name)
    if (!child) throw `${name} not found in ${this.model.name}`
    return child as R
  }
}
