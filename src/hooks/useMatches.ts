import { useEffect, useState } from "react"
import type { Match } from "../types"
import { createStore } from "../helpers"

interface UseMatchesReturnType {
  matches: Match[]
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>
  loading: boolean
}

export const useMatches = (): UseMatchesReturnType => {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const matchesPromise = createStore()
    matchesPromise.then((matches) => {
      setMatches(
        [...matches].sort((a, b) => a.id.localeCompare(b.id))
      )
      setLoading(false)
    })
  }, [])

  return { matches, setMatches, loading }
}
