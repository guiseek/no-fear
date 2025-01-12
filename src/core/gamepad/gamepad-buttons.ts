import {Buttons} from './button'

export class GamepadButtons implements Buttons<GamepadButton> {
  handle(buttons: readonly GamepadButton[]) {
    const [X, A, B, Y, L, R] = buttons

    return [
      this.isActive(X),
      this.isActive(A),
      this.isActive(B),
      this.isActive(Y),
      this.isActive(L),
      this.isActive(R),
    ]
  }

  isActive(button: Readonly<GamepadButton>) {
    return !!(button.pressed || button.touched || button.value)
  }
}
