export interface Type<T = unknown> extends NewableFunction {
  new (...params: any[]): T
}
