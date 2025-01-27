import {Font, GLTF, TextGeometry} from 'three/examples/jsm/Addons.js'
import {FirstTrackPartMap} from './first-track-part-map'
import {async, formatTime, interval} from '../../utils'
import {MeshStandardMaterial, Vector3} from 'three'
import {FirstTrackPart} from './first-track-part'
import {TrackSettings, VehiclePartMap} from '../../interfaces'
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

  settings: TrackSettings = {
    checkpoints: new Set<string>(),
    laps: 4,
  }

  constructor(
    gltf: GLTF,
    vehicle: Vehicle<VehiclePartMap>,
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
      trackBoxes: this.getByName(FirstTrackPart.TrackBoxes),
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
      this.settings.checkpoints.add(checkpoint.name)
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
    if (this.state.currentLap >= this.settings.laps) {
      return
    }

    this.raycaster.set(position, this.direction)

    const intersects = this.raycaster.intersectObjects(
      this.part.collision.checkpoints.children,
      false
    )

    if (intersects.length > 0) {
      const [{object}] = intersects
      if (!this.state.checkpointCompleted.has(object.name)) {
        this.state.checkpointCompleted.add(object.name)
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

    if (this.state.checkpointCompleted.size < this.settings.checkpoints.size) {
      return
    }

    this.raycaster.set(position, this.direction)

    const intersects = this.raycaster.intersectObject(
      this.part.collision.finishLap,
      false
    )

    if (this.state.currentLap < this.settings.laps && intersects.length > 0) {
      this.state.currentLap += 1
      this.state.checkpointCompleted.clear()
    }

    if (this.state.currentLap === this.settings.laps) {
      this.vehicle.setMaxSpeed(100)

      this.currentLapTime = (performance.now() - this.lapStartTime) / 1000

      if (this.currentLapTime < this.bestLapTime) {
        this.bestLapTime = this.currentLapTime
        this.trackSound.victoryTheme.play()
        this.vehicle.celebrate()
      } else {
        this.trackSound.victoryTheme.play()
      }

      this.#setLapTimes()

      this.lapStartTime = undefined
    }
  }

  contactDetector(_delta: number) {
    const {wheel, body} = this.vehicle.part.collision

    const wheelFrontLeftOnChicanes = this.detectContact(wheel.front.left, [
      this.part.chicanes.children[1],
    ])
    const wheelFrontRightOnChicanes = this.detectContact(wheel.front.right, [
      this.part.chicanes.children[0],
    ])

    if (
      wheelFrontLeftOnChicanes.length &&
      !this.vehicle.vehicleSound.chicane.left.isPlaying
    ) {
      this.vehicle.vehicleSound.chicane.left.play()
    } else if (this.vehicle.vehicleSound.chicane.left.isPlaying)
      this.vehicle.vehicleSound.chicane.left.stop()

    if (
      wheelFrontRightOnChicanes.length &&
      !this.vehicle.vehicleSound.chicane.right.isPlaying
    ) {
      this.vehicle.vehicleSound.chicane.right.play()
    } else if (this.vehicle.vehicleSound.chicane.right.isPlaying)
      this.vehicle.vehicleSound.chicane.right.stop()

    const bodyOutOfTrack = this.detectContact(body, [
      this.part.track,
      this.part.trackBoxes,
    ])

    if (bodyOutOfTrack.length === 0) {
      this.vehicle.applyOutOfTrackPenalty()
    }
  }

  checkBoxes(position: Vector3) {
    this.raycaster.set(position, this.direction)

    const intersects = this.raycaster.intersectObject(
      this.part.trackBoxes,
      false
    )

    if (this.vehicle.currentMaxSpeed === 360 && intersects.length) {
      this.vehicle.setMaxSpeed(120)
    } else if (this.vehicle.currentMaxSpeed === 120 && !intersects.length) {
      this.vehicle.setMaxSpeed(360)
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
      this.checkBoxes(position)
      this.checkFinishLap(position)
    }
  }
}

export const loadFirstTrack = (
  vehicle: Vehicle<VehiclePartMap>,
  trackSound: TrackSound,
  font: Font
) => {
  return (gltf: GLTF) => {
    return new FirstTrack(gltf, vehicle, trackSound, font)
  }
}
