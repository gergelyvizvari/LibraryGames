import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useTimeouts } from './hooks';
import { Icon } from './icon';
import { canNativeShare, copyShare, facebookShareUrl, share } from './share';
import { sound } from './sound';
/** The share sticker: a red arrow coming out of a yellow box, in the same toy-sticker style as the game icons. */
export const shareIcon = [
    ['base', '#feca57', _jsx("path", { d: "M7 22h9v6h16v-6h9v18a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4z" })],
    ['accent', '#ff6b6b', _jsx("path", { d: "M24 4l12 12h-7v16H19V16h-7z" })],
    ['shine', '#fff', _jsx("rect", { x: "21", y: "18", width: "3", height: "10", rx: "1.5" })],
];
export function ShareGlyph() {
    return _jsx(Icon, { icon: shareIcon, className: "share-glyph" });
}
function FacebookGlyph() {
    return (_jsxs("svg", { className: "share-fb", viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false", children: [_jsx("circle", { cx: "12", cy: "12", r: "11", fill: "#1877f2" }), _jsx("path", { fill: "#fff", d: "M13.2 23v-8.2h2.7l.4-3.2h-3.1V9.6c0-.9.3-1.5 1.6-1.5h1.6V5.2a22 22 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.4H7.3v3.2H10V23z" })] }));
}
/**
 * A share button that opens a small menu: Facebook, copy the link, and the phone's own share sheet where there is one.
 * `label` shows next to the glyph; without it the button is a small round icon button.
 * `up` opens the menu above the button (for buttons near the bottom of a card).
 */
export function ShareButton({ data, label, hint, up = false }) {
    const t = useT();
    const later = useTimeouts();
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState(null);
    const wrap = useRef(null);
    const native = canNativeShare();
    useEffect(() => {
        if (!open)
            return;
        const outside = (e) => wrap.current?.contains(e.target) || setOpen(false);
        const esc = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('pointerdown', outside);
        document.addEventListener('keydown', esc);
        return () => {
            document.removeEventListener('pointerdown', outside);
            document.removeEventListener('keydown', esc);
        };
    }, [open]);
    const show = (outcome) => {
        if (outcome !== 'copied' && outcome !== 'failed')
            return;
        setNote(outcome);
        later(() => setNote(null), 2200);
    };
    const copy = async () => {
        setOpen(false);
        show(await copyShare(data()));
    };
    const more = async () => {
        setOpen(false);
        show(await share(data()));
    };
    return (_jsxs("span", { className: "share-wrap", ref: wrap, children: [_jsxs("button", { className: label ? 'ghost-btn share-btn' : 'icon-btn share-icon-btn', onClick: () => {
                    sound.tap();
                    setOpen(!open);
                }, title: hint, "aria-label": label ? undefined : hint, "aria-haspopup": "menu", "aria-expanded": open, children: [_jsx(ShareGlyph, {}), label && _jsx("span", { children: label })] }), open && (_jsxs("span", { className: `share-menu${up ? ' share-menu-up' : ''}${label ? ' share-menu-center' : ''}`, role: "menu", children: [_jsxs("a", { role: "menuitem", href: facebookShareUrl(data().url), target: "_blank", rel: "noopener noreferrer", onClick: () => setOpen(false), children: [_jsx(FacebookGlyph, {}), " Facebook"] }), _jsxs("button", { role: "menuitem", onClick: copy, children: [_jsx("span", { "aria-hidden": true, children: "\uD83D\uDD17" }), " ", t('share.copy')] }), native && (_jsxs("button", { role: "menuitem", onClick: more, children: [_jsx(ShareGlyph, {}), " ", t('share.more')] }))] })), _jsx("span", { className: `share-note${note ? ' share-note-on' : ''}${label ? ' share-note-center' : ''}`, role: "status", children: note === 'copied' ? t('share.copied') : note === 'failed' ? t('share.failed') : '' })] }));
}
