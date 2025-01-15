import {loadEngine, loadTrack, loadVehicle} from './entities'
import {Camera, Input, Loader, Renderer} from './core'
import {Updatable} from './interfaces'
import {inputMapper} from './mappers'
import {inputState} from './infra'
import {control} from './config'
import {inner} from './utils'
import {
  Scene,
  Clock,
  Vector3,
  SpotLight,
  PointLight,
  HemisphereLight,
  DirectionalLight,
  AudioListener,
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

  input = Input.getInstance()
  loader = Loader.getInstance()

  #started = false

  #updatables = new Set<Updatable>()

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
    const listener = new AudioListener()
    this.camera.add(listener)

    const engine = await loadEngine(listener)

    const font = await this.loader.loadFont(
      'seven-segment-regular.typeface.json',
      'Seven segment font'
    )

    const mcLaren = await this.loader
      .loadGLTF('mclaren.glb', 'McLaren model')
      .then(loadVehicle(engine, font))

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

    const track = await this.loader
      .loadGLTF('track.glb', 'Track model')
      .then(loadTrack)

    track.model.scale.setScalar(3)

    this.scene.add(track.model, mcLaren.model)
  }

  initialize = async () => {
    const animate = () => {
      const delta = this.clock.getDelta()

      for (const updatable of this.#updatables) {
        updatable.update(delta)
      }

      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(animate)
    }

    animate()

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
}
