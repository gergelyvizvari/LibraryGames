import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { stories, storiesFor } from './content';
import { askKey, makeDealer, shuffleCards, showPictures } from './logic';
describe('story order logic', () => {
    it('never deals the cards already in order', () => {
        const rng = makeRng(7);
        for (const story of stories.en) {
            for (let i = 0; i < 20; i++) {
                const cards = shuffleCards(rng, story);
                expect(cards.map((c) => c.step).sort()).toEqual(story.steps.map((_, k) => k));
                expect(cards.every((c, k) => c.step === k)).toBe(false);
            }
        }
    });
    it('deals every story once before any comes back, and never twice in a row', () => {
        for (const level of [1, 5, 10]) {
            const pool = storiesFor(stories.en, level);
            const deal = makeDealer(makeRng(level), stories.en, level);
            const first = Array.from({ length: pool.length }, deal);
            expect(new Set(first).size).toBe(pool.length);
            let prev = first[first.length - 1];
            for (let i = 0; i < pool.length * 3; i++) {
                const next = deal();
                expect(next).not.toBe(prev);
                prev = next;
            }
        }
    });
    it('gives three-step stories to the youngest and four-step ones at the top', () => {
        expect(storiesFor(stories.en, 1).every((x) => x.steps.length === 3)).toBe(true);
        expect(storiesFor(stories.en, 10).every((x) => x.steps.length === 4)).toBe(true);
        expect(new Set(storiesFor(stories.en, 5).map((x) => x.steps.length)).size).toBe(2);
    });
    it('asks the right question', () => {
        expect(askKey(0, 4)).toBe('first');
        expect(askKey(1, 4)).toBe('next');
        expect(askKey(3, 4)).toBe('last');
    });
    it('drops the pictures at level 7', () => {
        expect(showPictures(6)).toBe(true);
        expect(showPictures(7)).toBe(false);
    });
});
