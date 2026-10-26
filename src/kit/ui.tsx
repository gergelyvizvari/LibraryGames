import type { ReactNode } from 'react'
import type { Pop } from './hooks'

export function Hud({ items }: { items: { label: string; value: ReactNode; highlight?: boolean }[] }) {
  return (
    <div className="hud">
      {items.map((it) => (
        <div key={it.label} className={`hud-item${it.highlight ? ' hud-hot' : ''}`}>
          <span className="hud-label">{it.label}</span>
          <span className="hud-value">{it.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TimerBar({ left, total }: { left: number; total: number }) {
  const pct = Math.max(0, (left / total) * 100)
  return (
    <div className="timerbar" role="progressbar" aria-valuenow={Math.ceil(left)} aria-valuemax={total}>
      <div className={`timerbar-fill${left < 5 ? ' timerbar-low' : ''}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Pops({ pops }: { pops: Pop[] }) {
  return (
    <div className="pops" aria-hidden>
      {pops.map((p) => (
        <span key={p.id} className={`pop pop-${p.kind}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          {p.text}
        </span>
      ))}
    </div>
  )
}

export function Hearts({ left, total }: { left: number; total: number }) {
  return (
    <span className="hearts">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < left ? '' : 'heart-lost'}>
          ❤️
        </span>
      ))}
    </span>
  )
}

const confettiColors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#a29bfe', '#ff9ff3']
export function Confetti({ count = 60 }: { count?: number }) {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: confettiColors[i % confettiColors.length],
            animationDelay: `${(i % 10) * 0.08}s`,
            animationDuration: `${1.6 + (i % 5) * 0.3}s`,
          }}
        />
      ))}
    </div>
  )
}
