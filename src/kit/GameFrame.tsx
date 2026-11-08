import { Suspense, lazy, useEffect, useMemo, useState, type ComponentType } from 'react'
import { makeGameT, useLocale, useT } from '../i18n'
import { useTimeouts } from './hooks'
import { Icon } from './icon'
import { MAX_LEVEL, gameProgress, loadProgress, recordRound, setLevel, stars, type RecordOutcome } from './progress'
import { randomSeed } from './random'
import { shareUrl } from './share'
import { ShareButton } from './ShareButton'
import { sound } from './sound'
import { gameColorVars } from './theme'
import type { GameDef, GameProps, RoundResult } from './types'
import { Confetti } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

// One lazy component per game, kept for the whole visit, so "play again" never shows the loading state twice.
const lazyGames = new WeakMap<GameDef, ComponentType<GameProps>>()
function gameComponent(game: GameDef) {
  let c = lazyGames.get(game)
  if (!c) {
    // A failed download (offline) is forgotten, so "try again" downloads again.
    const load = () => game.load().catch((e: unknown) => (lazyGames.delete(game), Promise.reject(e)))
    lazyGames.set(game, (c = lazy(load)))
  }
  return c
}

type Phase = 'intro' | 'countdown' | 'playing' | 'results'

/**
 * Everything around a game: intro card, 3-2-1 countdown, the round itself, results.
 * Games only render the round and call `onFinish` once.
 */
export function GameFrame({
  game,
  seed,
  daily = false,
  onHome,
  onNext,
}: {
  game: GameDef
  seed?: number
  /** Playing today's daily challenge: a finished round marks it done on the home screen. */
  daily?: boolean
  onHome: () => void
  /** Offers another game on the results card. */
  onNext?: () => void
}) {
  const locale = useLocale()
  const t = useT()
  const gt = useMemo(() => makeGameT(game.strings, locale), [game, locale])
  const [phase, setPhase] = useState<Phase>('intro')
  const [count, setCount] = useState(3)
  const [round, setRound] = useState(0)
  const [roundSeed, setRoundSeed] = useState(() => seed ?? randomSeed())
  const [result, setResult] = useState<{ score: number; accuracy: number; outcome: RecordOutcome } | null>(null)
  const later = useTimeouts()
  const [, setPicked] = useState(0)
  const progress = gameProgress(loadProgress(), game.meta.id)
  const pickLevel = (level: number) => {
    sound.tap()
    setLevel(game.meta.id, level)
    setPicked((n) => n + 1)
  }

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
    // Start downloading the game now, so it is ready by the end of the countdown.
    void game.load().catch(() => {})
    sound.tap()
    setCount(3)
    setPhase('countdown')
  }

  const finish = (r: RoundResult) => {
    const outcome = recordRound(game.meta.id, game.meta.skill, r, new Date(), daily)
    setResult({ ...r, outcome })
    if (outcome.newRecord || stars(r.accuracy) === 3) sound.win()
    later(() => setPhase('results'), 700)
  }

  const again = () => {
    setRound((n) => n + 1)
    setRoundSeed(randomSeed())
    start()
  }

  // Shared links open the game itself (not the daily challenge, which changes every day) in the player's language.
  const gameUrl = () => shareUrl(`#/play/${game.meta.id}`, locale)

  const Component = gameComponent(game)
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
        {/* Not while playing, so a stray tap never pulls a child out of a round. */}
        {(phase === 'intro' || phase === 'results') && (
          <ShareButton hint={t('share.game')} data={() => ({ title: gt('title'), text: t('share.gameText', { game: gt('title') }), url: gameUrl() })} />
        )}
      </header>

      {phase === 'intro' && (
        <div className="card intro">
          <div className="intro-icon">
            <Icon icon={game.meta.icon} />
          </div>
          <h1>{gt('title')}</h1>
          <p className="howto">{gt('howTo')}</p>
          <p className="muted">{progress.best > 0 ? t('best', { score: progress.best }) : t('noBestYet')}</p>
          <div className="level-pick" role="group" aria-label={t('pickLevel')}>
            <button className="level-step" onClick={() => pickLevel(progress.level - 1)} disabled={progress.level <= 1} aria-label={t('easier')}>
              −
            </button>
            <span className="level-now" aria-live="polite">
              {t('level', { level: progress.level })}
            </span>
            <button className="level-step" onClick={() => pickLevel(progress.level + 1)} disabled={progress.level >= MAX_LEVEL} aria-label={t('harder')}>
              +
            </button>
          </div>
          <button className="big-btn" onClick={start} autoFocus>
            {t('play')}
          </button>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="countdown">
          <span key={count} className="countdown-num">
            {count > 0 ? count : t('go')}
          </span>
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
            <Suspense fallback={<div className="game-loading">{t('loading')}</div>}>
              <Component level={progress.level} seed={roundSeed} t={gt} onFinish={finish} />
            </Suspense>
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
            {onNext && (
              <button className="big-btn next-btn" onClick={onNext}>
                {t('nextGame')}
              </button>
            )}
            <button className="ghost-btn" onClick={onHome}>
              {t('home')}
            </button>
          </div>
          <ShareButton
            label={t('share.score')}
            up
            hint={t('share.score')}
            data={() => ({ title: gt('title'), text: t('share.scoreText', { score: result.score, game: gt('title') }), url: gameUrl() })}
          />
        </div>
      )}
    </div>
  )
}
