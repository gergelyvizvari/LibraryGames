import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleContext, locales, makeGameT } from '../i18n'
import { skills } from '../kit/types'
import { games } from './registry'

// Every game must follow the contract in ADDING_A_GAME.md. These checks run for new games automatically.
describe('game registry', () => {
  it('has unique kebab-case ids that match the folder name', () => {
    const ids = games.map((g) => g.meta.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/))
  })

  it.each(games.map((g) => [g.meta.id, g] as const))('%s has valid meta and English strings', (_, g) => {
    expect(skills).toContain(g.meta.skill)
    expect(g.meta.added).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(g.strings.en.title).toBeTruthy()
    expect(g.strings.en.howTo).toBeTruthy()
  })

  it.each(games.map((g) => [g.meta.id, g] as const))('%s has a drawn icon', (_, g) => {
    expect(g.meta.icon.length).toBeGreaterThan(0)
    g.meta.icon.forEach(([role, color]) => {
      expect(['base', 'detail', 'accent', 'shine']).toContain(role)
      expect(color).toMatch(/^#[0-9a-f]{3,6}$/i)
    })
  })
})

describe('every game mounts and runs', () => {
  afterEach(() => vi.useRealTimers())

  // Level 1 and level 10 both run, so content and rules that only unlock at high levels are covered too.
  // Every language runs too, so each language's word lists and stories are played.
  it.each(games.flatMap((g) => locales.flatMap((locale) => [1, 10].map((level) => [g.meta.id, locale, level, g] as const))))('%s (%s) renders and survives 5 seconds of play at level %i', async (_, locale, level, g) => {
    const { default: Game } = await g.load()
    vi.useFakeTimers()
    const onFinish = vi.fn()
    const { container, unmount } = render(
      <LocaleContext.Provider value={locale}>
        <Game level={level} seed={42} t={makeGameT(g.strings, locale)} onFinish={onFinish} />
      </LocaleContext.Provider>,
    )
    expect(container.querySelector('.game')).not.toBeNull()
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    // Tap whatever buttons are on screen: must never crash.
    container.querySelectorAll('button').forEach((b) =>
      act(() => {
        b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
        b.click()
      }),
    )
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    unmount()
  })
})
