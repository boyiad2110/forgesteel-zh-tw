// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FeatureType } from '@/enums/feature-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { Feature } from '@/models/feature';
import { core } from '@/data/sourcebooks/official/core';
import { nullClass } from '@/data/classes/null/null';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1NullLevel1AbilityRequiredCanonicalEnglish, createV1NullLevel1RemainingRequiredCanonicalEnglish, createV1NullLevel1SubclassCompletionRequiredCanonicalEnglish, getV1NullLevel1Abilities, getV1NullTraditions, v1LocalizationManifest, v1NullTraditionIDs } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, levelOneFeatures, normalizedText, readFieldByLabelPrefix, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

installResizeObserverStub();

const traditions = getV1NullTraditions();
const required = createV1NullLevel1SubclassCompletionRequiredCanonicalEnglish();
const baseRemainingRequired = createV1NullLevel1RemainingRequiredCanonicalEnglish();
const baseAbilityRequired = createV1NullLevel1AbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const { renderFeature, renderClassPanel, renderSubclass } = createClassPresentationHarness(nullClass, [ core ]);

/** A Null Hero whose Intuition is the value the Mastery tables resolve against. */
const makeHero = (intuition: number) => createHeroWithClass(nullClass, 1, FactoryLogic.createCharacteristics(0, 0, 0, intuition, 0));

const getTraditionFeature = (traditionID: string, featureID: string): Feature => {
	const search = (features: Feature[]): Feature | undefined => {
		for (const feature of features) {
			if (feature.id === featureID) {
				return feature;
			}
			if (feature.type === FeatureType.Multiple) {
				const found = search(feature.data.features);
				if (found) {
					return found;
				}
			}
		}
		return undefined;
	};

	const tradition = traditions.find(candidate => candidate.id === traditionID);
	if (!tradition) {
		throw new Error(`Null Tradition '${traditionID}' is missing`);
	}
	const feature = search(levelOneFeatures(tradition));
	if (!feature) {
		throw new Error(`Null Tradition Feature '${featureID}' is missing`);
	}
	return feature;
};

const countOccurrences = (haystack: string, needle: string) => haystack.split(needle).length - 1;

/**
 * The three Traditions, with the readings this slice must carry. `bonusOccurrences` is the
 * number of times that Tradition's Mastery table states the Intuition-derived forced movement
 * bonus: once for Chronokinetic and Cryokinetic, twice for Metakinetic.
 */
const traditionMetadata = [
	{
		id: 'null-sub-1',
		canonicalName: 'Chronokinetic',
		name: '掌宙',
		canonicalDescription: 'Your training unmoors you from temporal reality, allowing you to use the flow of time as another dimension that all things move through.',
		description: '你的訓練能讓你脫離現實的束縛，能夠將時間的流動視為萬物穿行的另一種維度。',
		skillFeatureID: 'null-sub-1-1-1',
		canonicalSkillName: 'Lore Skill',
		skillName: '學識類技能',
		skillDescription: '從學識類技能中選擇 1 項技能。',
		masteryGroupingID: 'null-sub-1-1-2',
		masteryTableID: 'null-sub-1-1-2a',
		masteryPackageID: 'null-sub-1-1-2b',
		canonicalMasteryName: 'Chronokinetic Mastery',
		masteryName: '掌宙大師',
		masteryPackageReading: '每當你發動【慣性護盾】招式時，你可以接著使用免費反應動作進行撤離移動動作。',
		bonusOccurrences: 1,
		laterLevelFeatureID: 'null-sub-1-2-1'
	},
	{
		id: 'null-sub-2',
		canonicalName: 'Cryokinetic',
		name: '冽脈',
		canonicalDescription: 'You can tap into absolute cold, the most essential energy of myriad manifolds, and manifest its effects in your body.',
		description: '你能夠運用絕對零度的寒冷，在你的身體上展現這股萬千衍界中最根本的能量。',
		skillFeatureID: 'null-sub-2-1-1',
		canonicalSkillName: 'Crafting Skill',
		skillName: '工藝類技能',
		skillDescription: '從工藝類技能中選擇 1 項技能。',
		masteryGroupingID: 'null-sub-2-1-2',
		masteryTableID: 'null-sub-2-1-2a',
		masteryPackageID: 'null-sub-2-1-2b',
		canonicalMasteryName: 'Cryokinetic Mastery',
		masteryName: '冽脈大師',
		masteryPackageReading: '每當你發動【慣性護盾】招式時，你可以接著使用免費反應動作進行擒抱機動動作。',
		bonusOccurrences: 1,
		laterLevelFeatureID: 'null-sub-2-2-1'
	},
	{
		id: 'null-sub-3',
		canonicalName: 'Metakinetic',
		name: '化勁',
		canonicalDescription: 'You learn to see through the illusions of the universe to more fully understand your body and its psionic potential.',
		description: '你學會看透宇宙的幻象，從而更深入地理解你的身體和靈能潛力。',
		skillFeatureID: 'null-sub-3-1-1',
		canonicalSkillName: 'Exploration Skill',
		skillName: '探索類技能',
		skillDescription: '從探索類技能中選擇 1 項技能。',
		masteryGroupingID: 'null-sub-3-1-2',
		masteryTableID: 'null-sub-3-1-2a',
		masteryPackageID: 'null-sub-3-1-2b',
		canonicalMasteryName: 'Metakinetic Mastery',
		masteryName: '化勁大師',
		masteryPackageReading: '每當你發動【慣性護盾】招式時，你可以接著使用免費反應動作進行擊退機動動作。',
		bonusOccurrences: 2,
		laterLevelFeatureID: 'null-sub-3-2-1'
	}
];

const unresolvedBonusReading = '強制移動的距離會獲得等於你';
const resolvedBonusReading = (value: number) => `強制移動的距離會獲得 ${value} 點加值`;

afterEach(cleanup);

describe('V1 Core Null Level 1 subclass completion catalog and presentation', () => {
	it('adds the exact bounded 31-identity manifest and catalog slice from an independent live extraction', () => {
		// Built here from live canonical data rather than replayed from the approved packet, so
		// this stays evidence about the current source instead of a historical snapshot.
		const independentlyExtracted: Record<string, string> = {};
		independentlyExtracted[elementFieldIdentity(nullClass.id, 'subclassName')] = nullClass.subclassName;
		traditions.forEach(tradition => {
			independentlyExtracted[elementFieldIdentity(tradition.id, 'name')] = tradition.name;
			if (tradition.description !== '') {
				independentlyExtracted[elementFieldIdentity(tradition.id, 'description')] = tradition.description;
			}
			Object.entries(extractLiveBoundedNonAbilityFeatureFields(levelOneFeatures(tradition))).forEach(([ identity, canonicalEnglish ]) => {
				expect(independentlyExtracted[identity]).toBeUndefined();
				independentlyExtracted[identity] = canonicalEnglish;
			});
		});

		expect(v1NullTraditionIDs).toEqual([ 'null-sub-1', 'null-sub-2', 'null-sub-3' ]);
		expect(Object.keys(independentlyExtracted)).toHaveLength(31);

		// The production manifest slice is exactly those identities, with the same canonical
		// snapshots - including the leading newline each Mastery table is authored with.
		expect(required).toEqual(independentlyExtracted);
		expect(required[elementFieldIdentity('null-sub-1-1-2a', 'description')].startsWith('\n')).toBe(true);
		expect(required[elementFieldIdentity('null-sub-2-1-2a', 'description')].startsWith('\n')).toBe(true);
		expect(required[elementFieldIdentity('null-sub-3-1-2a', 'description')].startsWith('\n')).toBe(true);

		expect(catalogEntries).toHaveLength(31);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(catalogEntries.every(entry => (entry.approval === 'approved') && (entry.canonicalEnglish === required[getEntryIdentity(entry)]))).toBe(true);
	});

	it('leaves both frozen Null Level 1 base slices intact and disjoint from this one', () => {
		expect(Object.keys(baseRemainingRequired)).toHaveLength(36);
		expect(getV1NullLevel1Abilities()).toHaveLength(18);
		expect(Object.keys(baseAbilityRequired)).toHaveLength(115);

		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(baseRemainingRequired, identity))).toBe(false);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(baseAbilityRequired, identity))).toBe(false);

		// A representative reading from each frozen slice stays where it already lives.
		expect(baseRemainingRequired[elementFieldIdentity('null-resource', 'name')]).toBe('Discipline');
		expect(required[elementFieldIdentity('null-resource', 'name')]).toBeUndefined();
		expect(baseAbilityRequired[elementFieldIdentity('null-1-4', 'name')]).toBe('Null Field');
		expect(required[elementFieldIdentity('null-1-4', 'name')]).toBeUndefined();
	});

	it('keeps each Mastery grouping’s generated description required, reading mechanically from the approved Mastery title', () => {
		const zhTWByIdentity = new Map(catalogEntries.map(entry => [ getEntryIdentity(entry), entry.zhTW ]));

		traditionMetadata.forEach(tradition => {
			// The Feature factory composes the grouping's description from its children's names.
			// It is still what FeaturePanel renders for the grouping, so it is required like any
			// other reading, and its zh-TW is the approved Mastery title joined mechanically.
			expect(required[elementFieldIdentity(tradition.masteryGroupingID, 'description')]).toBe(`${tradition.canonicalMasteryName}, ${tradition.canonicalMasteryName}`);
			expect(zhTWByIdentity.get(elementFieldIdentity(tradition.masteryGroupingID, 'description'))).toBe(`${tradition.masteryName}、${tradition.masteryName}`);
			expect(zhTWByIdentity.get(elementFieldIdentity(tradition.masteryGroupingID, 'name'))).toBe(tradition.masteryName);
			expect(zhTWByIdentity.get(elementFieldIdentity(tradition.masteryTableID, 'name'))).toBe(tradition.masteryName);
			expect(zhTWByIdentity.get(elementFieldIdentity(tradition.masteryPackageID, 'name'))).toBe(tradition.masteryName);
		});
	});

	it('excludes Level 2 and later Tradition content', () => {
		traditionMetadata.forEach(tradition => {
			expect(required[elementFieldIdentity(tradition.laterLevelFeatureID, 'name')]).toBeUndefined();
		});

		// The Level 2 Tradition ability choices and their abilities stay out too.
		expect(required[elementFieldIdentity('null-sub-1-2-2', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('null-sub-1-2-2a', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('null-sub-2-2-2a', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('null-sub-3-2-2a', 'name')]).toBeUndefined();
	});

	it('keeps completeness healthy while the parent class domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([ 'class-and-subclass-level-content', 'official-ability-authored-content' ]));
		expect(result.complete).toBe(false);
	});

	it('records no glossary delta for this batch', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		// `Tradition` was already approved and remains the authority for the subclass category.
		expect(rows.filter(row => /^Tradition,/.test(row))).toEqual([ 'Tradition,流派,game-term,approved' ]);

		// The Tradition and Mastery names stay identity-specific; none becomes a global term,
		// and no global `Mastery` mapping is inferred from them.
		expect(rows.some(row => /^(Chronokinetic|Cryokinetic|Metakinetic)( Mastery)?,/.test(row))).toBe(false);
		expect(rows.some(row => /^Mastery,/.test(row))).toBe(false);
	});

	it('renders the Tradition category and all three Traditions through the class presentation, then restores canonical English', () => {
		const serialized = JSON.stringify(nullClass);
		const { container } = renderClassPanel();

		expect(readFieldByLabelPrefix(container, '流派')).toBe('掌宙, 冽脈, 化勁');
		traditionMetadata.forEach(tradition => expectRendered(container, tradition.name));

		switchLocale();

		expect(readFieldByLabelPrefix(container, 'Tradition')).toBe('Chronokinetic, Cryokinetic, Metakinetic');
		expect(JSON.stringify(nullClass)).toBe(serialized);
	});

	it.each(traditionMetadata)('renders $canonicalName metadata through SubclassPanel and restores canonical English', ({ id, name, description, canonicalName, canonicalDescription }) => {
		const tradition = traditions.find(candidate => candidate.id === id);
		if (!tradition) {
			throw new Error(`Null Tradition '${id}' is missing`);
		}
		const serialized = JSON.stringify(tradition);
		const { container } = renderSubclass(tradition);

		expectRendered(container, name);
		expectRendered(container, description);

		switchLocale();

		expectRendered(container, canonicalName);
		expectRendered(container, canonicalDescription);
		expect(JSON.stringify(tradition)).toBe(serialized);
	});

	it.each(traditionMetadata)('renders $canonicalName’s skill choice and Inertial Shield package reading', ({ id, skillFeatureID, canonicalSkillName, skillName, skillDescription, masteryPackageID, masteryName, masteryPackageReading }) => {
		const skill = renderFeature(getTraditionFeature(id, skillFeatureID));
		expectRendered(skill.container, skillName);
		expectRendered(skill.container, skillDescription);
		expect(skill.container.textContent).not.toContain(canonicalSkillName);
		skill.unmount();

		const packageContent = renderFeature(getTraditionFeature(id, masteryPackageID));
		expectRendered(packageContent.container, masteryName);
		expectRendered(packageContent.container, masteryPackageReading);
		expect(packageContent.container.textContent).not.toContain('Inertial Shield');
	});

	it.each(traditionMetadata)('renders $canonicalName Mastery’s approved raw zh-TW table without a Hero', ({ id, masteryTableID, masteryName, bonusOccurrences }) => {
		const masteryTable = getTraditionFeature(id, masteryTableID);
		const { container } = renderFeature(masteryTable);
		const text = normalizedText(container);

		expectRendered(container, masteryName);
		expectRendered(container, '隨著你累積紀律');
		expectRendered(container, '你的擒抱和擊退機動動作會獲得雙優勢。');

		// The unresolved characteristic expression keeps its approved code-marked reading, and
		// nothing from the canonical English table leaks into the Library view.
		expect(countOccurrences(text, unresolvedBonusReading)).toBe(bonusOccurrences);
		expect(Array.from(container.querySelectorAll('code')).map(node => node.textContent)).toContain('直覺');
		expect(text).not.toContain('forced movement distance gains a bonus');
		expect(text).not.toContain(resolvedBonusReading(2));
	});

	it.each(traditionMetadata)('projects exactly $bonusOccurrences resolved Intuition bonus reading(s) for $canonicalName Mastery with a Hero', ({ id, masteryTableID, bonusOccurrences }) => {
		const masteryTable = getTraditionFeature(id, masteryTableID);
		const hero = makeHero(2);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const { container } = renderFeature(masteryTable, hero);
		const assertZhTW = () => {
			const text = normalizedText(container);
			expect(countOccurrences(text, resolvedBonusReading(2))).toBe(bonusOccurrences);
			expect(text).not.toContain(unresolvedBonusReading);
			// The projection replaces only that value; the rest of the approved table stays.
			expect(text).not.toMatch(/[A-Za-z]{4,}/);
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: `${id} Mastery Feature`, capture: () => JSON.stringify(masteryTable) }),
				protectCanonicalState({ label: 'Null Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: assertZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				const text = normalizedText(container);
				expect(countOccurrences(text, 'the forced movement distance gains a bonus equal to 2')).toBe(bonusOccurrences);
				expect(text).not.toContain('equal to your Intuition score');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: assertZhTW
		});

		// Every value the calculator saw was canonical English, never zh-TW.
		expect(getTextEffect.mock.calls.length).toBeGreaterThan(0);
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it.each(traditionMetadata)('falls back to the whole calculated English when $canonicalName Mastery is structurally rewritten', ({ masteryTableID }) => {
		const canonicalEnglish = required[elementFieldIdentity(masteryTableID, 'description')];
		// A rewrite that drops the phrase rather than resolving its value: the projection can no
		// longer prove what the calculator did, so the presenter shows the calculated English whole.
		const rewritten = canonicalEnglish.replace(/the forced movement distance gains a bonus equal to your Intuition score/g, 'the forced movement distance is doubled');
		const presented = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: masteryTableID,
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: rewritten
		});

		expect(presented).toBe(rewritten);
		expect(presented).not.toMatch(/[一-鿿]/);
	});

	it('fails closed when a resolved value cannot be matched against the approved localized snapshot', () => {
		const canonicalEnglish = required[elementFieldIdentity('null-sub-3-1-2a', 'description')];
		// Metakinetic states the bonus twice; a calculated result that resolved only one of them
		// is an occurrence-count mismatch, so nothing is projected.
		const partial = canonicalEnglish.replace('the forced movement distance gains a bonus equal to your Intuition score', 'the forced movement distance gains a bonus equal to 2');
		const presented = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'null-sub-3-1-2a',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: partial
		});

		expect(presented).toBe(partial);
		expect(presented).not.toMatch(/[一-鿿]/);
	});

	it('keeps canonical English as the only calculation input across the whole subclass slice', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const hero = makeHero(2);

		traditions.forEach(tradition => renderSubclass(tradition).unmount());
		renderClassPanel(hero).unmount();

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});
});
