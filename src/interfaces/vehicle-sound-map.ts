import {Audio, PositionalAudio} from 'three'
import {TwoSides} from './two-sides'

export interface VehicleSoundMap {
  skidding: Audio
  chicane: TwoSides<PositionalAudio>
}
