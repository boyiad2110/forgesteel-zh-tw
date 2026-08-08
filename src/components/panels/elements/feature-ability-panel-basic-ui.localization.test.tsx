// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { PanelMode } from '@/enums/panel-mode';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ setData: vi.fn() }));

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: true, locale: 'zh-TW' })
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: mocks.setData }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));
vi.mock('@/components/features/feature', () => ({ InfoFeature: () => null }));
vi.mock('@/components/panels/ability-info/ability-info-panel', () => ({ AbilityInfoPanel: () => null }));
vi.mock('@/components/panels/power-roll/power-roll-panel', () => ({ PowerRollPanel: () => null }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: () => 'test-panel' } }));

afterEach(() => {
	cleanup();
	mocks.setData.mockReset();
});

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

describe('FeaturePanel and AbilityPanel basic UI localization', () => {
	it('localizes unnamed fallbacks, Feature notes and copy controls without changing canonical payloads', () => {
		const feature = FactoryLogic.createPerk();
		feature.id = 'unnamed-feature';
		feature.name = '';
		const ability = FactoryLogic.createAbility({ id: 'unnamed-ability', name: '', sections: [] });
		const hero = FactoryLogic.createHero();
		hero.abilityCustomizations = [ { abilityID: feature.id, name: '', description: '', notes: 'Canonical note', costModifier: 0, distanceBonus: 0, damageBonus: 0, characteristic: null } ];
		const canonicalBefore = JSON.stringify({ feature, ability, customization: hero.abilityCustomizations });

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<FeaturePanel feature={feature} hero={hero} mode={PanelMode.Full} />
				<FeaturePanel feature={feature} mode={PanelMode.Compact} />
				<AbilityPanel ability={ability} mode={PanelMode.Full} />
				<AbilityPanel ability={ability} mode={PanelMode.Compact} />
			</LocalizationProvider>
		);

		expect(screen.getAllByText('未命名特性', { exact: true })).toHaveLength(2);
		expect(screen.getAllByText('未命名招式', { exact: true })).toHaveLength(2);
		expect(screen.getByText('備註', { exact: true })).toBeTruthy();
		expect(screen.getByText('Canonical note', { exact: true })).toBeTruthy();
		fireEvent.click(screen.getAllByTitle('複製特性')[0]);
		expect(mocks.setData).toHaveBeenLastCalledWith(feature);
		fireEvent.click(screen.getByTitle('複製招式'));
		expect(mocks.setData).toHaveBeenLastCalledWith(ability);

		switchLocale();

		expect(screen.getAllByText('Unnamed Feature', { exact: true })).toHaveLength(2);
		expect(screen.getAllByText('Unnamed Ability', { exact: true })).toHaveLength(2);
		expect(screen.getByText('Notes', { exact: true })).toBeTruthy();
		expect(screen.getAllByTitle('Copy Feature')).toHaveLength(2);
		expect(screen.getByTitle('Copy Ability')).toBeTruthy();
		expect(JSON.stringify({ feature, ability, customization: hero.abilityCustomizations })).toBe(canonicalBefore);
	});

	it('keeps named panel content and out-of-scope auto-calculate text canonical', () => {
		const feature = FactoryLogic.createPerk();
		feature.name = 'Canonical Feature';
		const ability = FactoryLogic.createAbility({ id: 'named-ability', name: 'Canonical Ability', sections: [] });

		render(
			<LocalizationProvider>
				<FeaturePanel feature={feature} mode={PanelMode.Full} />
				<AbilityPanel ability={ability} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		expect(screen.getByText('Canonical Feature', { exact: true })).toBeTruthy();
		expect(screen.getByText('Canonical Ability', { exact: true })).toBeTruthy();
	});
});
