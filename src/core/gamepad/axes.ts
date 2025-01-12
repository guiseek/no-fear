export abstract class Axes<T = Readonly<number>> {
  abstract handle(value: readonly T[]): {x: number; y: number}
  abstract isActive(value: T): boolean
}