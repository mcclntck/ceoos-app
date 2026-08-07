/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-home.jsx (MyPlanScreen, DeptFilterPill).
   Wired to real state: usePlans() for plans + addPlan, useDepartments() for the led-count. */
import { useState } from 'react'
import { AppBackdrop, StatusBar, BrandRow } from '@/features/chrome'
import { GlassCard, ProgressRing } from '@/design-system'
import { usePlans } from '@/state/plansStore'
import { useDepartments } from '@/state/departmentsStore'
import type { DeptId } from '@/departments/types'
import { ReminderCard } from './ReminderCard'
import { AddActionSheet } from './AddActionSheet'

const A_FONT = 'var(--font-primary)'
const A_TITLE = {
  fontFamily: A_FONT,
  fontSize: 'var(--ceoos-title)',
  fontWeight: 600,
  color: 'var(--text-primary)',
  margin: 0,
  letterSpacing: '-0.015em',
  lineHeight: 1.12,
}

function ScreenScroll({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 var(--ceoos-gutter) 128px', WebkitOverflowScrolling: 'touch' }}>
      {children}
    </div>
  )
}

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 0 14px' }}>
      <h2 style={{ ...A_TITLE, fontSize: 18 }}>{title}</h2>
      {action}
    </div>
  )
}

function DeptFilterPill({ label, count, selected, onClick }: { label: string; count: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 15px',
        borderRadius: 999,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        background: selected ? 'var(--accent)' : 'var(--surface-card)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border-subtle)'}`,
        color: selected ? 'var(--text-on-accent)' : 'var(--text-secondary)',
        fontFamily: A_FONT,
        fontSize: 13.5,
        fontWeight: selected ? 700 : 500,
        transition: 'all 160ms ease',
      }}
    >
      {label}
      <span style={{ fontSize: 11.5, fontWeight: 700, color: selected ? 'var(--text-on-accent)' : 'var(--text-muted)', opacity: selected ? 0.7 : 1 }}>
        {count}
      </span>
    </button>
  )
}

export interface MyActionsScreenProps {
  onOpenDept: (id: DeptId) => void
  onOpenReminder: (planIndex: number) => void
}

export function MyActionsScreen({ onOpenReminder }: MyActionsScreenProps) {
  const { plans, addPlan } = usePlans()
  const { departments } = useDepartments()
  const [filter, setFilter] = useState<'all' | DeptId>('all')
  const [addOpen, setAddOpen] = useState(false)

  const ledCount = departments.filter((d) => d.level >= 2).length
  const all = plans.map((p, i) => ({ p, i }))
  const inFilter = filter === 'all' ? all : all.filter((x) => x.p.deptId === filter)
  const active = inFilter.filter((x) => !x.p.done)
  const done = inFilter.filter((x) => x.p.done)
  const countFor = (id: 'all' | DeptId) => (id === 'all' ? all.length : all.filter((x) => x.p.deptId === id).length)
  const filterLabel = filter === 'all' ? 'all departments' : departments.find((d) => d.id === filter)?.label ?? filter

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <AppBackdrop glow="default" />
      <StatusBar />
      <BrandRow
        left={<span style={A_TITLE}>My Actions</span>}
        right={
          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add action"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 15px 9px 12px',
              borderRadius: 999,
              cursor: 'pointer',
              background: 'var(--accent)',
              border: 'none',
              color: 'var(--text-on-accent)',
              fontFamily: A_FONT,
              fontSize: 13.5,
              fontWeight: 700,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 24px 2px', scrollbarWidth: 'none' }}>
        <DeptFilterPill label="All" count={countFor('all')} selected={filter === 'all'} onClick={() => setFilter('all')} />
        {departments.map((d) => (
          <DeptFilterPill key={d.id} label={d.label} count={countFor(d.id)} selected={filter === d.id} onClick={() => setFilter(d.id)} />
        ))}
      </div>

      <ScreenScroll>
        <GlassCard radius={20} padding={20} style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <ProgressRing value={ledCount} max={5} size={72} showFraction />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: A_FONT, fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {ledCount === 0 ? 'Lead your first Department' : `Leading ${ledCount} of 5 departments`}
              </div>
              <div style={{ fontFamily: A_FONT, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {inFilter.length} action{inFilter.length === 1 ? '' : 's'} in {filterLabel} · {done.length} done
              </div>
            </div>
          </div>
        </GlassCard>

        <SectionHead title="Active actions" action={<span style={{ fontFamily: A_FONT, fontSize: 13, color: 'var(--text-muted)' }}>{active.length}</span>} />
        {active.length > 0 ? (
          active.map(({ p, i }) => <ReminderCard key={i} plan={p} onClick={() => onOpenReminder(i)} />)
        ) : (
          <GlassCard radius={18} padding={20}>
            <div style={{ fontFamily: A_FONT, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {filter === 'all' ? 'Nothing scheduled. Head to Departments and pick one thing to do.' : `Nothing active in ${filterLabel} yet.`}
            </div>
          </GlassCard>
        )}

        <SectionHead title="Done" action={<span style={{ fontFamily: A_FONT, fontSize: 13, color: 'var(--text-muted)' }}>{done.length}</span>} />
        {done.length > 0 ? (
          done.map(({ p, i }) => <ReminderCard key={i} plan={p} onClick={() => onOpenReminder(i)} />)
        ) : (
          <GlassCard radius={18} padding={20}>
            <div style={{ fontFamily: A_FONT, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Nothing completed here yet. Following through is what moves a Department closer.
            </div>
          </GlassCard>
        )}
      </ScreenScroll>

      <AddActionSheet
        open={addOpen}
        departments={departments}
        defaultDeptId={filter === 'all' ? null : filter}
        onClose={() => setAddOpen(false)}
        onAdd={(p) => {
          addPlan(p)
          setFilter(p.deptId)
        }}
      />
    </div>
  )
}
