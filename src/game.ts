import {Engine, loadEngine, loadMcLarenMP4, Vehicle} from './vehicle'
import {loadFirstTrack, loadTrackSound, TrackSound} from './tracks'
import {Camera, Input, Loader, Renderer, use} from './core'
import {Font} from 'three/examples/jsm/Addons.js'
import {Updatable} from './interfaces'
import {inputMapper} from './mappers'
import {control} from './config'
import {Action} from './states'
import {inner} from './utils'
import {
  Mesh,
  Scene,
  Clock,
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

  #started = false

  #paused = false

  action = use(Action)

  #running = false

  constructor() {
    this.pointLight.lookAt(0, 0, 0)
    this.spotLight.lookAt(0, 0, 0)

    this.scene.add(
      this.pointLight,
      this.dirLight,
      this.hemiLight,
      this.spotLight
    )

    start.hidden = false

    this.input.on('s', (state) => {
      if (state && !this.#started) {
        this.loadAll().then(() => {
          this.initialize()
          this.#started = true
          start.remove()
        })
      }
    })
  }

  pause() {
    this.#paused = !this.#paused
  }

  async loadAll() {
    await this.loadBackgroundEnvironment()

    const listener = new AudioListener()
    this.camera.add(listener)

    const engine = await loadEngine(listener)

    const sound = await loadTrackSound(listener)

    const font = await this.loadFont()

    const mcLaren = await this.loadMcLaren(this.action, engine, sound, font)

    const track = await this.loadTrack(mcLaren, font, listener)

    this.scene.add(track.model, mcLaren.model)

    track.blinkStartLight().then(() => {
      this.#running = true
    })
  }

  initialize = async () => {
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

  #animate = () => {
    requestAnimationFrame(this.#animate)

    if (this.#paused) return

    const delta = this.clock.getDelta()

    if (this.#running) {
      for (const updatable of this.#updatables) {
        updatable.update(delta)
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  async loadTrack(vehicle: Vehicle, font: Font, listener: AudioListener) {
    const trackSound = await loadTrackSound(listener)

    const track = await this.loader
      .loadGLTF('track.glb', 'Track model')
      .then(loadFirstTrack(vehicle, trackSound, font))

    this.#updatables.add(track)

    return track
  }

  async loadMcLaren(
    action: Action,
    engine: Engine,
    sound: TrackSound,
    font: Font
  ) {
    const mcLaren = await this.loader
      .loadGLTF('mclaren.glb', 'McLaren model')
      .then(loadMcLarenMP4(action, engine, sound, font))

    this.#updatables.add(mcLaren)

    this.camera.position.set(0, 1.2, -0.3)
    this.camera.lookAt(
      mcLaren.model.position.clone().add(new Vector3(0, -0.8, 12))
    )

    mcLaren.model.add(this.camera)

    mcLaren.model.position.set(0, 0, 1)
    mcLaren.model.rotation.set(0, -1.6, 0)

    this.input.on('r', (state) => {
      if (state && this.#started) {
        mcLaren.crash()
        mcLaren.model.position.set(0, 0, 1)
        mcLaren.model.rotation.set(0, -1.6, 0)
      }
    })

    return mcLaren
  }

  async loadFont() {
    return this.loader.loadFont(
      'seven-segment-regular.typeface.json',
      'Seven segment font'
    )
  }

  async loadBackgroundEnvironment() {
    const map = await this.loader.loadTexture(
      'sky.jpg',
      'Sky night texture'
    )
    map.repeat.set(12, 12) // Ajuste os valores para controlar a repetição (4x4 neste caso).
    map.wrapS = RepeatWrapping
    map.wrapT = RepeatWrapping
    map.mapping = EquirectangularReflectionMapping

    const side = BackSide
    const geometry = new SphereGeometry(6000, 60, 60)
    const material = new MeshBasicMaterial({map, side, color: 0x333333})
    this.#sky = new Mesh(geometry, material)
    this.scene.add(this.#sky)
  }
}
