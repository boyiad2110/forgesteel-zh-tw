// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { LocalizationProvider } from '@/contexts/localization-context';
import { HeroEditPage } from '@/components/pages/heroes/hero-edit/hero-edit-page';
import { FooterParams } from '@/components/panels/app-footer/app-footer';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { fireEvent, render, screen } from '@testing-library/react';
import { Profiler, ReactNode, useEffect } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useHeroes: () => [ testHero ],
	useDataManager: () => testDataManager,
	useOptions: () => testOptions
}));

vi.mock('@/hooks/use-is-small', () => ({ useIsSmall: () => false }));
vi.mock('@/hooks/use-navigation', () => ({ useNavigation: () => ({ goToHeroView: vi.fn() }) }));
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

const testHero = { ...FactoryLogic.createHero(), id: 'hero-1' };
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
		expect(screen.queryByText('Prototype locale')).toBeNull();
		expect(screen.queryByRole('button', { name: 'zh-TW' })).toBeNull();
		expect(screen.getAllByRole('button', { name: /^Switch to / })).toHaveLength(1);

		// Starts in the saved zh-TW locale, which has no approved translation for this label.
		expect(getLocaleToggle().textContent).toBe('中文');
		expect(getButton('Save Changes').disabled).toBe(false);
		expect(screen.queryByText(/【原型】/)).toBeNull();

		fireEvent.click(getLocaleToggle());
		expect(getLocaleToggle().textContent).toBe('EN');
		expect(getButton('Save Changes').disabled).toBe(false);

		fireEvent.click(getLocaleToggle());
		expect(getLocaleToggle().textContent).toBe('中文');

		// Presentation: canonical English fallback, never the prototype sentinel.
		expect(getButton('Save Changes').disabled).toBe(false);
		expect(screen.queryByText(/【原型】/)).toBeNull();

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
