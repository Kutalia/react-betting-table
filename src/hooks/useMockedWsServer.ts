import { useEffect, useState } from "react"
import { clearInterval, setInterval } from "worker-timers"

import { ODDS_CHANGE_EVENT, ODDS_CHANGE_INTERVAL } from "../constants"
import type { ChangedOdds, Match, OddsChangeEventDetailType } from "../types"
import { generateChances, generateOdds, getRandomItem } from "../helpers"

interface Params {
  onOddsChange: (event: OddsChangeEventDetailType) => void
  matchIds: Array<Match['id']>
}

export const useMockedWsServer = ({ onOddsChange, matchIds }: Params) => {
  const [mockedWs] = useState(() => new EventTarget())

  useEffect(function saveListener() {
    const listener = (event: Event) => {
      onOddsChange((event as CustomEvent<OddsChangeEventDetailType>).detail)
    }

    mockedWs.addEventListener(ODDS_CHANGE_EVENT, listener)

    return () => removeEventListener(ODDS_CHANGE_EVENT, listener)
  }, [onOddsChange, mockedWs])

  useEffect(function createInterval() {
    if (!matchIds.length) {
      return
    }

    const interval = setInterval(() => {
      const newChances = generateChances()

      const newOdds = generateOdds(...newChances) as ChangedOdds

      const event = new CustomEvent<OddsChangeEventDetailType>(ODDS_CHANGE_EVENT, {
        detail: {
          changedOdds: newOdds,
          id: getRandomItem(matchIds),
        }
      })

      mockedWs.dispatchEvent(event)
    }, ODDS_CHANGE_INTERVAL)

    return () => clearInterval(interval)
  }, [matchIds, mockedWs])
}