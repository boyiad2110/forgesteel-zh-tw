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
import { tactician } from '@/data/classes/tactician/tactician';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1TacticianLevel1AbilityRequiredCanonicalEnglish, createV1TacticianLevel1CompletionRequiredCanonicalEnglish, getV1TacticianDoctrines, v1LocalizationManifest, v1TacticianDoctrineIDs } from '@/localization/v1-localization-manifest';
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

const tacticianLevelOne = levelOneFeatures(tactician);
const doctrines = getV1TacticianDoctrines();
const required = createV1TacticianLevel1CompletionRequiredCanonicalEnglish();
const existingAbilityRequired = createV1TacticianLevel1AbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => entry.kind === 'element-field' && (required[getEntryIdentity(entry)] !== undefined));

const getFeature = (features: Feature[], id: string) => {
	const feature = features.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Tactician Feature '${id}' is missing`);
	}
	return feature;
};

const makeReasonHero = (reason: number) => createHeroWithClass(tactician, 1, FactoryLogic.createCharacteristics(0, 0, reason, 0, 0));

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(tactician, [ core ]);

const getDoctrineAbility = (id: string): Ability => {
	for (const doctrine of doctrines) {
		const feature = levelOneFeatures(doctrine).find(candidate => candidate.type === FeatureType.Ability && candidate.data.ability.id === id);
		if (feature?.type === FeatureType.Ability) {
			return feature.data.ability;
		}
	}
	throw new Error(`Tactician Doctrine Ability '${id}' is missing`);
};

const doctrineMetadata = [
	{
		id: 'tactician-sub-1',
		name: '游擊',
		description: '盡忠職守、公平競爭、光榮戰死，那是對手的事。為了讓盟友活下來，你會不擇手段。',
		canonicalName: 'Insurgent',
		canonicalDescription: 'Doing your duty, playing fair, and dying honorably in battle is your opponent’s job. You’ll do whatever it takes to keep your allies alive.'
	},
	{
		id: 'tactician-sub-2',
		name: '謀策',
		description: '你擁有百科全書般的戰爭知識，將戰場視為棋盤，透過洞察先機來料敵制勝。',
		canonicalName: 'Mastermind',
		canonicalDescription: 'You have an encyclopedic knowledge of warfare, viewing the battlefield as a game board and seeking victory by thinking steps ahead of your opponents.'
	},
	{
		id: 'tactician-sub-3',
		name: '先鋒',
		description: '你掌握了古代英雄的戰略智慧，能在前線坐鎮指揮，以堅定的意志力和個人魅力奪取勝利。',
		canonicalName: 'Vanguard',
		canonicalDescription: 'You have learned the stratagems of ancient heroes, letting you lead from the front lines and seek victory through sheer force of will and personality.'
	}
] as const;

afterEach(cleanup);

describe('V1 Core Tactician Level 1 completion catalog and presentation', () => {
	it('adds the exact bounded 56-identity manifest and catalog slice without overlapping the approved base Ability slice', () => {
		const independentlyWalkedBase = extractLiveBoundedNonAbilityFeatureFields(tacticianLevelOne);

		expect(v1TacticianDoctrineIDs).toEqual([ 'tactician-sub-1', 'tactician-sub-2', 'tactician-sub-3' ]);
		expect(Object.keys(required)).toHaveLength(56);
		expect(Object.keys(catalogEntries)).toHaveLength(56);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved' && entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingAbilityRequired, identity))).toBe(false);

		// The independent bounded walk of the base Level 1 tree aligns with the manifest directly:
		// every identity it finds is required with the same canonical English, with no per-feature
		// exception carved out on either side. The Mark grouping's composed description is part of
		// that alignment rather than an exclusion.
		expect(Object.keys(independentlyWalkedBase).every(identity => required[identity] === independentlyWalkedBase[identity])).toBe(true);
		expect(required[elementFieldIdentity('tactician-1-5', 'description')]).toBe('Mark, Mark: Trigger');

		doctrines.forEach(doctrine => {
			const independentlyWalkedDoctrine = extractLiveBoundedNonAbilityFeatureFields(levelOneFeatures(doctrine));
			expect(Object.keys(independentlyWalkedDoctrine).every(identity => required[identity] === independentlyWalkedDoctrine[identity])).toBe(true);
		});
	});

	it('keeps completeness healthy while the parent class domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('records exactly the approved Tactical Doctrine / Focus glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');
		expect(rows.filter(row => row.startsWith('Tactical Doctrine,'))).toEqual([ 'Tactical Doctrine,戰術準則,game-term,approved' ]);
		expect(rows.filter(row => row.startsWith('Focus,'))).toEqual([ 'Focus,專注,game-term,approved' ]);
	});

	it('renders the Tactical Doctrine category and all three Doctrines through the class presentation, then restores canonical English', () => {
		const serialized = JSON.stringify(tactician);
		const { container } = renderClassPanel();

		expect(readFieldByLabelPrefix(container, '戰術準則')).toBe('游擊, 謀策, 先鋒');
		doctrineMetadata.forEach(doctrine => expectRendered(container, doctrine.name));

		switchLocale();

		expect(readFieldByLabelPrefix(container, 'Tactical Doctrines')).toBe('Insurgent, Mastermind, Vanguard');
		expect(JSON.stringify(tactician)).toBe(serialized);
	});

	it.each(doctrineMetadata)('renders $canonicalName metadata through SubclassPanel and restores canonical English', ({ id, name, description, canonicalName, canonicalDescription }) => {
		const doctrine = doctrines.find(candidate => candidate.id === id);
		if (!doctrine) {
			throw new Error(`Tactician Doctrine '${id}' is missing`);
		}
		const serialized = JSON.stringify(doctrine);
		const { container } = renderSubclass(doctrine);

		expectRendered(container, name);
		expectRendered(container, description);

		switchLocale();

		expectRendered(container, canonicalName);
		expectRendered(container, canonicalDescription);
		expect(JSON.stringify(doctrine)).toBe(serialized);
	});

	it('renders Focus name, gain triggers and pill values on no-Hero and Hero paths without mutating canonical state', () => {
		const focus = getFeature(tacticianLevelOne, 'tactician-resource');
		if (focus.type !== FeatureType.HeroicResource) {
			throw new Error('Focus is not a Heroic Resource');
		}
		const assertZhTWFocus = (container: HTMLElement) => {
			expectRendered(container, '專注');
			expectRendered(container, '每當你的回合開始時');
			expectRendered(container, '每輪中，當你或任何盟友首次對 1 個被你標記的生物造成傷害時');
			expectRendered(container, '每輪中，當位於你 10 格內的任何盟友首次發動英雄招式時');
		};
		const noHero = renderFeature(focus);
		assertZhTWFocus(noHero.container);
		expect(Array.from(noHero.container.querySelectorAll('.pill')).map(node => node.textContent)).toEqual([ '+2', '+1', '+1' ]);
		noHero.unmount();

		const hero = makeReasonHero(3);
		const withHero = renderFeature(focus, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Focus Feature', capture: () => JSON.stringify(focus) }), protectCanonicalState({ label: 'Tactician Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				assertZhTWFocus(withHero.container);
				expect(Array.from(withHero.container.querySelectorAll('.pill')).map(node => node.textContent)).toEqual([ '+2', '+1', '+1' ]);
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'Focus');
				expectRendered(withHero.container, 'Start of your turn');
				expectRendered(withHero.container, 'The first time each round that you or an ally damages a creature you have marked');
				expectRendered(withHero.container, 'The first time in a round that an ally within 10 squares of you uses a heroic ability');
				expect(Array.from(withHero.container.querySelectorAll('.pill')).map(node => node.textContent)).toEqual([ '+2', '+1', '+1' ]);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => assertZhTWFocus(withHero.container)
		});
		expect(focus.data.gains.map(gain => ({ tag: gain.tag, value: gain.value }))).toEqual([
			{ tag: 'start', value: '2' },
			{ tag: 'deal-damage', value: '1' },
			{ tag: 'ability', value: '1' }
		]);
	});

	it('renders Field Arsenal, the Mark grouping name and the class-ability-choice fallback names through FeaturePanel', () => {
		const fieldArsenal = getFeature(tacticianLevelOne, 'tactician-1-4');
		const arsenal = renderFeature(fieldArsenal);
		expectRendered(arsenal.container, '戰地軍庫');
		expectRendered(arsenal.container, '你精通多種武器和防具，並發展出能充分發揮其效用的技術。你可以同時使用並獲得 2 件套裝的所有益處，包括它們各自的招牌招式。每當你選擇或更換 1 件套裝時，你可以同時選擇或更換第 2 件套裝。');
		arsenal.unmount();

		// The Mark grouping renders both its name and its composed description; the description
		// must show the approved zh-TW composition rather than falling back to canonical English.
		const mark = getFeature(tacticianLevelOne, 'tactician-1-5');
		const markPanel = renderFeature(mark);
		expectRendered(markPanel.container, '標記');
		expectRendered(markPanel.container, '標記、標記：反應動作');
		expect(markPanel.container.textContent).not.toContain('Mark, Mark: Trigger');
		expect(markPanel.container.textContent).not.toContain('Mark: Trigger');

		switchLocale();

		expectRendered(markPanel.container, 'Mark, Mark: Trigger');
		markPanel.unmount();

		const cost3 = renderFeature(getFeature(tacticianLevelOne, 'tactician-1-7'));
		expectRendered(cost3.container, '3 費招式');
		cost3.unmount();

		const cost5 = renderFeature(getFeature(tacticianLevelOne, 'tactician-1-8'));
		expectRendered(cost5.container, '5 費招式');
		cost5.unmount();
	});

	it('renders each Doctrine SkillChoice through FeaturePanel with its restricted-list description', () => {
		const readings = [
			{ id: 'tactician-sub-1-1-1', name: '隱密類技能', description: '從隱密類技能中選擇 1 項技能。' },
			{ id: 'tactician-sub-2-1-1', name: '學識類技能', description: '從學識類技能中選擇 1 項技能。' },
			{ id: 'tactician-sub-3-1-1', name: '交涉類技能', description: '從交涉類技能中選擇 1 項技能。' }
		];
		readings.forEach(({ id, name, description }) => {
			const doctrine = doctrines.find(candidate => levelOneFeatures(candidate).some(feature => feature.id === id));
			if (!doctrine) {
				throw new Error(`Doctrine SkillChoice '${id}' is missing`);
			}
			const { container, unmount } = renderFeature(getFeature(levelOneFeatures(doctrine), id));
			expectRendered(container, name);
			expectRendered(container, description);
			unmount();
		});
	});

	it('renders Covert Operations, Studied Commander (with its Markdown table) and Commanding Presence through FeaturePanel', () => {
		const covertOps = renderFeature(getFeature(levelOneFeatures(doctrines[0]), 'tactician-sub-1-1-2'));
		expectRendered(covertOps.container, '祕密行動');
		expectRendered(covertOps.container, '當盟友在你身邊或按照你的計畫行動時，每個盟友使用隱密類技能進行的考驗都會獲得 1 個優勢。此外，你可以使用領導技能來協助其他生物進行隱密類技能的考驗。');
		expectRendered(covertOps.container, '若 GM 同意，你和盟友可以在談判期間使用隱密類技能來進行研究或偵察，不一定要在談判之外才能執行。');
		covertOps.unmount();

		const studiedCommander = renderFeature(getFeature(levelOneFeatures(doctrines[1]), 'tactician-sub-2-1-2'));
		expectRendered(studiedCommander.container, '博學指揮官');
		expectRendered(studiedCommander.container, '你淵博的戰爭史知識能讓你將這些見解應用在當前的挑戰。');
		expectRendered(studiedCommander.container, 'GM 會告訴你遭遇中的生物數量。');
		expectRendered(studiedCommander.container, 'GM 會透露 3 個動機，其中 1 個屬於談判中的某個 NPC。');
		expectRendered(studiedCommander.container, '在每場遭遇或談判中，你只能進行此考驗 1 次。');
		studiedCommander.unmount();

		const commandingPresence = renderFeature(getFeature(levelOneFeatures(doctrines[2]), 'tactician-sub-3-1-2'));
		expectRendered(commandingPresence.container, '統御威嚴');
		expectRendered(commandingPresence.container, '無論在什麼場合，你都能掌控全局。在談判期間，若你在場，與你同行的每個英雄都會將自己的聲望視為比平常多 2 點。此外，在戰鬥遭遇中，與你同行的每個英雄在進行提議停戰談判的考驗時，都會獲得雙優勢。');
		commandingPresence.unmount();
	});

	it.each([
		{
			id: 'tactician-sub-1-1-3',
			name: '進階戰術',
			description: '你依靠領導能力來協助盟友。',
			trigger: '當目標對其他生物造成傷害時。',
			section: '目標獲得 2 點鬥志（可以用來增加觸發的傷害）。',
			spend: '若觸發的傷害具有任何效力效果，該效力會增加 1 點。',
			canonicalName: 'Advanced Tactics'
		},
		{
			id: 'tactician-sub-2-1-3',
			name: '伺機攻擊',
			description: '在你的指揮下，盟友在最佳時機發動攻擊。',
			trigger: '當目標移動時。',
			section: '在目標移動期間的任何時刻，1 個盟友可以對他發動 1 次基礎打擊。',
			spend: '若目標的理智 < [中]，目標陷入緩速狀態（EoT）。',
			canonicalName: 'Overwatch'
		},
		{
			id: 'tactician-sub-3-1-3',
			name: '招架',
			description: '你敏銳的反應能夠化解敵人的精準攻擊。',
			trigger: '當 1 個生物對目標造成傷害時。',
			section: '你可以遁移 1 格。若目標是你自己，或你這次遁移後與目標相鄰，目標受到的傷害會減半。若觸發的傷害具有任何效力效果，該效力會減少 1 點。',
			spend: '此招式的射程改為近戰 1 + 你的理智，而且你可以遁移最多等於理智的格數，而非 1 格。',
			canonicalName: 'Parry'
		}
	])('renders $canonicalName through AbilityPanel with every approved Level 1 authored shape', ({ id, name, description, trigger, section, spend, canonicalName }) => {
		const ability = getDoctrineAbility(id);
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability);

		expectRendered(container, name);
		expectRendered(container, description);
		expectRendered(container, trigger);
		expectRendered(container, section);
		expect(readFieldByLabelPrefix(container, '花費')).toBe(spend);

		switchLocale();

		expectRendered(container, canonicalName);
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('resolves Parry’s Reason-derived distance and shift with a Hero, and keeps the approved raw wording without one', () => {
		const parry = getDoctrineAbility('tactician-sub-3-1-3');
		const noHero = renderAbility(parry);
		expect(readFieldByLabelPrefix(noHero.container, '花費')).toBe('此招式的射程改為近戰 1 + 你的理智，而且你可以遁移最多等於理智的格數，而非 1 格。');
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toEqual([ '理智', '理智' ]);
		expect(noHero.container.textContent).not.toContain('Reason score');
		noHero.unmount();

		const hero = makeReasonHero(3);
		const serializedAbility = JSON.stringify(parry);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderAbility(parry, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Parry Ability', capture: () => JSON.stringify(parry) }), protectCanonicalState({ label: 'Tactician Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				expect(readFieldByLabelPrefix(withHero.container, '花費')).toBe('此招式的射程改為近戰 4，而且你可以遁移最多 3 格，而非 1 格。');
				expect(withHero.container.textContent).not.toContain('Reason score');
				expect(withHero.container.textContent).not.toContain('理智');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readFieldByLabelPrefix(withHero.container, 'Spend')).toBe('This ability’s distance becomes Melee 4, and you can shift up to a number of squares equal to 3 instead of 1 square.');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expect(readFieldByLabelPrefix(withHero.container, '花費')).toBe('此招式的射程改為近戰 4，而且你可以遁移最多 3 格，而非 1 格。')
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(parry)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('projects Overwatch condition emphasis generically without a Hero, and falls back to full calculated English once the potency resolves with one', () => {
		const overwatch = getDoctrineAbility('tactician-sub-2-1-3');
		const noHero = renderAbility(overwatch);
		expect(readFieldByLabelPrefix(noHero.container, '花費')).toBe('若目標的理智 < [中]，目標陷入緩速狀態（EoT）。');
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toEqual([ '理智' ]);
		expect(Array.from(noHero.container.querySelectorAll('strong')).map(node => node.textContent)).toEqual([ '緩速' ]);
		noHero.unmount();

		const hero = makeReasonHero(3);
		const serializedAbility = JSON.stringify(overwatch);
		const serializedHero = JSON.stringify(hero);
		const withHero = renderAbility(overwatch, hero);

		// The generic condition-emphasis projector cannot safely resolve the potency value on its
		// own, and this batch does not add an Overwatch-specific projector, so the calculated
		// English fallback is expected here for this one field - a full English sentence, never a
		// mixed reading. The ability's other approved zh-TW fields (name, description, target,
		// trigger) are untouched, since only this field's calculation actually changed.
		const spendReading = readFieldByLabelPrefix(withHero.container, '花費');
		expect(spendReading).toBe('If the target has R < 2 they are slowed (EoT).');
		expect(spendReading).not.toMatch(/[一-鿿]/);
		expectRendered(withHero.container, '伺機攻擊');
		expectRendered(withHero.container, '在你的指揮下，盟友在最佳時機發動攻擊。');

		expect(JSON.stringify(overwatch)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
	});
});
