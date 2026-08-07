// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { LocalizationProvider, useLocalization } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const saveOptions = vi.fn();
let currentOptions: Options;

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions }),
	useOptions: () => currentOptions
}));

const LocaleProbe = () => {
	const { locale, setLocale } = useLocalization();

	return (
		<div>
			<output data-testid='locale'>{locale}</output>
			<button onClick={() => setLocale('en')} type='button'>EN</button>
			<button onClick={() => setLocale('zh-TW')} type='button'>zh-TW</button>
		</div>
	);
};

const renderProvider = () => {
	return render(
		<LocalizationProvider>
			<LocaleProbe />
		</LocalizationProvider>
	);
};

beforeEach(() => {
	saveOptions.mockReset();
	saveOptions.mockResolvedValue(undefined);
	currentOptions = FactoryLogic.createOptions();
});

// This project does not enable global test setup, so the rendered tree is torn down here.
afterEach(cleanup);

describe('LocalizationProvider initial locale', () => {
	it('uses a saved zh-TW preference', () => {
		currentOptions.locale = 'zh-TW';

		renderProvider();

		expect(screen.getByTestId('locale').textContent).toBe('zh-TW');
	});

	it('uses a saved en preference', () => {
		currentOptions.locale = 'en';

		renderProvider();

		expect(screen.getByTestId('locale').textContent).toBe('en');
	});

	it('falls back to zh-TW for an unsupported saved value', () => {
		currentOptions.locale = 'fr' as Options['locale'];

		renderProvider();

		expect(screen.getByTestId('locale').textContent).toBe('zh-TW');
	});
});

describe('LocalizationProvider persistence', () => {
	it('saves the complete updated options through the existing options persistence', () => {
		currentOptions.locale = 'zh-TW';
		currentOptions.xpPerLevel = 32;
		const optionsBeforeSwitch = JSON.stringify(currentOptions);

		renderProvider();
		fireEvent.click(screen.getByRole('button', { name: 'EN' }));

		expect(saveOptions).toHaveBeenCalledTimes(1);

		const saved = saveOptions.mock.calls[0][0] as Options;
		expect(saved).toEqual({ ...currentOptions, locale: 'en' });
		expect(Object.keys(saved).sort()).toEqual(Object.keys(currentOptions).sort());
		expect(saved.xpPerLevel).toBe(32);

		// The loaded options object itself is not edited in place.
		expect(JSON.stringify(currentOptions)).toBe(optionsBeforeSwitch);
		expect(screen.getByTestId('locale').textContent).toBe('en');
	});

	it('persists every switch, including switching back', () => {
		currentOptions.locale = 'zh-TW';

		renderProvider();
		fireEvent.click(screen.getByRole('button', { name: 'EN' }));
		fireEvent.click(screen.getByRole('button', { name: 'zh-TW' }));

		expect(saveOptions).toHaveBeenCalledTimes(2);
		expect((saveOptions.mock.calls[0][0] as Options).locale).toBe('en');
		expect((saveOptions.mock.calls[1][0] as Options).locale).toBe('zh-TW');
		expect(screen.getByTestId('locale').textContent).toBe('zh-TW');
	});
});
