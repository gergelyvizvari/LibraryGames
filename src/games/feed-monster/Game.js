import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useCountdown, usePops, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { DURATION, canFinish, makeMonster, pointsFor } from './logic';
const blockColors = ['#ff6b6b', '#feca57', '#1dd1a1', '#48dbfb', '#ff9ff3', '#ffa502', '#54a0ff', '#5f27cd', '#10ac84'];
export default function FeedMonster({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [monster, setMonster] = useState(() => makeMonster(rng, level));
    const [eaten, setEaten] = useState([]);
    const [mood, setMood] = useState('idle');
    const [message, setMessage] = useState(() => t('feed', { n: monster.target }));
    const [score, setScore] = useState(0);
    const [fed, setFed] = useState(0);
    const [combo, setCombo] = useState(0);
    const stats = useRef({ fed: 0, clean: 0, tries: 0 });
    const busy = useRef(false);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const later = useTimeouts();
    const left = useCountdown(DURATION, () => {
        setOver(true);
        const s = stats.current;
        onFinish({ score, accuracy: s.clean / Math.max(1, s.tries, 6) });
    }, !over);
    const nextMonster = () => {
        const m = makeMonster(rng, level);
        setMonster(m);
        setEaten([]);
        setMood('idle');
        setMessage(t('feed', { n: m.target }));
        busy.current = false;
    };
    const feed = (b) => {
        if (over || busy.current)
            return;
        const sum = eaten.reduce((a, c) => a + c, 0);
        const need = monster.target - sum;
        if (b > need) {
            stats.current.tries++;
            setCombo(0);
            setMood('yuck');
            setMessage(t('tooMuch', { n: need }));
            sound.bad();
            vibrate(40);
            later(() => setMood((m) => (m === 'yuck' ? 'idle' : m)), 500);
            return;
        }
        const now = [...eaten, b];
        setEaten(now);
        const rest = need - b;
        if (rest > 0) {
            sound.tone(300 + now.length * 80, 0.08, 'square', 0.15);
            setMood('chomp');
            later(() => setMood((m) => (m === 'chomp' ? 'idle' : m)), 200);
            if (canFinish(rest, monster.blocks)) {
                setMessage(t('more', { n: rest }));
            }
            else {
                // Can't be filled any more (only on harder levels without a 1): swap in a fresh monster.
                busy.current = true;
                stats.current.tries++;
                setCombo(0);
                setMessage(t('stuck'));
                sound.bad();
                later(nextMonster, 900);
            }
            return;
        }
        busy.current = true;
        const s = stats.current;
        s.fed++;
        s.tries++;
        const smart = now.length <= monster.best;
        if (smart)
            s.clean++;
        const c = combo + 1;
        const pts = pointsFor(monster, now.length, c);
        setCombo(c);
        setFed(s.fed);
        setScore((x) => x + pts);
        setMood('happy');
        setMessage(smart ? t('smart') : t('yum'));
        sound.good(c);
        addPop(`+${pts}`, 50, 8);
        later(nextMonster, 800);
    };
    const sum = eaten.reduce((a, c) => a + c, 0);
    const need = monster.target - sum;
    return (_jsxs("div", { className: "game feed-monster", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('fed'), value: fed, highlight: combo >= 3 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsx("p", { className: "prompt", children: message }), _jsxs("div", { className: "fm-stage", children: [_jsxs("div", { className: `fm-monster fm-${mood}`, children: [_jsxs("div", { className: "fm-eyes", children: [_jsx("span", { className: "fm-eye" }), _jsx("span", { className: "fm-eye" })] }), _jsx("div", { className: "fm-mouth" }), _jsx("div", { className: "fm-belly", children: _jsx("span", { className: "fm-need", children: need }) })] }, fed), _jsx("div", { className: "fm-eaten", "aria-label": "eaten", children: eaten.length > 0 ? eaten.join(' + ') + (need === 0 ? ` = ${monster.target}` : '') : ' ' }), _jsx(Pops, { pops: pops })] }), _jsx("div", { className: "fm-blocks", children: monster.blocks.map((b) => (_jsxs("button", { className: "fm-block", style: { background: blockColors[b - 1] }, disabled: over, onClick: () => feed(b), children: [_jsx("span", { className: "fm-num", children: b }), _jsx("span", { className: "fm-pips", children: '•'.repeat(b) })] }, `${fed}-${b}`))) })] }));
}
