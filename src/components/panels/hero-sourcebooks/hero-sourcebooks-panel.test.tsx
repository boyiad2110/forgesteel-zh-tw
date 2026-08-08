// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { HeroSourcebooksPanel } from '@/components/panels/hero-sourcebooks/hero-sourcebooks-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { SourcebookType } from '@/enums/sourcebook-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { Sourcebook } from '@/models/sourcebook';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { notificationError } = vi.hoisted(() => ({ notificationError: vi.fn() }));

vi.mock('antd', async () => {
	const actual = await vi.importActual<typeof import('antd')>('antd');
	return { ...actual, notification: { ...actual.notification, error: notificationError } };
});
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
const testDataManager = { saveOptions: vi.fn().mockResolvedValue(undefined) };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => testDataManager,
	useOptions: () => testOptions
}));

beforeEach(() => notificationError.mockClear());
afterEach(cleanup);

// The panel only lists sourcebooks that actually contain elements.
const createSourcebook = (id: string, type: SourcebookType, name = id): Sourcebook => {
	const sourcebook = FactoryLogic.createSourcebook();
	sourcebook.id = id;
	sourcebook.name = name;
	sourcebook.type = type;
	sourcebook.titles.push({ id: `${id}-title`, name: `${id} title`, description: '', echelon: 1, prerequisites: '', features: [], selectedFeatureID: '' });
	return sourcebook;
};

const renderPanel = (onImportSourcebook = vi.fn(), onChange = vi.fn()) => {
	const sourcebooks = [
		createSourcebook('core', SourcebookType.Official),
		createSourcebook('my-homebrew', SourcebookType.Homebrew),
		createSourcebook('community', SourcebookType.Community),
		createSourcebook('weapons-of-legend', SourcebookType.ThirdParty)
	];

	const { container } = render(
		<LocalizationProvider>
			<LocaleToggle />
			<HeroSourcebooksPanel
				sourcebooks={sourcebooks}
				sourcebookIDs={[ 'core', 'community' ]}
				onImportSourcebook={onImportSourcebook}
				onChange={onChange}
			/>
		</LocalizationProvider>
	);

	return { container, sourcebooks, onImportSourcebook, onChange };
};

const uploadSourcebook = (sourcebook: unknown) => {
	const input = document.querySelector('input[type="file"]') as HTMLInputElement;
	expect(input).not.toBeNull();
	const file = new File([ JSON.stringify(sourcebook) ], 'test.drawsteel-sourcebook', { type: 'application/json' });
	fireEvent.change(input, { target: { files: [ file ] } });
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const isDrawn = (text: string) => screen.queryAllByText(text).length > 0;

// A sourcebook is toggled by its row, whatever that row is labelled.
const toggleSourcebook = (name: string) => {
	const row = screen.getByText(name, { exact: true }).closest('.toggle');
	expect(row).not.toBeNull();
	fireEvent.click(row as Element);
};

describe('HeroSourcebooksPanel sourcebook type policy', () => {
	it('shows only the official and homebrew sections, in either locale', () => {
		renderPanel();

		expect(isDrawn('官方資料來源')).toBe(true);
		expect(isDrawn('自製資料來源')).toBe(true);
		expect(isDrawn('core')).toBe(true);
		expect(isDrawn('community')).toBe(false);
		expect(isDrawn('weapons-of-legend')).toBe(false);

		switchLocale();

		expect(screen.getByText('Official Sourcebooks', { exact: true })).not.toBeNull();
		expect(screen.getByText('Homebrew Sourcebooks', { exact: true })).not.toBeNull();
		expect(screen.queryByText('Community Sourcebooks', { exact: true })).toBeNull();
		expect(screen.queryByText('Third Party Sourcebooks', { exact: true })).toBeNull();
		expect(isDrawn('core')).toBe(true);
		expect(isDrawn('community')).toBe(false);
		expect(isDrawn('weapons-of-legend')).toBe(false);
	});

	it('imports a homebrew sourcebook', async () => {
		const { onImportSourcebook } = renderPanel();

		uploadSourcebook(createSourcebook('imported-homebrew', SourcebookType.Homebrew));

		await waitFor(() => expect(onImportSourcebook).toHaveBeenCalledTimes(1));
		expect(notificationError).not.toHaveBeenCalled();
	});

	it.each([
		[ 'community', SourcebookType.Community ],
		[ 'third party', SourcebookType.ThirdParty ]
	])('does not persist an imported %s sourcebook', async (_label, type) => {
		const { onImportSourcebook } = renderPanel();

		uploadSourcebook(createSourcebook('imported-excluded', type));

		await waitFor(() => expect(notificationError).toHaveBeenCalledTimes(1));
		expect(onImportSourcebook).not.toHaveBeenCalled();
	});

	it('leaves the hero sourcebookIDs alone when nothing is toggled', () => {
		const { onChange } = renderPanel();

		expect(onChange).not.toHaveBeenCalled();

		switchLocale();

		expect(onChange).not.toHaveBeenCalled();
	});
});

describe('HeroSourcebooksPanel localization', () => {
	const approved = [ '資料來源', '這名英雄可以使用下列資料來源的內容：', '官方資料來源', '自製資料來源', '如果你想使用的自製資料來源沒有列在這裡，可以現在匯入。' ];
	const canonical = [ 'Sourcebooks', 'This hero can use content from the following sourcebooks:', 'Official Sourcebooks', 'Homebrew Sourcebooks', 'If you have a homebrew sourcebook you want to use, and it isn\'t listed here, you can import it now.' ];

	it('draws the approved zh-TW copy, and canonical English in the English locale', () => {
		renderPanel();

		expect(approved.filter(isDrawn)).toEqual(approved);
		expect(canonical.filter(isDrawn)).toEqual([]);
		expect(screen.getByTitle('匯入資料來源')).toBeTruthy();

		switchLocale();

		expect(canonical.filter(isDrawn)).toEqual(canonical);
		expect(approved.filter(isDrawn)).toEqual([]);
		expect(screen.getByTitle('Import a sourcebook')).toBeTruthy();
	});

	it('draws the approved zh-TW fallback for a sourcebook with no name, and leaves named sourcebooks as they are', () => {
		render(
			<LocalizationProvider>
				<LocaleToggle />
				<HeroSourcebooksPanel
					sourcebooks={[ createSourcebook('nameless', SourcebookType.Homebrew, ''), createSourcebook('my-homebrew', SourcebookType.Homebrew) ]}
					sourcebookIDs={[]}
					onImportSourcebook={vi.fn()}
					onChange={vi.fn()}
				/>
			</LocalizationProvider>
		);

		expect(isDrawn('未命名的資料來源')).toBe(true);
		expect(isDrawn('Unnamed Sourcebook')).toBe(false);
		// Homebrew content is the player's own; it is shown as written, in either locale.
		expect(isDrawn('my-homebrew')).toBe(true);

		switchLocale();

		expect(isDrawn('Unnamed Sourcebook')).toBe(true);
		expect(isDrawn('未命名的資料來源')).toBe(false);
		expect(isDrawn('my-homebrew')).toBe(true);
	});

	it('reports a rejected import in the approved zh-TW wording, naming the canonical sourcebook type', async () => {
		const { onImportSourcebook } = renderPanel();

		uploadSourcebook(createSourcebook('imported-excluded', SourcebookType.Community));

		await waitFor(() => expect(notificationError).toHaveBeenCalledTimes(1));
		expect(notificationError.mock.calls[0][0]).toMatchObject({
			title: '無法匯入資料來源',
			description: '此版本不支援 Community 類型的資料來源。'
		});
		expect(onImportSourcebook).not.toHaveBeenCalled();
	});

	it('reports a rejected import in canonical English in the English locale', async () => {
		const { onImportSourcebook } = renderPanel();

		switchLocale();
		uploadSourcebook(createSourcebook('imported-excluded', SourcebookType.ThirdParty));

		await waitFor(() => expect(notificationError).toHaveBeenCalledTimes(1));
		expect(notificationError.mock.calls[0][0]).toMatchObject({
			title: 'Sourcebook not imported',
			description: 'Third Party sourcebooks are not available in this edition.'
		});
		expect(onImportSourcebook).not.toHaveBeenCalled();
	});
});

describe('HeroSourcebooksPanel canonical selection', () => {
	it('reports the canonical sourcebook ID when a localized row is toggled on', () => {
		const { onChange } = renderPanel();

		toggleSourcebook('my-homebrew');

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith([ 'core', 'community', 'my-homebrew' ]);
	});

	it('reports the canonical sourcebook ID when a localized row is toggled off', () => {
		const { onChange } = renderPanel();

		toggleSourcebook('core');

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith([ 'community' ]);
	});

	it('keeps the selection and the sourcebooks canonical across a locale switch', () => {
		const { sourcebooks, onChange } = renderPanel();
		const sourcebooksBefore = JSON.stringify(sourcebooks);

		toggleSourcebook('my-homebrew');
		switchLocale();
		toggleSourcebook('core');

		expect(onChange.mock.calls).toEqual([ [ [ 'core', 'community', 'my-homebrew' ] ], [ [ 'community', 'my-homebrew' ] ] ]);
		// Presentation only: no zh-TW reaches a sourcebook ID, and the sourcebooks the panel
		// was handed are untouched.
		expect(onChange.mock.calls.flat(2).join()).not.toMatch(/[一-鿿]/);
		expect(JSON.stringify(sourcebooks)).toBe(sourcebooksBefore);
	});
});
