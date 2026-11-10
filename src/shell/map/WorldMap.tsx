import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { games } from '../../games/registry'
import { makeGameT, useLocale, useT } from '../../i18n'
import { useSize } from '../../kit/hooks'
import { Icon } from '../../kit/icon'
import { currentStreak, dailyDoneToday, gameProgress, loadProgress, stickerCount } from '../../kit/progress'
import { sound } from '../../kit/sound'
import { gameColorVars } from '../../kit/theme'
import { dailyGame } from '../Home'
import mapArt from './map.webp'
import { MAP_H, MAP_W, mapScale, placeGames, regions } from './regions'

const SCROLL_KEY = 'lg.map.x'
const STAR = 'M0 -14 L4.1 -5.6 L13.3 -4.3 L6.6 2.1 L8.2 11.3 L0 7 L-8.2 11.3 L-6.6 2.1 L-13.3 -4.3 L-4.1 -5.6 Z'

type StarState = 'done' | 'next' | 'todo'

/** A game's mark on the map: a round badge with a star. Gold once played; the next one to try in a region has a ring and bobs. */
function StarMark({ state }: { state: StarState }) {
  const done = state === 'done'
  return (
    <svg viewBox="-30 -30 60 60" aria-hidden focusable="false">
      {state === 'next' && <circle className="wm-ring" r="27" />}
      <ellipse className="wm-shade" cx="1" cy="4" rx="20" ry="19" />
      <circle r="20" fill={done ? '#ffd24a' : '#fffaf0'} />
      <path d="M-15 -13 A20 20 0 0 1 13 -15 A26 26 0 0 0 -15 -13Z" fill="#fff" opacity={done ? 0.55 : 0.9} />
      <path d={STAR} transform="scale(0.86)" fill={done ? '#fffaf0' : '#7c5ce0'} stroke={done ? '#fffaf0' : '#7c5ce0'} strokeWidth="4" strokeLinejoin="round" />
      <path d="M0 -14 L4.1 -5.6 L13.3 -4.3 L6.6 2.1 L8.2 11.3 L0 7 Z" transform="scale(0.86)" fill={done ? '#f6e3a8' : '#5a3fc0'} opacity="0.7" />
    </svg>
  )
}

/**
 * The home screen: a storybook map with a landscape for every group of skills and a star for every game.
 * On a phone it is as tall as the screen and is dragged sideways; a wide window shows all of it.
 */
export function WorldMap({
  onPlay,
  onAllGames,
  onStickers,
}: {
  onPlay: (id: string, daily?: boolean) => void
  onAllGames: () => void
  onStickers: () => void
}) {
  const t = useT()
  const locale = useLocale()
  const progress = useMemo(loadProgress, [])
  const placed = useMemo(() => placeGames(games), [])
  const [wrap, size] = useSize<HTMLDivElement>({ w: 390, h: 800 })
  const scale = mapScale(size.w, size.h)
  const scroller = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ left: false, right: false })
  const [openId, setOpenId] = useState<string | null>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null)

  const daily = dailyGame()
  const dailyDone = dailyDoneToday(progress)
  const streak = currentStreak(progress)
  const played = (id: string) => gameProgress(progress, id).plays > 0
  const starCount = games.filter((g) => played(g.meta.id)).length
  const stickers = games.reduce((n, g) => n + stickerCount(progress, g.meta.id), 0)
  // In every region the first game not tried yet is the one to play next.
  const nextIds = new Set(regions.map((r) => placed.find((p) => p.region === r && !played(p.game.meta.id))?.game.meta.id))
  const open = placed.find((p) => p.game.meta.id === openId)

  const syncEdges = () => {
    const el = scroller.current
    if (!el) return
    setEdge((e) => {
      const left = el.scrollLeft > 4
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
      return e.left === left && e.right === right ? e : { left, right }
    })
  }

  // Come back to the part of the map the player was looking at.
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    try {
      el.scrollLeft = Number(sessionStorage.getItem(SCROLL_KEY) ?? 0) * scale
    } catch {
      // storage unavailable
    }
    syncEdges()
  }, [scale, size.w])

  const onScroll = () => {
    syncEdges()
    try {
      sessionStorage.setItem(SCROLL_KEY, String((scroller.current?.scrollLeft ?? 0) / scale))
    } catch {
      // storage unavailable
    }
  }

  // Fingers scroll by themselves; a mouse drags the map.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current
      const el = scroller.current
      if (!d || !el) return
      if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 6) d.moved = true
      el.scrollLeft = d.left - (e.clientX - d.x)
      el.scrollTop = d.top - (e.clientY - d.y)
    }
    const up = () => {
      const d = drag.current
      // The click that ends a drag must not open a game: forget the drag only after that click has passed.
      if (d) setTimeout(() => drag.current === d && (drag.current = null), 0)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  const step = (dir: number) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.7, behavior: 'smooth' })
  const pick = (id: string | null) => {
    sound.tap()
    setOpenId(id)
  }

  return (
    <div className="wm" ref={wrap}>
      <div
        className="wm-scroll"
        ref={scroller}
        onScroll={onScroll}
        onPointerDown={(e) => {
          const el = scroller.current
          if (e.pointerType === 'mouse' && e.button === 0 && el) drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false }
        }}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.stopPropagation()
            e.preventDefault()
          }
        }}
        onClick={() => openId && setOpenId(null)}
      >
        <div className="wm-map" style={{ width: MAP_W * scale, height: MAP_H * scale }}>
          <div className="wm-inner" style={{ width: MAP_W, height: MAP_H, transform: `scale(${scale})`, backgroundImage: `url(${mapArt})` }}>
            <h1 className="wm-ribbon">{t('map.title')}</h1>
            {regions.map((r) => (
              <div key={r.id} className="wm-label" style={{ left: r.label[0], top: r.label[1] }}>
                <span className="wm-label-name">{t(r.name)}</span>
                <span className="wm-label-skills">{r.skills.map((s) => t(`skill.${s}`).toLowerCase()).join(', ')}</span>
              </div>
            ))}
            {placed.map(({ game, x, y }) => {
              const id = game.meta.id
              const state: StarState = played(id) ? 'done' : nextIds.has(id) ? 'next' : 'todo'
              const title = makeGameT(game.strings, locale)('title')
              return (
                <button
                  key={id}
                  className={`wm-star wm-${state}${openId === id ? ' wm-open' : ''}`}
                  style={{ left: x, top: y }}
                  aria-label={title}
                  title={title}
                  onClick={(e) => {
                    e.stopPropagation()
                    pick(openId === id ? null : id)
                  }}
                >
                  <StarMark state={state} />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="wm-top">
        <button className="wm-pill" onClick={onAllGames} aria-label={t('map.allGames')} title={t('map.allGames')}>
          <svg viewBox="0 0 24 24" className="wm-pill-icon" aria-hidden focusable="false">
            <path d="M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z" />
          </svg>
          <span className="wm-pill-text">{t('map.allGames')}</span>
        </button>
        <span className="wm-top-gap" />
        <span className="wm-pill wm-gold" role="img" aria-label={t('map.stars', { n: starCount })} title={t('map.starsHint')}>
          ★ {starCount}
        </span>
        {streak >= 2 && (
          <span className="wm-pill wm-red" role="img" aria-label={`${t('streakHint')}: ${streak}`} title={t('streakHint')}>
            🔥 {streak}
          </span>
        )}
        <button className="wm-pill" onClick={onStickers} aria-label={t('stickers.open', { n: stickers })} title={t('stickers.title')}>
          <svg viewBox="0 0 24 24" className="wm-pill-icon wm-sticker-icon" aria-hidden focusable="false">
            <path d="M5 3h14a2 2 0 0 1 2 2v9l-7 7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path className="wm-fold" d="M21 14h-5a2 2 0 0 0-2 2v5z" />
          </svg>
          {stickers}
        </button>
      </div>

      {edge.left && (
        <button className="wm-arrow wm-arrow-left" onClick={() => step(-1)} aria-label={t('map.left')}>
          <svg viewBox="0 0 24 24" aria-hidden focusable="false">
            <path d="M15 5 L8 12 L15 19" />
          </svg>
        </button>
      )}
      {edge.right && (
        <button className="wm-arrow wm-arrow-right" onClick={() => step(1)} aria-label={t('map.right')}>
          <svg viewBox="0 0 24 24" aria-hidden focusable="false">
            <path d="M9 5 L16 12 L9 19" />
          </svg>
        </button>
      )}

      {open ? (
        <div className="wm-card" role="dialog" aria-label={makeGameT(open.game.strings, locale)('title')} style={gameColorVars(open.game.meta.color)}>
          <span className="wm-card-icon">
            <Icon icon={open.game.meta.icon} />
          </span>
          <span className="wm-card-text">
            <b>{makeGameT(open.game.strings, locale)('title')}</b>
            <small>
              {t(open.region.name)} · {t(`skill.${open.game.meta.skill}`)}
            </small>
          </span>
          <button className="scene-btn" onClick={() => onPlay(open.game.meta.id)} autoFocus>
            {t('play')}
          </button>
          <button className="wm-card-close" onClick={() => pick(null)} aria-label={t('map.close')}>
            ✕
          </button>
        </div>
      ) : (
        <button className="wm-daily" onClick={() => onPlay(daily.meta.id, true)}>
          <span className="wm-daily-icon">
            <Icon icon={daily.meta.icon} />
          </span>
          <span className="wm-daily-text">
            <b>{t('map.adventure')}</b>
            <small>{makeGameT(daily.strings, locale)('title')}</small>
          </span>
          <span className={`wm-daily-go${dailyDone ? ' wm-daily-done' : ''}`} aria-label={dailyDone ? t('doneToday') : undefined}>
            {dailyDone ? '✓' : '▶'}
          </span>
        </button>
      )}
    </div>
  )
}
