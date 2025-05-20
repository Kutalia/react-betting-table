import type { Sport } from "./types"

export const NUMBER_OF_MATCHES = 4_000
export const AVERAGE_SCORE_BY_SPORT: Record<Sport, number> = {
  soccer: 1.36,
  basketball: 107.4,
  baseball: 4.1,
  football: 22.4,
}

export const SCORE_DEVIATION_MULTIPLIER = 2

export const DB_NAME = 'Matches'
export const STORE_NAME = 'matches'