/** Who runs the site. Shown in the home footer and on the privacy page; the support link never appears inside a game. */
export const AUTHOR = 'Gergely Vizvári'
export const CONTACT_EMAIL = 'vizvari.gergely@gmail.com'
export const SUPPORT_URL = 'https://buymeacoffee.com/gergelyvizvari'
export const PORTFOLIO_URL = 'https://www.gregsolutions.dev/'
export const FACEBOOK_URL = 'https://www.facebook.com/librarygameshu'
/** Bump when the privacy text changes in a way that matters. */
export const PRIVACY_UPDATED = '2026-11-03'

export function portfolioUrl(locale: string) {
  return `${PORTFOLIO_URL}?lang=${locale}`
}
