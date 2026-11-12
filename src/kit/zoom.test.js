import { afterEach, describe, expect, it } from 'vitest';
import { lockZoom } from './zoom';
let unlock = () => { };
afterEach(() => {
    unlock();
    document.head.innerHTML = '';
});
describe('lockZoom', () => {
    it('turns viewport zoom off and back on', () => {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        document.head.append(meta);
        unlock = lockZoom();
        expect(meta.content).toBe('width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no');
        unlock();
        expect(meta.content).toBe('width=device-width, initial-scale=1.0');
    });
    it('cancels a trackpad pinch and Ctrl +, but not plain scrolling or typing', () => {
        unlock = lockZoom();
        const pinch = new WheelEvent('wheel', { ctrlKey: true, cancelable: true });
        const scroll = new WheelEvent('wheel', { cancelable: true });
        const plus = new KeyboardEvent('keydown', { key: '+', ctrlKey: true, cancelable: true });
        const typing = new KeyboardEvent('keydown', { key: '1', cancelable: true });
        for (const e of [pinch, scroll, plus, typing])
            window.dispatchEvent(e);
        expect([pinch, scroll, plus, typing].map((e) => e.defaultPrevented)).toEqual([true, false, true, false]);
    });
});
