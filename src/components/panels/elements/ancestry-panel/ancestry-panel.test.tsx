// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AncestryPanel } from '@/components/panels/elements/ancestry-panel/ancestry-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { CultureType } from '@/enums/culture-type';
import { PanelMode } from '@/enums/panel-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { Ancestry } from '@/models/ancestry';
import { Options } from '@/models/options';
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

afterEach(cleanup);

// Canonical element data: an ancestry with one signature feature, one purchased option and a
// culture. None of it is localized by this panel.
const createTestAncestry = (name: string, withCulture: boolean): Ancestry => {
	const ancestry = FactoryLogic.createAncestry();
	ancestry.id = 'test-ancestry';
	ancestry.name = name;
	ancestry.description = 'Ancestry description.';
	ancestry.ancestryPoints = 3;
	ancestry.features = [
		FactoryLogic.feature.create({ id: 'signature-feature', name: 'Ancestral Sight', description: 'A signature feature.' }),
		FactoryLogic.feature.createChoice({
			id: 'purchased-traits',
			name: 'Purchased Traits',
			count: 'ancestry',
			options: [ { feature: FactoryLogic.feature.create({ id: 'purchased-feature', name: 'Stone Skin', description: 'A purchased feature.' }), value: 2 } ]
		})
	];

	if (withCulture) {
		ancestry.culture = FactoryLogic.createCulture('Ancestral Culture', 'Culture description.', CultureType.Ancestral);
	}

	return ancestry;
};

const renderPanel = (ancestry = createTestAncestry('Dwarf', true), mode = PanelMode.Full) => {
	const { container } = render(
		<LocalizationProvider>
			<LocaleToggle />
			<AncestryPanel ancestry={ancestry} sourcebooks={[]} mode={mode} />
		</LocalizationProvider>
	);

	return { container, ancestry };
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const isDrawn = (text: string) => screen.queryAllByText(text).length > 0;

// A page is chosen by its segment, whatever that segment is labelled.
const choosePage = (label: string) => fireEvent.click(screen.getByTitle(label));

// The page the panel is on is the selected segment; its label is only how that page reads.
const currentPage = () => {
	const selected = screen.getAllByRole('radio').find(radio => (radio as HTMLInputElement).checked);
	return selected?.parentElement?.querySelector('.ant-segmented-item-label')?.getAttribute('title');
};

// The ancestry points row, read as the label and value a player sees side by side.
const ancestryPointsRow = (container: HTMLElement) => {
	const field = [ ...container.querySelectorAll('.field') ].find(el => el.querySelector('.field-label'));
	return field ? [ field.querySelector('.field-label')?.textContent, field.querySelector('.field-value')?.textContent ] : null;
};

describe('AncestryPanel localization', () => {
	const approved = [ '概述', '招牌特性', '自購特性', '文化' ];
	const canonical = [ 'Overview', 'Signature', 'Purchased', 'Culture' ];

	it('draws the approved zh-TW page labels, and canonical English in the English locale', () => {
		renderPanel();

		expect(approved.filter(isDrawn)).toEqual(approved);
		expect(canonical.filter(isDrawn)).toEqual([]);

		switchLocale();

		expect(canonical.filter(isDrawn)).toEqual(canonical);
		expect(approved.filter(isDrawn)).toEqual([]);
	});

	it('draws the approved zh-TW ancestry points label, and canonical English in the English locale', () => {
		const { container } = renderPanel();

		choosePage('自購特性');

		expect(ancestryPointsRow(container)).toEqual([ '族裔點數', '3' ]);

		switchLocale();

		expect(ancestryPointsRow(container)).toEqual([ 'Ancestry Points', '3' ]);
	});

	it('offers no culture page when the ancestry has none, in either locale', () => {
		renderPanel(createTestAncestry('Dwarf', false));

		expect(isDrawn('概述')).toBe(true);
		expect(isDrawn('文化')).toBe(false);

		switchLocale();

		expect(isDrawn('Overview')).toBe(true);
		expect(isDrawn('Culture')).toBe(false);
	});
});

describe('AncestryPanel ancestry name', () => {
	it('draws the ancestry\'s own name as written, in either locale', () => {
		renderPanel();

		expect(isDrawn('Dwarf')).toBe(true);
		expect(isDrawn('未命名族裔')).toBe(false);

		switchLocale();

		expect(isDrawn('Dwarf')).toBe(true);
		expect(isDrawn('Unnamed Ancestry')).toBe(false);
	});

	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('draws the approved zh-TW fallback for an ancestry with no name, in %s mode', (_label, mode) => {
		renderPanel(createTestAncestry('', true), mode);

		expect(isDrawn('未命名族裔')).toBe(true);
		expect(isDrawn('Unnamed Ancestry')).toBe(false);

		switchLocale();

		expect(isDrawn('Unnamed Ancestry')).toBe(true);
		expect(isDrawn('未命名族裔')).toBe(false);
	});
});

describe('AncestryPanel canonical page state', () => {
	it('draws the content each page always drew, whatever that page is labelled', () => {
		renderPanel();

		// Overview is where the panel starts.
		expect(isDrawn('Ancestry description.')).toBe(true);

		choosePage('招牌特性');
		expect(isDrawn('Ancestral Sight')).toBe(true);
		expect(isDrawn('Stone Skin')).toBe(false);

		choosePage('自購特性');
		expect(isDrawn('Stone Skin')).toBe(true);
		expect(isDrawn('Ancestral Sight')).toBe(false);

		choosePage('文化');
		expect(isDrawn('Ancestral Culture')).toBe(true);
	});

	it('reaches the same content from the English labels', () => {
		renderPanel();

		switchLocale();

		choosePage('Signature');
		expect(isDrawn('Ancestral Sight')).toBe(true);

		choosePage('Purchased');
		expect(isDrawn('Stone Skin')).toBe(true);

		choosePage('Culture');
		expect(isDrawn('Ancestral Culture')).toBe(true);
	});

	it('stays on the same page when the locale is switched, changing only its label', () => {
		renderPanel();

		choosePage('招牌特性');

		expect(currentPage()).toBe('招牌特性');
		expect(isDrawn('Ancestral Sight')).toBe(true);

		switchLocale();

		// The page the panel is on is a canonical value, so it survives the label changing.
		expect(currentPage()).toBe('Signature');
		expect(isDrawn('Ancestral Sight')).toBe(true);
		expect(isDrawn('Ancestry description.')).toBe(false);
	});
});
