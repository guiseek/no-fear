import type {Type} from '../../interfaces'

export const is = {
  function<R>(value: unknown): value is (...args: unknown[]) => R {
    return typeof value === 'function'
  },
  class<T>(value: unknown): value is Type<T> {
    return this.function(value) && 'prototype' in value
  },
}
