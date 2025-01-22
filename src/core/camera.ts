import {PerspectiveCamera, Vector3} from 'three'
import {normalizeKey} from '../utils'
import {inner} from '../utils/inner'

export type CameraActive = 'drone' | 'gopro'

export class Camera extends PerspectiveCamera {
  #positions = {
    drone: new Vector3(0, 4.2, -12.3),
    gopro: new Vector3(0, 1.32, -0.26),
  }

  #active: CameraActive = 'gopro'

  constructor() {
    super(45, inner.ratio, 0.1, 10000)

    this.setActive(this.#active)

    addEventListener('keydown', ({code}) => {
      const key = normalizeKey(code)
      if (key === 'v') {
        this.#active = this.#active === 'gopro' ? 'drone' : 'gopro'
        this.setActive(this.#active)
      }
    })
  }

  setActive(camera: CameraActive) {
    this.position.copy(this.#positions[camera])
  }
}
