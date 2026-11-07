import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import { useTimeouts } from './hooks'
import { Icon, type GameIcon } from './icon'
import { canNativeShare, copyShare, facebookShareUrl, share, type ShareData } from './share'
import { sound } from './sound'

/** The share sticker: a red arrow coming out of a yellow box, in the same toy-sticker style as the game icons. */
export const shareIcon: GameIcon = [
  ['base', '#feca57', <path d="M7 22h9v6h16v-6h9v18a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4z" />],
  ['accent', '#ff6b6b', <path d="M24 4l12 12h-7v16H19V16h-7z" />],
  ['shine', '#fff', <rect x="21" y="18" width="3" height="10" rx="1.5" />],
]

export function ShareGlyph() {
  return <Icon icon={shareIcon} className="share-glyph" />
}

function FacebookGlyph() {
  return (
    <svg className="share-fb" viewBox="0 0 24 24" aria-hidden focusable="false">
      <circle cx="12" cy="12" r="11" fill="#1877f2" />
      <path fill="#fff" d="M13.2 23v-8.2h2.7l.4-3.2h-3.1V9.6c0-.9.3-1.5 1.6-1.5h1.6V5.2a22 22 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.4H7.3v3.2H10V23z" />
    </svg>
  )
}

/**
 * A share button that opens a small menu: Facebook, copy the link, and the phone's own share sheet where there is one.
 * `label` shows next to the glyph; without it the button is a small round icon button.
 * `up` opens the menu above the button (for buttons near the bottom of a card).
 */
export function ShareButton({ data, label, hint, up = false }: { data: () => ShareData; label?: string; hint: string; up?: boolean }) {
  const t = useT()
  const later = useTimeouts()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState<'copied' | 'failed' | null>(null)
  const wrap = useRef<HTMLSpanElement>(null)
  const native = canNativeShare()

  useEffect(() => {
    if (!open) return
    const outside = (e: PointerEvent) => wrap.current?.contains(e.target as Node) || setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const show = (outcome: string) => {
    if (outcome !== 'copied' && outcome !== 'failed') return
    setNote(outcome)
    later(() => setNote(null), 2200)
  }
  const copy = async () => {
    setOpen(false)
    show(await copyShare(data()))
  }
  const more = async () => {
    setOpen(false)
    show(await share(data()))
  }

  return (
    <span className="share-wrap" ref={wrap}>
      <button
        className={label ? 'ghost-btn share-btn' : 'icon-btn share-icon-btn'}
        onClick={() => {
          sound.tap()
          setOpen(!open)
        }}
        title={hint}
        aria-label={label ? undefined : hint}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ShareGlyph />
        {label && <span>{label}</span>}
      </button>
      {open && (
        <span className={`share-menu${up ? ' share-menu-up' : ''}${label ? ' share-menu-center' : ''}`} role="menu">
          <a role="menuitem" href={facebookShareUrl(data().url)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <FacebookGlyph /> Facebook
          </a>
          <button role="menuitem" onClick={copy}>
            <span aria-hidden>🔗</span> {t('share.copy')}
          </button>
          {native && (
            <button role="menuitem" onClick={more}>
              <ShareGlyph /> {t('share.more')}
            </button>
          )}
        </span>
      )}
      <span className={`share-note${note ? ' share-note-on' : ''}${label ? ' share-note-center' : ''}`} role="status">
        {note === 'copied' ? t('share.copied') : note === 'failed' ? t('share.failed') : ''}
      </span>
    </span>
  )
}
