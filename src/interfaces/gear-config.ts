import {RangeValue} from './range-value'
import {Audio} from 'three'

export interface GearConfig {
  rpm: RangeValue
  rate: RangeValue
  audio: Audio
}
