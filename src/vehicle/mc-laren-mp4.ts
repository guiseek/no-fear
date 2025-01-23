import {Font, GLTF, TextGeometry} from 'three/examples/jsm/Addons.js'
import {DEG2RAD} from 'three/src/math/MathUtils.js'
import {MeshStandardMaterial, Vector3} from 'three'
import {VehiclePart} from '../interfaces'
import {TrackSound} from '../tracks'
import {Vehicle} from './vehicle'
import {Engine} from './engine'
import {Action} from '../states'

export class McLarenMP4 extends Vehicle {
  settings = {
    mass: 540,
    deceleration: 24,
    tractionForceValue: 12000,
    frictionFactorOutOfTrack: 0.99,
    airResistance: 0.015,
    rollingResistance: 12,
    brakeForce: 50000,
    lateralFriction: 0.7,
    maxSpeed: 360,
  }

  #part: VehiclePart

  get part() {
    return this.#part
  }

  #lightBack: MeshStandardMaterial

  constructor(
    gltf: GLTF,
    private action: Action,
    private engine: Engine,
    readonly trackSound: TrackSound,
    private font: Font
  ) {
    super(gltf)

    this.model.scale.setScalar(1.5)
    this.model.rotation.set(0, -1.6, 0)

    this.#part = {
      wheel: {
        front: {
          left: this.getByName('WHEEL_LEFT_FRONT'),
          right: this.getByName('WHEEL_RIGHT_FRONT'),
        },
        hub: {
          left: this.getByName('WHEEL_LEFT_FRONT_HUB'),
          right: this.getByName('WHEEL_RIGHT_FRONT_HUB'),
        },

        parent: {
          left: this.getByName('WHEEL_LEFT_FRONT_PARENT'),
          right: this.getByName('WHEEL_RIGHT_FRONT_PARENT'),
        },

        back: {
          left: this.getByName('WHEEL_LEFT_BACK'),
          right: this.getByName('WHEEL_RIGHT_BACK'),
        },
      },
      collision: {
        body: this.getByName('COLLISION_BODY'),
        wheel: {
          front: {
            left: this.getByName('COLLISION_WHEEL_FRONT_LEFT'),
            right: this.getByName('COLLISION_WHEEL_FRONT_RIGHT'),
          },
          back: {
            left: this.getByName('COLLISION_WHEEL_BACK_LEFT'),
            right: this.getByName('COLLISION_WHEEL_BACK_RIGHT'),
          },
        },
      },
      senna: {
        head: this.getByName('HEAD_PARENT'),
      },
      panel: {
        rpm: this.getByName('PANEL_RPM'),
        gear: this.getByName('PANEL_GEAR'),
        velocity: this.getByName('PANEL_VELOCITY'),
      },
      steering: this.getByName('STEERING_WHEEL'),
      gearSwitch: this.getByName('GEAR_SWITCH'),
      lightBack: this.getByName('LIGHT_BACK'),
      body: this.getByName('SUSPENSION_FRONT'),
    }

    this.part.panel.rpm.rotateX(-Math.PI / 2)
    this.part.panel.gear.rotateX(-Math.PI / 2)
    this.part.panel.velocity.rotateX(-Math.PI / 2)

    this.part.panel.gear.position.x = -0.02
    this.part.panel.gear.position.y += 0.01

    this.part.panel.velocity.position.x = -0.055
    this.part.panel.velocity.position.y += 0.01

    /**
     * Configura o som das rodas sobre a chicane na
     * mesma posição de sua respectiva roda
     */

    this.part.collision.body.visible = false
    this.part.collision.wheel.front.left.visible = false
    this.part.collision.wheel.front.right.visible = false
    this.part.collision.wheel.back.left.visible = false
    this.part.collision.wheel.back.right.visible = false

    this.part.collision.wheel.front.left.add(this.trackSound.chicane.left)
    this.part.collision.wheel.front.right.add(this.trackSound.chicane.right)

    this.#lightBack = this.#part.lightBack.material as MeshStandardMaterial
  }

  crash() {
    this.state.velocity.set(0, 0, 0)
  }

  reset() {
    this.settings = {
      mass: 540,
      deceleration: 24,
      tractionForceValue: 12000,
      frictionFactorOutOfTrack: 0.99,
      airResistance: 0.015,
      rollingResistance: 12,
      brakeForce: 50000,
      lateralFriction: 0.7,
      maxSpeed: 360,
    }

    this.resetState()

    this.model.rotation.set(0, -1.6, 0)
    this.model.position.set(0, 0, 0)
  }

  update(deltaTime: number) {
    this.engine.update(this.state.rpm)
    this.#syncLocation(deltaTime)
    this.#syncWheels(deltaTime)
    this.#syncPanel()
  }

  applyOutOfTrackPenalty() {
    this.state.velocity.multiplyScalar(this.settings.frictionFactorOutOfTrack)
  }

  #syncPanel() {
    {
      const velocity = this.state.velocity.length()
      const geometry = this.#createPanelText(velocity)

      const {x, y, z} = this.getBoundingBox(geometry)

      geometry.translate(-x, -y, -z)

      this.part.panel.velocity.geometry.dispose()
      this.part.panel.velocity.geometry = geometry
    }

    {
      const gear = this.engine.gear
      const geometry = this.#createPanelText(gear)

      const {x, y, z} = this.getBoundingBox(geometry)

      geometry.translate(-x, -y, -z)

      this.part.panel.gear.geometry.dispose()
      this.part.panel.gear.geometry = geometry
    }
  }

  acc = 0

  #createPanelText(value: number) {
    const font = this.font

    const depth = 0
    const size = 0.012
    const bevelSize = 0.01

    return new TextGeometry(value.toFixed(), {font, size, bevelSize, depth})
  }

  #syncLocation(deltaTime: number) {
    const carRotation = this.model.rotation.y
    const sinRotation = Math.sin(carRotation)
    const cosRotation = Math.cos(carRotation)

    /** Aplica força de tração */
    if (this.action.button.b) {
      this.state.tractionForce.set(0, 0, this.settings.tractionForceValue)
    } else if (this.action.button.y) {
      this.state.tractionForce.set(
        0,
        0,
        -this.settings.tractionForceValue * 0.5
      )
    } else {
      /**
       * Intensidade da desaceleração gradual
       * Ajustável no objeto `this.settings`
       */
      const deceleration = this.settings.deceleration * deltaTime

      const speed = this.state.velocity.length() // Velocidade atual
      if (speed > deceleration) {
        // Reduz gradualmente a velocidade
        this.state.velocity.setLength(speed - deceleration)
      } else if (this.state.velocity.length() < 0.5) {
        this.state.velocity.set(0, 0, 0)
      }
    }

    /**
     * Aplica força do freio
     * Ajustável em `#settings.brakeForce`
     */
    const brakeForce = new Vector3()
    const isBraking = this.action.button.a

    this.#lightBack.emissiveIntensity = isBraking ? 1 : 0

    if (isBraking) {
      brakeForce
        .copy(this.state.velocity)
        .normalize()
        .multiplyScalar(-this.settings.brakeForce)
    }

    /** Força de resistência */
    this.state.resistanceForce.x = -(
      this.settings.airResistance *
        this.state.velocity.x *
        Math.abs(this.state.velocity.x) +
      this.settings.rollingResistance * this.state.velocity.x
    )

    this.state.resistanceForce.z = -(
      this.settings.airResistance *
        this.state.velocity.z *
        Math.abs(this.state.velocity.z) +
      this.settings.rollingResistance * this.state.velocity.z
    )

    /** Força total */
    const globalTractionX =
      sinRotation * this.state.tractionForce.z +
      cosRotation * this.state.tractionForce.x
    const globalTractionZ =
      cosRotation * this.state.tractionForce.z -
      sinRotation * this.state.tractionForce.x

    this.state.netForce
      .set(globalTractionX, 0, globalTractionZ)
      .add(this.state.resistanceForce)
      .add(brakeForce)

    /** Calcula aceleração (F = ma) */
    this.state.acceleration
      .copy(this.state.netForce)
      .divideScalar(this.settings.mass)

    /** Atualiza velocidade */
    this.state.velocity.addScaledVector(this.state.acceleration, deltaTime)

    /** Limitar velocidade máxima */
    if (this.state.velocity.length() > this.settings.maxSpeed) {
      this.state.velocity.setLength(this.settings.maxSpeed)
    }

    /** Reduz componente lateral da velocidade */
    const forwardDirection = new Vector3(
      Math.sin(carRotation),
      0,
      Math.cos(carRotation)
    ).normalize()

    const lateralVelocity = this.state.velocity
      .clone()
      .projectOnPlane(forwardDirection)

    this.state.velocity.sub(
      lateralVelocity.multiplyScalar(this.settings.lateralFriction)
    )

    /** Rotação do carro */
    const localVelocityZ = this.state.velocity.dot(forwardDirection)

    const turningRadius = Math.max(8, this.state.rpm / 28)

    this.state.angularVelocity =
      (this.state.steering * Math.abs(localVelocityZ)) / turningRadius

    const velocityDirection = localVelocityZ >= 0 ? 1 : -1
    this.model.rotation.y +=
      this.state.angularVelocity * deltaTime * velocityDirection

    /** Ajusta posição */
    this.model.position.addScaledVector(this.state.velocity, deltaTime)
  }

  #syncWheels(deltaTime: number) {
    const steeringSpeed = 2 * deltaTime
    const steeringInput =
      (this.action.axis.left ? 1 : 0) - (this.action.axis.right ? 1 : 0)

    /** Atualiza direção */
    if (steeringInput === 0) {
      if (this.state.steering > 0) {
        this.state.steering = Math.max(0, this.state.steering - steeringSpeed)
      } else if (this.state.steering < 0) {
        this.state.steering = Math.min(0, this.state.steering + steeringSpeed)
      }
    } else {
      this.state.steering += steeringInput * steeringSpeed
      this.state.steering = Math.max(-0.72, Math.min(0.72, this.state.steering))
    }

    /** Ângulo de direção */
    this.state.angle = this.state.steering * 25 * DEG2RAD

    /** Aplica o ângulo */
    this.#part.wheel.parent.left.rotation.y = this.state.angle
    this.#part.wheel.parent.right.rotation.y = this.state.angle
    this.#part.wheel.hub.left.rotation.y = this.state.angle
    this.#part.wheel.hub.right.rotation.y = this.state.angle

    this.#part.steering.rotation.y = this.state.angle * 3

    this.#part.senna.head.rotation.y = this.state.steering * 0.3

    /**
     * Sincroniza as rodas
     */
    const wheelRadius = 0.5
    const localVelocityZ = this.state.velocity.dot(
      new Vector3(
        Math.sin(this.model.rotation.y),
        0,
        Math.cos(this.model.rotation.y)
      )
    )
    const wheelRotation =
      (localVelocityZ / wheelRadius) * (deltaTime * wheelRadius)

    this.#part.wheel.front.left.rotation.x += wheelRotation
    this.#part.wheel.front.right.rotation.x += wheelRotation
    this.#part.wheel.back.left.rotation.x += wheelRotation
    this.#part.wheel.back.right.rotation.x += wheelRotation

    const rpm = (Math.abs(localVelocityZ) * 60) / (2 * Math.PI * wheelRadius)
    this.state.rpm = parseFloat(rpm.toFixed(2))
  }
}

export const loadMcLarenMP4 = (
  action: Action,
  engine: Engine,
  sound: TrackSound,
  font: Font
) => {
  return (gltf: GLTF) => {
    return new McLarenMP4(gltf, action, engine, sound, font)
  }
}
