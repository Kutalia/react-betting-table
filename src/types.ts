import type { DBSchema } from "idb"

export type Sport = 'baseball' | 'basketball' | 'football' | 'soccer'

export interface Match {
  id: string
  sport: Sport
  startDateTime: Date
  teamHome: string
  teamAway: string
  odd1: number
  oddX: number
  odd2: number
  odd1x: number
  odd2x: number
  scoreHome: number
  scoreAway: number
}

export interface DB extends DBSchema {
  'matches': {
    key: Match['id']
    value: Match
  }
}