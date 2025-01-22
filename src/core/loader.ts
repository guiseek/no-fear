import {AudioLoader, TextureLoader} from 'three'
import {create} from '../utils'
import {
  DRACOLoader,
  FontLoader,
  GLTFLoader,
  RGBELoader,
} from 'three/examples/jsm/Addons.js'

export class Loader {
  private static instance: Loader

  gltf: GLTFLoader

  rgbe: RGBELoader

  texture: TextureLoader

  audio: AudioLoader

  font: FontLoader

  static getInstance() {
    if (!this.instance) {
      this.instance = new Loader()
    }

    return this.instance
  }

  private constructor() {
    this.rgbe = new RGBELoader()
    this.rgbe.setPath('envs/')

    this.texture = new TextureLoader()
    this.texture.setPath('textures/')

    this.audio = new AudioLoader()
    this.audio.setPath('sounds/')

    this.font = new FontLoader()
    this.font.setPath('fonts/')

    this.gltf = new GLTFLoader()
    this.gltf.setPath('models/')

    const draco = new DRACOLoader()
    draco.setDecoderPath('js/')

    this.gltf.setDRACOLoader(draco)
  }

  loadGLTF(url: string, name: string) {
    return this.gltf.loadAsync(url, this.#createProgress(name))
  }

  loadEnv(url: string, name: string) {
    return this.rgbe.loadAsync(url, this.#createProgress(name))
  }

  loadTexture(url: string) {
    return this.texture.loadAsync(url)
  }

  loadFont(url: string, name: string) {
    return this.font.loadAsync(url, this.#createProgress(name))
  }

  loadAudio(url: string, name = url) {
    return this.audio.loadAsync(url, this.#createProgress(name))
  }

  static counter: string[] = []

  #createProgress(name: string) {
    Loader.counter.push(name)

    const el = create('progress', {max: 100, value: 0})
    const text = new Text(`${name} - 0%`)
    const item = create('li', {}, el, text)
    progress.appendChild(item)

    return ({loaded, total}: ProgressEvent) => {
      const percent = (loaded / total) * 100
      text.textContent = `${name} - ${percent.toFixed()}%`
      el.value = +percent.toFixed()
      if (el.value > 99) item.remove()
    }
  }
}
