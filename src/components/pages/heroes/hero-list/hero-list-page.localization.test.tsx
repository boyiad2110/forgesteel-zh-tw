// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { HeroListPage } from '@/components/pages/heroes/hero-list/hero-list-page';
import { FooterParams } from '@/components/panels/app-footer/app-footer';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { HeroLogic } from '@/logic/hero-logic';
import { Hero } from '@/models/hero';
import { Options } from '@/models/options';
import { Sourcebook } from '@/models/sourcebook';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
const loadedHeroes = vi.hoisted(() => ({ current: [] as Hero[] }));
const hiddenSourcebooks = vi.hoisted(() => ({ current: [] as string[] }));
vi.mock('@/contexts/data-context', () => ({
	useHeroes: () => loadedHeroes.current,
	useHiddenSourcebookIDs: () => hiddenSourcebooks.current,
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions
}));

const viewport = vi.hoisted(() => ({ isSmall: false }));
vi.mock('@/hooks/use-is-small', () => ({ useIsSmall: () => viewport.isSmall }));

const navigation = vi.hoisted(() => ({ goToHeroView: vi.fn(), goToHeroList: vi.fn() }));
vi.mock('@/hooks/use-navigation', () => ({ useNavigation: () => navigation }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
// The real footer is exercised by app-footer.localization.test.tsx; here it is reduced to the
// shared locale control, so the switch still goes through the real LocaleToggle.
vi.mock('@/components/panels/app-footer/app-footer', () => ({ AppFooter: () => <footer><LocaleToggle /></footer> }));
// The premade examples are authored game content, and a later batch's concern; the list of
// them is reduced to nothing so this suite only sees the shell around it.
vi.mock('@/data/pregen-data', () => ({ PregenData: { getPregens: () => [] } }));

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

const testSourcebook: Sourcebook = { ...FactoryLogic.createSourcebook(), id: 'sourcebook-1' };
const hiddenSourcebook: Sourcebook = { ...FactoryLogic.createSourcebook(), id: 'sourcebook-hidden' };

const createHero = (id: string, name: string, folder: string, isActive = true): Hero => ({
	...FactoryLogic.createHero(),
	id: id,
	name: name,
	folder: folder,
	isActive: isActive
});

const callbacks = () => ({
	addHero: vi.fn(),
	importHero: vi.fn(),
	showParty: vi.fn(),
	onActiveChanged: vi.fn()
});

// The folder the page opens on is a route parameter, exactly as it is in the app.
const renderList = (handlers: ReturnType<typeof callbacks>, sourcebooks: Sourcebook[] = [ testSourcebook ], folder?: string) => {
	const page = (
		<HeroListPage
			sourcebooks={sourcebooks}
			params={footerParams}
			addHero={handlers.addHero}
			importHero={handlers.importHero}
			showParty={handlers.showParty}
			onActiveChanged={handlers.onActiveChanged}
		/>
	);

	return render(
		<MemoryRouter initialEntries={[ folder === undefined ? '/heroes' : `/heroes/${folder}` ]}>
			<LocalizationProvider>
				<Routes>
					<Route path='/heroes' element={page} />
					<Route path='/heroes/:folder' element={page} />
				</Routes>
			</LocalizationProvider>
		</MemoryRouter>
	);
};

// Buttons carry an icon whose accessible name sits alongside the label, so they are found by
// the words a player actually reads on them. antd spaces a two-character Chinese label apart
// itself, which is its own styling rather than part of the reading, so both sides are
// compared with the spacing taken out. Everything that is not a button label - the tabs, the
// counts and the page title - is asserted exactly as it reads.
const withoutSpacing = (text: string) => text.replace(/\s+/g, '');

const getButtons = (label: string) => screen.getAllByRole('button').filter(button => withoutSpacing(button.textContent ?? '') === withoutSpacing(label));

const getButton = (label: string) => {
	const matches = getButtons(label);
	expect(matches.length).toBe(1);
	return matches[0];
};

// The 'Add' dropdown keeps its actions in a popover, which opens on click. It is used from
// both locales, so it reaches for whichever reading is showing.
const openAddMenu = () => {
	const matches = getButtons('新增').concat(getButtons('Add'));
	expect(matches.length).toBe(1);
	fireEvent.click(matches[0]);
};

const getHeaderText = () => document.querySelector('.logo-panel-text')!.textContent;

beforeEach(() => {
	loadedHeroes.current = [];
	hiddenSourcebooks.current = [];
	viewport.isSmall = false;
	navigation.goToHeroView.mockClear();
	navigation.goToHeroList.mockClear();
});

describe('HeroListPage localization', () => {
	it('reads the page and header, and restores the canonical English', () => {
		renderList(callbacks());

		expect(document.title).toBe('Forge Steel - 英雄');
		expect(getHeaderText()).toBe('英雄');
		expect(getButton('新增')).toBeTruthy();
		expect(getButton('隊伍')).toBeTruthy();

		switchLocale();

		expect(document.title).toBe('Forge Steel - Heroes');
		expect(getHeaderText()).toBe('Heroes');
		expect(getButton('Add')).toBeTruthy();
		expect(getButton('Party')).toBeTruthy();
	});

	it('reads every action in the add menu, and restores the canonical English', () => {
		renderList(callbacks());
		openAddMenu();

		expect(getButton('創建新英雄')).toBeTruthy();
		expect(getButton('匯入英雄檔案')).toBeTruthy();
		expect(getButton('隨機生成英雄')).toBeTruthy();
		expect(screen.getByText('使用預建範例', { exact: true })).toBeTruthy();

		switchLocale();

		expect(getButton('Create a New Hero')).toBeTruthy();
		expect(getButton('Import a Hero File')).toBeTruthy();
		expect(getButton('Generate a Random Hero')).toBeTruthy();
		expect(screen.getByText('Use a premade example', { exact: true })).toBeTruthy();
	});

	it('reads the default folder tab while a real folder name stays byte-for-byte canonical', () => {
		loadedHeroes.current = [
			createHero('hero-1', 'Hero One', ''),
			createHero('hero-2', 'Hero Two', '英雄')
		];

		renderList(callbacks());

		const tabs = screen.getAllByRole('tab').map(tab => tab.querySelector('.section-title')!.textContent);
		// The unnamed folder is read as 英雄; the user's own folder - which happens to be
		// spelled the same way - is data and is shown exactly as they typed it.
		expect(tabs).toEqual([ '英雄', '英雄' ]);

		switchLocale();

		const englishTabs = screen.getAllByRole('tab').map(tab => tab.querySelector('.section-title')!.textContent);
		expect(englishTabs).toEqual([ 'Heroes', '英雄' ]);
		expect(loadedHeroes.current.map(hero => hero.folder)).toEqual([ '', '英雄' ]);
	});

	it('reads the active count in the approved form without changing what it counts', () => {
		loadedHeroes.current = [
			createHero('hero-1', 'Hero One', ''),
			createHero('hero-2', 'Hero Two', '', false),
			createHero('hero-3', 'Hero Three', '', false)
		];

		renderList(callbacks());

		expect(screen.getByRole('tab').querySelector('.section-count')!.textContent).toBe('1 / 3');

		switchLocale();

		expect(screen.getByRole('tab').querySelector('.section-count')!.textContent).toBe('1 of 3');
	});

	it('shows a plain total when every hero in the folder is active, in either locale', () => {
		loadedHeroes.current = [ createHero('hero-1', 'Hero One', ''), createHero('hero-2', 'Hero Two', '') ];

		renderList(callbacks());

		expect(screen.getByRole('tab').querySelector('.section-count')!.textContent).toBe('2');

		switchLocale();

		expect(screen.getByRole('tab').querySelector('.section-count')!.textContent).toBe('2');
	});
});

describe('HeroListPage management callbacks', () => {
	it('creates a hero in the canonical folder the tab stands for', () => {
		const handlers = callbacks();
		loadedHeroes.current = [ createHero('hero-1', 'Hero One', 'Campaign Folder') ];

		renderList(handlers, [ testSourcebook ], 'Campaign Folder');
		openAddMenu();
		fireEvent.click(getButton('創建新英雄'));

		// The folder is the tab's canonical value, never its reading.
		expect(handlers.addHero).toHaveBeenCalledTimes(1);
		expect(handlers.addHero).toHaveBeenCalledWith('Campaign Folder');
	});

	it('generates a random hero from the same canonical sourcebook set in either locale', () => {
		const handlers = callbacks();
		hiddenSourcebooks.current = [ 'sourcebook-hidden' ];
		// The generator itself is not under test - only what is handed to it - so it stands in
		// for the algorithm rather than running it.
		const generatedHero = createHero('random-hero', 'Random Hero', '');
		const createRandomHero = vi.spyOn(HeroLogic, 'createRandomHero').mockImplementation(() => generatedHero);

		renderList(handlers, [ testSourcebook, hiddenSourcebook ]);
		openAddMenu();
		fireEvent.click(getButton('隨機生成英雄'));

		switchLocale();
		fireEvent.click(getButton('Generate a Random Hero'));

		// The visible sourcebooks reaching the generator are the same objects in both locales.
		expect(createRandomHero).toHaveBeenCalledTimes(2);
		createRandomHero.mock.calls.forEach(call => {
			expect(call[0].map(sourcebook => sourcebook.id)).toEqual([ 'sourcebook-1' ]);
			expect(call[0][0]).toBe(testSourcebook);
		});
		// The hero the generator produced is passed straight through, into the canonical folder.
		expect(handlers.importHero.mock.calls.every(call => (call[0] === generatedHero) && (call[1] === ''))).toBe(true);

		createRandomHero.mockRestore();
	});

	it('keeps the party control disabled until two heroes are active, whatever the locale', () => {
		const handlers = callbacks();
		loadedHeroes.current = [ createHero('hero-1', 'Hero One', ''), createHero('hero-2', 'Hero Two', '', false) ];

		renderList(handlers);

		expect((getButton('隊伍') as HTMLButtonElement).disabled).toBe(true);

		switchLocale();

		expect((getButton('Party') as HTMLButtonElement).disabled).toBe(true);
		expect(handlers.showParty).not.toHaveBeenCalled();
	});

	it('shows the party for the canonical folder once two heroes are active', () => {
		const handlers = callbacks();
		loadedHeroes.current = [ createHero('hero-1', 'Hero One', ''), createHero('hero-2', 'Hero Two', '') ];

		renderList(handlers);
		fireEvent.click(getButton('隊伍'));

		expect(handlers.showParty).toHaveBeenCalledWith('');
	});

	it('invokes no management action when only the locale changes', () => {
		const handlers = callbacks();
		loadedHeroes.current = [ createHero('hero-1', 'Hero One', ''), createHero('hero-2', 'Hero Two', '') ];
		const serializedHeroes = JSON.stringify(loadedHeroes.current);

		renderList(handlers);

		switchLocale();
		switchLocale();

		expect(handlers.addHero).not.toHaveBeenCalled();
		expect(handlers.importHero).not.toHaveBeenCalled();
		expect(handlers.showParty).not.toHaveBeenCalled();
		expect(handlers.onActiveChanged).not.toHaveBeenCalled();
		expect(navigation.goToHeroView).not.toHaveBeenCalled();
		expect(navigation.goToHeroList).not.toHaveBeenCalled();
		expect(JSON.stringify(loadedHeroes.current)).toBe(serializedHeroes);
	});

	it('reports the unchanged hero when its visibility is toggled from the list', () => {
		const handlers = callbacks();
		loadedHeroes.current = [ createHero('hero-1', 'Hero One', 'Campaign Folder') ];

		renderList(handlers, [ testSourcebook ], 'Campaign Folder');
		fireEvent.click(screen.getByTitle('顯示 / 隱藏'));

		expect(handlers.onActiveChanged).toHaveBeenCalledTimes(1);
		const reported = handlers.onActiveChanged.mock.calls[0][0] as Hero;
		expect(reported.id).toBe('hero-1');
		expect(reported.name).toBe('Hero One');
		expect(reported.folder).toBe('Campaign Folder');
		expect(reported.isActive).toBe(false);
	});
});
