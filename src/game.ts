import {
  Engine,
  loadEngine,
  loadSound,
  loadTrack,
  loadVehicle,
  Sound,
  Vehicle,
} from './entities'
import {Camera, Input, Loader, Renderer} from './core'
import {Font} from 'three/examples/jsm/Addons.js'
import {Updatable} from './interfaces'
import {inputMapper} from './mappers'
import {inputState} from './infra'
import {control} from './config'
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
  HemisphereLight,
  DirectionalLight,
  MeshBasicMaterial,
  EquirectangularReflectionMapping,
} from 'three'

const chicaneSound = () => {
  const ctx = new AudioContext()
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  osc1.frequency.value = 500
  osc2.frequency.value = 800
  const gain = ctx.createGain()
  gain.gain.value = 0

  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(ctx.destination)

  osc1.start()
  osc2.start()
}

export class Game {
  scene = new Scene()
  clock = new Clock()

  camera = new Camera()

  renderer = new Renderer(app)

  pointLight = new PointLight(0xffffff, 1, 10)
  dirLight = new DirectionalLight(0xffffff, 1)
  hemiLight = new HemisphereLight(0xffffff, 1)
  spotLight = new SpotLight(0xffffff, 1, 10, 1)

  #sky!: Mesh

  input = Input.getInstance()
  loader = Loader.getInstance()

  #started = false

  #updatables = new Set<Updatable>()

  // #animateRef = -1

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

  async loadAll() {
    await this.loadBackgroundEnvironment()

    const listener = new AudioListener()
    this.camera.add(listener)

    const engine = await this.loadEngine(listener)

    const sound = await this.loadSound(listener)

    const font = await this.loadFont()

    const mcLaren = await this.loadMcLaren(engine, sound, font)

    const track = await this.loadTrack(mcLaren)

    this.scene.add(track.model, mcLaren.model)

    track.blinkStartLight().then(() => {
      chicaneSound()
      console.log('brup')
    })
  }

  initialize = async () => {
    this.#animate()

    this.input.on('update', async (state) => {
      const mapped = inputMapper.fromKeyboard(state)
      inputState.setDirections(mapped.directions)
      inputState.setButtons(mapped.buttons)
    })

    addEventListener('resize', () => {
      this.camera.aspect = inner.ratio
      this.camera.updateProjectionMatrix()
      this.renderer.setPixelRatio(devicePixelRatio)
      this.renderer.setSize(inner.width, inner.height)
    })

    addEventListener('gamepadconnected', async () => {
      control.onGamepad = (_, gamepad) => {
        if (gamepad) {
          const mapped = inputMapper.fromGamepad(gamepad)
          inputState.setDirections(mapped.directions)
          inputState.setButtons(mapped.buttons)
        }
      }

      control.run()
    })
  }

  #animate = () => {
    const delta = this.clock.getDelta()

    for (const updatable of this.#updatables) {
      updatable.update(delta)
    }

    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.#animate)
  }

  // #cancelAnimation = () => {
  //   cancelAnimationFrame(this.#animateRef)
  // }

  async loadTrack(vehicle: Vehicle) {
    const track = await this.loader
      .loadGLTF('track2.glb', 'Track model')
      .then(loadTrack(vehicle))

    this.#updatables.add(track)

    return track
  }

  async loadMcLaren(engine: Engine, sound: Sound, font: Font) {
    const mcLaren = await this.loader
      .loadGLTF('mclaren.glb', 'McLaren model')
      .then(loadVehicle(engine, sound, font))

    this.#updatables.add(mcLaren)

    this.camera.position.set(0, 1.2, -0.3)
    this.camera.lookAt(
      mcLaren.model.position.clone().add(new Vector3(0, -0.8, 12))
    )

    mcLaren.addCamera(this.camera)

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

  async loadEngine(listener: AudioListener) {
    return loadEngine(listener)
  }

  async loadSound(listener: AudioListener) {
    return loadSound(listener)
  }

  async loadBackgroundEnvironment() {
    const map = await this.loader.loadEnv(
      'puresky_quarry_2k.hdr',
      'Sky environment scene'
    )

    map.mapping = EquirectangularReflectionMapping

    const side = BackSide
    const geometry = new SphereGeometry(5000, 60, 60)
    const material = new MeshBasicMaterial({map, side})
    this.#sky = new Mesh(geometry, material)

    this.scene.add(this.#sky)
  }
}
