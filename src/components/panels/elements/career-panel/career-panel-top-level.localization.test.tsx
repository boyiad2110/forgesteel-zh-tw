// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { CareerPanel } from '@/components/panels/elements/career-panel/career-panel';
import { CareerData } from '@/data/career-data';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { PanelMode } from '@/enums/panel-mode';
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

// A real production Career, taken directly from CareerData rather than constructed for the
// test, so the identity the resolver sees is the one the app actually renders.
const agent = CareerData.agent;

const renderPanel = (mode: PanelMode) => render(
	<LocalizationProvider>
		<LocaleToggle />
		<CareerPanel career={agent} sourcebooks={[]} mode={mode} />
	</LocalizationProvider>
);

const approvedName = '特務';
const approvedDescription = '你曾替政府或組織從事間諜工作。';
const canonicalName = 'Agent';
const canonicalDescription = agent.description;

describe('CareerPanel top-level localization', () => {
	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('shows the approved zh-TW name and description in %s mode, and canonical English after switching locale', (_label, mode) => {
		const serialized = JSON.stringify(agent);

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

		// The canonical career object is never mutated by either reading of it.
		expect(JSON.stringify(agent)).toBe(serialized);
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

	it('leaves the Inciting Incidents in canonical English, in either locale', () => {
		// This batch only localizes the career's own name and description; nested Inciting
		// Incidents (and Career Features) are a separate, later batch even though this batch's
		// approved page labels already read in zh-TW.
		renderPanel(PanelMode.Full);
		const firstIncident = agent.incitingIncidents.options[0];

		fireEvent.click(screen.getByTitle('關鍵事件'));
		expect(screen.getByText(firstIncident.name, { exact: true })).toBeTruthy();
		expect(screen.getByText(firstIncident.description, { exact: true })).toBeTruthy();

		switchLocale();

		fireEvent.click(screen.getByTitle('Inciting Incidents'));
		expect(screen.getByText(firstIncident.name, { exact: true })).toBeTruthy();
		expect(screen.getByText(firstIncident.description, { exact: true })).toBeTruthy();
	});
});
