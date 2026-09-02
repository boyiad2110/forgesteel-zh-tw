// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureAbility } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Ability } from '@/models/ability';
import { shadow } from '@/data/classes/shadow/shadow';
import { core } from '@/data/sourcebooks/official/core';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { createV1ShadowLevel3RequiredCanonicalEnglish, getV1ShadowLevel3Abilities, v1LocalizationManifest, v1ShadowLevel3AbilityIDs } from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { verifyApprovedTranslationsAgainstCatalog } from '@/localization/test-support/approved-translation-catalog-reconciliation';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));
installResizeObserverStub();

/** Explicit reviewed values, independent of the production manifest traversal. */
const approvedReadings = [
	[ 'element:shadow-3-1/name', '仔細觀察' ],
	[ 'element:shadow-3-1/description', '只要專注片刻，就能將敵人牢牢鎖在視線內。' ],
	[ 'element:shadow-3-1/sections.0.text', '只要你與目標之間的距離仍在此招式射程內、維持效果線，而且沒有先打擊其他生物，你下次對目標發動的打擊會獲得 1 點鬥志與 1 個優勢。' ],
	[ 'element:shadow-ability-13/name', '舞者' ],
	[ 'element:shadow-ability-13/description', '你行雲流水的動作讓人難以將你困住。' ],
	[ 'element:shadow-ability-13/sections.0.text', '直到遭遇結束前，每當敵人移動或被強制移動到與你相鄰的位置，或對你造成傷害時，你可以使用免費反應動作執行撤離移動動作。' ],
	[ 'element:shadow-ability-14/name', '誤導打擊' ],
	[ 'element:shadow-ability-14/description', '你幹麼看我？！' ],
	[ 'element:shadow-ability-14/sections.1.text', '目標被你 5 格內的 1 個自願盟友嘲諷，直到目標下個回合結束。' ],
	[ 'element:shadow-ability-15/name', '牽制射擊' ],
	[ 'element:shadow-ability-15/description', '彈道精準，力道十足。' ],
	[ 'element:shadow-ability-16/name', '踉蹌重擊' ],
	[ 'element:shadow-ability-16/description', '這下有你好受的了。' ],
	[ 'element:shadow-3-2/name', '7 費招式' ],
	[ 'element:shadow-3-1/target', '1 個生物' ],
	[ 'element:shadow-ability-13/target', '自身' ],
	[ 'element:shadow-ability-14/target', '1 個生物' ],
	[ 'element:shadow-ability-15/target', '1 個生物' ],
	[ 'element:shadow-ability-16/target', '1 個生物' ],
	[ 'element:shadow-ability-14/sections.0.roll.tier1', '9 + `敏捷`傷害' ],
	[ 'element:shadow-ability-14/sections.0.roll.tier2', '13 + `敏捷`傷害' ],
	[ 'element:shadow-ability-14/sections.0.roll.tier3', '18 + `敏捷`傷害' ],
	[ 'element:shadow-ability-15/sections.0.roll.tier1', '8 + `敏捷`傷害；`敏捷` < [弱]，束縛（豁免解除）' ],
	[ 'element:shadow-ability-15/sections.0.roll.tier2', '12 + `敏捷`傷害；`敏捷` < [中]，束縛（豁免解除）' ],
	[ 'element:shadow-ability-15/sections.0.roll.tier3', '16 + `敏捷`傷害；`敏捷` < [強]，束縛（豁免解除）' ],
	[ 'element:shadow-ability-16/sections.0.roll.tier1', '7 + `敏捷`傷害；`力量` < [弱]，緩速（豁免解除）' ],
	[ 'element:shadow-ability-16/sections.0.roll.tier2', '11 + `敏捷`傷害；`力量` < [中]，伏地且無法站起（豁免解除）' ],
	[ 'element:shadow-ability-16/sections.0.roll.tier3', '16 + `敏捷`傷害；`力量` < [強]，伏地且無法站起（豁免解除）' ]
] as const;

const levelThreeFeatures = shadow.featuresByLevel.find(level => level.level === 3)?.features || [];
const getRootAbility = () => {
	const feature = levelThreeFeatures.find((candidate): candidate is FeatureAbility => candidate.type === FeatureType.Ability);
	if (!feature) { throw new Error('Shadow Level 3 root Ability is missing'); }
	return feature.data.ability;
};
const extractAbilityFields = (ability: Ability): Record<string, string> => {
	const fields: Record<string, string> = {};
	const add = (field: string, value: string) => { if (value !== '') { fields[elementFieldIdentity(ability.id, field)] = value; } };
	add('name', ability.name); add('target', ability.target); add('description', ability.description);
	(ability.sections || []).forEach((section, index) => {
		if (section.type === 'text') { add(`sections.${index}.text`, section.text); }
		if (section.type === 'roll') { add(`sections.${index}.roll.tier1`, section.roll.tier1); add(`sections.${index}.roll.tier2`, section.roll.tier2); add(`sections.${index}.roll.tier3`, section.roll.tier3); }
	});
	return fields;
};
const required = createV1ShadowLevel3RequiredCanonicalEnglish();
const abilities = getV1ShadowLevel3Abilities();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => entry.kind === 'element-field' && required[getEntryIdentity(entry)] !== undefined);
const approvedZhTW = (identity: string) => approvedReadings.find(([ candidate ]) => candidate === identity)?.[1];
const { renderAbility } = createClassPresentationHarness(shadow, [ core ]);
const makeHero = () => createHeroWithClass(shadow, 3, FactoryLogic.createCharacteristics(2, 3, 0, 0, 0));

afterEach(cleanup);

describe('V1 Core Shadow L3 manifest, catalog and presentation', () => {
	it('matches the independent 28-identity live slice and exact approved readings', () => {
		const live = { ...extractAbilityFields(getRootAbility()) };
		levelThreeFeatures.filter(feature => feature.type !== FeatureType.Ability).forEach(feature => { live[elementFieldIdentity(feature.id, 'name')] = feature.name; });
		abilities.forEach(ability => Object.assign(live, extractAbilityFields(ability)));
		const identities = approvedReadings.map(([ identity ]) => identity).sort();
		expect(Object.keys(live).sort()).toEqual(identities);
		expect(Object.keys(required).sort()).toEqual(identities);
		expect(required).toEqual(live);
		expect(catalogEntries).toHaveLength(28);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(identities);
		expect(verifyApprovedTranslationsAgainstCatalog({ approvedTranslations: approvedReadings.map(([ identity, zhTW ]) => ({ identity, zhTW })), catalogEntries })).toMatchObject({ approvedRecordCount: 28, catalogEntryCount: 28, reconciledCount: 28, issues: [] });
		expect(catalogEntries.every(entry => entry.zhTW.includes('\uFFFD'))).toBe(false);
	});

	it('stays bound to the two roots and cost-7 abilities 13–16, excluding other Shadow and College content', () => {
		expect(levelThreeFeatures.map(feature => feature.id)).toEqual([ 'shadow-3-1', 'shadow-3-2' ]);
		expect(v1ShadowLevel3AbilityIDs).toEqual([ 'shadow-ability-13', 'shadow-ability-14', 'shadow-ability-15', 'shadow-ability-16' ]);
		expect(abilities.map(ability => ability.id)).toEqual([ ...v1ShadowLevel3AbilityIDs ]);
		expect(abilities.every(ability => ability.cost === 7)).toBe(true);
		expect(Object.keys(required).some(identity => /shadow-(?:[124-9]-|ability-(?:[1-9]|1[0-2]|1[789]|[2-9]\d)\/)/.test(identity))).toBe(false);
		shadow.subclasses.forEach(college => expect(college.featuresByLevel.find(level => level.level === 3)?.features).toEqual([]));
	});

	it('keeps integrity green while all five parent domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });
		expect(result.missing).toEqual([]); expect(result.unapproved).toEqual([]); expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual([ 'official-ability-authored-content', 'class-and-subclass-level-content', 'hero-creation-nested-authored-content', 'hero-sheet', 'hero-edit-semantic-keys' ]);
	});

	it('renders direct Careful Observation and Dancer readings across a locale round trip without canonical mutation', () => {
		const hero = makeHero();
		for (const ability of [ getRootAbility(), abilities[0] ]) {
			const protectedAbility = protectCanonicalState({ label: `${ability.id} canonical Ability`, capture: () => JSON.stringify(ability) });
			const protectedHero = protectCanonicalState({ label: 'Shadow Level 3 Hero', capture: () => JSON.stringify(hero) });
			const panel = renderAbility(ability, hero);
			verifyLocaleDifferentialInvariants({ protectedStates: [ protectedAbility, protectedHero ], assertZhTW: () => expectRendered(panel.container, approvedZhTW(elementFieldIdentity(ability.id, 'name')) as string), switchToEnglish: switchLocale, assertEnglish: () => expectRendered(panel.container, ability.name), switchToZhTW: switchLocale, assertZhTWAfterRoundTrip: () => expectRendered(panel.container, approvedZhTW(elementFieldIdentity(ability.id, 'description')) as string) });
			panel.unmount();
		}
	});

	it('uses existing calculated Power Roll and condition presentation for the expected ten identities', () => {
		const hero = makeHero();
		const tierSpy = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		for (const ability of abilities.slice(1)) { for (const tier of [ 1, 2, 3 ] as const) {
			const field = `sections.0.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity(ability.id, field)];
			assertCanonicalEnglishCalculationInput(canonicalEnglish);
			const raw = approvedZhTW(elementFieldIdentity(ability.id, field));
			const noHero = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
			expect(localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: ability.id, field, canonicalEnglish, calculatedEnglish: noHero })).toBe(raw?.replace(/束縛|緩速|伏地/g, '**$&**'));
			const withHero = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
			const projected = localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: ability.id, field, canonicalEnglish, calculatedEnglish: withHero });
			expect(projected).not.toMatch(/[A-Za-z]/);
			expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: ability.id, field, canonicalEnglish, calculatedEnglish: withHero })).toBe(withHero);
		} }
		const taunted = required['element:shadow-ability-14/sections.1.text'];
		const calculated = AbilityLogic.getTextEffect(taunted, hero);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'shadow-ability-14', field: 'sections.1.text', canonicalEnglish: taunted, calculatedEnglish: calculated })).toContain('嘲諷');
		expect(tierSpy.mock.calls.length).toBe(18);
		tierSpy.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		tierSpy.mockRestore();
	});

	it('fails closed for an unsupported calculated authored rewrite', () => {
		const canonicalEnglish = required['element:shadow-ability-14/sections.1.text'];
		const unsupported = `${AbilityLogic.getTextEffect(canonicalEnglish, makeHero())} They fall prone.`;
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'shadow-ability-14', field: 'sections.1.text', canonicalEnglish, calculatedEnglish: unsupported })).toBe(unsupported);
	});
});
