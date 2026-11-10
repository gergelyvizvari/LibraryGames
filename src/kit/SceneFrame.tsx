import { Suspense, useMemo, useState } from 'react'
import { makeGameT, useLocale, useT } from '../i18n'
import { ErrorBoundary } from './ErrorBoundary'
import { useTimeouts } from './hooks'
import { Icon } from './icon'
import { OopsCard, gameComponent } from './lazyGame'
import { awardSticker, gameProgress, loadProgress, recordRound } from './progress'
import { randomSeed } from './random'
import { sound } from './sound'
import type { GameDef, RoundResult } from './types'

/**
 * The frame of a scene game: only a back button over the game's own full-screen scene, and a quiet ending
 * when a stage is finished (a sticker for the album, then on to the next stage or back to the map).
 */
export function SceneFrame({ game, seed, daily = false, onHome }: { game: GameDef; seed?: number; daily?: boolean; onHome: () => void }) {
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
    setStage({ n: p.plays + 1, level: p.level, seed: randomSeed() })
  }

  const Component = gameComponent(game)
  const won = end && end.sticker !== null ? game.stickers?.[end.sticker] : undefined
  return (
    <div className="scene-frame">
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
      {end && (
        <div className="scene-end" role="dialog" aria-label={t('scene.done')}>
          <div className="scene-end-card">
            <span className="scene-end-sticker">
              <Icon icon={won?.icon ?? game.meta.icon} />
            </span>
            <span className="scene-end-text">
              <span className="scene-end-kicker">{won ? t('scene.newSticker') : gt('title')}</span>
              <span className="scene-end-name">{won ? gt(won.name) : t('scene.done')}</span>
              {won && <span className="scene-end-kicker">{t('scene.done')}</span>}
            </span>
          </div>
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
    </div>
  )
}
