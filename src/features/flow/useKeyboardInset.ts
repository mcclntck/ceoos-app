import { useEffect, useState } from 'react'

/** Tracks how much of the layout viewport's bottom edge the on-screen keyboard
 *  currently covers, via the VisualViewport API. Lets a fixed-position composer
 *  float just above the keyboard (standard chat-app behaviour) instead of the
 *  whole page reflowing/resizing when the keyboard opens. Returns 0 on browsers
 *  without VisualViewport support (desktop, and the composer just sits at the
 *  layout bottom as normal). */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop
      setInset(Math.max(0, Math.round(covered)))
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}
