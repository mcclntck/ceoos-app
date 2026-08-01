/* Deterministic mount/reveal gate for the orbit's transform transitions.
   A single useLayoutEffect flips data-mounted="true" synchronously before paint. The
   static CSS rule `[data-mounted="true"] { transition: transform 900ms ... }` is only
   active once this attribute is set, so first paint renders every bubble at its final
   position instantly (no transition, no flicker) and only SUBSEQUENT level changes
   animate. No double-rAF, no ResizeObserver-gated visibility race. */
import { useLayoutEffect, useState } from 'react'

export function useOrbitMount(): boolean {
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
