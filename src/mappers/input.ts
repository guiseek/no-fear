import {Axes, Buttons, InputState, use} from '../core'

const fromKeyboard = ({b, t, up, down, left, right}: InputState) => {
  const buttons = {a: b, b: up, x: t, y: down}

  const directions = {up, down, left, right}

  return {buttons, directions}
}

const fromGamepad = (gamepad: Gamepad) => {
  const axesHandler = use(Axes)
  const buttonsHandler = use(Buttons)

  const {x: xAxes, y: yAxes} = axesHandler.handle(gamepad.axes)

  const up = xAxes === 0 && yAxes === -1
  const right = xAxes === 1 && yAxes === 0
  const down = xAxes === 0 && yAxes === 1
  const left = xAxes === -1 && yAxes === 0

  const directions = {up, right, down, left}

  const [x, a, b, y] = buttonsHandler.handle(gamepad.buttons)

  const buttons = {x, a, b, y}

  return {buttons, directions}
}

export const inputMapper = {fromKeyboard, fromGamepad}
