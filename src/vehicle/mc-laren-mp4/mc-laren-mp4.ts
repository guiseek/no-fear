import {Font, GLTF, TextGeometry} from 'three/examples/jsm/Addons.js'
import {McLarenMP4PartMap} from './mc-laren-mp4-part-map'
import {DEG2RAD} from 'three/src/math/MathUtils.js'
import {McLarenMP4Part} from './mc-laren-mp4-part'
import {VehicleSound} from '../vehicle-sound'
import {Action} from '../../states'
import {Vehicle} from '../vehicle'
import {Engine} from '../engine'
import {
  Vector3,
  AnimationMixer,
  AnimationAction,
  MeshStandardMaterial,
} from 'three'

export class McLarenMP4 extends Vehicle<McLarenMP4PartMap> {
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
    /**
     * Velocidade mínima para iniciar derrapagem
     */
    driftThreshold: 120,

    /**
     * Intensidade da derrapagem
     */
    driftFactor: 0.2,
  }

  #part: McLarenMP4PartMap

  get part() {
    return this.#part
  }

  #lightBack: MeshStandardMaterial

  #mixer: AnimationMixer
  #actions: AnimationAction[] = []

  constructor(
    gltf: GLTF,
    private action: Action,
    private engine: Engine,
    readonly vehicleSound: VehicleSound,
    private font: Font
  ) {
    super(gltf)

    this.#mixer = new AnimationMixer(this.model)

    for (const clip of gltf.animations) {
      const action = this.#mixer.clipAction(clip)
      action.enabled = true
      action.setEffectiveWeight(1)
      action.setEffectiveTimeScale(2)
      this.#actions.push(action)
    }

    this.model.scale.setScalar(1.5)
    this.model.rotation.set(0, -1.6, 0)

    this.#part = {
      wheel: {
        front: {
          left: this.getByName(McLarenMP4Part.WheelLeftFront),
          right: this.getByName(McLarenMP4Part.WheelRightFront),
        },
        hub: {
          left: this.getByName(McLarenMP4Part.WheelLeftFrontHub),
          right: this.getByName(McLarenMP4Part.WheelRightFrontHub),
        },

        parent: {
          left: this.getByName(McLarenMP4Part.WheelLeftFrontParent),
          right: this.getByName(McLarenMP4Part.WheelRightFrontParent),
        },

        back: {
          left: this.getByName(McLarenMP4Part.WheelLeftBack),
          right: this.getByName(McLarenMP4Part.WheelRightBack),
        },
      },
      collision: {
        body: this.getByName(McLarenMP4Part.CollisionBody),
        wheel: {
          front: {
            left: this.getByName(McLarenMP4Part.CollisionWheelLeftFront),
            right: this.getByName(McLarenMP4Part.CollisionWheelRightFront),
          },
          back: {
            left: this.getByName(McLarenMP4Part.CollisionWheelLeftBack),
            right: this.getByName(McLarenMP4Part.CollisionWheelRightBack),
          },
        },
      },
      senna: {
        head: this.getByName(McLarenMP4Part.SennaHead),
      },
      panel: {
        rpm: this.getByName(McLarenMP4Part.PannelRPM),
        gear: this.getByName(McLarenMP4Part.PannelGear),
        velocity: this.getByName(McLarenMP4Part.PannelVelocity),
      },
      steering: this.getByName(McLarenMP4Part.Steering),
      gearSwitch: this.getByName(McLarenMP4Part.GearSwitch),
      lightBack: this.getByName(McLarenMP4Part.LightBack),
      body: this.getByName(McLarenMP4Part.Body),
      flag: this.getByName(McLarenMP4Part.FlagParent),
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

    this.part.collision.wheel.front.left.add(this.vehicleSound.chicane.left)
    this.part.collision.wheel.front.right.add(this.vehicleSound.chicane.right)

    this.#lightBack = this.#part.lightBack.material as MeshStandardMaterial

    this.#part.flag.visible = false
  }

  crash() {
    this.state.velocity.set(0, 0, 0)
  }

  celebrate() {
    this.part.flag.visible = true
    for (const action of this.#actions) {
      action.play()
    }
  }

  reset() {
    this.resetState()

    this.model.rotation.set(0, -1.6, 0)
    this.model.position.set(0, 0, 0)
  }

  update(deltaTime: number) {
    this.#mixer.update(deltaTime)
    this.engine.update(this.state.rpm)
    this.#syncLocation(deltaTime)
    this.#syncWheels(deltaTime)
    this.#applyDrift(deltaTime)
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
    const wheelRotation = (localVelocityZ / wheelRadius) * deltaTime

    this.#part.wheel.front.left.rotation.x += wheelRotation
    this.#part.wheel.front.right.rotation.x += wheelRotation
    this.#part.wheel.back.left.rotation.x += wheelRotation
    this.#part.wheel.back.right.rotation.x += wheelRotation

    const rpm = (Math.abs(localVelocityZ) * 60) / (2 * Math.PI * wheelRadius)
    this.state.rpm = parseFloat(rpm.toFixed(2))
  }

  #applyDrift(deltaTime: number) {
    const speed = this.state.velocity.length()

    // Verifica se o carro está em alta velocidade e virando
    if (
      speed > this.settings.driftThreshold &&
      Math.abs(this.state.steering) > 0.6
    ) {
      const driftDirection = new Vector3(
        -Math.cos(this.model.rotation.y + Math.PI / 2),
        0,
        -Math.sin(this.model.rotation.y + Math.PI / 2)
      ).normalize()

      // Aplica uma força lateral proporcional à velocidade e ao ângulo da direção
      // const driftAmount =
      //   speed * this.settings.driftFactor * Math.abs(this.state.steering)

      // this.model.position.addScaledVector(
      //   driftDirection,
      //   driftAmount * deltaTime
      // )

      // Aplica uma força lateral proporcional à velocidade e ao ângulo da direção
      const driftForce = driftDirection.multiplyScalar(
        speed * this.settings.driftFactor * Math.abs(this.state.steering)
      )

      this.state.velocity.addScaledVector(driftForce, deltaTime)

      // Condição explícita para tocar o som de derrapagem depois
      if (this.action.button.a) {
        this.vehicleSound.skid()
      }
    } else if (this.vehicleSound.isSkidding) {
      this.vehicleSound.skid(false)
    }
  }
}
