import { useMemo, useState } from 'react'
import { games } from '../games/registry'
import { makeGameT, useLocale, useT } from '../i18n'
import { gameProgress, loadProgress } from '../kit/progress'
import { daySeed, makeRng } from '../kit/random'
import { sound } from '../kit/sound'
import { skills, type GameDef, type Skill } from '../kit/types'

const NEW_DAYS = 7

export function dailyGame(date = new Date()) {
  return makeRng(daySeed(date)).pick(games)
}

function isNew(g: GameDef, today = new Date()) {
  return (today.getTime() - new Date(g.meta.added).getTime()) / 86_400_000 < NEW_DAYS
}

export function Home({ onPlay }: { onPlay: (id: string, daily?: boolean) => void }) {
  const t = useT()
  const locale = useLocale()
  const [filter, setFilter] = useState<Skill | 'all'>('all')
  const [muted, setMuted] = useState(sound.isMuted())
  const progress = useMemo(loadProgress, [])
  const daily = dailyGame()
  const dailyT = makeGameT(daily.strings, locale)
  const usedSkills = skills.filter((s) => games.some((g) => g.meta.skill === s))
  const shown = filter === 'all' ? games : games.filter((g) => g.meta.skill === filter)
  const totalXp = Object.values(progress.xp).reduce((a, b) => a + (b ?? 0), 0)

  return (
    <div className="home">
      <header className="home-head">
        <div>
          <h1>{t('appName')}</h1>
          <p className="muted">{t('tagline')}</p>
        </div>
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
      </header>

      <div className="badges">
        {progress.streak.days > 0 && <span className="badge">🔥 {t('streak', { days: progress.streak.days })}</span>}
        {totalXp > 0 && <span className="badge">⭐ {totalXp} XP</span>}
      </div>

      <button className="daily" style={{ background: daily.meta.color }} onClick={() => onPlay(daily.meta.id, true)}>
        <span className="daily-label">{t('todaysGame')}</span>
        <span className="daily-icon">{daily.meta.icon}</span>
        <span className="daily-title">{dailyT('title')}</span>
      </button>

      <h2>{t('allGames')}</h2>
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
            <button key={g.meta.id} className="game-card" style={{ ['--game-color' as string]: g.meta.color }} onClick={() => onPlay(g.meta.id)}>
              {isNew(g) && <span className="new-tag">NEW</span>}
              <span className="game-card-icon">{g.meta.icon}</span>
              <span className="game-card-title">{gt('title')}</span>
              <span className="game-card-skill">{t(`skill.${g.meta.skill}`)}</span>
              {gp.plays > 0 && (
                <span className="game-card-best">🏆 {gp.best}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
