import {FirstTrack, loadFirstTrack, TrackSound} from './tracks'
import {Camera, Input, Loader, Renderer, use} from './core'
import {Engine, Vehicle, McLarenMP4} from './vehicle'
import {GearConfig, Updatable} from './interfaces'
import {Font} from 'three/examples/jsm/Addons.js'
import {createLoadQueue} from './factories'
import {Action, State} from './states'
import {inputMapper} from './mappers'
import {delay, inner} from './utils'
import {control} from './config'
import {
  Mesh,
  Scene,
  Clock,
  Audio,
  Vector3,
  BackSide,
  SpotLight,
  PointLight,
  AudioListener,
  SphereGeometry,
  RepeatWrapping,
  HemisphereLight,
  DirectionalLight,
  MeshBasicMaterial,
  EquirectangularReflectionMapping,
} from 'three'

export class Game {
  scene = new Scene()
  clock = new Clock()
  camera = new Camera()
  renderer = new Renderer(app)
  pointLight = new PointLight(0xffffff, 1, 10)
  dirLight = new DirectionalLight(0xffffff, 1)
  hemiLight = new HemisphereLight(0xffffff, 1)
  spotLight = new SpotLight(0xffffff, 1, 10, 1)

  #sky?: Mesh

  input = Input.getInstance()
  loader = Loader.getInstance()

  #updatables = new Set<Updatable>()

  action = use(Action)

  state = use(State)

  #running = false

  constructor() {
    this.spotLight.position.x = 20
    this.pointLight.lookAt(0, 0, 0)
    this.spotLight.lookAt(0, 0, 0)

    this.scene.add(
      this.pointLight,
      this.dirLight,
      this.hemiLight,
      this.spotLight
    )

    start.hidden = false

    this.init()
  }

  async init() {
    const resources = await createLoadQueue({
      gltf: [
        ['mc-laren-mp4.glb', 'McLaren model'],
        ['track.glb', 'Track model'],
      ],
      audio: [
        ['chicane.wav', 'Chicane sound'],
        ['start-light.wav', 'Start light'],
        ['start.wav', 'Start sound'],
        ['running.wav', 'Running sound'],
        ['checkpoint.wav', 'Checkpoint sound'],
        ['lap-time.wav', 'Lap time sound'],
        ['best-lap-time.wav', 'Best lap time sound'],
      ],
      font: [['seven-segment-regular.typeface.json', 'Seven segment font']],
      texture: [['afternoon_sky.jpeg']],
    })

    const [mcLarenModel, trackModel] = resources.gltf
    const [
      chicane,
      startLight,
      startBuffer,
      runningBuffer,
      checkpoint,
      lapTime,
      bestLapTime,
    ] = resources.audio

    const [sevenSegment] = resources.font
    const [map] = resources.texture

    console.log(resources)

    this.state.on('start', async () => {
      if (!this.state.started) {
        map.repeat.set(8, 4)
        map.flipY = false
        map.premultiplyAlpha = true
        map.wrapS = RepeatWrapping
        map.wrapT = RepeatWrapping
        map.mapping = EquirectangularReflectionMapping

        const side = BackSide
        const geometry = new SphereGeometry(6000, 60, 60)
        const material = new MeshBasicMaterial({map, side})
        this.#sky = new Mesh(geometry, material)
        this.scene.add(this.#sky)

        const listener = new AudioListener()
        this.camera.add(listener)

        {
          const start = new Audio(listener)
          start.setBuffer(startBuffer)
          start.setVolume(0.2)
          start.setLoop(false)
          start.play()

          await delay(1600)

          const running = new Audio(listener)
          running.setBuffer(runningBuffer)
          running.setVolume(0.2)
          running.setLoop(true)
          running.play()

          const gears: GearConfig[] = [
            // 0ª
            {
              audio: running,
              rpm: {min: 0, max: 10},
              rate: {min: 0.8, max: 0.9},
            },
            // 1ª
            {
              audio: running,
              rpm: {min: 10, max: 1000},
              rate: {min: 0.8, max: 1.2},
            },
            // 2ª
            {
              audio: running,
              rpm: {min: 1000, max: 2200},
              rate: {min: 1, max: 1.2},
            },
            // 3ª
            {
              audio: running,
              rpm: {min: 2200, max: 3600},
              rate: {min: 1, max: 1.4},
            },
            // 4ª
            {
              audio: running,
              rpm: {min: 3600, max: 5200},
              rate: {min: 1, max: 1.4},
            },
            // 5ª
            {
              audio: running,
              rpm: {min: 5200, max: 7500},
              rate: {min: 1, max: 1.4},
            },
            // 6ª
            {
              audio: running,
              rpm: {min: 7500, max: 12000},
              rate: {min: 1, max: 1.6},
            },
          ]

          const engine = new Engine({start, gears})

          const trackSound = new TrackSound(listener, {
            chicane,
            startLight,
            checkpoint,
            lapTime,
            bestLapTime,
          })

          /**
           * McLaren
           */
          const mcLaren = new McLarenMP4(
            mcLarenModel,
            this.action,
            engine,
            trackSound,
            sevenSegment
          )

          this.#updatables.add(mcLaren)

          this.camera.lookAt(
            mcLaren.model.position.clone().add(new Vector3(0, -0.8, 12))
          )

          mcLaren.model.add(this.camera)

          this.state.on('restart', () => {
            if (this.state.started) {
              mcLaren.reset()
            }
          })

          /**
           * Track
           */
          const track = new FirstTrack(
            trackModel,
            mcLaren,
            trackSound,
            sevenSegment
          )

          this.#updatables.add(track)

          this.scene.add(track.model, mcLaren.model)

          track.blinkStartLight().then(() => {
            this.#running = true
          })

          this.#animate()

          this.input.on('update', async (state) => {
            const mapped = inputMapper.fromKeyboard(state)
            this.action.setAxis(mapped.directions)
            this.action.setButton(mapped.buttons)
          })

          window.addEventListener('resize', () => {
            this.camera.aspect = inner.ratio
            this.camera.updateProjectionMatrix()
            this.renderer.setPixelRatio(devicePixelRatio)
            this.renderer.setSize(inner.width, inner.height)
          })

          addEventListener('gamepadconnected', async () => {
            control.onGamepad = (_, gamepad) => {
              if (gamepad) {
                const mapped = inputMapper.fromGamepad(gamepad)
                this.action.setAxis(mapped.directions)
                this.action.setButton(mapped.buttons)
              }
            }

            control.run()
          })
        }

        start.remove()
      }
    })
  }

  #animate = () => {
    requestAnimationFrame(this.#animate)

    if (this.state.paused) return

    const delta = this.clock.getDelta()

    if (this.#running) {
      for (const updatable of this.#updatables) {
        updatable.update(delta)
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  async loadTrack(vehicle: Vehicle, font: Font, trackSound: TrackSound) {
    const track = await this.loader
      .loadGLTF('track.glb', 'Track model')
      .then(loadFirstTrack(vehicle, trackSound, font))

    this.#updatables.add(track)

    return track
  }
}
