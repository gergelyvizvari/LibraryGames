// The sleeping cat on its cushion, drawn flat in the storybook look: no outlines, one lit and one shaded side.

const INK = '#33284a'
const FUR = '#f2a65a'
const SHADE = '#de8a42'
const STRIPE = '#cf7a35'
const PINK = '#f08aa6'

export type CatMood = 'sleep' | 'peek' | 'purr'

/** viewBox 0 0 240 130. Peeking opens one eye; purring smiles in its sleep. */
export function Cat({ mood }: { mood: CatMood }) {
  return (
    <svg className={`cc-cat cc-${mood}`} viewBox="0 0 240 130" aria-hidden>
      <ellipse cx="122" cy="118" rx="104" ry="10" fill="#241a3c" opacity="0.22" />
      {/* The cushion */}
      <ellipse cx="122" cy="100" rx="104" ry="22" fill="#5b8fd6" />
      <ellipse cx="122" cy="94" rx="98" ry="18" fill="#7aa9e6" />
      <circle cx="20" cy="104" r="5" fill="#f2c14e" />
      <circle cx="224" cy="104" r="5" fill="#f2c14e" />
      <g className="cc-body">
        {/* Tail curled round the front */}
        <path d="M176 92 C200 96 206 112 176 112 L92 112" fill="none" stroke={SHADE} strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="136" cy="72" rx="60" ry="30" fill={FUR} />
        <path d="M80 82 C98 104 170 108 194 80 C192 96 170 104 136 104 C104 104 84 96 80 82Z" fill={SHADE} />
        <path d="M126 44 q6 12 0 22 M146 44 q6 12 0 22 M166 50 q5 10 0 18" fill="none" stroke={STRIPE} strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="96" cy="100" rx="11" ry="7" fill="#fbe3c4" />
        <ellipse cx="116" cy="103" rx="11" ry="7" fill="#fbe3c4" />
        {/* The head */}
        <g className="cc-head">
          <path d="M44 56 L48 22 L70 42Z" fill={FUR} />
          <path d="M50 50 L52 32 L64 44Z" fill={PINK} />
          <path d="M98 56 L94 22 L72 42Z" fill={SHADE} />
          <path d="M92 50 L90 32 L78 44Z" fill={PINK} />
          <circle cx="71" cy="66" r="30" fill={FUR} />
          <path d="M92 46 C104 62 100 88 76 96 C92 84 96 66 92 46Z" fill={SHADE} opacity="0.7" />
          <ellipse cx="71" cy="80" rx="14" ry="10" fill="#fbe3c4" />
          <path d="M66 74 h10 l-5 5Z" fill={PINK} />
          <circle cx="50" cy="78" r="6" fill={PINK} opacity="0.55" />
          <circle cx="92" cy="78" r="6" fill={PINK} opacity="0.55" />
          {mood === 'peek' ? (
            <>
              <path d="M51 66 q6 4 12 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <circle cx="85" cy="64" r="7" fill="#fff" />
              <circle cx="86" cy="65" r="5" fill={INK} />
              <circle cx="84" cy="62" r="2" fill="#fff" />
            </>
          ) : mood === 'purr' ? (
            <>
              <path d="M51 67 q6 -6 12 0 M79 67 q6 -6 12 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M65 84 q3 3 6 0 q3 3 6 0" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
            </>
          ) : (
            <path d="M51 66 q6 4 12 0 M79 66 q6 4 12 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          )}
        </g>
      </g>
      {mood !== 'peek' && (
        <g className="cc-zzz" fill="#7d76a4">
          <text x="104" y="34" fontSize="18">z</text>
          <text x="118" y="22" fontSize="22">z</text>
          <text x="134" y="10" fontSize="26">z</text>
        </g>
      )}
    </svg>
  )
}
