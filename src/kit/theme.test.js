import { describe, expect, it } from 'vitest';
import { games } from '../games/registry';
import { gameSurface, whiteContrast } from './theme';
describe('gameSurface', () => {
    it('keeps white text readable on every game colour', () => {
        games.forEach((g) => expect(whiteContrast(gameSurface(g.meta.color))).toBeGreaterThanOrEqual(3.3));
    });
    it('leaves colours that are already dark enough alone', () => {
        expect(gameSurface('#5f27cd')).toBe('#5f27cd');
    });
});
