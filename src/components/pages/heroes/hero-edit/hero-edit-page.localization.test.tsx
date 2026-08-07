// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { LocalizationProvider } from '@/contexts/localization-context';
import { HeroEditPage } from '@/components/pages/heroes/hero-edit/hero-edit-page';
import { FooterParams } from '@/components/panels/app-footer/app-footer';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { FactoryLogic } from '@/logic/factory-logic';
import { CultureType } from '@/enums/culture-type';
import { Hero } from '@/models/hero';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Profiler, ReactNode, useEffect } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The page state a tab reports is derived from the hero, so the hero under test is
// switchable here rather than fixed.
const loadedHeroes = vi.hoisted(() => ({ current: [] as Hero[] }));
vi.mock('@/contexts/data-context', () => ({
	useHeroes: () => loadedHeroes.current,
	useDataManager: () => testDataManager,
	useOptions: () => testOptions
}));

// The page shows the same navigation through two different controls, so the viewport is
// switchable here rather than fixed.
const viewport = vi.hoisted(() => ({ isSmall: false }));
vi.mock('@/hooks/use-is-small', () => ({ useIsSmall: () => viewport.isSmall }));

const navigation = vi.hoisted(() => ({ goToHeroView: vi.fn(), goToHeroEdit: vi.fn() }));
vi.mock('@/hooks/use-navigation', () => ({ useNavigation: () => navigation }));
vi.mock('@/hooks/use-title', () => ({ useTitle: vi.fn() }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/panels/app-header/app-header', () => ({ AppHeader: ({ children }: { children: ReactNode }) => <header>{children}</header> }));
// The real footer is exercised by app-footer.localization.test.tsx; here it is reduced to
// the shared control under test, so the switch still goes through the real LocaleToggle.
vi.mock('@/components/panels/app-footer/app-footer', () => ({ AppFooter: () => <footer><LocaleToggle /></footer> }));
vi.mock('@/components/controls/text-input/text-input', () => ({ SearchBox: () => null }));
vi.mock('@/components/controls/button-group/button-group', () => ({
	ButtonGroup: ({ buttons }: { buttons: Array<{ type: string; control?: ReactNode; disabled?: boolean; label?: string; onClick?: () => void } | null> }) => (
		<div>
			{buttons.map((button, index) => {
				if (!button) {
					return null;
				}
				if (button.type === 'control') {
					return <span key={index}>{button.control}</span>;
				}
				return <button key={index} disabled={button.disabled} onClick={button.onClick} type='button'>{button.label}</button>;
			})}
		</div>
	)
}));
vi.mock('@/components/pages/heroes/hero-edit/details-section/details-section', () => ({
	DetailsSection: ({ hero, setName }: { hero: { name: string }; setName: (name: string) => void }) => (
		<div>
			<div data-testid='working-copy'>{JSON.stringify(hero)}</div>
			<button onClick={() => setName('Unsaved Hero')} type='button'>Make unsaved change</button>
		</div>
	)
}));

// jsdom has no ResizeObserver, which the small-screen control's popup needs before it will
// draw its options. Nothing here depends on the sizes it would report.
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

const testHero = { ...FactoryLogic.createHero(), id: 'hero-1' };
// A hero positioned so the navigation reports every page state that carries a subtitle at
// once: an untouched page is not started, the optional page is optional, a culture still
// missing its environment is in progress, and a named hero has completed its details.
const pageStateHero: Hero = {
	...FactoryLogic.createHero(),
	id: 'hero-1',
	name: 'Test Hero',
	culture: FactoryLogic.createCulture('Test Culture', '', CultureType.Bespoke)
};
const testSourcebook = { ...FactoryLogic.createSourcebook(), id: 'sourcebook-1', name: 'Homebrew Sourcebook' };
const testOptions: Options = { ...FactoryLogic.createOptions(), compactView: false, locale: 'zh-TW' };
const testDataManager = { saveOptions: vi.fn().mockResolvedValue(undefined) };

const LocationProbe = () => {
	const location = useLocation();
	return <output data-testid='route'>{`${location.pathname}${location.search}${location.hash}`}</output>;
};

const DataLoaderBoundaryProbe = (props: { children: ReactNode; onLoad: () => void }) => {
	useEffect(props.onLoad, [ props.onLoad ]);
	return <>{props.children}</>;
};

const getButton = (name: string | RegExp) => screen.getByRole('button', { name: name }) as HTMLButtonElement;
const getLocaleToggle = () => getButton(/^Switch to /);

// The navigation values the router and the hero edit route are defined in terms of; the
// labels below are only ever what is drawn over them.
const canonicalTabValues = [ 'start', 'ancestry', 'culture', 'career', 'class', 'complication', 'details' ];
const canonicalTabLabels = [ 'Start', 'Ancestry', 'Culture', 'Career', 'Class', 'Complication', 'Details' ];
// The project owner's approved zh-TW, taken verbatim from docs/translation/TRANSLATION-GLOSSARY.csv.
const approvedTabLabels = [ '開始', '族裔', '文化', '職業', '範型', '糾葛', '細項' ];

const renderHeroEditPage = () => {
	return render(
		<LocalizationProvider>
			<MemoryRouter initialEntries={[ '/heroes/hero-1/details' ]}>
				<Routes>
					<Route
						path='/heroes/:heroID/:page'
						element={<HeroEditPage params={{} as FooterParams} saveChanges={vi.fn()} importSourcebook={vi.fn()} sourcebooks={[ testSourcebook ]} />}
					/>
				</Routes>
			</MemoryRouter>
		</LocalizationProvider>
	);
};

// This suite does not run with vitest globals, so the rendered tree is torn down here
// rather than by the testing library's automatic cleanup.
afterEach(cleanup);

beforeEach(() => {
	viewport.isSmall = false;
	loadedHeroes.current = [ testHero ];
	vi.clearAllMocks();
});

describe('HeroEditPage navigation labels', () => {
	it('draws the approved zh-TW labels on the full-size control, and canonical English in the English locale', () => {
		renderHeroEditPage();

		approvedTabLabels.forEach(label => expect(screen.getByText(label)).toBeTruthy());
		canonicalTabLabels.forEach(label => expect(screen.queryByText(label)).toBeNull());

		fireEvent.click(getLocaleToggle());

		canonicalTabLabels.forEach(label => expect(screen.getByText(label)).toBeTruthy());
		approvedTabLabels.forEach(label => expect(screen.queryByText(label)).toBeNull());
	});

	it('draws the approved zh-TW labels on the small-screen control, and canonical English in the English locale', () => {
		viewport.isSmall = true;
		renderHeroEditPage();

		// The small-screen control lists the tabs only once it is opened; the current tab is
		// also drawn in the closed control, so a label can legitimately appear more than once.
		fireEvent.mouseDown(screen.getByRole('combobox'));
		const isDrawn = (label: string) => screen.queryAllByText(label).length > 0;

		expect(approvedTabLabels.filter(isDrawn)).toEqual(approvedTabLabels);
		expect(canonicalTabLabels.filter(isDrawn)).toEqual([]);

		fireEvent.click(getLocaleToggle());

		expect(canonicalTabLabels.filter(isDrawn)).toEqual(canonicalTabLabels);
		expect(approvedTabLabels.filter(isDrawn)).toEqual([]);
	});

	// The point of the whole batch: a player reading 族裔 still navigates to 'ancestry'.
	it('navigates with the canonical tab value when an approved zh-TW label is chosen on the full-size control', () => {
		renderHeroEditPage();

		fireEvent.click(screen.getByRole('radio', { name: /族裔/ }));

		expect(navigation.goToHeroEdit).toHaveBeenCalledTimes(1);
		expect(navigation.goToHeroEdit).toHaveBeenCalledWith('hero-1', 'ancestry');
		expect(canonicalTabValues).toContain(navigation.goToHeroEdit.mock.calls[0][1]);
	});

	it('navigates with the canonical tab value when an approved zh-TW label is chosen on the small-screen control', () => {
		viewport.isSmall = true;
		renderHeroEditPage();

		fireEvent.mouseDown(screen.getByRole('combobox'));
		fireEvent.click(screen.getByText('族裔'));

		expect(navigation.goToHeroEdit).toHaveBeenCalledTimes(1);
		expect(navigation.goToHeroEdit).toHaveBeenCalledWith('hero-1', 'ancestry');
		expect(canonicalTabValues).toContain(navigation.goToHeroEdit.mock.calls[0][1]);
	});
});

describe('HeroEditPage navigation page states', () => {
	// The project owner's approved zh-TW, in the same order as the canonical states above.
	const canonicalPageStates = [ 'Optional', 'Not Started', 'In Progress', 'Completed' ];
	const approvedPageStates = [ '非強制', '尚未開始', '進行中', '已完成' ];
	const isDrawn = (text: string) => screen.queryAllByText(text).length > 0;

	it('draws the approved zh-TW page states on the full-size control, and canonical English in the English locale', () => {
		loadedHeroes.current = [ pageStateHero ];
		renderHeroEditPage();

		expect(approvedPageStates.filter(isDrawn)).toEqual(approvedPageStates);
		expect(canonicalPageStates.filter(isDrawn)).toEqual([]);

		fireEvent.click(getLocaleToggle());

		expect(canonicalPageStates.filter(isDrawn)).toEqual(canonicalPageStates);
		expect(approvedPageStates.filter(isDrawn)).toEqual([]);
	});

	// The subtitle is presentation; the class beside it is state, and stays canonical.
	it('keeps the state-derived class canonical in both locales', () => {
		loadedHeroes.current = [ pageStateHero ];
		renderHeroEditPage();

		const classOf = (subtitle: string) => screen.getAllByText(subtitle)[0].parentElement!.className;

		expect(classOf('尚未開始')).toBe('page-button not-started');
		expect(classOf('進行中')).toBe('page-button in-progress');
		expect(classOf('非強制')).toBe('page-button optional');
		expect(classOf('已完成')).toBe('page-button completed');

		fireEvent.click(getLocaleToggle());

		expect(classOf('Not Started')).toBe('page-button not-started');
		expect(classOf('In Progress')).toBe('page-button in-progress');
		expect(classOf('Optional')).toBe('page-button optional');
		expect(classOf('Completed')).toBe('page-button completed');
	});

	// The small-screen control shows tab labels only; this batch does not add a page state to it.
	it('draws no page state on the small-screen control, in either locale', () => {
		loadedHeroes.current = [ pageStateHero ];
		viewport.isSmall = true;
		renderHeroEditPage();

		fireEvent.mouseDown(screen.getByRole('combobox'));

		expect(approvedPageStates.filter(isDrawn)).toEqual([]);
		expect(canonicalPageStates.filter(isDrawn)).toEqual([]);

		fireEvent.click(getLocaleToggle());

		expect(approvedPageStates.filter(isDrawn)).toEqual([]);
		expect(canonicalPageStates.filter(isDrawn)).toEqual([]);
	});
});

describe('HeroEditPage locale switching', () => {
	it('keeps the loaded tree, route, working copy, dirty state, save boundary, and canonical data stable', () => {
		let dataLoaderRuns = 0;
		let heroEditMounts = 0;
		const saveChanges = vi.fn();
		const heroBeforeLocaleSwitch = JSON.stringify(testHero);
		const sourcebookBeforeLocaleSwitch = JSON.stringify(testSourcebook);
		const optionsBeforeLocaleSwitch = JSON.stringify(testOptions);

		render(
			<DataLoaderBoundaryProbe onLoad={() => { dataLoaderRuns++; }}>
				<LocalizationProvider>
					<MemoryRouter initialEntries={[ '/heroes/hero-1/details' ]}>
						<LocationProbe />
						<Routes>
							<Route
								path='/heroes/:heroID/:page'
								element={
									<Profiler id='hero-edit-page' onRender={(_id, phase) => { if (phase === 'mount') { heroEditMounts++; } }}>
										<HeroEditPage params={{} as FooterParams} saveChanges={saveChanges} importSourcebook={vi.fn()} sourcebooks={[ testSourcebook ]} />
									</Profiler>
								}
							/>
						</Routes>
					</MemoryRouter>
				</LocalizationProvider>
			</DataLoaderBoundaryProbe>
		);

		fireEvent.click(screen.getByRole('button', { name: 'Make unsaved change' }));
		const workingCopyBeforeLocaleSwitch = screen.getByTestId('working-copy').textContent;
		const routeBeforeLocaleSwitch = screen.getByTestId('route').textContent;

		// The only locale control is the shared one in the footer; the header has none.
		expect(screen.queryByRole('button', { name: 'zh-TW' })).toBeNull();
		expect(screen.getAllByRole('button', { name: /^Switch to / })).toHaveLength(1);

		// Starts in the saved zh-TW locale, where these labels have approved translations.
		expect(getLocaleToggle().textContent).toBe('中文');
		expect(getButton('儲存變更').disabled).toBe(false);
		expect(getButton('取消')).toBeTruthy();
		// These two carry an icon, so their accessible name is prefixed by it.
		expect(getButton(/隨機選擇$/)).toBeTruthy();
		expect(getButton(/取消選擇$/)).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Save Changes' })).toBeNull();

		fireEvent.click(getLocaleToggle());
		expect(getLocaleToggle().textContent).toBe('EN');

		// Presentation: canonical English in the English locale.
		expect(getButton('Save Changes').disabled).toBe(false);
		expect(getButton('Cancel')).toBeTruthy();
		expect(getButton(/Random$/)).toBeTruthy();
		expect(getButton(/Unselect$/)).toBeTruthy();
		expect(screen.queryByRole('button', { name: '儲存變更' })).toBeNull();

		fireEvent.click(getLocaleToggle());
		expect(getLocaleToggle().textContent).toBe('中文');

		// Presentation: back to the approved zh-TW content, and only ever that.
		expect(getButton('儲存變更').disabled).toBe(false);
		expect(getButton('取消')).toBeTruthy();
		expect(getButton(/隨機選擇$/)).toBeTruthy();
		expect(getButton(/取消選擇$/)).toBeTruthy();

		// State safety.
		expect(screen.getByTestId('working-copy').textContent).toBe(workingCopyBeforeLocaleSwitch);
		expect(screen.getByTestId('route').textContent).toBe(routeBeforeLocaleSwitch);
		expect(saveChanges).not.toHaveBeenCalled();
		expect(dataLoaderRuns).toBe(1);
		expect(heroEditMounts).toBe(1);

		// Data safety.
		expect(JSON.stringify(testHero)).toBe(heroBeforeLocaleSwitch);
		expect(JSON.stringify(testSourcebook)).toBe(sourcebookBeforeLocaleSwitch);
		expect(JSON.stringify(testOptions)).toBe(optionsBeforeLocaleSwitch);

		// Persistence: the existing options boundary receives the complete options.
		expect(testDataManager.saveOptions).toHaveBeenCalledTimes(2);
		expect(testDataManager.saveOptions).toHaveBeenNthCalledWith(1, { ...testOptions, locale: 'en' });
		expect(testDataManager.saveOptions).toHaveBeenNthCalledWith(2, { ...testOptions, locale: 'zh-TW' });
	});
});
