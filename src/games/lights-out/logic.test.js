import { describe, expect, it } from 'vitest';
import { accuracyFor, animalKey, pointsFor } from './logic';
describe('lights out scoring', () => {
    it('rewards faster reactions', () => {
        expect(pointsFor(200)).toBeGreaterThan(pointsFor(400));
        expect(pointsFor(5000)).toBe(0);
    });
    it('maps times to animals', () => {
        expect(animalKey(200)).toBe('cheetah');
        expect(animalKey(900)).toBe('turtle');
    });
    it('is forgiving for young players and sharper at high levels', () => {
        expect(accuracyFor([500, 500], 1)).toBe(1);
        expect(accuracyFor([1100], 1)).toBe(0);
        expect(accuracyFor([500, 500], 10)).toBeLessThan(0.6);
        expect(accuracyFor([260], 10)).toBe(1);
    });
});
