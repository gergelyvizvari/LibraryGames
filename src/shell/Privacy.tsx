import { useEffect } from 'react'
import { useLocale, useT, type AppKey } from '../i18n'
import { AUTHOR, CONTACT_EMAIL, portfolioUrl, PRIVACY_UPDATED } from './contact'

const sections = ['device', 'stats', 'hosting', 'links', 'rights'] as const

/** For parents: what the site stores, who else is involved, and who runs it (GDPR notice and impresszum in one). */
export function Privacy({ onHome }: { onHome: () => void }) {
  const t = useT()
  const locale = useLocale()
  const date = new Date(PRIVACY_UPDATED).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })

  // Braces matter: newer browsers return a Promise from scrollTo, and React would call it as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="privacy">
      <header className="frame-bar">
        <button className="icon-btn" onClick={onHome} aria-label={t('home')}>
          ✕
        </button>
        <h1 className="frame-title">{t('privacy.title')}</h1>
      </header>
      <p className="privacy-intro">{t('privacy.intro')}</p>
      {sections.map((s) => (
        <section key={s}>
          <h2>{t(`privacy.${s}.h` as AppKey)}</h2>
          <p>{t(`privacy.${s}.p` as AppKey)}</p>
        </section>
      ))}
      <section>
        <h2>{t('privacy.contact.h')}</h2>
        <dl className="privacy-contact">
          <dt>{t('privacy.operator')}</dt>
          <dd>{AUTHOR}</dd>
          <dt>{t('privacy.email')}</dt>
          <dd>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </dd>
          <dt>{t('privacy.website')}</dt>
          <dd>
            <a href={portfolioUrl(locale)} target="_blank" rel="noopener noreferrer">
              gregsolutions.dev
            </a>
          </dd>
          <dt>{t('privacy.host')}</dt>
          <dd>
            Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA ·{' '}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
              vercel.com
            </a>
          </dd>
        </dl>
      </section>
      <p className="privacy-updated">{t('privacy.updated', { date })}</p>
    </article>
  )
}
