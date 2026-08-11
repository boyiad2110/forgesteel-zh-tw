// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { Complication } from '@/models/complication';
import { ComplicationData } from '@/data/complication-data';
import { ComplicationPanel } from '@/components/panels/elements/complication-panel/complication-panel';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { PanelMode } from '@/enums/panel-mode';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDefaultNormalizer } from '@testing-library/dom';

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

// The mocked Markdown control renders its text verbatim in a single text node, including the
// approved description's real line break. The default text-match normalizer collapses that
// break into a space, which would hide whether it survived the render boundary intact, so
// these description assertions turn collapsing off and compare the exact string.
const exactMultiline = { exact: true, normalizer: getDefaultNormalizer({ collapseWhitespace: false, trim: false }) };

// A real production Complication, taken directly from ComplicationData rather than
// constructed for the test, so the identity the resolver sees is the one the app actually
// renders. It also carries a paragraph break in its approved description and a nested
// Feature, which double up for the multi-line and nested-content assertions below.
const gnollMauled = ComplicationData.gnollMauled;

const renderPanel = (complication: Complication, mode: PanelMode) => render(
	<LocalizationProvider>
		<LocaleToggle />
		<ComplicationPanel complication={complication} sourcebooks={[]} mode={mode} />
	</LocalizationProvider>
);

const approvedName = '遭鬣狗人重創';
const approvedDescription = '你小時候曾被鬣狗人襲擊。儘管你倖存下來，但你全身滿是齒痕的傷疤，甚至偶爾會陷入嗜血的衝動。\n若你不會陷入暈眩，你不能選擇這項糾葛。';
const canonicalName = 'Gnoll-Mauled';
const canonicalDescription = gnollMauled.description;

describe('ComplicationPanel top-level localization', () => {
	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('shows the approved zh-TW name and description in %s mode, and canonical English after switching locale', (_label, mode) => {
		const serialized = JSON.stringify(gnollMauled);

		renderPanel(gnollMauled, mode);

		expect(screen.getByText(approvedName, { exact: true })).toBeTruthy();
		expect(screen.getByText(approvedDescription, exactMultiline)).toBeTruthy();
		expect(screen.queryByText(canonicalName, { exact: true })).toBeNull();
		expect(screen.queryByText(canonicalDescription, exactMultiline)).toBeNull();

		switchLocale();

		expect(screen.getByText(canonicalName, { exact: true })).toBeTruthy();
		expect(screen.getByText(canonicalDescription, exactMultiline)).toBeTruthy();
		expect(screen.queryByText(approvedName, { exact: true })).toBeNull();
		expect(screen.queryByText(approvedDescription, exactMultiline)).toBeNull();

		// The canonical complication object is never mutated by either reading of it.
		expect(JSON.stringify(gnollMauled)).toBe(serialized);
	});

	it('switches back and forth between zh-TW and English without drift', () => {
		renderPanel(gnollMauled, PanelMode.Full);

		expect(screen.getByText(approvedName, { exact: true })).toBeTruthy();

		switchLocale();
		expect(screen.getByText(canonicalName, { exact: true })).toBeTruthy();

		switchLocale();
		expect(screen.getByText(approvedName, { exact: true })).toBeTruthy();
		expect(screen.getByText(approvedDescription, exactMultiline)).toBeTruthy();
	});

	it('leaves the nested Feature Benefit and Drawback in canonical English, in either locale', () => {
		// This batch only localizes the complication's own name and description; nested
		// Features (and their Benefit/Drawback text) are a separate, later batch.
		renderPanel(gnollMauled, PanelMode.Full);
		const [ benefit, drawback ] = gnollMauled.features;

		expect(screen.getByText(benefit.name, { exact: true })).toBeTruthy();
		expect(screen.getByText(benefit.description, { exact: true })).toBeTruthy();
		expect(screen.getByText(drawback.name, { exact: true })).toBeTruthy();
		expect(screen.getByText(drawback.description, { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText(benefit.name, { exact: true })).toBeTruthy();
		expect(screen.getByText(benefit.description, { exact: true })).toBeTruthy();
		expect(screen.getByText(drawback.name, { exact: true })).toBeTruthy();
		expect(screen.getByText(drawback.description, { exact: true })).toBeTruthy();
	});

	it('does not swallow the paragraph break in a multi-line approved description', () => {
		// comp-gnollMauled's approved description carries a line break between its two
		// sentences; the exact approved text (break included) must reach the render boundary.
		renderPanel(gnollMauled, PanelMode.Full);

		const node = screen.getByText(approvedDescription, exactMultiline);
		expect(node.textContent).toBe(approvedDescription);
		expect(node.textContent).toContain('\n');
	});

	it('falls back to the unnamed-complication label when the canonical name is empty', () => {
		const unnamed: Complication = {
			id: 'comp-test-unnamed-fixture',
			name: '',
			description: 'Canonical description for the unnamed-complication test fixture.',
			features: []
		};

		renderPanel(unnamed, PanelMode.Full);

		expect(screen.getByText('未命名糾葛', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Unnamed Complication', { exact: true })).toBeTruthy();
	});

	it('falls back to its own canonical text when a complication has no production catalog entry', () => {
		// This ID is deliberately absent from productionLocalizationEntries. The resolver is
		// identity-scoped, so it must not borrow zh-TW from any other complication that
		// happens to share canonical English wording.
		const noEntry: Complication = {
			id: 'comp-test-missing-identity',
			name: 'Test Missing Identity Name',
			description: 'Test canonical description with no production catalog entry.',
			features: []
		};

		renderPanel(noEntry, PanelMode.Full);

		expect(screen.getByText('Test Missing Identity Name', { exact: true })).toBeTruthy();
		expect(screen.getByText('Test canonical description with no production catalog entry.', { exact: true })).toBeTruthy();
	});
});
