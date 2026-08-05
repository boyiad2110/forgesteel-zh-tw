// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { LocalizationProvider } from '@/contexts/localization-context';
import { HeroEditPage } from '@/components/pages/heroes/hero-edit/hero-edit-page';
import { FooterParams } from '@/components/panels/app-footer/app-footer';
import { FactoryLogic } from '@/logic/factory-logic';
import { fireEvent, render, screen } from '@testing-library/react';
import { Profiler, ReactNode, useEffect } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useHeroes: () => [ testHero ],
	useOptions: () => ({ compactView: false })
}));

vi.mock('@/hooks/use-is-small', () => ({ useIsSmall: () => false }));
vi.mock('@/hooks/use-navigation', () => ({ useNavigation: () => ({ goToHeroView: vi.fn() }) }));
vi.mock('@/hooks/use-title', () => ({ useTitle: vi.fn() }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/panels/app-header/app-header', () => ({ AppHeader: ({ children }: { children: ReactNode }) => <header>{children}</header> }));
vi.mock('@/components/panels/app-footer/app-footer', () => ({ AppFooter: () => <footer /> }));
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

const LocationProbe = () => {
	const location = useLocation();
	return <output data-testid='route'>{`${location.pathname}${location.search}${location.hash}`}</output>;
};

const DataLoaderBoundaryProbe = (props: { children: ReactNode; onLoad: () => void }) => {
	useEffect(props.onLoad, [ props.onLoad ]);
	return <>{props.children}</>;
};

describe('HeroEditPage prototype locale switching', () => {
	it('keeps the loaded tree, route, working copy, dirty state, and save boundary stable', () => {
		let dataLoaderRuns = 0;
		let heroEditMounts = 0;
		const saveChanges = vi.fn();

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
										<HeroEditPage params={{} as FooterParams} saveChanges={saveChanges} importSourcebook={vi.fn()} sourcebooks={[]} />
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
		expect((screen.getByRole('button', { name: 'Save Changes' }) as HTMLButtonElement).disabled).toBe(false);

		fireEvent.click(screen.getByRole('button', { name: 'zh-TW' }));
		expect((screen.getByRole('button', { name: '【原型】儲存變更' }) as HTMLButtonElement).disabled).toBe(false);
		fireEvent.click(screen.getByRole('button', { name: 'EN' }));
		fireEvent.click(screen.getByRole('button', { name: 'zh-TW' }));

		expect(screen.getByTestId('working-copy').textContent).toBe(workingCopyBeforeLocaleSwitch);
		expect(screen.getByTestId('route').textContent).toBe(routeBeforeLocaleSwitch);
		expect(saveChanges).not.toHaveBeenCalled();
		expect(dataLoaderRuns).toBe(1);
		expect(heroEditMounts).toBe(1);
	});
});
