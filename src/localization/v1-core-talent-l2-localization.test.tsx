// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1TalentLevel2RequiredCanonicalEnglish, createV1TalentLevel1AbilityRequiredCanonicalEnglish, createV1TalentLevel1CompletionRequiredCanonicalEnglish, getV1TalentTraditions, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, normalizedText, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { AbilityLogic } from '@/logic/ability-logic';
import { HeroLogic } from '@/logic/hero-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { Characteristic } from '@/enums/characteristic';
import { FeatureType } from '@/enums/feature-type';
import { Ability } from '@/models/ability';
import { Feature } from '@/models/feature';
import { talent } from '@/data/classes/talent/talent';
import { core } from '@/data/sourcebooks/official/core';

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
 * The live slice, rebuilt here by the test's own level lookup, the shared independent bounded
 * non-Ability walk and the test's own Ability-field reader. The production denominator is not
 * used to compute the expected set: doing so would only prove that extraction agrees with
 * itself, and a traversal or level-selection regression would still pass.
 */
const levelTwoFeatures = (owner: { featuresByLevel: { level: number, features: Feature[] }[] }) => (
	owner.featuresByLevel.find(level => level.level === 2)?.features || []
);

const extractLiveAbilityFields = (ability: Ability): Record<string, string> => {
	const fields: Record<string, string> = {};
	const add = (field: string, canonicalEnglish: string) => {
		if (canonicalEnglish === '') {
			return;
		}
		const identity = elementFieldIdentity(ability.id, field);
		if (fields[identity] !== undefined) {
			throw new Error(`duplicate localization identity '${identity}'`);
		}
		fields[identity] = canonicalEnglish;
	};

	add('name', ability.name);
	add('target', ability.target);
	add('description', ability.description);
	add('type.trigger', ability.type.trigger);
	(ability.sections || []).forEach((section, index) => {
		switch (section.type) {
			case 'text':
				add(`sections.${index}.text`, section.text);
				break;
			case 'field':
				add(`sections.${index}.name`, section.name);
				add(`sections.${index}.effect`, section.effect);
				break;
			case 'roll':
				add(`sections.${index}.roll.tier1`, section.roll.tier1);
				add(`sections.${index}.roll.tier2`, section.roll.tier2);
				add(`sections.${index}.roll.tier3`, section.roll.tier3);
				break;
		}
	});
	return fields;
};

/** The Abilities a Level 2 root list offers, through the same bounded Choice/Multiple descent. */
const boundedAbilities = (features: Feature[], collected: Ability[] = []): Ability[] => {
	features.forEach(feature => {
		if (feature.type === FeatureType.Ability) {
			collected.push(feature.data.ability);
		}
		if (feature.type === FeatureType.Choice) {
			boundedAbilities(feature.data.options.map(option => option.feature), collected);
		}
		if (feature.type === FeatureType.Multiple) {
			boundedAbilities(feature.data.features, collected);
		}
	});
	return collected;
};

const traditions = getV1TalentTraditions();

const liveFields: Record<string, string> = { ...extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(talent)) };
traditions.forEach(tradition => {
	const traditionLevelTwo = levelTwoFeatures(tradition);
	Object.assign(liveFields, extractLiveBoundedNonAbilityFeatureFields(traditionLevelTwo));
	boundedAbilities(traditionLevelTwo).forEach(ability => Object.assign(liveFields, extractLiveAbilityFields(ability)));
});

const required = createV1TalentLevel2RequiredCanonicalEnglish();

const talentLevel2CatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

/** The 63 approved identities, written out independently of any extraction under test. */
const approvedIdentities = [
	'element:talent-2-1/name',
	'element:talent-sub-1-2-1/description',
	'element:talent-sub-1-2-1/name',
	'element:talent-sub-1-2-2/name',
	'element:talent-sub-1-2-2a/description',
	'element:talent-sub-1-2-2a/name',
	'element:talent-sub-1-2-2a/sections.0.roll.tier1',
	'element:talent-sub-1-2-2a/sections.0.roll.tier2',
	'element:talent-sub-1-2-2a/sections.0.roll.tier3',
	'element:talent-sub-1-2-2a/sections.1.text',
	'element:talent-sub-1-2-2a/sections.2.effect',
	'element:talent-sub-1-2-2a/sections.2.name',
	'element:talent-sub-1-2-2a/target',
	'element:talent-sub-1-2-2b/description',
	'element:talent-sub-1-2-2b/name',
	'element:talent-sub-1-2-2b/sections.0.roll.tier1',
	'element:talent-sub-1-2-2b/sections.0.roll.tier2',
	'element:talent-sub-1-2-2b/sections.0.roll.tier3',
	'element:talent-sub-1-2-2b/sections.1.text',
	'element:talent-sub-1-2-2b/sections.2.effect',
	'element:talent-sub-1-2-2b/sections.2.name',
	'element:talent-sub-1-2-2b/target',
	'element:talent-sub-2-2-1/name',
	'element:talent-sub-2-2-1/sections.0.text',
	'element:talent-sub-2-2-1/target',
	'element:talent-sub-2-2-1/type.trigger',
	'element:talent-sub-2-2-2/name',
	'element:talent-sub-2-2-2a/description',
	'element:talent-sub-2-2-2a/name',
	'element:talent-sub-2-2-2a/sections.0.roll.tier1',
	'element:talent-sub-2-2-2a/sections.0.roll.tier2',
	'element:talent-sub-2-2-2a/sections.0.roll.tier3',
	'element:talent-sub-2-2-2a/sections.1.effect',
	'element:talent-sub-2-2-2a/sections.1.name',
	'element:talent-sub-2-2-2a/target',
	'element:talent-sub-2-2-2b/description',
	'element:talent-sub-2-2-2b/name',
	'element:talent-sub-2-2-2b/sections.0.roll.tier1',
	'element:talent-sub-2-2-2b/sections.0.roll.tier2',
	'element:talent-sub-2-2-2b/sections.0.roll.tier3',
	'element:talent-sub-2-2-2b/sections.1.effect',
	'element:talent-sub-2-2-2b/sections.1.name',
	'element:talent-sub-2-2-2b/target',
	'element:talent-sub-3-2-1/description',
	'element:talent-sub-3-2-1/name',
	'element:talent-sub-3-2-2/name',
	'element:talent-sub-3-2-2a/description',
	'element:talent-sub-3-2-2a/name',
	'element:talent-sub-3-2-2a/sections.0.roll.tier1',
	'element:talent-sub-3-2-2a/sections.0.roll.tier2',
	'element:talent-sub-3-2-2a/sections.0.roll.tier3',
	'element:talent-sub-3-2-2a/sections.1.effect',
	'element:talent-sub-3-2-2a/sections.1.name',
	'element:talent-sub-3-2-2a/target',
	'element:talent-sub-3-2-2b/description',
	'element:talent-sub-3-2-2b/name',
	'element:talent-sub-3-2-2b/sections.0.roll.tier1',
	'element:talent-sub-3-2-2b/sections.0.roll.tier2',
	'element:talent-sub-3-2-2b/sections.0.roll.tier3',
	'element:talent-sub-3-2-2b/sections.1.text',
	'element:talent-sub-3-2-2b/sections.2.effect',
	'element:talent-sub-3-2-2b/sections.2.name',
	'element:talent-sub-3-2-2b/target'
].sort();

const { renderFeature, renderAbility } = createClassPresentationHarness(talent, [ core ]);

const allLevelTwoFeatures = [ ...levelTwoFeatures(talent), ...traditions.flatMap(tradition => levelTwoFeatures(tradition)) ];

const getFeature = (id: string) => {
	const feature = allLevelTwoFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Talent Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

const getAbility = (id: string) => {
	const ability = traditions.flatMap(tradition => boundedAbilities(levelTwoFeatures(tradition))).find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Talent Level 2 Ability '${id}' is missing`);
	}
	return ability;
};

const zhTWOf = (identity: string) => talentLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;

// Reason 2 / Might 1 / Intuition 1 / Presence 0 at Level 2; every expected value below is read
// back from the calculator's own output rather than hardcoded.
const makeHero = () => createHeroWithClass(talent, 2, FactoryLogic.createCharacteristics(1, 0, 2, 1, 0));

afterEach(cleanup);

describe('V1 Core Talent L2 manifest, catalog and presentation', () => {
	it('matches the independent live Talent Level 2 slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(63);
		expect(Object.keys(required)).toHaveLength(63);
		expect(Object.keys(required).sort()).toEqual(approvedIdentities);
		expect(Object.keys(liveFields).sort()).toEqual(approvedIdentities);
		expect(required).toEqual(liveFields);

		expect(traditions.map(tradition => tradition.id)).toEqual([ 'talent-sub-1', 'talent-sub-2', 'talent-sub-3' ]);
	});

	it('reads the base class Level 2 root only, and reaches every Tradition Level 2 Ability', () => {
		// The Talent's own Level 2 authors exactly one Feature: the Perk.
		expect(levelTwoFeatures(talent).map(feature => feature.id)).toEqual([ 'talent-2-1' ]);
		expect(required[elementFieldIdentity('talent-2-1', 'name')]).toBe('Interpersonal / Lore / Supernatural Perk');
		// The Perk carries no description of its own, so it contributes exactly one identity.
		expect(Object.keys(required).filter(identity => identity.startsWith('element:talent-2-1/'))).toEqual([ 'element:talent-2-1/name' ]);

		// Chronopathy and Telepathy each author one Level 2 Feature plus an ability Choice;
		// Telekinesis authors a direct Level 2 Ability alongside its Choice.
		expect(levelTwoFeatures(traditions[0]).map(feature => feature.id)).toEqual([ 'talent-sub-1-2-1', 'talent-sub-1-2-2' ]);
		expect(levelTwoFeatures(traditions[1]).map(feature => feature.id)).toEqual([ 'talent-sub-2-2-1', 'talent-sub-2-2-2' ]);
		expect(levelTwoFeatures(traditions[2]).map(feature => feature.id)).toEqual([ 'talent-sub-3-2-1', 'talent-sub-3-2-2' ]);

		// Telekinesis' Ease their Fall really is a root Ability Feature, not a Choice option, and
		// the one shared collector reaches it exactly as it reaches the nested Choice options.
		expect(getFeature('talent-sub-2-2-1').type).toBe(FeatureType.Ability);
		expect(getFeature('talent-sub-1-2-1').type).not.toBe(FeatureType.Ability);
		expect(getFeature('talent-sub-3-2-1').type).not.toBe(FeatureType.Ability);

		expect(traditions.flatMap(tradition => boundedAbilities(levelTwoFeatures(tradition))).map(ability => ability.id)).toEqual([
			'talent-sub-1-2-2a',
			'talent-sub-1-2-2b',
			'talent-sub-2-2-1',
			'talent-sub-2-2-2a',
			'talent-sub-2-2-2b',
			'talent-sub-3-2-2a',
			'talent-sub-3-2-2b'
		]);
	});

	it('omits the Ease their Fall description because the live canonical field is empty', () => {
		// The absence is driven by live canonical data, not by an exclusion list.
		expect(getAbility('talent-sub-2-2-1').description).toBe('');
		expect(required[elementFieldIdentity('talent-sub-2-2-1', 'description')]).toBeUndefined();
		expect(liveFields[elementFieldIdentity('talent-sub-2-2-1', 'description')]).toBeUndefined();
		// Its other authored readings are all present.
		expect(Object.keys(required).filter(identity => identity.startsWith('element:talent-sub-2-2-1/')).sort()).toEqual([
			'element:talent-sub-2-2-1/name',
			'element:talent-sub-2-2-1/sections.0.text',
			'element:talent-sub-2-2-1/target',
			'element:talent-sub-2-2-1/type.trigger'
		]);
		// Its two sibling Abilities do author descriptions, so the empty one is a real difference.
		expect(getAbility('talent-sub-2-2-2a').description).not.toBe('');
		expect(getAbility('talent-sub-2-2-2b').description).not.toBe('');
	});

	it('keeps Tradition metadata, Level 1 content and every Level 3+ sibling out of the slice', () => {
		expect(Object.keys(required).some(identity => /talent-sub-\d-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(Object.keys(required).some(identity => /^element:talent-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(required[elementFieldIdentity('talent-sub-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('talent-3-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('class-talent', 'subclassName')]).toBeUndefined();

		// The Level 3+ content really is there to be missed, so the bound is doing work.
		expect(talent.featuresByLevel.find(level => level.level === 3)?.features.length).toBeGreaterThan(0);
		expect(traditions[0].featuresByLevel.find(level => level.level === 5)?.features.length).toBeGreaterThan(0);

		// This slice is disjoint from both completed Talent Level 1 slices.
		const levelOneIdentities = [
			...Object.keys(createV1TalentLevel1AbilityRequiredCanonicalEnglish()),
			...Object.keys(createV1TalentLevel1CompletionRequiredCanonicalEnglish())
		];
		expect(levelOneIdentities.filter(identity => Object.keys(required).includes(identity))).toEqual([]);
	});

	it('adds exactly the 63 approved catalog entries and registers them in the live manifest', () => {
		expect(talentLevel2CatalogEntries).toHaveLength(63);
		expect(talentLevel2CatalogEntries.map(getEntryIdentity).sort()).toEqual(approvedIdentities);
		expect(talentLevel2CatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(talentLevel2CatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(talentLevel2CatalogEntries.every(entry => (entry.zhTW.trim() !== '') && (entry.zhTW !== entry.canonicalEnglish))).toBe(true);

		Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
			expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		});

		expect(zhTWOf('element:talent-2-1/name')).toBe('交涉類 / 學識類 / 超常類專長');
		expect(zhTWOf('element:talent-sub-1-2-1/name')).toBe('放緩時間');
		expect(zhTWOf('element:talent-sub-1-2-2a/name')).toBe('時序演算');
		expect(zhTWOf('element:talent-sub-1-2-2b/name')).toBe('減速');
		expect(zhTWOf('element:talent-sub-2-2-1/name')).toBe('減緩墜落');
		expect(zhTWOf('element:talent-sub-2-2-2a/name')).toBe('重力爆發');
		expect(zhTWOf('element:talent-sub-2-2-2b/name')).toBe('載浮載沉');
		expect(zhTWOf('element:talent-sub-3-2-1/name')).toBe('舒緩心靈');
		expect(zhTWOf('element:talent-sub-3-2-2a/name')).toBe('崩潰');
		expect(zhTWOf('element:talent-sub-3-2-2b/name')).toBe('突觸超控');
	});

	it('keeps each 2nd-Level Tradition Ability label a separate identity without deduplicating them', () => {
		const choiceIdentities = [
			'element:talent-sub-1-2-2/name',
			'element:talent-sub-2-2-2/name',
			'element:talent-sub-3-2-2/name'
		];

		choiceIdentities.forEach(identity => {
			expect(required[identity]).toBe('2nd-Level Tradition Ability');
			expect(zhTWOf(identity)).toBe('2 級流派招式');
		});
		// Each identity carries its own entry; none was collapsed into a shared one.
		expect(talentLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === '2nd-Level Tradition Ability')).toHaveLength(3);
		// The repeated Strained field labels are likewise separate identities: every one of the
		// six Abilities that authors a Strained section keeps its own entry.
		expect(talentLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === 'Strained')).toHaveLength(6);
		expect(talentLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === 'Strained').every(entry => entry.zhTW === '焦慮')).toBe(true);
	});

	it('moves completeness by exactly this slice while class level content stays unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		// This batch's own completeness movement: none of the 63 collided with an identity that
		// already existed, so the denominator grows by exactly this slice.
		expect(Object.keys(required)).toHaveLength(63);
		expect(result.requiredCount - Object.keys(required).length).toBe(3376);
		expect(result.requiredCount).toBe(3439);

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'class-and-subclass-level-content',
			'official-ability-authored-content'
		]));
		expect(result.complete).toBe(false);
	});

	it('reads each Tradition Level 2 non-Ability surface in zh-TW and back in canonical English', () => {
		const readings: { id: string, zhTW: string[], english: string[] }[] = [
			{ id: 'talent-sub-1-2-1', zhTW: [ '放緩時間', '若蒙太奇考驗會在英雄達到成功上限前結束' ], english: [ 'Ease the Hours', 'You can increase the number of rounds in a montage test' ] },
			{ id: 'talent-sub-3-2-1', zhTW: [ '舒緩心靈', '當你進行提議停戰談判的考驗時' ], english: [ 'Ease the Mind', 'You gain an edge on tests made to stop combat' ] }
		];

		readings.forEach(reading => {
			const protectedFeatures = protectCanonicalState({
				label: `Talent Level 2 canonical Feature data (${reading.id})`,
				capture: () => JSON.stringify(allLevelTwoFeatures)
			});

			const panel = renderFeature(getFeature(reading.id));
			const expectZhTW = () => {
				reading.zhTW.forEach(text => expectRendered(panel.container, text));
				reading.english.forEach(text => expect(normalizedText(panel.container)).not.toContain(text));
			};

			verifyLocaleDifferentialInvariants({
				protectedStates: [ protectedFeatures ],
				assertZhTW: expectZhTW,
				switchToEnglish: switchLocale,
				assertEnglish: () => reading.english.forEach(text => expectRendered(panel.container, text)),
				switchToZhTW: switchLocale,
				assertZhTWAfterRoundTrip: expectZhTW
			});

			panel.unmount();
		});
	});

	it('presents each Tradition ability-choice root and its two nested Ability options', () => {
		const expected = [
			{ choice: 'talent-sub-1-2-2', options: [ '時序演算', '減速' ], english: [ 'Applied Chronometrics', 'Slow' ] },
			{ choice: 'talent-sub-2-2-2', options: [ '重力爆發', '載浮載沉' ], english: [ 'Gravitic Burst', 'Levity and Gravity' ] },
			{ choice: 'talent-sub-3-2-2', options: [ '崩潰', '突觸超控' ], english: [ 'Overwhelm', 'Synaptic Override' ] }
		];

		expected.forEach(entry => {
			const choice = getFeature(entry.choice);
			if (choice.type !== FeatureType.Choice) {
				throw new Error(`${entry.choice} is not a Choice`);
			}
			const serialized = JSON.stringify(choice);
			const panel = renderFeature(choice);

			expectRendered(panel.container, '2 級流派招式');
			entry.options.forEach(option => expectRendered(panel.container, option));

			switchLocale();
			expectRendered(panel.container, '2nd-Level Tradition Ability');
			entry.english.forEach(option => expectRendered(panel.container, option));

			expect(choice.data.options.map(option => option.feature.id)).toEqual([ `${entry.choice}a`, `${entry.choice}b` ]);
			expect(JSON.stringify(choice)).toBe(serialized);
			panel.unmount();
		});
	});

	it('renders the direct Ease their Fall Ability and each Tradition subclass panel in zh-TW', () => {
		const protectedTraditions = protectCanonicalState({
			label: 'Talent Tradition canonical data',
			capture: () => JSON.stringify(traditions)
		});

		const panel = renderAbility(getAbility('talent-sub-2-2-1'));
		const expectZhTW = () => {
			expectRendered(panel.container, '減緩墜落');
			expectRendered(panel.container, '自身');
			expect(normalizedText(panel.container)).not.toContain('Ease their Fall');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedTraditions ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(panel.container, 'Ease their Fall');
				expectRendered(panel.container, 'Self');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});
		panel.unmount();
	});

	it('projects the Ease their Fall Reason total in Hero context and keeps the approved raw reading without one', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('talent-sub-2-2-1', 'sections.0.text')];
		const approvedRaw = zhTWOf('element:talent-sub-2-2-1/sections.0.text') as string;
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'talent-sub-2-2-1',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		});

		// Library / no Hero: the calculator resolves nothing, so the approved unresolved reading
		// is what the player sees.
		const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
		expect(noHeroCalculated).toBe(canonicalEnglish);
		expect(present(noHeroCalculated)).toBe(approvedRaw);
		expect(present(noHeroCalculated)).toContain('等於 2 + 你`理智`的數值');

		// Hero context carries only the total AbilityLogic actually produced. The localization
		// layer never recomputes Reason: the expected value is read back from the calculator.
		const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		const value = heroCalculated.match(/You reduce the falling damage by an amount equal to (-?\d+)\./)?.[1];
		expect(value).toBeDefined();
		expect(Number(value)).toBe(2 + HeroLogic.getCharacteristic(hero, Characteristic.Reason));

		const projected = present(heroCalculated);
		expect(projected).toBe(`你將墜落傷害減少 ${value} 點。`);
		expect(projected).not.toContain('等於 2 + 你`理智`的數值');
		expect(projected).not.toMatch(/[A-Za-z]/);

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'talent-sub-2-2-1',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: heroCalculated
		})).toBe(heroCalculated);
	});

	it('projects the Applied Chronometrics dazed emphasis in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('talent-sub-1-2-2a', 'sections.1.text')];
		const approvedRaw = zhTWOf('element:talent-sub-1-2-2a/sections.1.text') as string;
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		// The word appears twice in this reading, so a partial projection would be visible.
		expect(canonicalEnglish.match(/\bdazed\b/g)).toHaveLength(2);
		expect(approvedRaw.match(/暈眩/g)).toHaveLength(2);

		([ undefined, hero ] as const).forEach(context => {
			const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, context);
			expect(calculatedEnglish.match(/\*\*dazed\*\*/g)).toHaveLength(2);

			const projected = localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: 'talent-sub-1-2-2a',
				field: 'sections.1.text',
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			});

			// Only the emphasis the calculator introduced is added; the prose is untouched.
			expect(projected).toBe(approvedRaw.replace(/暈眩/g, '**暈眩**'));
			expect(projected).toContain('速度都會獲得 +5 加值');
			expect(projected).not.toMatch(/[A-Za-z]/);
		});
	});

	it('projects the Gravitic Burst and Synaptic Override Strained weakened emphasis where the field is calculator-fed', () => {
		const hero = makeHero();
		const strainedEffects = [
			{ elementID: 'talent-sub-2-2-2a', field: 'sections.1.effect', keep: '爆發區域 +1' },
			{ elementID: 'talent-sub-3-2-2b', field: 'sections.2.effect', keep: '你受到 1d6 點傷害' }
		];

		strainedEffects.forEach(effect => {
			const canonicalEnglish = required[elementFieldIdentity(effect.elementID, effect.field)];
			const approvedRaw = zhTWOf(`element:${effect.elementID}/${effect.field}`) as string;
			assertCanonicalEnglishCalculationInput(canonicalEnglish);

			([ undefined, hero ] as const).forEach(context => {
				const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, context);
				expect(calculatedEnglish).toContain('**weakened**');

				const projected = localizeCalculatedAuthoredTextPresentation({
					locale: 'zh-TW',
					elementID: effect.elementID,
					field: effect.field,
					canonicalEnglish: canonicalEnglish,
					calculatedEnglish: calculatedEnglish
				});

				expect(projected).toBe(approvedRaw.replace('虛弱', '**虛弱**'));
				expect(projected).toContain(effect.keep);
				// Synaptic Override's approved reading keeps the authored '1d6' dice term; no
				// other Latin text survives into the zh-TW presentation.
				expect(projected.replace(/1d6/g, '')).not.toMatch(/[A-Za-z]/);
			});
		});
	});

	it('leaves the Synaptic Override dying prose authored, because the calculator does not emphasize it', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('talent-sub-3-2-2b', 'sections.1.text')];
		const approvedRaw = zhTWOf('element:talent-sub-3-2-2b/sections.1.text');

		expect(canonicalEnglish).toContain('leave them dying');

		// No condition formatter is invented for this word: the calculator changes nothing in
		// either context, so both surfaces show the approved raw reading unchanged.
		([ undefined, hero ] as const).forEach(context => {
			const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, context);
			expect(calculatedEnglish).toBe(canonicalEnglish);
			expect(calculatedEnglish).not.toContain('**dying**');

			expect(localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: 'talent-sub-3-2-2b',
				field: 'sections.1.text',
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			})).toBe(approvedRaw);
		});

		expect(approvedRaw).toContain('陷入瀕死');
		expect(approvedRaw).toContain('**效果**');
	});

	it('reuses the existing generic Power Roll presenter for all eighteen approved tier identities', () => {
		const hero = makeHero();
		const powerRollIdentities = [
			[ 'talent-sub-1-2-2a', 'sections.0' ],
			[ 'talent-sub-1-2-2b', 'sections.0' ],
			[ 'talent-sub-2-2-2a', 'sections.0' ],
			[ 'talent-sub-2-2-2b', 'sections.0' ],
			[ 'talent-sub-3-2-2a', 'sections.0' ],
			[ 'talent-sub-3-2-2b', 'sections.0' ]
		] as const;

		let covered = 0;
		powerRollIdentities.forEach(([ abilityID, section ]) => {
			const ability = getAbility(abilityID);

			([ 1, 2, 3 ] as const).forEach(tier => {
				const field = `${section}.roll.tier${tier}`;
				const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
				expect(canonicalEnglish).toBeDefined();
				assertCanonicalEnglishCalculationInput(canonicalEnglish);

				([ undefined, hero ] as const).forEach(context => {
					const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, context);
					const zhTW = localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

					// Every tier localizes in both contexts; none falls back to calculated English.
					expect(zhTW).not.toBe(calculatedEnglish);
					expect(zhTW).not.toMatch(/[A-Za-z]/);
					expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish })).toBe(calculatedEnglish);
				});
				covered += 1;
			});
		});

		expect(covered).toBe(18);
	});

	it('projects the Slow Presence potency and slowed condition from the calculator in both contexts', () => {
		const hero = makeHero();
		const ability = getAbility('talent-sub-1-2-2b');
		const field = 'sections.0.roll.tier1';
		const canonicalEnglish = required[elementFieldIdentity('talent-sub-1-2-2b', field)];
		const approvedRaw = zhTWOf('element:talent-sub-1-2-2b/sections.0.roll.tier1') as string;

		const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({
			locale: 'zh-TW', abilityID: 'talent-sub-1-2-2b', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish
		});

		// No Hero: the potency threshold stays authored and only the emphasis is projected.
		const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, 1, ability, undefined, undefined);
		expect(present(noHeroCalculated)).toBe(approvedRaw.replace('緩速', '**緩速**'));
		expect(present(noHeroCalculated)).toContain('`氣場` < [弱]');

		// Hero: the calculator's own resolved Presence potency is what appears.
		const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, 1, ability, undefined, hero);
		const resolved = heroCalculated.match(/P\s*<\s*(-?\d+)/)?.[1];
		expect(resolved).toBeDefined();
		expect(Number(resolved)).toBe(HeroLogic.getPotency(hero, 'weak'));

		const projected = present(heroCalculated);
		expect(projected).toContain(`\`氣場\` < ${resolved}`);
		expect(projected).not.toContain('[弱]');
		expect(projected).toContain('**緩速**');
		// The authored speed-halved clause carries no value and is kept.
		expect(projected).toContain('目標的速度減半（豁免解除）');
		expect(projected).not.toMatch(/[A-Za-z]/);
	});

	it('projects the Levity and Gravity Reason damage, Might potency and prone condition', () => {
		const hero = makeHero();
		const ability = getAbility('talent-sub-2-2-2b');
		const field = 'sections.0.roll.tier3';
		const canonicalEnglish = required[elementFieldIdentity('talent-sub-2-2-2b', field)];
		const approvedRaw = zhTWOf('element:talent-sub-2-2-2b/sections.0.roll.tier3') as string;

		const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({
			locale: 'zh-TW', abilityID: 'talent-sub-2-2-2b', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish
		});

		const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, 3, ability, undefined, undefined);
		expect(present(noHeroCalculated)).toBe(approvedRaw.replace('伏地', '**伏地**'));
		expect(present(noHeroCalculated)).toContain('14 + `理智`傷害');

		const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, 3, ability, undefined, hero);
		const damage = heroCalculated.match(/^(-?\d+) damage/)?.[1];
		const potency = heroCalculated.match(/M\s*<\s*(-?\d+)/)?.[1];
		expect(damage).toBeDefined();
		expect(potency).toBeDefined();
		expect(Number(damage)).toBe(14 + HeroLogic.getCharacteristic(hero, Characteristic.Reason));

		const projected = present(heroCalculated);
		expect(projected).toContain(`${damage} 傷害`);
		expect(projected).toContain(`\`力量\` < ${potency}`);
		expect(projected).toContain('**伏地**且無法起身（豁免解除）');
		expect(projected).not.toContain('`理智`');
		expect(projected).not.toMatch(/[A-Za-z]/);
	});

	it('projects the Overwhelm Reason psychic damage, Intuition potency and each tier condition', () => {
		const hero = makeHero();
		const ability = getAbility('talent-sub-3-2-2a');
		const tiers = [
			{ tier: 1, base: 6, condition: '緩速' },
			{ tier: 2, base: 10, condition: '虛弱' },
			{ tier: 3, base: 14, condition: '暈眩' }
		] as const;

		tiers.forEach(({ tier, base, condition }) => {
			const field = `sections.0.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity('talent-sub-3-2-2a', field)];
			const approvedRaw = zhTWOf(`element:talent-sub-3-2-2a/${field}`) as string;

			const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({
				locale: 'zh-TW', abilityID: 'talent-sub-3-2-2a', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish
			});

			const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
			expect(present(noHeroCalculated)).toBe(approvedRaw.replace(condition, `**${condition}**`));

			const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
			const damage = heroCalculated.match(/^(-?\d+) psychic damage/)?.[1];
			const potency = heroCalculated.match(/I\s*<\s*(-?\d+)/)?.[1];
			expect(Number(damage)).toBe(base + HeroLogic.getCharacteristic(hero, Characteristic.Reason));
			expect(Number(potency)).toBeDefined();

			const projected = present(heroCalculated);
			expect(projected).toContain(`${damage} 心靈傷害`);
			expect(projected).toContain(`\`直覺\` < ${potency}`);
			expect(projected).toContain(`**${condition}**（豁免解除）`);
			expect(projected).not.toMatch(/[A-Za-z]/);
		});
	});

	it('keeps the statically authored Power Roll tiers exactly as approved in both contexts', () => {
		const hero = makeHero();
		const staticTiers = [
			{ abilityID: 'talent-sub-1-2-2a', tier: 1, expected: '你指定 2 個生物，其中 1 個可以是你自己' },
			{ abilityID: 'talent-sub-2-2-2a', tier: 1, expected: '3 傷害；垂直推動 2' },
			{ abilityID: 'talent-sub-3-2-2b', tier: 1, expected: '目標對你選擇的 1 個敵人發動 1 次基礎打擊。' }
		] as const;

		staticTiers.forEach(({ abilityID, tier, expected }) => {
			const field = `sections.0.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
			const ability = getAbility(abilityID);

			([ undefined, hero ] as const).forEach(context => {
				const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, context);
				// No class-specific numeric projector is acquired: these tiers carry no value the
				// calculator resolves, so the approved reading is returned untouched.
				expect(calculatedEnglish).toBe(canonicalEnglish);
				expect(localizePowerRollTierPresentation({
					locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish
				})).toBe(expected);
			});
		});
	});

	it('fails closed rather than guessing when the calculated English no longer matches the approved structure', () => {
		const easeTheirFallCanonical = required[elementFieldIdentity('talent-sub-2-2-1', 'sections.0.text')];
		// A rewrite that also restated the trigger is a structure this projection cannot prove,
		// so it falls back whole rather than emitting a mixed Chinese/English sentence.
		const easeTheirFallUnsupported = `${easeTheirFallCanonical.replace('2 + your Reason score', '4')} You also land safely.`;

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'talent-sub-2-2-1',
			field: 'sections.0.text',
			canonicalEnglish: easeTheirFallCanonical,
			calculatedEnglish: easeTheirFallUnsupported
		})).toBe(easeTheirFallUnsupported);

		// An Applied Chronometrics rewrite that emphasized only one of the two dazed readings
		// cannot be projected without guessing which zh-TW occurrence to mark.
		const appliedChronometricsCanonical = required[elementFieldIdentity('talent-sub-1-2-2a', 'sections.1.text')];
		const appliedChronometricsUnsupported = appliedChronometricsCanonical.replace('made dazed', 'made **dazed**');

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'talent-sub-1-2-2a',
			field: 'sections.1.text',
			canonicalEnglish: appliedChronometricsCanonical,
			calculatedEnglish: appliedChronometricsUnsupported
		})).toBe(appliedChronometricsUnsupported);

		// A Slow tier whose authored speed clause was also rewritten falls back the same way.
		const slowCanonical = required[elementFieldIdentity('talent-sub-1-2-2b', 'sections.0.roll.tier1')];
		const slowUnsupported = slowCanonical
			.replace('P < [weak]', 'P < 0')
			.replace('The target’s speed is halved', 'The target’s speed is 0');

		expect(localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: 'talent-sub-1-2-2b',
			field: 'sections.0.roll.tier1',
			canonicalEnglish: slowCanonical,
			calculatedEnglish: slowUnsupported
		})).toBe(slowUnsupported);
	});

	it('never sends zh-TW into the calculator for any identity in this slice', () => {
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		try {
			const suppliedInputs: string[] = [];
			Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
				// Every canonical value this slice hands to the calculator is canonical English.
				assertCanonicalEnglishCalculationInput(canonicalEnglish);
				const elementID = identity.slice('element:'.length, identity.lastIndexOf('/'));
				const field = identity.slice(identity.lastIndexOf('/') + 1);
				const tierMatch = field.match(/^sections\.\d+\.roll\.tier([123])$/);

				suppliedInputs.push(canonicalEnglish);
				if (tierMatch) {
					AbilityLogic.getTierEffectCreature(canonicalEnglish, Number(tierMatch[1]) as 1 | 2 | 3, getAbility(elementID), undefined, hero);
				} else {
					AbilityLogic.getTextEffect(canonicalEnglish, hero);
				}
			});

			// Each of the 63 identities was driven through its real calculator entry point.
			expect(suppliedInputs).toHaveLength(63);
			expect(getTierEffectCreature.mock.calls).toHaveLength(18);
			expect(getTextEffect.mock.calls.length).toBeGreaterThanOrEqual(45);
			suppliedInputs.forEach(input => expect(Object.values(required)).toContain(input));

			// Nothing the calculator ever received - including the values getTierEffectCreature
			// passes on to getTextEffect internally - carries any Chinese text.
			const calculatorInputs = [
				...getTextEffect.mock.calls.map(call => call[0]),
				...getTierEffectCreature.mock.calls.map(call => call[0])
			];
			expect(calculatorInputs.length).toBeGreaterThanOrEqual(63);
			calculatorInputs.forEach(input => {
				expect(() => assertCanonicalEnglishCalculationInput(input)).not.toThrow();
			});
		} finally {
			getTextEffect.mockRestore();
			getTierEffectCreature.mockRestore();
		}
	});
});
