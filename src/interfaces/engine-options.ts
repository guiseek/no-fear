import {GearConfig} from './gear-config'
import {Audio} from 'three'

export type EngineOptions = {
  start: Audio
  gears: GearConfig[]
}
