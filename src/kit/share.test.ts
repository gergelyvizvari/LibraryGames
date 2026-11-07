import { describe, expect, it, vi } from 'vitest'
import { facebookShareUrl, share, shareUrl } from './share'

const data = { title: 'Colour Sort', text: 'I scored 120 points!', url: 'https://example.org/?lang=en#/play/color-sort' }

describe('share', () => {
  it('builds links that keep the language and open the right screen', () => {
    const loc = { origin: 'https://example.org', pathname: '/' }
    expect(shareUrl('', 'hu', loc)).toBe('https://example.org/?lang=hu')
    expect(shareUrl('#/play/color-sort', 'en', loc)).toBe('https://example.org/?lang=en#/play/color-sort')
  })

  it('links to Facebook\'s share page with the whole link, hash included', () => {
    expect(facebookShareUrl('https://example.org/?lang=hu#/play/x')).toBe(
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.org%2F%3Flang%3Dhu%23%2Fplay%2Fx',
    )
  })

  it('opens the share sheet when the browser has one', async () => {
    const nav = { share: vi.fn().mockResolvedValue(undefined), clipboard: { writeText: vi.fn() } }
    expect(await share(data, nav as unknown as Navigator)).toBe('shared')
    expect(nav.share).toHaveBeenCalledWith(data)
    expect(nav.clipboard.writeText).not.toHaveBeenCalled()
  })

  it('does nothing more when the player closes the share sheet', async () => {
    const abort = Object.assign(new Error('closed'), { name: 'AbortError' })
    const nav = { share: vi.fn().mockRejectedValue(abort), clipboard: { writeText: vi.fn() } }
    expect(await share(data, nav as unknown as Navigator)).toBe('cancelled')
    expect(nav.clipboard.writeText).not.toHaveBeenCalled()
  })

  it('copies the text and link where there is no share sheet, or it is not allowed', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    expect(await share(data, { clipboard: { writeText } } as unknown as Navigator)).toBe('copied')
    expect(writeText).toHaveBeenCalledWith(`${data.text} ${data.url}`)
    const denied = { share: vi.fn().mockRejectedValue(new Error('NotAllowedError')), clipboard: { writeText } }
    expect(await share(data, denied as unknown as Navigator)).toBe('copied')
  })

  it('reports a failure when nothing works', async () => {
    expect(await share(data, {} as Navigator)).toBe('failed')
    const broken = { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('no')) } }
    expect(await share(data, broken as unknown as Navigator)).toBe('failed')
  })
})
