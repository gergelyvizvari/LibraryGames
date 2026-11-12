import { describe, expect, it } from 'vitest';
import strings from './strings';
describe('simon says Hungarian article', () => {
    it('puts "az" before a vowel and "a" before a consonant', () => {
        const taps = Object.entries(strings.hu).filter(([k]) => k.endsWith('.tap'));
        expect(taps.length).toBeGreaterThan(0);
        for (const [, v] of taps) {
            const [article, word] = v.split(' ');
            expect(article).toBe(/^[aáeéiíoóöőuúüű]/i.test(word) ? 'az' : 'a');
        }
    });
});
