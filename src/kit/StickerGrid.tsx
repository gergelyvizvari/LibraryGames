import type { CSSProperties } from 'react'
import { useT, type T } from '../i18n'
import type { Sticker } from './types'

/** Soft paper colours behind the stamps' paintings, one per place in the row. */
const tints = ['#f6d6b8', '#d8e8c4', '#cfe3f0', '#f3d0dc', '#fbe7a6']

/**
 * One sticker as a painted stamp: a perforated edge, its painting on a soft colour, and stars for its place in the row
 * (one for the first, five for the fifth). The last stamp of a game is gold.
 */
export function Stamp({ sticker, index, last }: { sticker: Sticker; index: number; last: boolean }) {
  return (
    <span className={`stamp${last ? ' stamp-gold' : ''}`}>
      <span className="stamp-in" style={{ '--tint': tints[index % tints.length] } as CSSProperties}>
        <img src={sticker.art} alt="" draggable={false} />
        <span className="stamp-stars" aria-hidden>
          {'★'.repeat(index + 1)}
        </span>
      </span>
    </span>
  )
}

/**
 * A game's album page: its painted place with a stamp strip across it, like a row in a stamp collection. Stamps won so
 * far sit in order; each one still to find is a dashed empty place.
 */
export function StickerGrid({ stickers, have, gt, fresh, scene }: { stickers: Sticker[]; have: number; gt: T; fresh?: number | null; scene?: string }) {
  const t = useT()
  return (
    <div className="stamp-scene" style={scene ? { backgroundImage: `url(${scene})` } : undefined}>
      <ul className="stamp-strip">
        {stickers.map((s, i) => (
          <li key={i} className={`${i < have ? 'album-got' : 'album-missing'}${i === fresh ? ' album-fresh' : ''}`}>
            {i < have ? <Stamp sticker={s} index={i} last={i === stickers.length - 1} /> : <span className="stamp-hole" aria-hidden>?</span>}
            <span className="stamp-name">{i < have ? gt(s.name) : t('stickers.locked')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
