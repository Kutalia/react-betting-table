import { v4 as uuidv4 } from 'uuid'

import { openDB } from 'idb'
import { AVERAGE_SCORE_BY_SPORT, DB_NAME, NUMBER_OF_MATCHES, SCORE_DEVIATION_MULTIPLIER, SCROLL_POSITION_STORE_KEY, SELECTED_ODDS_STORE_KEY, STORE_NAME } from './constants'
import mlbClubs from './data/clubs.mlb.json'
import nbaClubs from './data/clubs.nba.json'
import nflClubs from './data/clubs.nfl.json'
import soccerClubs from './data/clubs.soccer.json'
import type { ChangedOdds, DB, Match, Odds, Sport } from './types'

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

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const getOdd = (chance: number) => Number((1 / chance).toFixed(2))

export const generateChances = () => {
  const winChanceHome = Math.random()
  const drawChance = Math.random() * (1 - winChanceHome)

  return [drawChance, winChanceHome]
}

export const generateOdds = (_winChanceHome?: number, _drawChance?: number): Odds | ChangedOdds => {
  const isOddsChange = typeof _winChanceHome === 'number' && typeof _drawChance === 'number'

  if (isOddsChange && _winChanceHome + _drawChance > 1) {
    throw new Error('Invalid chances')
  }

  let drawChance = _drawChance
  let winChanceHome = _winChanceHome

  if (typeof drawChance !== 'number' || typeof winChanceHome !== 'number') {
    const chances = generateChances()
    drawChance = chances[0]
    winChanceHome = chances[1]
  }

  const winChanceAway = 1 - winChanceHome - drawChance

  return {
    [isOddsChange ? 'odd1Changed' : 'odd1']: getOdd(winChanceHome),
    [isOddsChange ? 'oddXChanged' : 'oddX']: getOdd(drawChance),
    [isOddsChange ? 'odd2Changed' : 'odd2']: getOdd(winChanceAway),
    [isOddsChange ? 'odd1XChanged' : 'odd1X']: getOdd(winChanceHome + drawChance),
    [isOddsChange ? 'odd2XChanged' : 'odd2X']: getOdd(winChanceAway + drawChance),
  } as unknown as Odds | ChangedOdds
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

    const odds = generateOdds() as Odds

    matches.push({
      id: uuidv4(),
      sport,
      startDateTime,
      teamHome,
      teamAway,
      scoreHome: generateTeamScore(sport),
      scoreAway: generateTeamScore(sport),
      ...odds,
      odd1Changed: odds.odd1, // Describes that initially there's no change
      oddXChanged: odds.oddX,
      odd2Changed: odds.odd2,
      odd1XChanged: odds.odd1X,
      odd2XChanged: odds.odd2X,
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

// Creates store and returns matches
// Skips creation if a store already exists
export const createStore = async () => {
  try {
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
  } catch (err) {
    return []
  }
}

export const updateOddsInStore = async (newOdds: ChangedOdds, id: string) => {
  const db = await openDB<DB>(DB_NAME, 1)
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    let match: Match
  
    for await (const cursor of tx.store) {
      match = cursor.value
      if (match.id !== id) {
        continue
      }
  
      await Promise.all([
        tx.store.put({ ...match, ...newOdds }),
        tx.done,
      ])
  
      db.close()
  
      break
    }
  } catch (err) {
    db.close()
  }
}

export const saveScrollPosition = (scrollTop: number) => {
  localStorage.setItem(SCROLL_POSITION_STORE_KEY, String(scrollTop))
}

export const retrieveScrollPosition = () => {
  const scrollTop = localStorage.getItem(SCROLL_POSITION_STORE_KEY)
  return typeof scrollTop == null ? 0 : Number(scrollTop)
}

const percentFormat = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
})

export const formatToPercent = (num: number) => percentFormat.format(num)

export const retrieveSelectedOdds = (): Record<string, keyof Odds | null> | undefined => {
  const selectedOddsStr = localStorage.getItem(SELECTED_ODDS_STORE_KEY)
  return selectedOddsStr ? JSON.parse(selectedOddsStr) : undefined
}

export const saveSelectedOdd = (id: string, oddType: keyof Odds) => {
  const selectedOdds = retrieveSelectedOdds()

  let newOdds: Record<string, keyof Odds | null> = { [id]: oddType }

  if (selectedOdds) {
    if (selectedOdds[id] === oddType) { // Cancel selection if already selected
      newOdds = { ...selectedOdds, [id]: null }
    } else {
      newOdds = { ...selectedOdds, ...newOdds }
    }
  }

  localStorage.setItem(SELECTED_ODDS_STORE_KEY, JSON.stringify(newOdds))

  return newOdds
}

export const removeSelectedOdds = () => localStorage.removeItem(SELECTED_ODDS_STORE_KEY)
