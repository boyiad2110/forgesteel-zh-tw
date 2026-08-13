// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1FuryLevel1AbilityRequiredCanonicalEnglish,
	getV1FuryLevel1Abilities,
	v1FuryLevel1AbilityIDs,
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
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
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

const required = createV1FuryLevel1AbilityRequiredCanonicalEnglish();
const requiredIdentities = Object.keys(required).sort();
const furyCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	entry.kind === 'element-field'
		&& v1FuryLevel1AbilityIDs.includes(entry.elementID as typeof v1FuryLevel1AbilityIDs[number])
));

const getAbility = (id: typeof v1FuryLevel1AbilityIDs[number]) => {
	const ability = getV1FuryLevel1Abilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Fury ability '${id}' is missing`);
	}
	return ability;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(2, 0, 0, 0, 1);
	hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
		id: 'fury-production-slide-bonus',
		field: FeatureField.ForcedMovementSlide,
		value: 1
	}));
	return hero;
};

const renderAbility = (id: typeof v1FuryLevel1AbilityIDs[number], hero = makeHero()) => ({
	hero,
	...render(
		createElement(
			LocalizationProvider,
			null,
			createElement(LocaleToggle),
			createElement(AbilityPanel, { ability: getAbility(id), hero, mode: PanelMode.Full })
		)
	)
});

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
	fireEvent.click(screen.getByText('3 費招式'));
	fireEvent.click(screen.getByText('5 費招式'));
};

afterEach(cleanup);

describe('V1 Fury Level 1 ability manifest', () => {
	it('enumerates exactly the twelve approved live Fury abilities and their 80 authored identities', () => {
		const abilities = getV1FuryLevel1Abilities();

		expect(abilities.map(ability => ability.id)).toEqual(v1FuryLevel1AbilityIDs);
		expect(new Set(abilities.map(ability => ability.id)).size).toBe(12);
		expect(requiredIdentities).toHaveLength(80);
		expect(required[elementFieldIdentity('fury-ability-1', 'name')]).toBe('Brutal Slam');
		expect(required[elementFieldIdentity('fury-ability-6', 'sections.0.roll.tier1')]).toBe('3 + M damage; slide 2');
		expect(required[elementFieldIdentity('fury-ability-12', 'sections.1.name')]).toBe('Spend');
	});

	it('has the exact packet split: 36 semantic fields and 44 mechanical target or power-roll fields', () => {
		const mechanicalEntries = furyCatalogEntries.filter(entry => (
			entry.field.includes('.roll.tier')
				|| ((entry.field === 'target') && (entry.elementID !== 'fury-ability-7'))
		));
		const semanticEntries = furyCatalogEntries.filter(entry => !mechanicalEntries.includes(entry));

		expect(furyCatalogEntries).toHaveLength(80);
		expect(semanticEntries).toHaveLength(36);
		expect(mechanicalEntries).toHaveLength(44);
		expect(furyCatalogEntries.map(getEntryIdentity).sort()).toEqual(requiredIdentities);
		expect(furyCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(furyCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:fury-ability-9/description')?.zhTW).toBe('讓他們見識一下血流成河的慘狀。');
	});

	it('matches live canonical Fury English, has no missing or unapproved entries, and retains the unresolved parent domain', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.complete).toBe(false);
	});

	it('projects Fury Power Roll damage, slide, and conditions into zh-TW without sending localized text into AbilityLogic', () => {
		const hero = makeHero();
		const slam = getAbility('fury-ability-1');
		const outOfTheWay = getAbility('fury-ability-6');
		const slamRaw = required[elementFieldIdentity(slam.id, 'sections.0.roll.tier1')];
		const slideRaw = required[elementFieldIdentity(outOfTheWay.id, 'sections.0.roll.tier1')];
		const slamCalculated = AbilityLogic.getTierEffectCreature(slamRaw, 1, slam, undefined, hero);
		const slideCalculated = AbilityLogic.getTierEffectCreature(slideRaw, 1, outOfTheWay, undefined, hero);

		expect(slamCalculated).toContain('5 damage');
		expect(slideCalculated).toContain('slide 3');
		expect(localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: slam.id, field: 'sections.0.roll.tier1', canonicalEnglish: slamRaw, calculatedEnglish: slamCalculated })).toContain('5 傷害');
		expect(localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: outOfTheWay.id, field: 'sections.0.roll.tier1', canonicalEnglish: slideRaw, calculatedEnglish: slideCalculated })).toContain('滑動 3');
		expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: outOfTheWay.id, field: 'sections.0.roll.tier1', canonicalEnglish: slideRaw, calculatedEnglish: slideCalculated })).toBe(slideCalculated);
		expect(JSON.stringify(getAbility('fury-ability-6'))).toContain(slideRaw);
	});

	it('renders calculated and raw Fury Hero readings with approved zh-TW grammar and Markdown', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const outOfTheWay = renderAbility('fury-ability-6');
		const ability = getAbility('fury-ability-6');
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(outOfTheWay.hero);

		expect(tierTexts(outOfTheWay.container)[0]).toContain('5 傷害；滑動 3');
		toggleCalculation();
		expect(tierTexts(outOfTheWay.container)[0]).toContain('3 + 力量傷害；滑動 2');
		outOfTheWay.unmount();

		const tide = renderAbility('fury-ability-7');
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'fury-ability-7',
			field: 'sections.0.text',
			canonicalEnglish: required[elementFieldIdentity('fury-ability-7', 'sections.0.text')],
			calculatedEnglish: AbilityLogic.getTextEffect(required[elementFieldIdentity('fury-ability-7', 'sections.0.text')], tide.hero)
		})).toContain('直線移動最多 5 格');
		containsParagraph('直線移動最多 5 格');
		containsParagraph('額外受到 2 × 你在移動期間引發的藉機攻擊次數傷害');
		toggleCalculation();
		containsParagraph('直線移動最多等於你速度的距離');
		tide.unmount();

		const entrails = renderAbility('fury-ability-8');
		containsParagraph('目標會受到 2 點傷害');
		expect(screen.getAllByText('出血', { selector: 'strong' })).toHaveLength(4);
		entrails.unmount();

		const blood = renderAbility('fury-ability-9');
		expect(screen.getAllByText('出血', { selector: 'strong' })).toHaveLength(3);
		expect(screen.getAllByText('虛弱', { selector: 'strong' })).toHaveLength(3);
		blood.unmount();

		const end = renderAbility('fury-ability-12');
		expect(screen.getAllByText('瀕死', { selector: 'strong' })).toHaveLength(1);
		fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
		expect(tierTexts(end.container)[0]).toContain('9 damage');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ text ]) => expect(text).not.toMatch(/[\u4e00-\u9fff]/));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(outOfTheWay.hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders approved production Fury Library readings without a Hero through actual Markdown', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const serializedClass = JSON.stringify(ClassData.fury);
		const { container } = render(
			createElement(
				LocalizationProvider,
				null,
				createElement(LocaleToggle),
				createElement(ClassPanel, { heroClass: ClassData.fury, sourcebooks: [], mode: PanelMode.Full })
			)
		);

		expandLibraryAbilityGroups();
		const slam = getLibraryAbility(container, 'fury-ability-1');
		expect(tierTexts(slam)[0]).toContain('3 + 力量傷害；推動 1');
		const outOfTheWay = getLibraryAbility(container, 'fury-ability-6');
		expect(tierTexts(outOfTheWay)[0]).toContain('3 + 力量傷害；滑動 2');
		const tide = getLibraryAbility(container, 'fury-ability-7');
		expect(tide.textContent).toContain('直線移動最多等於你速度的距離');
		const blood = getLibraryAbility(container, 'fury-ability-9');
		expect(blood.querySelectorAll('strong')).toHaveLength(6);
		expect(blood.textContent).not.toMatch(/bleeding|weakened|save ends/);
		const end = getLibraryAbility(container, 'fury-ability-12');
		expect(end.querySelector('strong')?.textContent).toBe('瀕死');

		fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
		expect(tierTexts(getLibraryAbility(container, 'fury-ability-6'))[0]).toContain('3 + M damage; slide 2');
		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(/[\u4e00-\u9fff]/));
		expect(JSON.stringify(ClassData.fury)).toBe(serializedClass);
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});
});
