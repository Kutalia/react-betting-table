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