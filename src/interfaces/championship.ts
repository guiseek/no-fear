export interface PointsSystem {
  /**
   * @description Pontos para cada posição
   * @example [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
   */
  positions: number[]
}

export type QualifyingType = 'traditional' | 'sprint'

export interface QualifyingFormat {
  type: QualifyingType

  /**
   * @description Quantidade de sessões
   * @example 3 para Q1, Q2 e Q3
   */
  sessions: number

  /**
   * @description Duração em minutos de cada sessão
   */
  sessionDuration: number[]
}

export interface PitStopRules {
  /**
   * Número obrigatório de paradas
   */
  mandatoryStops: number

  /**
   * Troca de composto obrigatório?
   */
  tireChangeRequired: boolean
}

export type TractionControlType = 'off' | 'low' | 'high'

export interface AssistOptions {
  tractionControl: TractionControlType
  antiLockBrakes: boolean
  steeringAssist: boolean
  automaticGearbox: boolean
}

export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'storm'

export type WeatherIntensity = 'low' | 'moderate' | 'high'

export interface WeatherConditions {
  type: WeatherType // Tipo de clima
  intensity: WeatherIntensity // Intensidade (leve, moderada, forte)
  temperature?: number // Temperatura ambiente (opcional)
  trackTemperature?: number // Temperatura do asfalto (opcional)
}

type TerrainType = 'asphalt' | 'mixed'

export interface LapRecord {
  time: string // Melhor volta (ex.: "1:10.546")
  driver: string // Nome do piloto
  year: number // Ano da melhor volta
}

interface GrandPrixConfig {
  name: string // Nome do Grande Prêmio (ex.: "Grande Prêmio do Brasil")
  location: string // Local (ex.: "Interlagos, Brasil")
  circuitLength: number // Comprimento do circuito (em km)
  laps: number // Número de voltas
  qualifyingWeather: WeatherConditions // Condições climáticas na qualificação
  raceWeather: WeatherConditions // Condições climáticas na corrida
  drsZones: number // Número de zonas de DRS
  safetyCarProbability: number // Probabilidade de Safety Car (%)
  lapRecord: LapRecord
  terrainType: TerrainType // Tipo de terreno
  pitLaneTimeLoss: number // Tempo perdido no pit lane (em segundos)
  elevationChanges: boolean // Existe elevação significativa no circuito?
  nightRace: boolean // Corrida noturna?
}

export interface TireCompoundRules {
  /**
   * @description Compostos disponíveis para o campeonato
   * @example ['soft', 'medium', 'hard']
   */
  availableCompounds: string[];

  /**
   * @description Compostos para condições de chuva
   * @example ['intermediate', 'wet']
   */
  wetCompounds: string[];

  /**
   * @description Troca obrigatória de compostos diferentes?
   */
  minimumCompoundChange: boolean;
}

export type RaceStartType = 'standing' | 'rolling'

export interface ChampionshipConfig {
  /**
   * Nome do campeonato
   */
  name: string

  /**
   * Ano da temporada
   */
  seasonYear: number

  /**
   * Número total de Grandes Prêmios no campeonato
   */
  numberOfRaces: number

  /**
   * Lista de equipes participantes
   */
  teams: string[]

  /**
   * Lista de pilotos participantes
   */
  drivers: string[]

  /**
   * Sistema de pontuação (ex.: 25-18-15...)
   */
  pointsSystem: PointsSystem

  /**
   * Permitir condições climáticas dinâmicas?
   */
  weatherEnabled: boolean

  /**
   * Formato de qualificação (ex.: Q1/Q2/Q3 ou tempo único)
   */
  qualifyingFormat: QualifyingFormat

  /**
   * Regras de pit stop
   */
  pitStopRules: PitStopRules

  /**
   * Regras de compostos de pneus
   */
  tireCompoundRules: TireCompoundRules

  /**
   * Tipo de largada
   */
  raceStartType: RaceStartType

  /**
   * Penalidades estão habilitadas?
   */
  penaltiesEnabled: boolean

  /**
   * Safety car pode ser acionado?
   */
  safetyCarEnabled: boolean

  /**
   * Dificuldade da IA (0-100)
   */
  aiDifficulty: number

  /**
   * Configurações de assistência (ex.: ABS, controle de tração)
   */
  assistOptions: AssistOptions

  /**
   * Configurações para cada Grande Prêmio
   */
  grandPrixConfigs: GrandPrixConfig[]
}
