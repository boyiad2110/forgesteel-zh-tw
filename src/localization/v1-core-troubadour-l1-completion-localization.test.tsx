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
import { troubadour } from '@/data/classes/troubadour/troubadour';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1TroubadourLevel1AbilityRequiredCanonicalEnglish, createV1TroubadourLevel1CompletionRequiredCanonicalEnglish, getV1TroubadourClassActs, v1LocalizationManifest, v1TroubadourClassActIDs } from '@/localization/v1-localization-manifest';
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

const troubadourLevelOne = levelOneFeatures(troubadour);
const classActs = getV1TroubadourClassActs();
const required = createV1TroubadourLevel1CompletionRequiredCanonicalEnglish();
const existingAbilityRequired = createV1TroubadourLevel1AbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => entry.kind === 'element-field' && (required[getEntryIdentity(entry)] !== undefined));

const getFeature = (features: Feature[], id: string) => {
	const feature = features.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Troubadour Feature '${id}' is missing`);
	}
	return feature;
};

/**
 * Reaches a Class Act's Level 1 Ability wherever it is authored. Virtuoso keeps its two
 * performance abilities inside the `troubadour-virtuoso-3` Multiple rather than at the top
 * level, so this follows the same bounded descent the slice's denominator uses.
 */
const getClassActAbility = (id: string): Ability => {
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

	for (const classAct of classActs) {
		const ability = search(levelOneFeatures(classAct));
		if (ability) {
			return ability;
		}
	}
	throw new Error(`Troubadour Class Act Ability '${id}' is missing`);
};

const getDrama = () => {
	const drama = getFeature(troubadourLevelOne, 'troubadour-6');
	if (drama.type !== FeatureType.HeroicResource) {
		throw new Error('Drama is not a Heroic Resource');
	}
	return drama;
};

/** A Troubadour Hero at the given level and Presence, for the Hero-context presentation path. */
const makeHero = (level: number, presence: number) => createHeroWithClass(troubadour, level, FactoryLogic.createCharacteristics(0, 0, 0, 0, presence));

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(troubadour, [ core ]);

const classActMetadata = [
	{
		id: 'troubadour-auteur',
		name: '編劇',
		description: '你從故事和敘述中發掘戲劇張力，運用魔法來操控在你眼前展開的一系列事件。',
		canonicalName: 'Auteur',
		canonicalDescription: 'You seek drama from story and recount, using your magic to manipulate the sequence of events unfolding before you.'
	},
	{
		id: 'troubadour-duelist',
		name: '決鬥',
		description: '戲劇張力巧妙地融入你與他人配合的一舉一動。你跳著死亡之舞，相信你的對手能以同樣的熱情給予回應。',
		canonicalName: 'Duelist',
		canonicalDescription: 'Drama infuses your every movement done in tandem with another. You perform dances of death, putting trust in your opponent to return your passion in kind.'
	},
	{
		id: 'troubadour-virtuoso',
		name: '演奏',
		description: '你從音樂與歌曲中發掘戲劇張力，在音符之間編織魔法，用真摯的情感打動觀眾。',
		canonicalName: 'Virtuoso',
		canonicalDescription: 'You find drama in music and song, weaving magic between vibrations and filling the audience with your pathos.'
	}
];

afterEach(cleanup);

describe('V1 Core Troubadour Level 1 completion catalog and presentation', () => {
	it('adds the exact bounded 94-identity manifest and catalog slice without overlapping the frozen base Ability slice', () => {
		const independentlyWalkedBase = extractLiveBoundedNonAbilityFeatureFields(troubadourLevelOne);

		expect(v1TroubadourClassActIDs).toEqual([ 'troubadour-auteur', 'troubadour-duelist', 'troubadour-virtuoso' ]);
		expect(Object.keys(required)).toHaveLength(94);
		expect(catalogEntries).toHaveLength(94);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved' && entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		// The frozen base Ability slice keeps its 14 abilities / 89 identities, and the two
		// slices are disjoint.
		expect(Object.keys(existingAbilityRequired)).toHaveLength(89);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingAbilityRequired, identity))).toBe(false);

		// The independent bounded walk of the base Level 1 tree aligns with the manifest directly:
		// every identity it finds is required with the same canonical English, with no per-feature
		// exception carved out on either side.
		expect(Object.keys(independentlyWalkedBase).every(identity => required[identity] === independentlyWalkedBase[identity])).toBe(true);

		// The two direct Level 1 Performance abilities belong to the frozen Ability slice, so the
		// bounded walk neither counts them here nor descends into them.
		expect(required[elementFieldIdentity('troubadour-10', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('troubadour-11', 'name')]).toBeUndefined();
		expect(existingAbilityRequired[elementFieldIdentity('troubadour-11', 'name')]).toBeDefined();
	});

	it('requires Drama’s details in addition to the fields the shared bounded walk supplies', () => {
		const drama = getDrama();
		const walked = extractLiveBoundedNonAbilityFeatureFields(troubadourLevelOne);

		// The shared walk covers a Heroic Resource's name and gain triggers but not its details.
		expect(walked[elementFieldIdentity('troubadour-6', 'name')]).toBe('Drama');
		expect(walked[elementFieldIdentity('troubadour-6', 'gains.0.trigger')]).toBe('Start of your turn');
		expect(walked[elementFieldIdentity('troubadour-6', 'details')]).toBeUndefined();

		// The manifest supplies details explicitly, exactly as authored.
		expect(required[elementFieldIdentity('troubadour-6', 'details')]).toBe(drama.data.details);
	});

	it('reaches the Virtuoso performances authored inside the Multiple, and nothing from later Class Act levels', () => {
		classActs.forEach(classAct => {
			const independentlyWalkedClassAct = extractLiveBoundedNonAbilityFeatureFields(levelOneFeatures(classAct));
			expect(Object.keys(independentlyWalkedClassAct).every(identity => required[identity] === independentlyWalkedClassAct[identity])).toBe(true);
		});

		// Thunder Mother and Ballad of the Beast sit inside the `troubadour-virtuoso-3` Multiple,
		// so a top-level-only ability filter would have dropped both.
		expect(required[elementFieldIdentity('troubadour-virtuoso-3', 'name')]).toBe('Virtuoso Performances');
		expect(required[elementFieldIdentity('troubadour-virtuoso-4', 'name')]).toBe('“Thunder Mother”');
		expect(required[elementFieldIdentity('troubadour-virtuoso-5', 'name')]).toBe('“Ballad of the Beast”');

		// Level 2+ Class Act content stays outside this slice.
		expect(required[elementFieldIdentity('troubadour-auteur-5', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('troubadour-duelist-5', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('troubadour-virtuoso-7', 'name')]).toBeUndefined();
	});

	it('keeps completeness healthy while the parent class domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([ 'class-and-subclass-level-content', 'official-ability-authored-content' ]));
		expect(result.complete).toBe(false);
	});

	it('records exactly the approved Class Act glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^Class Act,/.test(row))).toEqual([ 'Class Act,才華,game-term,approved' ]);

		// Performance and Drama already existed; the Class Act names are not global terms.
		expect(rows.filter(row => /^(Performance|Drama),/.test(row))).toEqual([
			'Performance,表演,game-term,approved',
			'Drama,張力,game-term,approved'
		]);
		expect(rows.some(row => /^(Auteur|Duelist|Virtuoso),/.test(row))).toBe(false);
	});

	it('renders the Class Act category and all three Class Acts through the class presentation, then restores canonical English', () => {
		const serialized = JSON.stringify(troubadour);
		const { container } = renderClassPanel();

		expect(readFieldByLabelPrefix(container, '才華')).toBe('編劇, 決鬥, 演奏');
		classActMetadata.forEach(classAct => expectRendered(container, classAct.name));

		switchLocale();

		expect(readFieldByLabelPrefix(container, 'Class Act')).toBe('Auteur, Duelist, Virtuoso');
		expect(JSON.stringify(troubadour)).toBe(serialized);
	});

	it.each(classActMetadata)('renders $canonicalName metadata through SubclassPanel and restores canonical English', ({ id, name, description, canonicalName, canonicalDescription }) => {
		const classAct = classActs.find(candidate => candidate.id === id);
		if (!classAct) {
			throw new Error(`Troubadour Class Act '${id}' is missing`);
		}
		const serialized = JSON.stringify(classAct);
		const { container } = renderSubclass(classAct);

		expectRendered(container, name);
		expectRendered(container, description);

		switchLocale();

		expectRendered(container, canonicalName);
		expectRendered(container, canonicalDescription);
		expect(JSON.stringify(classAct)).toBe(serialized);
	});

	it('renders Drama name, gain triggers and details on no-Hero and Hero paths without mutating canonical state', () => {
		const drama = getDrama();
		const assertZhTWDrama = (container: HTMLElement) => {
			expectRendered(container, '張力');
			expectRendered(container, '每當你的回合開始時');
			expectRendered(container, '當首次有 3 個以上的英雄在同個回合中發動招式時');
			expectRendered(container, '當首次有英雄在遭遇中陷入疲態時');
			expectRendered(container, '每當你效果線內的 1 個生物擲出天然 19 或 20 時');
			expectRendered(container, '當你自己或其他英雄死亡時');
			expectRendered(container, '在你死亡後，只要屍體完整，你仍然可以在戰鬥期間獲得張力。');
			expectRendered(container, '若你在該場遭遇結束時仍然處於死亡，你在之後的遭遇中就無法再獲得張力。');
		};

		const noHero = renderFeature(drama);
		assertZhTWDrama(noHero.container);
		expect(noHero.container.textContent).not.toContain('Start of your turn');
		noHero.unmount();

		const hero = makeHero(3, 2);
		const withHero = renderFeature(drama, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Drama Feature', capture: () => JSON.stringify(drama) }), protectCanonicalState({ label: 'Troubadour Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => assertZhTWDrama(withHero.container),
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'Drama');
				expectRendered(withHero.container, 'Start of your turn');
				expectRendered(withHero.container, 'The first time three or more heroes use an ability on the same turn');
				expectRendered(withHero.container, 'When you are dead, you continue to gain drama during combat as long as your body is intact.');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => assertZhTWDrama(withHero.container)
		});
	});

	it('renders the base Level 1 non-Ability features the shared bounded walk supplies', () => {
		const skill = renderFeature(getFeature(troubadourLevelOne, 'troubadour-3'));
		expectRendered(skill.container, '技能');
		expectRendered(skill.container, '從任意列表中選擇 1 項技能。');
		skill.unmount();

		const interpersonal = renderFeature(getFeature(troubadourLevelOne, 'troubadour-4'));
		expectRendered(interpersonal.container, '交涉類技能');
		expectRendered(interpersonal.container, '從交涉類技能中選擇 2 項技能。');
		interpersonal.unmount();

		const intrigueLore = renderFeature(getFeature(troubadourLevelOne, 'troubadour-5'));
		expectRendered(intrigueLore.container, '隱密類／學識類技能');
		expectRendered(intrigueLore.container, '從隱密類技能、學識類技能中選擇 1 項技能。');
		intrigueLore.unmount();

		const routines = renderFeature(getFeature(troubadourLevelOne, 'troubadour-9'));
		expectRendered(routines.container, '例行表演');
		expectRendered(routines.container, '每場戰鬥開始時，你都會準備好一組表演招式。');
		expectRendered(routines.container, '這些招式都帶有「表演」關鍵詞。');
		routines.unmount();

		const kit = renderFeature(getFeature(troubadourLevelOne, 'troubadour-7'));
		expectRendered(kit.container, '套裝');
	});

	it('renders the corrected Acrobatics reading, keeping the canonical movement restriction', () => {
		const acrobatics = getClassActAbility('troubadour-duelist-2');
		const approved = '在此表演生效期間，每個在區域內開始回合的目標，直到他的回合結束前，他在移動過程中進行的 1 次跳躍、翻滾或攀爬考驗會自動獲得 T3 結果。';
		const serialized = JSON.stringify(acrobatics);
		const { container } = renderAbility(acrobatics);

		expectRendered(container, '特技表演');
		expectRendered(container, '大家都愛精彩的翻滾特技。');
		expectRendered(container, '自身與區域內每個盟友');
		expectRendered(container, approved);
		// O-33 keeps the canonical 'as part of their movement' restriction.
		expectRendered(container, '他在移動過程中進行的 1 次跳躍、翻滾或攀爬考驗');

		switchLocale();

		expectRendered(container, 'Acrobatics');
		expectRendered(container, 'can automatically obtain a tier 3 outcome on one test made to jump, tumble, or climb as part of their movement before the end of their turn.');
		expect(JSON.stringify(acrobatics)).toBe(serialized);
	});

	it('renders a representative Class Act target, Spend section and Power Roll in approved zh-TW', () => {
		const powerChord = getClassActAbility('troubadour-virtuoso-2');
		const chord = renderAbility(powerChord);
		expectRendered(chord.container, '強力和弦');
		expectRendered(chord.container, '區域內每個敵人');
		expectRendered(chord.container, '推動 1');
		expectRendered(chord.container, '推動 2');
		expectRendered(chord.container, '推動 3');
		chord.unmount();

		const starPower = getClassActAbility('troubadour-duelist-3');
		const star = renderAbility(starPower);
		expectRendered(star.container, '巨星風采');
		expectRendered(star.container, '自身');
		expectRendered(star.container, '你的速度 +2，直到你當前回合結束。此外，你在本回合進行的下次檢定不會低於 T2 結果。');
		expectRendered(star.container, '花費');
		expectRendered(star.container, '你的速度改為 +4。');
		star.unmount();

		const riposte = getClassActAbility('troubadour-duelist-4');
		const { container } = renderAbility(riposte);
		expectRendered(container, '回擊');
		expectRendered(container, '自身或 1 個盟友');
		expectRendered(container, '當目標受到近戰打擊的傷害時。');
		expectRendered(container, '目標對攻擊者發動 1 次基礎打擊。');
	});

	it('projects Scene Partner’s level-derived bond count, and keeps the approved raw wording without a Hero', () => {
		const scenePartner = getFeature(troubadourLevelOne, 'troubadour-8');
		const rawZhTW = '你可以同時維持的羈絆數量等於你的等級。若與新的 NPC 建立羈絆會超出數量上限，你必須放棄 1 個現有的羈絆。';
		const heroZhTW = '你可以同時維持的羈絆數量為 3。若與新的 NPC 建立羈絆會超出數量上限，你必須放棄 1 個現有的羈絆。';

		const noHero = renderFeature(scenePartner);
		expectRendered(noHero.container, '場景搭檔');
		expectRendered(noHero.container, rawZhTW);
		expect(noHero.container.textContent).not.toContain('bonds active equal to');
		noHero.unmount();

		const hero = makeHero(3, 2);
		const serializedFeature = JSON.stringify(scenePartner);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderFeature(scenePartner, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Scene Partner Feature', capture: () => JSON.stringify(scenePartner) }), protectCanonicalState({ label: 'Troubadour Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				expectRendered(withHero.container, heroZhTW);
				expect(withHero.container.textContent).not.toContain('等於你的等級');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'You can have a number of bonds active equal to 3.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW)
		});

		// The calculator only ever receives canonical English, never zh-TW.
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(scenePartner)).toBe(serializedFeature);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('projects Blocking’s Presence-derived target count, and keeps the approved raw wording without a Hero', () => {
		const blocking = getClassActAbility('troubadour-auteur-2');
		const rawZhTW = '在此表演生效期間，每當你的回合結束時，你可以選擇數量最多等於你氣場的目標，並將這些目標傳送至區域內的未占據空間。';
		const heroZhTW = '在此表演生效期間，每當你的回合結束時，你可以選擇最多 2 個目標，並將這些目標傳送至區域內的未占據空間。';

		const noHero = renderAbility(blocking);
		expectRendered(noHero.container, '走位');
		expectRendered(noHero.container, '區域內每個生物');
		expectRendered(noHero.container, rawZhTW);
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toContain('氣場');
		expect(noHero.container.textContent).not.toContain('Presence score');
		noHero.unmount();

		const hero = makeHero(3, 2);
		const serializedAbility = JSON.stringify(blocking);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderAbility(blocking, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Blocking Ability', capture: () => JSON.stringify(blocking) }), protectCanonicalState({ label: 'Troubadour Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				expectRendered(withHero.container, heroZhTW);
				expect(withHero.container.textContent).not.toContain('等於你氣場的目標');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'you can choose up to a number of targets equal to 2 and teleport those targets'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW)
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(blocking)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('projects all three of Thunder Mother’s level-derived tiers, and keeps the approved raw tiers without a Hero', () => {
		const thunderMother = getClassActAbility('troubadour-virtuoso-4');
		const rawTiers = [ '等於你等級的閃電傷害', '等於 5 + 你等級的閃電傷害', '等於 10 + 你等級的閃電傷害' ];
		// Level 3: tier 1 = level, tier 2 = 5 + level, tier 3 = 10 + level.
		const heroTiers = [ '3 閃電傷害', '8 閃電傷害', '13 閃電傷害' ];

		const noHero = renderAbility(thunderMother);
		expectRendered(noHero.container, '《雷霆之母》');
		expectRendered(noHero.container, '雷霆之母來啦！');
		expectRendered(noHero.container, '在此表演生效期間，每輪結束時，你可以對目標進行 1 次無視掩護的檢定。此效果不能重複指定同個生物。');
		rawTiers.forEach(tier => expectRendered(noHero.container, tier));
		expect(noHero.container.textContent).not.toContain('Lightning damage equal to');
		noHero.unmount();

		const hero = makeHero(3, 2);
		const serializedAbility = JSON.stringify(thunderMother);
		const serializedHero = JSON.stringify(hero);
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const withHero = renderAbility(thunderMother, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Thunder Mother Ability', capture: () => JSON.stringify(thunderMother) }), protectCanonicalState({ label: 'Troubadour Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				heroTiers.forEach(tier => expectRendered(withHero.container, tier));
				rawTiers.forEach(tier => expect(withHero.container.textContent).not.toContain(tier));
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'Lightning damage equal to 3');
				expectRendered(withHero.container, 'Lightning damage equal to 8');
				expectRendered(withHero.container, 'Lightning damage equal to 13');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => heroTiers.forEach(tier => expectRendered(withHero.container, tier))
		});

		// Every tier the calculator saw was the canonical English tier, never zh-TW.
		getTierEffectCreature.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(thunderMother)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTierEffectCreature.mockRestore();
	});

	it('falls back to the whole calculated English when a calculated reading is structurally rewritten', () => {
		// Scene Partner: the calculator rewrote the sentence rather than resolving its value.
		const scenePartnerCanonical = required[elementFieldIdentity('troubadour-8', 'description')];
		const scenePartnerRewritten = scenePartnerCanonical.replace('You can have a number of bonds active equal to your level.', 'You can have 3 bonds.');
		const scenePartnerPresented = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'troubadour-8',
			field: 'description',
			canonicalEnglish: scenePartnerCanonical,
			calculatedEnglish: scenePartnerRewritten
		});
		expect(scenePartnerPresented).toBe(scenePartnerRewritten);
		expect(scenePartnerPresented).not.toMatch(/[一-鿿]/);

		// Blocking: same rule for the ability-section path.
		const blockingCanonical = required[elementFieldIdentity('troubadour-auteur-2', 'sections.0.text')];
		const blockingRewritten = blockingCanonical.replace('you can choose up to a number of targets equal to your Presence score', 'you can choose 2 targets');
		const blockingPresented = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'troubadour-auteur-2',
			field: 'sections.0.text',
			canonicalEnglish: blockingCanonical,
			calculatedEnglish: blockingRewritten
		});
		expect(blockingPresented).toBe(blockingRewritten);
		expect(blockingPresented).not.toMatch(/[一-鿿]/);

		// Thunder Mother: an unexpected tier rewrite falls back whole rather than mixing.
		const tierPresented = localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: 'troubadour-virtuoso-4',
			field: 'sections.1.roll.tier1',
			canonicalEnglish: 'Lightning damage equal to your level',
			calculatedEnglish: '3 lightning damage; push 1'
		});
		expect(tierPresented).toBe('3 lightning damage; push 1');
		expect(tierPresented).not.toMatch(/[一-鿿]/);
	});

	it('keeps canonical English as the only calculation input for the whole completion slice', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const hero = makeHero(3, 2);

		classActs.forEach(classAct => {
			const rendered = renderSubclass(classAct);
			rendered.unmount();
		});
		const classPanel = renderClassPanel(hero);
		classPanel.unmount();

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});
});
