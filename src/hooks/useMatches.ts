import { useEffect, useState } from "react"
import { generateMixedMatches } from "../helpers"
import { NUMBER_OF_MATCHES, STORAGE_KEY } from "../constants"
import type { Match } from "../types"

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const storedMatchesJson = localStorage.getItem(STORAGE_KEY)

    if (!storedMatchesJson) {
      const generatedMatches = generateMixedMatches(NUMBER_OF_MATCHES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generatedMatches))
      setMatches(generatedMatches)
    } else {
      setMatches(JSON.parse(storedMatchesJson))
    }

  }, [])
  
  return matches
}
