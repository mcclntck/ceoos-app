/* Ported verbatim from ceoos-flow.jsx's ChatInput — the pill-shaped composer
   with a send button and the brand-asterisk "suggest actions" button. */
import { useState } from 'react'

export interface ChatDraft {
  picks: string[]
  text: string
}

export interface ChatInputProps {
  draft: ChatDraft
  setDraft: (updater: (d: ChatDraft) => ChatDraft) => void
  canSend: boolean
  send: () => void
  onSuggest?: (() => void) | null
  suggestLabel?: string
}

export function ChatInput({ draft, setDraft, canSend, send, onSuggest, suggestLabel }: ChatInputProps) {
  const [focus, setFocus] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        background: 'var(--surface-card-strong)',
        border: `1.5px solid ${focus || canSend ? 'var(--accent)' : 'var(--border-strong)'}`,
        borderRadius: 22,
        padding: '8px 8px 8px 16px',
        transition: 'border-color 160ms ease',
      }}
    >
      <textarea
        rows={2}
        placeholder="Answer in your own words…"
        value={draft.text}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
        style={{
          flex: 1,
          resize: 'none',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-primary)',
          fontSize: 16,
          lineHeight: 1.45,
          padding: '6px 0',
          minHeight: 46,
        }}
      />
      <button
        onClick={send}
        disabled={!canSend}
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: '50%',
          border: 'none',
          cursor: canSend ? 'pointer' : 'default',
          background: canSend ? 'var(--accent)' : 'var(--surface-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 150ms ease',
        }}
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke={canSend ? 'var(--text-on-accent)' : 'var(--text-muted)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
      {onSuggest && (
        <button
          onClick={onSuggest}
          aria-label={suggestLabel}
          title={suggestLabel}
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: '50%',
            border: '1px solid var(--border-strong)',
            cursor: 'pointer',
            background: 'var(--surface-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 150ms ease',
          }}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <g fill="var(--accent)">
              <rect x="10.7" y="1" width="2.6" height="22" rx="1.3" />
              <rect x="10.7" y="1" width="2.6" height="22" rx="1.3" transform="rotate(60 12 12)" />
              <rect x="10.7" y="1" width="2.6" height="22" rx="1.3" transform="rotate(120 12 12)" />
            </g>
          </svg>
        </button>
      )}
    </div>
  )
}
