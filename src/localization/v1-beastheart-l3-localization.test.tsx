// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { Ability } from '@/models/ability';
import { Feature } from '@/models/feature';
import { beastheart } from '@/data/classes/beastheart/beastheart';
import { core } from '@/data/sourcebooks/official/core';
import { beastheartSourcebook } from '@/data/sourcebooks/official/beastheart';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1BeastheartLevel2RequiredCanonicalEnglish, createV1BeastheartLevel3RequiredCanonicalEnglish, getV1BeastheartLevel3Abilities, v1BeastheartLevel3AbilityIDs, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
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
 * The approved slice, transcribed from packet `beastheart-l3` revision r2 rather than generated
 * from the manifest builder under test, so a change to that builder cannot silently redefine
 * what this slice is expected to contain.
 */
const approvedSliceIdentities = [
	'element:beastheart-3-1/name',
	'element:beastheart-ability-13/name',
	'element:beastheart-ability-13/description',
	'element:beastheart-ability-13/type.trigger',
	'element:beastheart-ability-13/target',
	'element:beastheart-ability-13/sections.0.text',
	'element:beastheart-ability-13/sections.1.roll.tier1',
	'element:beastheart-ability-13/sections.1.roll.tier2',
	'element:beastheart-ability-13/sections.1.roll.tier3',
	'element:beastheart-ability-14/name',
	'element:beastheart-ability-14/description',
	'element:beastheart-ability-14/target',
	'element:beastheart-ability-14/sections.0.roll.tier1',
	'element:beastheart-ability-14/sections.0.roll.tier2',
	'element:beastheart-ability-14/sections.0.roll.tier3',
	'element:beastheart-ability-14/sections.1.text',
	'element:beastheart-ability-15/name',
	'element:beastheart-ability-15/description',
	'element:beastheart-ability-15/target',
	'element:beastheart-ability-15/sections.0.roll.tier1',
	'element:beastheart-ability-15/sections.0.roll.tier2',
	'element:beastheart-ability-15/sections.0.roll.tier3',
	'element:beastheart-ability-15/sections.1.text',
	'element:beastheart-ability-16/name',
	'element:beastheart-ability-16/description',
	'element:beastheart-ability-16/target',
	'element:beastheart-ability-16/sections.0.roll.tier1',
	'element:beastheart-ability-16/sections.0.roll.tier2',
	'element:beastheart-ability-16/sections.0.roll.tier3',
	'element:beastheart-ability-16/sections.1.text'
];

const required = createV1BeastheartLevel3RequiredCanonicalEnglish();
const levelTwoRequired = createV1BeastheartLevel2RequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const levelThreeFeatures = (owner: { featuresByLevel: { level: number, features: Feature[] }[] }) => owner.featuresByLevel.find(level => level.level === 3)?.features || [];

const abilities = getV1BeastheartLevel3Abilities();

const getAbility = (abilityID: string): Ability => {
	const ability = abilities.find(candidate => candidate.id === abilityID);
	if (!ability) {
		throw new Error(`Beastheart Level 3 ability '${abilityID}' is missing`);
	}
	return ability;
};

/**
 * Might 2 drives the `+ M` damage and the Death and Violence shift, Intuition 3 the `+ I` damage
 * and the Jaws of Death pull, so no two projected values in this slice are confusable.
 * AbilityLogic derives potency from the highest characteristic, which is Intuition here, giving
 * weak 1 / average 2 / strong 3 - including for the Presence-worded `P <` tiers every one of
 * these four abilities uses.
 */
const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...beastheart, level: 3, characteristics: FactoryLogic.createCharacteristics(2, 1, 0, 3, 1) };
	return hero;
};

const { renderFeature, renderAbility } = createClassPresentationHarness(beastheart, [ core, beastheartSourcebook ]);

const textReading = (elementID: string, field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: elementID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

/** PowerRollPanel only offers a distance selection when an ability authors more than one. */
const productionDistance = (ability: Ability) => (ability.distance.length > 1 ? ability.distance[0].type : undefined);

const tierReading = (abilityID: string, sectionIndex: number, tier: number, hero?: ReturnType<typeof makeHero>) => {
	const ability = getAbility(abilityID);
	const field = `sections.${sectionIndex}.roll.tier${tier}`;
	const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, productionDistance(ability), hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Beastheart Level 3 catalog and presentation', () => {
	it('adds exactly the approved 30-identity manifest and catalog slice', () => {
		expect(approvedSliceIdentities).toHaveLength(30);
		expect(new Set(approvedSliceIdentities).size).toBe(30);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());

		const catalogIdentities = catalogEntries.map(getEntryIdentity);
		expect(catalogIdentities).toHaveLength(30);
		expect(new Set(catalogIdentities).size).toBe(30);
		expect(catalogIdentities.slice().sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(catalogEntries.every(entry => entry.zhTW === entry.zhTW.trim())).toBe(true);

		// Every one of the 30 reaches the production manifest as its own required identity.
		const manifestRequired = v1LocalizationManifest.requiredCanonicalEnglish;
		approvedSliceIdentities.forEach(identity => expect(manifestRequired[identity]).toBe(required[identity]));
	});

	it('agrees with an independent bounded walk and the exact approved ability list', () => {
		// Level 3 authors a single ClassAbility root, whose factory-composed name is the only
		// reading the shared bounded walk contributes; its description is empty and a ClassAbility
		// is neither a Choice nor a Multiple, so the walk descends nowhere.
		const independentlyWalked = extractLiveBoundedNonAbilityFeatureFields(levelThreeFeatures(beastheart));
		expect(Object.keys(independentlyWalked)).toEqual([ 'element:beastheart-3-1/name' ]);
		expect(independentlyWalked['element:beastheart-3-1/name']).toBe('7pt Ability');
		expect(required['element:beastheart-3-1/name']).toBe('7pt Ability');

		const levelThreeRoots = levelThreeFeatures(beastheart);
		expect(levelThreeRoots).toHaveLength(1);
		expect(levelThreeRoots[0].type).toBe(FeatureType.ClassAbility);
		expect(levelThreeRoots[0].description).toBe('');

		expect(v1BeastheartLevel3AbilityIDs).toEqual([ 'beastheart-ability-13', 'beastheart-ability-14', 'beastheart-ability-15', 'beastheart-ability-16' ]);
		expect(abilities.map(ability => ability.id)).toEqual([ ...v1BeastheartLevel3AbilityIDs ]);
		expect(abilities.every(ability => ability.cost === 7)).toBe(true);
	});

	it('leaves subclasses, Companion and Summon records, other levels and abilities 17+ outside the slice', () => {
		expect(Object.keys(required).some(identity => identity.includes('beastheart-companion'))).toBe(false);
		expect(Object.keys(required).some(identity => identity.includes('summon'))).toBe(false);
		expect(Object.keys(required).some(identity => /^element:beastheart-sub-/.test(identity))).toBe(false);

		// Only abilities 13-16 are read; 12 and 17 are the immediate neighbours that must stay out.
		[ 'beastheart-ability-12', 'beastheart-ability-17' ].forEach(abilityID => {
			expect(Object.keys(required).some(identity => identity.startsWith(`element:${abilityID}/`))).toBe(false);
		});

		// All four Wild Nature subclasses author an empty Level 3 feature array, so there is no
		// subclass Level 3 content for this slice to have missed.
		beastheart.subclasses.forEach(subclass => expect(levelThreeFeatures(subclass)).toEqual([]));

		// Every other Beastheart level stays out of this slice.
		beastheart.featuresByLevel.filter(level => level.level !== 3).forEach(level => {
			level.features.forEach(feature => {
				expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
			});
		});

		// And the slice is disjoint from the Level 2 slice that preceded it.
		Object.keys(required).forEach(identity => expect(Object.prototype.hasOwnProperty.call(levelTwoRequired, identity)).toBe(false));
	});

	it('keeps localization integrity healthy while the parent domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);

		// This slice deliberately leaves both parent domains unresolved; nothing here pins the
		// unrelated global unresolved state or a global required total.
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
	});

	it('records no glossary change for this batch', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		// The four Level 3 ability names stay Beastheart identity-scoped; none became a reusable
		// mapping, so `glossaryDelta = []` for this packet.
		expect(rows.some(row => /^(Death and Violence|Head to Head|Jaws of Death|Shieldbreaker|7pt Ability),/.test(row))).toBe(false);
		[ '暴虐死劫', '燃血頭槌', '死亡之顎', '破甲裂盾' ].forEach(name => expect(rows.some(row => row.includes(name))).toBe(false));
		expect(rows).toContain('Beastheart,獸魂者,game-term,approved');
	});

	it('renders the Level 3 7pt Ability choice in approved zh-TW and restores canonical English', () => {
		const feature = levelThreeFeatures(beastheart)[0];
		const serialized = JSON.stringify(feature);
		const { container } = renderFeature(feature, makeHero());

		expectRendered(container, '7 費招式');
		expect(container.textContent).not.toContain('7pt Ability');

		switchLocale();

		expectRendered(container, '7pt Ability');
		expect(JSON.stringify(feature)).toBe(serialized);
	});

	it.each([
		{ abilityID: 'beastheart-ability-13', name: '暴虐死劫', description: '你從敵人的屍體上一躍而起。', canonicalName: 'Death and Violence' },
		{ abilityID: 'beastheart-ability-14', name: '燃血頭槌', description: '你用鮮血淋漓的額頭猛撞，讓契獸陷入狂暴。', canonicalName: 'Head to Head' },
		{ abilityID: 'beastheart-ability-15', name: '死亡之顎', description: '幽靈般的利齒咬住敵人，將他鍊在你身旁並汲取生命精華。', canonicalName: 'Jaws of Death' },
		{ abilityID: 'beastheart-ability-16', name: '破甲裂盾', description: '你擊穿對方的防禦並粉碎護甲，讓他門戶大開。', canonicalName: 'Shieldbreaker' }
	])('renders $canonicalName through AbilityPanel in approved zh-TW', ({ abilityID, name, description, canonicalName }) => {
		const ability = getAbility(abilityID);
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, makeHero());

		expectRendered(container, name);
		expectRendered(container, description);
		expect(readFieldByLabelPrefix(container, '目標')).toBe('1 個生物');
		expect(container.textContent).not.toContain(canonicalName);

		switchLocale();

		expectRendered(container, canonicalName);
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('renders Death and Violence’s approved trigger reading', () => {
		const { container } = renderAbility(getAbility('beastheart-ability-13'));
		expectRendered(container, '當你的契獸發動招式將目標的體力歸 0 時。');
		expect(container.textContent).not.toContain('reduces the target to 0 Stamina');
	});

	it.each([
		{ abilityID: 'beastheart-ability-16', zhTW: '直到你的下個回合開始前，對目標造成傷害的下個生物會獲得 3 點鬥志，而且可以將這些鬥志用於觸發此效果的傷害。', canonical: 'gains 3 surges' }
	])('renders $abilityID’s uncalculated closing section in approved zh-TW', ({ abilityID, zhTW, canonical }) => {
		// Shieldbreaker's closing section carries no calculated transform on either path, so it is
		// the plain approved reading with and without a Hero.
		const canonicalEnglish = required[elementFieldIdentity(abilityID, 'sections.1.text')];
		expect(AbilityLogic.getTextEffect(canonicalEnglish, undefined)).toBe(canonicalEnglish);
		expect(AbilityLogic.getTextEffect(canonicalEnglish, makeHero())).toBe(canonicalEnglish);

		const { container } = renderAbility(getAbility(abilityID), makeHero());
		expectRendered(container, zhTW);
		expect(container.textContent).not.toContain(canonical);
	});

	/**
	 * All twelve Power Roll tiers, on both the Hero and the Library path. Every one of them goes
	 * through the existing shared Power Roll presenter unchanged: no new grammar was added and no
	 * global regex was widened for this batch.
	 */
	it.each([
		// Death and Violence: potency plus a save-ends condition, and tier 1 carries no damage at all.
		{ abilityID: 'beastheart-ability-13', section: 1, tier: 1, rawZhTW: '`氣場` < [弱]，**畏縮**（豁免解除）', heroZhTW: '`氣場` < 1，**畏縮**（豁免解除）' },
		{ abilityID: 'beastheart-ability-13', section: 1, tier: 2, rawZhTW: '4 心靈傷害；`氣場` < [中]，**畏縮**（豁免解除）', heroZhTW: '4 心靈傷害；`氣場` < 2，**畏縮**（豁免解除）' },
		{ abilityID: 'beastheart-ability-13', section: 1, tier: 3, rawZhTW: '8 心靈傷害；`氣場` < [強]，**畏縮**（豁免解除）', heroZhTW: '8 心靈傷害；`氣場` < 3，**畏縮**（豁免解除）' },
		// Head to Head: Might-derived damage beside a Presence-worded potency.
		{ abilityID: 'beastheart-ability-14', section: 0, tier: 1, rawZhTW: '13 + `力量`傷害；`氣場` < [弱]，**暈眩**（豁免解除）', heroZhTW: '15 傷害；`氣場` < 1，**暈眩**（豁免解除）' },
		{ abilityID: 'beastheart-ability-14', section: 0, tier: 2, rawZhTW: '19 + `力量`傷害；`氣場` < [中]，**暈眩**（豁免解除）', heroZhTW: '21 傷害；`氣場` < 2，**暈眩**（豁免解除）' },
		{ abilityID: 'beastheart-ability-14', section: 0, tier: 3, rawZhTW: '25 + `力量`傷害；`氣場` < [強]，**暈眩**（豁免解除）', heroZhTW: '27 傷害；`氣場` < 3，**暈眩**（豁免解除）' },
		// Jaws of Death: Intuition-derived damage, and the ability authors two distances.
		{ abilityID: 'beastheart-ability-15', section: 0, tier: 1, rawZhTW: '7 + `直覺`傷害；`氣場` < [弱]，**虛弱**（豁免解除）', heroZhTW: '10 傷害；`氣場` < 1，**虛弱**（豁免解除）' },
		{ abilityID: 'beastheart-ability-15', section: 0, tier: 2, rawZhTW: '10 + `直覺`傷害；`氣場` < [中]，**虛弱**（豁免解除）', heroZhTW: '13 傷害；`氣場` < 2，**虛弱**（豁免解除）' },
		{ abilityID: 'beastheart-ability-15', section: 0, tier: 3, rawZhTW: '14 + `直覺`傷害；`氣場` < [強]，**虛弱**（豁免解除）', heroZhTW: '17 傷害；`氣場` < 3，**虛弱**（豁免解除）' },
		// Shieldbreaker: characteristic damage alone, which the calculator touches only in Hero context.
		{ abilityID: 'beastheart-ability-16', section: 0, tier: 1, rawZhTW: '9 + `力量`傷害', heroZhTW: '11 傷害' },
		{ abilityID: 'beastheart-ability-16', section: 0, tier: 2, rawZhTW: '14 + `力量`傷害', heroZhTW: '16 傷害' },
		{ abilityID: 'beastheart-ability-16', section: 0, tier: 3, rawZhTW: '19 + `力量`傷害', heroZhTW: '21 傷害' }
	])('projects $abilityID tier $tier on both the Hero and the Library path', ({ abilityID, section, tier, rawZhTW, heroZhTW }) => {
		expect(tierReading(abilityID, section, tier)).toBe(rawZhTW);
		expect(tierReading(abilityID, section, tier, makeHero())).toBe(heroZhTW);
	});

	it.each([
		{ abilityID: 'beastheart-ability-13', section: 1, tier: 2, heroZhTW: '4 心靈傷害；`氣場` < 2，**畏縮**（豁免解除）', heroEnglish: '4 psychic damage' },
		{ abilityID: 'beastheart-ability-14', section: 0, tier: 2, heroZhTW: '21 傷害；`氣場` < 2，**暈眩**（豁免解除）', heroEnglish: '21 damage' },
		{ abilityID: 'beastheart-ability-15', section: 0, tier: 2, heroZhTW: '13 傷害；`氣場` < 2，**虛弱**（豁免解除）', heroEnglish: '13 damage' },
		{ abilityID: 'beastheart-ability-16', section: 0, tier: 2, heroZhTW: '16 傷害', heroEnglish: '16 damage' }
	])('renders $abilityID tier $tier through PowerRollPanel without mutating protected state', ({ abilityID, heroZhTW, heroEnglish }) => {
		const ability = getAbility(abilityID);
		const hero = makeHero();
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: `${abilityID} Ability`, capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
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

	it('projects Head to Head’s bleeding emphasis through the shared condition path', () => {
		// The shared condition projector already handles this reading; nothing identity-specific
		// was added for it, and the calculator emphasizes it with or without a Hero.
		const expected = '你陷入**出血**（豁免解除）。直到你的下個回合結束前，你的契獸進行檢定時會獲得 1 個優勢。';
		expect(textReading('beastheart-ability-14', 'sections.1.text')).toBe(expected);
		expect(textReading('beastheart-ability-14', 'sections.1.text', makeHero())).toBe(expected);

		const { container } = renderAbility(getAbility('beastheart-ability-14'), makeHero());
		expectRendered(container, '你陷入出血（豁免解除）。');
		expect(container.textContent).not.toContain('You are');
	});

	it.each([
		{
			label: 'Death and Violence Might shift distance',
			elementID: 'beastheart-ability-13',
			field: 'sections.0.text',
			rawZhTW: '遁移最多等於你`力量`的格數，',
			heroZhTW: '遁移最多 2 格，',
			heroEnglish: 'shift up to a number of squares equal to 2,'
		},
		{
			label: 'Jaws of Death Intuition pull distance',
			elementID: 'beastheart-ability-15',
			field: 'sections.1.text',
			rawZhTW: '將目標拉動最多等於你`直覺`的格數。',
			heroZhTW: '將目標拉動最多 3 格。',
			heroEnglish: 'pull the target up to a number of squares equal to 3'
		}
	])('projects $label with a Hero and keeps the approved raw wording without one', ({ elementID, field, rawZhTW, heroZhTW, heroEnglish }) => {
		const ability = getAbility(elementID);

		// Library / no-Hero keeps the approved authored characteristic expression untouched.
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

	it('keeps the Jaws of Death weakened emphasis while the pull distance resolves', () => {
		// The identity-bound projection owns only the pull distance; the shared condition
		// projector still supplies the emphasis, on both paths.
		expect(textReading('beastheart-ability-15', 'sections.1.text')).toBe('每當距離你超過 3 格、以此方式陷入**虛弱**的目標豁免失敗時，你可以使用免費反應動作，將目標拉動最多等於你`直覺`的格數。');
		expect(textReading('beastheart-ability-15', 'sections.1.text', makeHero())).toBe('每當距離你超過 3 格、以此方式陷入**虛弱**的目標豁免失敗時，你可以使用免費反應動作，將目標拉動最多 3 格。');
	});

	it('fails closed to whole English for a wrong identity or an unsupported structural rewrite', () => {
		const hero = makeHero();
		const isWholeEnglishReading = (value: string) => !/[一-鿿]/.test(value);

		([
			[ 'beastheart-ability-13', 'sections.0.text', 'The target dies. You teleport in, shift 2 squares, and make a melee free strike.' ],
			[ 'beastheart-ability-15', 'sections.1.text', 'A weakened target more than 3 squares away can be pulled 3 squares when it fails its save.' ]
		] as const).forEach(([ elementID, field, unsupportedCalculatedEnglish ]) => {
			expect(localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: elementID,
				field: field,
				canonicalEnglish: required[elementFieldIdentity(elementID, field)],
				calculatedEnglish: unsupportedCalculatedEnglish
			})).toBe(unsupportedCalculatedEnglish);
		});

		// The same reading under a different identity is not projected either.
		const shiftCanonical = required[elementFieldIdentity('beastheart-ability-13', 'sections.0.text')];
		expect(isWholeEnglishReading(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'beastheart-ability-16',
			field: 'sections.1.text',
			canonicalEnglish: shiftCanonical,
			calculatedEnglish: AbilityLogic.getTextEffect(shiftCanonical, hero)
		}))).toBe(true);
	});
});
