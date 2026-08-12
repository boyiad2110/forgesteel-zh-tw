// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { Feature } from '@/models/feature';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { CareerData } from '@/data/career-data';
import { FactoryLogic } from '@/logic/factory-logic';
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

// Real production Career Feature Elements, taken directly from CareerData rather than
// constructed for the test, so the identity the resolver sees is the one the app actually
// renders. career-agent-feature-2 is a category SkillChoice, career-agent-feature-4 is a
// count-2 LanguageChoice (whose canonical description carries the live factory double
// space), and career-agent-feature-5 is a Perk with no description.
const agent = CareerData.agent;
const interpersonalSkill = agent.features.find(f => f.id === 'career-agent-feature-2') as Feature;
const languages = agent.features.find(f => f.id === 'career-agent-feature-4') as Feature;
const intriguePerk = agent.features.find(f => f.id === 'career-agent-feature-5') as Feature;

const renderPanel = (feature: Feature) => render(
	<LocalizationProvider>
		<LocaleToggle />
		<FeaturePanel feature={feature} sourcebooks={[]} mode={PanelMode.Full} />
	</LocalizationProvider>
);

describe('FeaturePanel Career Feature localization', () => {
	it('shows the approved zh-TW name and description for a category SkillChoice Feature, and canonical English after switching locale', () => {
		const serialized = JSON.stringify(interpersonalSkill);
		const canonicalName = interpersonalSkill.name;
		const canonicalDescription = interpersonalSkill.description;

		renderPanel(interpersonalSkill);

		expect(screen.getByText('交涉類技能', { exact: true })).toBeTruthy();
		expect(screen.getByText('從交涉類技能中選擇 1 項技能。', { exact: true })).toBeTruthy();
		expect(screen.queryByText(canonicalName, { exact: true })).toBeNull();
		expect(screen.queryByText(canonicalDescription, { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getByText('Interpersonal Skill', { exact: true })).toBeTruthy();
		expect(screen.getByText('Choose a skill from Interpersonal skills.', { exact: true })).toBeTruthy();
		expect(screen.queryByText('交涉類技能', { exact: true })).toBeNull();

		// The canonical Feature object is never mutated by either reading of it.
		expect(JSON.stringify(interpersonalSkill)).toBe(serialized);
	});

	it('shows the count-2 Language wording, and falls back to the canonical double-spaced English on switch without altering the canonical Feature', () => {
		expect(languages.description).toBe('Choose 2  languages.');
		const serialized = JSON.stringify(languages);

		renderPanel(languages);

		expect(screen.getByText('語言', { exact: true })).toBeTruthy();
		expect(screen.getByText('選擇 2 種語言。', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Languages', { exact: true })).toBeTruthy();
		// The default text-matcher normalizer collapses the canonical double space, so the
		// raw DOM text is checked directly to confirm the double space itself survives.
		expect(screen.getByText(/^Choose 2\s+languages\.$/).textContent).toBe('Choose 2  languages.');

		expect(JSON.stringify(languages)).toBe(serialized);
	});

	it('shows the approved zh-TW name for a Perk Feature with no canonical description', () => {
		expect(intriguePerk.description).toBe('');

		renderPanel(intriguePerk);

		expect(screen.getByText('隱密類專長', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Intrigue Perk', { exact: true })).toBeTruthy();
	});
});
