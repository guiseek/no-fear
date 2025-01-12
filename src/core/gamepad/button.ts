export abstract class Buttons<T = unknown> {
  abstract handle(value: readonly T[]): boolean[]
  abstract isActive(value: T): boolean
}
