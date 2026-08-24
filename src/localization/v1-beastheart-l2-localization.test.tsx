// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { Ability } from '@/models/ability';
import { Feature } from '@/models/feature';
import { SubClass } from '@/models/subclass';
import { beastheart } from '@/data/classes/beastheart/beastheart';
import { core } from '@/data/sourcebooks/official/core';
import { beastheartSourcebook } from '@/data/sourcebooks/official/beastheart';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1BeastheartLevel1BaseAbilityRequiredCanonicalEnglish, createV1BeastheartLevel1BaseCompletionRequiredCanonicalEnglish, createV1BeastheartLevel1WildNatureRequiredCanonicalEnglish, createV1BeastheartLevel2RequiredCanonicalEnglish, getV1BeastheartWildNatureSubclasses, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { createClassPresentationHarness, expectRendered, installResizeObserverStub, readFieldByLabelPrefix, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

installResizeObserverStub();

/**
 * The approved slice, transcribed from packet `beastheart-l2` revision r2 rather than generated
 * from the manifest builder under test, so a change to that builder cannot silently redefine
 * what this slice is expected to contain.
 */
const approvedSliceIdentities = [
	'element:beastheart-2-1/name',
	'element:beastheart-2-2/name',
	'element:beastheart-2-2/description',
	'element:beastheart-sub-1-2-1b/name',
	'element:beastheart-sub-1-2-1b/description',
	'element:beastheart-sub-1-2-2/name',
	'element:beastheart-sub-1-2-2a/name',
	'element:beastheart-sub-1-2-2a/target',
	'element:beastheart-sub-1-2-2a/description',
	'element:beastheart-sub-1-2-2a/sections.0.name',
	'element:beastheart-sub-1-2-2a/sections.0.effect',
	'element:beastheart-sub-1-2-2a/sections.1.roll.tier1',
	'element:beastheart-sub-1-2-2a/sections.1.roll.tier2',
	'element:beastheart-sub-1-2-2a/sections.1.roll.tier3',
	'element:beastheart-sub-1-2-2a/sections.2.text',
	'element:beastheart-sub-1-2-2b/name',
	'element:beastheart-sub-1-2-2b/target',
	'element:beastheart-sub-1-2-2b/description',
	'element:beastheart-sub-1-2-2b/sections.0.text',
	'element:beastheart-sub-1-2-2b/sections.1.roll.tier1',
	'element:beastheart-sub-1-2-2b/sections.1.roll.tier2',
	'element:beastheart-sub-1-2-2b/sections.1.roll.tier3',
	'element:beastheart-sub-1-2-2b/sections.2.text',
	'element:beastheart-sub-2-2-1b/name',
	'element:beastheart-sub-2-2-1b/description',
	'element:beastheart-sub-2-2-2/name',
	'element:beastheart-sub-2-2-2a/name',
	'element:beastheart-sub-2-2-2a/target',
	'element:beastheart-sub-2-2-2a/description',
	'element:beastheart-sub-2-2-2a/sections.0.name',
	'element:beastheart-sub-2-2-2a/sections.0.effect',
	'element:beastheart-sub-2-2-2a/sections.1.text',
	'element:beastheart-sub-2-2-2a/sections.2.roll.tier1',
	'element:beastheart-sub-2-2-2a/sections.2.roll.tier2',
	'element:beastheart-sub-2-2-2a/sections.2.roll.tier3',
	'element:beastheart-sub-2-2-2b/name',
	'element:beastheart-sub-2-2-2b/target',
	'element:beastheart-sub-2-2-2b/description',
	'element:beastheart-sub-2-2-2b/sections.0.roll.tier1',
	'element:beastheart-sub-2-2-2b/sections.0.roll.tier2',
	'element:beastheart-sub-2-2-2b/sections.0.roll.tier3',
	'element:beastheart-sub-2-2-2b/sections.1.text',
	'element:beastheart-sub-3-2-1b/name',
	'element:beastheart-sub-3-2-1b/target',
	'element:beastheart-sub-3-2-1b/description',
	'element:beastheart-sub-3-2-1b/type.trigger',
	'element:beastheart-sub-3-2-1b/sections.0.text',
	'element:beastheart-sub-3-2-1b/sections.1.name',
	'element:beastheart-sub-3-2-1b/sections.1.effect',
	'element:beastheart-sub-3-2-2/name',
	'element:beastheart-sub-3-2-2a/name',
	'element:beastheart-sub-3-2-2a/target',
	'element:beastheart-sub-3-2-2a/description',
	'element:beastheart-sub-3-2-2a/sections.0.roll.tier1',
	'element:beastheart-sub-3-2-2a/sections.0.roll.tier2',
	'element:beastheart-sub-3-2-2a/sections.0.roll.tier3',
	'element:beastheart-sub-3-2-2a/sections.1.text',
	'element:beastheart-sub-3-2-2b/name',
	'element:beastheart-sub-3-2-2b/target',
	'element:beastheart-sub-3-2-2b/description',
	'element:beastheart-sub-3-2-2b/sections.0.text',
	'element:beastheart-sub-4-2-1b/name',
	'element:beastheart-sub-4-2-1b/description',
	'element:beastheart-sub-4-2-2/name',
	'element:beastheart-sub-4-2-2a/name',
	'element:beastheart-sub-4-2-2a/target',
	'element:beastheart-sub-4-2-2a/description',
	'element:beastheart-sub-4-2-2a/sections.0.roll.tier1',
	'element:beastheart-sub-4-2-2a/sections.0.roll.tier2',
	'element:beastheart-sub-4-2-2a/sections.0.roll.tier3',
	'element:beastheart-sub-4-2-2a/sections.1.name',
	'element:beastheart-sub-4-2-2a/sections.1.effect',
	'element:beastheart-sub-4-2-2b/name',
	'element:beastheart-sub-4-2-2b/target',
	'element:beastheart-sub-4-2-2b/description',
	'element:beastheart-sub-4-2-2b/sections.0.roll.tier1',
	'element:beastheart-sub-4-2-2b/sections.0.roll.tier2',
	'element:beastheart-sub-4-2-2b/sections.0.roll.tier3',
	'element:beastheart-sub-4-2-2b/sections.1.text'
];

const required = createV1BeastheartLevel2RequiredCanonicalEnglish();
const baseAbilityRequired = createV1BeastheartLevel1BaseAbilityRequiredCanonicalEnglish();
const baseCompletionRequired = createV1BeastheartLevel1BaseCompletionRequiredCanonicalEnglish();
const wildNatureRequired = createV1BeastheartLevel1WildNatureRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const subclasses = getV1BeastheartWildNatureSubclasses();

const levelTwoFeatures = (owner: { featuresByLevel: { level: number, features: Feature[] }[] }) => owner.featuresByLevel.find(level => level.level === 2)?.features || [];

const getSubclass = (id: string): SubClass => {
	const subclass = subclasses.find(candidate => candidate.id === id);
	if (!subclass) {
		throw new Error(`Beastheart Wild Nature subclass '${id}' is missing`);
	}
	return subclass;
};

/** The Level 2 Abilities of one subclass, reached through the same bounded descent the slice uses. */
const collectLevelTwoAbilities = (features: Feature[], abilities: Ability[] = []): Ability[] => {
	features.forEach(feature => {
		switch (feature.type) {
			case FeatureType.Ability:
				abilities.push(feature.data.ability);
				break;
			case FeatureType.Choice:
				collectLevelTwoAbilities(feature.data.options.map(option => option.feature), abilities);
				break;
			case FeatureType.Multiple:
				collectLevelTwoAbilities(feature.data.features, abilities);
				break;
		}
	});
	return abilities;
};

const getAbility = (abilityID: string): Ability => {
	const ability = subclasses.flatMap(subclass => collectLevelTwoAbilities(levelTwoFeatures(subclass))).find(candidate => candidate.id === abilityID);
	if (!ability) {
		throw new Error(`Beastheart Level 2 ability '${abilityID}' is missing`);
	}
	return ability;
};

const getBaseClassFeature = (featureID: string): Feature => {
	const feature = levelTwoFeatures(beastheart).find(candidate => candidate.id === featureID);
	if (!feature) {
		throw new Error(`Beastheart Feature '${featureID}' is missing`);
	}
	return feature;
};

const getFeature = (subclassID: string, featureID: string): Feature => {
	const feature = levelTwoFeatures(getSubclass(subclassID)).find(candidate => candidate.id === featureID);
	if (!feature) {
		throw new Error(`Beastheart Feature '${featureID}' is missing`);
	}
	return feature;
};

/**
 * Might 2 drives the `+ M` damage and the `1 + your Might score` push, Intuition 3 the
 * `+ I` damage and the second whip's extra damage, so no two projected values in this slice are
 * confusable. AbilityLogic derives potency from the highest characteristic, which is Intuition
 * here, giving weak 1 / average 2 / strong 3 - including for the Presence-worded `P <` tiers.
 */
const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...beastheart, level: 2, characteristics: FactoryLogic.createCharacteristics(2, 1, 0, 3, 1) };
	return hero;
};

const { renderFeature, renderAbility } = createClassPresentationHarness(beastheart, [ core, beastheartSourcebook ]);

const textReading = (elementID: string, field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: elementID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const tierReading = (abilityID: string, sectionIndex: number, tier: number, hero?: ReturnType<typeof makeHero>) => {
	const ability = getAbility(abilityID);
	const field = `sections.${sectionIndex}.roll.tier${tier}`;
	const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
	// Every ability in this slice authors exactly one distance, so PowerRollPanel leaves its
	// distance selection undefined - which is the production input this reading is calculated with.
	expect(ability.distance).toHaveLength(1);
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Beastheart Level 2 catalog and presentation', () => {
	it('adds exactly the approved 79-identity manifest and catalog slice', () => {
		expect(approvedSliceIdentities).toHaveLength(79);
		expect(new Set(approvedSliceIdentities).size).toBe(79);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());

		const catalogIdentities = catalogEntries.map(getEntryIdentity);
		expect(catalogIdentities).toHaveLength(79);
		expect(new Set(catalogIdentities).size).toBe(79);
		expect(catalogIdentities.slice().sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(catalogEntries.every(entry => entry.zhTW === entry.zhTW.trim())).toBe(true);

		// Every one of the 79 reaches the production manifest as its own required identity.
		const manifestRequired = v1LocalizationManifest.requiredCanonicalEnglish;
		approvedSliceIdentities.forEach(identity => expect(manifestRequired[identity]).toBe(required[identity]));
	});

	it('stays disjoint from all three prior Beastheart slices', () => {
		expect(Object.keys(baseAbilityRequired)).toHaveLength(83);
		expect(Object.keys(baseCompletionRequired)).toHaveLength(41);
		expect(Object.keys(wildNatureRequired)).toHaveLength(77);

		Object.keys(required).forEach(identity => {
			expect(Object.prototype.hasOwnProperty.call(baseAbilityRequired, identity)).toBe(false);
			expect(Object.prototype.hasOwnProperty.call(baseCompletionRequired, identity)).toBe(false);
			expect(Object.prototype.hasOwnProperty.call(wildNatureRequired, identity)).toBe(false);
		});
	});

	it('agrees with an independent bounded walk of each Level 2 tree', () => {
		// The base class contributes the Perk's name plus Everyone's Best Friend's name and
		// description; neither Level 2 root is an Ability, so the walk sees all three.
		const baseWalked = extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(beastheart));
		expect(Object.keys(baseWalked)).toHaveLength(3);
		expect(Object.keys(baseWalked).every(identity => required[identity] === baseWalked[identity])).toBe(true);

		// Guardian, Prowler and Spark each author a plain Feature and an ability Choice, giving
		// three readings. Punisher authors a root Ability instead, which the walk stops at, so it
		// contributes only its Choice label - and its Ability arrives through the collector below.
		const expectedWalkedCount: Record<string, number> = {
			'beastheart-sub-1': 3,
			'beastheart-sub-2': 3,
			'beastheart-sub-3': 1,
			'beastheart-sub-4': 3
		};

		subclasses.forEach(subclass => {
			const independentlyWalked = extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(subclass));
			expect(Object.keys(independentlyWalked)).toHaveLength(expectedWalkedCount[subclass.id]);
			expect(Object.keys(independentlyWalked).every(identity => required[identity] === independentlyWalked[identity])).toBe(true);

			// The walk stops at Ability nodes, so no Level 2 ability is counted or walked by it.
			collectLevelTwoAbilities(levelTwoFeatures(subclass)).forEach(ability => {
				expect(independentlyWalked[elementFieldIdentity(ability.id, 'name')]).toBeUndefined();
				expect(required[elementFieldIdentity(ability.id, 'name')]).toBe(ability.name);
			});
		});

		// Punisher's root Ability is reached exactly as the Choice options are.
		expect(collectLevelTwoAbilities(levelTwoFeatures(getSubclass('beastheart-sub-3'))).map(ability => ability.id))
			.toEqual([ 'beastheart-sub-3-2-1b', 'beastheart-sub-3-2-2a', 'beastheart-sub-3-2-2b' ]);
	});

	it('leaves Level 1, Level 3+, Companion and Summon records and abilities 13+ outside the slice', () => {
		expect(Object.keys(required).some(identity => identity.includes('beastheart-companion'))).toBe(false);
		expect(Object.keys(required).some(identity => identity.includes('summon'))).toBe(false);
		expect(Object.keys(required).some(identity => /^element:beastheart-ability-\d+\//.test(identity))).toBe(false);
		// Subclass metadata belongs to the completed Level 1 Wild Nature slice, not to this one.
		subclasses.forEach(subclass => expect(Object.keys(required).some(identity => identity.startsWith(`element:${subclass.id}/`))).toBe(false));

		[ beastheart, ...subclasses ].forEach(owner => {
			owner.featuresByLevel.filter(level => level.level !== 2).forEach(level => {
				level.features.forEach(feature => {
					expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
				});
			});
		});
	});

	it('keeps localization integrity healthy while the parent domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('renders the base class Level 2 features in approved zh-TW and restores canonical English', () => {
		const bestFriend = getBaseClassFeature('beastheart-2-2');
		const serialized = JSON.stringify(bestFriend);
		const { container } = renderFeature(bestFriend, makeHero());

		expectRendered(container, '最棒的朋友');
		expectRendered(container, '在蒙太奇考驗中，每輪 1 次，當你或其他角色進行考驗時，你的契獸可以讓檢定結果提高 1 階（最高至 T3）。');

		switchLocale();

		expectRendered(container, 'Everyone’s Best Friend');
		expectRendered(container, 'Once per round during a montage test');
		expect(JSON.stringify(bestFriend)).toBe(serialized);
	});

	it.each([
		{ subclassID: 'beastheart-sub-1', featureID: 'beastheart-sub-1-2-1b', zhTW: '你和契獸都不會陷入措手不及。', canonical: 'You and your companion can’t be surprised.' },
		{ subclassID: 'beastheart-sub-2', featureID: 'beastheart-sub-2-2-1b', zhTW: '當 1 個生物與你的契獸相鄰時，對你的契獸而言，該生物無法隱藏自己，也無法具有遮蔽。', canonical: 'that creature can’t be hidden or have concealment' },
		{ subclassID: 'beastheart-sub-4', featureID: 'beastheart-sub-4-2-1b', zhTW: '每當你或契獸造成寒冷、火焰、閃電、音波或無類型傷害時，你可以將該傷害的類型改為寒冷、火焰、閃電或音波傷害。', canonical: 'you can change the damage type to cold, fire, lightning, or sonic damage' }
	])('renders $featureID in approved zh-TW and restores canonical English', ({ subclassID, featureID, zhTW, canonical }) => {
		const feature = getFeature(subclassID, featureID);
		const serialized = JSON.stringify(feature);
		const { container } = renderFeature(feature, makeHero());

		expectRendered(container, zhTW);
		expect(container.textContent).not.toContain(canonical);

		switchLocale();

		expectRendered(container, canonical);
		expect(JSON.stringify(feature)).toBe(serialized);
	});

	it('renders each subclass ability-choice label in approved zh-TW', () => {
		([
			[ 'beastheart-sub-1', 'beastheart-sub-1-2-2', '守護招式', 'Guardian Ability' ],
			[ 'beastheart-sub-2', 'beastheart-sub-2-2-2', '獵殺招式', 'Prowler Ability' ],
			[ 'beastheart-sub-3', 'beastheart-sub-3-2-2', '制裁招式', 'Punisher Ability' ],
			[ 'beastheart-sub-4', 'beastheart-sub-4-2-2', '星火招式', 'Spark Ability' ]
		] as const).forEach(([ subclassID, featureID, zhTW, canonical ]) => {
			const rendered = renderFeature(getFeature(subclassID, featureID));
			expectRendered(rendered.container, zhTW);
			expect(rendered.container.textContent).not.toContain(canonical);
			rendered.unmount();
		});
	});

	it('renders Omnomnom’s authored shape, including its leading-newline section identity', () => {
		const ability = getAbility('beastheart-sub-1-2-2a');
		const serialized = JSON.stringify(ability);

		// The canonical reading really does begin with one newline, and the catalog snapshots it
		// exactly; the approved zh-TW carries its own authored shape without one.
		const canonicalSectionText = required[elementFieldIdentity('beastheart-sub-1-2-2a', 'sections.2.text')];
		expect(canonicalSectionText.startsWith('\n')).toBe(true);
		const entry = catalogEntries.find(candidate => (candidate.elementID === 'beastheart-sub-1-2-2a') && (candidate.field === 'sections.2.text'));
		expect(entry?.canonicalEnglish).toBe(canonicalSectionText);
		expect(entry?.zhTW.startsWith('\n')).toBe(false);

		const { container } = renderAbility(ability);
		expectRendered(container, '嗯姆嗯姆');
		expectRendered(container, '你嘴裡叼著什麼？不行！壞孩子！');
		expect(readFieldByLabelPrefix(container, '目標')).toBe('1 個生物');
		expectRendered(container, '特殊');

		switchLocale();

		expectRendered(container, 'Omnomnom');
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('projects Omnomnom’s Special condition emphasis on both the Hero and Library paths', () => {
		// The shared condition projector adds only the emphasis AbilityLogic introduced.
		expect(textReading('beastheart-sub-1-2-2a', 'sections.0.effect')).toBe('此招式只能指定處於**擒制**且體型 ≦ 契獸的生物為目標。');
		expect(textReading('beastheart-sub-1-2-2a', 'sections.0.effect', makeHero())).toBe('此招式只能指定處於**擒制**且體型 ≦ 契獸的生物為目標。');

		// Fetch!'s closing section carries the same grammar twice in one reading.
		const fetchText = '進行檢定後，你的契獸可以帶著被**擒制**的生物或持有的物體一起傳送，前提是該生物或物體能容身於目的地。被**擒制**的生物或持有物體會傳送至契獸相鄰的 1 個方格（由你決定）。';
		expect(textReading('beastheart-sub-1-2-2b', 'sections.2.text')).toBe(fetchText);
		expect(textReading('beastheart-sub-1-2-2b', 'sections.2.text', makeHero())).toBe(fetchText);
	});

	it('renders This One’s Yours’ approved trigger and Spend readings', () => {
		const ability = getAbility('beastheart-sub-3-2-1b');
		const { container } = renderAbility(ability);

		expectRendered(container, '燙手山芋');
		expectRendered(container, '當 1 個被其他生物強制移動的生物進入與你相鄰的空間時。');
		expectRendered(container, '花費');
		expectRendered(container, '你和契獸可以在同個回合中各自使用此免費反應動作。');
	});

	it.each([
		{
			label: 'This One’s Yours 1 + Might push',
			elementID: 'beastheart-sub-3-2-1b',
			field: 'sections.0.text',
			rawZhTW: '你可以將該生物推動最多等於 1 + 你`力量`的格數。',
			heroZhTW: '你可以將該生物推動最多 3 格。',
			heroEnglish: 'push the creature up to a number of squares equal to 3.'
		},
		{
			label: 'Burning Lash second-whip Intuition damage',
			elementID: 'beastheart-sub-4-2-2a',
			field: 'sections.1.effect',
			rawZhTW: '額外造成等於你`直覺`的火焰或閃電傷害。',
			heroZhTW: '額外造成 3 點火焰或閃電傷害。',
			heroEnglish: 'dealing extra fire or lightning damage equal to 3.'
		}
	])('projects $label with a Hero and keeps the approved raw wording without one', ({ elementID, field, rawZhTW, heroZhTW, heroEnglish }) => {
		const ability = getAbility(elementID);

		// Library / no-Hero keeps the approved authored expression untouched.
		expect(textReading(elementID, field)).toContain(rawZhTW);
		const noHero = renderAbility(ability);
		expectRendered(noHero.container, rawZhTW.replace(/`/g, ''));
		noHero.unmount();

		const hero = makeHero();
		expect(textReading(elementID, field, hero)).toContain(heroZhTW);

		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: `${elementID} Ability`, capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expectRendered(withHero.container, heroZhTW.replace(/`/g, '')),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, heroEnglish),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW.replace(/`/g, ''))
		});

		// Only canonical English ever reaches the calculator.
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('falls back to the complete calculated English when a projected reading is rewritten unexpectedly', () => {
		([
			[ 'beastheart-sub-3-2-1b', 'sections.0.text', 'You end the forced movement, then push the creature 3 squares.' ],
			[ 'beastheart-sub-4-2-2a', 'sections.1.effect', 'You may wield a second whip for 3 extra fire or lightning damage.' ]
		] as const).forEach(([ elementID, field, unsupportedCalculatedEnglish ]) => {
			const presented = localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: elementID,
				field: field,
				canonicalEnglish: required[elementFieldIdentity(elementID, field)],
				calculatedEnglish: unsupportedCalculatedEnglish
			});

			// A whole English reading, never a mixed partial Chinese/English sentence.
			expect(presented).toBe(unsupportedCalculatedEnglish);
			expect(presented).not.toMatch(/[一-鿿]/);
		});
	});

	/**
	 * One representative tier from each materially different Power Roll grammar family this
	 * slice uses. All of them go through the existing shared Power Roll projection unchanged.
	 */
	it.each([
		{
			label: 'characteristic damage + potency + unemphasized outcome clause',
			abilityID: 'beastheart-sub-1-2-2a',
			section: 1,
			tier: 2,
			rawZhTW: '10 + `力量`傷害；`力量` < [中]，目標被吞噬',
			heroZhTW: '12 傷害；`力量` < 2，目標被吞噬'
		},
		{
			label: 'characteristic damage + potency + condition emphasis',
			abilityID: 'beastheart-sub-1-2-2b',
			section: 1,
			tier: 2,
			rawZhTW: '8 + `力量`傷害；`力量` < [中]，**擒制**',
			heroZhTW: '10 傷害；`力量` < 2，**擒制**'
		},
		{
			label: 'flat damage + Presence-worded potency + save-ends condition',
			abilityID: 'beastheart-sub-2-2-2a',
			section: 2,
			tier: 2,
			rawZhTW: '6 傷害；`氣場` < [中]，**畏縮**（豁免解除）',
			heroZhTW: '6 傷害；`氣場` < 2，**畏縮**（豁免解除）'
		},
		{
			label: 'characteristic damage alone',
			abilityID: 'beastheart-sub-2-2-2b',
			section: 0,
			tier: 2,
			rawZhTW: '8 + `力量`傷害',
			heroZhTW: '10 傷害'
		},
		{
			label: 'characteristic damage + forced movement + potency + condition emphasis',
			abilityID: 'beastheart-sub-3-2-2a',
			section: 0,
			tier: 2,
			rawZhTW: '5 + `力量`傷害；推動 3；`力量` < [中]，**伏地**',
			heroZhTW: '7 傷害；推動 3；`力量` < 2，**伏地**'
		}
	])('projects the $label Power Roll family', ({ abilityID, section, tier, rawZhTW, heroZhTW }) => {
		const ability = getAbility(abilityID);
		const hero = makeHero();

		expect(tierReading(abilityID, section, tier)).toBe(rawZhTW);
		expect(tierReading(abilityID, section, tier, hero)).toBe(heroZhTW);

		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: `${abilityID} Ability`, capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expectRendered(withHero.container, heroZhTW.replace(/[`*]/g, '')),
			switchToEnglish: switchLocale,
			assertEnglish: () => expect(withHero.container.textContent).not.toContain(heroZhTW.replace(/[`*]/g, '')),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW.replace(/[`*]/g, ''))
		});

		// Only canonical English ever reaches the calculator.
		getTierEffectCreature.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTierEffectCreature.mockRestore();
	});

	/**
	 * `Omnomnom`'s swallowed-creature section, which the shared condition projector cannot take:
	 * its canonical English says `grabbed` once and `the grab` once, and the approved zh-TW reads
	 * both as 「擒制」. The identity-bound projection decides which one carries the emphasis, so
	 * this test pins both - the emphasized reading and the deliberately unemphasized one.
	 */
	it('projects Omnomnom’s swallowed-creature section and emphasizes only the grabbed reading', () => {
		const ability = getAbility('beastheart-sub-1-2-2a');
		const hero = makeHero();

		// The canonical identity keeps its authored leading newline; the approved zh-TW never had
		// one, and no part of the projection touches either.
		const canonicalEnglish = required[elementFieldIdentity('beastheart-sub-1-2-2a', 'sections.2.text')];
		expect(canonicalEnglish.startsWith('\n')).toBe(true);
		expect(canonicalEnglish).toContain('escapes the grab');

		const noHeroReading = textReading('beastheart-sub-1-2-2a', 'sections.2.text');
		const heroReading = textReading('beastheart-sub-1-2-2a', 'sections.2.text', hero);

		// Without a Hero the calculator leaves `1 + your companion’s Might score` authored, so the
		// approved unresolved wording stands and only the emphasis is projected.
		expect(noHeroReading).toBe('被吞噬的生物與你的契獸共享同個空間，並處於**擒制**與**束縛**，而且只對你的契獸具有效果線。任何東西都無法對被吞噬的生物形成效果線。\n\n每輪 1 次，當你的回合開始時，被吞噬的生物會受到等於 1 + 契獸`力量`的酸蝕傷害。若被吞噬的生物掙脫擒制，契獸會立刻吐出該生物，讓他落在與契獸相鄰的 1 個未占據空間並陷入**伏地**。你的契獸也可以使用免費機動動作吐出被吞噬的生物。你的契獸每次只能吞噬 1 個生物。');

		// With a Hero the calculator's own acid damage result is projected, and nothing else moves.
		expect(heroReading).toBe('被吞噬的生物與你的契獸共享同個空間，並處於**擒制**與**束縛**，而且只對你的契獸具有效果線。任何東西都無法對被吞噬的生物形成效果線。\n\n每輪 1 次，當你的回合開始時，被吞噬的生物會受到 3 點酸蝕傷害。若被吞噬的生物掙脫擒制，契獸會立刻吐出該生物，讓他落在與契獸相鄰的 1 個未占據空間並陷入**伏地**。你的契獸也可以使用免費機動動作吐出被吞噬的生物。你的契獸每次只能吞噬 1 個生物。');

		// The `escapes the grab` reading is deliberately left unemphasized on both paths.
		[ noHeroReading, heroReading ].forEach(reading => {
			expect(reading).toContain('若被吞噬的生物掙脫擒制，');
			expect(reading).not.toContain('掙脫**擒制**');
			expect(reading.split('**擒制**').length - 1).toBe(1);
		});

		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Omnomnom Ability', capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expectRendered(withHero.container, '被吞噬的生物會受到 3 點酸蝕傷害。'),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'takes acid damage equal to 3.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, '被吞噬的生物會受到 3 點酸蝕傷害。')
		});

		// Only canonical English ever reaches the calculator.
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	/**
	 * Burning Lash's three tiers, whose authored `fire or lightning` type list the calculator
	 * collapses to `fire lightning` in Hero context. Only that one authored word is restored
	 * before the shared replay comparison; the damage value, the potency and the `prone` emphasis
	 * are all still projected by the shared logic, and the approved 「火焰或閃電」 reading stands.
	 */
	it.each([
		{ tier: 1, rawZhTW: '6 + `直覺`火焰或閃電傷害；`力量` < [弱]，**伏地**', heroZhTW: '9 火焰或閃電傷害；`力量` < 1，**伏地**', heroEnglish: '9 fire lightning damage' },
		{ tier: 2, rawZhTW: '9 + `直覺`火焰或閃電傷害；`力量` < [中]，**伏地**', heroZhTW: '12 火焰或閃電傷害；`力量` < 2，**伏地**', heroEnglish: '12 fire lightning damage' },
		{ tier: 3, rawZhTW: '14 + `直覺`火焰或閃電傷害；`力量` < [強]，**伏地**且無法站起（EoT）', heroZhTW: '17 火焰或閃電傷害；`力量` < 3，**伏地**且無法站起（EoT）', heroEnglish: '17 fire lightning damage' }
	])('projects Burning Lash tier $tier with a Hero and keeps the approved arithmetic without one', ({ tier, rawZhTW, heroZhTW, heroEnglish }) => {
		const ability = getAbility('beastheart-sub-4-2-2a');
		const hero = makeHero();

		expect(tierReading('beastheart-sub-4-2-2a', 0, tier)).toBe(rawZhTW);
		expect(tierReading('beastheart-sub-4-2-2a', 0, tier, hero)).toBe(heroZhTW);

		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Burning Lash Ability', capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expectRendered(withHero.container, heroZhTW.replace(/[`*]/g, '')),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, heroEnglish),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW.replace(/[`*]/g, ''))
		});

		// Only canonical English ever reaches the calculator.
		getTierEffectCreature.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTierEffectCreature.mockRestore();
	});

	/**
	 * Howling Gale's three tiers carry no characteristic arithmetic at all - 6 / 9 / 13 damage and
	 * slide 1 / 2 / 4 are flat canonical values - so the collapsed `cold or sonic` type list is the
	 * calculator's only Hero-context change to them. Once that authored word is restored, both
	 * paths read the approved zh-TW unprojected.
	 */
	it.each([
		{ tier: 1, zhTW: '6 寒冷或音波傷害；滑動 1' },
		{ tier: 2, zhTW: '9 寒冷或音波傷害；滑動 2' },
		{ tier: 3, zhTW: '13 寒冷或音波傷害；滑動 4' }
	])('reads Howling Gale tier $tier as approved zh-TW with and without a Hero', ({ tier, zhTW }) => {
		const ability = getAbility('beastheart-sub-4-2-2b');
		const hero = makeHero();

		expect(tierReading('beastheart-sub-4-2-2b', 0, tier)).toBe(zhTW);
		expect(tierReading('beastheart-sub-4-2-2b', 0, tier, hero)).toBe(zhTW);

		// The approved reading is the catalog's own zh-TW, projected in neither direction.
		expect(catalogEntries.find(entry => (entry.elementID === 'beastheart-sub-4-2-2b') && (entry.field === `sections.0.roll.tier${tier}`))?.zhTW).toBe(zhTW);

		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Howling Gale Ability', capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expectRendered(withHero.container, zhTW),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'cold sonic damage'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, zhTW)
		});

		// Only canonical English ever reaches the calculator.
		getTierEffectCreature.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTierEffectCreature.mockRestore();
	});

	it('fails closed to whole English for the corrected identities under a wrong identity or an unsupported rewrite', () => {
		const hero = makeHero();
		const swallowedCanonical = required[elementFieldIdentity('beastheart-sub-1-2-2a', 'sections.2.text')];
		const isWholeEnglishReading = (value: string) => !/[\u4e00-\u9fff]/.test(value);

		// The same reading under a different identity is not projected.
		const wrongIdentity = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'beastheart-sub-1-2-2b',
			field: 'sections.2.text',
			canonicalEnglish: swallowedCanonical,
			calculatedEnglish: AbilityLogic.getTextEffect(swallowedCanonical, hero)
		});
		expect(isWholeEnglishReading(wrongIdentity)).toBe(true);

		// A structural rewrite the Omnomnom projection cannot replay.
		const unsupportedSwallowed = 'A swallowed creature is **grabbed**, **restrained** and takes 3 acid damage each round.';
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'beastheart-sub-1-2-2a',
			field: 'sections.2.text',
			canonicalEnglish: swallowedCanonical,
			calculatedEnglish: unsupportedSwallowed
		})).toBe(unsupportedSwallowed);

		// The restored type list never rescues a tier whose surrounding grammar also changed.
		const unsupportedTier = '9 fire lightning damage to each enemy; `M < 1` **prone**';
		expect(localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: 'beastheart-sub-4-2-2a',
			field: 'sections.0.roll.tier1',
			canonicalEnglish: required[elementFieldIdentity('beastheart-sub-4-2-2a', 'sections.0.roll.tier1')],
			calculatedEnglish: unsupportedTier
		})).toBe(unsupportedTier);

		// And a different ability's tier keeps the untouched calculated reading it always had.
		const foreignTier = '9 fire lightning damage; `M < 1` **prone**';
		expect(localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: 'beastheart-sub-3-2-2a',
			field: 'sections.0.roll.tier1',
			canonicalEnglish: required[elementFieldIdentity('beastheart-sub-3-2-2a', 'sections.0.roll.tier1')],
			calculatedEnglish: foreignTier
		})).toBe(foreignTier);
	});

	it('records no glossary change for this batch', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		// The Level 2 ability and feature names stay Beastheart identity-scoped; none became a
		// reusable mapping, so `glossaryDelta = []` for this packet.
		expect(rows.some(row => /^(Omnomnom|Fetch!|Jump Scare|On You Like Your Shadow|This One's Yours|Foe Bowling|Burning Lash|Howling Gale|Watchdog|Supersniffer|Stormheart),/.test(row))).toBe(false);
		expect(rows.some(row => row.includes('燙手山芋'))).toBe(false);
		expect(rows).toContain('Beastheart,獸魂者,game-term,approved');
	});
});
