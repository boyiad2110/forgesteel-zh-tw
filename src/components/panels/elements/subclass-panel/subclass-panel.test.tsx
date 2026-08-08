// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { SubclassPanel } from '@/components/panels/elements/subclass-panel/subclass-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { PanelMode } from '@/enums/panel-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { SubClass } from '@/models/subclass';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text }: { text: string }) => <span>{text}</span>,
	MarkdownEditor: ({ value }: { value: string }) => <span>{value}</span>
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/panels/power-roll/power-roll-panel', () => ({ PowerRollPanel: () => null }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions,
	useHeroes: () => []
}));

afterEach(cleanup);

// Canonical element data: a subclass with features at level 1 and level 3, one signature
// ability and one costing 3. None of it is localized by this panel.
const createTestSubclass = (name: string): SubClass => {
	const subclass = FactoryLogic.createSubclass();
	subclass.id = 'test-subclass';
	subclass.name = name;
	subclass.description = 'Subclass description.';

	const featuresAt = (level: number, features: { id: string, name: string }[]) => {
		const entry = subclass.featuresByLevel.find(lvl => lvl.level === level);
		features.forEach(f => entry?.features.push(FactoryLogic.feature.create({ id: f.id, name: f.name, description: `${f.name} description.` })));
	};

	featuresAt(1, [ { id: 'feature-1', name: 'Stormcaller' } ]);
	featuresAt(3, [ { id: 'feature-3', name: 'Thunderstep' } ]);

	subclass.abilities = [
		FactoryLogic.createAbility({ id: 'signature-ability', name: 'Lightning Lash', cost: 'signature', sections: [] }),
		FactoryLogic.createAbility({ id: 'costly-ability', name: 'Thunderclap', cost: 3, sections: [] })
	];

	return subclass;
};

const renderPanel = (subclass = createTestSubclass('Stormwright'), mode = PanelMode.Full) => {
	const { container } = render(
		<LocalizationProvider>
			<LocaleToggle />
			<SubclassPanel subclass={subclass} sourcebooks={[]} mode={mode} />
		</LocalizationProvider>
	);

	return { container, subclass };
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

const segmentLabels = (container: HTMLElement) => [ ...container.querySelectorAll('.ant-segmented-item-label') ].map(label => label.getAttribute('title'));

// A collapsed group only shows its heading; its contents need the heading clicking.
const expandGroup = (heading: string) => {
	const header = screen.getByText(heading, { exact: true }).closest('.ant-collapse-header');
	expect(header).not.toBeNull();
	fireEvent.click(header as Element);
};

// The level headings on the features page, each with the feature names it always listed.
const levelRows = (container: HTMLElement) => {
	return [ ...container.querySelectorAll('.field') ].map(field => [ field.querySelector('.field-label')?.textContent, field.querySelector('.field-value')?.textContent ]);
};

const groupHeadings = (container: HTMLElement) => [ ...container.querySelectorAll('.ant-collapse-header') ].map(header => header.textContent);

describe('SubclassPanel navigation', () => {
	const approved = [ '概述', '特性', '招式' ];
	const canonical = [ 'Overview', 'Features', 'Abilities' ];

	it('draws the approved zh-TW tabs, and canonical English in the English locale', () => {
		const { container } = renderPanel();

		expect(segmentLabels(container)).toEqual(approved);

		switchLocale();

		expect(segmentLabels(container)).toEqual(canonical);
	});

	it('offers no abilities tab when the subclass has none, in either locale', () => {
		const subclass = createTestSubclass('Stormwright');
		subclass.abilities = [];
		const { container } = renderPanel(subclass);

		expect(segmentLabels(container)).toEqual([ '概述', '特性' ]);

		switchLocale();

		expect(segmentLabels(container)).toEqual([ 'Overview', 'Features' ]);
	});

	it('reaches the content each page always drew, from the zh-TW labels', () => {
		renderPanel();

		// Overview is where the panel starts.
		expect(isDrawn('Subclass description.')).toBe(true);

		choosePage('特性');
		expect(isDrawn('Stormcaller')).toBe(true);

		choosePage('招式');
		expect(isDrawn('招牌招式')).toBe(true);
		expect(isDrawn('Stormcaller')).toBe(false);

		choosePage('概述');
		expect(isDrawn('Subclass description.')).toBe(true);
	});

	it('reaches the same content from the English labels', () => {
		renderPanel();

		switchLocale();

		choosePage('Features');
		expect(isDrawn('Stormcaller')).toBe(true);

		choosePage('Abilities');
		expect(isDrawn('Signature Abilities')).toBe(true);

		choosePage('Overview');
		expect(isDrawn('Subclass description.')).toBe(true);
	});

	it('stays on the same page when the locale is switched, changing only its label', () => {
		const { subclass } = renderPanel();
		const subclassBefore = JSON.stringify(subclass);

		choosePage('特性');

		expect(currentPage()).toBe('特性');
		expect(isDrawn('Stormcaller')).toBe(true);

		switchLocale();

		// The page the panel is on is a canonical value, so it survives the label changing.
		expect(currentPage()).toBe('Features');
		expect(isDrawn('Stormcaller')).toBe(true);
		expect(isDrawn('Subclass description.')).toBe(false);
		expect(JSON.stringify(subclass)).toBe(subclassBefore);
	});
});

describe('SubclassPanel level headings', () => {
	it('reads a level heading in the approved zh-TW, and canonically in the English locale', () => {
		const { container, subclass } = renderPanel();

		choosePage('特性');

		expect(levelRows(container)).toEqual([
			[ '1 級', 'Stormcaller' ],
			[ '3 級', 'Thunderstep' ]
		]);

		switchLocale();

		expect(levelRows(container)).toEqual([
			[ 'Level 1', 'Stormcaller' ],
			[ 'Level 3', 'Thunderstep' ]
		]);
		// Presentation only: the levels the subclass carries are still numbers.
		expect(subclass.featuresByLevel.filter(lvl => lvl.features.length > 0).map(lvl => lvl.level)).toEqual([ 1, 3 ]);
	});

	it('draws the feature content as written, in either locale', () => {
		renderPanel();

		choosePage('特性');
		expandGroup('3 級');

		expect(isDrawn('Thunderstep description.')).toBe(true);

		switchLocale();

		expect(isDrawn('Thunderstep description.')).toBe(true);
		expect(isDrawn('Thunderstep')).toBe(true);
	});
});

describe('SubclassPanel ability groups', () => {
	it('reads the ability group headings in the approved zh-TW, and canonically in the English locale', () => {
		const { container } = renderPanel();

		choosePage('招式');

		expect(groupHeadings(container)).toEqual([ '招牌招式', '3 費招式' ]);

		switchLocale();

		expect(groupHeadings(container)).toEqual([ 'Signature Abilities', '3pt Abilities' ]);
	});

	it('leaves the abilities\' own cost and content canonical', () => {
		const { subclass } = renderPanel();
		const abilitiesBefore = JSON.stringify(subclass.abilities);

		choosePage('招式');
		expandGroup('3 費招式');

		expect(isDrawn('Thunderclap')).toBe(true);

		switchLocale();

		expect(isDrawn('Thunderclap')).toBe(true);
		// The sentinel and the numeric cost are what the abilities are grouped by, and neither
		// is replaced by the heading drawn over it.
		expect(subclass.abilities.map(a => a.cost)).toEqual([ 'signature', 3 ]);
		expect(typeof subclass.abilities[1].cost).toBe('number');
		expect(JSON.stringify(subclass.abilities)).toBe(abilitiesBefore);
	});
});

describe('SubclassPanel subclass name', () => {
	it('draws the subclass\'s own name as written, in either locale', () => {
		renderPanel();

		expect(isDrawn('Stormwright')).toBe(true);
		expect(isDrawn('未命名子範型')).toBe(false);

		switchLocale();

		expect(isDrawn('Stormwright')).toBe(true);
		expect(isDrawn('Unnamed Subclass')).toBe(false);
	});

	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('draws the approved zh-TW fallback for a subclass with no name, in %s mode', (_label, mode) => {
		renderPanel(createTestSubclass(''), mode);

		expect(isDrawn('未命名子範型')).toBe(true);
		expect(isDrawn('Unnamed Subclass')).toBe(false);

		switchLocale();

		expect(isDrawn('Unnamed Subclass')).toBe(true);
		expect(isDrawn('未命名子範型')).toBe(false);
	});
});
