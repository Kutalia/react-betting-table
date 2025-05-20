import { useEffect, useState } from "react"
import type { Match } from "../types"
import { createStore } from "../helpers"


export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([])
  
  useEffect(() => {
    const matchesPromise = createStore()
    matchesPromise.then(setMatches)
  }, [])

  return matches
}
