export type Axis = 'up' | 'down' | 'left' | 'right'

export type Button = 'x' | 'a' | 'b' | 'y'

export type AxisState = Record<Axis, boolean>
export type ButtonState = Record<Button, boolean>

export class Action {
  #axis: AxisState = {
    up: false,
    right: false,
    down: false,
    left: false,
  }

  get axis() {
    return Object.freeze({...this.#axis})
  }

  #button: ButtonState = {
    x: false,
    a: false,
    b: false,
    y: false,
  }

  get button() {
    return Object.freeze({...this.#button})
  }

  constructor() {}

  setAxis(newState: Partial<AxisState>) {
    this.#axis = {...this.#axis, ...newState}
  }

  setButton(newState: Partial<ButtonState>) {
    this.#button = {...this.#button, ...newState}
  }
}
