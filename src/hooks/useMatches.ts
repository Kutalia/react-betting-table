import { useEffect, useState } from "react"
import type { Match } from "../types"
import { createStore } from "../helpers"

export const useMatches = (): [Match[], React.Dispatch<React.SetStateAction<Match[]>>] => {
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const matchesPromise = createStore()
    matchesPromise.then((matches) =>
      setMatches(
        [...matches].sort((a, b) => a.id.localeCompare(b.id))
      )
    )
  }, [])

  return [matches, setMatches]
}
