import {Control, ControlAnimation, ControlCallback} from './control'

export class GamepadControl implements Control {
  #animations: ControlAnimation[] = []

  #onGamepads: ControlCallback[] = []
  set onGamepad(cb: ControlCallback) {
    this.#onGamepads.push(cb)
  }

  get paused() {
    return this.#animations.length === 0
  }

  #init() {
    let animation: number, cancel

    const animationFn = (currentTime: number) => {
      animation = requestAnimationFrame(animationFn)
      cancel = () => cancelAnimationFrame(animation)

      for (const gp of navigator.getGamepads()) {
        for (const cb of this.#onGamepads) cb(currentTime, gp)
      }

      return {animation, cancel}
    }

    const {currentTime} = document.timeline
    return animationFn(+(currentTime?.toString() ?? '0'))
  }

  run = () => {
    const animation = this.#init()
    this.#animations.push(animation)
    return animation
  }

  cancel = () => {
    for (const a of this.#animations) a.cancel()
  }
}
