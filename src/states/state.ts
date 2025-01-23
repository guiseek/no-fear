import {normalizeKey} from '../utils'

export type GameStateAction = 'start' | 'pause' | 'restart'

export interface GameState {
  get paused(): boolean
  get started(): boolean
}

export class State implements GameState {
  #paused = false

  get paused() {
    return this.#paused
  }

  #started = false

  get started() {
    return this.#started
  }

  #subscribers = new Map<GameStateAction, Set<VoidFunction>>()

  constructor() {
    addEventListener('keydown', this.#onKey)
  }

  on(action: GameStateAction, callback: VoidFunction) {
    const subscribers = this.#getSubscribers(action)
    this.#subscribers.set(action, subscribers.add(callback))
  }

  #onKey = ({code}: KeyboardEvent) => {
    const key = normalizeKey(code)
    if (key === 's') this.#start()
    if (key === 'p') this.#pause()
    if (key === 'r') this.#restart()
  }

  #start() {
    for (const cb of this.#getSubscribers('start')) cb()
    this.#started = true
  }

  #pause() {
    this.#paused = !this.#paused
    for (const cb of this.#getSubscribers('pause')) cb()
  }

  #restart() {
    for (const cb of this.#getSubscribers('restart')) cb()
  }

  #getSubscribers(action: GameStateAction): Set<VoidFunction> {
    return this.#subscribers.get(action) ?? new Set()
  }
}
