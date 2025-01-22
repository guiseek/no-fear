import {BufferGeometry, Object3D, Vector3} from 'three'
import {GLTF} from 'three/examples/jsm/Addons.js'
import {VehiclePart} from '../interfaces'
import {TrackSound} from '../tracks'

export abstract class Vehicle {
  #model: Object3D

  get model() {
    return this.#model
  }

  abstract settings: {
    mass: number
    deceleration: number
    tractionForceValue: number
    frictionFactorOutOfTrack: number
    airResistance: number
    rollingResistance: number
    brakeForce: number
    lateralFriction: number
    maxSpeed: number
  }

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

  get currentDirection() {
    return this.state.velocity.clone().normalize()
  }

  abstract get part(): VehiclePart
  abstract trackSound: TrackSound

  constructor({scene}: GLTF) {
    this.#model = scene
  }

  applyOutOfTrackPenalty() {
    this.state.velocity.multiplyScalar(this.settings.frictionFactorOutOfTrack)
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
