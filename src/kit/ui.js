import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Hud({ items }) {
    return (_jsx("div", { className: "hud", children: items.map((it) => (_jsxs("div", { className: `hud-item${it.highlight ? ' hud-hot' : ''}`, children: [_jsx("span", { className: "hud-label", children: it.label }), _jsx("span", { className: "hud-value", children: it.value })] }, it.label))) }));
}
export function TimerBar({ left, total }) {
    const pct = Math.max(0, (left / total) * 100);
    return (_jsx("div", { className: "timerbar", role: "progressbar", "aria-valuenow": Math.ceil(left), "aria-valuemax": total, children: _jsx("div", { className: `timerbar-fill${left < 5 ? ' timerbar-low' : ''}`, style: { width: `${pct}%` } }) }));
}
export function Pops({ pops }) {
    return (_jsx("div", { className: "pops", "aria-hidden": true, children: pops.map((p) => (_jsx("span", { className: `pop pop-${p.kind}`, style: { left: `${p.x}%`, top: `${p.y}%` }, children: p.text }, p.id))) }));
}
export function Hearts({ left, total }) {
    return (_jsx("span", { className: "hearts", children: Array.from({ length: total }, (_, i) => (_jsx("span", { className: i < left ? '' : 'heart-lost', children: "\u2764\uFE0F" }, i))) }));
}
const confettiColors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#a29bfe', '#ff9ff3'];
export function Confetti({ count = 60 }) {
    return (_jsx("div", { className: "confetti", "aria-hidden": true, children: Array.from({ length: count }, (_, i) => (_jsx("i", { style: {
                left: `${(i * 37) % 100}%`,
                background: confettiColors[i % confettiColors.length],
                animationDelay: `${(i % 10) * 0.08}s`,
                animationDuration: `${1.6 + (i % 5) * 0.3}s`,
            } }, i))) }));
}
