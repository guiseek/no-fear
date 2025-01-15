import {ACESFilmicToneMapping, PCFSoftShadowMap, WebGLRenderer} from 'three'

export class Renderer extends WebGLRenderer {
  constructor(container: HTMLElement) {
    super({antialias: true})
    this.setClearColor(0x7ec7df)
    this.setPixelRatio(devicePixelRatio)
    this.setSize(innerWidth, innerHeight)
    this.shadowMap.enabled = true
    this.shadowMap.type = PCFSoftShadowMap
    this.toneMapping = ACESFilmicToneMapping
    container.appendChild(this.domElement)
  }
}
