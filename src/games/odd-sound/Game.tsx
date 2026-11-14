import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { SceneTool } from '../../kit/scene'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { BirdArt, Branch, LakeArt } from './Art'
import { makeTask, NOTE_MS, SCALE, STAGE, startTimes, type Task } from './logic'

/** Pause before the first bird sings, in ms. */
const LEAD = 600

export default function OddSound({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const nextId = useRef(0)
  const lastOdd = useRef(-1)
  const newRound = () => {
    const task: Task = makeTask(rng, level, lastOdd.current)
    lastOdd.current = task.odd
    return { id: nextId.current++, task }
  }
  const [round, setRound] = useState(newRound)
  // Bumped by the listen button to sing the songs again.
  const [play, setPlay] = useState(0)
  const [singing, setSinging] = useState(-1)
  const [listening, setListening] = useState(true)
  const [wrong, setWrong] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const { task } = round

  // The birds sing one after another; the notes are scheduled on the audio clock, the beaks follow with timers.
  useEffect(() => {
    const timers: number[] = []
    const notes: (OscillatorNode | undefined)[] = []
    const starts = startTimes(task)
    setListening(true)
    task.songs.forEach((song, b) => {
      const at = LEAD + starts[b]
      timers.push(window.setTimeout(() => setSinging(b), at))
      song.forEach((n, k) => notes.push(sound.tone(SCALE[n], 0.24, 'triangle', 0.22, (at + k * NOTE_MS) / 1000)))
      timers.push(window.setTimeout(() => setSinging(-1), at + song.length * NOTE_MS))
    })
    const end = LEAD + starts[starts.length - 1] + task.songs[task.songs.length - 1].length * NOTE_MS
    timers.push(window.setTimeout(() => setListening(false), end))
    return () => {
      timers.forEach(clearTimeout)
      notes.forEach((o) => {
        try {
          o?.stop()
        } catch {
          // already stopped
        }
      })
      setSinging(-1)
    }
  }, [task, play])

  const pick = (b: number) => {
    if (stage.over || solved || listening) return
    if (b !== task.odd) {
      stage.slip()
      setWrong(b)
      return
    }
    setSolved(true)
    setWrong(null)
    if (stage.good()) return
    later(() => {
      setSolved(false)
      setRound(newRound())
    }, 1500)
  }

  const say = solved
    ? t('yes')
    : wrong !== null
      ? t('no')
      : sound.isMuted()
        ? t('mute')
        : listening
          ? t('listen')
          : t('say')

  return (
    <SceneShell
      place="lake"
      say={say}
      stage={stage}
      bare
      fill
      className="odd-sound"
      tray={
        <SceneTool
          kind="listen"
          label={t('again')}
          onPress={() => {
            setWrong(null)
            setPlay((p) => p + 1)
          }}
          disabled={listening || solved}
        />
      }
    >
      <div className={`os-field os-n${task.songs.length}`}>
        <LakeArt />
        <div className="os-perch">
          <Branch />
          <div className="os-birds">
            {task.songs.map((_, b) => {
              const cls =
                solved && b === task.odd ? ' os-hop' : solved ? ' os-rest' : wrong === b ? ' os-no' : singing === b ? ' os-sing' : ''
              return (
                <button
                  key={`${round.id}-${b}`}
                  className={`os-bird${cls}`}
                  style={{ animationDelay: `${b * 90}ms` }}
                  onPointerDown={() => pick(b)}
                  onAnimationEnd={(e) => e.animationName === 'psNo' && setWrong(null)}
                  disabled={stage.over}
                  aria-label={t('bird', { n: b + 1 })}
                >
                  <BirdArt color={b} singing={singing === b} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </SceneShell>
  )
}
