import { useEffect, useMemo, useState } from 'react'
import { makeGameT, useLocale, useT } from '../i18n'
import { useTimeouts } from './hooks'
import { Icon } from './icon'
import { gameProgress, loadProgress, recordRound, stars, type RecordOutcome } from './progress'
import { randomSeed } from './random'
import { sound } from './sound'
import { gameColorVars } from './theme'
import type { GameDef, RoundResult } from './types'
import { Confetti } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

type Phase = 'intro' | 'countdown' | 'playing' | 'results'

/**
 * Everything around a game: intro card, 3-2-1 countdown, the round itself, results.
 * Games only render the round and call `onFinish` once.
 */
export function GameFrame({ game, seed, onHome }: { game: GameDef; seed?: number; onHome: () => void }) {
  const locale = useLocale()
  const t = useT()
  const gt = useMemo(() => makeGameT(game.strings, locale), [game, locale])
  const [phase, setPhase] = useState<Phase>('intro')
  const [count, setCount] = useState(3)
  const [round, setRound] = useState(0)
  const [roundSeed, setRoundSeed] = useState(() => seed ?? randomSeed())
  const [result, setResult] = useState<{ score: number; accuracy: number; outcome: RecordOutcome } | null>(null)
  const later = useTimeouts()
  const progress = gameProgress(loadProgress(), game.meta.id)

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count === 0) {
      sound.go()
      setPhase('playing')
      return
    }
    sound.tick()
    later(() => setCount((c) => c - 1), 650)
  }, [phase, count, later])

  const start = () => {
    sound.tap()
    setCount(3)
    setPhase('countdown')
  }

  const finish = (r: RoundResult) => {
    const outcome = recordRound(game.meta.id, game.meta.skill, r)
    setResult({ ...r, outcome })
    if (outcome.newRecord || stars(r.accuracy) === 3) sound.win()
    later(() => setPhase('results'), 700)
  }

  const again = () => {
    setRound((n) => n + 1)
    setRoundSeed(randomSeed())
    start()
  }

  const { Component } = game
  return (
    <div className="frame" style={gameColorVars(game.meta.color)}>
      <header className="frame-bar">
        <button className="icon-btn" onClick={onHome} aria-label={t('home')}>
          ✕
        </button>
        <span className="frame-title">
          <Icon icon={game.meta.icon} className="frame-icon" /> {gt('title')}
        </span>
        <span className="frame-level">{t('level', { level: progress.level })}</span>
      </header>

      {phase === 'intro' && (
        <div className="card intro">
          <div className="intro-icon">
            <Icon icon={game.meta.icon} />
          </div>
          <h1>{gt('title')}</h1>
          <p className="howto">{gt('howTo')}</p>
          <p className="muted">{progress.best > 0 ? t('best', { score: progress.best }) : t('noBestYet')}</p>
          <button className="big-btn" onClick={start} autoFocus>
            {t('play')}
          </button>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="countdown" key={count}>
          {count > 0 ? count : t('go')}
        </div>
      )}

      {phase === 'playing' && (
        <div className="stage">
          <ErrorBoundary
            key={round}
            fallback={
              <div className="card oops" role="alert">
                <div className="oops-face" aria-hidden>
                  🙈
                </div>
                <h1>{t('oops')}</h1>
                <p className="muted">{t('oopsHint')}</p>
                <div className="row">
                  <button className="big-btn" onClick={again}>
                    {t('playAgain')}
                  </button>
                  <button className="ghost-btn" onClick={onHome}>
                    {t('home')}
                  </button>
                </div>
              </div>
            }
          >
            <Component level={progress.level} seed={roundSeed} t={gt} onFinish={finish} />
          </ErrorBoundary>
        </div>
      )}

      {phase === 'results' && result && (
        <div className="card results">
          {(result.outcome.newRecord || stars(result.accuracy) === 3) && <Confetti />}
          <div className="stars" role="img" aria-label={t('starsOf', { n: stars(result.accuracy) })}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= stars(result.accuracy) ? 'star on' : 'star'} style={{ animationDelay: `${n * 0.15}s` }}>
                ★
              </span>
            ))}
          </div>
          <h1>{result.outcome.newRecord ? t('newRecord') : result.accuracy >= 0.6 ? t('greatJob') : t('niceTry')}</h1>
          <div className="final-score">{result.score}</div>
          <p className="muted">{t('best', { score: result.outcome.progress.games[game.meta.id].best })}</p>
          {result.outcome.level > result.outcome.previousLevel && (
            <p className="level-up">{t('levelUp', { level: result.outcome.level })}</p>
          )}
          <div className="row">
            <button className="big-btn" onClick={again} autoFocus>
              {t('playAgain')}
            </button>
            <button className="ghost-btn" onClick={onHome}>
              {t('home')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
