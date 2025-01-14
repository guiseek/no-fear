import {loadEngine, loadTrack, loadVehicle} from './entities'
import {Camera, Input, Loader, Renderer} from './core'
import {inputMapper} from './mappers'
import {inputState} from './infra'
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
  SpotLight,
} from 'three'
import './style.scss'

const scene = new Scene()
// scene.background = new Color(0xffffff)
const clock = new Clock()

const camera = new Camera()

const renderer = new Renderer(app)

const pointLight = new PointLight(0xffffff, 1, 10)
pointLight.lookAt(0, 0, 0)

const dirLight = new DirectionalLight(0xffffff, 1)

const hemiLight = new HemisphereLight(0xffffff, 1)

const spotLight = new SpotLight(0xffffff, 1, 10, 1)
spotLight.lookAt(0, 0, 0)

scene.add(pointLight, dirLight, hemiLight, spotLight)

const input = Input.getInstance()
const loader = Loader.getInstance()

const init = async () => {
  const font = await loader.font.loadAsync(
    'seven-segment-regular.typeface.json'
  )

  const listener = new AudioListener()
  camera.add(listener)

  const engine = await loadEngine(listener)

  const mcLaren = await loader.gltf
    .loadAsync('mclaren.glb')
    .then(loadVehicle(engine, font))

  
  // camera.position.set(0, 1.4, -0.42)
  camera.position.set(0, 1.2, -0.3)
  camera.lookAt(mcLaren.model.position.clone().add(new Vector3(0, -0.8, 12)))
  mcLaren.addCamera(camera)
  // mcLaren.model.position.set(-220, 0, -14)
  mcLaren.model.position.set(0, 0, 1)
  mcLaren.model.rotation.set(0, -1.6, 0)

  const track = await loader.gltf.loadAsync('track.glb').then(loadTrack)
  track.model.scale.setScalar(3)

  scene.add(track.model, mcLaren.model)

  input.on('update', async (state) => {
    const mapped = inputMapper.fromKeyboard(state)
    inputState.setDirections(mapped.directions)
    inputState.setButtons(mapped.buttons)
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

  const animate = () => {
    const delta = clock.getDelta()

    mcLaren.update(delta)

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

input.on('s', (state) => {
  if (state) init()
})
