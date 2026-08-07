// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
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

const renderToggle = () => {
	return render(
		<LocalizationProvider>
			<LocaleToggle />
		</LocalizationProvider>
	);
};

beforeEach(() => {
	saveOptions.mockReset();
	saveOptions.mockResolvedValue(undefined);
	currentOptions = FactoryLogic.createOptions();
});

afterEach(cleanup);

describe('LocaleToggle', () => {
	it('shows the current locale and switches zh-TW to en and back', () => {
		currentOptions.locale = 'zh-TW';

		renderToggle();

		const toggle = () => screen.getByRole('button', { name: /^Switch to / });

		expect(toggle().textContent).toBe('中文');
		expect(toggle().getAttribute('aria-label')).toBe('Switch to English');

		fireEvent.click(toggle());
		expect(toggle().textContent).toBe('EN');
		expect(toggle().getAttribute('aria-label')).toBe('Switch to Traditional Chinese');

		fireEvent.click(toggle());
		expect(toggle().textContent).toBe('中文');
		expect(toggle().getAttribute('aria-label')).toBe('Switch to English');
	});

	it('starts from a saved en preference', () => {
		currentOptions.locale = 'en';

		renderToggle();

		expect(screen.getByRole('button', { name: 'Switch to Traditional Chinese' }).textContent).toBe('EN');
	});

	it('renders a single locale control', () => {
		currentOptions.locale = 'zh-TW';

		renderToggle();

		expect(screen.getAllByRole('button')).toHaveLength(1);
		expect(screen.queryByRole('button', { name: 'EN' })).toBeNull();
		expect(screen.queryByText('Prototype locale')).toBeNull();
	});

	it('persists exactly once per click, through the existing options boundary', () => {
		currentOptions.locale = 'zh-TW';

		renderToggle();
		const toggle = () => screen.getByRole('button', { name: /^Switch to / });

		fireEvent.click(toggle());
		expect(saveOptions).toHaveBeenCalledTimes(1);
		expect(saveOptions).toHaveBeenNthCalledWith(1, { ...currentOptions, locale: 'en' });

		fireEvent.click(toggle());
		expect(saveOptions).toHaveBeenCalledTimes(2);
		expect(saveOptions).toHaveBeenNthCalledWith(2, { ...currentOptions, locale: 'zh-TW' });
	});

	it('exposes the current label to assistive technology, not only through colour', () => {
		currentOptions.locale = 'zh-TW';

		renderToggle();

		const button = screen.getByRole('button', { name: 'Switch to English' });
		expect(button.tagName).toBe('BUTTON');
		expect(button.textContent).toBe('中文');
		expect(button.getAttribute('title')).toBe('Switch to English');
	});
});
