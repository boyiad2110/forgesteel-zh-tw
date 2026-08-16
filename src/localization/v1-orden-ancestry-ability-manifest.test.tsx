// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1OrdenAncestryAbilityRequiredCanonicalEnglish,
	getV1OrdenAncestryAbilities,
	v1LocalizationManifest,
	v1OrdenAncestryAbilityIDs
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { PanelMode } from '@/enums/panel-mode';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const required = createV1OrdenAncestryAbilityRequiredCanonicalEnglish();
const ordenCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	entry.kind === 'element-field' && v1OrdenAncestryAbilityIDs.includes(entry.elementID as typeof v1OrdenAncestryAbilityIDs[number])
));

const getAbility = (id: typeof v1OrdenAncestryAbilityIDs[number]) => {
	const ability = getV1OrdenAncestryAbilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Orden ancestry ability '${id}' is missing`);
	}
	return ability;
};

const renderAbility = (id: typeof v1OrdenAncestryAbilityIDs[number]) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(AbilityPanel, { ability: getAbility(id), mode: PanelMode.Full })
	)
);

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent?.trim() || '');

const tierReading = (id: typeof v1OrdenAncestryAbilityIDs[number], field: string, tier: number, hero?: ReturnType<typeof FactoryLogic.createHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getAbility(id), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const textReading = (id: typeof v1OrdenAncestryAbilityIDs[number], field: string, hero?: ReturnType<typeof FactoryLogic.createHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Orden ancestry Ability manifest', () => {
	it('enumerates exactly the approved six-node, 28-identity slice and its catalog entries', () => {
		expect(getV1OrdenAncestryAbilities().map(ability => ability.id)).toEqual([ ...v1OrdenAncestryAbilityIDs ]);
		expect(v1OrdenAncestryAbilityIDs).toHaveLength(6);
		expect(Object.keys(required)).toHaveLength(28);
		expect(ordenCatalogEntries).toHaveLength(28);

		const catalogIdentities = ordenCatalogEntries.map(getEntryIdentity);
		expect(new Set(catalogIdentities).size).toBe(28);
		expect(catalogIdentities.slice().sort()).toEqual(Object.keys(required).sort());
		expect(ordenCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(ordenCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
	});

	it('keeps every other Orden ancestry Ability outside this bounded slice', () => {
		const identities = Object.keys(required);

		expect(identities.some(identity => identity.includes('hakan'))).toBe(false);
		expect(identities.some(identity => identity.includes('devil-feature-2-3'))).toBe(false);
		expect(identities.some(identity => identity.includes('time-raider-feature-2-5-3/sections.1'))).toBe(false);
	});

	it('records exactly the approved glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^(Axiom|Plane of Uttermost Law),/.test(row))).toEqual([
			'Axiom,公理界,game-term,approved',
			'Plane of Uttermost Law,至律位面,game-term,approved'
		]);
	});

	it('keeps the parent authored-content domain unresolved without a completeness issue', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.complete).toBe(false);
	});

	it('presents packet-approved raw content on the no-Hero path', () => {
		expect(tierReading('time-raider-feature-2-5-1', 'sections.0.roll.tier1', 1)).toBe('2 + `理智`、`直覺`或`氣場`傷害');
		expect(tierReading('time-raider-feature-2-5-1', 'sections.0.roll.tier2', 2)).toBe('5 + `理智`、`直覺`或`氣場`傷害；推動 1');
		expect(tierReading('time-raider-feature-2-5-1', 'sections.0.roll.tier3', 3)).toBe('7 + `理智`、`直覺`或`氣場`傷害；推動 2；`力量` < [強]，**伏地**');
		expect(tierReading('time-raider-feature-2-5-2', 'sections.0.roll.tier1', 1)).toBe('2 + `理智`、`直覺`或`氣場`心靈傷害；滑動 1');
		expect(tierReading('time-raider-feature-2-5-2', 'sections.0.roll.tier2', 2)).toBe('5 + `理智`、`直覺`或`氣場`心靈傷害；滑動 2');
		expect(tierReading('time-raider-feature-2-5-2', 'sections.0.roll.tier3', 3)).toBe('7 + `理智`、`直覺`或`氣場`心靈傷害；滑動 3');
		expect(textReading('time-raider-feature-2-5-3', 'sections.0.text')).toBe('目標的速度獲得等於你`理智`、`直覺`或`氣場`的加值（由你選擇），直到你下個回合開始。');
	});

	it('preserves calculated Ability and Hero state across the zh-TW to English round-trip', () => {
		const hero = FactoryLogic.createHero();
		hero.class = FactoryLogic.createClass();
		hero.class.characteristics = FactoryLogic.createCharacteristics(0, 0, 3, 2, 1);
		const renderedAbility = getAbility('time-raider-feature-2-5-1');
		const calculatedAbility = getAbility('time-raider-feature-2-5-2');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const { container } = renderAbility('time-raider-feature-2-5-1');

		try {
			verifyLocaleDifferentialInvariants({
				protectedStates: [
					protectCanonicalState({ label: 'rendered Orden Ability', capture: () => JSON.stringify(renderedAbility) }),
					protectCanonicalState({ label: 'calculated Orden Ability', capture: () => JSON.stringify(calculatedAbility) }),
					protectCanonicalState({ label: 'Hero', capture: () => JSON.stringify(hero) })
				],
				assertZhTW: () => {
					expect(tierReading('time-raider-feature-2-5-1', 'sections.0.roll.tier1', 1, hero)).toBe('5 傷害');
					expect(tierReading('time-raider-feature-2-5-1', 'sections.0.roll.tier2', 2, hero)).toBe('8 傷害；推動 1');
					expect(tierReading('time-raider-feature-2-5-1', 'sections.0.roll.tier3', 3, hero)).toBe('10 傷害；推動 2；`力量` < 3，**伏地**');
					expect(tierReading('time-raider-feature-2-5-2', 'sections.0.roll.tier1', 1, hero)).toBe('5 心靈傷害；滑動 1');
					expect(tierReading('time-raider-feature-2-5-2', 'sections.0.roll.tier2', 2, hero)).toBe('8 心靈傷害；滑動 2');
					expect(tierReading('time-raider-feature-2-5-2', 'sections.0.roll.tier3', 3, hero)).toBe('10 心靈傷害；滑動 3');
					expect(textReading('time-raider-feature-2-5-3', 'sections.0.text', hero)).toBe('目標的速度獲得等於你`理智`、`直覺`或`氣場`的加值（由你選擇），直到你下個回合開始。');
					expect(container.textContent).toContain('猛力衝擊');
					expect(container.textContent).toContain('你將一股無形的力量猛烈砸向目標。');
					expect(tierTexts(container)).toEqual([
						'2 + 理智、直覺或氣場傷害',
						'5 + 理智、直覺或氣場傷害；推動 1',
						'7 + 理智、直覺或氣場傷害；推動 2；力量 < [強]，伏地'
					]);
					expect(Array.from(container.querySelectorAll('.power-roll-row .effect strong')).map(node => node.textContent)).toEqual([ '伏地' ]);
					expect(Array.from(container.querySelectorAll('code')).map(node => node.textContent)).toEqual([ '理智', '直覺', '氣場', '理智', '直覺', '氣場', '理智', '直覺', '氣場', '力量' ]);
				},
				switchToEnglish: () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / })),
				assertEnglish: () => {
					expect(tierTexts(container)).toEqual([
						'2 + R, I, or P damage',
						'5 + R, I, or P damage; push 1',
						'7 + R, I, or P damage; push 2; M < [strong] prone'
					]);
					expect(container.textContent).not.toMatch(/[一-鿿]/);
				},
				switchToZhTW: () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / })),
				assertZhTWAfterRoundTrip: () => {
					expect(tierTexts(container)).toEqual([
						'2 + 理智、直覺或氣場傷害',
						'5 + 理智、直覺或氣場傷害；推動 1',
						'7 + 理智、直覺或氣場傷害；推動 2；力量 < [強]，伏地'
					]);
				}
			});

			getTierEffectCreature.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
			expect(getTierEffectCreature.mock.calls.map(([ input ]) => input)).toContain('7 + R, I, or P damage; push 2; M < [strong] prone');
		} finally {
			getTierEffectCreature.mockRestore();
		}
	});
});
