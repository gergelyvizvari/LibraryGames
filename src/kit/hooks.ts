import { useCallback, useEffect, useRef, useState } from 'react'

/** Keeps a ref pointing at the latest value, so effects can call fresh callbacks without restarting. */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

/** Calls `step(dtSeconds)` every animation frame while `running` is true. */
export function useGameLoop(step: (dt: number) => void, running = true) {
  const stepRef = useLatest(step)
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    let frame = requestAnimationFrame(function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      stepRef.current(dt)
      frame = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(frame)
  }, [running, stepRef])
}

/** Counts down from `seconds`, calling `onEnd` once at zero. Returns seconds left (fractional). */
export function useCountdown(seconds: number, onEnd: () => void, running = true) {
  const [left, setLeft] = useState(seconds)
  const leftRef = useRef(seconds)
  const endRef = useLatest(onEnd)
  useGameLoop((dt) => {
    if (leftRef.current <= 0) return
    leftRef.current = Math.max(0, leftRef.current - dt)
    setLeft(leftRef.current)
    if (leftRef.current === 0) endRef.current()
  }, running && left > 0)
  return left
}

/** Runs `fn` every `ms` while `ms` is not null. */
export function useInterval(fn: () => void, ms: number | null) {
  const fnRef = useLatest(fn)
  useEffect(() => {
    if (ms === null) return
    const id = setInterval(() => fnRef.current(), ms)
    return () => clearInterval(id)
  }, [ms, fnRef])
}

/** setTimeout that is cleared automatically when the component unmounts. */
export function useTimeouts() {
  const ids = useRef<number[]>([])
  useEffect(() => () => ids.current.forEach(clearTimeout), [])
  return useCallback((fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms))
  }, [])
}

export type PopKind = 'good' | 'bad' | 'info'
export interface Pop {
  id: number
  text: string
  x: number
  y: number
  kind: PopKind
}

let popId = 0
/** Floating "+10" style feedback. x and y are percentages of the play area. */
export function usePops() {
  const [pops, setPops] = useState<Pop[]>([])
  const later = useTimeouts()
  const add = useCallback(
    (text: string, x = 50, y = 40, kind: PopKind = 'good') => {
      const id = ++popId
      setPops((p) => [...p, { id, text, x, y, kind }])
      later(() => setPops((p) => p.filter((q) => q.id !== id)), 900)
    },
    [later],
  )
  return [pops, add] as const
}

/** Brief CSS shake on the element holding the ref. */
export function useShake<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const shake = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.classList.remove('shake')
    void el.offsetWidth
    el.classList.add('shake')
  }, [])
  return [ref, shake] as const
}

/** The size of the element holding the ref, in CSS pixels, kept up to date as the window changes. */
export function useSize<T extends Element>(initial = { w: 390, h: 560 }) {
  const ref = useRef<T>(null)
  const [size, setSize] = useState(initial)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      if (r.width && r.height) setSize((s) => (s.w === r.width && s.h === r.height ? s : { w: r.width, h: r.height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}
