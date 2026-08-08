// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { ClassPanel } from '@/components/panels/elements/class-panel/class-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { Characteristic } from '@/enums/characteristic';
import { PanelMode } from '@/enums/panel-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { HeroClass } from '@/models/class';
import { Options } from '@/models/options';
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

const createTestClass = (name: string): HeroClass => {
	const heroClass = FactoryLogic.createClass();
	heroClass.id = 'test-class';
	heroClass.name = name;
	heroClass.description = 'Class description.';
	heroClass.primaryCharacteristics = [ Characteristic.Might, Characteristic.Agility ];
	heroClass.featuresByLevel = [ 1, 3 ].map(level => ({ level: level, features: [] }));

	const featuresAt = (level: number, features: { id: string, name: string }[]) => {
		const entry = heroClass.featuresByLevel.find(item => item.level === level);
		features.forEach(feature => entry?.features.push(FactoryLogic.feature.create({ id: feature.id, name: feature.name, description: `${feature.name} description.` })));
	};

	featuresAt(1, [ { id: 'feature-1', name: 'Battle Ready' } ]);
	featuresAt(3, [ { id: 'feature-3', name: 'Veteran Instincts' } ]);

	heroClass.abilities = [
		FactoryLogic.createAbility({ id: 'signature-ability', name: 'Steel Strike', cost: 'signature', sections: [] }),
		FactoryLogic.createAbility({ id: 'costly-ability', name: 'Rallying Cry', cost: 3, sections: [] })
	];

	const subclass = FactoryLogic.createSubclass();
	subclass.id = 'test-subclass';
	subclass.name = 'Stormwright';
	subclass.description = 'Subclass description.';
	heroClass.subclasses = [ subclass ];

	return heroClass;
};

const renderPanel = (heroClass = createTestClass('Tactician'), mode = PanelMode.Full) => {
	const view = render(
		<LocalizationProvider>
			<LocaleToggle />
			<ClassPanel heroClass={heroClass} sourcebooks={[]} mode={mode} />
		</LocalizationProvider>
	);

	return { ...view, heroClass };
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const choosePage = (label: string) => fireEvent.click(screen.getByRole('radio', { name: label }));

const expectPages = (labels: string[]) => {
	expect(screen.getAllByRole('radio')).toHaveLength(labels.length);
	labels.forEach(label => expect(screen.getByRole('radio', { name: label })).toBeTruthy());
};

describe('ClassPanel localization', () => {
	it('draws the approved navigation labels in zh-TW and canonical English', () => {
		renderPanel();

		expectPages([ '概述', '特性', '招式', '子範型' ]);

		switchLocale();

		expectPages([ 'Overview', 'Features', 'Abilities', 'Subclasses' ]);
	});

	it('keeps conditional ability and subclass pages absent in both locales', () => {
		const heroClass = createTestClass('Tactician');
		heroClass.abilities = [];
		heroClass.subclasses = [];
		renderPanel(heroClass);

		expectPages([ '概述', '特性' ]);

		switchLocale();

		expectPages([ 'Overview', 'Features' ]);
	});

	it('keeps the canonical page and class data when the locale changes', () => {
		const { heroClass } = renderPanel();
		const heroClassBefore = JSON.stringify(heroClass);

		choosePage('特性');
		expect(screen.getByText('Battle Ready')).toBeTruthy();

		switchLocale();

		expect(screen.getByRole('radio', { name: 'Features', checked: true })).toBeTruthy();
		expect(screen.getByText('Battle Ready')).toBeTruthy();
		expect(screen.queryByText('Class description.')).toBeNull();
		expect(JSON.stringify(heroClass)).toBe(heroClassBefore);
	});

	it('localizes the primary-characteristics label without changing its values', () => {
		const { heroClass } = renderPanel();

		expect(screen.getByText('主要屬性')).toBeTruthy();
		expect(screen.getByText('Might, Agility')).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Primary Characteristics')).toBeTruthy();
		expect(screen.getByText('Might, Agility')).toBeTruthy();
		expect(heroClass.primaryCharacteristics).toEqual([ Characteristic.Might, Characteristic.Agility ]);
	});

	it('localizes level headings while keeping their numeric levels and feature content', () => {
		const { heroClass } = renderPanel();

		choosePage('特性');
		expect(screen.getByText('1 級')).toBeTruthy();
		expect(screen.getByText('3 級')).toBeTruthy();
		expect(screen.getByText('Battle Ready')).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Level 1')).toBeTruthy();
		expect(screen.getByText('Level 3')).toBeTruthy();
		expect(heroClass.featuresByLevel.map(item => item.level)).toEqual([ 1, 3 ]);
	});

	it('localizes ability group headings while grouping by the canonical sentinel and number', () => {
		const { heroClass } = renderPanel();

		choosePage('招式');
		expect(screen.getByText('招牌招式')).toBeTruthy();
		expect(screen.getByText('3 費招式')).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Signature Abilities')).toBeTruthy();
		expect(screen.getByText('3pt Abilities')).toBeTruthy();
		expect(heroClass.abilities.map(ability => ability.cost)).toEqual([ 'signature', 3 ]);
		expect(typeof heroClass.abilities[1].cost).toBe('number');
	});

	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('uses the approved unnamed-class fallback in %s mode', (_label, mode) => {
		renderPanel(createTestClass(''), mode);

		expect(screen.getByText('未命名範型')).toBeTruthy();
		expect(screen.queryByText('Unnamed Class')).toBeNull();

		switchLocale();

		expect(screen.getByText('Unnamed Class')).toBeTruthy();
		expect(screen.queryByText('未命名範型')).toBeNull();
	});

	it('keeps a named class canonical and preserves the nested SubclassPanel behavior', () => {
		const { heroClass } = renderPanel();

		expect(screen.getByText('Tactician')).toBeTruthy();
		switchLocale();
		expect(screen.getByText('Tactician')).toBeTruthy();
		expect(heroClass.name).toBe('Tactician');
		switchLocale();

		choosePage('子範型');
		fireEvent.click(screen.getByText('Stormwright'));

		expect(screen.getByText('Subclass description.')).toBeTruthy();
		expect(screen.getAllByTitle('概述')).toHaveLength(2);
	});
});
