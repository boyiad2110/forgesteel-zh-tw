// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { CulturePanel } from '@/components/panels/elements/culture-panel/culture-panel';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { PanelMode } from '@/enums/panel-mode';
import { core } from '@/data/sourcebooks/official/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// A Markdown control that shows the text it was handed verbatim, so these tests read the
// exact string the boundary produced rather than the HTML the markdown renderer would make.
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

// A real production Core culture, taken directly from the sourcebook rather than constructed
// for the test, so the identity the resolver sees is the one the app actually renders.
const artisanGuild = core.cultures.find(c => c.id === 'culture-artisan-guild');
if (!artisanGuild) {
	throw new Error('Fixture assumption broken: culture-artisan-guild is no longer in the core sourcebook');
}

const renderPanel = (mode: PanelMode) => render(
	<LocalizationProvider>
		<LocaleToggle />
		<CulturePanel culture={artisanGuild} sourcebooks={[]} mode={mode} />
	</LocalizationProvider>
);

const approvedName = '工匠公會';
const approvedDescription = '城市、官僚、創作。';
const canonicalName = 'Artisan Guild';
const canonicalDescription = artisanGuild.description;

describe('CulturePanel top-level localization', () => {
	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('shows the approved zh-TW name and description in %s mode, and canonical English after switching locale', (_label, mode) => {
		const serialized = JSON.stringify(artisanGuild);

		renderPanel(mode);

		expect(screen.getByText(approvedName, { exact: true })).toBeTruthy();
		expect(screen.getByText(approvedDescription, { exact: true })).toBeTruthy();
		expect(screen.queryByText(canonicalName, { exact: true })).toBeNull();
		expect(screen.queryByText(canonicalDescription, { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getByText(canonicalName, { exact: true })).toBeTruthy();
		expect(screen.getByText(canonicalDescription, { exact: true })).toBeTruthy();
		expect(screen.queryByText(approvedName, { exact: true })).toBeNull();
		expect(screen.queryByText(approvedDescription, { exact: true })).toBeNull();

		// The canonical culture object is never mutated by either reading of it.
		expect(JSON.stringify(artisanGuild)).toBe(serialized);
	});

	it('switches back and forth between zh-TW and English without drift', () => {
		renderPanel(PanelMode.Full);

		expect(screen.getByText(approvedName, { exact: true })).toBeTruthy();

		switchLocale();
		expect(screen.getByText(canonicalName, { exact: true })).toBeTruthy();

		switchLocale();
		expect(screen.getByText(approvedName, { exact: true })).toBeTruthy();
		expect(screen.getByText(approvedDescription, { exact: true })).toBeTruthy();
	});

	it('localizes the nested Environment, Organization and Upbringing names, and restores canonical English on locale switch', () => {
		// The Culture Aspect batch gave these three Features their own approved zh-TW; this
		// only re-asserts the boundary this panel's own batch already protects (that nested
		// content flows through the resolver via FeaturePanel), not that batch's own coverage.
		const nestedCanonical = [
			artisanGuild.environment?.name,
			artisanGuild.organization?.name,
			artisanGuild.upbringing?.name
		].filter((v): v is string => !!v);
		expect(nestedCanonical).toEqual([ 'Urban', 'Bureaucratic', 'Creative' ]);
		const nestedApproved = [ '城市', '官僚', '創作' ];

		renderPanel(PanelMode.Full);

		nestedApproved.forEach(text => expect(screen.getByText(text, { exact: true })).toBeTruthy());
		nestedCanonical.forEach(text => expect(screen.queryByText(text, { exact: true })).toBeNull());

		switchLocale();

		nestedCanonical.forEach(text => expect(screen.getByText(text, { exact: true })).toBeTruthy());
		nestedApproved.forEach(text => expect(screen.queryByText(text, { exact: true })).toBeNull());
	});

	it('draws no nested aspect content in compact mode, in either locale', () => {
		renderPanel(PanelMode.Compact);

		expect(screen.queryByText('Urban', { exact: true })).toBeNull();

		switchLocale();

		expect(screen.queryByText('Urban', { exact: true })).toBeNull();
	});
});
