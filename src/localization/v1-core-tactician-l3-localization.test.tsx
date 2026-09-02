// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { Ability } from '@/models/ability';
import { Feature } from '@/models/feature';
import { tactician } from '@/data/classes/tactician/tactician';
import { core } from '@/data/sourcebooks/official/core';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { createV1TacticianLevel3RequiredCanonicalEnglish, getV1TacticianLevel3Abilities, v1TacticianLevel3AbilityIDs } from '@/localization/v1-localization-manifest';
import { verifyApprovedTranslationsAgainstCatalog } from '@/localization/test-support/approved-translation-catalog-reconciliation';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));
installResizeObserverStub();

/** Frozen packet r1 Owner Final readings, deliberately independent of manifest traversal. */
const approvedReadings = [
	[ 'element:tactician-3-1/name', '自亂陣腳' ],
	[ 'element:tactician-3-1/description', '戰鬥還沒開始，敵人就已經跟不上你的戰術節奏。當遭遇開始時，即使你處於措手不及，你也可以使用免費反應動作，對 1 個在你效果線內的敵人發動【標記】招式。然後，你可以將被標記的目標滑動最多 3 格（無視穩度），前提是這次移動不會讓目標受到傷害（例如越過懸崖）、陷入瀕死，或承受狀態或其他負面效果。' ],
	[ 'element:tactician-ability-9/name', '正面突擊' ],
	[ 'element:tactician-ability-9/description', '衝鋒的目的，就是擊潰敵人的士氣並迫使他們撤退。' ],
	[ 'element:tactician-ability-9/sections.0.text', '直到遭遇結束或你陷入瀕死前，當你或任何盟友在回合中首次對被你標記的目標造成傷害時，造成傷害的生物可以推動目標最多 2 格，然後遁移最多 2 格。此外，當任何盟友對被你標記的生物發動衝鋒主要動作時，他可以使用近戰打擊招牌招式或近戰打擊英雄招式，取代近戰基礎打擊。' ],
	[ 'element:tactician-ability-10/name', '痛擊！' ],
	[ 'element:tactician-ability-10/description', '你的盟友都看得出，攻擊你所選定的目標有多麼有利。' ],
	[ 'element:tactician-ability-10/sections.0.text', '直到遭遇結束或你陷入瀕死前，每當你或任何盟友對被你標記的目標造成傷害時，造成傷害的生物會獲得 2 點鬥志，並可以立刻使用。' ],
	[ 'element:tactician-ability-11/name', '擊潰' ],
	[ 'element:tactician-ability-11/description', '戰局開始逆轉了。' ],
	[ 'element:tactician-ability-11/sections.0.text', '直到遭遇結束或你陷入瀕死前，每當你或任何盟友對被你標記且 `理智` < [中] 的目標造成傷害時，目標會對造成傷害的生物陷入畏縮（豁免解除）。' ],
	[ 'element:tactician-ability-12/name', '堅持到底！' ],
	[ 'element:tactician-ability-12/description', '我們可以的！要有信心，撐住！' ],
	[ 'element:tactician-ability-12/sections.0.text', '直到遭遇結束或你陷入瀕死前，每當你或任何盟友對被你標記的目標造成傷害時，造成傷害的生物可以花費 1 點復元力。' ],
	[ 'element:tactician-3-2/name', '7 費招式' ],
	[ 'element:tactician-ability-9/target', '自身' ],
	[ 'element:tactician-ability-10/target', '自身' ],
	[ 'element:tactician-ability-11/target', '自身' ],
	[ 'element:tactician-ability-12/target', '自身' ]
] as const;

const levelThreeFeatures = tactician.featuresByLevel.find(level => level.level === 3)?.features || [];
const abilities = getV1TacticianLevel3Abilities();
const required = createV1TacticianLevel3RequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => entry.kind === 'element-field' && required[getEntryIdentity(entry)] !== undefined);
const { renderAbility, renderFeature } = createClassPresentationHarness(tactician, [ core ]);
const makeHero = () => createHeroWithClass(tactician, 3, FactoryLogic.createCharacteristics(2, 3, 0, 0, 0));

const extractFeatureFields = (feature: Feature): Record<string, string> => {
	const fields: Record<string, string> = { [elementFieldIdentity(feature.id, 'name')]: feature.name };
	if (feature.description !== '') { fields[elementFieldIdentity(feature.id, 'description')] = feature.description; }
	return fields;
};

const extractAbilityFields = (ability: Ability): Record<string, string> => {
	const fields: Record<string, string> = {};
	const add = (field: string, value: string) => { if (value !== '') { fields[elementFieldIdentity(ability.id, field)] = value; } };
	add('name', ability.name); add('target', ability.target); add('description', ability.description);
	ability.sections.forEach((section, index) => { if (section.type === 'text') { add(`sections.${index}.text`, section.text); } });
	return fields;
};

afterEach(cleanup);

describe('V1 Core Tactician L3 manifest, catalog and presentation', () => {
	it('matches the independent 19-identity live slice and frozen r1 catalog readings', () => {
		const live = Object.assign({}, ...levelThreeFeatures.map(extractFeatureFields), ...abilities.map(extractAbilityFields));
		const identities = approvedReadings.map(([ identity ]) => identity).sort();
		expect(Object.keys(live).sort()).toEqual(identities);
		expect(Object.keys(required).sort()).toEqual(identities);
		expect(required).toEqual(live);
		expect(catalogEntries).toHaveLength(19);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(identities);
		expect(verifyApprovedTranslationsAgainstCatalog({ approvedTranslations: approvedReadings.map(([ identity, zhTW ]) => ({ identity, zhTW })), catalogEntries })).toMatchObject({ approvedRecordCount: 19, catalogEntryCount: 19, reconciledCount: 19, issues: [] });
		expect(catalogEntries.some(entry => entry.zhTW.includes('\uFFFD'))).toBe(false);
	});

	it('stays bound to Level 3 roots and abilities 9–12, excluding other levels and Doctrine L3 content', () => {
		expect(levelThreeFeatures.map(feature => feature.id)).toEqual([ 'tactician-3-1', 'tactician-3-2' ]);
		expect(v1TacticianLevel3AbilityIDs).toEqual([ 'tactician-ability-9', 'tactician-ability-10', 'tactician-ability-11', 'tactician-ability-12' ]);
		expect(abilities.map(ability => ability.id)).toEqual([ ...v1TacticianLevel3AbilityIDs ]);
		expect(abilities.every(ability => ability.cost === 7)).toBe(true);
		expect(Object.keys(required).some(identity => /element:tactician-(?:[124-9]-|ability-(?:[1-8]|1[3-9]|[2-9]\d))\//.test(identity))).toBe(false);
		tactician.subclasses.forEach(doctrine => expect(doctrine.featuresByLevel.find(level => level.level === 3)?.features).toEqual([]));
	});

	it('renders Out of Position, the 7-point selector, and Frontal Assault across a locale round trip without canonical mutation', () => {
		const outOfPosition = levelThreeFeatures[0];
		const selector = levelThreeFeatures[1];
		const ability = abilities[0];
		const hero = makeHero();
		const protectedState = protectCanonicalState({ label: 'Tactician Level 3 canonical data', capture: () => JSON.stringify({ levelThreeFeatures, ability, hero }) });
		const featurePanel = renderFeature(outOfPosition);
		expectRendered(featurePanel.container, '自亂陣腳');
		expectRendered(featurePanel.container, '戰鬥還沒開始');
		featurePanel.unmount();
		const selectorPanel = renderFeature(selector);
		expectRendered(selectorPanel.container, '7 費招式');
		selectorPanel.unmount();
		const panel = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedState ],
			assertZhTW: () => expectRendered(panel.container, '正面突擊'),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(panel.container, 'Frontal Assault'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(panel.container, '衝鋒的目的')
		});
		panel.unmount();
	});

	it('uses the existing calculated condition presentation for Rout and fails closed on an unsupported rewrite', () => {
		const canonicalEnglish = required['element:tactician-ability-11/sections.0.text'];
		const hero = makeHero();
		assertCanonicalEnglishCalculationInput(canonicalEnglish);
		const noHero = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
		const noHeroLocalized = localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'tactician-ability-11', field: 'sections.0.text', canonicalEnglish, calculatedEnglish: noHero });
		expect(noHeroLocalized).toBe(approvedReadings.find(([ identity ]) => identity === 'element:tactician-ability-11/sections.0.text')?.[1]);
		const calculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		const value = calculated.match(/R < (-?\d+)/)?.[1];
		expect(value).toBeDefined();
		const localized = localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'tactician-ability-11', field: 'sections.0.text', canonicalEnglish, calculatedEnglish: calculated });
		expect(localized).toContain(`\`理智\` < ${value}`);
		expect(localized).toContain('**畏縮**（豁免解除）');
		expect(localized).not.toMatch(/[A-Za-z]/);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'en', elementID: 'tactician-ability-11', field: 'sections.0.text', canonicalEnglish, calculatedEnglish: calculated })).toBe(calculated);
		const rout = abilities.find(ability => ability.id === 'tactician-ability-11') as Ability;
		const protectedAbility = protectCanonicalState({ label: 'Rout canonical Ability', capture: () => JSON.stringify(rout) });
		const protectedHero = protectCanonicalState({ label: 'Rout Hero', capture: () => JSON.stringify(hero) });
		const panel = renderAbility(rout, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: () => expectRendered(panel.container, `理智 < ${value}`),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(panel.container, `R < ${value}`),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(panel.container, `理智 < ${value}`)
		});
		panel.unmount();
		const unsupported = `${calculated} They fall prone.`;
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'tactician-ability-11', field: 'sections.0.text', canonicalEnglish, calculatedEnglish: unsupported })).toBe(unsupported);
	});
});
