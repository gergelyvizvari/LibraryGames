import { useCallback, useEffect, useRef, useState } from 'react';
/** Keeps a ref pointing at the latest value, so effects can call fresh callbacks without restarting. */
export function useLatest(value) {
    const ref = useRef(value);
    ref.current = value;
    return ref;
}
/** Calls `step(dtSeconds)` every animation frame while `running` is true. */
export function useGameLoop(step, running = true) {
    const stepRef = useLatest(step);
    useEffect(() => {
        if (!running)
            return;
        let last = performance.now();
        let frame = requestAnimationFrame(function loop(now) {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            stepRef.current(dt);
            frame = requestAnimationFrame(loop);
        });
        return () => cancelAnimationFrame(frame);
    }, [running, stepRef]);
}
/** Counts down from `seconds`, calling `onEnd` once at zero. Returns seconds left (fractional). */
export function useCountdown(seconds, onEnd, running = true) {
    const [left, setLeft] = useState(seconds);
    const leftRef = useRef(seconds);
    const endRef = useLatest(onEnd);
    useGameLoop((dt) => {
        if (leftRef.current <= 0)
            return;
        leftRef.current = Math.max(0, leftRef.current - dt);
        setLeft(leftRef.current);
        if (leftRef.current === 0)
            endRef.current();
    }, running && left > 0);
    return left;
}
/** Runs `fn` every `ms` while `ms` is not null. */
export function useInterval(fn, ms) {
    const fnRef = useLatest(fn);
    useEffect(() => {
        if (ms === null)
            return;
        const id = setInterval(() => fnRef.current(), ms);
        return () => clearInterval(id);
    }, [ms, fnRef]);
}
/** setTimeout that is cleared automatically when the component unmounts. */
export function useTimeouts() {
    const ids = useRef([]);
    useEffect(() => () => ids.current.forEach(clearTimeout), []);
    return useCallback((fn, ms) => {
        ids.current.push(window.setTimeout(fn, ms));
    }, []);
}
let popId = 0;
/** Floating "+10" style feedback. x and y are percentages of the play area. */
export function usePops() {
    const [pops, setPops] = useState([]);
    const later = useTimeouts();
    const add = useCallback((text, x = 50, y = 40, kind = 'good') => {
        const id = ++popId;
        setPops((p) => [...p, { id, text, x, y, kind }]);
        later(() => setPops((p) => p.filter((q) => q.id !== id)), 900);
    }, [later]);
    return [pops, add];
}
/** Brief CSS shake on the element holding the ref. */
export function useShake() {
    const ref = useRef(null);
    const shake = useCallback(() => {
        const el = ref.current;
        if (!el)
            return;
        el.classList.remove('shake');
        void el.offsetWidth;
        el.classList.add('shake');
    }, []);
    return [ref, shake];
}
