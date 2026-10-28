import { useMemo, useState } from 'react'
import { games } from '../games/registry'
import { makeGameT, nextLocale, useLocale, useT, type Locale } from '../i18n'
import { Icon } from '../kit/icon'
import { gameProgress, loadProgress } from '../kit/progress'
import { daySeed, makeRng } from '../kit/random'
import { sound } from '../kit/sound'
import { gameColorVars, loadTheme, nextTheme, setTheme, themeIcons } from '../kit/theme'
import { skills, type GameDef, type Skill } from '../kit/types'

/** Shown in a quiet footer for parents, below the games, never inside a game. */
export const SUPPORT_URL = 'https://buymeacoffee.com/gergelyvizvari'
export const AUTHOR = 'Gergely Vizvári'

const NEW_DAYS = 7
/** A NEW label on every card means nothing, so only the few most recently added games get one. */
const MAX_NEW = 3

export function dailyGame(date = new Date()) {
  return makeRng(daySeed(date)).pick(games)
}

/** Ids of the games that get a NEW label: added in the last week, newest first (later in the registry wins ties). */
export function newGameIds(list: GameDef[] = games, today = new Date()) {
  return new Set(
    list
      .map((g, i) => ({ g, i }))
      .filter(({ g }) => (today.getTime() - new Date(g.meta.added).getTime()) / 86_400_000 < NEW_DAYS)
      .sort((a, b) => b.g.meta.added.localeCompare(a.g.meta.added) || b.i - a.i)
      .slice(0, MAX_NEW)
      .map(({ g }) => g.meta.id),
  )
}

export function Home({ onPlay, onLocale }: { onPlay: (id: string, daily?: boolean) => void; onLocale: (locale: Locale) => void }) {
  const t = useT()
  const locale = useLocale()
  const [filter, setFilter] = useState<Skill | 'all'>('all')
  const [muted, setMuted] = useState(sound.isMuted())
  const [theme, setThemeState] = useState(loadTheme)
  const progress = useMemo(loadProgress, [])
  const daily = dailyGame()
  const fresh = useMemo(() => newGameIds(), [])
  // New games come first, newest first, so kids spot them straight away.
  const rank = (g: GameDef) => {
    const i = [...fresh].indexOf(g.meta.id)
    return i < 0 ? fresh.size : i
  }
  const shown = (filter === 'all' ? games : games.filter((g) => g.meta.skill === filter)).slice().sort((a, b) => rank(a) - rank(b))
  const dailyT = makeGameT(daily.strings, locale)
  const usedSkills = skills.filter((s) => games.some((g) => g.meta.skill === s))

  return (
    <div className="home">
      <header className="home-head">
        <h1>{t('appName')}</h1>
        <div className="home-tools">
          <button
            className="icon-btn lang-btn"
            aria-label={t('language', { name: t(`lang.${locale}`) })}
            title={t('language', { name: t(`lang.${locale}`) })}
            onClick={() => onLocale(nextLocale(locale))}
          >
            {locale.toUpperCase()}
          </button>
          <button
            className="icon-btn"
            aria-label={t('theme', { name: t(`theme.${theme}`) })}
            title={t('theme', { name: t(`theme.${theme}`) })}
            onClick={() => {
              const next = nextTheme(theme)
              setTheme(next)
              setThemeState(next)
            }}
          >
            {themeIcons[theme]}
          </button>
          <button
            className="icon-btn"
            aria-label={t('sound')}
            onClick={() => {
              sound.setMuted(!muted)
              setMuted(!muted)
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      <button className="daily" style={gameColorVars(daily.meta.color)} onClick={() => onPlay(daily.meta.id, true)}>
        <span className="daily-label">⭐ {t('todaysGame')}</span>
        <span className="daily-icon" aria-hidden>
          <Icon icon={daily.meta.icon} />
          <i className="daily-sparkle">✨</i>
        </span>
        <span className="daily-title">{dailyT('title')}</span>
        <span className="daily-play">{t('play')}</span>
      </button>

      <div className="filters">
        {(['all', ...usedSkills] as const).map((s) => (
          <button key={s} className={`chip${filter === s ? ' chip-on' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? t('all') : t(`skill.${s}`)}
          </button>
        ))}
      </div>

      <div className="grid">
        {shown.map((g) => {
          const gp = gameProgress(progress, g.meta.id)
          const gt = makeGameT(g.strings, locale)
          return (
            <button key={g.meta.id} className="game-card" style={gameColorVars(g.meta.color)} onClick={() => onPlay(g.meta.id)}>
              {fresh.has(g.meta.id) && <span className="new-tag">{t('new')}</span>}
              <span className="game-card-icon">
                <Icon icon={g.meta.icon} />
              </span>
              <span className="game-card-title">{gt('title')}</span>
              <span className="game-card-foot">
                <span className="game-card-skill">{t(`skill.${g.meta.skill}`)}</span>
                {gp.plays > 0 && <span className="game-card-best">🏆 {gp.best}</span>}
              </span>
            </button>
          )
        })}
      </div>

      <footer className="home-foot">
        <span className="home-foot-label">{t('forGrownUps')}</span>
        <a className="support-link" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" title={t('supportHint')} aria-label={t('supportHint')}>
          <span aria-hidden>🍵</span> {t('support')}
        </a>
        <span className="home-foot-credit">{t('madeBy', { name: AUTHOR })}</span>
      </footer>
    </div>
  )
}
