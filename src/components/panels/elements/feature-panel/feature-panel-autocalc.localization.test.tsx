// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { LocalizationProvider } from '@/contexts/localization-context';
import { Options } from '@/models/options';
import { PanelMode } from '@/enums/panel-mode';
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
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const canonicalDescription = 'You gain 1 + your Might score temporary Stamina.';

const makeHero = (): Hero => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(2, 0, 0, 0, 0);
	return hero;
};

const makeFeature = () => FactoryLogic.feature.create({
	id: 'feature-panel-autocalc-regression',
	name: 'Auto-calc Regression',
	description: canonicalDescription
});

const renderPanel = (hero: Hero) => render(
	<LocalizationProvider>
		<FeaturePanel feature={makeFeature()} hero={hero} sourcebooks={[]} mode={PanelMode.Full} />
	</LocalizationProvider>
);

afterEach(cleanup);

describe('FeaturePanel auto-calc localization boundary', () => {
	it('keeps genuine canonical Text calculations enabled and returns to raw text when disabled', () => {
		renderPanel(makeHero());

		expect(screen.getByText('You gain 3 temporary Stamina.', { exact: true })).toBeTruthy();
		fireEvent.click(screen.getByTitle('Auto-calculate damage, potency, etc'));
		expect(screen.getByText(canonicalDescription, { exact: true })).toBeTruthy();
	});

	it('continues to calculate player-authored English text without routing it through localization', () => {
		const hero = makeHero();
		hero.abilityCustomizations = [ {
			abilityID: 'feature-panel-autocalc-regression',
			name: '',
			description: 'Player authored 1 + your Might score temporary Stamina.',
			notes: '',
			costModifier: 0,
			distanceBonus: 0,
			damageBonus: 0,
			characteristic: null
		} ];

		renderPanel(hero);

		expect(screen.getByText('Player authored 3 temporary Stamina.', { exact: true })).toBeTruthy();
		fireEvent.click(screen.getByTitle('Auto-calculate damage, potency, etc'));
		expect(screen.getByText('Player authored 1 + your Might score temporary Stamina.', { exact: true })).toBeTruthy();
	});
});
