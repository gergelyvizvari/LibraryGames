import { useEffect } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GameFrame } from './GameFrame'
import type { GameDef } from './types'

const broken: GameDef = {
  meta: { id: 'broken', skill: 'logic', icon: [], color: '#54a0ff', added: '2026-11-06' },
  strings: { en: { title: 'Broken', howTo: 'It breaks.' } },
  load: async () => ({
    default: () => {
      throw new Error('boom')
    },
  }),
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('GameFrame', () => {
  it('shows a friendly card instead of a blank screen when a game crashes', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onHome = vi.fn()
    render(<GameFrame game={broken} onHome={onHome} />)
    fireEvent.click(screen.getByText('Play!'))
    for (let i = 0; i < 5; i++) await act(async () => vi.advanceTimersByTime(700))
    expect(screen.getByRole('alert').textContent).toContain('Oops')
    fireEvent.click(screen.getAllByText('Home').at(-1)!)
    expect(onHome).toHaveBeenCalled()
  })

  it('shows the same card when a game cannot be downloaded, and tries again on "Play again"', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let tries = 0
    const offline: GameDef = { ...broken, meta: { ...broken.meta, id: 'offline' }, load: () => (tries++, Promise.reject(new Error('offline'))) }
    render(<GameFrame game={offline} onHome={() => {}} />)
    fireEvent.click(screen.getByText('Play!'))
    for (let i = 0; i < 5; i++) await act(async () => vi.advanceTimersByTime(700))
    expect(screen.getByRole('alert')).toBeTruthy()
    const before = tries
    fireEvent.click(screen.getByText('Play again'))
    for (let i = 0; i < 5; i++) await act(async () => vi.advanceTimersByTime(700))
    expect(tries).toBeGreaterThan(before)
  })

  it('lets the player share their score from the results card', async () => {
    vi.useFakeTimers()
    const quick: GameDef = {
      ...broken,
      meta: { ...broken.meta, id: 'quick' },
      strings: { en: { title: 'Quick', howTo: 'It ends.' } },
      load: async () => ({
        default: ({ onFinish }) => {
          // Once, like a real game.
          useEffect(() => onFinish({ score: 42, accuracy: 1 }), [])
          return null
        },
      }),
    }
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<GameFrame game={quick} onHome={() => {}} />)
    fireEvent.click(screen.getByText('Play!'))
    for (let i = 0; i < 8; i++) await act(async () => vi.advanceTimersByTime(700))
    fireEvent.click(screen.getByText('Share my score'))
    const facebook = screen.getByText('Facebook').closest('a')!
    expect(facebook.getAttribute('href')).toMatch(/^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=.*%3Flang%3Den%23%2Fplay%2Fquick$/)
    await act(async () => fireEvent.click(screen.getByText('Copy link')))
    expect(writeText.mock.calls[0][0]).toMatch(/^I scored 42 points in Quick! .*\?lang=en#\/play\/quick$/)
    expect(screen.getByText('Link copied!').getAttribute('role')).toBe('status')
  })

  it('plays a scene game without intro or score, and ends a stage with a sticker', async () => {
    vi.useFakeTimers()
    localStorage.clear()
    const scene: GameDef = {
      ...broken,
      meta: { ...broken.meta, id: 'scene', scene: true },
      strings: { en: { title: 'Scene', howTo: 'It ends.', 'sticker.one': 'First sticker' } },
      stickers: [{ name: 'sticker.one', icon: [] }],
      load: async () => ({
        default: ({ onFinish }) => {
          useEffect(() => onFinish({ score: 10, accuracy: 1 }), [])
          return <p>the scene</p>
        },
      }),
    }
    const onHome = vi.fn()
    render(<GameFrame game={scene} onHome={onHome} />)
    for (let i = 0; i < 4; i++) await act(async () => vi.advanceTimersByTime(500))
    expect(screen.queryByText('Play!')).toBeNull()
    expect(screen.getByText('the scene')).toBeTruthy()
    expect(screen.getByText('First sticker')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('lg.progress.v1')!).stickers).toEqual({ scene: 1 })
    // The next stage starts straight away; the album is full, so it ends without a new sticker.
    fireEvent.click(screen.getByText('On to stage 2'))
    for (let i = 0; i < 4; i++) await act(async () => vi.advanceTimersByTime(500))
    expect(screen.queryByText('First sticker')).toBeNull()
    expect(screen.getByText('On to stage 3')).toBeTruthy()
    fireEvent.click(screen.getAllByText('Back to the map').at(-1)!)
    expect(onHome).toHaveBeenCalled()
  })
})
