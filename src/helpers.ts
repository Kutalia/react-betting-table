import { v4 as uuidv4 } from 'uuid'

import { openDB } from 'idb'
import { AVERAGE_SCORE_BY_SPORT, DB_NAME, NUMBER_OF_MATCHES, SCORE_DEVIATION_MULTIPLIER, STORE_NAME } from './constants'
import mlbClubs from './data/clubs.mlb.json'
import nbaClubs from './data/clubs.nba.json'
import nflClubs from './data/clubs.nfl.json'
import soccerClubs from './data/clubs.soccer.json'
import type { DB, Match, Sport } from './types'

export const getClubs = (type: Sport): string[] => {
  switch (type) {
    case 'baseball':
      return mlbClubs
    case 'basketball':
      return nbaClubs
    case 'football':
      return nflClubs
    default:
      return soccerClubs
  }
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const getOdd = (chance: number) => Number((1 / chance).toFixed(2))

const generateOdds = () => {
  let drawChance: number

  const winChanceHome = Math.random()
  while (true) {
    drawChance = Math.random()
    if (drawChance < winChanceHome && drawChance + winChanceHome < 1) {
      break
    }
  }
  const winChanceAway = 1 - winChanceHome - drawChance

  return {
    odd1: getOdd(winChanceHome),
    oddX: getOdd(drawChance),
    odd2: getOdd(winChanceAway),
    odd1x: getOdd(winChanceHome + drawChance),
    odd2x: getOdd(winChanceAway + drawChance),
  }
}

const generateTeamScore = (sport: Sport) => Math.round(
  (Math.random() * AVERAGE_SCORE_BY_SPORT[sport])
  * (Math.random() * SCORE_DEVIATION_MULTIPLIER)
)

export const generateMatches = (sport: Sport, amount: number) => {
  const matches: Match[] = []
  const clubs = getClubs(sport)
  let startDateTime = new Date()
  let teamHome: string
  let teamAway: string

  for (let index = 0; index < amount; index++) {
    startDateTime = new Date()
    startDateTime.setMonth(Math.floor(Math.random() * 12))
    startDateTime.setDate(Math.ceil(Math.random() * 31))
    startDateTime.setHours(Math.floor(Math.random() * 24), 0, 0)

    while (true) {
      teamHome = getRandomItem(clubs)
      teamAway = getRandomItem(clubs)

      if (teamHome !== teamAway) {
        break
      }
    }

    matches.push({
      id: uuidv4(),
      sport,
      startDateTime,
      teamHome,
      teamAway,
      ...generateOdds(),
      scoreHome: generateTeamScore(sport),
      scoreAway: generateTeamScore(sport),
    })
  }

  return matches
}

export const generateMixedMatches = (amount: number = NUMBER_OF_MATCHES) => [
  ...generateMatches('baseball', Math.floor(amount / 4)),
  ...generateMatches('basketball', Math.floor(amount / 4)),
  ...generateMatches('football', Math.floor(amount / 4)),
  ...generateMatches('soccer', Math.floor(amount / 4)),
  ...generateMatches('soccer', amount % 4),
]

export const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
  hour12: true,
  minute: '2-digit',
  hour: '2-digit',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
})

export const createStore = async () => {
  const db = await openDB<DB>(DB_NAME, 1, {
    async upgrade(db) {
      const matches = generateMixedMatches(NUMBER_OF_MATCHES)
      const objectStore = db.createObjectStore(STORE_NAME, {
        keyPath: "id",
      })

      for (const key in matches[0]) {
        // @ts-ignore
        objectStore.createIndex(key, key, { unique: false })
      }

      await Promise.all([
        ...matches.map((match) => objectStore.add(match)),
      ])
    }
  })

  const tx = db.transaction(STORE_NAME)

  const matches = await tx.store.getAll()

  db.close()

  return matches
}

const updateOddsInStore = (chanceWin: number, chanceDraw: number, id: string) => {

}
