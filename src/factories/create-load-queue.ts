import {AudioLoader, Texture, TextureLoader} from 'three'
import {Font, FontLoader, GLTF, GLTFLoader} from 'three/examples/jsm/Addons.js'
import {async, create, entries} from '../utils'

export type LoadQueueItem = [string, string?]

export interface LoadQueueMap {
  gltf: LoadQueueItem[]
  font: LoadQueueItem[]
  audio: LoadQueueItem[]
  texture: LoadQueueItem[]
}

export interface LoadQueueResponse {
  gltf: GLTF[]
  font: Font[]
  audio: AudioBuffer[]
  texture: Texture[]
}

const createProgress = (name: string) => {
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

const loader = {
  gltf: new GLTFLoader().setPath('models/'),
  font: new FontLoader().setPath('fonts/'),
  audio: new AudioLoader().setPath('sounds/'),
  texture: new TextureLoader().setPath('textures/'),
}

function createQueue<K extends keyof LoadQueueMap>(
  type: K,
  queue: LoadQueueMap[K]
) {
  return queue.map(([file, text]) => {
    const progress = text ? createProgress(text) : () => {}
    return loader[type].loadAsync(file, progress)
  })
}

export const createLoadQueue = async (queueMap: LoadQueueMap) => {
  return async<LoadQueueResponse>(async (resolve) => {
    const resolvedEntries = await Promise.all(
      entries(queueMap).map(async ([type, queue]) => {
        const resolvedQueue = await Promise.all(createQueue(type, queue))
        return [type, resolvedQueue]
      })
    )

    resolve(Object.fromEntries(resolvedEntries))
  })
}
