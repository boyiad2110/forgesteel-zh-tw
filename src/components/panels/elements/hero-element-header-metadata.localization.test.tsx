// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AncestryPanel } from '@/components/panels/elements/ancestry-panel/ancestry-panel';
import { CareerPanel } from '@/components/panels/elements/career-panel/career-panel';
import { ClassPanel } from '@/components/panels/elements/class-panel/class-panel';
import { ComplicationPanel } from '@/components/panels/elements/complication-panel/complication-panel';
import { CulturePanel } from '@/components/panels/elements/culture-panel/culture-panel';
import { SubclassPanel } from '@/components/panels/elements/subclass-panel/subclass-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { CultureType } from '@/enums/culture-type';
import { PanelMode } from '@/enums/panel-mode';
import { SourcebookType } from '@/enums/sourcebook-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text }: { text: string }) => <span>{text}</span>,
	MarkdownEditor: ({ value }: { value: string }) => <span>{value}</span>
}));
vi.mock('@/components/panels/elements/feature-panel/feature-panel', () => ({ FeaturePanel: () => null }));
vi.mock('@/components/panels/elements/ability-panel/ability-panel', () => ({ AbilityPanel: () => null }));

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions,
	useHeroes: () => []
}));

afterEach(cleanup);

const createPanelData = (sourcebookType: SourcebookType) => {
	const ancestry = FactoryLogic.createAncestry();
	ancestry.id = 'test-ancestry';
	ancestry.name = 'Dwarf';
	ancestry.features = [];

	const career = FactoryLogic.createCareer();
	career.id = 'test-career';
	career.name = 'Soldier';

	const culture = FactoryLogic.createCulture('Highland Clans', '', CultureType.Ancestral);
	culture.id = 'test-culture';

	const heroClass = FactoryLogic.createClass();
	heroClass.id = 'test-class';
	heroClass.name = 'Tactician';

	const subclass = FactoryLogic.createSubclass();
	subclass.id = 'test-subclass';
	subclass.name = 'Stormwright';

	const complication = FactoryLogic.createComplication();
	complication.id = 'test-complication';
	complication.name = 'Fateful Omen';

	const sourcebook = FactoryLogic.createSourcebook();
	sourcebook.id = 'test-sourcebook';
	sourcebook.type = sourcebookType;
	sourcebook.ancestries = [ ancestry ];
	sourcebook.careers = [ career ];
	sourcebook.cultures = [ culture ];
	sourcebook.classes = [ heroClass ];
	sourcebook.subclasses = [ subclass ];
	sourcebook.complications = [ complication ];

	return { ancestry, career, culture, heroClass, subclass, complication, sourcebook };
};

const renderPanels = (sourcebookType = SourcebookType.Homebrew) => {
	const data = createPanelData(sourcebookType);
	render(
		<LocalizationProvider>
			<LocaleToggle />
			<AncestryPanel ancestry={data.ancestry} sourcebooks={[ data.sourcebook ]} mode={PanelMode.Full} />
			<CareerPanel career={data.career} sourcebooks={[ data.sourcebook ]} mode={PanelMode.Full} />
			<CulturePanel culture={data.culture} sourcebooks={[ data.sourcebook ]} mode={PanelMode.Full} />
			<ClassPanel heroClass={data.heroClass} sourcebooks={[ data.sourcebook ]} mode={PanelMode.Full} />
			<SubclassPanel subclass={data.subclass} sourcebooks={[ data.sourcebook ]} mode={PanelMode.Full} />
			<ComplicationPanel complication={data.complication} sourcebooks={[ data.sourcebook ]} mode={PanelMode.Full} />
		</LocalizationProvider>
	);

	return data;
};

const renderComplication = (name: string, mode: PanelMode) => {
	const complication = FactoryLogic.createComplication();
	complication.id = 'test-complication';
	complication.name = name;

	render(
		<LocalizationProvider>
			<LocaleToggle />
			<ComplicationPanel complication={complication} sourcebooks={[]} mode={mode} />
		</LocalizationProvider>
	);

	return complication;
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

describe('Hero element header sourcebook tags', () => {
	it('renders the Homebrew tag in the approved zh-TW on every in-scope panel, and canonical English after switching locale', () => {
		const data = renderPanels();
		const canonicalBefore = JSON.stringify(data);

		expect(screen.getAllByText('自製', { exact: true })).toHaveLength(6);
		expect(screen.getByText('族裔', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getAllByText('Homebrew', { exact: true })).toHaveLength(6);
		expect(screen.getByText('Ancestral', { exact: true })).toBeTruthy();
		expect(data.sourcebook.type).toBe(SourcebookType.Homebrew);
		expect(JSON.stringify(data)).toBe(canonicalBefore);
	});

	it('does not add a sourcebook tag when the same elements come from an official sourcebook', () => {
		renderPanels(SourcebookType.Official);

		expect(screen.queryByText('自製', { exact: true })).toBeNull();
		expect(screen.queryByText('Homebrew', { exact: true })).toBeNull();
		expect(screen.getByText('族裔', { exact: true })).toBeTruthy();
	});

	it('keeps an unapproved sourcebook type as its canonical value', () => {
		renderPanels(SourcebookType.Community);

		expect(screen.getAllByText('Community', { exact: true })).toHaveLength(6);
		expect(screen.queryByText('自製', { exact: true })).toBeNull();
	});
});

describe('ComplicationPanel unnamed fallback', () => {
	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('renders the approved zh-TW fallback in %s mode and canonical English after switching locale', (_label, mode) => {
		const complication = renderComplication('', mode);

		expect(screen.getByText('未命名糾葛', { exact: true })).toBeTruthy();
		expect(screen.queryByText('Unnamed Complication', { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getByText('Unnamed Complication', { exact: true })).toBeTruthy();
		expect(screen.queryByText('未命名糾葛', { exact: true })).toBeNull();
		expect(complication.name).toBe('');
	});

	it('keeps a named complication canonical in either locale', () => {
		const complication = renderComplication('Fateful Omen', PanelMode.Full);

		expect(screen.getByText('Fateful Omen', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Fateful Omen', { exact: true })).toBeTruthy();
		expect(complication.name).toBe('Fateful Omen');
	});
});
