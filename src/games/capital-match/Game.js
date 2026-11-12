import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell } from '../../kit/SceneShell';
import { sound, vibrate } from '../../kit/sound';
import { countries, flag } from './content';
import { makeQuestions } from './logic';
export default function CapitalMatch({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const rng = useRef(makeRng(seed)).current;
    const questions = useRef(makeQuestions(rng, countries[locale] ?? countries.en, level).slice(0, 6)).current;
    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState(null);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [right, setRight] = useState(0);
    const askedAt = useRef(performance.now());
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const q = questions[index];
    const choose = (o) => {
        if (picked)
            return;
        setPicked(o);
        const ok = o === q.country.capital;
        let s = score;
        let r = right;
        if (ok) {
            const nc = combo + 1;
            const seconds = (performance.now() - askedAt.current) / 1000;
            const gained = 10 + Math.max(0, Math.round((6 - seconds) * 2)) + Math.min(nc, 5) * 2;
            s += gained;
            r++;
            setCombo(nc);
            sound.good(nc);
        }
        else {
            setCombo(0);
            sound.bad();
            vibrate(50);
            shake();
        }
        setScore(s);
        setRight(r);
        later(() => {
            if (index + 1 >= questions.length) {
                onFinish({ score: s, accuracy: r / questions.length });
                return;
            }
            setIndex(index + 1);
            setPicked(null);
            askedAt.current = performance.now();
        }, ok ? 800 : 1500);
    };
    return (_jsxs(SceneShell, { place: "coast", bare: true, say: picked ? (picked === q.country.capital ? t('correct', { capital: q.country.capital }) : t('itIs', { capital: q.country.capital })) : t('question', { country: q.country.name }), stage: { done: index + (picked ? 1 : 0), total: questions.length, over: false, mood: !picked ? 'idle' : picked === q.country.capital ? 'happy' : 'oops' }, className: "capital-match", children: [_jsxs("div", { className: "cm-card", ref: ref, children: [_jsx("span", { className: "cm-flag", children: flag(q.country.iso) }), _jsx("span", { className: "cm-country", children: q.country.name })] }, index), _jsx("div", { className: "choices choices-stacked", children: q.options.map((o) => (_jsx("button", { className: `choice-btn${picked && o === q.country.capital ? ' cm-right' : ''}${picked === o && o !== q.country.capital ? ' cm-wrong' : ''}`, onClick: () => choose(o), children: o }, `${index}-${o}`))) })] }));
}
