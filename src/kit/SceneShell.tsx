import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useT, type AppKey, type T } from '../i18n'
import { useLatest, useTimeouts } from './hooks'
import type { GameIcon } from './icon'
import { Bunting, Guide, PlaceWindow, RoomBooks, RoomPlant, type PlaceId } from './places'
import { SceneTray, StagePips } from './scene'
import { sound, vibrate } from './sound'
import type { RoundResult, Sticker } from './types'

export type GuideMood = 'idle' | 'happy' | 'oops'

export interface Stage {
  /** Tasks finished so far. */
  done: number
  total: number
  /** True once the last task is done and `onFinish` has been called. */
  over: boolean
  mood: GuideMood
  /** A task is done. Plays the sound, lets the guide hop and ends the stage after the last one. Returns true when the stage is over. */
  good: (points?: number) => boolean
  /** A wrong try: nothing is lost, the guide shakes its head and the stage's accuracy drops a little. */
  slip: () => void
  /** A task that could not be tried again went wrong: the stage moves on without it. Silent; returns true when the stage is over. */
  miss: () => boolean
}

/**
 * The bookkeeping of a stage: `total` tasks, no clock and no way to lose. Reports the result through `onFinish`
 * exactly once, with an accuracy that only wrong tries lower.
 */
export function useStage(total: number, onFinish: (r: RoundResult) => void): Stage {
  const [done, setDone] = useState(0)
  const [over, setOver] = useState(false)
  const [mood, setMood] = useState<GuideMood>('idle')
  const s = useRef({ done: 0, slips: 0, missed: 0, score: 0, over: false })
  const finish = useLatest(onFinish)
  const later = useTimeouts()

  const flash = useCallback(
    (m: GuideMood) => {
      setMood(m)
      later(() => setMood((now) => (now === m ? 'idle' : now)), 700)
    },
    [later],
  )

  const close = useCallback(() => {
    const st = s.current
    if (st.done < total) return false
    st.over = true
    setOver(true)
    finish.current({ score: st.score, accuracy: (total - st.missed) / (total + st.slips) })
    return true
  }, [finish, total])

  const good = useCallback(
    (points = 10) => {
      const st = s.current
      if (st.over) return true
      st.done++
      st.score += points
      setDone(st.done)
      sound.good(st.done)
      flash('happy')
      return close()
    },
    [close, flash],
  )

  const miss = useCallback(() => {
    const st = s.current
    if (st.over) return true
    st.done++
    st.missed++
    setDone(st.done)
    flash('oops')
    return close()
  }, [close, flash])

  const slip = useCallback(() => {
    const st = s.current
    if (st.over) return
    st.slips++
    sound.bad()
    vibrate(40)
    flash('oops')
  }, [flash])

  return { done, total, over, mood, good, slip, miss }
}

/**
 * The shared scene of a game: the room of its place on the map, the place's character saying what to do,
 * the stage's stars, and the game's own board on a sheet of paper in the middle.
 */
export function SceneShell({
  place,
  say,
  stage,
  tray,
  bare = false,
  fill = false,
  className = '',
  guide,
  children,
}: {
  place: PlaceId
  /** What the character says: the task, in one short sentence. */
  say: ReactNode
  stage: Pick<Stage, 'done' | 'total' | 'over' | 'mood'>
  /** Things to tap that belong at the bottom edge (answers, tools). */
  tray?: ReactNode
  /** The game draws its own playing field: no paper sheet behind it. */
  bare?: boolean
  /** The board takes all the room there is, instead of only what it needs. */
  fill?: boolean
  className?: string
  /** Another character for this game instead of the place's own (a `<CritterGuide>`). */
  guide?: ReactNode
  children: ReactNode
}) {
  const t = useT()
  return (
    <div className={`scene sg sg-${place} ${className}`}>
      <div className="sg-room" aria-hidden>
        <RoomPlant />
        <RoomBooks />
      </div>
      <div className="sg-wall">
        <Bunting />
        <PlaceWindow place={place} />
        <p className="scene-bubble sg-bubble" role="status" aria-live="polite">
          {say}
        </p>
        <span className={`sg-guide sg-${stage.mood}`}>
          {guide ?? <Guide place={place} />}
        </span>
      </div>
      <StagePips done={stage.done} total={stage.total} label={t('scene.progress', { n: stage.done, total: stage.total })} />
      <div className={`sg-board${bare ? '' : ' sg-sheet'}${fill ? ' sg-fill' : ''}`}>{children}</div>
      {tray && <SceneTray hidden={stage.over}>{tray}</SceneTray>}
    </div>
  )
}

const medalColors = ['#d98a4e', '#b9c2d0', '#f2c14e']

/** Three stickers for a game without drawn ones of its own: its icon as a bronze, a silver and a gold medal. */
export function medals(icon: GameIcon): Sticker[] {
  return medalColors.map((color, medal) => ({
    medal: medal as 0 | 1 | 2,
    icon: [
      ['accent', color, <circle cx="24" cy="24" r="21.5" />],
      ['base', '#fffaf0', <circle cx="24" cy="24" r="16.5" />],
      ...icon.map(([role, c, shape]): GameIcon[number] => [role, c, <g transform="translate(24 24) scale(0.58) translate(-24 -24)">{shape}</g>]),
    ],
  }))
}

/** A sticker's name: its own from the game's strings, or "Gold <game>" for a medal. */
export function stickerName(s: Sticker, gt: T, t: ReturnType<typeof useT>) {
  return s.medal !== undefined ? t(`stickers.medal${s.medal}` as AppKey, { title: gt('title') }) : gt(s.name ?? 'title')
}
