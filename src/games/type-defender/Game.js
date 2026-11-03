import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useCountdown, useGameLoop, usePops, useShake } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hearts, Hud, Pops, TimerBar } from '../../kit/ui';
import { wordLists, wordsForLevel } from './content';
const DURATION = 60;
const SHIELDS = 3;
export default function TypeDefender({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const rng = useRef(makeRng(seed)).current;
    const pool = wordsForLevel(wordLists[locale] ?? wordLists.en, level);
    const state = useRef({ enemies: [], spawnIn: 0.3, nextId: 0 });
    const [enemies, setEnemies] = useState([]);
    const [typed, setTyped] = useState('');
    const [score, setScore] = useState(0);
    const [zapped, setZapped] = useState(0);
    const [shields, setShields] = useState(SHIELDS);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const input = useRef(null);
    useEffect(() => input.current?.focus(), []);
    const finish = (finalShields) => {
        if (over)
            return;
        setOver(true);
        onFinish({ score, accuracy: clamp(zapped / 15, 0, 1) * (finalShields > 0 ? 1 : 0.7) });
    };
    const left = useCountdown(DURATION, () => finish(shields), !over);
    const fallSpeed = clamp(5 + level * 1.2, 5, 18); // % per second
    useGameLoop((dt) => {
        const s = state.current;
        s.spawnIn -= dt;
        if (s.spawnIn <= 0) {
            s.spawnIn = clamp(2.6 - level * 0.15, 1.1, 2.6);
            const used = new Set(s.enemies.map((e) => e.word[0]));
            // Each word on screen starts with a different letter, so typing always targets one word.
            const options = pool.filter((w) => !used.has(w[0]));
            if (options.length)
                s.enemies.push({ id: s.nextId++, word: rng.pick(options), x: rng.int(8, 72), y: -8 });
        }
        let hit = 0;
        s.enemies = s.enemies.flatMap((e) => {
            const y = e.y + fallSpeed * dt;
            if (y >= 88) {
                hit++;
                return [];
            }
            return [{ ...e, y }];
        });
        if (hit) {
            const left = Math.max(0, shields - hit);
            setShields(left);
            sound.bad();
            vibrate(80);
            shake();
            addPop(t('ouch'), 50, 85, 'bad');
            setTyped('');
            if (left === 0)
                finish(0);
        }
        setEnemies(s.enemies);
    }, !over);
    const onType = (value) => {
        if (over)
            return;
        const v = value.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '');
        const s = state.current;
        const target = s.enemies.find((e) => e.word.startsWith(v));
        if (!target || v === '') {
            if (v !== '')
                sound.tap();
            setTyped(v === '' ? '' : typed);
            return;
        }
        sound.pop();
        if (v === target.word) {
            s.enemies = s.enemies.filter((e) => e.id !== target.id);
            setEnemies(s.enemies);
            const gained = target.word.length * 5;
            setScore((n) => n + gained);
            setZapped((z) => z + 1);
            sound.good(zapped + 1);
            addPop(`${t('zap')} +${gained}`, target.x + 8, target.y);
            setTyped('');
            return;
        }
        setTyped(v);
    };
    return (_jsxs("div", { className: "game type-defender", onPointerDown: () => input.current?.focus(), children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('shields'), value: _jsx(Hearts, { left: shields, total: SHIELDS }) },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsxs("div", { className: "td-sky", ref: ref, children: [enemies.map((e) => {
                        const active = typed && e.word.startsWith(typed);
                        return (_jsx("div", { className: `td-enemy${active ? ' td-active' : ''}`, style: { left: `${e.x}%`, top: `${e.y}%` }, children: active ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "td-done", children: typed }), e.word.slice(typed.length)] })) : (e.word) }, e.id));
                    }), _jsx("div", { className: "td-castle", children: "\uD83C\uDFF0" }), _jsx(Pops, { pops: pops })] }), _jsx("input", { ref: input, className: "td-input", value: typed, onChange: (e) => onType(e.target.value), placeholder: t('typeHere'), autoCapitalize: "none", autoCorrect: "off", autoComplete: "off", spellCheck: false, enterKeyHint: "done" })] }));
}
