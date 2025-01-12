import {Axes} from './axes'

export class GamepadAxes implements Axes<number> {
  handle([x, y]: readonly number[]) {
    return {x: +x.toFixed(0), y: -y.toFixed(0)}
  }

  isActive(value: number) {
    return +value.toFixed(0) > 0 || +value.toFixed(0) < 0
  }
}
