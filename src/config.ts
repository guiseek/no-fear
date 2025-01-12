import {
  add,
  set,
  use,
  Axes,
  Buttons,
  Control,
  GamepadAxes,
  GamepadButtons,
  GamepadControl,
} from './core'

add({
  for: Control,
  use: GamepadControl,
})

set(
  {
    for: Control,
    use: GamepadControl,
  },
  {
    for: Axes,
    use: GamepadAxes,
  },
  {
    for: Buttons,
    use: GamepadButtons,
  }
)

export const control = use(Control)

export const buttons = use(Buttons)

export const axes = use(Axes)
