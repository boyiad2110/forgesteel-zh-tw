// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { ViewSelector } from '@/components/panels/view-selector/view-selector';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions
}));

// jsdom has no ResizeObserver, which antd's popups need before they will draw.
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const getOptions = () => Array.from(document.querySelectorAll('.ant-segmented-item-label'));

// Selecting a mode the way a player does: by clicking its icon.
const selectOption = (index: number) => fireEvent.click(getOptions()[index]);

const renderSelector = (mode: 'hero' | 'classic' | 'printable', onChange = vi.fn()) => {
	render(
		<LocalizationProvider>
			<LocaleToggle />
			<ViewSelector value='modern' mode={mode} onChange={onChange} />
		</LocalizationProvider>
	);

	return onChange;
};

// A mode's tooltip only draws once the option is pointed at, which is how a player reads it.
// Each reading gets its own selector, so what comes back is unambiguously this option's
// tooltip rather than one left open by an earlier hover.
const readTooltip = async (mode: 'hero' | 'classic' | 'printable', index: number, locale: 'zh-TW' | 'en' = 'zh-TW') => {
	cleanup();
	renderSelector(mode);
	if (locale === 'en') {
		switchLocale();
	}

	fireEvent.mouseOver(getOptions()[index].querySelector('.anticon')!);

	return waitFor(() => {
		const tooltip = document.querySelector('.ant-popover');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.textContent).not.toBe('');
		return tooltip!.textContent;
	});
};

describe('ViewSelector localization', () => {
	it('reports the canonical mode for every option, in either locale', () => {
		const onChange = renderSelector('hero');

		expect(getOptions().length).toBe(4);

		// 'modern' is the mode already showing, so the selector has nothing to report for it.
		[ 1, 2, 3 ].forEach(selectOption);

		expect(onChange.mock.calls.map(call => call[0])).toEqual([ 'classic', 'abilities', 'notes' ]);

		const callsBeforeSwitch = onChange.mock.calls.length;
		switchLocale();

		// A locale switch selects nothing: it is a reading change, not a mode change.
		expect(onChange.mock.calls.length).toBe(callsBeforeSwitch);
		expect(getOptions().length).toBe(4);

		[ 1, 2, 3 ].forEach(selectOption);

		expect(onChange.mock.calls.map(call => call[0])).toEqual([
			'classic',
			'abilities',
			'notes',
			'classic',
			'abilities',
			'notes'
		]);
	});

	it('reads every hero mode tooltip', async () => {
		expect(await readTooltip('hero', 0)).toBe('互動檢視（螢幕用）');
		expect(await readTooltip('hero', 1)).toBe('經典檢視（匯出用）');
		expect(await readTooltip('hero', 2)).toBe('標準招式');
		expect(await readTooltip('hero', 3)).toBe('筆記');
	});

	it('restores every canonical tooltip in the English locale', async () => {
		expect(await readTooltip('hero', 0, 'en')).toBe('Interactive View (for on-screen use)');
		expect(await readTooltip('hero', 1, 'en')).toBe('Classic View (for exporting)');
		expect(await readTooltip('hero', 2, 'en')).toBe('Standard Abilities');
		expect(await readTooltip('hero', 3, 'en')).toBe('Notes');
	});

	it('reads the shared interactive and classic modes wherever the selector offers them', async () => {
		expect(await readTooltip('classic', 0)).toBe('互動檢視（螢幕用）');
		expect(await readTooltip('classic', 1)).toBe('經典檢視（匯出用）');
		expect(getOptions().length).toBe(2);
	});

	it('leaves the printable mode canonical, since it has no approved reading in this batch', async () => {
		expect(await readTooltip('printable', 1)).toBe('Print');

		const onChange = vi.fn();
		cleanup();
		renderSelector('printable', onChange);

		expect(getOptions().length).toBe(2);

		selectOption(1);

		expect(onChange).toHaveBeenLastCalledWith('print');
	});
});
