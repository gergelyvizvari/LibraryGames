import type { ReactNode } from 'react'

/** The stars at the top of a scene game: one per task of the stage, gold once it is done. */
export function StagePips({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <div className="scene-pips" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="-12 -12 24 24" className={i < done ? 'pip-done' : i === done ? 'pip-now' : 'pip-todo'} aria-hidden focusable="false">
          {i === done && <circle r="10.5" />}
          <path d="M0 -9 L2.6 -3.6 L8.6 -2.8 L4.2 1.4 L5.3 7.3 L0 4.4 L-5.3 7.3 L-4.2 1.4 L-8.6 -2.8 L-2.6 -3.6 Z" />
        </svg>
      ))}
    </div>
  )
}

/** What the scene's character says. Screen readers hear every new line. */
export function SpeechBubble({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <p className="scene-bubble" role="status" aria-live="polite" style={style}>
      {children}
    </p>
  )
}

/** The cream band at the bottom of a scene that holds the things to tap. */
export function SceneTray({ children, hidden = false }: { children: ReactNode; hidden?: boolean }) {
  return <div className={`scene-tray${hidden ? ' scene-tray-off' : ''}`}>{children}</div>
}
