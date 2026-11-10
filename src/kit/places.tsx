import type { ReactElement } from 'react'

/**
 * The seven places of the world map. Every scene game is set in the room of its place: the place gives the
 * colours of the room, the view from its window and the character who talks to the player.
 */
export const placeIds = ['peaks', 'woods', 'lake', 'sea', 'village', 'meadow', 'coast'] as const
export type PlaceId = (typeof placeIds)[number]

const INK = '#33284a'

/** A big glossy eye, the way the storybook's characters have them. */
function Eye({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill="#fff" />
      <circle cx={x + r * 0.1} cy={y + r * 0.08} r={r * 0.74} fill={INK} />
      <circle cx={x - r * 0.2} cy={y - r * 0.28} r={r * 0.3} fill="#fff" />
      <circle cx={x + r * 0.36} cy={y + r * 0.36} r={r * 0.14} fill="#fff" />
    </>
  )
}

const smile = (d: string) => <path d={d} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
const shadow = <ellipse cx="60" cy="112" rx="40" ry="7" fill="#241a3c" opacity="0.3" />

// Drawn on a 120 × 120 grid, standing on the bottom edge.
const guides: Record<PlaceId, ReactElement> = {
  // A marmot from the Number Peaks.
  peaks: (
    <>
      {shadow}
      <circle cx="30" cy="34" r="11" fill="#8a5a3c" />
      <circle cx="90" cy="34" r="11" fill="#8a5a3c" />
      <circle cx="30" cy="35" r="5.5" fill="#f3b9a4" />
      <circle cx="90" cy="35" r="5.5" fill="#f3b9a4" />
      <path d="M60 22 C92 22 104 50 102 78 C100 104 82 114 60 114 C38 114 20 104 18 78 C16 50 28 22 60 22Z" fill="#a8744c" />
      <path d="M78 26 C96 36 104 56 102 78 C100 100 88 110 74 113 C88 96 92 76 90 58 C88 44 84 34 78 26Z" fill="#8a5a3c" opacity="0.6" />
      <ellipse cx="60" cy="88" rx="26" ry="22" fill="#f6e3c4" />
      <ellipse cx="60" cy="68" rx="20" ry="14" fill="#f6e3c4" />
      <Eye x={44} y={50} r={11} />
      <Eye x={76} y={50} r={11} />
      <ellipse cx="60" cy="62" rx="6" ry="4.5" fill={INK} />
      <path d="M54 70 h12 v9 h-5 v-7 h-2 v7 h-5Z" fill="#fff" />
    </>
  ),
  // An owl from the Maze Woods.
  woods: (
    <>
      {shadow}
      <path d="M26 30 L22 8 L44 22Z M94 30 L98 8 L76 22Z" fill="#7a4d33" />
      <path d="M60 16 C92 16 102 44 100 74 C98 102 82 114 60 114 C38 114 22 102 20 74 C18 44 28 16 60 16Z" fill="#9a6642" />
      <path d="M80 22 C96 34 102 54 100 74 C98 98 86 110 72 113 C86 94 90 74 88 56 C86 42 84 32 80 22Z" fill="#7a4d33" opacity="0.6" />
      <path d="M20 66 C8 78 12 98 26 104 C22 92 22 78 26 66Z M100 66 C112 78 108 98 94 104 C98 92 98 78 94 66Z" fill="#7a4d33" />
      <ellipse cx="60" cy="86" rx="24" ry="24" fill="#f6e3c4" />
      <path d="M48 80 q4 4 8 0 M64 80 q4 4 8 0 M56 92 q4 4 8 0" fill="none" stroke="#d9b98a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="48" r="19" fill="#f6e3c4" />
      <circle cx="78" cy="48" r="19" fill="#f6e3c4" />
      <Eye x={43} y={48} r={13} />
      <Eye x={77} y={48} r={13} />
      <path d="M53 58 L67 58 L60 70Z" fill="#f2a03d" />
    </>
  ),
  // A frog from the Mirror Lake.
  lake: (
    <>
      {shadow}
      <path d="M14 108 C10 96 22 86 34 92 L40 108Z M106 108 C110 96 98 86 86 92 L80 108Z" fill="#4a9a4e" />
      <path d="M60 36 C94 36 108 58 106 82 C104 104 84 114 60 114 C36 114 16 104 14 82 C12 58 26 36 60 36Z" fill="#6cbf5c" />
      <path d="M84 42 C100 52 108 66 106 82 C104 100 90 110 76 113 C90 98 94 82 92 68 C90 56 88 48 84 42Z" fill="#4a9a4e" opacity="0.6" />
      <circle cx="36" cy="34" r="19" fill="#6cbf5c" />
      <circle cx="84" cy="34" r="19" fill="#6cbf5c" />
      <ellipse cx="60" cy="92" rx="30" ry="18" fill="#e3f4b8" />
      <Eye x={36} y={34} r={13} />
      <Eye x={84} y={34} r={13} />
      {smile('M40 68 Q60 84 80 68')}
      <circle cx="30" cy="68" r="6" fill="#f08aa6" opacity="0.7" />
      <circle cx="90" cy="68" r="6" fill="#f08aa6" opacity="0.7" />
    </>
  ),
  // A little whale from the Letter Sea.
  sea: (
    <>
      {shadow}
      <path d="M52 22 C48 8 36 8 34 14 C42 14 48 18 52 26Z M66 22 C70 8 82 8 84 14 C76 14 70 18 66 26Z" fill="#8fd4e8" />
      <path d="M96 84 C112 80 116 66 112 56 C108 64 102 66 98 64 C100 56 96 50 90 50Z" fill="#2f7fb8" />
      <path d="M58 30 C90 30 104 52 102 78 C100 102 82 114 58 114 C34 114 14 102 12 78 C10 52 26 30 58 30Z" fill="#4a9fd8" />
      <path d="M80 36 C96 46 104 62 102 78 C100 98 88 108 74 113 C86 98 90 82 88 66 C86 52 84 44 80 36Z" fill="#2f7fb8" opacity="0.6" />
      <path d="M14 84 C24 102 40 110 58 110 C76 110 92 102 100 86 C98 104 82 114 58 114 C34 114 16 104 14 84Z" fill="#dff1fb" />
      <Eye x={38} y={62} r={12} />
      <Eye x={78} y={62} r={12} />
      {smile('M48 84 Q58 92 68 84')}
      <circle cx="26" cy="80" r="6" fill="#f08aa6" opacity="0.7" />
      <circle cx="90" cy="80" r="6" fill="#f08aa6" opacity="0.7" />
    </>
  ),
  // A parrot from Story Village.
  village: (
    <>
      {shadow}
      <path d="M52 16 C50 4 60 0 64 6 C70 0 80 6 74 18Z" fill="#f2c14e" />
      <path d="M60 14 C90 14 100 42 98 72 C96 100 82 114 60 114 C38 114 24 100 22 72 C20 42 30 14 60 14Z" fill="#e2607e" />
      <path d="M78 20 C94 32 100 52 98 72 C96 96 86 108 72 113 C84 94 88 74 86 56 C84 40 82 30 78 20Z" fill="#b63c5c" opacity="0.6" />
      <path d="M22 62 C8 74 12 98 28 106 C24 92 24 76 30 62Z" fill="#3fb0a8" />
      <path d="M98 62 C112 74 108 98 92 106 C96 92 96 76 90 62Z" fill="#23807c" />
      <ellipse cx="60" cy="92" rx="22" ry="18" fill="#fbd3dc" />
      <circle cx="42" cy="44" r="15" fill="#fff6dc" />
      <circle cx="78" cy="44" r="15" fill="#fff6dc" />
      <Eye x={43} y={44} r={11} />
      <Eye x={77} y={44} r={11} />
      <path d="M48 56 C48 48 72 48 72 56 C72 68 64 76 60 78 C56 76 48 68 48 56Z" fill="#f2c14e" />
      <path d="M52 62 C56 66 64 66 68 62 C66 70 62 76 60 78 C58 76 54 70 52 62Z" fill="#d99a2b" />
    </>
  ),
  // A rabbit from the Quick Meadow.
  meadow: (
    <>
      {shadow}
      <path d="M40 46 C28 20 30 2 40 2 C50 2 54 22 54 44Z M80 46 C92 20 90 2 80 2 C70 2 66 22 66 44Z" fill="#f3ece0" />
      <path d="M42 40 C36 22 36 10 40 10 C45 10 48 24 48 40Z M78 40 C84 22 84 10 80 10 C75 10 72 24 72 40Z" fill="#f3a9b8" />
      <path d="M60 34 C90 34 102 56 100 80 C98 104 82 114 60 114 C38 114 22 104 20 80 C18 56 30 34 60 34Z" fill="#f3ece0" />
      <path d="M82 40 C96 50 102 64 100 80 C98 100 88 110 74 113 C86 98 90 84 88 70 C86 56 86 48 82 40Z" fill="#d6cbb8" opacity="0.7" />
      <ellipse cx="60" cy="94" rx="22" ry="16" fill="#fff" />
      <Eye x={42} y={62} r={12} />
      <Eye x={78} y={62} r={12} />
      <path d="M54 74 h12 l-6 7Z" fill="#f08aa6" />
      {smile('M52 86 Q60 92 60 82 Q60 92 68 86')}
      <circle cx="28" cy="78" r="6" fill="#f08aa6" opacity="0.6" />
      <circle cx="92" cy="78" r="6" fill="#f08aa6" opacity="0.6" />
    </>
  ),
  // A turtle from the Explorers' Coast.
  coast: (
    <>
      {shadow}
      <path d="M12 104 C6 96 14 86 24 90 L30 106Z M108 104 C114 96 106 86 96 90 L90 106Z" fill="#5aa85a" />
      <path d="M60 46 C94 46 108 72 106 96 C104 110 84 114 60 114 C36 114 16 110 14 96 C12 72 26 46 60 46Z" fill="#c98a4a" />
      <path d="M86 54 C100 64 108 80 106 96 C105 106 94 111 80 113 C90 102 94 90 92 78 C91 68 90 60 86 54Z" fill="#9a6230" opacity="0.6" />
      <path d="M60 58 l14 8 v14 l-14 8 l-14 -8 v-14Z M28 78 l10 -6 l6 10 l-6 12 l-12 -2Z M92 78 l-10 -6 l-6 10 l6 12 l12 -2Z" fill="#e8b878" />
      <path d="M60 8 C80 8 90 22 90 38 C90 54 78 62 60 62 C42 62 30 54 30 38 C30 22 40 8 60 8Z" fill="#7cc46a" />
      <path d="M74 12 C86 18 90 28 90 38 C90 50 82 58 70 61 C78 52 80 42 80 34 C80 24 78 18 74 12Z" fill="#5aa85a" opacity="0.6" />
      <Eye x={46} y={32} r={11} />
      <Eye x={74} y={32} r={11} />
      {smile('M50 48 Q60 56 70 48')}
      <circle cx="36" cy="46" r="5" fill="#f08aa6" opacity="0.7" />
      <circle cx="84" cy="46" r="5" fill="#f08aa6" opacity="0.7" />
    </>
  ),
}

/** The character of a place, on a 120 × 120 grid. */
export function Guide({ place }: { place: PlaceId }) {
  return (
    <svg viewBox="0 0 120 120" className="sg-guide-art" aria-hidden focusable="false">
      {guides[place]}
    </svg>
  )
}

// What you see through the window of each room, on a 120 × 96 grid. Lineless, like the map.
const views: Record<PlaceId, ReactElement> = {
  peaks: (
    <>
      <rect width="120" height="96" fill="#bfe3f0" />
      <path d="M-6 96 L34 26 L62 74 L84 40 L126 96Z" fill="#a79bd0" />
      <path d="M34 26 L46 46 L38 44 L32 52 L24 44Z M84 40 L94 54 L86 52 L80 58 L76 52Z" fill="#fff" />
      <path d="M34 26 L62 74 L48 96 L40 96Z M84 40 L126 96 L100 96Z" fill="#7d70b0" opacity="0.6" />
      <path d="M-4 96 Q30 70 62 86 Q94 70 124 96Z" fill="#c5d86b" />
    </>
  ),
  woods: (
    <>
      <rect width="120" height="96" fill="#cfe9c8" />
      <path d="M-4 96 Q30 66 60 80 Q92 64 124 96Z" fill="#c5d86b" />
      {[14, 40, 66, 92].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i % 2 ? 22 : 34})`}>
          <path d="M10 0 L24 30 H17 L28 52 H-8 L3 30 H-4Z" fill="#1f6f6a" />
          <path d="M10 0 L24 30 H17 L28 52 H12Z" fill="#17524f" opacity="0.6" />
        </g>
      ))}
    </>
  ),
  lake: (
    <>
      <rect width="120" height="96" fill="#cdeaf2" />
      <path d="M-4 54 Q30 40 60 50 Q92 38 124 54 V96 H-4Z" fill="#c5d86b" />
      <path d="M8 96 C8 66 112 66 112 96Z" fill="#f2d76a" />
      <path d="M16 96 C18 72 102 72 104 96Z" fill="#4fc3c8" />
      <path d="M34 86 h18 M66 80 h20 M48 92 h14" stroke="#b8ecec" strokeWidth="3" strokeLinecap="round" />
      <circle cx="84" cy="90" r="5" fill="#6cbf5c" />
    </>
  ),
  sea: (
    <>
      <rect width="120" height="96" fill="#cdeaf2" />
      <circle cx="92" cy="22" r="12" fill="#f8d66a" />
      <path d="M-4 52 H124 V96 H-4Z" fill="#3fb6c4" />
      <path d="M-4 68 Q14 60 30 68 T62 68 T94 68 T126 68 V96 H-4Z" fill="#2a98ac" />
      <path d="M40 50 L40 22 L62 46Z" fill="#fffaf0" />
      <path d="M28 50 H70 L62 60 H36Z" fill="#a8484a" />
    </>
  ),
  village: (
    <>
      <rect width="120" height="96" fill="#fbe3c0" />
      <path d="M-4 96 Q40 70 124 84 V96Z" fill="#c5d86b" />
      <path d="M12 86 V56 H44 V86Z M52 86 V46 H80 V86Z M86 88 V60 H112 V88Z" fill="#fff6dc" />
      <path d="M8 58 L28 36 L48 58Z M48 48 L66 26 L84 48Z M82 62 L99 42 L116 62Z" fill="#a8484a" />
      <path d="M28 36 L48 58 H34Z M66 26 L84 48 H72Z M99 42 L116 62 H104Z" fill="#7b3550" opacity="0.6" />
      <path d="M22 66 h8 v10 h-8Z M62 58 h8 v10 h-8Z M95 68 h8 v10 h-8Z" fill="#f2c14e" />
    </>
  ),
  meadow: (
    <>
      <rect width="120" height="96" fill="#cdeaf2" />
      <circle cx="26" cy="22" r="12" fill="#f8d66a" />
      <path d="M-4 96 Q20 44 62 62 Q96 40 124 70 V96Z" fill="#c5d86b" />
      <path d="M-4 96 Q40 66 124 84 V96Z" fill="#a9c552" />
      {[[24, 76], [50, 70], [78, 78], [100, 72]].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="5" fill="#fff" />
          <circle cx={x} cy={y} r="2" fill="#f2c14e" />
        </g>
      ))}
    </>
  ),
  coast: (
    <>
      <rect width="120" height="96" fill="#cdeaf2" />
      <path d="M-4 50 H124 V96 H-4Z" fill="#3fb6c4" />
      <path d="M-4 96 Q20 60 70 74 Q100 80 124 96Z" fill="#f2d76a" />
      <path d="M36 80 C34 60 38 46 44 36 L48 38 C44 50 42 62 44 80Z" fill="#9a6230" />
      <path d="M46 36 C30 26 18 34 14 42 C26 36 36 38 46 40 C58 30 74 32 80 42 C68 38 58 38 46 40 C44 26 52 16 62 14 C54 22 50 30 46 36Z" fill="#1f6f6a" />
    </>
  ),
}

/** The window of a room, with the place's landscape behind the glass. */
export function PlaceWindow({ place }: { place: PlaceId }) {
  return (
    <svg viewBox="-10 -10 140 122" className="sg-window" aria-hidden focusable="false">
      <rect x="-8" y="-8" width="136" height="112" rx="16" fill="#fff6dc" />
      <clipPath id={`sgw-${place}`}>
        <rect width="120" height="96" rx="9" />
      </clipPath>
      <g clipPath={`url(#sgw-${place})`}>{views[place]}</g>
      <path d="M58 0 h4 v96 h-4Z M0 46 h120 v4 h-120Z" fill="#fff6dc" />
      <rect x="-12" y="100" width="144" height="10" rx="5" fill="#f1e2bd" />
    </svg>
  )
}

/** A potted plant for the left corner of a room. */
export function RoomPlant() {
  return (
    <svg viewBox="0 0 120 200" className="sg-prop sg-plant" aria-hidden focusable="false">
      <ellipse cx="60" cy="192" rx="46" ry="8" fill="#241a3c" opacity="0.3" />
      <path d="M58 150 C40 120 16 112 6 86 C30 88 50 108 60 140Z M62 150 C70 104 96 84 114 70 C112 100 92 126 66 146Z M58 148 C44 92 52 44 62 14 C76 46 78 96 64 148Z" fill="#1f6f6a" />
      <path d="M62 14 C76 46 78 96 64 148 L61 148 C68 100 68 56 62 14Z M114 70 C112 100 92 126 66 146 C88 122 104 98 114 70Z" fill="#17524f" opacity="0.7" />
      <path d="M30 140 H90 L82 192 H38Z" fill="#e2607e" />
      <path d="M70 140 H90 L82 192 H66Z" fill="#b63c5c" opacity="0.6" />
      <rect x="24" y="132" width="72" height="14" rx="7" fill="#f08aa6" />
    </svg>
  )
}

/** A stool with a pile of books for the right corner of a room. */
export function RoomBooks() {
  return (
    <svg viewBox="0 0 140 170" className="sg-prop sg-books" aria-hidden focusable="false">
      <ellipse cx="70" cy="162" rx="58" ry="8" fill="#241a3c" opacity="0.3" />
      <path d="M26 92 L16 162 H28 L40 100Z M114 92 L124 162 H112 L100 100Z" fill="#9a6230" />
      <rect x="12" y="80" width="116" height="18" rx="9" fill="#c98a4a" />
      <rect x="28" y="60" width="88" height="20" rx="5" fill="#3fb0a8" />
      <rect x="36" y="42" width="76" height="18" rx="5" fill="#f2c14e" />
      <rect x="30" y="24" width="70" height="18" rx="5" fill="#8364e4" />
      <path d="M96 60 h20 v20 h-20Z M94 42 h18 v18 h-18Z M84 24 h16 v18 h-16Z" fill="#241a3c" opacity="0.18" />
      <circle cx="64" cy="12" r="12" fill="#e2506a" />
      <path d="M64 2 q6 -8 12 -4" fill="none" stroke="#1f6f6a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="59" cy="8" r="3" fill="#fff" opacity="0.7" />
    </svg>
  )
}
