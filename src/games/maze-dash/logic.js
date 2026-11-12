import { clamp } from '../../kit/random';
export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;
export const moves = { [N]: [0, -1], [E]: [1, 0], [S]: [0, 1], [W]: [-1, 0] };
const opposite = { [N]: S, [S]: N, [E]: W, [W]: E };
export function sizeFor(level, solved) {
    const n = clamp(4 + Math.floor(level / 2) + solved, 4, 10);
    return { w: n, h: clamp(n + 1, 5, 12) };
}
/** A perfect maze (exactly one path between any two cells), carved by depth-first search. */
export function makeMaze(rng, w, h) {
    const open = Array(w * h).fill(0);
    const seen = Array(w * h).fill(false);
    const stack = [0];
    seen[0] = true;
    while (stack.length) {
        const cell = stack[stack.length - 1];
        const x = cell % w;
        const y = Math.floor(cell / w);
        const dirs = rng.shuffle([N, E, S, W]).filter((d) => {
            const [dx, dy] = moves[d];
            const nx = x + dx;
            const ny = y + dy;
            return nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[ny * w + nx];
        });
        if (!dirs.length) {
            stack.pop();
            continue;
        }
        const d = dirs[0];
        const [dx, dy] = moves[d];
        const next = (y + dy) * w + x + dx;
        open[cell] |= d;
        open[next] |= opposite[d];
        seen[next] = true;
        stack.push(next);
    }
    return { w, h, open };
}
export function step(maze, cell, dir) {
    if (!(maze.open[cell] & dir))
        return cell;
    const [dx, dy] = moves[dir];
    return cell + dy * maze.w + dx;
}
/** Every cell can be reached from the start. */
export function reachable(maze) {
    const seen = new Set([0]);
    const queue = [0];
    while (queue.length) {
        const c = queue.shift();
        for (const d of [N, E, S, W]) {
            const n = step(maze, c, d);
            if (!seen.has(n)) {
                seen.add(n);
                queue.push(n);
            }
        }
    }
    return seen.size;
}
