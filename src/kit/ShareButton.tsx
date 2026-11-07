import { useState } from 'react'
import { useT } from '../i18n'
import { useTimeouts } from './hooks'
import { share, type ShareData } from './share'
import { sound } from './sound'

/** A chunky "share" glyph (a box with an arrow out of it), drawn in the text colour so it works in every theme. */
export function ShareGlyph() {
  return (
    <svg className="share-glyph" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 17.5 10H16" />
      <path d="M12 15V3M7.5 7.5 12 3l4.5 4.5" />
    </svg>
  )
}

/**
 * A share button: the phone's share sheet, or "Link copied!" where there is none.
 * `label` shows next to the glyph; without it the button is a small round icon button.
 */
export function ShareButton({ data, label, hint, className = '' }: { data: () => ShareData; label?: string; hint: string; className?: string }) {
  const t = useT()
  const later = useTimeouts()
  const [note, setNote] = useState<'copied' | 'failed' | null>(null)
  const onClick = async () => {
    sound.tap()
    const outcome = await share(data())
    if (outcome === 'copied' || outcome === 'failed') {
      setNote(outcome)
      later(() => setNote(null), 2200)
    }
  }
  return (
    <span className="share-wrap">
      <button className={`${label ? 'ghost-btn share-btn' : 'icon-btn share-icon-btn'} ${className}`} onClick={onClick} title={hint} aria-label={label ? undefined : hint}>
        <ShareGlyph />
        {label && <span>{label}</span>}
      </button>
      <span className={`share-note${note ? ' share-note-on' : ''}`} role="status">
        {note === 'copied' ? t('share.copied') : note === 'failed' ? t('share.failed') : ''}
      </span>
    </span>
  )
}
