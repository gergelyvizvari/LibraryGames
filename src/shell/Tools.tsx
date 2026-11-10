import { useState } from 'react'
import { nextLocale, useLocale, useT, type Locale } from '../i18n'
import { ShareButton } from '../kit/ShareButton'
import { shareUrl } from '../kit/share'
import { sound } from '../kit/sound'
import { loadTheme, nextTheme, setTheme, themeIcons } from '../kit/theme'
import { SUPPORT_URL } from './contact'
import { SoundIcon } from './SoundIcon'
import { TeaCup } from './TeaCup'

/**
 * The grown-ups' buttons of the map and the games list: language, theme, sound, share and support.
 * In a row on a wide screen, behind the three dots on a narrow one. The parent must be positioned: the opened list hangs from its right edge.
 */
export function Tools({ onLocale }: { onLocale: (locale: Locale) => void }) {
  const t = useT()
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [muted, setMuted] = useState(sound.isMuted())
  const [theme, setThemeState] = useState(loadTheme)
  const language = t('language', { name: t(`lang.${locale}`) })
  const themeName = t('theme', { name: t(`theme.${theme}`) })

  return (
    <>
      <div className={`wm-tools${open ? ' wm-tools-open' : ''}`}>
        <button className="wm-tool" aria-label={language} title={language} onClick={() => onLocale(nextLocale(locale))}>
          <span className="wm-tool-lang">{locale.toUpperCase()}</span>
        </button>
        <button
          className="wm-tool"
          aria-label={themeName}
          title={themeName}
          onClick={() => {
            const next = nextTheme(theme)
            setTheme(next)
            setThemeState(next)
          }}
        >
          {themeIcons[theme]}
        </button>
        <button
          className="wm-tool"
          aria-label={t('sound')}
          aria-pressed={!muted}
          title={t('sound')}
          onClick={() => {
            sound.setMuted(!muted)
            setMuted(!muted)
          }}
        >
          <SoundIcon muted={muted} />
        </button>
        <ShareButton hint={t('share.page')} data={() => ({ title: t('appName'), text: t('share.pageText'), url: shareUrl('', locale) })} />
        <a className="wm-tool" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" title={t('supportHint')} aria-label={t('supportHint')}>
          <TeaCup />
        </a>
      </div>
      <button className="wm-tool wm-more" aria-label={t('map.settings')} title={t('map.settings')} aria-expanded={open} onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 24 24" aria-hidden focusable="false">
          <circle cx="12" cy="5" r="2.2" />
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="12" cy="19" r="2.2" />
        </svg>
      </button>
    </>
  )
}
