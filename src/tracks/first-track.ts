import {Font, GLTF, TextGeometry} from 'three/examples/jsm/Addons.js'
import {MeshStandardMaterial, Vector3} from 'three'
import {async, formatTime, interval} from '../utils'
import {TrackSound} from './track-sound'
import {TrackPart} from '../interfaces'
import {Vehicle} from '../vehicle'
import {Track} from './track'

export class FirstTrack extends Track<TrackPart, TrackSound> {
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

  constructor(
    gltf: GLTF,
    vehicle: Vehicle,
    readonly trackSound: TrackSound,
    private font: Font
  ) {
    super(gltf, vehicle)

    this.#part = {
      chicanes: this.getByName('CHICANES'),
      ground: {
        grass: this.getByName('GROUND_GRASS'),
        concrete: this.getByName('GROUND_CONCRETE'),
      },
      collision: {
        startLap: this.getByName('START_LAP'),
        finishLap: this.getByName('FINISH_LAP'),
      },
      screenTimes: {
        lapTime: this.getByName('LAP_TIME'),
        bestLapTime: this.getByName('BEST_LAP_TIME'),
      },
      trackLines: this.getByName('TRACK_LINES'),
      track: this.getByName('TRACK'),
      startLightsParent: this.getByName('START_LIGHTS_PARENT'),
      startLights: [
        this.getByName('START_LIGHT_1'),
        this.getByName('START_LIGHT_2'),
        this.getByName('START_LIGHT_3'),
        this.getByName('START_LIGHT_4'),
        this.getByName('START_LIGHT_5'),
      ],
    }

    this.part.collision.startLap.visible = false
    this.part.collision.finishLap.visible = false

    this.#startLights = [
      this.part.startLights[0].material as MeshStandardMaterial,
      this.part.startLights[1].material as MeshStandardMaterial,
      this.part.startLights[2].material as MeshStandardMaterial,
      this.part.startLights[3].material as MeshStandardMaterial,
      this.part.startLights[4].material as MeshStandardMaterial,
    ]
  }

  #setLapTimes() {
    const options = {font: this.font, size: 2, depth: 0, bevelSize: 0.01}

    if (this.currentLapTime !== undefined) {
      const lapTime = `LAP TIME: ${formatTime(this.currentLapTime)}`
      const lapTimeGeometry = new TextGeometry(lapTime, options)
      const {x, y, z} = this.getBoundingBox(lapTimeGeometry)
      lapTimeGeometry.translate(-x + 9, -y, -z)

      this.part.screenTimes.lapTime.geometry.dispose()
      this.part.screenTimes.lapTime.geometry = lapTimeGeometry
      this.part.screenTimes.lapTime.rotateX(-Math.PI / 2)
    }

    if (this.bestLapTime !== Infinity) {
      const bestLapTime = `BEST LAP: ${formatTime(this.bestLapTime)}`
      const bestLapTimeGeometry = new TextGeometry(bestLapTime, options)
      const {x, y, z} = this.getBoundingBox(bestLapTimeGeometry)
      bestLapTimeGeometry.translate(-x + 9, -y, -z)

      this.part.screenTimes.bestLapTime.geometry.dispose()
      this.part.screenTimes.bestLapTime.geometry = bestLapTimeGeometry
      this.part.screenTimes.bestLapTime.rotateX(-Math.PI / 2)
    }
  }

  checkStartLap(position: Vector3) {
    this.raycaster.set(position, this.direction)

    const intersects = this.raycaster.intersectObject(
      this.part.collision.startLap
    )

    if (intersects.length > 0) {
      this.lapStartTime = performance.now()
    }
  }

  checkFinishLap(position: Vector3) {
    if (!this.lapStartTime) {
      console.warn('Lap start time is undefined. Skipping lap detection.')
      return
    }

    this.raycaster.set(position, this.direction)

    const intersects = this.raycaster.intersectObject(
      this.part.collision.finishLap
    )

    if (intersects.length > 0) {
      this.currentLapTime = (performance.now() - this.lapStartTime) / 1000

      if (this.currentLapTime < this.bestLapTime) {
        this.bestLapTime = this.currentLapTime
      }

      this.#setLapTimes()

      this.lapStartTime = undefined
    }
  }

  contactDetector(_delta: number) {
    const {wheel, body} = this.vehicle.part.collision

    const wheelFrontLeftOnChicanes = this.detectContact(
      wheel.front.left,
      this.part.chicanes.children
    )
    const wheelFrontRightOnChicanes = this.detectContact(
      wheel.front.right,
      this.part.chicanes.children
    )

    if (
      wheelFrontLeftOnChicanes.length &&
      !this.trackSound.chicane.left.isPlaying
    ) {
      
      
      console.log('chicane left play');
      this.trackSound.chicane.left.play()
    } else if (this.trackSound.chicane.left.isPlaying)
      console.log('chicane left stop');
      this.trackSound.chicane.left.stop()
      
      if (
        wheelFrontRightOnChicanes.length &&
        !this.trackSound.chicane.right.isPlaying
      ) {
        console.log('chicane right play');
        this.trackSound.chicane.right.play()
      } else if (this.trackSound.chicane.right.isPlaying)
        console.log('chicane right stop');
      this.trackSound.chicane.right.stop()

    const bodyOutOfTrack = this.detectContact(body, [this.part.track])

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
          this.trackSound.startLight.play()
        } else {
          this.turnOffStartLights()
          resolve(dispose())
        }
      })
    })
  }

  update(delta: number) {
    this.contactDetector(delta)

    const {position} = this.vehicle.model

    if (!this.lapStartTime) {
      this.checkStartLap(position)
    } else {
      this.checkFinishLap(position)
    }
  }
}

export const loadFirstTrack = (
  vehicle: Vehicle,
  trackSound: TrackSound,
  font: Font
) => {
  return (gltf: GLTF) => {
    return new FirstTrack(gltf, vehicle, trackSound, font)
  }
}
