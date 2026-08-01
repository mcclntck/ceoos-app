export interface AvatarProps {
  initials?: string
}

/**
 * The visual initials-circle only. NOT the app-level avatar menu (a separate,
 * later feature) — this is just the small chrome glyph used in brand rows.
 */
export function Avatar({ initials = 'SJ' }: AvatarProps) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#6b6f2e,#3a4a6b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e9eaed',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font-primary)',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
