// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AncestryPanel } from '@/components/panels/elements/ancestry-panel/ancestry-panel';
import { AncestryData } from '@/data/ancestry-data';
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

const renderPanel = (mode: PanelMode) => render(
	<LocalizationProvider>
		<LocaleToggle />
		<AncestryPanel ancestry={AncestryData.devil} sourcebooks={[]} mode={mode} />
	</LocalizationProvider>
);

const approvedName = '魔鬼';
const approvedDescription = '地獄七城的原生族裔。魔鬼是皮膚呈紅色或藍色的類人生物，色澤從鮮豔的深紅到深紫不等。每個魔鬼天生都帶有某種地獄特徵，例如犄角、尾巴、偶蹄、叉舌、尖牙或翅膀。';
const canonicalName = 'Devil';
const canonicalDescription = AncestryData.devil.description;

describe('AncestryPanel top-level localization', () => {
	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('shows the approved zh-TW name and description in %s mode, and canonical English after switching locale', (_label, mode) => {
		const serialized = JSON.stringify(AncestryData.devil);

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

		// The canonical ancestry object is never mutated by either reading of it.
		expect(JSON.stringify(AncestryData.devil)).toBe(serialized);
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
});
