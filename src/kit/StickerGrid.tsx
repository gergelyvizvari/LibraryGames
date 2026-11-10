import { useT, type T } from '../i18n'
import { Icon } from './icon'
import { stickerName } from './SceneShell'
import type { Sticker } from './types'

/** A game's stickers as an album page: the ones won so far, and an empty place for each one still to find. */
export function StickerGrid({ stickers, have, gt, fresh }: { stickers: Sticker[]; have: number; gt: T; fresh?: number | null }) {
  const t = useT()
  return (
    <ul className="album-grid">
      {stickers.map((s, i) => (
        <li key={i} className={`${i < have ? 'album-got' : 'album-missing'}${i === fresh ? ' album-fresh' : ''}`}>
          {i < have ? <Icon icon={s.icon} /> : <span className="album-hole" aria-hidden>?</span>}
          <span>{i < have ? stickerName(s, gt, t) : t('stickers.locked')}</span>
        </li>
      ))}
    </ul>
  )
}
