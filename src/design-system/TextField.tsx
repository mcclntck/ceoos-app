import type { InputHTMLAttributes, TextareaHTMLAttributes, CSSProperties } from 'react'

interface SharedProps {
  label?: string | null
  style?: CSSProperties
}

export type TextFieldProps = SharedProps &
  (
    | ({ multiline?: false; rows?: never } & InputHTMLAttributes<HTMLInputElement>)
    | ({ multiline: true; rows?: number } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  )

const shared: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: '16px 18px',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-primary)',
  fontSize: 16,
  outline: 'none',
  transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
}

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'var(--accent)'
  e.target.style.boxShadow = '0 0 0 3px var(--focus-ring)'
}
function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'var(--border-subtle)'
  e.target.style.boxShadow = 'none'
}

/** Dark glass input / textarea used for reflections ("Type your thoughts here..."). */
export function TextField({ label = null, multiline = false, rows = 4, style, ...rest }: TextFieldProps) {
  return (
    <label style={{ display: 'block', ...style }}>
      {label && (
        <span
          style={{
            display: 'block',
            marginBottom: 8,
            fontFamily: 'var(--font-primary)',
            fontSize: 11,
            letterSpacing: 'var(--ls-eyebrow)',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
      )}
      {multiline ? (
        <textarea
          rows={rows}
          style={{ ...shared, resize: 'vertical', minHeight: 96 }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          style={shared}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </label>
  )
}
