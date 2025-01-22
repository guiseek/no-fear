import {timeout} from './timeout'
import {async} from './async'

export const delay = async (ms = 1000) => {
  return await async<void>((resolve) => timeout(resolve, ms))
}
