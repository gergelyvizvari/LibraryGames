import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useSize, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneTray, SpeechBubble, StagePips } from '../../kit/scene';
import { sound, vibrate } from '../../kit/sound';
import { sceneLayout } from './layout';
import { STAGE, canFinish, makeMonster, pointsFor } from './logic';
import { Cookie, Monster, Room, skins } from './Room';
/** A copy of the tapped cookie flies to the monster's mouth. Purely for show: skipped where it cannot run. */
function flyCookie(from, to) {
    if (!to || typeof from.animate !== 'function' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
        return;
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const ghost = from.cloneNode(true);
    ghost.className = 'fm-cookie fm-ghost';
    Object.assign(ghost.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
    document.body.append(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const flight = ghost.animate([{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.9 }], { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.7, 1)' });
    flight.onfinish = flight.oncancel = () => ghost.remove();
}
export default function FeedMonster({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [monster, setMonster] = useState(() => makeMonster(rng, level));
    /** Counts every monster that came in, so each one gets fresh colours and slides in anew. */
    const [arrival, setArrival] = useState(0);
    const [eaten, setEaten] = useState([]);
    const [mood, setMood] = useState('idle');
    const [message, setMessage] = useState(() => t('feed', { n: monster.target }));
    const [fed, setFed] = useState(0);
    const [over, setOver] = useState(false);
    const stats = useRef({ score: 0, clean: 0, tries: 0, combo: 0 });
    const busy = useRef(false);
    const mouth = useRef(null);
    const [room, size] = useSize();
    const later = useTimeouts();
    const nextMonster = () => {
        const m = makeMonster(rng, level);
        setMonster(m);
        setArrival((n) => n + 1);
        setEaten([]);
        setMood('idle');
        setMessage(t('feed', { n: m.target }));
        busy.current = false;
    };
    const feed = (b, cookie) => {
        if (over || busy.current)
            return;
        const s = stats.current;
        const need = monster.target - eaten.reduce((a, c) => a + c, 0);
        if (b > need) {
            s.tries++;
            s.combo = 0;
            setMood('yuck');
            setMessage(t('tooMuch', { n: need }));
            sound.bad();
            vibrate(40);
            later(() => setMood((m) => (m === 'yuck' ? 'idle' : m)), 700);
            return;
        }
        flyCookie(cookie, mouth.current);
        const now = [...eaten, b];
        setEaten(now);
        const rest = need - b;
        if (rest > 0) {
            sound.tone(300 + now.length * 80, 0.08, 'square', 0.15);
            setMood('chomp');
            later(() => setMood((m) => (m === 'chomp' ? 'idle' : m)), 380);
            if (canFinish(rest, monster.blocks)) {
                setMessage(t('more', { n: rest }));
            }
            else {
                // Can't be filled any more (only on harder levels without a 1): a fresh monster comes instead.
                busy.current = true;
                s.tries++;
                s.combo = 0;
                setMessage(t('stuck'));
                sound.bad();
                later(nextMonster, 1300);
            }
            return;
        }
        busy.current = true;
        s.tries++;
        s.combo++;
        const smart = now.length <= monster.best;
        if (smart)
            s.clean++;
        s.score += pointsFor(monster, now.length, s.combo);
        const count = fed + 1;
        setFed(count);
        setMood('happy');
        sound.good(s.combo);
        if (count < STAGE) {
            setMessage(smart ? t('smart') : t('yum'));
            later(nextMonster, 1500);
            return;
        }
        setOver(true);
        setMessage(t('allFed'));
        onFinish({ score: s.score, accuracy: s.clean / Math.max(1, s.tries) });
    };
    const need = monster.target - eaten.reduce((a, c) => a + c, 0);
    const layout = sceneLayout(size.w, size.h);
    return (_jsxs("div", { className: "scene fm", children: [_jsxs("div", { className: "fm-roombox", ref: room, children: [_jsx(Room, { w: size.w, h: size.h, layout: layout, children: _jsx("g", { className: "fm-arrive", children: _jsx(Monster, { skin: skins[arrival % skins.length], mood: mood, need: need, mouthRef: mouth }) }, arrival) }), _jsx(SpeechBubble, { style: { left: layout.bubble.left, bottom: layout.bubble.bottom, maxWidth: layout.bubble.maxWidth }, children: message })] }), _jsx(StagePips, { done: fed, total: STAGE, label: t('fedOf', { n: fed, total: STAGE }) }), _jsx(SceneTray, { hidden: over, children: _jsx("div", { className: "fm-plate", children: monster.blocks.map((b) => (_jsx("button", { className: "fm-cookie", disabled: over, "aria-label": t('cookie', { n: b }), onClick: (e) => feed(b, e.currentTarget), children: _jsx(Cookie, { n: b }) }, `${arrival}-${b}`))) }) })] }));
}
