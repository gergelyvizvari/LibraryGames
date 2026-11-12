import { jsx as _jsx } from "react/jsx-runtime";
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocaleContext, locales } from '../i18n';
import { CONTACT_EMAIL } from './contact';
import { Privacy } from './Privacy';
describe('privacy page', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });
    it.each(locales)('shows the contact email in %s', (locale) => {
        vi.spyOn(window, 'scrollTo').mockImplementation(() => { });
        const { getByText } = render(_jsx(LocaleContext.Provider, { value: locale, children: _jsx(Privacy, { onHome: () => { } }) }));
        expect(getByText(CONTACT_EMAIL)).toBeTruthy();
    });
    // Newer browsers return a Promise from scrollTo; leaving the page must not treat it as an effect cleanup.
    it('can be closed when scrollTo returns a promise', () => {
        vi.spyOn(window, 'scrollTo').mockImplementation((() => Promise.resolve()));
        const { unmount } = render(_jsx(Privacy, { onHome: () => { } }));
        expect(() => unmount()).not.toThrow();
    });
});
