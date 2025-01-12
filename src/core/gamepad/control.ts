export type ControlCallback = (currentTime: number, gamepad: Gamepad | null) => void

export interface ControlAnimation {
  animation: number
  cancel(): void
}

export abstract class Control {
  abstract set onGamepad(cb: ControlCallback)
  abstract get paused(): boolean
  abstract run(): ControlAnimation
  abstract cancel(): void
}
