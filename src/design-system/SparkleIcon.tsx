import type { SVGAttributes } from 'react'

export interface SparkleIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number
  color?: string
}

/** The brand's six-point asterisk glyph marking AI / coach voice. */
export function SparkleIcon({ size = 20, color = 'currentColor', style, ...rest }: SparkleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      {...rest}
    >
      <g fill={color}>
        <rect x="10.7" y="1" width="2.6" height="22" rx="1.3" />
        <rect x="10.7" y="1" width="2.6" height="22" rx="1.3" transform="rotate(60 12 12)" />
        <rect x="10.7" y="1" width="2.6" height="22" rx="1.3" transform="rotate(120 12 12)" />
      </g>
    </svg>
  )
}
