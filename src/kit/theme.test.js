import { beforeEach, describe, expect, it } from 'vitest';
import { games } from '../games/registry';
import { gameSurface, loadTheme, nextTheme, setTheme, themes, whiteContrast } from './theme';
describe('theme', () => {
    beforeEach(() => localStorage.clear());
    it('defaults to light and ignores unknown saved values', () => {
        expect(loadTheme()).toBe('light');
        localStorage.setItem('lg.theme', 'neon');
        expect(loadTheme()).toBe('light');
    });
    it('remembers the chosen theme and puts it on <html>', () => {
        setTheme('dark');
        expect(loadTheme()).toBe('dark');
        expect(document.documentElement.dataset.theme).toBe('dark');
    });
    it('cycles through every theme', () => {
        let t = themes[0];
        const seen = new Set();
        for (let i = 0; i < themes.length; i++) {
            seen.add(t);
            t = nextTheme(t);
        }
        expect(seen.size).toBe(themes.length);
        expect(t).toBe(themes[0]);
    });
});
describe('gameSurface', () => {
    it('keeps white text readable on every game colour', () => {
        games.forEach((g) => expect(whiteContrast(gameSurface(g.meta.color))).toBeGreaterThanOrEqual(3.3));
    });
    it('leaves colours that are already dark enough alone', () => {
        expect(gameSurface('#5f27cd')).toBe('#5f27cd');
    });
});
