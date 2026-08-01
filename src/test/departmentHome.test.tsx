import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DepartmentHomeScreen } from '@/features/departmentHome/DepartmentHomeScreen'
import { ConversationsProvider } from '@/state/conversationsStore'
import { CEOOS_DEPARTMENTS } from '@/departments/departments.config'
import type { DepartmentRuntime } from '@/departments/types'

const sampleDept: DepartmentRuntime = { ...CEOOS_DEPARTMENTS[0], level: 1 }

describe('DepartmentHomeScreen', () => {
  it('renders without throwing and shows the Start a conversation CTA', () => {
    expect(() =>
      render(
        <ConversationsProvider>
          <DepartmentHomeScreen dept={sampleDept} onBack={() => {}} onStart={() => {}} />
        </ConversationsProvider>,
      ),
    ).not.toThrow()

    expect(screen.getByText('Start a conversation')).toBeTruthy()
    expect(screen.getByText(sampleDept.label)).toBeTruthy()
  })
})
