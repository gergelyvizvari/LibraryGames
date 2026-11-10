import { useEffect } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { isFavourite, loadProgress } from './progress'
import { SceneFrame } from './SceneFrame'
import { medals } from './SceneShell'
import type { GameDef } from './types'

const icon: GameDef['meta']['icon'] = [['base', '#ffcc00', <circle cx="24" cy="24" r="20" />]]
const quick: GameDef = {
  meta: { id: 'quick-scene', skill: 'logic', icon, color: '#54a0ff', added: '2026-11-10', scene: true },
  strings: { en: { title: 'Quick', howTo: 'It ends.' } },
  stickers: medals(icon),
  load: async () => ({
    default: ({ onFinish }) => {
      useEffect(() => onFinish({ score: 10, accuracy: 1 }), [])
      return null
    },
  }),
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.useRealTimers()
})

describe('SceneFrame', () => {
  it('keeps the game among the favourites from inside the game', () => {
    render(<SceneFrame game={quick} onHome={() => {}} />)
    fireEvent.click(screen.getByLabelText('Add to favourites'))
    expect(isFavourite(loadProgress(), 'quick-scene')).toBe(true)
    fireEvent.click(screen.getByLabelText('Remove from favourites'))
    expect(isFavourite(loadProgress(), 'quick-scene')).toBe(false)
  })

  it("shows all of the game's stickers when the new sticker is tapped", async () => {
    vi.useFakeTimers()
    render(<SceneFrame game={quick} onHome={() => {}} />)
    for (let i = 0; i < 4; i++) await act(async () => vi.advanceTimersByTime(500))
    fireEvent.click(screen.getByText(/Stickers: 1 of 3/))
    const popup = screen.getByRole('dialog', { name: 'Stickers of Quick' })
    expect(popup.querySelectorAll('.album-got')).toHaveLength(1)
    expect(popup.querySelectorAll('.album-missing')).toHaveLength(2)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByRole('dialog', { name: 'Stickers of Quick' })).toBeNull()
  })
})
