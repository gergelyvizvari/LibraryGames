import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Stickers } from './Stickers'

afterEach(cleanup)

describe('Stickers', () => {
  it('opens a game from its album page', () => {
    const onPlay = vi.fn()
    render(<Stickers onHome={() => {}} onPlay={onPlay} />)
    fireEvent.click(screen.getByLabelText('Play Feed the Monster'))
    expect(onPlay).toHaveBeenCalledWith('feed-monster')
  })
})
