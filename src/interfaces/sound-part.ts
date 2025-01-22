import {Audio, PositionalAudio} from 'three'

export interface SoundChicaneContact {
  left: PositionalAudio
  right: PositionalAudio
}

export interface SoundPart {
  chicane: SoundChicaneContact
  startLights: Audio
}
