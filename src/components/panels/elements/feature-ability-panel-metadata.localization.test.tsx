// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { PanelMode } from '@/enums/panel-mode';
import { SourcebookType } from '@/enums/sourcebook-type';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' })
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));
vi.mock('@/components/features/feature', () => ({ InfoFeature: () => null }));
vi.mock('@/components/panels/ability-info/ability-info-panel', () => ({ AbilityInfoPanel: () => null }));
vi.mock('@/components/panels/power-roll/power-roll-panel', () => ({ PowerRollPanel: () => null }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: () => 'test-panel' } }));

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const createAbility = (id: string, cost: number | 'signature') => FactoryLogic.createAbility({
	id,
	name: `${id} name`,
	description: `${id} description`,
	cost,
	sections: []
});

const createPerkData = (sourcebookType: SourcebookType) => {
	const perk = FactoryLogic.createPerk();
	perk.id = 'test-perk';
	perk.name = 'Canonical Perk';
	perk.description = 'Canonical description';

	const sourcebook = FactoryLogic.createSourcebook();
	sourcebook.id = 'test-sourcebook';
	sourcebook.type = sourcebookType;
	sourcebook.perks = [ perk ];

	return { perk, sourcebook };
};

describe('FeaturePanel and AbilityPanel metadata localization', () => {
	it('renders signature badges in the approved locale across FeaturePanel and AbilityPanel full and compact paths without changing canonical data', () => {
		const { perk, sourcebook } = createPerkData(SourcebookType.Homebrew);
		const abilityFromProp = createAbility('prop-signature', 2);
		const abilityFromData = createAbility('data-signature', 'signature');
		const cost = 'signature' as const;
		const canonicalBefore = JSON.stringify({ perk, sourcebook, abilityFromProp, abilityFromData });

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<FeaturePanel feature={perk} cost={cost} sourcebooks={[ sourcebook ]} mode={PanelMode.Full} />
				<AbilityPanel ability={abilityFromProp} cost={cost} mode={PanelMode.Full} />
				<AbilityPanel ability={abilityFromData} mode={PanelMode.Compact} />
			</LocalizationProvider>
		);

		expect(screen.getAllByText('招牌', { exact: true })).toHaveLength(3);
		expect(screen.getByText('自製', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getAllByText('Signature', { exact: true })).toHaveLength(3);
		expect(screen.getByText('Homebrew', { exact: true })).toBeTruthy();
		expect(cost).toBe('signature');
		expect(abilityFromProp.cost).toBe(2);
		expect(abilityFromData.cost).toBe('signature');
		expect(sourcebook.type).toBe(SourcebookType.Homebrew);
		expect(JSON.stringify({ perk, sourcebook, abilityFromProp, abilityFromData })).toBe(canonicalBefore);
	});

	it('localizes only the approved FeaturePanel sourcebook type and leaves Official and unapproved types canonical', () => {
		const official = createPerkData(SourcebookType.Official);
		const community = createPerkData(SourcebookType.Community);

		render(
			<LocalizationProvider>
				<FeaturePanel feature={official.perk} sourcebooks={[ official.sourcebook ]} mode={PanelMode.Full} />
				<FeaturePanel feature={community.perk} sourcebooks={[ community.sourcebook ]} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		expect(screen.queryByText('Homebrew', { exact: true })).toBeNull();
		expect(screen.queryByText('自製', { exact: true })).toBeNull();
		expect(screen.getByText('Community', { exact: true })).toBeTruthy();
		expect(official.sourcebook.type).toBe(SourcebookType.Official);
		expect(community.sourcebook.type).toBe(SourcebookType.Community);
	});

	it('localizes Heroic Resource while retaining the canonical heroic type and leaves Epic Resource in English', () => {
		const heroic = FactoryLogic.feature.createHeroicResource({
			id: 'heroic-resource',
			name: 'Heroic Reserve',
			gains: []
		});
		const epic = FactoryLogic.feature.createHeroicResource({
			id: 'epic-resource',
			name: 'Epic Reserve',
			type: 'epic',
			gains: []
		});
		const canonicalBefore = JSON.stringify({ heroic, epic });

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<FeaturePanel feature={heroic} mode={PanelMode.Full} />
				<FeaturePanel feature={epic} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		expect(screen.getByText('英雄資源', { exact: true })).toBeTruthy();
		expect(screen.getByText('Epic Resource', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Heroic Resource', { exact: true })).toBeTruthy();
		expect(screen.getByText('Epic Resource', { exact: true })).toBeTruthy();
		expect(heroic.data.type).toBe('heroic');
		expect(epic.data.type).toBe('epic');
		expect(JSON.stringify({ heroic, epic })).toBe(canonicalBefore);
	});
});
