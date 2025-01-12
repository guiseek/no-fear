import {Callback, EventEmitter} from '../utils'

export type DirectionKey = 'up' | 'right' | 'down' | 'left'

export type EventKey = 'p' | 'b'

export type Directions = Record<DirectionKey, boolean>
export type EventKeys = Record<EventKey, boolean>

export type InputState = Directions & EventKeys

interface InputEventMap {
  update: InputState
  p: boolean
  b: boolean
  up: boolean
  right: boolean
  down: boolean
  left: boolean
}

export class Input {
  private static instance: Input

  #state = {
    up: false,
    right: false,
    down: false,
    left: false,
    p: false,
    b: false
  }

  get state() {
    return this.#state
  }

  #emitter = new EventEmitter<InputEventMap>()

  static getInstance() {
    if (!this.instance) {
      this.instance = new Input()
    }

    return this.instance
  }

  private constructor() {
    onkeydown = this.#onKeyDown
    onkeyup = this.#onKeyUp
  }

  #onKeyDown = ({code}: KeyboardEvent) => {
    const key = this.#normalize(code)

    if (this.#isKeyCode(key)) {
      this.#state[key] = true
      this.#emitter.emit(key, true)
      this.#emitter.emit('update', this.state)
    }
  }

  #onKeyUp = ({code}: KeyboardEvent) => {
    const key = this.#normalize(code)

    if (this.#isKeyCode(key)) {
      this.#state[key] = false
      this.#emitter.emit(key, false)
      this.#emitter.emit('update', this.state)
    }
  }

  on<K extends keyof InputEventMap>(
    event: K,
    callback: Callback<InputEventMap[K]>
  ) {
    this.#emitter.on(event, callback)
  }

  #isKeyCode(key: string): key is EventKey {
    return ['p', 'b', 'up', 'right', 'down', 'left'].includes(key)
  }

  #normalize(code: string) {
    return code
      .replace('Arrow', '')
      .replace('Key', '')
      .replace('Digit', '')
      .toLowerCase()
  }
}
