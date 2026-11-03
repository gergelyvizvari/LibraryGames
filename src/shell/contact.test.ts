import { describe, expect, it } from 'vitest'
import { facebookUrl, FACEBOOK_URLS } from './contact'

describe('facebookUrl', () => {
  it('links each language to its own page', () => {
    expect(facebookUrl('hu')).toBe(FACEBOOK_URLS.hu)
    expect(facebookUrl('en')).toBe(FACEBOOK_URLS.en)
    expect(FACEBOOK_URLS.hu).not.toBe(FACEBOOK_URLS.en)
  })

  it('falls back to the English page', () => {
    expect(facebookUrl('de')).toBe(FACEBOOK_URLS.en)
  })
})
