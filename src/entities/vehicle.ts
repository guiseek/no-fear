import {Group, MeshStandardMaterial, Vector3} from 'three'
import {DEG2RAD} from 'three/src/math/MathUtils.js'
import {GLTF} from 'three/examples/jsm/Addons.js'
import {VehiclePart} from '../interfaces'
import {inputState} from '../infra'
import {getByName} from '../utils'
import {Camera} from '../core'

export class Vehicle {
  #model: Group

  get model() {
    return this.#model
  }

  #settings = {
    mass: 6000,
    deceleration: 20,
    tractionForceValue: 90000,
    airResistance: 0.015,
    rollingResistance: 10,
    brakeForce: 600000,
    lateralFriction: 0.7,
    maxSpeed: 360,
  }

  #state = {
    rpm: 0,
    angle: 0,
    steering: 0,
    velocity: new Vector3(),
    acceleration: new Vector3(),
    netForce: new Vector3(),
    tractionForce: new Vector3(),
    resistanceForce: new Vector3(),
    angularVelocity: 0,
  }

  get state() {
    return this.#state
  }

  get currentSpeed() {
    return this.#state.velocity.length()
  }

  get currentDirection() {
    return this.#state.velocity.clone().normalize()
  }

  #part: VehiclePart

  get part() {
    return this.#part
  }

  #lightBack: MeshStandardMaterial

  constructor({scene}: GLTF) {
    this.#model = scene

    this.#part = {
      wheel: {
        front: {
          left: getByName(this.model, 'WHEEL_LEFT_FRONT'),

          right: getByName(this.model, 'WHEEL_RIGHT_FRONT'),
        },

        hub: {
          left: getByName(this.model, 'WHEEL_LEFT_FRONT_HUB'),

          right: getByName(this.model, 'WHEEL_RIGHT_FRONT_HUB'),
        },

        parent: {
          left: getByName(this.model, 'WHEEL_LEFT_FRONT_PARENT'),

          right: getByName(this.model, 'WHEEL_RIGHT_FRONT_PARENT'),
        },

        back: {
          left: getByName(this.model, 'WHEEL_LEFT_BACK'),

          right: getByName(this.model, 'WHEEL_RIGHT_BACK'),
        },
      },

      steering: getByName(this.model, 'STEERING_WHEEL'),

      speedometer: getByName(this.model, 'SPEEDOMETER'),

      gearSwitch: getByName(this.model, 'GEAR_SWITCH'),

      lightBack: getByName(this.model, 'LIGHT_BACK'),

      body: getByName(this.model, 'SUSPENSION_FRONT'),
    }

    this.#lightBack = this.#part.lightBack.material as MeshStandardMaterial
  }

  addCamera(camera: Camera) {
    this.#model.add(camera)
  }

  crash() {
    this.#state.velocity.set(0, 0, 0)
  }

  update(deltaTime: number) {
    this.#syncLocation(deltaTime)
    this.#syncWheels(deltaTime)
  }

  #syncLocation(deltaTime: number) {
    const carRotation = this.#model.rotation.y
    const sinRotation = Math.sin(carRotation)
    const cosRotation = Math.cos(carRotation)

    /** Aplica força de tração */
    if (inputState.button.b) {
      this.#state.tractionForce.set(0, 0, this.#settings.tractionForceValue)
    } else if (inputState.button.y) {
      this.#state.tractionForce.set(
        0,
        0,
        -this.#settings.tractionForceValue * 0.5
      )
    } else {
      /**
       * Intensidade da desaceleração gradual
       * Ajustável no objeto `this.#settings`
       */
      const deceleration = this.#settings.deceleration * deltaTime

      const speed = this.#state.velocity.length() // Velocidade atual
      if (speed > deceleration) {
        // Reduz gradualmente a velocidade
        this.#state.velocity.setLength(speed - deceleration)
      } else if (this.#state.velocity.length() < 0.5) {
        this.#state.velocity.set(0, 0, 0)
      }
    }

    /**
     * Aplica força do freio
     * Ajustável em `#settings.brakeForce`
     */
    const brakeForce = new Vector3()
    const isBraking = inputState.button.a

    this.#lightBack.emissiveIntensity = isBraking ? 1 : 0

    if (isBraking) {
      brakeForce
        .copy(this.#state.velocity)
        .normalize()
        .multiplyScalar(-this.#settings.brakeForce)
    }

    /** Força de resistência */
    this.#state.resistanceForce.x = -(
      this.#settings.airResistance *
        this.#state.velocity.x *
        Math.abs(this.#state.velocity.x) +
      this.#settings.rollingResistance * this.#state.velocity.x
    )

    this.#state.resistanceForce.z = -(
      this.#settings.airResistance *
        this.#state.velocity.z *
        Math.abs(this.#state.velocity.z) +
      this.#settings.rollingResistance * this.#state.velocity.z
    )

    /** Força total */
    const globalTractionX =
      sinRotation * this.#state.tractionForce.z +
      cosRotation * this.#state.tractionForce.x
    const globalTractionZ =
      cosRotation * this.#state.tractionForce.z -
      sinRotation * this.#state.tractionForce.x

    this.#state.netForce
      .set(globalTractionX, 0, globalTractionZ)
      .add(this.#state.resistanceForce)
      .add(brakeForce)

    /** Calcula aceleração (F = ma) */
    this.#state.acceleration
      .copy(this.#state.netForce)
      .divideScalar(this.#settings.mass)

    /** Atualiza velocidade */
    this.#state.velocity.addScaledVector(this.#state.acceleration, deltaTime)

    /** Limitar velocidade máxima */
    if (this.#state.velocity.length() > this.#settings.maxSpeed) {
      this.#state.velocity.setLength(this.#settings.maxSpeed)
    }

    /** Reduz componente lateral da velocidade */
    const forwardDirection = new Vector3(
      Math.sin(carRotation),
      0,
      Math.cos(carRotation)
    ).normalize()

    const lateralVelocity = this.#state.velocity
      .clone()
      .projectOnPlane(forwardDirection)

    this.#state.velocity.sub(
      lateralVelocity.multiplyScalar(this.#settings.lateralFriction)
    )

    /** Rotação do carro */
    const localVelocityZ = this.#state.velocity.dot(forwardDirection)
    const turningRadius = Math.max(4, this.state.rpm / 30)
    this.#state.angularVelocity =
      (this.#state.steering * Math.abs(localVelocityZ)) / turningRadius

    const velocityDirection = localVelocityZ >= 0 ? 1 : -1
    this.#model.rotation.y +=
      this.#state.angularVelocity * deltaTime * velocityDirection

    /** Ajusta posição */
    this.#model.position.addScaledVector(this.#state.velocity, deltaTime)
  }

  #syncWheels(deltaTime: number) {
    const steeringSpeed = 2 * deltaTime
    const steeringInput =
      (inputState.direction.left ? 1 : 0) - (inputState.direction.right ? 1 : 0)

    /** Atualiza direção */
    if (steeringInput === 0) {
      if (this.#state.steering > 0) {
        this.#state.steering = Math.max(0, this.#state.steering - steeringSpeed)
      } else if (this.#state.steering < 0) {
        this.#state.steering = Math.min(0, this.#state.steering + steeringSpeed)
      }
    } else {
      this.#state.steering += steeringInput * steeringSpeed
      this.#state.steering = Math.max(
        -0.72,
        Math.min(0.72, this.#state.steering)
      )
    }

    /** Ângulo de direção */
    this.#state.angle = this.#state.steering * 25 * DEG2RAD

    /** Aplica o ângulo */
    this.#part.wheel.parent.left.rotation.y = this.#state.angle
    this.#part.wheel.parent.right.rotation.y = this.#state.angle
    this.#part.wheel.hub.left.rotation.y = this.#state.angle
    this.#part.wheel.hub.right.rotation.y = this.#state.angle

    this.#part.steering.rotation.y = this.#state.angle * 3

    /**
     * Sincroniza as rodas
     */
    const wheelRadius = 0.5
    const localVelocityZ = this.#state.velocity.dot(
      new Vector3(
        Math.sin(this.#model.rotation.y),
        0,
        Math.cos(this.#model.rotation.y)
      )
    )
    const wheelRotation = (localVelocityZ / wheelRadius) * deltaTime

    this.#part.wheel.front.left.rotation.x += wheelRotation
    this.#part.wheel.front.right.rotation.x += wheelRotation
    this.#part.wheel.back.left.rotation.x += wheelRotation
    this.#part.wheel.back.right.rotation.x += wheelRotation

    const rpm = (Math.abs(localVelocityZ) * 60) / (2 * Math.PI * wheelRadius)
    this.#state.rpm = parseFloat(rpm.toFixed(2))
  }
}

export const loadVehicle = (gltf: GLTF) => new Vehicle(gltf)
