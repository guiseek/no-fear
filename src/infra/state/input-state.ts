export type InputDirection = 'up' | 'down' | 'left' | 'right'

export type InputDirections = Record<InputDirection, boolean>

export type InputButton = 'x' | 'a' | 'b' | 'y'

export type InputButtons = Record<InputButton, boolean>

class InputState {
  #direction: InputDirections = {
    up: false,
    right: false,
    down: false,
    left: false,
  }

  #button: InputButtons = {
    x: false,
    a: false,
    b: false,
    y: false,
  }

  get direction() {
    return this.#direction
  }

  get button() {
    return this.#button
  }

  setDirection(direction: InputDirection, state: boolean) {
    this.#direction[direction] = state
  }

  setDirections(directions: InputDirections) {
    this.#direction = directions
  }

  setButton(direction: InputButton, state: boolean) {
    this.#button[direction] = state
  }

  setButtons(button: InputButtons) {
    this.#button = button
  }
}

export const inputState = new InputState()
