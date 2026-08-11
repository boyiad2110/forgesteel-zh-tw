// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { CultureData, EnvironmentData, OrganizationData, UpbringingData } from '@/data/culture-data';
import { CultureSection } from '@/components/pages/heroes/hero-edit/culture-section/culture-section';
import { CultureType } from '@/enums/culture-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { Options } from '@/models/options';
import { Utils } from '@/utils/utils';
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

// useIsSmall needs matchMedia; jsdom provides neither, and it carries no localization behavior.
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

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// A real production Hero with a Bespoke Culture whose Environment, Organization and
// Upbringing are set, so the "already selected" bespoke display this batch wires up is
// actually exercised.
const buildHero = () => {
	const hero = FactoryLogic.createHero();
	const culture = Utils.copy(CultureData.bespoke);
	culture.type = CultureType.Bespoke;
	culture.environment = EnvironmentData.nomadic;
	culture.organization = OrganizationData.bureaucratic;
	culture.upbringing = UpbringingData.martial;
	hero.culture = culture;
	return hero;
};

const renderSection = () => {
	const hero = buildHero();
	const { container } = render(
		<LocalizationProvider>
			<LocaleToggle />
			<CultureSection
				hero={hero}
				sourcebooks={[]}
				searchTerm=''
				selectCulture={vi.fn()}
				selectEnvironment={vi.fn()}
				selectOrganization={vi.fn()}
				selectUpbringing={vi.fn()}
				setFeatureData={vi.fn()}
			/>
		</LocalizationProvider>
	);
	return container;
};

// The Field label/value for the "already selected" bespoke Environment/Organization/
// Upbringing summary are the only text carrying these classes in this tree, so they can be
// read without ambiguity even though the same Feature's name/description is also shown
// elsewhere (its own FeatureConfigPanel choice card, covered by a separate test).
const getBespokeAspectLabels = (container: HTMLElement) => Array.from(container.querySelectorAll('.field-label')).map(node => node.textContent);
const getBespokeAspectDescriptions = (container: HTMLElement) => Array.from(container.querySelectorAll('.field-value')).map(node => node.textContent);

const approvedDescriptions = [
	'從 Exploration 技能或 Interpersonal 技能中選擇 1 項技能。',
	'從 Interpersonal 技能或 Intrigue 技能中選擇 1 項技能。',
	'從 Blacksmithing、Fletching、Climb、Endurance、Ride、Intimidate、Alertness、Track、Monsters 或 Strategy 中選擇 1 項技能。'
];
const canonicalDescriptions = [
	EnvironmentData.nomadic.description,
	OrganizationData.bureaucratic.description,
	UpbringingData.martial.description
];

describe('CultureSection bespoke aspect localization', () => {
	it('shows the approved zh-TW names and descriptions for the selected Environment, Organization and Upbringing', () => {
		const container = renderSection();

		expect(getBespokeAspectLabels(container)).toEqual([ '遊牧', '官僚', '尚武' ]);
		expect(getBespokeAspectDescriptions(container)).toEqual(approvedDescriptions);
	});

	it('shows canonical English names and descriptions after switching locale, then restores zh-TW without drift', () => {
		const container = renderSection();

		switchLocale();
		expect(getBespokeAspectLabels(container)).toEqual([ 'Nomadic', 'Bureaucratic', 'Martial' ]);
		expect(getBespokeAspectDescriptions(container)).toEqual(canonicalDescriptions);

		switchLocale();
		expect(getBespokeAspectLabels(container)).toEqual([ '遊牧', '官僚', '尚武' ]);
		expect(getBespokeAspectDescriptions(container)).toEqual(approvedDescriptions);
	});

	it('never mutates the canonical Culture Aspect Features by rendering or switching locale', () => {
		const serializedEnv = JSON.stringify(EnvironmentData.nomadic);
		const serializedOrg = JSON.stringify(OrganizationData.bureaucratic);
		const serializedUp = JSON.stringify(UpbringingData.martial);

		renderSection();
		switchLocale();
		switchLocale();

		expect(JSON.stringify(EnvironmentData.nomadic)).toBe(serializedEnv);
		expect(JSON.stringify(OrganizationData.bureaucratic)).toBe(serializedOrg);
		expect(JSON.stringify(UpbringingData.martial)).toBe(serializedUp);
	});
});
