// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { HeroViewPage } from '@/components/pages/heroes/hero-view/hero-view-page';
import { FooterParams } from '@/components/panels/app-footer/app-footer';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
const loadedHeroes = vi.hoisted(() => ({ current: [] as Hero[] }));
vi.mock('@/contexts/data-context', () => ({
	useHeroes: () => loadedHeroes.current,
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions
}));

const viewport = vi.hoisted(() => ({ isSmall: false }));
vi.mock('@/hooks/use-is-small', () => ({ useIsSmall: () => viewport.isSmall }));

const navigation = vi.hoisted(() => ({ goToHeroEdit: vi.fn(), goToHeroList: vi.fn() }));
vi.mock('@/hooks/use-navigation', () => ({ useNavigation: () => navigation }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/panels/app-footer/app-footer', () => ({ AppFooter: () => <footer><LocaleToggle /></footer> }));
// The hero's own game content is other batches' surface. Each view is reduced to a marker so
// this suite sees the management shell and can still tell which view is showing.
vi.mock('@/components/panels/hero/hero-panel', () => ({ HeroPanel: () => <div>MODERN VIEW</div> }));
vi.mock('@/components/pages/heroes/hero-sheet/hero-sheet-page', () => ({ HeroSheetPage: () => <div>CLASSIC VIEW</div> }));
vi.mock('@/components/pages/heroes/hero-sheet/standard-abilities-page', () => ({ StandardAbilitiesPage: () => <div>ABILITIES VIEW</div> }));
vi.mock('@/components/panels/hero/name/name-panel', () => ({ NamePanel: () => null }));

// jsdom has no ResizeObserver, which antd's popups need before they will draw.
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const footerParams = {} as unknown as FooterParams;

const testHero: Hero = { ...FactoryLogic.createHero(), id: 'hero-1', name: 'Seren of the Ash', folder: 'Campaign Folder' };

const callbacks = () => ({
	exportHeroData: vi.fn(),
	exportHeroImage: vi.fn(),
	exportHeroPdf: vi.fn(),
	exportStandardAbilities: vi.fn(),
	copyHero: vi.fn(),
	deleteHero: vi.fn()
});

const renderView = (handlers: ReturnType<typeof callbacks>, heroID = 'hero-1') => {
	const noop = vi.fn();

	return render(
		<MemoryRouter initialEntries={[ `/hero/${heroID}` ]}>
			<LocalizationProvider>
				<Routes>
					<Route
						path='/hero/:heroID'
						element={
							<HeroViewPage
								sourcebooks={[]}
								params={footerParams}
								exportHeroData={handlers.exportHeroData}
								exportHeroImage={handlers.exportHeroImage}
								exportHeroPdf={handlers.exportHeroPdf}
								exportStandardAbilities={handlers.exportStandardAbilities}
								copyHero={handlers.copyHero}
								deleteHero={handlers.deleteHero}
								showAncestry={noop}
								showCulture={noop}
								showCareer={noop}
								showClass={noop}
								showComplication={noop}
								showDomain={noop}
								showKit={noop}
								showTitle={noop}
								showMonster={noop}
								showFollower={noop}
								showFixture={noop}
								showCharacteristic={noop}
								showFeature={noop}
								showAbility={noop}
								showHeroState={noop}
								showHeroReference={noop}
								setNotes={noop}
								onAddSquad={noop}
								onRemoveSquad={noop}
								onAddMonsterToSquad={noop}
								onSelectControlledMonster={noop}
								onSelectControlledSquad={noop}
							/>
						}
					/>
				</Routes>
			</LocalizationProvider>
		</MemoryRouter>
	);
};

// Buttons carry an icon whose accessible name sits alongside the label, so they are found by
// the words a player actually reads on them. antd sets a two-character Chinese label apart
// itself, which is its own styling rather than part of the reading, so both sides are
// compared with the spacing taken out. Everything that is not a button label - the alerts,
// the header and the page title - is asserted exactly as it reads.
const withoutSpacing = (text: string) => text.replace(/\s+/g, '');

const getButtons = (label: string) => screen.getAllByRole('button').filter(button => withoutSpacing(button.textContent ?? '') === withoutSpacing(label));

const getButton = (label: string) => {
	const matches = getButtons(label);
	expect(matches.length).toBe(1);
	return matches[0];
};

const getHeaderText = () => document.querySelector('.logo-panel-text')!.textContent;

// These two helpers are used from both locales, so they reach for whichever reading is showing.
const clickEither = (zhTW: string, english: string) => {
	const matches = getButtons(zhTW).concat(getButtons(english));
	expect(matches.length).toBe(1);
	fireEvent.click(matches[0]);
};

const openExportMenu = () => clickEither('匯出', 'Export');

// The classic view is reached through the export menu's own shortcut.
const switchToClassicView = () => {
	openExportMenu();
	clickEither('經典', 'Classic');
};

beforeEach(() => {
	loadedHeroes.current = [ testHero ];
	viewport.isSmall = false;
	navigation.goToHeroEdit.mockClear();
	navigation.goToHeroList.mockClear();
});

describe('HeroViewPage localization', () => {
	it('reads the header actions and restores the canonical English', () => {
		renderView(callbacks());

		[ '編輯', '複製', '匯出', '刪除', '關閉' ].forEach(label => expect(getButton(label)).toBeTruthy());
		expect(getHeaderText()).toBe('英雄');
		// The hero's own name is what the player typed, in either locale.
		expect(document.title).toBe('Forge Steel - Seren of the Ash');

		switchLocale();

		[ 'Edit', 'Copy', 'Export', 'Delete', 'Close' ].forEach(label => expect(getButton(label)).toBeTruthy());
		expect(getHeaderText()).toBe('Hero');
		expect(document.title).toBe('Forge Steel - Seren of the Ash');
	});

	it('reads the unnamed fallback without renaming the hero', () => {
		loadedHeroes.current = [ { ...testHero, name: '' } ];

		renderView(callbacks());

		expect(document.title).toBe('Forge Steel - 未命名英雄');

		switchLocale();

		expect(document.title).toBe('Forge Steel - Unnamed Hero');
		expect(loadedHeroes.current[0].name).toBe('');
	});

	it('reads the missing hero warning and its header', () => {
		loadedHeroes.current = [];

		renderView(callbacks(), 'no-such-hero');

		expect(screen.getByText('找不到英雄。這名英雄可能已被刪除，或此連結指向僅存於其他裝置上的英雄。', { exact: true })).toBeTruthy();
		expect(getHeaderText()).toBe('英雄');

		switchLocale();

		expect(screen.getByText('This hero could not be found. It may have been deleted, or the link points to a hero that only exists on another device.', { exact: true })).toBeTruthy();
		expect(getHeaderText()).toBe('Hero');
	});

	it('reads the export menu, including the classic-view prompt', () => {
		renderView(callbacks());
		openExportMenu();

		expect(screen.getByText('若要將英雄匯出為 PDF，請切換至經典檢視。', { exact: true })).toBeTruthy();
		expect(getButton('經典')).toBeTruthy();
		expect(getButton('匯出資料')).toBeTruthy();

		switchLocale();

		expect(screen.getByText('If you want to export your hero as a PDF, switch to Classic view.', { exact: true })).toBeTruthy();
		expect(getButton('Classic')).toBeTruthy();
		expect(getButton('Export as Data')).toBeTruthy();
	});

	it('reads the two PDF actions once the classic view is showing', () => {
		renderView(callbacks());
		switchToClassicView();

		expect(screen.getByText('CLASSIC VIEW', { exact: true })).toBeTruthy();

		// The menu stays open across the view change; it now offers the two PDF exports.
		expect(getButton('匯出為 PDF')).toBeTruthy();
		expect(getButton('匯出為 PDF（高解析度）')).toBeTruthy();

		switchLocale();

		expect(getButton('Export as PDF')).toBeTruthy();
		expect(getButton('Export as PDF (high res)')).toBeTruthy();
		// A locale switch is not a view change.
		expect(screen.getByText('CLASSIC VIEW', { exact: true })).toBeTruthy();
	});
});

describe('HeroViewPage management callbacks', () => {
	it('hands the unchanged hero to copy, delete and data export', () => {
		const handlers = callbacks();
		const serialized = JSON.stringify(testHero);

		renderView(handlers);

		fireEvent.click(getButton('複製'));
		openExportMenu();
		fireEvent.click(getButton('匯出資料'));

		// The danger control confirms before it acts, exactly as it did before.
		fireEvent.click(getButton('刪除'));
		const confirmations = getButtons('刪除');
		expect(confirmations.length).toBe(2);
		fireEvent.click(confirmations[confirmations.length - 1]);

		expect(handlers.copyHero).toHaveBeenCalledTimes(1);
		expect(handlers.copyHero).toHaveBeenCalledWith(testHero);
		expect(handlers.exportHeroData).toHaveBeenCalledWith(testHero);
		expect(handlers.deleteHero).toHaveBeenCalledWith(testHero);
		[ handlers.copyHero, handlers.exportHeroData, handlers.deleteHero ].forEach(handler => {
			expect(handler.mock.calls[0][0].id).toBe('hero-1');
			expect(handler.mock.calls[0][0].name).toBe('Seren of the Ash');
		});
		// Nothing the shell did altered the hero it was showing.
		expect(JSON.stringify(testHero)).toBe(serialized);
	});

	it('passes the canonical export resolutions from the localized PDF actions', () => {
		const handlers = callbacks();

		renderView(handlers);
		switchToClassicView();

		fireEvent.click(getButton('匯出為 PDF'));
		fireEvent.click(getButton('匯出為 PDF（高解析度）'));

		expect(handlers.exportHeroPdf.mock.calls.map(call => call[1])).toEqual([ 'standard', 'high' ]);
		handlers.exportHeroPdf.mock.calls.forEach(call => expect(call[0]).toBe(testHero));

		switchLocale();

		fireEvent.click(getButton('Export as PDF'));
		fireEvent.click(getButton('Export as PDF (high res)'));

		expect(handlers.exportHeroPdf.mock.calls.map(call => call[1])).toEqual([ 'standard', 'high', 'standard', 'high' ]);
	});

	it('navigates with the canonical section and folder', () => {
		renderView(callbacks());

		fireEvent.click(getButton('編輯'));
		fireEvent.click(getButton('關閉'));

		expect(navigation.goToHeroEdit).toHaveBeenCalledWith('hero-1', 'details');
		expect(navigation.goToHeroList).toHaveBeenCalledWith('Campaign Folder');
	});

	it('changes the view to the canonical mode from the localized classic action', () => {
		renderView(callbacks());

		expect(screen.getByText('MODERN VIEW', { exact: true })).toBeTruthy();

		switchToClassicView();

		expect(screen.getByText('CLASSIC VIEW', { exact: true })).toBeTruthy();
		expect(screen.queryByText('MODERN VIEW', { exact: true })).toBeNull();
	});

	it('invokes no management action, and changes no view, when only the locale changes', () => {
		const handlers = callbacks();
		const serialized = JSON.stringify(testHero);

		renderView(handlers);
		switchToClassicView();

		switchLocale();
		switchLocale();

		expect(screen.getByText('CLASSIC VIEW', { exact: true })).toBeTruthy();
		Object.values(handlers).forEach(handler => expect(handler).not.toHaveBeenCalled());
		expect(navigation.goToHeroEdit).not.toHaveBeenCalled();
		expect(navigation.goToHeroList).not.toHaveBeenCalled();
		expect(JSON.stringify(testHero)).toBe(serialized);
	});
});

// On a small screen the header actions drop their labels and show only their icons. The
// delete control is the one that still has to read: it names itself through its title, and
// through the action inside the confirmation it opens. The real DangerButton is used here,
// since it is where the reading is resolved.
describe('HeroViewPage small-screen delete control', () => {
	beforeEach(() => {
		viewport.isSmall = true;
	});

	const getDeleteControl = (title: string) => screen.getByTitle(title);

	it('reads its title, stays icon-only, and restores the canonical English', () => {
		renderView(callbacks());

		const control = getDeleteControl('刪除');
		// Icon-only: the control names itself through its title, not through visible text.
		expect(control.textContent).toBe('');
		// The other header actions carry no label on a small screen, so the reading here is
		// not a label that has crept back in.
		expect(getButtons('刪除').length).toBe(0);
		expect(screen.queryByTitle('Delete')).toBeNull();

		switchLocale();

		const englishControl = getDeleteControl('Delete');
		expect(englishControl.textContent).toBe('');
		expect(screen.queryByTitle('刪除')).toBeNull();
	});

	it('reads the confirmation action and still deletes the unchanged hero', () => {
		const handlers = callbacks();
		const serialized = JSON.stringify(testHero);

		renderView(handlers);

		fireEvent.click(getDeleteControl('刪除'));

		// The confirmation's own action reads in zh-TW too; it is the only text 刪除 on screen.
		const confirmation = getButton('刪除');
		expect(handlers.deleteHero).not.toHaveBeenCalled();

		fireEvent.click(confirmation);

		expect(handlers.deleteHero).toHaveBeenCalledTimes(1);
		expect(handlers.deleteHero).toHaveBeenCalledWith(testHero);
		expect(handlers.deleteHero.mock.calls[0][0].id).toBe('hero-1');
		expect(handlers.deleteHero.mock.calls[0][0].name).toBe('Seren of the Ash');
		expect(JSON.stringify(testHero)).toBe(serialized);
	});

	it('reads the confirmation action in English once the locale is switched', () => {
		const handlers = callbacks();

		renderView(handlers);
		switchLocale();

		fireEvent.click(getDeleteControl('Delete'));
		fireEvent.click(getButton('Delete'));

		expect(handlers.deleteHero).toHaveBeenCalledWith(testHero);
	});

	it('deletes nothing when only the locale changes', () => {
		const handlers = callbacks();

		renderView(handlers);

		switchLocale();
		switchLocale();

		expect(handlers.deleteHero).not.toHaveBeenCalled();
		expect(getDeleteControl('刪除')).toBeTruthy();
	});
});
