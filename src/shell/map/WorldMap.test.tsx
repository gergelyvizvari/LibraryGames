import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { games } from '../../games/registry'
import { recordRound } from '../../kit/progress'
import { WorldMap } from './WorldMap'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('WorldMap', () => {
  it('shows a star for every game and opens a game from its star', () => {
    const onPlay = vi.fn()
    render(<WorldMap onPlay={onPlay} onAllGames={() => {}} onStickers={() => {}} onLocale={() => {}} />)
    expect(document.querySelectorAll('.wm-star')).toHaveLength(games.length)
    fireEvent.click(screen.getByLabelText('Feed the Monster'))
    fireEvent.click(screen.getByText('Play!'))
    expect(onPlay).toHaveBeenCalledWith('feed-monster')
  })

  it('turns the star of a played game gold and counts it', () => {
    recordRound('feed-monster', 'maths', { score: 10, accuracy: 1 })
    render(<WorldMap onPlay={() => {}} onAllGames={() => {}} onStickers={() => {}} onLocale={() => {}} />)
    expect(screen.getByLabelText('Feed the Monster').className).toContain('wm-done')
    expect(screen.getByLabelText('Stars: 1')).toBeTruthy()
  })

  it("starts today's adventure and leads to the list of all games", () => {
    const onPlay = vi.fn()
    const onAllGames = vi.fn()
    render(<WorldMap onPlay={onPlay} onAllGames={onAllGames} onStickers={() => {}} onLocale={() => {}} />)
    fireEvent.click(screen.getByText("Today's adventure"))
    expect(onPlay.mock.calls[0][1]).toBe(true)
    fireEvent.click(screen.getByLabelText('All games'))
    expect(onAllGames).toHaveBeenCalled()
  })
})
