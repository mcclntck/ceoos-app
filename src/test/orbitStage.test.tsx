import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { IdentityProvider } from '@/state/identityStore'
import { DepartmentsProvider } from '@/state/departmentsStore'
import { OrbitStage } from '@/features/orbit/OrbitStage'
import { OrbitBubble } from '@/features/orbit/OrbitBubble'
import { CX, CY } from '@/features/orbit/orbitGeometry'
import { CEOOS_DEPARTMENTS } from '@/departments/departments.config'

beforeEach(() => {
  localStorage.clear()
})

function Providers({ children }: { children: ReactNode }) {
  return (
    <IdentityProvider>
      <DepartmentsProvider>{children}</DepartmentsProvider>
    </IdentityProvider>
  )
}

describe('OrbitStage', () => {
  it('renders the You hub and all 5 department bubbles without throwing', () => {
    expect(() =>
      render(
        <Providers>
          <OrbitStage onOpenDepartment={vi.fn()} />
        </Providers>,
      ),
    ).not.toThrow()

    expect(screen.getByText('You')).toBeTruthy()
    expect(screen.getByText('My Departments')).toBeTruthy()
    for (const dept of CEOOS_DEPARTMENTS) {
      expect(screen.getAllByLabelText(dept.label).length).toBeGreaterThan(0)
    }
  })

  it('calls onOpenDepartment with the department id when a bubble is tapped', async () => {
    const onOpen = vi.fn()
    render(
      <Providers>
        <OrbitStage onOpenDepartment={onOpen} />
      </Providers>,
    )
    const careerButton = screen.getByLabelText('Career')
    careerButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onOpen).toHaveBeenCalledWith('career')
  })

  it('opens the Note to self sheet when the You hub is tapped', () => {
    render(
      <Providers>
        <OrbitStage onOpenDepartment={vi.fn()} />
      </Providers>,
    )
    expect(screen.queryByText('Note to self')).toBeTruthy() // sheet is always mounted (pointer-events gated)
    const youButton = screen.getByText('You')
    youButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(screen.getByText('Note to self')).toBeTruthy()
  })
})

describe('OrbitBubble positioning', () => {
  it('anchors each bubble wrapper at CX/CY, not the container origin (regression: bubbles must not collapse toward 0,0)', () => {
    render(
      <Providers>
        <OrbitStage onOpenDepartment={vi.fn()} />
      </Providers>,
    )
    for (const dept of CEOOS_DEPARTMENTS) {
      const button = screen.getByLabelText(dept.label)
      const wrapper = button.parentElement as HTMLElement
      expect(wrapper.style.left).toBe(`${CX}px`)
      expect(wrapper.style.top).toBe(`${CY}px`)
    }
  })
})

describe('OrbitBubble memoization', () => {
  it('is wrapped in React.memo (the structural fix from the jank diagnosis)', () => {
    // React.memo returns an object with $$typeof === Symbol.for('react.memo') and a
    // `type` pointing at the wrapped render function/component.
    expect(OrbitBubble.$$typeof?.toString()).toBe('Symbol(react.memo)')
    expect(typeof OrbitBubble.type).toBe('function')
  })
})
