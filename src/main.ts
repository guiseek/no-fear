import {loadEngineSound, EngineSound, inputState} from './infra'
import {Camera, Input, Loader, Renderer} from './core'
import {loadTrack, loadVehicle} from './entities'
import {inputMapper} from './mappers'
import {control} from './config'
import {inner} from './utils'
import {
  Clock,
  Scene,
  Vector3,
  PointLight,
  HemisphereLight,
  DirectionalLight,
  AudioListener,
} from 'three'
import './style.scss'

const scene = new Scene()
const clock = new Clock()

const camera = new Camera()

const renderer = new Renderer(app)

const pointLight = new PointLight(0xffffff, 1, 10)
const dirLight = new DirectionalLight(0xffffff, 1)
const hemiLight = new HemisphereLight(0xffffff, 1)
scene.add(pointLight, dirLight, hemiLight)

const input = Input.getInstance()
const loader = Loader.getInstance()

const init = async () => {
  const mcLaren = await loader.gltf.loadAsync('mclaren.glb').then(loadVehicle)

  // camera.position.set(0, 0.9, 0.2)
  camera.position.set(0, 1.1, -0.3)
  camera.lookAt(mcLaren.model.position.clone().add(new Vector3(0, -0.8, 12)))
  mcLaren.addCamera(camera)
  mcLaren.model.position.set(-220, 0, -14)
  mcLaren.model.rotation.set(0, -1.6, 0)

  const track = await loader.gltf.loadAsync('track.glb').then(loadTrack)
  track.model.scale.setScalar(3)

  scene.add(track.model, mcLaren.model)

  const listener = new AudioListener()
  camera.add(listener)

  let engineSound: EngineSound

  input.on('update', async (state) => {
    if (!engineSound) {
      engineSound = await loadEngineSound(listener)
    }

    const mapped = inputMapper.fromKeyboard(state)
    inputState.setDirections(mapped.directions)
    inputState.setButtons(mapped.buttons)
  })

  input.on('p', () => {
    if (engineSound) {
      engineSound.pause()
    }
  })

  addEventListener('gamepadconnected', async () => {
    if (!engineSound) {
      engineSound = await loadEngineSound(listener)
    }

    control.onGamepad = (_, gamepad) => {
      if (gamepad) {
        const mapped = inputMapper.fromGamepad(gamepad)
        inputState.setDirections(mapped.directions)
        inputState.setButtons(mapped.buttons)
      }
    }

    control.run()
  })

  const animate = () => {
    const delta = clock.getDelta()

    mcLaren.update(delta)

    if (engineSound) {
      engineSound.update(mcLaren.state.rpm)
    }

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate()

  addEventListener('resize', () => {
    camera.aspect = inner.ratio
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(devicePixelRatio)
    renderer.setSize(inner.width, inner.height)
  })
}

init()
