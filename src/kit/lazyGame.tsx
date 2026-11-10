import { lazy, type ComponentType } from 'react'
import { useT } from '../i18n'
import type { GameDef, GameProps } from './types'

// One lazy component per game, kept for the whole visit, so "play again" never shows the loading state twice.
const lazyGames = new WeakMap<GameDef, ComponentType<GameProps>>()
export function gameComponent(game: GameDef) {
  let c = lazyGames.get(game)
  if (!c) {
    // A failed download (offline) is forgotten, so "try again" downloads again.
    const load = () => game.load().catch((e: unknown) => (lazyGames.delete(game), Promise.reject(e)))
    lazyGames.set(game, (c = lazy(load)))
  }
  return c
}

/** The friendly card shown instead of a blank screen when a game crashes or cannot be downloaded. */
export function OopsCard({ onAgain, onHome }: { onAgain: () => void; onHome: () => void }) {
  const t = useT()
  return (
    <div className="card oops" role="alert">
      <div className="oops-face" aria-hidden>
        🙈
      </div>
      <h1>{t('oops')}</h1>
      <p className="muted">{t('oopsHint')}</p>
      <div className="row">
        <button className="big-btn" onClick={onAgain}>
          {t('playAgain')}
        </button>
        <button className="ghost-btn" onClick={onHome}>
          {t('home')}
        </button>
      </div>
    </div>
  )
}
