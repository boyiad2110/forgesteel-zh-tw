// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FeatureType } from '@/enums/feature-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { Ability } from '@/models/ability';
import { Feature } from '@/models/feature';
import { core } from '@/data/sourcebooks/official/core';
import { elementalist } from '@/data/classes/elementalist/elementalist';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ElementalistLevel1AbilityRequiredCanonicalEnglish, createV1ElementalistLevel1RemainingRequiredCanonicalEnglish, createV1ElementalistLevel1SubclassCompletionRequiredCanonicalEnglish, getV1ElementalistSubclasses, v1ElementalistSubclassIDs, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
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

const subclasses = getV1ElementalistSubclasses();
const required = createV1ElementalistLevel1SubclassCompletionRequiredCanonicalEnglish();
const existingBaseAbilityRequired = createV1ElementalistLevel1AbilityRequiredCanonicalEnglish();
const existingBaseRemainingRequired = createV1ElementalistLevel1RemainingRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined));

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(elementalist, [ core ]);

/** An Elementalist Hero whose Reason score is 2, so every projected value below is 2 or 4. */
const makeHero = () => createHeroWithClass(elementalist, 1, FactoryLogic.createCharacteristics(0, 0, 2, 0, 0));

const getSubclass = (id: string) => {
	const subclass = subclasses.find(candidate => candidate.id === id);
	if (!subclass) {
		throw new Error(`Elementalist subclass '${id}' is missing`);
	}
	return subclass;
};

const getFeature = (subclassID: string, featureID: string): Feature => {
	const feature = levelOneFeatures(getSubclass(subclassID)).find(candidate => candidate.id === featureID);
	if (!feature) {
		throw new Error(`Elementalist Feature '${featureID}' is missing`);
	}
	return feature;
};

/** Reaches a subclass's Level 1 Ability through the same bounded descent the slice uses. */
const getAbility = (id: string): Ability => {
	const search = (features: Feature[]): Ability | undefined => {
		for (const feature of features) {
			if (feature.type === FeatureType.Ability) {
				if (feature.data.ability.id === id) {
					return feature.data.ability;
				}
				continue;
			}
			if (feature.type === FeatureType.Multiple) {
				const found = search(feature.data.features);
				if (found) {
					return found;
				}
			}
			if (feature.type === FeatureType.Choice) {
				const found = search(feature.data.options.map(option => option.feature));
				if (found) {
					return found;
				}
			}
		}
		return undefined;
	};

	for (const subclass of subclasses) {
		const ability = search(levelOneFeatures(subclass));
		if (ability) {
			return ability;
		}
	}
	throw new Error(`Elementalist subclass Ability '${id}' is missing`);
};

/**
 * The four element proper names, as Owner-approved contextual readings. They are element
 * names, not a global replacement of the English words earth/fire/green/void.
 */
const subclassMetadata = [
	{
		id: 'elementalist-sub-1',
		name: '磐土',
		description: '「磐土」是永恆之元素。磐土招式會強化你的身體，並賦予你創造和塑造物理地形的力量。',
		canonicalName: 'Earth',
		canonicalDescription: 'Earth is the element of permanence. Earth abilities bolster your body and grant the power to permanently create and shape physical terrain.'
	},
	{
		id: 'elementalist-sub-2',
		name: '烈火',
		description: '「烈火」是毀滅之元素。烈火招式能摧毀敵人並將物體熔化成渣滓。',
		canonicalName: 'Fire',
		canonicalDescription: 'Fire is the element of destruction. Fire abilities devastate enemies and melt objects to slag.'
	},
	{
		id: 'elementalist-sub-3',
		name: '翠息',
		description: '「翠息」是創造與生長之元素。翠息招式能創造和操縱植物、真菌和其他生命形式，既能阻礙敵人，也能滋養盟友。',
		canonicalName: 'Green',
		canonicalDescription: 'Green is the element of creation and growth. Green abilities make and manipulate plants, fungi, and other forms of life to hamper foes and nourish your allies.'
	},
	{
		id: 'elementalist-sub-4',
		name: '虛冥',
		description: '「虛冥」是神祕之元素。虛冥招式能扭曲空間和現實，能讓你瞬間移動、創造幻象、將有形的物體變為無形。',
		canonicalName: 'Void',
		canonicalDescription: 'Void is the element of the mystery. Void abilities warp space and reality, allowing you to teleport, create illusions, and make things incorporeal.'
	}
];

afterEach(cleanup);

describe('V1 Core Elementalist Level 1 subclass completion catalog and presentation', () => {
	it('adds the exact bounded 59-identity manifest and catalog slice without overlapping either frozen base slice', () => {
		// Expected identities come from an independent extraction: the bounded non-Ability walk in
		// test-support plus each subclass's own metadata and the Ability fields read straight off
		// the live canonical Ability models. Nothing here calls the production completion builder.
		const independentlyExpected = new Set<string>([ elementFieldIdentity(elementalist.id, 'subclassName') ]);
		subclasses.forEach(subclass => {
			independentlyExpected.add(elementFieldIdentity(subclass.id, 'name'));
			if (subclass.description !== '') {
				independentlyExpected.add(elementFieldIdentity(subclass.id, 'description'));
			}
			Object.keys(extractLiveBoundedNonAbilityFeatureFields(levelOneFeatures(subclass))).forEach(identity => independentlyExpected.add(identity));
		});
		[ 'elementalist-sub-1-1-2', 'elementalist-sub-1-1-3', 'elementalist-sub-2-1-2', 'elementalist-sub-2-1-3', 'elementalist-sub-3-1-3', 'elementalist-sub-4-1-3', 'elementalist-sub-4-1-4' ].forEach(abilityID => {
			const ability = getAbility(abilityID);
			const add = (field: string, value: string) => {
				if (value !== '') {
					independentlyExpected.add(elementFieldIdentity(ability.id, field));
				}
			};
			add('name', ability.name);
			add('target', ability.target);
			add('description', ability.description);
			add('type.trigger', ability.type.trigger);
			(ability.sections || []).forEach((section, index) => {
				if (section.type === 'text') {
					add(`sections.${index}.text`, section.text);
				}
				if (section.type === 'field') {
					add(`sections.${index}.name`, section.name);
					add(`sections.${index}.effect`, section.effect);
				}
			});
		});

		expect(v1ElementalistSubclassIDs).toEqual([ 'elementalist-sub-1', 'elementalist-sub-2', 'elementalist-sub-3', 'elementalist-sub-4' ]);
		expect(independentlyExpected.size).toBe(59);
		expect(Object.keys(required).sort()).toEqual([ ...independentlyExpected ].sort());
		expect(Object.keys(required)).toHaveLength(59);

		expect(catalogEntries).toHaveLength(59);
		expect(new Set(catalogEntries.map(getEntryIdentity)).size).toBe(59);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		// Both frozen Elementalist base slices keep their own identities, and neither overlaps.
		expect(Object.keys(existingBaseAbilityRequired)).toHaveLength(133);
		expect(Object.keys(existingBaseRemainingRequired)).toHaveLength(44);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingBaseAbilityRequired, identity))).toBe(false);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingBaseRemainingRequired, identity))).toBe(false);

		// Every identity is required in the live manifest with the same canonical English.
		expect(Object.keys(required).every(identity => v1LocalizationManifest.requiredCanonicalEnglish[identity] === required[identity])).toBe(true);

		// Level 2+ subclass content stays outside this slice.
		[ 'elementalist-sub-1-2-1', 'elementalist-sub-2-2-1', 'elementalist-sub-3-2-1', 'elementalist-sub-4-2-1' ].forEach(id => {
			expect(required[elementFieldIdentity(id, 'name')]).toBeUndefined();
		});
	});

	it('records whitespace-sensitive canonical readings exactly as authored', () => {
		// Motivate Earth's section text and It Is the Soul Which Hears' description each open
		// with a single newline the catalog must snapshot verbatim rather than trim.
		expect(required[elementFieldIdentity('elementalist-sub-1-1-2', 'sections.0.text')].startsWith('\nYou touch a square')).toBe(true);
		expect(required[elementFieldIdentity('elementalist-sub-3-1-2', 'description')].startsWith('\nYou can speak with')).toBe(true);
	});

	it('keeps completeness healthy while the parent class domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([ 'class-and-subclass-level-content', 'official-ability-authored-content' ]));
		expect(result.complete).toBe(false);
	});

	it('records exactly the approved glossary delta, without turning the element readings into global mappings', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^Elemental Specialization,/.test(row))).toEqual([ 'Elemental Specialization,元素精通,game-term,approved' ]);
		expect(rows.filter(row => /^Victory,/.test(row))).toEqual([ 'Victory,勝利值,game-term,approved' ]);

		// The four Elementalist element proper names are contextual readings, not reusable global
		// mappings, so none of them is added or rewritten here. Earth stays absent, and the three
		// pre-existing rows below keep the readings earlier batches approved for their own
		// contexts - in particular the damage-type Fire and the general-sense Void.
		expect(rows.some(row => /^Earth,/.test(row))).toBe(false);
		expect(rows.filter(row => /^Fire,/.test(row))).toEqual([ 'Fire,火焰,game-term,approved' ]);
		expect(rows.filter(row => /^Green,/.test(row))).toEqual([ 'Green,翠息,game-term,approved' ]);
		expect(rows.filter(row => /^Void,/.test(row))).toEqual([ 'Void,虛空,game-term,approved' ]);
		expect(rows.some(row => /,(磐土|烈火|虛冥),/.test(row))).toBe(false);
	});

	it('renders the Elemental Specialization category and all four element names, then restores canonical English', () => {
		const serialized = JSON.stringify(elementalist);
		const { container } = renderClassPanel();

		expect(readFieldByLabelPrefix(container, '元素精通')).toBe('磐土, 烈火, 翠息, 虛冥');
		subclassMetadata.forEach(subclass => expectRendered(container, subclass.name));

		switchLocale();

		expect(readFieldByLabelPrefix(container, 'Elemental Specialization')).toBe('Earth, Fire, Green, Void');
		expect(JSON.stringify(elementalist)).toBe(serialized);
	});

	it.each(subclassMetadata)('renders $canonicalName metadata through SubclassPanel and restores canonical English', ({ id, name, description, canonicalName, canonicalDescription }) => {
		const subclass = getSubclass(id);
		const serialized = JSON.stringify(subclass);
		const { container } = renderSubclass(subclass);

		expectRendered(container, name);
		expectRendered(container, description);

		switchLocale();

		expectRendered(container, canonicalName);
		expectRendered(container, canonicalDescription);
		expect(JSON.stringify(subclass)).toBe(serialized);
	});

	it('keeps the Owner-authored rhetorical 虛空 reading in Subtle Relocation rather than the element name 虛冥', () => {
		const subtleRelocation = getAbility('elementalist-sub-4-1-4');
		const { container } = renderAbility(subtleRelocation);

		expectRendered(container, '你召喚虛空將盟友吞沒，再將他吐出。');
		expect(container.textContent).not.toContain('你召喚虛冥');
		expect(required[elementFieldIdentity('elementalist-sub-4-1-4', 'description')]).toBe('You call on the void to swallow and spit out an ally.');
	});

	it('renders each element’s Level 1 non-Ability features through the shared bounded walk', () => {
		const acolyteOfEarth = renderFeature(getFeature('elementalist-sub-1', 'elementalist-sub-1-1-1'));
		expectRendered(acolyteOfEarth.container, '磐土侍者');
		expectRendered(acolyteOfEarth.container, '你掌握磐土魔法的流動，讓自己更難被移動。');
		acolyteOfEarth.unmount();

		// Acolyte of Fire and Acolyte of the Void are bonus Features carrying a name only.
		const acolyteOfFire = renderFeature(getFeature('elementalist-sub-2', 'elementalist-sub-2-1-1'));
		expectRendered(acolyteOfFire.container, '烈火侍者');
		acolyteOfFire.unmount();

		const acolyteOfVoid = renderFeature(getFeature('elementalist-sub-4', 'elementalist-sub-4-1-1'));
		expectRendered(acolyteOfVoid.container, '虛冥侍者');
		acolyteOfVoid.unmount();

		const soulWhichHears = renderFeature(getFeature('elementalist-sub-3', 'elementalist-sub-3-1-2'));
		expectRendered(soulWhichHears.container, '靈聽萬物');
		expectRendered(soulWhichHears.container, '即使不共享語言，你也能與動物、野獸和植物生物交談並理解牠們。');
		expectRendered(soulWhichHears.container, '此外，你可以觸碰 1 株活體植物（非植物生物），與它進行心靈溝通。');
		soulWhichHears.unmount();

		const beyondingOfVision = renderFeature(getFeature('elementalist-sub-4', 'elementalist-sub-4-1-2'));
		expectRendered(beyondingOfVision.container, '洞悉萬象');
		expectRendered(beyondingOfVision.container, '你能立刻識破幻象、看見隱形生物，而且超常效果無法向你遮蔽生物和物體。');
	});

	it('renders the authored Ability fields each element’s Level 1 abilities carry', () => {
		// Special target, a multi-paragraph section text, and a Main action ability.
		const motivateEarth = renderAbility(getAbility('elementalist-sub-1-1-2'));
		expectRendered(motivateEarth.container, '驅動大地');
		expectRendered(motivateEarth.container, '特殊');
		expectRendered(motivateEarth.container, '大地依照你的命令升起、下沉或裂開。');
		expectRendered(motivateEarth.container, '你觸碰 1 個包含尋常泥土、石頭或金屬的方格，創造出 1 道由相同材料構成的 5 格障壁。');
		motivateEarth.unmount();

		// 'Self or one ally' target, a Trigger, and a Spend name/effect pair.
		const skinLikeCastleWalls = renderAbility(getAbility('elementalist-sub-1-1-3'));
		expectRendered(skinLikeCastleWalls.container, '石壁護體');
		expectRendered(skinLikeCastleWalls.container, '自身或 1 個盟友');
		expectRendered(skinLikeCastleWalls.container, '當目標受到傷害時。');
		expectRendered(skinLikeCastleWalls.container, '目標受到的傷害減半。');
		expectRendered(skinLikeCastleWalls.container, '花費');
		expectRendered(skinLikeCastleWalls.container, '若觸發的傷害具有任何效力效果，該效力會減少 1 點。');
		skinLikeCastleWalls.unmount();

		const returnToFormlessness = renderAbility(getAbility('elementalist-sub-2-1-2'));
		expectRendered(returnToFormlessness.container, '回歸無形');
		expectRendered(returnToFormlessness.container, '1 個尋常物體');
		expectRendered(returnToFormlessness.container, '你將目標加熱至熔化或燃燒，並將它徹底摧毀。');
		returnToFormlessness.unmount();

		const breathOfDawn = renderAbility(getAbility('elementalist-sub-3-1-3'));
		expectRendered(breathOfDawn.container, '拂曉之息');
		expectRendered(breathOfDawn.container, '當目標開始回合或受到傷害時。');
		expectRendered(breathOfDawn.container, '目標可以花費 1 點復元力。');
		expectRendered(breathOfDawn.container, '每花費 1 點精髓，目標可以額外花費 1 點復元力。');
		breathOfDawn.unmount();

		// Shared Void Sense carries the approved Victory reading and is left alone by the
		// calculator, so both surfaces show the same approved zh-TW.
		const sharedVoidSense = renderAbility(getAbility('elementalist-sub-4-1-3'), makeHero());
		expectRendered(sharedVoidSense.container, '共冥視野');
		expectRendered(sharedVoidSense.container, '你每擁有 1 點勝利值，你可以指定 1 個生物作為目標。');
		expect(sharedVoidSense.container.textContent).not.toContain('For each Victory');
	});

	it('projects Explosive Assistance’s Reason-derived forced movement bonus on both branches, and keeps the approved raw wording without a Hero', () => {
		const explosiveAssistance = getAbility('elementalist-sub-2-1-3');
		const rawNormal = '強制移動的距離會獲得等於你理智的加值。';
		const rawSpend = '強制移動的距離改為獲得等於你理智 ×2 的加值。';
		const heroNormal = '強制移動的距離會獲得 2 點加值。';
		const heroSpend = '強制移動的距離改為獲得 4 點加值。';

		const noHero = renderAbility(explosiveAssistance);
		expectRendered(noHero.container, '爆發助力');
		expectRendered(noHero.container, rawNormal);
		expectRendered(noHero.container, rawSpend);
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toContain('理智');
		expect(noHero.container.textContent).not.toContain('Reason score');
		noHero.unmount();

		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderAbility(explosiveAssistance, hero);

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Explosive Assistance Ability', capture: () => JSON.stringify(explosiveAssistance) }),
				protectCanonicalState({ label: 'Elementalist Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				expectRendered(withHero.container, heroNormal);
				expectRendered(withHero.container, heroSpend);
				expect(withHero.container.textContent).not.toContain('等於你理智的加值');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'The forced movement distance gains a bonus equal to 2.');
				expectRendered(withHero.container, 'The forced movement distance gains a bonus equal to 4 instead.');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => {
				expectRendered(withHero.container, heroNormal);
				expectRendered(withHero.container, heroSpend);
			}
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('projects Acolyte of the Green’s temporary Stamina through the FeaturePanel path, and keeps the approved raw wording without a Hero', () => {
		const acolyteOfTheGreen = getFeature('elementalist-sub-3', 'elementalist-sub-3-1-1');
		const raw = '會獲得等於你理智的臨時體力。';
		const heroText = '會獲得 2 點臨時體力。';

		const noHero = renderFeature(acolyteOfTheGreen);
		expectRendered(noHero.container, '翠息侍者');
		expectRendered(noHero.container, raw);
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toContain('理智');
		expect(noHero.container.textContent).not.toContain('temporary Stamina equal to');
		noHero.unmount();

		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderFeature(acolyteOfTheGreen, hero);

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Acolyte of the Green Feature', capture: () => JSON.stringify(acolyteOfTheGreen) }),
				protectCanonicalState({ label: 'Elementalist Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				expectRendered(withHero.container, heroText);
				expect(withHero.container.textContent).not.toContain('等於你理智的臨時體力');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'gains temporary Stamina equal to 2.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroText)
		});

		// FeaturePanel only ever hands canonical English to the calculator.
		expect(getTextEffect).toHaveBeenCalled();
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('projects Subtle Relocation’s teleport distance on both branches, and keeps the approved raw wording without a Hero', () => {
		const subtleRelocation = getAbility('elementalist-sub-4-1-4');
		const rawNormal = '你將目標傳送最多等於你理智的格數。';
		const rawSpend = '你改為將目標傳送最多等於你理智 ×2 的格數。';
		const heroNormal = '你將目標傳送最多 2 格。';
		const heroSpend = '你改為將目標傳送最多 4 格。';

		const noHero = renderAbility(subtleRelocation);
		expectRendered(noHero.container, '無痕瞬移');
		expectRendered(noHero.container, '自身或 1 個盟友');
		expectRendered(noHero.container, '當目標開始回合、移動，或被強制移動時。');
		expectRendered(noHero.container, rawNormal);
		expectRendered(noHero.container, rawSpend);
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toContain('理智');
		expect(noHero.container.textContent).not.toContain('Reason score');
		noHero.unmount();

		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderAbility(subtleRelocation, hero);

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Subtle Relocation Ability', capture: () => JSON.stringify(subtleRelocation) }),
				protectCanonicalState({ label: 'Elementalist Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				expectRendered(withHero.container, heroNormal);
				expectRendered(withHero.container, heroSpend);
				expect(withHero.container.textContent).not.toContain('等於你理智的格數');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'You teleport the target up to a number of squares equal to 2.');
				expectRendered(withHero.container, 'You teleport the target up to a number of squares equal to 4 instead.');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => {
				expectRendered(withHero.container, heroNormal);
				expectRendered(withHero.container, heroSpend);
			}
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('falls back to the whole calculated English when any of the three grammar families is structurally rewritten', () => {
		const expectWholeCalculatedEnglish = (elementID: string, field: string, rewrite: (canonical: string) => string) => {
			const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
			const calculatedEnglish = rewrite(canonicalEnglish);
			expect(calculatedEnglish).not.toBe(canonicalEnglish);

			const presented = localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: elementID,
				field: field,
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			});

			expect(presented).toBe(calculatedEnglish);
			expect(presented).not.toMatch(/[一-鿿]/);
		};

		// Fire's forced-movement family.
		expectWholeCalculatedEnglish('elementalist-sub-2-1-3', 'sections.0.text', canonical => canonical.replace('The forced movement distance gains a bonus equal to your Reason score.', 'The forced movement distance gains 2 extra squares.'));
		expectWholeCalculatedEnglish('elementalist-sub-2-1-3', 'sections.1.effect', canonical => canonical.replace('gains a bonus equal to twice your Reason score instead.', 'gains 4 extra squares instead.'));

		// Green's FeatureType.Text temporary Stamina family.
		expectWholeCalculatedEnglish('elementalist-sub-3-1-1', 'description', canonical => canonical.replace('gains temporary Stamina equal to your Reason score.', 'gains 2 temporary Stamina.'));

		// Void's teleport-distance family.
		expectWholeCalculatedEnglish('elementalist-sub-4-1-4', 'sections.0.text', canonical => canonical.replace('You teleport the target up to a number of squares equal to your Reason score.', 'You teleport the target 2 squares.'));
		expectWholeCalculatedEnglish('elementalist-sub-4-1-4', 'sections.1.effect', canonical => canonical.replace('up to a number of squares equal to twice your Reason score instead.', '4 squares instead.'));
	});

	it('keeps canonical English as the only calculation input across the whole completion slice', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const hero = makeHero();
		const serializedHero = JSON.stringify(hero);
		const serializedClass = JSON.stringify(elementalist);

		subclasses.forEach(subclass => renderSubclass(subclass).unmount());
		renderClassPanel(hero).unmount();

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(hero)).toBe(serializedHero);
		expect(JSON.stringify(elementalist)).toBe(serializedClass);

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});
});
