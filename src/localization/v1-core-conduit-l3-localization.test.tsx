// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { Ability } from '@/models/ability';
import { Feature } from '@/models/feature';
import { conduit } from '@/data/classes/conduit/conduit';
import { core } from '@/data/sourcebooks/official/core';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ConduitLevel2RequiredCanonicalEnglish, createV1ConduitLevel3RequiredCanonicalEnglish, getV1ConduitLevel3Abilities, v1ConduitLevel3AbilityIDs, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { createClassPresentationHarness, expectRendered, installResizeObserverStub, readFieldByLabelPrefix, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

installResizeObserverStub();

const approvedReadings = [
	[ 'element:conduit-3-1/name', '次級神蹟' ],
	[ 'element:conduit-3-1/description', '\n作為休整活動，你可以舉行宗教儀式，懇求諸神復活 1 個死亡的生物。該生物至少保有一半的遺體、死亡時間必須在 24 小時內，而且死因不能是老化造成。該生物的靈魂必須願意重返肉身，儀式才會生效。若靈魂不願返回，你會在開始休整活動時立刻察覺，並可以隨即停止。\n\n靈魂願意返回的生物會在休整結束時復活，並擁有完整體力與一半的復元力。你在該次休整結束時只會恢復一半的復元力。' ],
	[ 'element:conduit-3-2/name', '7 費招式' ],
	[ 'element:conduit-ability-17/name', '諸神懼相' ],
	[ 'element:conduit-ability-17/description', '你的神聖魔法能讓生物呈現出敵人最恐懼的模樣。' ],
	[ 'element:conduit-ability-17/target', '區域內的每個敵人' ],
	[ 'element:conduit-ability-17/sections.0.roll.tier1', '6 心靈傷害；`直覺` < [弱]，**畏縮**（豁免解除）' ],
	[ 'element:conduit-ability-17/sections.0.roll.tier2', '9 心靈傷害；`直覺` < [中]，**畏縮**（豁免解除）' ],
	[ 'element:conduit-ability-17/sections.0.roll.tier3', '13 心靈傷害；`直覺` < [強]，**畏縮**（豁免解除）' ],
	[ 'element:conduit-ability-17/sections.1.text', '每個目標都會對你或射程內由你選擇的 1 個生物陷入畏縮。' ],
	[ 'element:conduit-ability-18/name', '聖者法袍' ],
	[ 'element:conduit-ability-18/description', '盟友披上充滿力量的金色斗篷。' ],
	[ 'element:conduit-ability-18/target', '1 個盟友' ],
	[ 'element:conduit-ability-18/sections.0.text', '目標獲得 20 點臨時體力與 3 點鬥志。' ],
	[ 'element:conduit-ability-19/name', '汲魂術' ],
	[ 'element:conduit-ability-19/description', '一道能量束連結敵人與盟友，汲取前者生命並治癒後者。' ],
	[ 'element:conduit-ability-19/target', '1 個敵人' ],
	[ 'element:conduit-ability-19/sections.0.roll.tier1', '7 + `直覺`腐朽傷害' ],
	[ 'element:conduit-ability-19/sections.0.roll.tier2', '10 + `直覺`腐朽傷害' ],
	[ 'element:conduit-ability-19/sections.0.roll.tier3', '15 + `直覺`腐朽傷害' ],
	[ 'element:conduit-ability-19/sections.1.text', '射程內的 1 個盟友可以花費任意數量的復元力。' ],
	[ 'element:conduit-ability-20/name', '恩威箴言' ],
	[ 'element:conduit-ability-20/description', '聖者讓敵人看見痛苦的異象，並以治癒能量充盈盟友。' ],
	[ 'element:conduit-ability-20/target', '區域內的每個敵人' ],
	[ 'element:conduit-ability-20/sections.0.roll.tier1', '2 神聖傷害' ],
	[ 'element:conduit-ability-20/sections.0.roll.tier2', '5 神聖傷害' ],
	[ 'element:conduit-ability-20/sections.0.roll.tier3', '7 神聖傷害' ],
	[ 'element:conduit-ability-20/sections.1.text', '區域內的每個盟友都可以花費 1 點復元力。' ]
] as const;

const required = createV1ConduitLevel3RequiredCanonicalEnglish();
const levelTwoRequired = createV1ConduitLevel2RequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));
const levelThreeFeatures = conduit.featuresByLevel.find(level => level.level === 3)?.features || [];
const abilities = getV1ConduitLevel3Abilities();
const { renderFeature, renderAbility } = createClassPresentationHarness(conduit, [ core ]);

const getAbility = (id: string): Ability => {
	const ability = abilities.find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Conduit Level 3 ability '${id}' is missing`);
	}
	return ability;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...conduit, level: 3, characteristics: FactoryLogic.createCharacteristics(0, 0, 0, 2, 0) };
	return hero;
};

const tierReading = (abilityID: string, tier: number, hero?: ReturnType<typeof makeHero>) => {
	const ability = getAbility(abilityID);
	const field = `sections.0.roll.tier${tier}`;
	const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Core Conduit L3 manifest, catalog and presentation', () => {
	it('adds exactly the 28 frozen-packet identities and approved zh-TW readings', () => {
		const approvedIdentities = approvedReadings.map(([ identity ]) => identity);
		expect(approvedIdentities).toHaveLength(28);
		expect(new Set(approvedIdentities).size).toBe(28);
		expect(Object.keys(required).sort()).toEqual([ ...approvedIdentities ].sort());
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual([ ...approvedIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		approvedReadings.forEach(([ identity, zhTW ]) => expect(catalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW).toBe(zhTW));
		expect(required['element:conduit-3-1/description'].startsWith('\n')).toBe(true);
		expect(required['element:conduit-3-1/description'].split('\n\n')).toHaveLength(2);
		approvedIdentities.forEach(identity => expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(required[identity]));
	});

	it('uses the bounded Level 3 roots and exact cost-7 ability list without widening the slice', () => {
		const independentFeatures = extractLiveBoundedNonAbilityFeatureFields(levelThreeFeatures);
		expect(Object.keys(independentFeatures).sort()).toEqual([
			'element:conduit-3-1/description',
			'element:conduit-3-1/name',
			'element:conduit-3-2/name'
		]);
		expect(v1ConduitLevel3AbilityIDs).toEqual([ 'conduit-ability-17', 'conduit-ability-18', 'conduit-ability-19', 'conduit-ability-20' ]);
		expect(abilities.map(ability => ability.id)).toEqual([ ...v1ConduitLevel3AbilityIDs ]);
		expect(abilities.every(ability => ability.cost === 7)).toBe(true);
		expect(Object.keys(required).some(identity => identity.includes('conduit-ability-16') || identity.includes('conduit-ability-21'))).toBe(false);
		expect(Object.keys(required).some(identity => /^element:conduit-[4-9]-/.test(identity))).toBe(false);
		expect(Object.keys(required).every(identity => !(identity in levelTwoRequired))).toBe(true);
	});

	it('keeps the catalog complete while both parent content domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
	});

	it('presents Minor Miracle and 7pt Ability in zh-TW, then restores canonical English without mutation', () => {
		const miracle = levelThreeFeatures.find(feature => feature.id === 'conduit-3-1') as Feature;
		const choice = levelThreeFeatures.find(feature => feature.id === 'conduit-3-2') as Feature;
		const hero = makeHero();
		expect(AbilityLogic.getTextEffect(miracle.description, hero)).toBe(miracle.description);
		expect(AbilityLogic.getTextEffect(miracle.description, undefined)).toBe(miracle.description);

		const protectedFeature = protectCanonicalState({ label: 'Conduit Level 3 Minor Miracle', capture: () => JSON.stringify(miracle) });
		const protectedHero = protectCanonicalState({ label: 'Conduit Level 3 Hero', capture: () => JSON.stringify(hero) });
		const rendered = renderFeature(miracle, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedFeature, protectedHero ],
			assertZhTW: () => expectRendered(rendered.container, '懇求諸神復活 1 個死亡的生物。'),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(rendered.container, 'beseech the gods to restore a dead creature to life.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(rendered.container, '靈魂願意返回的生物會在休整結束時復活')
		});
		rendered.unmount();

		const choicePanel = renderFeature(choice, hero);
		expectRendered(choicePanel.container, '7 費招式');
		switchLocale();
		expectRendered(choicePanel.container, '7pt Ability');
	});

	it.each([
		{ abilityID: 'conduit-ability-17', tier: 2, noHero: '9 心靈傷害；`直覺` < [中]，****畏縮****（豁免解除）', hero: '9 心靈傷害；`直覺` < 1，****畏縮****（豁免解除）' },
		{ abilityID: 'conduit-ability-19', tier: 2, noHero: '10 + `直覺`腐朽傷害', hero: '12 腐朽傷害' },
		{ abilityID: 'conduit-ability-20', tier: 2, noHero: '5 神聖傷害', hero: '5 神聖傷害' }
	])('keeps $abilityID canonical-English-first on Hero and no-Hero Power Roll paths', ({ abilityID, tier, noHero, hero: heroReading }) => {
		expect(tierReading(abilityID, tier)).toBe(noHero);
		expect(tierReading(abilityID, tier, makeHero())).toBe(heroReading);

		const ability = getAbility(abilityID);
		const hero = makeHero();
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const canonicalEnglish = required[elementFieldIdentity(abilityID, `sections.0.roll.tier${tier}`)];
		const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
		const panel = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: `${abilityID} Ability`, capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Conduit Level 3 Power Roll Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expectRendered(panel.container, heroReading.replace(/[`*]/g, '')),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(panel.container, calculatedEnglish.replace(/[`*]/g, '')),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(panel.container, heroReading.replace(/[`*]/g, ''))
		});
		getTierEffectCreature.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTierEffectCreature.mockRestore();
	});

	it('renders Owner-approved Target quantities with 個, never 名', () => {
		[ 'conduit-ability-18', 'conduit-ability-19' ].forEach(id => {
			const panel = renderAbility(getAbility(id), makeHero());
			expect(readFieldByLabelPrefix(panel.container, '目標')).toMatch(/^1 個/);
			expect(panel.container.textContent).not.toContain('名');
			panel.unmount();
		});
	});
});
