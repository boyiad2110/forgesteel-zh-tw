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
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1BeastheartLevel1BaseAbilityRequiredCanonicalEnglish, createV1BeastheartLevel1BaseCompletionRequiredCanonicalEnglish, createV1BeastheartLevel1WildNatureRequiredCanonicalEnglish, getV1BeastheartWildNatureSubclasses, v1BeastheartWildNatureSubclassIDs, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, levelOneFeatures, readFieldByLabelPrefix, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

installResizeObserverStub();

/**
 * The approved slice, transcribed from packet `beastheart-l1-wild-nature-approved-r1` rather
 * than generated from the manifest builder under test, so a change to that builder cannot
 * silently redefine what this slice is expected to contain.
 */
const approvedSliceIdentities = [
	'element:class-beastheart/subclassName',
	'element:beastheart-sub-1/name',
	'element:beastheart-sub-1/description',
	'element:beastheart-sub-1-1-1/name',
	'element:beastheart-sub-1-1-1/description',
	'element:beastheart-sub-1-1-2/name',
	'element:beastheart-sub-1-1-2/description',
	'element:beastheart-sub-1-1-3/name',
	'element:beastheart-sub-1-1-3/target',
	'element:beastheart-sub-1-1-3/description',
	'element:beastheart-sub-1-1-3/sections.0.text',
	'element:beastheart-sub-1-1-3/sections.1.name',
	'element:beastheart-sub-1-1-3/sections.1.effect',
	'element:beastheart-sub-1-1-4/name',
	'element:beastheart-sub-1-1-4/target',
	'element:beastheart-sub-1-1-4/description',
	'element:beastheart-sub-1-1-4/type.trigger',
	'element:beastheart-sub-1-1-4/sections.0.text',
	'element:beastheart-sub-1-1-4/sections.1.name',
	'element:beastheart-sub-1-1-4/sections.1.effect',
	'element:beastheart-sub-2/name',
	'element:beastheart-sub-2/description',
	'element:beastheart-sub-2-1-1/name',
	'element:beastheart-sub-2-1-1/description',
	'element:beastheart-sub-2-1-2/name',
	'element:beastheart-sub-2-1-2/description',
	'element:beastheart-sub-2-1-3/name',
	'element:beastheart-sub-2-1-3/target',
	'element:beastheart-sub-2-1-3/description',
	'element:beastheart-sub-2-1-3/sections.0.text',
	'element:beastheart-sub-2-1-3/sections.1.name',
	'element:beastheart-sub-2-1-3/sections.1.effect',
	'element:beastheart-sub-2-1-4/name',
	'element:beastheart-sub-2-1-4/target',
	'element:beastheart-sub-2-1-4/description',
	'element:beastheart-sub-2-1-4/type.trigger',
	'element:beastheart-sub-2-1-4/sections.0.text',
	'element:beastheart-sub-2-1-4/sections.1.name',
	'element:beastheart-sub-2-1-4/sections.1.effect',
	'element:beastheart-sub-3/name',
	'element:beastheart-sub-3/description',
	'element:beastheart-sub-3-1-1/name',
	'element:beastheart-sub-3-1-1/description',
	'element:beastheart-sub-3-1-2/name',
	'element:beastheart-sub-3-1-2/description',
	'element:beastheart-sub-3-1-3/name',
	'element:beastheart-sub-3-1-3/target',
	'element:beastheart-sub-3-1-3/description',
	'element:beastheart-sub-3-1-3/sections.0.text',
	'element:beastheart-sub-3-1-3/sections.1.name',
	'element:beastheart-sub-3-1-3/sections.1.effect',
	'element:beastheart-sub-3-1-4/name',
	'element:beastheart-sub-3-1-4/target',
	'element:beastheart-sub-3-1-4/description',
	'element:beastheart-sub-3-1-4/type.trigger',
	'element:beastheart-sub-3-1-4/sections.0.text',
	'element:beastheart-sub-3-1-4/sections.1.name',
	'element:beastheart-sub-3-1-4/sections.1.effect',
	'element:beastheart-sub-4/name',
	'element:beastheart-sub-4/description',
	'element:beastheart-sub-4-1-1/name',
	'element:beastheart-sub-4-1-1/description',
	'element:beastheart-sub-4-1-2/name',
	'element:beastheart-sub-4-1-2/description',
	'element:beastheart-sub-4-1-3/name',
	'element:beastheart-sub-4-1-3/target',
	'element:beastheart-sub-4-1-3/description',
	'element:beastheart-sub-4-1-3/sections.0.text',
	'element:beastheart-sub-4-1-3/sections.1.name',
	'element:beastheart-sub-4-1-3/sections.1.effect',
	'element:beastheart-sub-4-1-4/name',
	'element:beastheart-sub-4-1-4/target',
	'element:beastheart-sub-4-1-4/description',
	'element:beastheart-sub-4-1-4/type.trigger',
	'element:beastheart-sub-4-1-4/sections.0.text',
	'element:beastheart-sub-4-1-4/sections.1.name',
	'element:beastheart-sub-4-1-4/sections.1.effect'
];

const required = createV1BeastheartLevel1WildNatureRequiredCanonicalEnglish();
const baseAbilityRequired = createV1BeastheartLevel1BaseAbilityRequiredCanonicalEnglish();
const baseCompletionRequired = createV1BeastheartLevel1BaseCompletionRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const subclasses = getV1BeastheartWildNatureSubclasses();

const getSubclass = (id: string): SubClass => {
	const subclass = subclasses.find(candidate => candidate.id === id);
	if (!subclass) {
		throw new Error(`Beastheart Wild Nature subclass '${id}' is missing`);
	}
	return subclass;
};

const getSubclassFeature = (subclassID: string, featureID: string): Feature => {
	const feature = levelOneFeatures(getSubclass(subclassID)).find(candidate => candidate.id === featureID);
	if (!feature) {
		throw new Error(`Beastheart Feature '${featureID}' is missing`);
	}
	return feature;
};

const getSubclassAbility = (subclassID: string, abilityID: string): Ability => {
	const feature = getSubclassFeature(subclassID, abilityID);
	if (feature.type !== FeatureType.Ability) {
		throw new Error(`Beastheart Feature '${abilityID}' is not an Ability`);
	}
	return feature.data.ability;
};

/**
 * Might 2 drives the `3 + M` and Might-damage readings, Intuition 3 the jump and movement
 * distances, and Stamina 21 at Level 1 gives a recovery value of 7, so no two projected values
 * in this slice are confusable. AbilityLogic derives potency from the highest characteristic,
 * which is Intuition here, giving weak 1 / average 2 / strong 3.
 */
const makeHero = () => createHeroWithClass(beastheart, 1, FactoryLogic.createCharacteristics(2, 1, 0, 3, 1));

const { renderFeature, renderAbility, renderSubclass } = createClassPresentationHarness(beastheart, [ core, beastheartSourcebook ]);

const textReading = (elementID: string, field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: elementID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Beastheart Level 1 Wild Nature catalog and presentation', () => {
	it('adds exactly the approved 77-identity manifest and catalog slice', () => {
		expect(approvedSliceIdentities).toHaveLength(77);
		expect(new Set(approvedSliceIdentities).size).toBe(77);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());

		const catalogIdentities = catalogEntries.map(getEntryIdentity);
		expect(catalogIdentities).toHaveLength(77);
		expect(new Set(catalogIdentities).size).toBe(77);
		expect(catalogIdentities.slice().sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(catalogEntries.every(entry => entry.zhTW === entry.zhTW.trim())).toBe(true);

		// Every one of the 77 reaches the production manifest as its own required identity.
		const manifestRequired = v1LocalizationManifest.requiredCanonicalEnglish;
		approvedSliceIdentities.forEach(identity => expect(manifestRequired[identity]).toBe(required[identity]));
	});

	it('stays disjoint from both prior Beastheart slices', () => {
		expect(Object.keys(baseAbilityRequired)).toHaveLength(83);
		expect(Object.keys(baseCompletionRequired)).toHaveLength(41);

		Object.keys(required).forEach(identity => {
			expect(Object.prototype.hasOwnProperty.call(baseAbilityRequired, identity)).toBe(false);
			expect(Object.prototype.hasOwnProperty.call(baseCompletionRequired, identity)).toBe(false);
		});

		// `subclassName` belongs here; the base-completion slice deliberately left it out.
		expect(required[elementFieldIdentity(beastheart.id, 'subclassName')]).toBe('Wild Nature');
		expect(baseCompletionRequired[elementFieldIdentity(beastheart.id, 'subclassName')]).toBeUndefined();
	});

	it('agrees with an independent bounded walk of each subclass Level 1 tree', () => {
		expect(v1BeastheartWildNatureSubclassIDs).toEqual([ 'beastheart-sub-1', 'beastheart-sub-2', 'beastheart-sub-3', 'beastheart-sub-4' ]);
		expect(subclasses.map(subclass => subclass.id)).toEqual([ ...v1BeastheartWildNatureSubclassIDs ]);

		subclasses.forEach(subclass => {
			const independentlyWalked = extractLiveBoundedNonAbilityFeatureFields(levelOneFeatures(subclass));

			// Four readings per subclass come from the shared walk: the SkillChoice and the
			// PackageContent benefit, each contributing a name and a description.
			expect(Object.keys(independentlyWalked)).toHaveLength(4);
			expect(Object.keys(independentlyWalked).every(identity => required[identity] === independentlyWalked[identity])).toBe(true);

			// The walk stops at Ability nodes, so neither Level 1 ability is counted or walked.
			levelOneFeatures(subclass)
				.filter(feature => feature.type === FeatureType.Ability)
				.forEach(feature => expect(independentlyWalked[elementFieldIdentity(feature.id, 'name')]).toBeUndefined());
		});
	});

	it('leaves Companion and Summon records, Level 2+ and abilities 13+ outside the slice', () => {
		expect(Object.keys(required).some(identity => identity.includes('beastheart-companion'))).toBe(false);
		expect(Object.keys(required).some(identity => identity.includes('summon'))).toBe(false);
		expect(Object.keys(required).some(identity => /^element:beastheart-ability-\d+\//.test(identity))).toBe(false);

		subclasses.forEach(subclass => {
			subclass.featuresByLevel.filter(level => level.level > 1).forEach(level => {
				level.features.forEach(feature => {
					expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
				});
			});
		});

		beastheart.featuresByLevel.filter(level => level.level > 1).forEach(level => {
			level.features.forEach(feature => {
				expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
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

	it('records no glossary change for this batch', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		// The five formal names stay Beastheart identity-scoped; none became a reusable mapping.
		expect(rows.some(row => row.includes('狂野天性'))).toBe(false);
		expect(rows.some(row => /^(Wild Nature|Guardian|Prowler|Punisher|Spark),/.test(row))).toBe(false);
		expect(rows).toContain('Beastheart,獸魂者,game-term,approved');
	});

	it('renders the class Wild Nature category and all four subclasses, then restores canonical English', () => {
		const serialized = JSON.stringify(beastheart);
		const { container } = renderSubclass(getSubclass('beastheart-sub-1'));

		expectRendered(container, '守護');
		expectRendered(container, '你是獸群中的無畏守護者，任何想傷害你的同伴的人，都得先過你這一關。');

		switchLocale();

		expectRendered(container, 'Guardian');
		expectRendered(container, 'You are the fearless defender of your pack');
		expect(JSON.stringify(beastheart)).toBe(serialized);
	});

	it.each([
		{ id: 'beastheart-sub-2', name: '獵殺', description: '你是躲藏在陰影中的伏擊者。獵物甚至還沒察覺你的存在就已命喪黃泉。', canonicalName: 'Prowler' },
		{ id: 'beastheart-sub-3', name: '制裁', description: '你憑藉蠻力擊潰任何膽敢招惹你的愚者。', canonicalName: 'Punisher' },
		{ id: 'beastheart-sub-4', name: '星火', description: '你與大自然的連結，讓你和契獸都被注入元素風暴的狂烈魔力。烈焰、寒霜與閃電在你的雙手與牠的利爪之間劈啪迸裂。', canonicalName: 'Spark' }
	])('renders $canonicalName metadata through SubclassPanel and restores canonical English', ({ id, name, description, canonicalName }) => {
		const subclass = getSubclass(id);
		const serialized = JSON.stringify(subclass);
		const { container } = renderSubclass(subclass);

		expectRendered(container, name);
		expectRendered(container, description);

		switchLocale();

		expectRendered(container, canonicalName);
		expect(JSON.stringify(subclass)).toBe(serialized);
	});

	it.each([
		{ subclassID: 'beastheart-sub-1', featureID: 'beastheart-sub-1-1-2', zhTW: '每個敵方目標都會被你的契獸嘲諷，直到你的下個回合開始。', canonical: 'Each enemy target is taunted by your companion' },
		{ subclassID: 'beastheart-sub-2', featureID: 'beastheart-sub-2-1-2', zhTW: '每個敵方目標都會陷入虛弱，直到你的下個回合開始。', canonical: 'Each enemy target is weakened' },
		{ subclassID: 'beastheart-sub-3', featureID: 'beastheart-sub-3-1-2', zhTW: '你的契獸將每個目標滑動最多等於其力量的格數。', canonical: 'Your companion slides each target' },
		{ subclassID: 'beastheart-sub-4', featureID: 'beastheart-sub-4-1-2', zhTW: '此打擊造成寒冷、火焰、閃電或音波傷害。你獲得 1 點鬥志。', canonical: 'This strike deals cold, fire, lightning, or sonic damage' }
	])('renders $featureID Wild Nature Benefit in approved zh-TW on its direct FeaturePanel surface', ({ subclassID, featureID, zhTW, canonical }) => {
		const feature = getSubclassFeature(subclassID, featureID);
		expect(feature.type).toBe(FeatureType.PackageContent);
		const serialized = JSON.stringify(feature);

		// The direct FeaturePanel surface is the one this batch owns: it localizes through the
		// approved catalog entries and applies no calculated transform, with or without a Hero.
		const { container } = renderFeature(feature, makeHero());
		expectRendered(container, '狂野天性益處');
		expectRendered(container, zhTW);
		expect(container.textContent).not.toContain(canonical);

		switchLocale();

		expectRendered(container, 'Wild Nature Benefit');
		expectRendered(container, canonical);
		expect(JSON.stringify(feature)).toBe(serialized);
	});

	it('renders the per-subclass skill choice with its approved description', () => {
		const skill = renderFeature(getSubclassFeature('beastheart-sub-1', 'beastheart-sub-1-1-1'));
		expectRendered(skill.container, '技能');
		expectRendered(skill.container, '從任意列表中選擇 1 項技能。');
		skill.unmount();
	});

	it('renders Living Arrow’s authored shape, which carries no calculated value', () => {
		const ability = getSubclassAbility('beastheart-sub-1', 'beastheart-sub-1-1-3');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, makeHero());

		expectRendered(container, '破空箭影');
		expectRendered(container, '你伸手一指，契獸瞬間現身。');
		expect(readFieldByLabelPrefix(container, '目標')).toBe('1 個未占據空間');
		expectRendered(container, '若你的契獸位於射程內且能容身於目標空間，牠會傳送到該處。然後，牠可以發動 1 次近戰基礎打擊。');
		expectRendered(container, '此招式的射程增加至遠程 15。');

		switchLocale();

		expectRendered(container, 'Living Arrow');
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('renders the triggered abilities’ approved trigger readings', () => {
		const packDefends = renderAbility(getSubclassAbility('beastheart-sub-1', 'beastheart-sub-1-1-4'));
		expectRendered(packDefends.container, '獸群守護');
		expectRendered(packDefends.container, '當目標受到傷害時。');
		expectRendered(packDefends.container, '目標受到的傷害減半。');
		packDefends.unmount();

		const mist = renderAbility(getSubclassAbility('beastheart-sub-2', 'beastheart-sub-2-1-4'));
		expectRendered(mist.container, '霧中暗影');
		expectRendered(mist.container, '當你 10 格內的 1 個敵人對你以外的生物造成傷害時。');
		mist.unmount();

		const thunderclap = renderAbility(getSubclassAbility('beastheart-sub-3', 'beastheart-sub-3-1-4'));
		expectRendered(thunderclap.container, '霹靂衝擊');
		expectRendered(thunderclap.container, '當目標對 1 個生物造成傷害時。');
		thunderclap.unmount();

		const pyre = renderAbility(getSubclassAbility('beastheart-sub-4', 'beastheart-sub-4-1-4'));
		expectRendered(pyre.container, '焚身');
		expectRendered(pyre.container, '當你受到傷害時。');
		expectRendered(pyre.container, '你受到的傷害減半，並傳送最多 5 格。');
		pyre.unmount();
	});

	it.each([
		{
			label: 'The Pack Defends recovery value',
			subclassID: 'beastheart-sub-1',
			abilityID: 'beastheart-sub-1-1-4',
			field: 'sections.1.effect',
			rawZhTW: '你花費 1 點復元力（但不恢復體力），目標恢復等於你復元值的體力。',
			heroZhTW: '你花費 1 點復元力（但不恢復體力），目標恢復 7 點體力。',
			heroEnglish: 'the target regains Stamina equal to 7.'
		},
		{
			label: 'Lightning Leap 3 + Might damage and Intuition jump',
			subclassID: 'beastheart-sub-2',
			abilityID: 'beastheart-sub-2-1-3',
			field: 'sections.0.text',
			rawZhTW: '目標受到等於 3 + 你`力量`的傷害。在發動此招式之前，你可以沿直線跳躍最多等於你`直覺`的格數。',
			heroZhTW: '目標受到 5 點傷害。在發動此招式之前，你可以沿直線跳躍最多 3 格。',
			heroEnglish: 'The target takes damage equal to 5.'
		},
		{
			label: 'Shadow in the Mist Intuition movement',
			subclassID: 'beastheart-sub-2',
			abilityID: 'beastheart-sub-2-1-4',
			field: 'sections.0.text',
			rawZhTW: '移動最多等於你`直覺`的格數。',
			heroZhTW: '移動最多 3 格。',
			heroEnglish: 'move up to a number of squares equal to 3 before or after'
		},
		{
			label: 'Shadow in the Mist twice Intuition movement',
			subclassID: 'beastheart-sub-2',
			abilityID: 'beastheart-sub-2-1-4',
			field: 'sections.1.effect',
			rawZhTW: '你可以移動最多等於你`直覺` ×2 的格數，而且此移動期間無視困難地形。',
			heroZhTW: '你可以移動最多 6 格，而且此移動期間無視困難地形。',
			heroEnglish: 'equal to 6 and ignore difficult terrain'
		},
		{
			label: 'Thunderclap Might damage and 1 + Might push',
			subclassID: 'beastheart-sub-3',
			abilityID: 'beastheart-sub-3-1-4',
			field: 'sections.0.text',
			rawZhTW: '你對目標造成等於你`力量`的音波傷害，並將目標推動最多等於 1 + 你`力量`的格數。',
			heroZhTW: '你對目標造成 2 點音波傷害，並將目標推動最多 3 格。',
			heroEnglish: 'You deal sonic damage equal to 2 to the target and push them up to a number of squares equal to 3.'
		},
		{
			label: 'Jaws of the Storm Might damage',
			subclassID: 'beastheart-sub-4',
			abilityID: 'beastheart-sub-4-1-3',
			field: 'sections.0.text',
			rawZhTW: '每個目標受到等於你`力量`的寒冷、火焰、閃電或音波傷害（由你選擇）。',
			heroZhTW: '每個目標受到 2 點寒冷、火焰、閃電或音波傷害（由你選擇）。',
			heroEnglish: '(your choice) equal to 2.'
		},
		{
			label: 'Pyre Intuition damage',
			subclassID: 'beastheart-sub-4',
			abilityID: 'beastheart-sub-4-1-4',
			field: 'sections.1.effect',
			rawZhTW: '都會受到等於你`直覺`的閃電或火焰傷害（由你選擇）。',
			heroZhTW: '都會受到 3 點閃電或火焰傷害（由你選擇）。',
			heroEnglish: '(your choice) equal to 3.'
		}
	])('projects $label with a Hero and keeps the approved raw wording without one', ({ subclassID, abilityID, field, rawZhTW, heroZhTW, heroEnglish }) => {
		const ability = getSubclassAbility(subclassID, abilityID);

		// Library / no-Hero keeps the approved authored expression untouched.
		expect(textReading(abilityID, field)).toContain(rawZhTW);
		const noHero = renderAbility(ability);
		expectRendered(noHero.container, rawZhTW.replace(/`/g, ''));
		noHero.unmount();

		const hero = makeHero();
		expect(textReading(abilityID, field, hero)).toContain(heroZhTW);

		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: `${abilityID} Ability`, capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
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

	it('projects both Avalanche Rush readings, which the calculator also touches without a Hero', () => {
		const ability = getSubclassAbility('beastheart-sub-3', 'beastheart-sub-3-1-3');
		const hero = makeHero();

		// Without a Hero the calculator adds only the prone emphasis and the potency code marks,
		// so the approved 「[中]」/「[強]」 thresholds and characteristic expressions all stand.
		expect(textReading('beastheart-sub-3-1-3', 'sections.0.text')).toBe('目標受到等於 3 + 你`力量`的傷害；若目標的`力量` < [中]，目標會被擊倒**伏地**。在發動此招式之前與之後，你都可以移動最多 3 格。在此移動期間，**伏地**敵人的方格對你而言不視為困難地形。當你首次進入 1 個**伏地**敵人的方格時，該敵人會受到等於你`力量`的寒冷傷害。');
		expect(textReading('beastheart-sub-3-1-3', 'sections.1.effect')).toBe('若目標的`力量` < [強]，目標會被擊倒**伏地**。');

		// With a Hero every value resolves, and nothing is recomputed in Chinese.
		expect(textReading('beastheart-sub-3-1-3', 'sections.0.text', hero)).toBe('目標受到 5 點傷害；若目標的`力量` < 2，目標會被擊倒**伏地**。在發動此招式之前與之後，你都可以移動最多 3 格。在此移動期間，**伏地**敵人的方格對你而言不視為困難地形。當你首次進入 1 個**伏地**敵人的方格時，該敵人會受到 2 點寒冷傷害。');
		expect(textReading('beastheart-sub-3-1-3', 'sections.1.effect', hero)).toBe('若目標的`力量` < 3，目標會被擊倒**伏地**。');

		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Avalanche Rush Ability', capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				expectRendered(withHero.container, '目標受到 5 點傷害；若目標的力量 < 2，目標會被擊倒伏地。');
				expectRendered(withHero.container, '該敵人會受到 2 點寒冷傷害。');
				expect(withHero.container.textContent).not.toContain('[中]');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'The target takes damage equal to 5'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, '該敵人會受到 2 點寒冷傷害。')
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('falls back to the complete calculated English when a Wild Nature reading is rewritten unexpectedly', () => {
		const canonicalEnglish = required[elementFieldIdentity('beastheart-sub-4-1-3', 'sections.0.text')];
		// A structural rewrite this presenter cannot prove: the sentence itself changed shape.
		const unsupportedCalculatedEnglish = 'Each target takes 2 cold, fire, lightning, or sonic damage (your choice).';

		const presented = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'beastheart-sub-4-1-3',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupportedCalculatedEnglish
		});

		// A whole English reading, never a mixed partial Chinese/English sentence.
		expect(presented).toBe(unsupportedCalculatedEnglish);
		expect(presented).not.toMatch(/[一-鿿]/);
	});

	it('records the deferred AbilityPanel package-injection discovery evidence', () => {
		// Discovery evidence only. The canonical calculator does transform these two PackageContent
		// descriptions - it adds condition emphasis - which is why the r2 matrix classifies them as
		// calculated on the AbilityPanel package-injection surface.
		const taunted = required[elementFieldIdentity('beastheart-sub-1-1-2', 'description')];
		const weakened = required[elementFieldIdentity('beastheart-sub-2-1-2', 'description')];

		expect(AbilityLogic.getTextEffect(taunted, makeHero())).toContain('**taunted**');
		expect(AbilityLogic.getTextEffect(weakened, makeHero())).toContain('**weakened**');

		// The two remaining benefits carry no calculated transform on any path.
		[ 'beastheart-sub-3-1-2', 'beastheart-sub-4-1-2' ].forEach(elementID => {
			const canonicalEnglish = required[elementFieldIdentity(elementID, 'description')];
			expect(AbilityLogic.getTextEffect(canonicalEnglish, makeHero())).toBe(canonicalEnglish);
			expect(AbilityLogic.getTextEffect(canonicalEnglish, undefined)).toBe(canonicalEnglish);
		});

		// This batch owns the direct FeaturePanel surface only, which the test above proves renders
		// the approved zh-TW. The AbilityPanel package-injection surface renders raw canonical
		// English because that shared call site has no localization boundary at all - a pre-existing
		// cross-class defect deferred to its own technical batch. No assertion here blesses that
		// English output as desired behaviour.
		expect(catalogEntries.filter(entry => entry.elementID === 'beastheart-sub-1-1-2')).toHaveLength(2);
		expect(catalogEntries.filter(entry => entry.elementID === 'beastheart-sub-2-1-2')).toHaveLength(2);
	});
});
