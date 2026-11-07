/** How a share ended: the phone's share sheet opened, the link was copied, the player closed the sheet, or nothing worked. */
export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed'

export interface ShareData {
  title: string
  text: string
  url: string
}

/**
 * The public site, the same as the canonical link in index.html. Shared links always point here, even from a
 * Vercel preview: previews sit behind a Vercel login, so Facebook would show "Dashboard – Vercel" instead of our og: card.
 */
export const SITE_URL = 'https://www.librarygames.app/'

/**
 * A link to the public site that opens `hash` (e.g. `#/play/color-sort`) in the given language,
 * so a Hungarian parent's friends see the game in Hungarian too.
 */
export function shareUrl(hash: string, locale: string, site = SITE_URL) {
  return `${site}?lang=${locale}${hash}`
}

/** Facebook's share page for a link. Facebook ignores any text we suggest: the post preview comes from the page's og: tags. */
export function facebookShareUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

/** True where the browser has a share sheet (phones, Safari, some desktops). */
export function canNativeShare(nav: Partial<Navigator> = typeof navigator === 'undefined' ? {} : navigator) {
  return typeof nav.share === 'function'
}

/** Copies the text and the link, for pasting into any chat. */
export async function copyShare(data: ShareData, nav: Partial<Navigator> = typeof navigator === 'undefined' ? {} : navigator): Promise<ShareOutcome> {
  try {
    if (!nav.clipboard) return 'failed'
    await nav.clipboard.writeText(`${data.text} ${data.url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}

/**
 * Opens the phone's share sheet (Web Share API). Where there is none (most desktops),
 * copies the text and the link to the clipboard instead.
 */
export async function share(data: ShareData, nav: Partial<Navigator> = typeof navigator === 'undefined' ? {} : navigator): Promise<ShareOutcome> {
  if (nav.share && (!nav.canShare || nav.canShare(data))) {
    try {
      await nav.share(data)
      return 'shared'
    } catch (e) {
      // The player closed the sheet: that is a choice, not an error.
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled'
      // Anything else (no permission, not allowed here): fall back to copying.
    }
  }
  return copyShare(data, nav)
}
