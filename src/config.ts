import {Action} from './states'
import {
  set,
  use,
  Axes,
  Buttons,
  Control,
  GamepadAxes,
  GamepadButtons,
  GamepadControl,
} from './core'

set(
  {
    for: Control,
    use: GamepadControl,
  },
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
  },
  {
    for: Action,
  }
)

export const control = use(Control)

export const buttons = use(Buttons)

export const axes = use(Axes)
