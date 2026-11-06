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
})
