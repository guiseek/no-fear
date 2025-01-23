import {Font, GLTF, TextGeometry} from 'three/examples/jsm/Addons.js'
import {FirstTrackPartMap} from './first-track-part-map'
import {async, formatTime, interval} from '../../utils'
import {MeshStandardMaterial, Vector3} from 'three'
import {FirstTrackPart} from './first-track-part'
import {TrackSound} from '../track-sound'
import {Vehicle} from '../../vehicle'
import {Track} from '../track'

export class FirstTrack extends Track<FirstTrackPartMap, TrackSound> {
  #part: FirstTrackPartMap

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

  checkpoints = new Set<string>()

  checkpointCompleted = new Set<string>()

  constructor(
    gltf: GLTF,
    vehicle: Vehicle,
    readonly trackSound: TrackSound,
    private font: Font
  ) {
    super(gltf, vehicle)

    this.#part = {
      chicanes: this.getByName(FirstTrackPart.Chicanes),
      ground: {
        grass: this.getByName(FirstTrackPart.GroundGrass),
        concrete: this.getByName(FirstTrackPart.GroundConcrete),
      },
      collision: {
        startLap: this.getByName(FirstTrackPart.CollisionStartLap),
        finishLap: this.getByName(FirstTrackPart.CollisionFinishLap),
        checkpoints: this.getByName(FirstTrackPart.CheckpointParent),
      },
      screenTimes: {
        lapTime: this.getByName(FirstTrackPart.ScreenLapTime),
        bestLapTime: this.getByName(FirstTrackPart.ScreenBestLapTime),
      },
      trackLines: this.getByName(FirstTrackPart.TrackLines),
      track: this.getByName(FirstTrackPart.Track),
      startLightsParent: this.getByName(FirstTrackPart.StartLightsParent),
      startLights: [
        this.getByName(FirstTrackPart.StartLight1),
        this.getByName(FirstTrackPart.StartLight2),
        this.getByName(FirstTrackPart.StartLight3),
        this.getByName(FirstTrackPart.StartLight4),
        this.getByName(FirstTrackPart.StartLight5),
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

    for (const checkpoint of this.part.collision.checkpoints.children) {
      this.checkpoints.add(checkpoint.name)
      checkpoint.visible = false
    }
  }

  #setLapTimes() {
    const options = {font: this.font, size: 2, depth: 0, bevelSize: 0.01}

    if (this.currentLapTime) {
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

  checkpoint(position: Vector3) {
    this.raycaster.set(position, this.direction)

    const intersects = this.raycaster.intersectObjects(
      this.part.collision.checkpoints.children,
      false
    )

    if (intersects.length > 0) {
      const [{object}] = intersects
      if (!this.checkpointCompleted.has(object.name)) {
        this.checkpointCompleted.add(object.name)
        this.trackSound.checkpoint.play()
      }
    }
  }

  checkStartLap(position: Vector3) {
    this.raycaster.set(position, this.direction)

    const intersects = this.raycaster.intersectObject(
      this.part.collision.startLap,
      false
    )

    if (intersects.length > 0) {
      this.lapStartTime = performance.now()
    }
  }

  checkFinishLap(position: Vector3) {
    if (!this.lapStartTime) {
      console.warn(`Lap start time is undefined. Skipping lap detection.`)
      return
    }

    this.raycaster.set(position, this.direction)

    const intersects = this.raycaster.intersectObject(
      this.part.collision.finishLap,
      false
    )

    if (intersects.length > 0) {
      this.currentLapTime = (performance.now() - this.lapStartTime) / 1000

      if (this.currentLapTime < this.bestLapTime) {
        this.bestLapTime = this.currentLapTime
        this.trackSound.bestLapTime.play()
      } else {
        this.trackSound.lapTime.play()

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
      this.trackSound.chicane.left.play()
    } else if (this.trackSound.chicane.left.isPlaying)
    this.trackSound.chicane.left.stop()

    if (
      wheelFrontRightOnChicanes.length &&
      !this.trackSound.chicane.right.isPlaying
    ) {
      this.trackSound.chicane.right.play()
    } else if (this.trackSound.chicane.right.isPlaying)
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
      this.checkpoint(position)
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
