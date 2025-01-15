import {IntervalCallback} from '../interfaces'

export const interval = (callback: IntervalCallback, ms = 1000, inc = 0) => {
  const ref = setInterval(() => callback(inc++), ms)
  return () => clearInterval(ref)
}
