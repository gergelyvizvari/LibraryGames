import type { ReactElement } from 'react'

/**
 * What a part of an icon is, so every icon style can paint it:
 * `base` the main shape, `detail` features drawn on top of it (eyes, holes, lights),
 * `accent` secondary shapes beside or behind it (a leaf, a handle), `shine` a highlight.
 */
export type IconRole = 'base' | 'detail' | 'accent' | 'shine'

/** One shape of an icon: its role, its fill colour and an SVG element on the 48 × 48 grid. */
export type IconPart = [role: IconRole, color: string, shape: ReactElement]

/** A game icon: parts painted in order, back to front. */
export type GameIcon = IconPart[]

/** Dark ink for eyes, text lines and dots. Same colour as the sticker outline. */
export const ink = '#2d3142'

export function Icon({ icon, className = '' }: { icon: GameIcon; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`game-icon ${className}`} aria-hidden focusable="false">
      {icon.map(([role, color, shape], i) => (
        <g key={i} className={`gi-${role}`} fill={color}>
          {shape}
        </g>
      ))}
    </svg>
  )
}
