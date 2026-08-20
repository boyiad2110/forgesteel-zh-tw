// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1TacticianLevel2RequiredCanonicalEnglish, createV1TacticianLevel1AbilityRequiredCanonicalEnglish, createV1TacticianLevel1CompletionRequiredCanonicalEnglish, getV1TacticianDoctrines, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
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
import { tactician } from '@/data/classes/tactician/tactician';
import { core } from '@/data/sourcebooks/official/core';
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

const doctrines = getV1TacticianDoctrines();

const liveFields: Record<string, string> = { ...extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(tactician)) };
doctrines.forEach(doctrine => {
	const doctrineLevelTwo = levelTwoFeatures(doctrine);
	Object.assign(liveFields, extractLiveBoundedNonAbilityFeatureFields(doctrineLevelTwo));
	boundedAbilities(doctrineLevelTwo).forEach(ability => Object.assign(liveFields, extractLiveAbilityFields(ability)));
});

const required = createV1TacticianLevel2RequiredCanonicalEnglish();

const tacticianLevel2CatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

/** The 53 approved identities, written out independently of any extraction under test. */
const approvedIdentities = [
	'element:tactician-2-1/name',
	'element:tactician-sub-1-2-1/name',
	'element:tactician-sub-1-2-1/description',
	'element:tactician-sub-1-2-2/name',
	'element:tactician-sub-1-2-2a/name',
	'element:tactician-sub-1-2-2a/target',
	'element:tactician-sub-1-2-2a/description',
	'element:tactician-sub-1-2-2a/sections.0.text',
	'element:tactician-sub-1-2-2a/sections.1.name',
	'element:tactician-sub-1-2-2a/sections.1.effect',
	'element:tactician-sub-1-2-2b/name',
	'element:tactician-sub-1-2-2b/target',
	'element:tactician-sub-1-2-2b/description',
	'element:tactician-sub-1-2-2b/sections.0.text',
	'element:tactician-sub-1-2-2b/sections.1.roll.tier1',
	'element:tactician-sub-1-2-2b/sections.1.roll.tier2',
	'element:tactician-sub-1-2-2b/sections.1.roll.tier3',
	'element:tactician-sub-2-2-1/name',
	'element:tactician-sub-2-2-1/target',
	'element:tactician-sub-2-2-1/description',
	'element:tactician-sub-2-2-1/type.trigger',
	'element:tactician-sub-2-2-1/sections.0.text',
	'element:tactician-sub-2-2-2/name',
	'element:tactician-sub-2-2-2a/name',
	'element:tactician-sub-2-2-2a/target',
	'element:tactician-sub-2-2-2a/description',
	'element:tactician-sub-2-2-2a/sections.0.roll.tier1',
	'element:tactician-sub-2-2-2a/sections.0.roll.tier2',
	'element:tactician-sub-2-2-2a/sections.0.roll.tier3',
	'element:tactician-sub-2-2-2a/sections.1.text',
	'element:tactician-sub-2-2-2b/name',
	'element:tactician-sub-2-2-2b/target',
	'element:tactician-sub-2-2-2b/description',
	'element:tactician-sub-2-2-2b/sections.0.text',
	'element:tactician-sub-2-2-2b/sections.1.name',
	'element:tactician-sub-2-2-2b/sections.1.effect',
	'element:tactician-sub-3-2-1/name',
	'element:tactician-sub-3-2-1/description',
	'element:tactician-sub-3-2-1a/name',
	'element:tactician-sub-3-2-1a/description',
	'element:tactician-sub-3-2-2/name',
	'element:tactician-sub-3-2-2a/name',
	'element:tactician-sub-3-2-2a/target',
	'element:tactician-sub-3-2-2a/description',
	'element:tactician-sub-3-2-2a/type.trigger',
	'element:tactician-sub-3-2-2a/sections.0.text',
	'element:tactician-sub-3-2-2a/sections.1.roll.tier1',
	'element:tactician-sub-3-2-2a/sections.1.roll.tier2',
	'element:tactician-sub-3-2-2a/sections.1.roll.tier3',
	'element:tactician-sub-3-2-2b/name',
	'element:tactician-sub-3-2-2b/target',
	'element:tactician-sub-3-2-2b/description',
	'element:tactician-sub-3-2-2b/sections.0.text'
].sort();

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(tactician, [ core ]);

/** Selects one of a panel's segmented pages by its rendered label. */
const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent || '');

const allLevelTwoFeatures = [ ...levelTwoFeatures(tactician), ...doctrines.flatMap(doctrine => levelTwoFeatures(doctrine)) ];

const getFeature = (id: string) => {
	const feature = allLevelTwoFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Tactician Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

const getAbility = (id: string) => {
	const ability = doctrines.flatMap(doctrine => boundedAbilities(levelTwoFeatures(doctrine))).find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Tactician Level 2 Ability '${id}' is missing`);
	}
	return ability;
};

const zhTWOf = (identity: string) => tacticianLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;

// Might 2 / Reason 2 at Level 2; every expected value below is read back from the calculator's
// own output rather than hardcoded.
const makeHero = () => createHeroWithClass(tactician, 2, FactoryLogic.createCharacteristics(2, 1, 2, 0, 0));

afterEach(cleanup);

describe('V1 Core Tactician L2 manifest, catalog and presentation', () => {
	it('matches the independent live Tactician Level 2 slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(53);
		expect(Object.keys(required)).toHaveLength(53);
		expect(Object.keys(required).sort()).toEqual(approvedIdentities);
		expect(Object.keys(liveFields).sort()).toEqual(approvedIdentities);
		expect(required).toEqual(liveFields);

		expect(doctrines.map(doctrine => doctrine.id)).toEqual([ 'tactician-sub-1', 'tactician-sub-2', 'tactician-sub-3' ]);
	});

	it('reads the base class Level 2 root only, and reaches every Doctrine Level 2 Ability', () => {
		// The Tactician's own Level 2 authors exactly one Feature: the Perk.
		expect(levelTwoFeatures(tactician).map(feature => feature.id)).toEqual([ 'tactician-2-1' ]);
		expect(required[elementFieldIdentity('tactician-2-1', 'name')]).toBe('Exploration / Interpersonal / Intrigue Perk');

		// Mastermind authors Goaded as a Level 2 root Ability rather than inside its Choice; the
		// one shared collector reaches it exactly as it reaches each Choice's two options.
		expect(doctrines.flatMap(doctrine => boundedAbilities(levelTwoFeatures(doctrine))).map(ability => ability.id)).toEqual([
			'tactician-sub-1-2-2a',
			'tactician-sub-1-2-2b',
			'tactician-sub-2-2-1',
			'tactician-sub-2-2-2a',
			'tactician-sub-2-2-2b',
			'tactician-sub-3-2-2a',
			'tactician-sub-3-2-2b'
		]);

		// Vanguard's Mark Benefit package content is bounded non-Ability Feature content.
		expect(getFeature('tactician-sub-3-2-1a').type).toBe(FeatureType.PackageContent);
		expect(required[elementFieldIdentity('tactician-sub-3-2-1a', 'name')]).toBe('Mark Benefit');
	});

	it('keeps Doctrine metadata, Level 1 content and every Level 3+ sibling out of the slice', () => {
		expect(Object.keys(required).some(identity => /tactician-sub-\d-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(Object.keys(required).some(identity => /^element:tactician-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(required[elementFieldIdentity('tactician-sub-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('tactician-3-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('tactician-sub-3-5-1', 'name')]).toBeUndefined();

		// The Level 3+ content really is there to be missed, so the bound is doing work.
		expect(tactician.featuresByLevel.some(level => level.level === 3)).toBe(true);
		expect(doctrines[2].featuresByLevel.find(level => level.level === 5)?.features.length).toBeGreaterThan(0);

		// This slice is disjoint from both completed Tactician Level 1 slices.
		const levelOneIdentities = [
			...Object.keys(createV1TacticianLevel1AbilityRequiredCanonicalEnglish()),
			...Object.keys(createV1TacticianLevel1CompletionRequiredCanonicalEnglish())
		];
		expect(levelOneIdentities.filter(identity => Object.keys(required).includes(identity))).toEqual([]);
	});

	it('preserves the authored leading ASCII space on No Dying on My Watch tier 2', () => {
		const identity = elementFieldIdentity('tactician-sub-3-2-2a', 'sections.1.roll.tier2');
		const canonicalEnglish = required[identity];

		expect(canonicalEnglish).toBe(' R < [average], the target is frightened of the triggering ally (save ends)');
		expect(canonicalEnglish.startsWith(' ')).toBe(true);
		expect(canonicalEnglish.startsWith('  ')).toBe(false);
		// The live class data, the manifest and the catalog all carry the same untrimmed value.
		expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		expect(tacticianLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.canonicalEnglish).toBe(canonicalEnglish);
		// Its two siblings deliberately do not carry the space.
		expect(required[elementFieldIdentity('tactician-sub-3-2-2a', 'sections.1.roll.tier1')].startsWith(' ')).toBe(false);
		expect(required[elementFieldIdentity('tactician-sub-3-2-2a', 'sections.1.roll.tier3')].startsWith(' ')).toBe(false);
	});

	it('adds exactly the 53 approved catalog entries and registers them in the live manifest', () => {
		expect(tacticianLevel2CatalogEntries).toHaveLength(53);
		expect(tacticianLevel2CatalogEntries.map(getEntryIdentity).sort()).toEqual(approvedIdentities);
		expect(tacticianLevel2CatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(tacticianLevel2CatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(tacticianLevel2CatalogEntries.every(entry => (entry.zhTW.trim() !== '') && (entry.zhTW !== entry.canonicalEnglish))).toBe(true);

		Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
			expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		});

		expect(zhTWOf('element:tactician-2-1/name')).toBe('探索類 / 交涉類 / 隱密類專長');
		expect(zhTWOf('element:tactician-sub-1-2-2/name')).toBe('2 級準則招式');
		expect(zhTWOf('element:tactician-sub-2-2-2/name')).toBe('2 級準則招式');
		expect(zhTWOf('element:tactician-sub-3-2-2/name')).toBe('2 級準則招式');
		expect(zhTWOf('element:tactician-sub-2-2-1/name')).toBe('挑釁');
		expect(zhTWOf('element:tactician-sub-3-2-2b/name')).toBe('全員集合！');
	});

	it('keeps every Mark Benefit identity on the one approved reading without deduplicating them', () => {
		const markBenefitIdentities = [
			'element:tactician-sub-1-2-2a/sections.1.name',
			'element:tactician-sub-2-2-2b/sections.1.name',
			'element:tactician-sub-3-2-1a/name'
		];

		markBenefitIdentities.forEach(identity => {
			expect(required[identity]).toBe('Mark Benefit');
			expect(zhTWOf(identity)).toBe('標記益處');
		});
		// Each identity carries its own entry; none was collapsed into a shared one.
		expect(tacticianLevel2CatalogEntries.filter(entry => entry.zhTW === '標記益處')).toHaveLength(3);
	});

	it('records exactly the approved Mark Benefit glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => row.startsWith('Mark Benefit,'))).toEqual([ 'Mark Benefit,標記益處,game-term,approved' ]);
		// The already-approved standalone Mark term is untouched and not duplicated.
		expect(rows.filter(row => row.startsWith('Mark,'))).toEqual([ 'Mark,標記,game-term,approved' ]);
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

	it('reads each Doctrine Level 2 surface in zh-TW and back in canonical English', () => {
		const readings: { id: string, zhTW: string[], english: string[] }[] = [
			{ id: 'tactician-sub-1-2-1', zhTW: [ '滲透戰術', '保持靜默' ], english: [ 'Infiltration Tactics', 'stay silent' ] },
			{ id: 'tactician-sub-3-2-1', zhTW: [ '近戰制敵', '目標的速度會歸 0' ], english: [ 'Melee Superiority', 'speed is reduced to 0' ] },
			{ id: 'tactician-sub-3-2-1a', zhTW: [ '標記益處', '花費 2 點專注' ], english: [ 'Mark Benefit', 'spend 2 focus' ] }
		];

		readings.forEach(reading => {
			const protectedFeatures = protectCanonicalState({
				label: `Tactician Level 2 canonical Feature data (${reading.id})`,
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

	it('presents each Doctrine ability-choice root and its two nested Ability options', () => {
		const expected = [
			{ choice: 'tactician-sub-1-2-2', options: [ '戰爭迷霧', '衝著我來' ], english: [ 'Fog of War', 'Try Me Instead' ] },
			{ choice: 'tactician-sub-2-2-2', options: [ '我掩護你', '可乘之機' ], english: [ 'I\'ve Got Your Back', 'Targets of Opportunity' ] },
			{ choice: 'tactician-sub-3-2-2', options: [ '誓死守護', '全員集合！' ], english: [ 'No Dying on My Watch', 'Squad! On Me!' ] }
		];

		expected.forEach(entry => {
			const choice = getFeature(entry.choice);
			if (choice.type !== FeatureType.Choice) {
				throw new Error(`${entry.choice} is not a Choice`);
			}
			const serialized = JSON.stringify(choice);
			const panel = renderFeature(choice);

			expectRendered(panel.container, '2 級準則招式');
			entry.options.forEach(option => expectRendered(panel.container, option));

			switchLocale();
			expectRendered(panel.container, '2nd-Level Doctrine Ability');
			entry.english.forEach(option => expectRendered(panel.container, option));

			expect(choice.data.options.map(option => option.feature.id)).toEqual([ `${entry.choice}a`, `${entry.choice}b` ]);
			expect(JSON.stringify(choice)).toBe(serialized);
			panel.unmount();
		});
	});

	it('projects the three calculated prose identities in Hero context and keeps the approved raw reading without one', () => {
		const hero = makeHero();
		const cases = [
			{
				elementID: 'tactician-sub-1-2-2b',
				field: 'sections.0.text',
				unresolved: '你朝 1 個盟友遁移最多等於你速度的距離，',
				calculated: /You shift up to (-?\d+) squares directly toward an ally,/,
				resolved: (value: string) => `你朝 1 個盟友遁移最多 ${value} 格，`,
				keeps: '而你可以對近戰 1 射程內的 1 個生物發動以下武器打擊。'
			},
			{
				elementID: 'tactician-sub-3-2-2a',
				field: 'sections.0.text',
				unresolved: '你朝觸發盟友移動最多等於你速度的距離，',
				calculated: /You move up to (-?\d+) squares toward the triggering ally,/,
				resolved: (value: string) => `你朝觸發盟友移動最多 ${value} 格，`,
				// The authored literal '5 temporary Stamina' is never recomputed.
				keeps: '該盟友就會獲得 5 點臨時體力。'
			},
			{
				elementID: 'tactician-sub-3-2-2b',
				field: 'sections.0.text',
				unresolved: '每個目標的穩度都會獲得等於你`力量`的加值。',
				calculated: /each target has a bonus to stability equal to (-?\d+)\./,
				resolved: (value: string) => `每個目標的穩度都會獲得 ${value} 點加值。`,
				keeps: '每個目標都會獲得 2 點鬥志。'
			}
		];

		cases.forEach(scenario => {
			const canonicalEnglish = required[elementFieldIdentity(scenario.elementID, scenario.field)];
			const approvedRaw = zhTWOf(`element:${scenario.elementID}/${scenario.field}`);
			assertCanonicalEnglishCalculationInput(canonicalEnglish);

			const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: scenario.elementID,
				field: scenario.field,
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			});

			// Library / no Hero keeps the packet-approved unresolved reading.
			const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
			expect(noHeroCalculated).toBe(canonicalEnglish);
			expect(present(noHeroCalculated)).toBe(approvedRaw);
			expect(present(noHeroCalculated)).toContain(scenario.unresolved);

			// Hero context projects only the value AbilityLogic actually resolved.
			const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
			const value = heroCalculated.match(scenario.calculated)?.[1];
			expect(value).toBeDefined();

			const projected = present(heroCalculated);
			expect(projected).toContain(scenario.resolved(value as string));
			expect(projected).not.toContain(scenario.unresolved);
			expect(projected).toContain(scenario.keeps);
			expect(projected).not.toMatch(/[A-Za-z]/);

			expect(localizeCalculatedAuthoredTextPresentation({
				locale: 'en',
				elementID: scenario.elementID,
				field: scenario.field,
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: heroCalculated
			})).toBe(heroCalculated);
		});
	});

	it('fails closed rather than guessing when the calculated English no longer matches the approved structure', () => {
		const canonicalEnglish = required[elementFieldIdentity('tactician-sub-3-2-2b', 'sections.0.text')];
		const unsupported = `${canonicalEnglish.replace('equal to your Might score', 'equal to 2')} They also gain an edge.`;

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'tactician-sub-3-2-2b',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupported
		})).toBe(unsupported);
	});

	it('reuses the existing Power Roll presenter for all nine approved tier identities', () => {
		const hero = makeHero();
		const powerRollIdentities = [
			[ 'tactician-sub-1-2-2b', 'sections.1' ],
			[ 'tactician-sub-2-2-2a', 'sections.0' ],
			[ 'tactician-sub-3-2-2a', 'sections.1' ]
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

				// Every tier localizes; none falls back to the calculated English. The only Latin
				// left standing is the approved 'EoT' duration token the packet keeps as-is.
				expect(zhTW).not.toBe(calculatedEnglish);
				expect(zhTW.replace('EoT', '')).not.toMatch(/[A-Za-z]/);
				expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish })).toBe(calculatedEnglish);
				covered += 1;
			});
		});
		expect(covered).toBe(9);
	});

	it('presents I\'ve Got Your Back Reason damage and taunted in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const ability = getAbility('tactician-sub-2-2-2a');

		([ 1, 2, 3 ] as const).forEach(tier => {
			const field = `sections.0.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity('tactician-sub-2-2-2a', field)];
			const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'tactician-sub-2-2-2a', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

			// Library / no Hero keeps the approved unresolved `理智` arithmetic, with only the
			// emphasis the calculator introduced on the condition projected.
			const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
			expect(present(noHeroCalculated)).toContain('+ `理智`傷害');
			expect(present(noHeroCalculated)).toContain('**嘲諷**（EoT）');

			// Hero context reads the calculator's own resolved damage.
			const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
			const resolved = heroCalculated.match(/^(-?\d+) damage/)?.[1];
			expect(resolved).toBeDefined();
			expect(present(heroCalculated)).toBe(`${resolved} 傷害；**嘲諷**（EoT）`);
		});
	});

	it('presents No Dying on My Watch potency tiers, including the leading-space tier 2', () => {
		const hero = makeHero();
		const ability = getAbility('tactician-sub-3-2-2a');
		const potencies = [ '[弱]', '[中]', '[強]' ];

		([ 1, 2, 3 ] as const).forEach(tier => {
			const field = `sections.1.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity('tactician-sub-3-2-2a', field)];
			const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'tactician-sub-3-2-2a', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

			const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
			expect(present(noHeroCalculated)).toBe(`\`理智\` < ${potencies[tier - 1]}，目標對觸發盟友陷入**畏縮**（豁免解除）`);

			const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
			const resolved = heroCalculated.match(/R < (-?\d+)/)?.[1];
			expect(resolved).toBeDefined();
			// Tier 2 must localize exactly like its siblings despite the authored leading space.
			expect(present(heroCalculated)).toBe(`\`理智\` < ${resolved}，目標對觸發盟友陷入**畏縮**（豁免解除）`);
			expect(present(heroCalculated)).not.toMatch(/[A-Za-z]/);
		});
	});

	it('renders Try Me Instead through the real ability panel and sends only canonical English to the calculator', () => {
		const hero = makeHero();
		const speed = HeroLogic.getSpeed(hero).value;
		const ability = getAbility('tactician-sub-1-2-2b');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const protectedAbility = protectCanonicalState({
			label: 'Try Me Instead canonical Ability data',
			capture: () => JSON.stringify(ability)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Try Me Instead Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderAbility(ability, hero);
		const expectZhTW = () => {
			expectRendered(container, '衝著我來');
			expectRendered(container, `你朝 1 個盟友遁移最多 ${speed} 格`);
			expect(tierTexts(container)[0]).toContain('畏縮');
			expect(normalizedText(container)).not.toContain('Try Me Instead');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Try Me Instead');
				expectRendered(container, `You shift up to ${speed} squares directly toward an ally`);
				expect(tierTexts(container)[0]).toContain('frightened');
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

	it('renders No Dying on My Watch through the real ability panel with all three tiers localized', () => {
		const hero = makeHero();
		const speed = HeroLogic.getSpeed(hero).value;
		const ability = getAbility('tactician-sub-3-2-2a');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, hero);

		expectRendered(container, '誓死守護');
		expectRendered(container, `你朝觸發盟友移動最多 ${speed} 格`);
		expectRendered(container, '當目標對 1 個盟友造成傷害時。');
		// Every tier row reads in zh-TW, tier 2 included.
		tierTexts(container).forEach(text => {
			expect(text).toContain('目標對觸發盟友陷入');
			expect(text).not.toMatch(/frightened|triggering ally/);
		});

		switchLocale();
		tierTexts(container).forEach(text => expect(text).toContain('frightened'));
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('renders Squad! On Me! Might-derived stability through the real ability panel', () => {
		const hero = makeHero();
		const might = HeroLogic.getCharacteristic(hero, Characteristic.Might);
		const ability = getAbility('tactician-sub-3-2-2b');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const protectedAbility = protectCanonicalState({
			label: 'Squad! On Me! canonical Ability data',
			capture: () => JSON.stringify(ability)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Squad! On Me! Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderAbility(ability, hero);
		const expectZhTW = () => {
			expectRendered(container, '全員集合！');
			expectRendered(container, `每個目標的穩度都會獲得 ${might} 點加值。`);
			expect(normalizedText(container)).not.toContain('Squad! On Me!');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Squad! On Me!');
				expectRendered(container, `each target has a bonus to stability equal to ${might}.`);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		const inputs = getTextEffect.mock.calls.map(call => call[0]);
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('reads the Tactician Level 1 and Level 2 progression together in the class panel across a full locale round trip', () => {
		const hero = makeHero();
		const heroBefore = JSON.stringify(hero);
		const protectedClass = protectCanonicalState({
			label: 'Tactician canonical class data (class panel)',
			capture: () => JSON.stringify(tactician)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (class panel Level 1 to 2 progression)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderClassPanel(hero);
		clickPage(container, '特性');

		const expectZhTW = () => {
			// A Level 1 reading from the earlier Tactician slices, next to this batch's Level 2 one.
			expect(readFieldByExactLabel(container, '1 級')).toContain('專注');
			expect(readFieldByExactLabel(container, '2 級')).toBe('探索類 / 交涉類 / 隱密類專長');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedClass, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readFieldByExactLabel(container, 'Level 1')).toContain('Focus');
				expect(readFieldByExactLabel(container, 'Level 2')).toBe('Exploration / Interpersonal / Intrigue Perk');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		expect(JSON.stringify(hero)).toBe(heroBefore);
		expect(hero.class?.id).toBe(tactician.id);
		expect(hero.class?.level).toBe(2);
	});

	it('shows a selected Doctrine Level 2 progression without disturbing its completed Level 1 content', () => {
		const vanguard = doctrines[2];
		const serialized = JSON.stringify(vanguard);
		const protectedDoctrine = protectCanonicalState({
			label: 'Vanguard canonical Doctrine data',
			capture: () => JSON.stringify(vanguard)
		});

		const { container } = renderSubclass(vanguard);
		clickPage(container, '特性');

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedDoctrine ],
			assertZhTW: () => {
				expectRendered(container, '2 級近戰制敵');
				expectRendered(container, '標記益處');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Melee Superiority');
				expectRendered(container, 'Mark Benefit');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(container, '近戰制敵')
		});

		expect(vanguard.id).toBe('tactician-sub-3');
		expect(JSON.stringify(vanguard)).toBe(serialized);
	});
});
