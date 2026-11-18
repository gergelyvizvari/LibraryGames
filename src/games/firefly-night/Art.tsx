/** A firefly from above: wings, a dark head and a tail that glows or sleeps. */
export function FireflyArt({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="-30 -30 60 60" aria-hidden focusable="false">
      <circle className="ff-halo" cx="0" cy="8" r="24" fill="#f6ff9c" opacity={lit ? 0.45 : 0} />
      <ellipse cx="-9" cy="-2" rx="9" ry="5" fill="#dfe7ff" opacity="0.75" transform="rotate(-30 -9 -2)" />
      <ellipse cx="9" cy="-2" rx="9" ry="5" fill="#dfe7ff" opacity="0.75" transform="rotate(30 9 -2)" />
      <ellipse cx="0" cy="8" rx="6.5" ry="8" fill={lit ? '#f9f871' : '#5b5a7a'} />
      <ellipse cx="0" cy="-4" rx="5" ry="5.5" fill="#3a3352" />
      <circle cx="-2" cy="-6" r="1.4" fill="#fff" />
      <circle cx="2" cy="-6" r="1.4" fill="#fff" />
    </svg>
  )
}

/** Spots in the jar where caught fireflies sit, in jar units. */
const SPOTS = [
  [-12, 30], [10, 34], [-2, 18], [14, 16], [-14, 8], [2, 2], [-8, -8], [12, -2],
]

/** The glass jar at the bottom: it glows brighter with every firefly inside. */
export function JarArt({ caught, total }: { caught: number; total: number }) {
  const glow = caught / total
  return (
    <svg viewBox="-40 -48 80 100" aria-hidden focusable="false">
      <ellipse cx="0" cy="12" rx="44" ry="40" fill="#f9f871" opacity={glow * 0.35} />
      <rect x="-24" y="-44" width="48" height="12" rx="4" fill="#c98d5a" />
      <path d="M-26 -32 H26 Q32 -32 32 -24 V40 Q32 50 22 50 H-22 Q-32 50 -32 40 V-24 Q-32 -32 -26 -32Z" fill="#cfe8ff" opacity="0.35" />
      <path d="M-24 -24 V36" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {SPOTS.slice(0, caught).map(([x, y], i) => (
        <g key={i} className="ff-in">
          <circle cx={x} cy={y} r="7" fill="#f6ff9c" opacity="0.5" />
          <circle cx={x} cy={y} r="3.5" fill="#f9f871" />
        </g>
      ))}
    </svg>
  )
}

/** The night meadow: sky, moon, stars and dark grass. */
export function NightArt() {
  const stars = [[40, 30], [120, 60], [210, 24], [300, 50], [360, 20], [80, 90], [260, 96]]
  return (
    <svg className="ff-night" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden focusable="false">
      <rect width="400" height="400" fill="#2b2f5c" />
      <rect y="200" width="400" height="200" fill="#323a6a" />
      <circle cx="330" cy="70" r="26" fill="#fff6d6" />
      <circle cx="342" cy="62" r="24" fill="#2b2f5c" />
      {stars.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#fff6d6" opacity="0.8" />
      ))}
      <path d="M0 330 Q60 300 120 322 Q200 296 280 320 Q340 300 400 318 V400 H0Z" fill="#2f5a4a" />
      <path d="M0 360 Q80 340 160 356 Q250 336 330 354 Q370 346 400 352 V400 H0Z" fill="#274c3f" />
    </svg>
  )
}
