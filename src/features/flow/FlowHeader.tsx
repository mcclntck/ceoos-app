/* Ported verbatim from ceoos-flow.jsx's FlowHeader — back button + department
   PillChip header row shared by most flow steps. */
import type { ReactNode } from 'react'
import { BackButton } from '@/features/chrome'
import { PillChip } from '@/design-system'
import type { DepartmentRuntime } from '@/departments/types'

export interface FlowHeaderProps {
  dept: DepartmentRuntime
  onBack: () => void
  right?: ReactNode
}

export function FlowHeader({ dept, onBack, right }: FlowHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 20px 0' }}>
      <BackButton onClick={onBack} />
      <PillChip>{dept.head}</PillChip>
      <div style={{ marginLeft: 'auto' }}>{right}</div>
    </div>
  )
}
