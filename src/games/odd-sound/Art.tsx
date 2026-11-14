/** Bird colours: body, belly, wing. Fixed, so a colour never tells which bird is the odd one. */
export const birdColors = [
  { body: '#5fa8e8', belly: '#d9ecfb', wing: '#3f86c9' },
  { body: '#f2a541', belly: '#fde9c8', wing: '#d9822a' },
  { body: '#e2607e', belly: '#fbd9e1', wing: '#c24464' },
  { body: '#73c26a', belly: '#dcf1d6', wing: '#4f9f47' },
]

/** A little round bird on a branch; its beak opens and notes float up while it sings. */
export function BirdArt({ color, singing }: { color: number; singing: boolean }) {
  const c = birdColors[color % birdColors.length]
  return (
    <svg viewBox="0 0 100 110" aria-hidden focusable="false">
      <g className="os-notes" opacity={singing ? 1 : 0}>
        <g fill="#6b5aa6">
          <ellipse cx="72" cy="20" rx="5" ry="4" />
          <rect x="75.5" y="4" width="2.5" height="16" rx="1" />
          <ellipse cx="88" cy="30" rx="4" ry="3.2" />
          <rect x="90.8" y="17" width="2.2" height="13" rx="1" />
        </g>
      </g>
      <path d="M18 70 L2 62 L8 78 Z" fill={c.wing} />
      <rect x="38" y="88" width="4" height="12" rx="2" fill="#d98a4e" />
      <rect x="54" y="88" width="4" height="12" rx="2" fill="#d98a4e" />
      <ellipse cx="48" cy="64" rx="34" ry="30" fill={c.body} />
      <ellipse cx="54" cy="74" rx="20" ry="17" fill={c.belly} />
      <path d="M22 58 Q34 52 44 66 Q32 80 20 70 Z" fill={c.wing} />
      <circle cx="64" cy="52" r="6" fill="#fff" />
      <circle cx="65.5" cy="52" r="3.4" fill="#2d2440" />
      <circle cx="66.6" cy="50.8" r="1.1" fill="#fff" />
      <circle cx="58" cy="62" r="3.2" fill="#f7a8b8" opacity="0.8" />
      {singing ? (
        <g fill="#f2c14e">
          <path d="M74 56 L92 52 L76 60 Z" />
          <path d="M74 62 L90 68 L75 64 Z" fill="#e0a83a" />
        </g>
      ) : (
        <path d="M74 56 L90 60 L74 64 Z" fill="#f2c14e" />
      )}
    </svg>
  )
}

/** The lake behind the branch: sky, far shore, water, and the branch the birds sit on. */
export function LakeArt() {
  return (
    <svg className="os-lake" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden focusable="false">
      <rect width="400" height="300" fill="#cfeaf7" />
      <ellipse cx="80" cy="60" rx="42" ry="12" fill="#fff" opacity="0.85" />
      <ellipse cx="300" cy="44" rx="34" ry="10" fill="#fff" opacity="0.85" />
      <path d="M0 150 Q60 120 130 140 Q210 112 290 136 Q350 120 400 140 L400 170 L0 170 Z" fill="#9ccf7a" />
      <rect y="166" width="400" height="134" fill="#6fb6e3" />
      <path d="M40 210 h60 M250 236 h80 M130 268 h50" stroke="#a7d6f1" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function Branch() {
  return (
    <svg className="os-branch" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden focusable="false">
      <path d="M-4 20 Q100 10 200 18 Q300 26 404 14 L404 30 Q300 40 200 32 Q100 26 -4 34 Z" fill="#8b5e3c" />
      <path d="M14 22 Q30 6 50 4 Q38 14 26 24 Z" fill="#7cc552" />
      <path d="M368 18 Q380 2 398 0 Q390 10 378 20 Z" fill="#7cc552" />
    </svg>
  )
}
