/** Acorn coins: the bigger the acorn, the more it is worth. */
const coinColors: Record<number, { nut: string; cap: string; shade: string }> = {
  1: { nut: '#d9a25f', cap: '#8b5e3c', shade: '#c08a4a' },
  2: { nut: '#e08a45', cap: '#7a4a2c', shade: '#c47334' },
  5: { nut: '#f2c14e', cap: '#8b5e3c', shade: '#d9a63a' },
}

export function AcornCoin({ value }: { value: number }) {
  const c = coinColors[value] ?? coinColors[1]
  return (
    <svg viewBox="-30 -36 60 72" aria-hidden focusable="false">
      <ellipse cx="0" cy="8" rx="24" ry="26" fill={c.nut} />
      <path d="M-24 8 A24 26 0 0 0 24 8 A24 18 0 0 1 -24 8Z" fill={c.shade} />
      <path d="M-27 -6 Q-27 -26 0 -26 Q27 -26 27 -6 Q0 -0 -27 -6Z" fill={c.cap} />
      <rect x="-3" y="-35" width="6" height="11" rx="3" fill={c.cap} />
      <circle cx="0" cy="11" r="16" fill="#fffaf0" />
      <text className="as-num" x="0" y="12" textAnchor="middle" dominantBaseline="central" fontSize="24">
        {value}
      </text>
    </svg>
  )
}

/** The striped awning over the squirrel's shop counter. */
export function Awning() {
  const stripes = ['#e2607e', '#fffaf0', '#e2607e', '#fffaf0', '#e2607e', '#fffaf0', '#e2607e', '#fffaf0']
  return (
    <svg className="as-awning" viewBox="0 0 400 46" preserveAspectRatio="none" aria-hidden focusable="false">
      {stripes.map((f, i) => (
        <path key={i} d={`M${i * 50} 0 h50 v30 a25 16 0 0 1 -50 0Z`} fill={f} />
      ))}
    </svg>
  )
}

/** A little wooden price sign with an acorn on it. */
export function PriceTag({ price }: { price: number }) {
  return (
    <svg viewBox="0 0 90 64" aria-hidden focusable="false">
      <rect x="42" y="40" width="6" height="24" rx="2" fill="#8b5e3c" />
      <rect x="2" y="2" width="86" height="46" rx="12" fill="#fffaf0" />
      <text className="as-num" x="34" y="26" textAnchor="middle" dominantBaseline="central" fontSize="30">
        {price}
      </text>
      <g transform="translate(68 27) scale(0.42)">
        <ellipse cx="0" cy="8" rx="24" ry="26" fill="#d9a25f" />
        <path d="M-27 -6 Q-27 -26 0 -26 Q27 -26 27 -6 Q0 -0 -27 -6Z" fill="#8b5e3c" />
      </g>
    </svg>
  )
}
