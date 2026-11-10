import { useMemo, useState } from 'react'
import { games } from '../games/registry'
import { makeGameT, useLocale, useT, type Locale } from '../i18n'
import { Icon } from '../kit/icon'
import { Guide, type PlaceId } from '../kit/places'
import { currentStreak, dailyDoneToday, gameProgress, isFavourite, isIosBrowser, loadProgress, stickerCount, toggleFavourite } from '../kit/progress'
import { daySeed, makeRng } from '../kit/random'
import { gameColorVars } from '../kit/theme'
import type { GameDef } from '../kit/types'
import { FavButton, Heart } from './FavButton'
import { AUTHOR, facebookUrl, portfolioUrl, SUPPORT_URL } from './contact'
import { logoIcon } from './logo'
import { regions } from './map/regions'
import { TeaCup } from './TeaCup'
import { Tools } from './Tools'


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

/**
 * Every game on one page, as the index of the storybook: one panel for each region of the map, with its character,
 * and the games as paper cards. The stars on a card are the game's stickers, gold once they are won.
 */
export function Home({
  onPlay,
  onLocale,
  onMap,
}: {
  onPlay: (id: string, daily?: boolean) => void
  onLocale: (locale: Locale) => void
  /** Back to the map. */
  onMap: () => void
}) {
  const t = useT()
  const locale = useLocale()
  const [progress, setProgress] = useState(loadProgress)
  const daily = dailyGame()
  const dailyDone = dailyDoneToday(progress)
  const streak = currentStreak(progress)
  const iosTip = useMemo(() => isIosBrowser(), [])
  const fresh = useMemo(() => newGameIds(), [])
  // New games come first in their region, newest first, so kids spot them straight away.
  const rank = (g: GameDef) => {
    const i = [...fresh].indexOf(g.meta.id)
    return i < 0 ? fresh.size : i
  }
  // The author's name is a link, so split the sentence around it (word order differs between languages).
  const madeBy = t('madeBy', { name: '\u0000' }).split('\u0000')

  const favourites = (progress.favourites ?? []).flatMap((f) => games.find((g) => g.meta.id === f.id) ?? [])

  // A card is a box with two buttons side by side in the markup: the game itself and its heart.
  const card = (g: GameDef) => {
    const gt = makeGameT(g.strings, locale)
    const total = g.stickers?.length ?? 0
    const have = stickerCount(progress, g.meta.id)
    const played = gameProgress(progress, g.meta.id).plays > 0
    return (
      <div key={g.meta.id} className={`book-card${played ? ' book-played' : ''}`} style={gameColorVars(g.meta.color)}>
        <button className="book-card-play" onClick={() => onPlay(g.meta.id)}>
          <span className="book-card-icon">
            <Icon icon={g.meta.icon} />
          </span>
          <span className="book-card-title">{gt('title')}</span>
          {total > 0 && (
            <span className="book-card-stars" role="img" aria-label={t('stickers.count', { n: have, total })}>
              {Array.from({ length: total }, (_, i) => (
                <i key={i} className={i < have ? 'book-star-on' : undefined}>
                  ★
                </i>
              ))}
            </span>
          )}
        </button>
        <FavButton on={isFavourite(progress, g.meta.id)} onToggle={() => setProgress(toggleFavourite(g.meta.id))} />
        {fresh.has(g.meta.id) && <span className="book-new">{t('new')}</span>}
      </div>
    )
  }

  return (
    <div className="book">
      <div className="book-in">
        <div className="book-top">
          <button className="wm-pill" onClick={onMap}>
            <svg viewBox="0 0 24 24" className="wm-pill-icon" aria-hidden focusable="false">
              <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
              <path d="M9 4v14M15 6v14" fill="none" stroke="#fffaf0" strokeWidth="1.6" />
            </svg>
            {t('map.open')}
          </button>
          <span className="wm-top-gap" />
          <Tools onLocale={onLocale} />
        </div>

        <header className="book-head">
          <p className="book-brand">
            <Icon icon={logoIcon} className="book-logo" />
            {t('appName')}
          </p>
          <h1 className="book-ribbon">{t('map.allGames')}</h1>
        </header>

        <button className="book-daily" onClick={() => onPlay(daily.meta.id, true)}>
          <span className="wm-daily-icon">
            <Icon icon={daily.meta.icon} />
          </span>
          <span className="wm-daily-text">
            <b>{t('map.adventure')}</b>
            <small>{makeGameT(daily.strings, locale)('title')}</small>
          </span>
          {streak >= 2 && (
            <span className="book-streak" title={t('streakHint')}>
              🔥 {t('streakDays', { n: streak })}
            </span>
          )}
          <span className={`wm-daily-go${dailyDone ? ' wm-daily-done' : ''}`} aria-label={dailyDone ? t('doneToday') : undefined}>
            {dailyDone ? '✓' : '▶'}
          </span>
        </button>

        {favourites.length > 0 && (
          <section className="book-region book-favs" aria-labelledby="book-favs">
            <header className="book-band">
              <span className="book-guide book-guide-heart">
                <Heart />
              </span>
              <h2 id="book-favs">{t('fav.title')}</h2>
            </header>
            <div className="book-grid">{favourites.map(card)}</div>
          </section>
        )}

        {regions.map((r) => {
          const list = games.filter((g) => r.skills.includes(g.meta.skill)).sort((a, b) => rank(a) - rank(b))
          if (!list.length) return null
          return (
            <section key={r.id} className={`book-region book-${r.id}`} aria-labelledby={`book-${r.id}`}>
              <header className="book-band">
                <span className="book-guide">
                  <Guide place={r.id as PlaceId} />
                </span>
                <h2 id={`book-${r.id}`}>{t(r.name)}</h2>
                <small>{r.skills.map((s) => t(`skill.${s}`).toLowerCase()).join(', ')}</small>
              </header>
              <div className="book-grid">
                {list.map(card)}
              </div>
            </section>
          )
        })}

        <footer className="book-foot">
          <span className="book-foot-label">{t('forGrownUps')}</span>
          {iosTip && <p className="book-foot-tip">{t('iosTip')}</p>}
          <a className="book-support" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" title={t('supportHint')} aria-label={t('supportHint')}>
            <TeaCup /> {t('support')}
          </a>
          <span className="book-foot-credit">
            {madeBy[0]}
            <a href={portfolioUrl(locale)} target="_blank" rel="noopener noreferrer">
              {AUTHOR}
            </a>
            {madeBy[1]}
            {' · '}
            <a href={facebookUrl(locale)} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            {' · '}
            <a href="#/privacy">{t('privacyLink')}</a>
          </span>
        </footer>
      </div>
    </div>
  )
}
