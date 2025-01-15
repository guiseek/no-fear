import {async, detectContact, getByName, interval} from '../utils'
import {TrackPart, Updatable} from '../interfaces'
import {GLTF} from 'three/examples/jsm/Addons.js'
import {Group, MeshStandardMaterial} from 'three'
import {Vehicle} from './vehicle'

export class Track implements Updatable {
  #model: Group

  get model() {
    return this.#model
  }

  #part: TrackPart

  get part() {
    return this.#part
  }

  #startLights: [
    MeshStandardMaterial,
    MeshStandardMaterial,
    MeshStandardMaterial,
    MeshStandardMaterial,
    MeshStandardMaterial
  ]

  constructor({scene}: GLTF, private vehicle: Vehicle) {
    this.#model = scene

    this.#part = {
      chicanes: getByName(this.model, 'CHICANES'),
      ground: {
        grass: getByName(this.model, 'GROUND_GRASS'),
        concrete: getByName(this.model, 'GROUND_CONCRETE'),
      },
      trackLines: getByName(this.model, 'TRACK_LINES'),
      track: getByName(this.model, 'TRACK'),
      startLights: [
        getByName(this.model, 'START_LIGHT_1'),
        getByName(this.model, 'START_LIGHT_2'),
        getByName(this.model, 'START_LIGHT_3'),
        getByName(this.model, 'START_LIGHT_4'),
        getByName(this.model, 'START_LIGHT_5'),
      ],
    }

    this.#startLights = [
      this.part.startLights[0].material as MeshStandardMaterial,
      this.part.startLights[1].material as MeshStandardMaterial,
      this.part.startLights[2].material as MeshStandardMaterial,
      this.part.startLights[3].material as MeshStandardMaterial,
      this.part.startLights[4].material as MeshStandardMaterial,
    ]
  }

  contactDetector(_delta: number) {
    
    const {wheel, body} = this.vehicle.part.collision

    const wheelFrontLeftOnChicanes = detectContact(wheel.front.left, this.part.chicanes.children)
    const wheelFrontRightOnChicanes = detectContact(wheel.front.right, this.part.chicanes.children)

    const {chicane} = this.vehicle.sound.part

    if (wheelFrontLeftOnChicanes.length && !chicane.left.isPlaying) {
      chicane.left.play()
    } else if (chicane.left.isPlaying) chicane.left.stop()

    if (wheelFrontRightOnChicanes.length && !chicane.right.isPlaying) {
      chicane.right.play()
    } else if (chicane.right.isPlaying) chicane.right.stop()

    const bodyOutOfTrack = detectContact(body, [this.part.track])

    if (bodyOutOfTrack.length === 0) {
      this.vehicle.applyOutOfTrackPenalty()
    }
  }

  turnOffStartLights() {
    for (const light of this.#startLights) {
      light.emissive.set(0, 0, 0)
    }
  }

  blinkStartLight() {
    return async<void>((resolve) => {
      const dispose = interval((n) => {
        if (n <= 4) {
          this.#startLights[n].emissive.set(1, 0, 0)
        } else {
          this.turnOffStartLights()
          resolve(dispose())
        }
      })
    })
  }

  update(delta: number) {
    this.contactDetector(delta)
  }
}

export const loadTrack = (vehicle: Vehicle) => (gltf: GLTF) => {
  return new Track(gltf, vehicle)
}
