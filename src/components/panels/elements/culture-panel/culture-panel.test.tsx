// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { CulturePanel } from '@/components/panels/elements/culture-panel/culture-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { CultureType } from '@/enums/culture-type';
import { PanelMode } from '@/enums/panel-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { Culture } from '@/models/culture';
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

// Canonical element data: a culture with its three aspect features. None of it is localized by
// this panel.
const createTestCulture = (name: string, type: CultureType): Culture => {
	const culture = FactoryLogic.createCulture(
		name,
		'Culture description.',
		type,
		FactoryLogic.feature.create({ id: 'environment', name: 'Nomadic', description: 'An environment.' }),
		FactoryLogic.feature.create({ id: 'organization', name: 'Communal', description: 'An organization.' }),
		FactoryLogic.feature.create({ id: 'upbringing', name: 'Martial', description: 'An upbringing.' })
	);
	culture.id = 'test-culture';
	return culture;
};

const renderPanel = (culture = createTestCulture('Highland Clans', CultureType.Ancestral), mode = PanelMode.Full) => {
	const { container } = render(
		<LocalizationProvider>
			<LocaleToggle />
			<CulturePanel culture={culture} sourcebooks={[]} mode={mode} />
		</LocalizationProvider>
	);

	return { container, culture };
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const isDrawn = (text: string) => screen.queryAllByText(text).length > 0;

// The tags drawn beside the culture's name, in the order they are shown.
const tags = (container: HTMLElement) => [ ...container.querySelectorAll('.ant-tag') ].map(tag => tag.textContent);

describe('CulturePanel culture type tag', () => {
	it.each([
		[ CultureType.Bespoke, '自訂', 'Bespoke' ],
		[ CultureType.Ancestral, '族裔', 'Ancestral' ],
		[ CultureType.Professional, '專業', 'Professional' ],
		[ CultureType.Regional, '地區', 'Regional' ]
	])('draws the approved zh-TW tag for a %s culture, and canonical English in the English locale', (type, approved, canonical) => {
		const { container, culture } = renderPanel(createTestCulture('Highland Clans', type));

		expect(tags(container)).toEqual([ approved ]);

		switchLocale();

		expect(tags(container)).toEqual([ canonical ]);
		// Presentation only: the culture's own type is the canonical CultureType throughout.
		expect(culture.type).toBe(type);
	});

	it('changes nothing but the tag text when the locale is switched', () => {
		const { container, culture } = renderPanel();
		const cultureBefore = JSON.stringify(culture);

		expect(tags(container)).toEqual([ '族裔' ]);

		switchLocale();

		expect(tags(container)).toEqual([ 'Ancestral' ]);
		expect(culture.type).toBe(CultureType.Ancestral);
		expect(JSON.stringify(culture)).toBe(cultureBefore);
	});
});

describe('CulturePanel culture name', () => {
	it('draws the culture\'s own name as written, in either locale', () => {
		renderPanel();

		expect(isDrawn('Highland Clans')).toBe(true);
		expect(isDrawn('未命名文化')).toBe(false);

		switchLocale();

		expect(isDrawn('Highland Clans')).toBe(true);
		expect(isDrawn('Unnamed Culture')).toBe(false);
	});

	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('draws the approved zh-TW fallback for a culture with no name, in %s mode', (_label, mode) => {
		renderPanel(createTestCulture('', CultureType.Bespoke), mode);

		expect(isDrawn('未命名文化')).toBe(true);
		expect(isDrawn('Unnamed Culture')).toBe(false);

		switchLocale();

		expect(isDrawn('Unnamed Culture')).toBe(true);
		expect(isDrawn('未命名文化')).toBe(false);
	});
});

describe('CulturePanel culture content', () => {
	it('draws the description and the aspect features as written, in either locale', () => {
		renderPanel();

		const canonicalContent = [ 'Culture description.', 'Nomadic', 'Communal', 'Martial' ];
		expect(canonicalContent.filter(isDrawn)).toEqual(canonicalContent);

		switchLocale();

		expect(canonicalContent.filter(isDrawn)).toEqual(canonicalContent);
	});

	it('draws no aspect features in compact mode, in either locale', () => {
		renderPanel(createTestCulture('Highland Clans', CultureType.Regional), PanelMode.Compact);

		expect(isDrawn('Culture description.')).toBe(true);
		expect(isDrawn('Nomadic')).toBe(false);

		switchLocale();

		expect(isDrawn('Culture description.')).toBe(true);
		expect(isDrawn('Nomadic')).toBe(false);
	});
});
