import { useEffect, useState } from "react"
import type { Match } from "../types"
import { createStore } from "../helpers"

export const useMatches = (): [Match[], React.Dispatch<React.SetStateAction<Match[]>>] => {
  const [matches, setMatches] = useState<Match[]>([])
  
  useEffect(() => {
    const matchesPromise = createStore()
    matchesPromise.then(setMatches)
  }, [])

  return [matches, setMatches]
}
