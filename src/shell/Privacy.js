import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useLocale, useT } from '../i18n';
import { AUTHOR, CONTACT_EMAIL, portfolioUrl, PRIVACY_UPDATED, facebookUrl } from './contact';
const sections = ['device', 'stats', 'hosting', 'links', 'rights'];
/** For parents: what the site stores, who else is involved, and who runs it (GDPR notice and impresszum in one). */
export function Privacy({ onHome }) {
    const t = useT();
    const locale = useLocale();
    const date = new Date(PRIVACY_UPDATED).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    // Braces matter: newer browsers return a Promise from scrollTo, and React would call it as a cleanup.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (_jsxs("article", { className: "privacy", children: [_jsxs("header", { className: "frame-bar", children: [_jsx("button", { className: "icon-btn", onClick: onHome, "aria-label": t('home'), children: "\u2715" }), _jsx("h1", { className: "frame-title", children: t('privacy.title') })] }), _jsx("p", { className: "privacy-intro", children: t('privacy.intro') }), sections.map((s) => (_jsxs("section", { children: [_jsx("h2", { children: t(`privacy.${s}.h`) }), _jsx("p", { children: t(`privacy.${s}.p`) })] }, s))), _jsxs("section", { children: [_jsx("h2", { children: t('privacy.contact.h') }), _jsxs("dl", { className: "privacy-contact", children: [_jsx("dt", { children: t('privacy.operator') }), _jsx("dd", { children: AUTHOR }), _jsx("dt", { children: t('privacy.email') }), _jsx("dd", { children: _jsx("a", { href: `mailto:${CONTACT_EMAIL}`, children: CONTACT_EMAIL }) }), _jsx("dt", { children: t('privacy.website') }), _jsx("dd", { children: _jsx("a", { href: portfolioUrl(locale), target: "_blank", rel: "noopener noreferrer", children: "gregsolutions.dev" }) }), _jsx("dt", { children: "Facebook" }), _jsx("dd", { children: _jsx("a", { href: facebookUrl(locale), target: "_blank", rel: "noopener noreferrer", children: "Library Games" }) }), _jsx("dt", { children: t('privacy.host') }), _jsxs("dd", { children: ["Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA \u00B7", ' ', _jsx("a", { href: "https://vercel.com", target: "_blank", rel: "noopener noreferrer", children: "vercel.com" })] })] })] }), _jsx("p", { className: "privacy-updated", children: t('privacy.updated', { date }) })] }));
}
