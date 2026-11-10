import { useMemo } from 'react'
import { games } from '../games/registry'
import { makeGameT, useLocale, useT } from '../i18n'
import { Icon } from '../kit/icon'
import { loadProgress, stickerCount } from '../kit/progress'
import { stickerName } from '../kit/SceneShell'

/** The sticker album: every sticker of every scene game, the ones not won yet as empty places. */
export function Stickers({ onHome }: { onHome: () => void }) {
  const t = useT()
  const locale = useLocale()
  const progress = useMemo(loadProgress, [])
  const pages = games.filter((g) => g.stickers?.length)
  const total = pages.reduce((n, g) => n + stickerCount(progress, g.meta.id), 0)

  return (
    <div className="album">
      <header className="frame-bar">
        <button className="icon-btn" onClick={onHome} aria-label={t('scene.back')}>
          ✕
        </button>
        <h1 className="frame-title">{t('stickers.title')}</h1>
      </header>
      {total === 0 && <p className="album-empty">{t('stickers.empty')}</p>}
      {pages.map((g) => {
        const gt = makeGameT(g.strings, locale)
        const have = stickerCount(progress, g.meta.id)
        return (
          <section key={g.meta.id} className="album-page">
            <h2>
              <Icon icon={g.meta.icon} className="frame-icon" /> {gt('title')}
            </h2>
            <ul className="album-grid">
              {g.stickers!.map((s, i) => (
                <li key={i} className={i < have ? 'album-got' : 'album-missing'}>
                  {i < have ? <Icon icon={s.icon} /> : <span className="album-hole" aria-hidden>?</span>}
                  <span>{i < have ? stickerName(s, gt, t) : t('stickers.locked')}</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
