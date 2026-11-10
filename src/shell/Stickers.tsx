import { useMemo } from 'react'
import { shownGames } from '../games/registry'
import { makeGameT, useLocale, useT } from '../i18n'
import { Icon } from '../kit/icon'
import { loadProgress, stickerCount } from '../kit/progress'
import { StickerGrid } from '../kit/StickerGrid'

/** The sticker album: every sticker of every scene game, the ones not won yet as empty places. Each page opens its game. */
export function Stickers({ onHome, onPlay }: { onHome: () => void; onPlay: (id: string) => void }) {
  const t = useT()
  const locale = useLocale()
  const progress = useMemo(loadProgress, [])
  const pages = shownGames().filter((g) => g.stickers?.length)
  const total = pages.reduce((n, g) => n + stickerCount(progress, g.meta.id), 0)

  return (
    <div className="book">
      <div className="book-in album">
        <div className="book-top">
          <button className="wm-pill" onClick={onHome}>
            <svg viewBox="0 0 24 24" className="wm-pill-icon" aria-hidden focusable="false">
              <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
              <path d="M9 4v14M15 6v14" fill="none" stroke="#fffaf0" strokeWidth="1.6" />
            </svg>
            {t('map.open')}
          </button>
        </div>
        <header className="book-head">
          <h1 className="book-ribbon">{t('stickers.title')}</h1>
        </header>
        {total === 0 && <p className="album-empty">{t('stickers.empty')}</p>}
        {pages.map((g) => {
          const gt = makeGameT(g.strings, locale)
          return (
            <section key={g.meta.id} className="album-page">
              <h2 className="album-head">
                <Icon icon={g.meta.icon} className="frame-icon" />
                <span className="album-title">{gt('title')}</span>
                <button className="album-play" onClick={() => onPlay(g.meta.id)} aria-label={t('stickers.play', { title: gt('title') })}>
                  {t('play')} <span aria-hidden>▶</span>
                </button>
              </h2>
              <StickerGrid stickers={g.stickers!} have={stickerCount(progress, g.meta.id)} gt={gt} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
