// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { Feature } from '@/models/feature';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { EnvironmentData } from '@/data/culture-data';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { Options } from '@/models/options';
import { PanelMode } from '@/enums/panel-mode';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// A Markdown control that shows the text it was handed verbatim.
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

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// A real production Culture Aspect Feature, taken directly from EnvironmentData rather than
// constructed for the test, so the identity the resolver sees is the one the app actually
// renders.
const nomadic = EnvironmentData.nomadic;

const renderPanel = (feature: Feature, hero?: Hero) => render(
	<LocalizationProvider>
		<LocaleToggle />
		<FeaturePanel feature={feature} hero={hero} sourcebooks={[]} mode={PanelMode.Full} />
	</LocalizationProvider>
);

const approvedDescription = '從 Exploration 技能或 Interpersonal 技能中選擇 1 項技能。';

describe('FeaturePanel Culture Aspect localization', () => {
	it('shows the approved zh-TW name and description, and canonical English after switching locale', () => {
		const serialized = JSON.stringify(nomadic);
		const canonicalDescription = nomadic.description;

		renderPanel(nomadic);

		expect(screen.getByText('遊牧', { exact: true })).toBeTruthy();
		expect(screen.getByText(approvedDescription, { exact: true })).toBeTruthy();
		expect(screen.queryByText('Nomadic', { exact: true })).toBeNull();
		expect(screen.queryByText(canonicalDescription, { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getByText('Nomadic', { exact: true })).toBeTruthy();
		expect(screen.getByText(canonicalDescription, { exact: true })).toBeTruthy();
		expect(screen.queryByText('遊牧', { exact: true })).toBeNull();
		expect(screen.queryByText(approvedDescription, { exact: true })).toBeNull();

		// The canonical Feature object is never mutated by either reading of it.
		expect(JSON.stringify(nomadic)).toBe(serialized);
	});

	it('switches back and forth between zh-TW and English name/description without drift', () => {
		renderPanel(nomadic);

		expect(screen.getByText('遊牧', { exact: true })).toBeTruthy();
		expect(screen.getByText(approvedDescription, { exact: true })).toBeTruthy();

		switchLocale();
		expect(screen.getByText('Nomadic', { exact: true })).toBeTruthy();
		expect(screen.getByText(nomadic.description, { exact: true })).toBeTruthy();

		switchLocale();
		expect(screen.getByText('遊牧', { exact: true })).toBeTruthy();
		expect(screen.getByText(approvedDescription, { exact: true })).toBeTruthy();
	});

	it('lets a player name customization override the approved zh-TW name', () => {
		const hero = FactoryLogic.createHero();
		hero.abilityCustomizations = [ {
			abilityID: nomadic.id,
			name: 'My custom name',
			description: '',
			notes: '',
			costModifier: 0,
			distanceBonus: 0,
			damageBonus: 0,
			characteristic: null
		} ];

		renderPanel(nomadic, hero);

		expect(screen.getByText('My custom name', { exact: true })).toBeTruthy();
		expect(screen.queryByText('遊牧', { exact: true })).toBeNull();

		switchLocale();

		// A player's own text is not re-translated by a locale switch.
		expect(screen.getByText('My custom name', { exact: true })).toBeTruthy();
	});

	it('falls back to its own canonical name when a Feature has no production catalog entry', () => {
		// This ID is deliberately absent from productionLocalizationEntries. The resolver is
		// identity-scoped, so it must not borrow zh-TW from any other Feature that happens to
		// share canonical English wording.
		const noEntry = FactoryLogic.feature.create({
			id: 'feature-panel-test-missing-identity',
			name: 'Test Missing Identity Name',
			description: 'Test canonical description with no production catalog entry.'
		});

		renderPanel(noEntry);

		expect(screen.getByText('Test Missing Identity Name', { exact: true })).toBeTruthy();
	});

	it('falls back to the unnamed-feature label when the canonical name is empty', () => {
		const unnamed = FactoryLogic.feature.create({
			id: 'feature-panel-test-unnamed-fixture',
			name: '',
			description: 'Canonical description for the unnamed-feature test fixture.'
		});

		renderPanel(unnamed);

		expect(screen.getByText('未命名特性', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Unnamed Feature', { exact: true })).toBeTruthy();
	});
});
