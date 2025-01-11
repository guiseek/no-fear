import {Camera, Input, Loader, Renderer} from './core'
import {loadEngineSound, EngineSound} from './infra'
import {loadTrack, loadVehicle} from './entities'
import {inner} from './utils'
import {
  Clock,
  Scene,
  Vector3,
  HemisphereLight,
  DirectionalLight,
  AudioListener,
  PointLight,
} from 'three'
import './style.scss'

const scene = new Scene()
const clock = new Clock()

const camera = new Camera()

const renderer = new Renderer(app)

const pointLight = new PointLight(0xffffff, 1, 10)
scene.add(pointLight)

const dirLight = new DirectionalLight(0xffffff, 1)
scene.add(dirLight)

const hemiLight = new HemisphereLight(0xffffff, 1)
scene.add(hemiLight)

const loader = Loader.getInstance()

const input = Input.getInstance()

const mcLaren = await loader.gltf
  .loadAsync('mclaren-mp45.glb')
  .then(loadVehicle)

const track = await loader.gltf.loadAsync('track.glb').then(loadTrack)

// camera.position.set(0, 0.9, 0.2)
camera.position.set(0, 1.1, -0.3)
camera.lookAt(mcLaren.model.position.clone().add(new Vector3(0, -0.8, 12)))
mcLaren.addCamera(camera)
scene.add(mcLaren.model)

track.model.scale.setScalar(3)
scene.add(track.model)

const audioListener = new AudioListener()
camera.add(audioListener)

let engineSound: EngineSound

input.on('s', async () => {
  if (!engineSound) {
    engineSound = await loadEngineSound(audioListener)
    engineSound.start()
  } else {
    input.on('p', () => {
      engineSound.pause()
    })
  }
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
