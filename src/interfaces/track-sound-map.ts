import {Audio, PositionalAudio} from 'three'

export interface TrackSoundChicane {
  left: PositionalAudio
  right: PositionalAudio
}

export interface TrackSoundMap {
  startLight: Audio
  chicane: TrackSoundChicane
  checkpoint: Audio
  lapTime: Audio
  bestLapTime: Audio
  victoryTheme: Audio
}
