// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1CensorLevel1AbilityRequiredCanonicalEnglish,
	getV1CensorLevel1Abilities,
	v1CensorLevel1AbilityIDs,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { ClassPanel } from '@/components/panels/elements/class-panel/class-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { ClassData } from '@/data/class-data';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureField } from '@/enums/feature-field';
import { PanelMode } from '@/enums/panel-mode';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
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

const required = createV1CensorLevel1AbilityRequiredCanonicalEnglish();
const requiredIdentities = Object.keys(required).sort();
const censorCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	entry.kind === 'element-field'
		&& v1CensorLevel1AbilityIDs.includes(entry.elementID as typeof v1CensorLevel1AbilityIDs[number])
));

const getAbility = (id: typeof v1CensorLevel1AbilityIDs[number]) => {
	const ability = getV1CensorLevel1Abilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Censor ability '${id}' is missing`);
	}
	return ability;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(2, 0, 0, 0, 1);
	hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
		id: 'censor-production-push-bonus',
		field: FeatureField.ForcedMovementPush,
		value: 1
	}));
	return hero;
};

const renderAbility = (id: typeof v1CensorLevel1AbilityIDs[number], hero = makeHero()) => {
	return {
		hero,
		...render(
			createElement(
				LocalizationProvider,
				null,
				createElement(LocaleToggle),
				createElement(AbilityPanel, { ability: getAbility(id), hero: hero, mode: PanelMode.Full })
			)
		)
	};
};

const toggleCalculation = () => fireEvent.click(screen.getByTitle(/^(自動計算傷害、效力等數值|Auto-calculate damage, potency, etc)$/));

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent || '');

const containsParagraph = (text: string) => screen.getByText((_content, element) => element?.tagName === 'P' && element.textContent?.includes(text));

const getLibraryAbility = (container: HTMLElement, id: string) => {
	const panel = container.querySelector(`#ability-${id}`);
	expect(panel).toBeTruthy();
	return panel as HTMLElement;
};

const expandLibraryAbilityGroups = () => {
	fireEvent.click(screen.getByRole('radio', { name: '招式' }));
	fireEvent.click(screen.getByText('招牌招式'));
	fireEvent.click(screen.getByText('5 費招式'));
};

afterEach(cleanup);

describe('V1 Censor Level 1 ability manifest', () => {
	it('enumerates exactly the fourteen approved live Censor abilities and their 92 authored identities', () => {
		const abilities = getV1CensorLevel1Abilities();

		expect(abilities.map(ability => ability.id)).toEqual(v1CensorLevel1AbilityIDs);
		expect(new Set(abilities.map(ability => ability.id)).size).toBe(14);
		expect(requiredIdentities).toHaveLength(92);
		expect(required[elementFieldIdentity('censor-1-4', 'name')]).toBe('Judgment');
		expect(required[elementFieldIdentity('censor-1-6', 'sections.1.name')]).toBe('Spend');
		expect(required[elementFieldIdentity('censor-ability-3', 'sections.0.roll.tier1')]).toBe('2 + M holy damage; P < [weak], slowed (save ends)');
	});

	it('has the exact packet split: 42 semantic fields and 50 mechanical target or power-roll fields', () => {
		const mechanicalEntries = censorCatalogEntries.filter(entry => (
			(entry.field === 'target') || entry.field.includes('.roll.tier')
		));
		const semanticEntries = censorCatalogEntries.filter(entry => !mechanicalEntries.includes(entry));

		expect(censorCatalogEntries).toHaveLength(92);
		expect(semanticEntries).toHaveLength(42);
		expect(mechanicalEntries).toHaveLength(50);
		expect(censorCatalogEntries.map(getEntryIdentity).sort()).toEqual(requiredIdentities);
		expect(censorCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(censorCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:censor-1-6/sections.1.name')?.zhTW).toBe('花費');
	});

	it('matches live canonical Censor English, has no missing or unapproved entries, and retains the unresolved parent domain', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.requiredCount).toBe(1184);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.complete).toBe(false);
	});

	it('projects Censor raw and calculated Power Roll values into zh-TW without sending localized text into AbilityLogic', () => {
		const hero = FactoryLogic.createHero();
		hero.class = FactoryLogic.createClass();
		hero.class.characteristics = FactoryLogic.createCharacteristics(2, 0, 0, 0, 1);
		hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
			id: 'censor-push-bonus',
			field: FeatureField.ForcedMovementPush,
			value: 1
		}));
		const halt = getAbility('censor-ability-3');
		const back = getAbility('censor-ability-1');
		const haltRaw = required[elementFieldIdentity(halt.id, 'sections.0.roll.tier1')];
		const backRaw = required[elementFieldIdentity(back.id, 'sections.0.roll.tier1')];
		const haltCalculated = AbilityLogic.getTierEffectCreature(haltRaw, 1, halt, undefined, hero);
		const backCalculated = AbilityLogic.getTierEffectCreature(backRaw, 1, back, undefined, hero);

		const haltZhTW = localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: halt.id,
			field: 'sections.0.roll.tier1',
			canonicalEnglish: haltRaw,
			calculatedEnglish: haltCalculated
		});
		const backZhTW = localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: back.id,
			field: 'sections.0.roll.tier1',
			canonicalEnglish: backRaw,
			calculatedEnglish: backCalculated
		});

		expect(haltRaw).toBe('2 + M holy damage; P < [weak], slowed (save ends)');
		expect(haltZhTW).toContain('4 神聖傷害');
		expect(haltZhTW).toContain('緩速');
		expect(backRaw).toBe('2 holy damage; push 1');
		expect(backCalculated).toContain('push 2');
		expect(backZhTW).toContain('推動 2');
		expect(localizePowerRollTierPresentation({
			locale: 'en',
			abilityID: back.id,
			field: 'sections.0.roll.tier1',
			canonicalEnglish: backRaw,
			calculatedEnglish: backCalculated
		})).toBe(backCalculated);
		expect(JSON.stringify(getAbility('censor-ability-3'))).toContain(haltRaw);
	});

	it('renders the approved production Censor Power Roll readings through actual Markdown and restores raw zh-TW', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const { container, hero } = renderAbility('censor-ability-3');
		const ability = getAbility('censor-ability-3');
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);

		// Calculated Halt uses the production catalog and actual Markdown, not a test fixture.
		expect(tierTexts(container)[0]).toContain('4 神聖傷害；氣場 < 0，緩速（豁免解除）');
		expect(screen.getAllByText('緩速', { selector: 'strong' })).toHaveLength(3);

		toggleCalculation();
		expect(tierTexts(container)[0]).toContain('2 + 力量神聖傷害；氣場 < [弱]，緩速（豁免解除）');
		expect(container.querySelectorAll('strong')).toHaveLength(0);

		toggleCalculation();
		fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
		expect(tierTexts(container)[0]).toContain('4 holy damage; P < 0 slowed (save ends)');
		expect(screen.getAllByText('slowed', { selector: 'strong' })).toHaveLength(3);

		toggleCalculation();
		expect(tierTexts(container)[0]).toContain('2 + M holy damage; P < [weak], slowed (save ends)');
		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ text ]) => expect(text).not.toMatch(/[\u4e00-\u9fff]/));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('projects the approved production Censor non-roll dynamic values and condition emphasis', () => {
		const hero = makeHero();

		const repent = renderAbility('censor-ability-8', hero);
		expect(repent.container.querySelector('.power-roll-row .effect')?.textContent).toContain('暈眩（豁免解除）');
		expect(screen.getAllByText('暈眩', { selector: 'strong' })).toHaveLength(3);
		repent.unmount();

		const back = renderAbility('censor-ability-1', hero);
		expect(tierTexts(back.container)[0]).toContain('推動 2');
		toggleCalculation();
		expect(tierTexts(back.container)[0]).toContain('推動 1');
		back.unmount();

		const gods = renderAbility('censor-ability-7', hero);
		containsParagraph('恢復 6 點體力');
		toggleCalculation();
		containsParagraph('恢復等於你復元值的體力');
		gods.unmount();

		const judgment = renderAbility('censor-1-4', hero);
		containsParagraph('對他造成 2 點神聖傷害');
		toggleCalculation();
		containsParagraph('對他造成等於你氣場 ×2 的神聖傷害');
		judgment.unmount();

		renderAbility('censor-ability-6', hero);
		containsParagraph('遁移最多 5 格');
		toggleCalculation();
		containsParagraph('遁移最多等於你速度的距離');
	});

	it('renders the approved production Censor Library readings without a Hero through actual Markdown', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const serializedClass = JSON.stringify(ClassData.censor);
		const { container } = render(
			createElement(
				LocalizationProvider,
				null,
				createElement(LocaleToggle),
				createElement(ClassPanel, { heroClass: ClassData.censor, sourcebooks: [], mode: PanelMode.Full })
			)
		);

		expandLibraryAbilityGroups();

		const halt = getLibraryAbility(container, 'censor-ability-3');
		expect(tierTexts(halt)[0]).toContain('2 + 力量神聖傷害；氣場 < [弱]，緩速（豁免解除）');
		expect(halt.querySelectorAll('strong')).toHaveLength(3);
		expect(halt.querySelector('strong')?.textContent).toBe('緩速');
		expect(halt.textContent).not.toMatch(/holy damage|slowed|save ends/);

		const arrest = getLibraryAbility(container, 'censor-ability-9');
		expect(tierTexts(arrest)[0]).toContain('6 + 力量神聖傷害；擒制');
		expect(arrest.querySelectorAll('strong')).toHaveLength(4);
		expect(arrest.querySelector('strong')?.textContent).toBe('擒制');
		expect(arrest.textContent).toContain('對他造成等於你氣場的神聖傷害');

		const behold = getLibraryAbility(container, 'censor-ability-10');
		expect(tierTexts(behold)[0]).toContain('3 + 力量神聖傷害；若目標的氣場 < [弱]');
		expect(behold.querySelectorAll('strong')).toHaveLength(4);
		expect(behold.querySelector('strong')?.textContent).toBe('畏縮');
		expect(behold.textContent).toContain('受到等於你氣場的心靈傷害');

		const purifyingFire = getLibraryAbility(container, 'censor-ability-12');
		expect(tierTexts(purifyingFire)[0]).toContain('5 + 力量神聖傷害；力量 < [弱]，目標獲得火焰弱點 3（豁免解除）');
		expect(purifyingFire.textContent).not.toMatch(/fire weakness|save ends/);

		fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
		expect(tierTexts(getLibraryAbility(container, 'censor-ability-3'))[0]).toContain('2 + M holy damage; P < [weak] slowed (save ends)');
		expect(getLibraryAbility(container, 'censor-ability-3').querySelectorAll('strong')).toHaveLength(3);

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(/[\u4e00-\u9fff]/));
		expect(JSON.stringify(ClassData.censor)).toBe(serializedClass);
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});
});
