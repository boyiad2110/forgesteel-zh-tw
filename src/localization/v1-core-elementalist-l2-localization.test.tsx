// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ElementalistLevel2RequiredCanonicalEnglish, createV1ElementalistLevel1AbilityRequiredCanonicalEnglish, getV1ElementalistLevel2Abilities, getV1ElementalistSubclasses, v1ElementalistLevel2AbilityIDs, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, normalizedText, readFieldByExactLabel, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
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
import { elementalist } from '@/data/classes/elementalist/elementalist';
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
 * non-Ability walk, the test's own Ability-field reader and the test's own ability-ID list. The
 * production denominator is not used to compute the expected set: doing so would only prove that
 * extraction agrees with itself, and a traversal or level-selection regression would still pass.
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

const elements = getV1ElementalistSubclasses();

/** The four newly available 5-cost class abilities, looked up independently of the manifest. */
const levelTwoClassAbilities = [ 'elementalist-ability-17', 'elementalist-ability-18', 'elementalist-ability-19', 'elementalist-ability-20' ].map(id => {
	const ability = elementalist.abilities.find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Elementalist ability '${id}' is missing`);
	}
	return ability;
});

const liveFields: Record<string, string> = { ...extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(elementalist)) };
elements.forEach(element => {
	const elementLevelTwo = levelTwoFeatures(element);
	Object.assign(liveFields, extractLiveBoundedNonAbilityFeatureFields(elementLevelTwo));
	boundedAbilities(elementLevelTwo).forEach(ability => Object.assign(liveFields, extractLiveAbilityFields(ability)));
});
levelTwoClassAbilities.forEach(ability => Object.assign(liveFields, extractLiveAbilityFields(ability)));

const required = createV1ElementalistLevel2RequiredCanonicalEnglish();

const elementalistLevel2CatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

/** The 39 approved identities, written out independently of any extraction under test. */
const approvedIdentities = [
	'element:elementalist-2-1/name',
	'element:elementalist-2-2/name',
	'element:elementalist-sub-1-2-1/name',
	'element:elementalist-sub-1-2-1/description',
	'element:elementalist-sub-2-2-1/name',
	'element:elementalist-sub-2-2-1/description',
	'element:elementalist-sub-2-2-2/name',
	'element:elementalist-sub-3-2-1/name',
	'element:elementalist-sub-3-2-1/description',
	'element:elementalist-sub-4-2-1/name',
	'element:elementalist-sub-4-2-1/target',
	'element:elementalist-sub-4-2-1/description',
	'element:elementalist-sub-4-2-1/sections.0.text',
	'element:elementalist-ability-17/name',
	'element:elementalist-ability-17/target',
	'element:elementalist-ability-17/description',
	'element:elementalist-ability-17/sections.0.text',
	'element:elementalist-ability-17/sections.1.name',
	'element:elementalist-ability-17/sections.1.effect',
	'element:elementalist-ability-18/name',
	'element:elementalist-ability-18/target',
	'element:elementalist-ability-18/description',
	'element:elementalist-ability-18/sections.0.text',
	'element:elementalist-ability-18/sections.1.roll.tier1',
	'element:elementalist-ability-18/sections.1.roll.tier2',
	'element:elementalist-ability-18/sections.1.roll.tier3',
	'element:elementalist-ability-19/name',
	'element:elementalist-ability-19/target',
	'element:elementalist-ability-19/description',
	'element:elementalist-ability-19/sections.0.text',
	'element:elementalist-ability-19/sections.1.roll.tier1',
	'element:elementalist-ability-19/sections.1.roll.tier2',
	'element:elementalist-ability-19/sections.1.roll.tier3',
	'element:elementalist-ability-20/name',
	'element:elementalist-ability-20/target',
	'element:elementalist-ability-20/description',
	'element:elementalist-ability-20/sections.0.roll.tier1',
	'element:elementalist-ability-20/sections.0.roll.tier2',
	'element:elementalist-ability-20/sections.0.roll.tier3'
].sort();

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(elementalist, [ core ]);

/** Selects one of a panel's segmented pages by its rendered label. */
const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent || '');

const allLevelTwoFeatures = [ ...levelTwoFeatures(elementalist), ...elements.flatMap(element => levelTwoFeatures(element)) ];

const getFeature = (id: string) => {
	const feature = allLevelTwoFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Elementalist Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

const getAbility = (id: string) => {
	const ability = [ ...elements.flatMap(element => boundedAbilities(levelTwoFeatures(element))), ...levelTwoClassAbilities ].find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Elementalist Level 2 Ability '${id}' is missing`);
	}
	return ability;
};

const zhTWOf = (identity: string) => elementalistLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;

// Reason 2 at Level 2, so the calculator's Reason readings resolve to 2 and its fire immunity
// reading to 7; every expected value below is read back from the calculator, never hardcoded.
const makeHero = () => createHeroWithClass(elementalist, 2, FactoryLogic.createCharacteristics(0, 1, 2, 0, 0));

afterEach(cleanup);

describe('V1 Core Elementalist L2 manifest, catalog and presentation', () => {
	it('matches the independent live Elementalist Level 2 slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(39);
		expect(Object.keys(required)).toHaveLength(39);
		expect(Object.keys(required).sort()).toEqual(approvedIdentities);
		expect(Object.keys(liveFields).sort()).toEqual(approvedIdentities);
		expect(required).toEqual(liveFields);

		expect(elements.map(element => element.id)).toEqual([ 'elementalist-sub-1', 'elementalist-sub-2', 'elementalist-sub-3', 'elementalist-sub-4' ]);
		// The Void is the only element whose Level 2 grants an Ability.
		expect(elements.flatMap(element => boundedAbilities(levelTwoFeatures(element))).map(ability => ability.id)).toEqual([ 'elementalist-sub-4-2-1' ]);
	});

	it('keeps element metadata, Level 1 content and every Level 3+ sibling out of the slice', () => {
		// Level 3+ Features exist on all four elements and on the base class; none is reached.
		expect(Object.keys(required).some(identity => /elementalist-sub-\d-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(Object.keys(required).some(identity => /^element:elementalist-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(required[elementFieldIdentity('elementalist-sub-3', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('elementalist-sub-3-3-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('elementalist-sub-1-3-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('elementalist-sub-4-3-1', 'name')]).toBeUndefined();

		// The Level 3+ Features really are there to be missed, so the bound is doing work.
		expect(elementalist.featuresByLevel.some(level => level.level === 3)).toBe(true);
		expect(elements.every(element => element.featuresByLevel.some(level => level.level === 3))).toBe(true);
	});

	it('introduces abilities 17-20 without re-enumerating the Level 1 abilities 13-16', () => {
		expect([ ...v1ElementalistLevel2AbilityIDs ]).toEqual([
			'elementalist-ability-17',
			'elementalist-ability-18',
			'elementalist-ability-19',
			'elementalist-ability-20'
		]);
		expect(getV1ElementalistLevel2Abilities().map(ability => ability.id)).toEqual([ ...v1ElementalistLevel2AbilityIDs ]);

		// All four are 5-cost Level 2 abilities, exactly like 13-16 are 5-cost Level 1 ones.
		expect(getV1ElementalistLevel2Abilities().every(ability => (ability.cost === 5) && (ability.minLevel === 2))).toBe(true);

		// 13-16 belong to the completed Level 1 Ability slice and are not repeated here.
		const levelOneAbilityIdentities = Object.keys(createV1ElementalistLevel1AbilityRequiredCanonicalEnglish());
		expect(levelOneAbilityIdentities.some(identity => identity.startsWith('element:elementalist-ability-13/'))).toBe(true);
		expect(levelOneAbilityIdentities.some(identity => identity.startsWith('element:elementalist-ability-16/'))).toBe(true);
		expect(Object.keys(required).some(identity => /^element:elementalist-ability-(1[3-6])\//.test(identity))).toBe(false);
		expect(levelOneAbilityIdentities.filter(identity => Object.keys(required).includes(identity))).toEqual([]);
		expect(Object.keys(required).some(identity => identity.startsWith('element:elementalist-ability-21/'))).toBe(false);
	});

	it('keeps Disciple of the Green as one atomic canonical field through its Level 10 rows', () => {
		const identity = elementFieldIdentity('elementalist-sub-3-2-1', 'description');
		const canonicalEnglish = required[identity];

		expect(canonicalEnglish.startsWith('\nYou can use a maneuver to shapeshift')).toBe(true);
		expect(canonicalEnglish).toContain('| King terror lizard  | 10th');
		expect(canonicalEnglish).toContain('| Mohler              | 4th');
		// The catalog snapshot is the exact same untrimmed value, and one entry covers it all.
		expect(elementalistLevel2CatalogEntries.filter(entry => getEntryIdentity(entry) === identity)).toHaveLength(1);
		expect(elementalistLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.canonicalEnglish).toBe(canonicalEnglish);

		const zhTW = zhTWOf(identity);
		expect(zhTW).toBeDefined();
		// Every table row survives translation, Level 3+ rows included; no half-English table.
		expect(zhTW?.split('\n').filter(line => line.startsWith('|'))).toHaveLength(22);
		expect(zhTW).toContain('| 懼蜥王 | 10 級');
		expect(zhTW).toContain('| 魔獠豬 | 4 級');
		// The Owner deliberately retained this Great cat reading; it is not to be rewritten.
		expect(zhTW).toContain('若你落在體型 ≦ 你的敵人上');
	});

	it('adds exactly the 39 approved catalog entries and registers them in the live manifest', () => {
		expect(elementalistLevel2CatalogEntries).toHaveLength(39);
		expect(elementalistLevel2CatalogEntries.map(getEntryIdentity).sort()).toEqual(approvedIdentities);
		expect(elementalistLevel2CatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(elementalistLevel2CatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(elementalistLevel2CatalogEntries.every(entry => (entry.zhTW.trim() !== '') && (entry.zhTW !== entry.canonicalEnglish))).toBe(true);

		Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
			expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		});

		expect(zhTWOf('element:elementalist-2-1/name')).toBe('工藝類 / 學識類 / 超常類專長');
		expect(zhTWOf('element:elementalist-2-2/name')).toBe('5 費招式');
		expect(zhTWOf('element:elementalist-sub-1-2-1/name')).toBe('磐土門徒');
		expect(zhTWOf('element:elementalist-sub-2-2-2/name')).toBe('傷害調整');
		expect(zhTWOf('element:elementalist-sub-4-2-1/name')).toBe('空間無隙');
		expect(zhTWOf('element:elementalist-ability-17/sections.1.name')).toBe('續發');
		expect(zhTWOf('element:elementalist-ability-19/sections.1.roll.tier3')).toBe('8 火焰傷害');
	});

	it('preserves the two authored leading newlines the slice carries', () => {
		([
			[ 'elementalist-sub-4-2-1', 'sections.0.text' ],
			[ 'elementalist-ability-17', 'sections.0.text' ]
		] as const).forEach(([ elementID, field ]) => {
			const identity = elementFieldIdentity(elementID, field);
			expect(required[identity].startsWith('\n')).toBe(true);
			expect(elementalistLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.canonicalEnglish).toBe(required[identity]);
		});

		// Ability 17's three approved Markdown bullets survive as bullets.
		expect(zhTWOf('element:elementalist-ability-17/sections.0.text')?.split('\n').filter(line => line.startsWith('* '))).toHaveLength(3);
	});

	it('keeps the catalog complete while class level content stays unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'class-and-subclass-level-content',
			'official-ability-authored-content'
		]));
		expect(result.complete).toBe(false);
	});

	it('reads the Elementalist base and all four elements in zh-TW and back in canonical English', () => {
		const readings: { id: string, zhTW: string[], english: string[] }[] = [
			{ id: 'elementalist-2-1', zhTW: [ '工藝類 / 學識類 / 超常類專長' ], english: [ 'Crafting / Lore / Supernatural Perk' ] },
			{ id: 'elementalist-sub-1-2-1', zhTW: [ '磐土門徒', '永恆元素的連結' ], english: [ 'Disciple of Earth', 'element of permanence' ] },
			{ id: 'elementalist-sub-2-2-2', zhTW: [ '傷害調整' ], english: [ 'Damage Modifier' ] },
			{ id: 'elementalist-sub-3-2-1', zhTW: [ '翠息門徒', '懼蜥王' ], english: [ 'Disciple of the Green', 'King terror lizard' ] }
		];

		readings.forEach(reading => {
			const protectedFeatures = protectCanonicalState({
				label: `Elementalist Level 2 canonical Feature data (${reading.id})`,
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

	it('projects Disciple of Fire in Hero context and keeps the approved raw reading without one', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('elementalist-sub-2-2-1', 'description')];
		const approvedRaw = zhTWOf('element:elementalist-sub-2-2-1/description');
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'elementalist-sub-2-2-1',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		});

		// Library / no Hero: the calculator leaves the level expression authored, so the
		// packet-approved raw zh-TW stands exactly as approved.
		const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
		expect(noHeroCalculated).toBe(canonicalEnglish);
		expect(present(noHeroCalculated)).toBe(approvedRaw);
		expect(present(noHeroCalculated)).toContain('等於 5 + 你等級的火焰免疫');

		// Hero context projects only the immunity value AbilityLogic actually resolved.
		const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		const resolved = heroCalculated.match(/You have fire immunity equal to (-?\d+)\./)?.[1];
		expect(resolved).toBeDefined();
		expect(heroCalculated).not.toContain('5 plus your level');
		expect(present(heroCalculated)).toContain(`你擁有 ${resolved} 點火焰免疫。`);
		expect(present(heroCalculated)).not.toMatch(/[A-Za-z]/);
		// The surrounding approved prose, including the second paragraph, is untouched.
		expect(present(heroCalculated).split('\n\n')).toHaveLength(2);
		expect(present(heroCalculated)).toContain('等於你勝利值的鬥志');

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'elementalist-sub-2-2-1',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: heroCalculated
		})).toBe(heroCalculated);
	});

	it('projects O Flower Aid, O Earth Defend\'s Reason bullet while keeping its other two bullets', () => {
		const hero = makeHero();
		const reason = HeroLogic.getCharacteristic(hero, Characteristic.Reason);
		const canonicalEnglish = required[elementFieldIdentity('elementalist-ability-17', 'sections.0.text')];
		const approvedRaw = zhTWOf('element:elementalist-ability-17/sections.0.text');
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'elementalist-ability-17',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		});

		const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
		expect(noHeroCalculated).toBe(canonicalEnglish);
		expect(present(noHeroCalculated)).toBe(approvedRaw);
		expect(present(noHeroCalculated)).toContain('等於你`理智`的傷害');

		const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		expect(heroCalculated).toContain(`takes damage equal to ${reason}.`);
		expect(heroCalculated).not.toContain('your Reason score');

		const projected = present(heroCalculated);
		expect(projected).toContain(`他會受到 ${reason} 點傷害。`);
		expect(projected).not.toMatch(/[A-Za-z]/);
		// All three approved bullets survive, and the untouched two keep their approved wording.
		expect(projected.split('\n').filter(line => line.startsWith('* '))).toHaveLength(3);
		expect(projected).toContain('* 該區域對敵人而言視為困難地形。');
		expect(projected).toContain('花費任意數量的復元力');
	});

	it('projects the Green Animal Forms table without disturbing its Markdown structure', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('elementalist-sub-3-2-1', 'description')];
		const approvedRaw = zhTWOf('element:elementalist-sub-3-2-1/description');
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		// The FeaturePanel auto-calc path only runs in Hero context, so Library shows the
		// approved raw table untouched.
		expect(AbilityLogic.getTextEffect(canonicalEnglish, undefined)).not.toBe(approvedRaw);

		const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		const jump = heroCalculated.match(/you can high jump or long jump up to (-?\d+) squares\./)?.[1];
		expect(jump).toBeDefined();

		const projected = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'elementalist-sub-3-2-1',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: heroCalculated
		});

		// The whole table is still Chinese: a failed projection would fall back to full English.
		expect(projected).not.toBe(heroCalculated);
		expect(projected.split('\n').filter(line => line.startsWith('|'))).toHaveLength(22);
		expect(projected).toContain('| 懼蜥王 | 10 級');

		// Only the calculator's own two changes are projected: the resolved jump distance, and
		// the condition emphasis it introduced.
		expect(projected).toContain(`你可以跳高或跳遠最多 ${jump} 格。`);
		expect(projected).not.toContain('等於你速度一半的距離');
		expect(projected).toContain('該敵人會被擊倒**伏地**');
		expect(projected).toContain('若目標以此方式被**擒制**');
		expect(projected).toContain('目標會陷入**暈眩**（豁免解除）');
		expect(projected).toContain('你對陷入**出血**或疲態的目標');
		expect(projected).toContain('你最多可以同時**擒制** 8 個生物。');
		// The 'grab' verb is not the condition, so it is deliberately left unemphasized.
		expect(projected).toContain('你可以自動擒制目標。');
		// The Owner-retained Great cat reading survives projection unchanged.
		expect(projected).toContain('若你落在體型 ≦ 你的敵人上');
	});

	it('fails closed rather than guessing when the calculated English no longer matches the approved structure', () => {
		const canonicalEnglish = required[elementFieldIdentity('elementalist-sub-2-2-1', 'description')];
		const unsupported = `${canonicalEnglish.replace('5 plus your level', '7')} You also ignore cover.`;

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'elementalist-sub-2-2-1',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupported
		})).toBe(unsupported);
	});

	it('reuses the existing Power Roll presenter for all nine approved tier identities', () => {
		const hero = makeHero();
		const powerRollIdentities = [
			[ 'elementalist-ability-18', 'sections.1' ],
			[ 'elementalist-ability-19', 'sections.1' ],
			[ 'elementalist-ability-20', 'sections.0' ]
		] as const;

		let covered = 0;
		powerRollIdentities.forEach(([ abilityID, section ]) => {
			const ability = getAbility(abilityID);

			([ 1, 2, 3 ] as const).forEach(tier => {
				const field = `${section}.roll.tier${tier}`;
				const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
				expect(canonicalEnglish).toBeDefined();
				assertCanonicalEnglishCalculationInput(canonicalEnglish);

				const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
				const zhTW = localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

				// The damage number is the canonical calculator's own output, not the localizer's.
				const calculatedDamage = calculatedEnglish.match(/^(\d+)/)?.[1];
				expect(calculatedDamage).toBeDefined();
				expect(zhTW).toContain(`${calculatedDamage} `);
				expect(zhTW).not.toMatch(/[A-Za-z]/);
				expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish })).toBe(calculatedEnglish);
				covered += 1;
			});
		});
		expect(covered).toBe(9);
	});

	it('presents Subvert the Green Within\'s poison tiers in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const ability = getAbility('elementalist-ability-18');

		([ 1, 2, 3 ] as const).forEach(tier => {
			const field = `sections.1.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity('elementalist-ability-18', field)];
			const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'elementalist-ability-18', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

			// Library / no Hero keeps the approved unresolved `理智` arithmetic.
			const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
			expect(noHeroCalculated).toBe(canonicalEnglish);
			expect(present(noHeroCalculated)).toBe(zhTWOf(`element:elementalist-ability-18/${field}`));
			expect(present(noHeroCalculated)).toContain('+ `理智`毒素傷害');

			// Hero context reads the calculator's own resolved poison damage.
			const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
			const resolved = heroCalculated.match(/^(-?\d+) poison damage$/)?.[1];
			expect(resolved).toBeDefined();
			expect(present(heroCalculated)).toBe(`${resolved} 毒素傷害`);
		});
	});

	it('presents Volcano\'s Embrace damage, potency and restrained in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const ability = getAbility('elementalist-ability-20');
		const potencies = [ '[弱]', '[中]', '[強]' ];

		([ 1, 2, 3 ] as const).forEach(tier => {
			const field = `sections.0.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity('elementalist-ability-20', field)];
			const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'elementalist-ability-20', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

			// Library / no Hero: the damage and potency stay authored; only the emphasis the
			// calculator introduced on the condition is projected.
			const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
			const noHero = present(noHeroCalculated);
			expect(noHero).toContain('+ `理智`火焰傷害');
			expect(noHero).toContain(`\`敏捷\` < ${potencies[tier - 1]}`);
			expect(noHero).toContain('**束縛**（豁免解除）');

			// Hero context: the calculator's own resolved damage and potency value.
			const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
			const resolvedDamage = heroCalculated.match(/^(-?\d+) fire damage/)?.[1];
			const resolvedPotency = heroCalculated.match(/A < (-?\d+)/)?.[1];
			expect(resolvedDamage).toBeDefined();
			expect(resolvedPotency).toBeDefined();
			expect(present(heroCalculated)).toBe(`${resolvedDamage} 火焰傷害；\`敏捷\` < ${resolvedPotency}，**束縛**（豁免解除）`);
			expect(present(heroCalculated)).not.toMatch(/[A-Za-z]/);
		});
	});

	it('renders Disciple of Fire through the real non-Ability Feature path with Hero state protected', () => {
		const hero = makeHero();
		const feature = getFeature('elementalist-sub-2-2-1');
		const canonicalEnglish = required[elementFieldIdentity('elementalist-sub-2-2-1', 'description')];
		const resolved = AbilityLogic.getTextEffect(canonicalEnglish, hero).match(/You have fire immunity equal to (-?\d+)\./)?.[1];
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const protectedFeature = protectCanonicalState({
			label: 'Disciple of Fire canonical Feature data',
			capture: () => JSON.stringify(feature)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Disciple of Fire Feature path)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderFeature(feature, hero);
		const expectZhTW = () => {
			expectRendered(container, '烈火門徒');
			expectRendered(container, `你擁有 ${resolved} 點火焰免疫。`);
			expect(normalizedText(container)).not.toContain('Disciple of Fire');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedFeature, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Disciple of Fire');
				expectRendered(container, `You have fire immunity equal to ${resolved}.`);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		const inputs = getTextEffect.mock.calls.map(call => call[0]);
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('renders O Flower Aid, O Earth Defend through the real ability panel and sends only canonical English to the calculator', () => {
		const hero = makeHero();
		const reason = HeroLogic.getCharacteristic(hero, Characteristic.Reason);
		const ability = getAbility('elementalist-ability-17');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const protectedAbility = protectCanonicalState({
			label: 'O Flower Aid, O Earth Defend canonical Ability data',
			capture: () => JSON.stringify(ability)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (O Flower Aid, O Earth Defend Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderAbility(ability, hero);
		const expectZhTW = () => {
			expectRendered(container, '花援土禦');
			expectRendered(container, '續發');
			expectRendered(container, `他會受到 ${reason} 點傷害。`);
			expect(normalizedText(container)).not.toContain('O Flower Aid');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'O Flower Aid, O Earth Defend');
				expectRendered(container, `takes damage equal to ${reason}.`);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		const inputs = [
			...getTextEffect.mock.calls.map(call => call[0]),
			...getTierEffectCreature.mock.calls.map(call => call[0])
		];
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders Volcano\'s Embrace tiers in zh-TW through the real ability panel', () => {
		const hero = makeHero();
		const ability = getAbility('elementalist-ability-20');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, hero);

		expectRendered(container, '炎嶽囚籠');
		expect(tierTexts(container)[0]).toContain('火焰傷害');
		expect(tierTexts(container)[0]).toContain('束縛');

		switchLocale();
		expect(tierTexts(container)[0]).toContain('restrained');
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('reads the Elementalist Level 1 and Level 2 progression together in the class panel across a full locale round trip', () => {
		const hero = makeHero();
		const heroBefore = JSON.stringify(hero);
		const protectedClass = protectCanonicalState({
			label: 'Elementalist canonical class data (class panel)',
			capture: () => JSON.stringify(elementalist)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (class panel Level 1 to 2 progression)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderClassPanel(hero);
		clickPage(container, '特性');

		const expectZhTW = () => {
			// A Level 1 reading from the earlier Elementalist slices, next to this batch's Level 2 ones.
			expect(readFieldByExactLabel(container, '1 級')).toContain('精髓');
			expect(readFieldByExactLabel(container, '2 級')).toContain('工藝類 / 學識類 / 超常類專長');
			expect(readFieldByExactLabel(container, '2 級')).toContain('5 費招式');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedClass, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readFieldByExactLabel(container, 'Level 1')).toContain('Essence');
				expect(readFieldByExactLabel(container, 'Level 2')).toContain('Crafting / Lore / Supernatural Perk');
				expect(readFieldByExactLabel(container, 'Level 2')).toContain('5pt Ability');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		expect(JSON.stringify(hero)).toBe(heroBefore);
		expect(hero.class?.id).toBe(elementalist.id);
		expect(hero.class?.level).toBe(2);
	});

	it('shows a selected element\'s Level 2 progression without disturbing its completed Level 1 content', () => {
		const green = elements[2];
		const serialized = JSON.stringify(green);
		const protectedElement = protectCanonicalState({
			label: 'Green canonical element data',
			capture: () => JSON.stringify(green)
		});

		const { container } = renderSubclass(green);
		clickPage(container, '特性');

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedElement ],
			assertZhTW: () => {
				// This batch's Level 2 reading, alongside the already-approved Level 1 content.
				expectRendered(container, '2 級翠息門徒');
				expectRendered(container, '1 級翠息侍者');
				// Level 3+ stays outside this slice, so its readings are still canonical English.
				expectRendered(container, '3 級Remember Growth and Sun and Rain');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Disciple of the Green');
				expectRendered(container, 'Acolyte of the Green');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(container, '翠息門徒')
		});

		expect(green.id).toBe('elementalist-sub-3');
		expect(JSON.stringify(green)).toBe(serialized);
	});
});
