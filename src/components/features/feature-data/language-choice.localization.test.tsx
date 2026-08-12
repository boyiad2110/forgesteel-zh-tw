// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { ConfigLanguageChoice, InfoLanguageChoice } from '@/components/features/feature-data/language-choice';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureLanguageChoiceData } from '@/models/feature';
import { LanguageType } from '@/enums/language-type';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { Options } from '@/models/options';
import { ReactNode } from 'react';
import { orden } from '@/data/sourcebooks/official/orden';
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

const feature = FactoryLogic.feature.createLanguageChoice({ id: 'test-feature' });
const hero = FactoryLogic.createHero();

describe('InfoLanguageChoice localization', () => {
	it('shows the approved zh-TW name for a selected canonical Language, and canonical English after switching locale', () => {
		const data: FeatureLanguageChoiceData = { options: [], allowedTypes: [ LanguageType.Common ], count: 1, selectAt: 'build', selected: [ 'Caelian' ] };

		renderLocalized(<InfoLanguageChoice data={data} feature={feature} hero={hero} sourcebooks={[ orden ]} />);

		expect(screen.getByText('凱利安語', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Caelian', { exact: true })).toBeTruthy();
	});

	it('leaves a custom / unrecognized selected Language string untranslated', () => {
		const data: FeatureLanguageChoiceData = { options: [], allowedTypes: [], count: 1, selectAt: 'build', selected: [ 'My Custom Language' ] };

		renderLocalized(<InfoLanguageChoice data={data} feature={feature} hero={hero} sourcebooks={[ orden ]} />);

		expect(screen.getByText('My Custom Language', { exact: true })).toBeTruthy();
	});
});

describe('ConfigLanguageChoice localization (real Language: Caelian)', () => {
	it('shows the approved zh-TW name/description, restores canonical English on switch, and never mutates the canonical Language', () => {
		const caelian = orden.languages.find(l => l.name === 'Caelian')!;
		const serialized = JSON.stringify(caelian);
		const data: FeatureLanguageChoiceData = { options: [], allowedTypes: [ LanguageType.Common ], count: 1, selectAt: 'build', selected: [ 'Caelian' ] };
		const setData = vi.fn();

		renderLocalized(
			<ConfigLanguageChoice data={data} feature={feature} hero={hero} sourcebooks={[ orden ]} setData={setData} />
		);

		expect(screen.getByText('凱利安語', { exact: true })).toBeTruthy();
		expect(screen.getByText('古代凱利安帝國的語言；歐爾登的通用語。', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Caelian', { exact: true })).toBeTruthy();
		expect(screen.getByText('The language of the ancient Caelian Empire; the common tongue of Orden.', { exact: true })).toBeTruthy();

		expect(JSON.stringify(caelian)).toBe(serialized);
	});

	it('removes a selected Language by its canonical English name, still stored in data.selected', () => {
		const data: FeatureLanguageChoiceData = { options: [], allowedTypes: [ LanguageType.Common ], count: 1, selectAt: 'build', selected: [ 'Caelian' ] };
		const setData = vi.fn();

		renderLocalized(
			<ConfigLanguageChoice data={data} feature={feature} hero={hero} sourcebooks={[ orden ]} setData={setData} />
		);

		fireEvent.click(screen.getByTitle('移除'));

		expect(setData).toHaveBeenCalledTimes(1);
		const updated = setData.mock.calls[0][0] as FeatureLanguageChoiceData;
		expect(updated.selected).toEqual([]);
	});

	it('selecting a Language from the picker stores its canonical English name in data.selected, not the zh-TW reading', () => {
		const data: FeatureLanguageChoiceData = { options: [], allowedTypes: [ LanguageType.Common ], count: 1, selectAt: 'build', selected: [] };
		const setData = vi.fn();

		renderLocalized(
			<ConfigLanguageChoice data={data} feature={feature} hero={hero} sourcebooks={[ orden ]} setData={setData} />
		);

		fireEvent.click(screen.getByText('選擇 1 種語言', { exact: true }));
		fireEvent.click(screen.getByText('凱利安語', { exact: true }));

		expect(setData).toHaveBeenCalledTimes(1);
		const updated = setData.mock.calls[0][0] as FeatureLanguageChoiceData;
		expect(updated.selected).toEqual([ 'Caelian' ]);
	});
});
