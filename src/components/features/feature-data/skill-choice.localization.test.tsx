// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { ConfigSkillChoice, InfoSkillChoice } from '@/components/features/feature-data/skill-choice';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureSkillChoiceData } from '@/models/feature';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { Options } from '@/models/options';
import { ReactNode } from 'react';
import { SkillList } from '@/enums/skill-list';
import { core } from '@/data/sourcebooks/official/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text }: { text: string }) => <span>{text}</span>,
	MarkdownEditor: ({ value }: { value: string }) => <span>{value}</span>
}));

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions,
	useHeroes: () => []
}));

class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const renderLocalized = (content: ReactNode) => render(
	<LocalizationProvider>
		<LocaleToggle />
		{content}
	</LocalizationProvider>
);

const feature = FactoryLogic.feature.createSkillChoice({ id: 'test-feature', listOptions: [ SkillList.Crafting ] });
const hero = FactoryLogic.createHero();

describe('InfoSkillChoice localization', () => {
	it('shows the approved zh-TW name for a selected canonical Skill, and canonical English after switching locale', () => {
		const data: FeatureSkillChoiceData = { options: [], listOptions: [ SkillList.Crafting ], count: 1, selectAt: 'build', selected: [ 'Alchemy' ] };

		renderLocalized(<InfoSkillChoice data={data} feature={feature} hero={hero} sourcebooks={[ core ]} />);

		expect(screen.getByText('鍊金', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Alchemy', { exact: true })).toBeTruthy();
	});

	it('leaves a custom / unrecognized selected Skill string untranslated', () => {
		const data: FeatureSkillChoiceData = { options: [], listOptions: [], count: 1, selectAt: 'build', selected: [ 'My Custom Skill' ] };

		renderLocalized(<InfoSkillChoice data={data} feature={feature} hero={hero} sourcebooks={[ core ]} />);

		expect(screen.getByText('My Custom Skill', { exact: true })).toBeTruthy();
	});
});

describe('ConfigSkillChoice localization (real Skill: Alchemy)', () => {
	it('shows the approved zh-TW name/description, restores canonical English on switch, and never mutates the canonical Skill', () => {
		const alchemy = core.skills.find(s => s.name === 'Alchemy')!;
		const serialized = JSON.stringify(alchemy);
		const data: FeatureSkillChoiceData = { options: [], listOptions: [ SkillList.Crafting ], count: 1, selectAt: 'build', selected: [ 'Alchemy' ] };
		const setData = vi.fn();

		renderLocalized(
			<ConfigSkillChoice data={data} feature={feature} hero={hero} sourcebooks={[ core ]} setData={setData} />
		);

		expect(screen.getByText('鍊金', { exact: true })).toBeTruthy();
		expect(screen.getByText('製作炸彈與藥水', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Alchemy', { exact: true })).toBeTruthy();
		expect(screen.getByText('Make bombs and potions.', { exact: true })).toBeTruthy();

		expect(JSON.stringify(alchemy)).toBe(serialized);
	});

	it('removes a selected Skill by its canonical English name, still stored in data.selected', () => {
		const data: FeatureSkillChoiceData = { options: [], listOptions: [ SkillList.Crafting ], count: 1, selectAt: 'build', selected: [ 'Alchemy' ] };
		const setData = vi.fn();

		renderLocalized(
			<ConfigSkillChoice data={data} feature={feature} hero={hero} sourcebooks={[ core ]} setData={setData} />
		);

		fireEvent.click(screen.getByTitle('移除'));

		expect(setData).toHaveBeenCalledTimes(1);
		const updated = setData.mock.calls[0][0] as FeatureSkillChoiceData;
		expect(updated.selected).toEqual([]);
	});

	it('selecting a Skill from the picker stores its canonical English name in data.selected, not the zh-TW reading', () => {
		const data: FeatureSkillChoiceData = { options: [], listOptions: [ SkillList.Crafting ], count: 1, selectAt: 'build', selected: [] };
		const setData = vi.fn();

		renderLocalized(
			<ConfigSkillChoice data={data} feature={feature} hero={hero} sourcebooks={[ core ]} setData={setData} />
		);

		fireEvent.click(screen.getByText('選擇 1 項技能', { exact: true }));
		fireEvent.click(screen.getByText('鍊金', { exact: true }));

		expect(setData).toHaveBeenCalledTimes(1);
		const updated = setData.mock.calls[0][0] as FeatureSkillChoiceData;
		expect(updated.selected).toEqual([ 'Alchemy' ]);
	});
});
