export function targetRange(level) {
    if (level <= 2)
        return [3, 10];
    if (level <= 4)
        return [5, 15];
    if (level <= 6)
        return [8, 20];
    return [10, 30];
}
/** An expression whose value is exactly `value`, using the operations unlocked at this level. */
export function expressionFor(rng, level, value) {
    const ops = ['+'];
    if (level >= 3)
        ops.push('−');
    if (level >= 7)
        ops.push('×');
    if (level <= 1 && rng.chance(0.3))
        return { text: String(value), value };
    let op = rng.pick(ops);
    if (op === '×') {
        const factors = [];
        for (let a = 2; a <= 10; a++)
            if (value % a === 0 && value / a <= 10 && value / a >= 2)
                factors.push(a);
        if (factors.length === 0)
            op = '+';
        else {
            const a = rng.pick(factors);
            return { text: `${a} × ${value / a}`, value };
        }
    }
    if (op === '−') {
        const b = rng.int(1, Math.max(2, Math.min(10, value)));
        return { text: `${value + b} − ${b}`, value };
    }
    const a = rng.int(0, value);
    return { text: `${a} + ${value - a}`, value };
}
/** A tempting wrong answer: close to the target, never equal. */
export function decoyFor(rng, level, target) {
    let v = target;
    while (v === target || v < 0)
        v = target + rng.pick([-3, -2, -1, 1, 2, 3]);
    return expressionFor(rng, level, v);
}
export function evaluate(text) {
    const [a, op, b] = text.split(' ');
    if (op === undefined)
        return Number(a);
    const x = Number(a);
    const y = Number(b);
    return op === '+' ? x + y : op === '−' ? x - y : x * y;
}
