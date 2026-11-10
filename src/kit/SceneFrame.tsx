import { Suspense, useMemo, useState, type ReactNode } from 'react'
import { makeGameT, useLocale, useT } from '../i18n'
import { ErrorBoundary } from './ErrorBoundary'
import { FavButton } from './FavButton'
import { useTimeouts } from './hooks'
import { Icon } from './icon'
import { OopsCard, gameComponent } from './lazyGame'
import { awardSticker, gameProgress, isFavourite, loadProgress, recordRound, stickerCount, toggleFavourite } from './progress'
import { randomSeed } from './random'
import { stickerName } from './SceneShell'
import { StickerGrid } from './StickerGrid'
import { sound } from './sound'
import { gameColorVars } from './theme'
import type { GameDef, RoundResult } from './types'

/**
 * The frame of a scene game: only a back button over the game's own full-screen scene, and a quiet ending
 * when a stage is finished (a sticker for the album, then on to the next stage or back to the map).
 */
export function SceneFrame({
  game,
  seed,
  daily = false,
  onHome,
}: {
  game: GameDef
  seed?: number
  daily?: boolean
  onHome: () => void
}) {
  const locale = useLocale()
  const t = useT()
  const gt = useMemo(() => makeGameT(game.strings, locale), [game, locale])
  const id = game.meta.id
  const [stage, setStage] = useState(() => {
    const p = gameProgress(loadProgress(), id)
    return { n: p.plays + 1, level: p.level, seed: seed ?? randomSeed() }
  })
  /** Set when the stage is finished: the index of the sticker just won, or null when the album is already full. */
  const [end, setEnd] = useState<{ sticker: number | null } | null>(null)
  const later = useTimeouts()
  const [fav, setFav] = useState(() => isFavourite(loadProgress(), id))
  /** The popup with all of the game's stickers, opened from the ending card. */
  const [album, setAlbum] = useState(false)

  const finish = (r: RoundResult) => {
    recordRound(id, game.meta.skill, r, new Date(), daily)
    const sticker = game.stickers?.length ? awardSticker(id, game.stickers.length) : null
    // A moment to look at the finished scene before the card arrives.
    later(() => {
      sound.win()
      setEnd({ sticker })
    }, 900)
  }

  const next = () => {
    sound.tap()
    const p = gameProgress(loadProgress(), id)
    setEnd(null)
    setAlbum(false)
    setStage({ n: p.plays + 1, level: p.level, seed: randomSeed() })
  }

  const Component = gameComponent(game)
  const won = end && end.sticker !== null ? game.stickers?.[end.sticker] : undefined
  const stickers = game.stickers?.length ? game.stickers : undefined
  const have = end ? stickerCount(loadProgress(), id) : 0
  return (
    <div className="scene-frame" style={gameColorVars(game.meta.color)}>
      <ErrorBoundary key={stage.seed} fallback={<OopsCard onAgain={next} onHome={onHome} />}>
        <Suspense fallback={<div className="game-loading">{t('loading')}</div>}>
          <Component level={stage.level} seed={stage.seed} t={gt} onFinish={finish} />
        </Suspense>
      </ErrorBoundary>
      <button className="scene-back" onClick={onHome} aria-label={t('scene.back')} title={t('scene.back')}>
        <svg viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M15 5 L8 12 L15 19" />
        </svg>
      </button>
      <FavButton on={fav} className="scene-fav" onToggle={() => setFav(isFavourite(toggleFavourite(id), id))} />
      {end && (
        <div className="scene-end" role="dialog" aria-label={t('scene.done')}>
          {/* With stickers the card is a button: it shows every sticker of the game. */}
          <EndCard onOpen={stickers ? () => (sound.tap(), setAlbum(true)) : undefined}>
            <span className="scene-end-sticker">
              <Icon icon={won?.icon ?? game.meta.icon} />
            </span>
            <span className="scene-end-text">
              <span className="scene-end-kicker">{won ? t('scene.newSticker') : gt('title')}</span>
              <span className="scene-end-name">{won ? stickerName(won, gt, t) : t('scene.done')}</span>
              {stickers ? (
                <span className="scene-end-more">
                  ★ {t('stickers.count', { n: have, total: stickers.length })} <span aria-hidden>›</span>
                </span>
              ) : (
                won && <span className="scene-end-kicker">{t('scene.done')}</span>
              )}
            </span>
          </EndCard>
          <div className="scene-end-actions">
            <button className="scene-btn" onClick={next} autoFocus>
              {t('scene.next', { n: stage.n + 1 })}
            </button>
            <button className="scene-link" onClick={onHome}>
              {t('scene.back')}
            </button>
          </div>
        </div>
      )}
      {album && stickers && (
        <div className="scene-album" role="dialog" aria-modal="true" aria-label={t('stickers.ofGame', { title: gt('title') })} onClick={() => setAlbum(false)}>
          <div className="scene-album-card album-page" onClick={(e) => e.stopPropagation()}>
            <h2 className="album-head">
              <Icon icon={game.meta.icon} className="frame-icon" />
              <span className="album-title">{gt('title')}</span>
              <button className="scene-album-close" onClick={() => (sound.tap(), setAlbum(false))} aria-label={t('map.close')} autoFocus>
                ✕
              </button>
            </h2>
            <p className="scene-album-count">{t('stickers.count', { n: have, total: stickers.length })}</p>
            <StickerGrid stickers={stickers} have={have} gt={gt} fresh={end?.sticker} />
          </div>
        </div>
      )}
    </div>
  )
}

function EndCard({ onOpen, children }: { onOpen?: () => void; children: ReactNode }) {
  return onOpen ? (
    <button className="scene-end-card scene-end-open" onClick={onOpen}>
      {children}
    </button>
  ) : (
    <div className="scene-end-card">{children}</div>
  )
}
