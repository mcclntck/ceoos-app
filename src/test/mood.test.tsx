import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MoodScreen } from '@/features/mood'
import { MoodProvider, useMood } from '@/state/moodStore'
import { DepartmentsProvider } from '@/state/departmentsStore'

beforeEach(() => {
  localStorage.clear()
})

function wrapper({ children }: { children: ReactNode }) {
  return (
    <DepartmentsProvider>
      <MoodProvider>{children}</MoodProvider>
    </DepartmentsProvider>
  )
}

describe('MoodScreen', () => {
  it('renders without throwing and shows the My Mood title', () => {
    expect(() => render(<MoodScreen onOpenDept={() => {}} />, { wrapper })).not.toThrow()
    expect(screen.getByText('My Mood')).toBeTruthy()
  })

  it('logs today’s mood when a notch label is clicked, and shows the toast', () => {
    render(<MoodScreen onOpenDept={() => {}} />, { wrapper })

    // Notch labels render the mood names as 44px-tall buttons under the slider track.
    fireEvent.click(screen.getByText('Energised'))

    expect(screen.getByText('Mood logged · Energised')).toBeTruthy()
  })

  it('persists the logged mood into the mood store', async () => {
    let hookResult: ReturnType<typeof useMood> | null = null
    function Probe() {
      hookResult = useMood()
      return null
    }

    render(
      <>
        <MoodScreen onOpenDept={() => {}} />
        <Probe />
      </>,
      { wrapper },
    )

    // logToday is deferred a frame (requestAnimationFrame) so the toast paints first —
    // matching the prototype's commit() behaviour — so wait for it to land.
    await act(async () => {
      fireEvent.click(screen.getByText('Drained'))
    })

    await waitFor(() => expect(hookResult!.todayMood).toBe(0))
  })
})
