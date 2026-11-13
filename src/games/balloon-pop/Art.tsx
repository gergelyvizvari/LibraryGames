// The balloons over the jetty at the lake, drawn flat in the storybook look: no outlines, one lit side.

export const balloonColors = [
  ['#ff7b7b', '#e2556b'],
  ['#fed06a', '#e9a93a'],
  ['#3fd0a8', '#16a888'],
  ['#62a6e6', '#3f82cc'],
  ['#ad9cf6', '#8a74e0'],
  ['#ff9fd8', '#e277bd'],
] as const

/** One balloon in a 60 × 110 box: the body on top, the knot and a wavy string below. */
export function BalloonArt({ color, label }: { color: number; label: number | null }) {
  const [light, dark] = balloonColors[color % balloonColors.length]
  return (
    <svg className="bp-balloon-art" viewBox="0 0 60 110" aria-hidden focusable="false">
      <path d="M30 66 C24 76 36 84 30 94 C25 102 33 106 30 110" fill="none" stroke="#fff6dc" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <path d="M26 66 L34 66 L30 60Z" fill={dark} />
      <ellipse cx="30" cy="32" rx="27" ry="31" fill={light} />
      <path d="M44 8 C60 22 58 50 40 61 C50 46 52 26 44 8Z" fill={dark} opacity="0.75" />
      <ellipse cx="18" cy="18" rx="5" ry="9" fill="#fff" opacity="0.55" transform="rotate(28 18 18)" />
      {label !== null && (
        <text className="bp-num" x="30" y="33" textAnchor="middle" dominantBaseline="central" fontSize={label > 9 ? 25 : 30}>
          {label}
        </text>
      )}
    </svg>
  )
}

/** The water and the jetty along the bottom, viewBox 0 0 400 300 stretched to the field. */
export function LakeArt() {
  return (
    <svg className="bp-lake-art" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
      <rect width="400" height="300" fill="#bfe6f0" />
      <rect y="170" width="400" height="130" fill="#4fc3c8" />
      <path d="M0 170 Q100 160 200 170 T400 170 V180 H0Z" fill="#7fd6d8" />
      <path d="M40 210 q14 -6 28 0 M230 196 q14 -6 28 0 M320 236 q12 -5 24 0 M120 250 q12 -5 24 0" fill="none" stroke="#e4f7f7" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="60" cy="58" rx="34" ry="12" fill="#fff" opacity="0.85" />
      <ellipse cx="84" cy="50" rx="22" ry="11" fill="#fff" opacity="0.85" />
      <ellipse cx="320" cy="84" rx="30" ry="10" fill="#fff" opacity="0.8" />
      <rect x="0" y="262" width="400" height="22" fill="#b07a4e" />
      <rect x="0" y="278" width="400" height="10" fill="#8a5a3c" />
      {[20, 120, 220, 320].map((x) => (
        <rect key={x} x={x} y="282" width="12" height="18" fill="#6d4130" />
      ))}
    </svg>
  )
}
