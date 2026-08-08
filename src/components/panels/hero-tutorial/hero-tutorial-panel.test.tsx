// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { HeroTutorialPanel } from '@/components/panels/hero-tutorial/hero-tutorial-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { TutorialMode } from '@/enums/tutorial-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';

// The antd Popover behind the header's Info icon needs ResizeObserver, and antd's responsive
// Steps needs matchMedia; jsdom provides neither. Neither one carries any tutorial behavior.
globalThis.ResizeObserver = class {
	observe = () => undefined;
	unobserve = () => undefined;
	disconnect = () => undefined;
};

window.matchMedia = (query: string) => ({
	media: query,
	matches: false,
	onchange: null,
	addListener: () => undefined,
	removeListener: () => undefined,
	addEventListener: () => undefined,
	removeEventListener: () => undefined,
	dispatchEvent: () => false
});

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions
}));

afterEach(cleanup);

const renderPanel = (value: TutorialMode) => {
	const onChange = vi.fn();

	const { container } = render(
		<LocalizationProvider>
			<LocaleToggle />
			<HeroTutorialPanel value={value} onChange={onChange} />
		</LocalizationProvider>
	);

	return { container, onChange };
};

// A panel driven by a parent that keeps the tutorial mode, so a selection can be seen as the
// canonical value the hero would be given rather than only as a callback argument.
const renderStatefulPanel = (initialValue: TutorialMode) => {
	const onChange = vi.fn();

	const Harness = () => {
		const [ value, setValue ] = useState(initialValue);
		return (
			<>
				<span>{`tutorial mode: ${value}`}</span>
				<HeroTutorialPanel
					value={value}
					onChange={newValue => {
						onChange(newValue);
						setValue(newValue);
					}}
				/>
			</>
		);
	};

	render(
		<LocalizationProvider>
			<LocaleToggle />
			<Harness />
		</LocalizationProvider>
	);

	return { onChange };
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const isDrawn = (text: string) => screen.queryAllByText(text).length > 0;

// The header's explanation lives in a popover, so it is only on screen once the icon is hovered.
const showExplanation = async () => {
	fireEvent.mouseEnter(document.querySelector('.info-icon') as Element);
	return await screen.findByRole('tooltip');
};

// The tutorial mode switch is toggled by its row, whatever that row is labelled.
const toggleTutorialMode = (label: string) => {
	const row = screen.getAllByText(label, { exact: true }).map(el => el.closest('.toggle')).find(el => el !== null);
	expect(row).toBeTruthy();
	fireEvent.click(row as Element);
};

// A stage is chosen by its step, whatever that step is labelled.
const chooseStage = (title: string) => {
	const step = screen.getByText(title, { exact: true }).closest('[role="button"]');
	expect(step).not.toBeNull();
	fireEvent.click(step as Element);
};

// Step order and the restrictions each step lists are structure, not text, so they are read
// off the rendered steps rather than matched against any one wording.
const stageTitles = (container: HTMLElement) => {
	return [ ...container.querySelectorAll('.ant-steps-item-title') ].map(el => el.textContent);
};

const stageRestrictions = (container: HTMLElement) => {
	return [ ...container.querySelectorAll('.ant-steps-item ul') ].map(list => [ ...list.querySelectorAll('li') ].map(item => item.textContent));
};

const currentStageTitle = () => document.querySelector('.ant-steps-item-active .ant-steps-item-title')?.textContent;

describe('HeroTutorialPanel localization', () => {
	const approved = [
		'教學模式',
		'階段 1',
		'階段 2',
		'階段 3',
		'不提供反應動作招式',
		'不提供需要消耗英雄資源的招式',
		'不提供撤離加值',
		'不提供專長',
		'不提供英雄資源費用超過 3 的招式'
	];
	const canonical = [
		'Tutorial Mode',
		'Stage 1',
		'Stage 2',
		'Stage 3',
		'No triggered action abilities',
		'No abilities with a heroic resource cost',
		'No disengage bonus',
		'No perks',
		'No abilities with a heroic resource cost of more than 3'
	];

	it('draws the approved zh-TW copy', async () => {
		renderPanel(TutorialMode.Stage1);

		expect(approved.filter(isDrawn)).toEqual(approved);
		expect(canonical.filter(isDrawn)).toEqual([]);

		await showExplanation();

		expect(isDrawn('如果你想逐步獲得能力，請開啟此模式。')).toBe(true);
		expect(isDrawn('Switch this on if you want to gain your abilities incrementally.')).toBe(false);
	});

	it('draws canonical English in the English locale', async () => {
		renderPanel(TutorialMode.Stage1);

		switchLocale();

		expect(canonical.filter(isDrawn)).toEqual(canonical);
		expect(approved.filter(isDrawn)).toEqual([]);

		await showExplanation();

		expect(isDrawn('Switch this on if you want to gain your abilities incrementally.')).toBe(true);
		expect(isDrawn('如果你想逐步獲得能力，請開啟此模式。')).toBe(false);
	});
});

describe('HeroTutorialPanel canonical tutorial mode', () => {
	it('reports the canonical first stage when tutorial mode is switched on', () => {
		const { onChange } = renderPanel(TutorialMode.Complete);

		toggleTutorialMode('教學模式');

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith(TutorialMode.Stage1);
	});

	it('reports the canonical complete value when tutorial mode is switched off', () => {
		const { onChange } = renderPanel(TutorialMode.Stage2);

		toggleTutorialMode('教學模式');

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith(TutorialMode.Complete);
	});

	// A step only reports a change when it is not the step the hero is already on, so each
	// case starts somewhere else.
	it.each([
		[ '階段 1', TutorialMode.Stage1, TutorialMode.Stage3 ],
		[ '階段 2', TutorialMode.Stage2, TutorialMode.Stage1 ],
		[ '階段 3', TutorialMode.Stage3, TutorialMode.Stage1 ]
	])('reports the canonical tutorial mode when the %s step is chosen', (title, mode, from) => {
		const { onChange } = renderPanel(from);

		chooseStage(title);

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith(mode);
		// Presentation only: no zh-TW stage label reaches the value the hero is given.
		expect(onChange.mock.calls.flat().join()).not.toMatch(/[一-鿿]/);
	});

	it('reports the same canonical tutorial mode for the same step in the English locale', () => {
		const { onChange } = renderPanel(TutorialMode.Stage1);

		switchLocale();
		chooseStage('Stage 3');

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith(TutorialMode.Stage3);
	});

	it('moves the hero to the canonical stage a step selects, in either locale', () => {
		const { onChange } = renderStatefulPanel(TutorialMode.Stage1);

		chooseStage('階段 3');

		expect(isDrawn('tutorial mode: Stage 3')).toBe(true);

		switchLocale();
		chooseStage('Stage 2');

		expect(isDrawn('tutorial mode: Stage 2')).toBe(true);
		expect(onChange.mock.calls).toEqual([ [ TutorialMode.Stage3 ], [ TutorialMode.Stage2 ] ]);
	});

	it('changes nothing but the text on screen when the locale is switched', () => {
		const { onChange } = renderStatefulPanel(TutorialMode.Stage2);

		expect(isDrawn('tutorial mode: Stage 2')).toBe(true);
		expect(currentStageTitle()).toBe('階段 2');

		switchLocale();

		expect(onChange).not.toHaveBeenCalled();
		expect(isDrawn('tutorial mode: Stage 2')).toBe(true);
		expect(currentStageTitle()).toBe('Stage 2');
	});
});

describe('HeroTutorialPanel structure', () => {
	const zhStages = [ '階段 1', '階段 2', '階段 3' ];
	const zhRestrictions = [
		[ '不提供反應動作招式', '不提供需要消耗英雄資源的招式', '不提供撤離加值', '不提供專長' ],
		[ '不提供英雄資源費用超過 3 的招式', '不提供專長' ],
		[ '不提供專長' ]
	];
	const enStages = [ 'Stage 1', 'Stage 2', 'Stage 3' ];
	const enRestrictions = [
		[ 'No triggered action abilities', 'No abilities with a heroic resource cost', 'No disengage bonus', 'No perks' ],
		[ 'No abilities with a heroic resource cost of more than 3', 'No perks' ],
		[ 'No perks' ]
	];

	it('keeps the stages in order, each listing the restrictions it always listed', () => {
		const { container } = renderPanel(TutorialMode.Stage1);

		expect(stageTitles(container)).toEqual(zhStages);
		expect(stageRestrictions(container)).toEqual(zhRestrictions);

		switchLocale();

		expect(stageTitles(container)).toEqual(enStages);
		expect(stageRestrictions(container)).toEqual(enRestrictions);
	});

	it('shows no stages at all while tutorial mode is off', () => {
		const { container } = renderPanel(TutorialMode.Complete);

		expect(stageTitles(container)).toEqual([]);
		expect(isDrawn('教學模式')).toBe(true);
	});
});
