import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { nextLocale, useLocale, useT } from '../i18n';
import { ShareButton } from '../kit/ShareButton';
import { shareUrl } from '../kit/share';
import { sound } from '../kit/sound';
import { SUPPORT_URL } from './contact';
import { SoundIcon } from './SoundIcon';
import { TeaCup } from './TeaCup';
/**
 * The grown-ups' buttons of the map and the games list: language, sound, share and support.
 * Always in sight: on a phone they get smaller so the map keeps everything in one row.
 */
export function Tools({ onLocale }) {
    const t = useT();
    const locale = useLocale();
    const [muted, setMuted] = useState(sound.isMuted());
    const language = t('language', { name: t(`lang.${locale}`) });
    return (_jsxs("div", { className: "wm-tools", children: [_jsx("button", { className: "wm-tool", "aria-label": language, title: language, onClick: () => onLocale(nextLocale(locale)), children: _jsx("span", { className: "wm-tool-lang", children: locale.toUpperCase() }) }), _jsx("button", { className: "wm-tool", "aria-label": t('sound'), "aria-pressed": !muted, title: t('sound'), onClick: () => {
                    sound.setMuted(!muted);
                    setMuted(!muted);
                }, children: _jsx(SoundIcon, { muted: muted }) }), _jsx(ShareButton, { hint: t('share.page'), data: () => ({ title: t('appName'), text: t('share.pageText'), url: shareUrl('', locale) }) }), _jsx("a", { className: "wm-tool", href: SUPPORT_URL, target: "_blank", rel: "noopener noreferrer", title: t('supportHint'), "aria-label": t('supportHint'), children: _jsx(TeaCup, {}) })] }));
}
