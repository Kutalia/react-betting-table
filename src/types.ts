import type { DBSchema } from "idb"

export type Sport = 'baseball' | 'basketball' | 'football' | 'soccer'

export interface Odds {
  odd1: number
  oddX: number
  odd2: number
  odd1X: number
  odd2X: number
}

export interface ChangedOdds {
  odd1Changed: number
  oddXChanged: number
  odd2Changed: number
  odd1XChanged: number
  odd2XChanged: number
}

export interface Match extends Odds, ChangedOdds {
  id: string
  sport: Sport
  startDateTime: Date
  teamHome: string
  teamAway: string
  scoreHome: number
  scoreAway: number
}

export interface DB extends DBSchema {
  'matches': {
    key: Match['id']
    value: Match
  }
}
export interface OddsChangeEventDetailType {
  changedOdds: ChangedOdds
  id: string
}