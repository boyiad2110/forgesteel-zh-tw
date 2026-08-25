// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { Feature } from '@/models/feature';
import { summoner } from '@/data/classes/summoner/summoner';
import { core } from '@/data/sourcebooks/official/core';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1SummonerLevel1BaseNonAbilityRequiredCanonicalEnglish, createV1SummonerLevel1Cost5AbilityRequiredCanonicalEnglish, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, levelOneFeatures, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
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
 * The approved slice, transcribed from packet `summoner-l1-base-nonability-localization-r1`
 * rather than generated from the manifest builder under test, so a change to that builder
 * cannot silently redefine what this slice is expected to contain.
 */
const approvedSliceIdentities = [
	'element:summoner-stamina/name',
	'element:summoner-recoveries/name',
	'element:summoner-resource/name',
	'element:summoner-resource/gains.0.trigger',
	'element:summoner-resource/gains.1.trigger',
	'element:summoner-resource/details',
	'element:summoner-1-1/name',
	'element:summoner-1-1/description',
	'element:summoner-1-1c/name',
	'element:summoner-1-1c/description',
	'element:summoner-1-2/name',
	'element:summoner-1-2/description',
	'element:summoner-1-7/name',
	'element:summoner-1-7/description',
	'element:summoner-1-7a/name',
	'element:summoner-1-7a/description',
	'element:summoner-1-7b/name',
	'element:summoner-1-7b/description',
	'element:summoner-1-7c/name',
	'element:summoner-1-7c/description',
	'element:summoner-1-7d/name',
	'element:summoner-1-7d/description',
	'element:summoner-1-7da/name',
	'element:summoner-1-7da/description',
	'element:summoner-1-7db/name',
	'element:summoner-1-8/name',
	'element:summoner-1-8/description',
	'element:summoner-1-9/name'
];

/** The four direct Level 1 feature abilities and the four Tactic Call options, all out of scope. */
const outOfScopeAbilityIDs = [
	'summoner-1-3',
	'summoner-1-4',
	'summoner-1-5',
	'summoner-1-6',
	'summoner-1-8a',
	'summoner-1-8b',
	'summoner-1-8c',
	'summoner-1-8d'
];

const required = createV1SummonerLevel1BaseNonAbilityRequiredCanonicalEnglish();
const cost5Required = createV1SummonerLevel1Cost5AbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const summonerLevelOne = levelOneFeatures(summoner);

const getFeature = (id: string): Feature => {
	const feature = summonerLevelOne.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Summoner Feature '${id}' is missing`);
	}
	return feature;
};

const getFormationOption = (id: string): Feature => {
	const formation = getFeature('summoner-1-7');
	if (formation.type !== FeatureType.Choice) {
		throw new Error('Formation is not a Choice');
	}
	const option = formation.data.options.map(candidate => candidate.feature).find(candidate => candidate.id === id);
	if (!option) {
		throw new Error(`Formation option '${id}' is missing`);
	}
	return option;
};

const getEssence = () => {
	const essence = getFeature('summoner-resource');
	if (essence.type !== FeatureType.HeroicResource) {
		throw new Error('Essence is not a Heroic Resource');
	}
	return essence;
};

/** Reason 3 is the characteristic every Summoner reading in this slice refers to. */
const makeHero = () => createHeroWithClass(summoner, 1, FactoryLogic.createCharacteristics(1, 2, 3, 0, 1));

const { renderFeature } = createClassPresentationHarness(summoner, [ core, summonerSourcebook ]);

/** The rendered feature title, read exactly so a substring can never stand in for it. */
const readTitle = (container: HTMLElement) => container.querySelector('.header-text')?.textContent?.trim();

afterEach(cleanup);

describe('V1 Summoner Level 1 base non-Ability catalog and presentation', () => {
	it('adds exactly the approved 28-identity manifest and catalog slice', () => {
		expect(approvedSliceIdentities).toHaveLength(28);
		expect(new Set(approvedSliceIdentities).size).toBe(28);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());

		const catalogIdentities = catalogEntries.map(getEntryIdentity);
		expect(catalogIdentities).toHaveLength(28);
		expect(new Set(catalogIdentities).size).toBe(28);
		expect(catalogIdentities.slice().sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		// Every one of the 28 reaches the production manifest as its own required identity.
		const manifestRequired = v1LocalizationManifest.requiredCanonicalEnglish;
		approvedSliceIdentities.forEach(identity => expect(manifestRequired[identity]).toBe(required[identity]));
	});

	it('snapshots the Minions package’s single canonical leading newline without prefixing the zh-TW', () => {
		const minions = required[elementFieldIdentity('summoner-1-2', 'description')];

		// The canonical template literal opens on its own line; that newline is part of the
		// canonical text the catalog snapshots, not stray whitespace to be trimmed away.
		expect(minions.startsWith('\nThe creatures you control are called **minions**.')).toBe(true);
		expect(minions.startsWith('\n\n')).toBe(false);
		expect(getFeature('summoner-1-2').description).toBe(minions);

		// The approved zh-TW is never given a leading newline of its own, and no other reading in
		// the slice carries surrounding whitespace on either side.
		const minionsEntry = catalogEntries.find(entry => getEntryIdentity(entry) === 'element:summoner-1-2/description');
		expect(minionsEntry?.zhTW.startsWith('你所控制的生物稱為')).toBe(true);
		expect(catalogEntries.filter(entry => entry.zhTW !== entry.zhTW.trim())).toEqual([]);
		expect(catalogEntries.filter(entry => (entry.canonicalEnglish !== entry.canonicalEnglish.trim())).map(getEntryIdentity)).toEqual([ 'element:summoner-1-2/description' ]);
	});

	it('agrees with an independent bounded walk of the base Level 1 tree plus the details supplement', () => {
		const independentlyWalked = extractLiveBoundedNonAbilityFeatureFields(summonerLevelOne);

		// 27 of the 28 come from the shared bounded walk; the 28th is Essence's explicit `details`.
		expect(Object.keys(independentlyWalked)).toHaveLength(27);
		expect(Object.keys(independentlyWalked).every(identity => required[identity] === independentlyWalked[identity])).toBe(true);
		expect(Object.keys(required).filter(identity => independentlyWalked[identity] === undefined)).toEqual([ 'element:summoner-resource/details' ]);

		// The walk stops at Ability nodes, so no direct feature ability and no Tactic Call option
		// is counted or descended into.
		outOfScopeAbilityIDs.forEach(id => {
			expect(independentlyWalked[elementFieldIdentity(id, 'name')]).toBeUndefined();
			expect(required[elementFieldIdentity(id, 'name')]).toBeUndefined();
		});
	});

	it('requires Essence’s details in addition to the fields the shared bounded walk supplies', () => {
		const essence = getEssence();
		const walked = extractLiveBoundedNonAbilityFeatureFields(summonerLevelOne);

		// The shared walk covers a Heroic Resource's name and gain triggers, never its details.
		expect(walked[elementFieldIdentity('summoner-resource', 'name')]).toBe('Essence');
		expect(walked[elementFieldIdentity('summoner-resource', 'gains.0.trigger')]).toBe('Start of your turn');
		expect(walked[elementFieldIdentity('summoner-resource', 'details')]).toBeUndefined();

		// Essence carries no description at all, so the walk contributes no reading for one.
		expect(essence.description).toBe('');
		expect(required[elementFieldIdentity('summoner-resource', 'description')]).toBeUndefined();

		// The manifest supplies details explicitly, exactly as authored.
		expect(required[elementFieldIdentity('summoner-resource', 'details')]).toBe(essence.data.details);
	});

	it('stays disjoint from the merged 38-identity cost-5 selectable ability slice', () => {
		expect(Object.keys(cost5Required)).toHaveLength(38);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(cost5Required, identity))).toBe(false);
		expect(Object.keys(cost5Required).some(identity => Object.prototype.hasOwnProperty.call(required, identity))).toBe(false);

		// This slice reads the class's Level 1 feature tree; the cost-5 slice reads `summoner.abilities`.
		expect(Object.keys(required).some(identity => /^element:summoner-ability-\d+\//.test(identity))).toBe(false);
	});

	it('leaves the Tactic Call options, the direct feature abilities, Circles and Level 2+ outside the slice', () => {
		// Tactic Call contributes its own parent reading, and none of its four option abilities.
		const tacticCall = getFeature('summoner-1-8');
		expect(tacticCall.type).toBe(FeatureType.Choice);
		expect(required[elementFieldIdentity('summoner-1-8', 'name')]).toBe('Tactic Call');
		outOfScopeAbilityIDs.forEach(id => {
			expect(Object.keys(required).some(identity => identity.startsWith(`element:${id}/`))).toBe(false);
		});

		expect(summoner.subclasses.length).toBeGreaterThan(0);
		summoner.subclasses.forEach(subclass => {
			expect(Object.keys(required).some(identity => identity.startsWith(`element:${subclass.id}`))).toBe(false);
		});
		expect(required[elementFieldIdentity(summoner.id, 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity(summoner.id, 'subclassName')]).toBeUndefined();

		summoner.featuresByLevel.filter(level => level.level > 1).forEach(level => {
			level.features.forEach(feature => {
				expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
			});
		});
	});

	it('carries no calculated identity: the slice holds no Text Feature', () => {
		/**
		 * `FeaturePanel` routes a description through `AbilityLogic.getTextEffect` only when the
		 * Feature is a `FeatureType.Text`, and no other in-scope reading reaches a calculator:
		 * a Heroic Resource's triggers and details are localized by direct lookup. So the slice
		 * needs no presenter grammar, and this asserts the property that makes that true rather
		 * than the conclusion.
		 */
		const walkTypes = (nodes: Feature[]): string[] => nodes.flatMap(feature => [
			feature.type,
			...(feature.type === FeatureType.Choice ? walkTypes(feature.data.options.map(option => option.feature)) : []),
			...(feature.type === FeatureType.Multiple ? walkTypes(feature.data.features) : [])
		]);

		const inScopeTypes = walkTypes(summonerLevelOne).filter(type => type !== FeatureType.Ability);
		expect(inScopeTypes.length).toBeGreaterThan(0);
		expect(inScopeTypes).not.toContain(FeatureType.Text);
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

		// 僕從 / 招牌僕從 / 小隊 stay Summoner-context readings, and the Formation and Tactic Call
		// names are approved for their own identities only, so `glossaryDelta = []`.
		[ '僕從', '招牌僕從', '小隊', '陣形', '戰術號令' ].forEach(reading => expect(rows.some(row => row.includes(reading))).toBe(false));
		expect(rows.some(row => /^(Minions|Formation|Tactic Call|Squad)\b/.test(row))).toBe(false);

		// The already-approved entries the slice leans on are untouched, 精髓 among them: Essence
		// was already a glossary term before this batch, so reusing it is not a delta either.
		expect(rows).toContain('Summoner,召喚師,game-term,approved');
		expect(rows).toContain('Summoner Range,召喚師射程,distance-type,approved');
		expect(rows).toContain('Essence,精髓,game-term,approved');
	});

	it('renders the Essence resource’s triggers and Owner-approved details', () => {
		const essence = getEssence();
		const { container } = renderFeature(essence);

		expect(readTitle(container)).toBe('精髓');
		expectRendered(container, '每當你的回合開始時');
		expectRendered(container, '每輪中，當任何僕從首次在你召喚師射程內非自願死亡時');

		// The Owner's approved rules reading: any number of minions may be sacrificed, and the
		// cost still drops by 1 in total before Level 10's `No Matter the Cost` changes that.
		expectRendered(container, '你可以自願犧牲召喚師射程內任意數量的僕從，讓費用減少 1 點。');
		expectRendered(container, '你可以犧牲的僕從數量沒有上限，但精髓費用仍然只減少 1 點。');
		expect(container.textContent).not.toContain('Start of your turn');
		expect(container.textContent).not.toContain('reduce the cost by 1');
	});

	it('renders the Minions package’s long Markdown and keeps its Owner-final closing sentence', () => {
		const minions = getFeature('summoner-1-2');
		const serialized = JSON.stringify(minions);
		const { container } = renderFeature(minions);

		const assertZhTW = () => {
			expect(readTitle(container)).toBe('僕從');
			expectRendered(container, '你所控制的生物稱為「僕從」。你最多可以召喚並維持 8 個僕從。你的僕從視為與你同等級的盟友。');
			expectRendered(container, '你的召喚師射程等於 5 + 你的理智。');
			expectRendered(container, '戰鬥中的僕從');
			expectRendered(container, '同支小隊的僕從共用體力池。');
			expectRendered(container, '非戰鬥中的僕從');

			// The Owner's latest explicit decision: this is exactly how the slice ends.
			expectRendered(container, '你的僕從不視為追隨者，因此不能進行專案檢定，除非你能夠召喚專家。');
			expect(container.textContent).not.toContain('aren’t followers');

			// No emphasis delimiter survives into the reading in either language.
			expect(container.textContent).not.toContain('**');
		};

		// The long Markdown reaches the reader as real structure, not raw syntax.
		expect(container.querySelectorAll('h3').length).toBe(2);
		expect(container.textContent).not.toContain('###');
		expect(container.textContent).not.toContain('**minions**');
		expect(container.querySelectorAll('strong').length).toBeGreaterThan(0);
		assertZhTW();

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Minions Feature', capture: () => JSON.stringify(minions) }) ],
			assertZhTW: assertZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readTitle(container)).toBe('Minions');
				expectRendered(container, 'The creatures you control are called minions.');
				expectRendered(container, 'Your minions aren’t followers and can’t make project rolls until you can summon specialists.');
				expect(container.querySelectorAll('h3').length).toBe(2);
				// The canonical English opens every emphasis run after a space, so none survives literally.
				expect(container.textContent).not.toContain('**');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: assertZhTW
		});

		expect(JSON.stringify(minions)).toBe(serialized);
	});

	it('renders the whole Formation family, including the summoner-1-7d grouping', () => {
		const formation = getFeature('summoner-1-7');
		const { container } = renderFeature(formation);

		expect(readTitle(container)).toBe('陣形');
		expectRendered(container, '你讓自己的僕從演練過某種特定陣形。');

		// The unselected Choice lists its four options by name; the factory names the Multiple from
		// its own children, so the grouping reads as one line among them.
		expectRendered(container, '散兵陣形');
		expectRendered(container, '正兵陣形');
		expectRendered(container, '精英陣形');
		expectRendered(container, '首領陣形、熟練項目');
		expect(container.textContent).not.toContain('Horde Formation');
		expect(container.textContent).not.toContain('Leader Formation, Proficiency');

		// Each option's own description is player-facing on that option's own panel.
		([
			{ id: 'summoner-1-7a', name: '散兵陣形', description: '你的僕從數量上限 +4，而且每當你的回合開始時，你可以召喚最多 4 個招牌僕從，而非 3 個。', canonicalName: 'Horde Formation' },
			{ id: 'summoner-1-7b', name: '正兵陣形', description: '每當你的 1 支小隊發動會造成傷害的招式時，選擇該招式的 1 個目標，他會額外受到等於你理智的傷害。', canonicalName: 'Platoon Formation' },
			{ id: 'summoner-1-7c', name: '精英陣形', description: '你的每個僕從體力 +3，穩度 +1。', canonicalName: 'Elite Formation' }
		]).forEach(expected => {
			const option = renderFeature(getFormationOption(expected.id));
			expect(readTitle(option.container)).toBe(expected.name);
			expectRendered(option.container, expected.description);
			expect(option.container.textContent).not.toContain(expected.canonicalName);
			option.unmount();
		});
	});

	/**
	 * The Minions package defines four terms inline. CommonMark only opens an emphasis run whose
	 * `**` is left-flanking, so a delimiter placed between a CJK letter and the `「` punctuation
	 * never opens a run and reaches the reader literally. The approved zh-TW therefore keeps each
	 * delimiter pair inside its brackets - `「**僕從**」` - which is a marker placement, not a
	 * wording change: the visible reading is still `「僕從」`.
	 */
	it('renders all four inline term definitions as strong, with no literal delimiter', () => {
		const { container } = renderFeature(getFeature('summoner-1-2'));
		const strongReadings = Array.from(container.querySelectorAll('strong')).map(node => node.textContent);

		[ '僕從', '小隊', '召喚師射程', '招牌僕從' ].forEach(term => {
			expect(strongReadings).toContain(term);
			// The bracketed reading itself is unchanged; only the delimiters moved inside it.
			expect(container.textContent).toContain(`「${term}」`);
		});

		// No delimiter of any kind survives into the reading, for these four or anywhere else.
		expect(container.textContent).not.toContain('**');

		// The 17 line-initial section labels still render as strong, exactly as before.
		expect(strongReadings).toContain('戰鬥開始');
		expect(strongReadings).toContain('戰鬥結束');
		expect(strongReadings.length).toBe(21);
	});

	it('renders the summoner-1-7d grouping and both of its children on their own panels', () => {
		const grouping = getFormationOption('summoner-1-7d');
		if (grouping.type !== FeatureType.Multiple) {
			throw new Error('summoner-1-7d is not a Multiple');
		}

		// Name and description carry the same factory-generated reading, and both are player-facing.
		expect(required[elementFieldIdentity('summoner-1-7d', 'name')]).toBe('Leader Formation, Proficiency');
		expect(required[elementFieldIdentity('summoner-1-7d', 'description')]).toBe('Leader Formation, Proficiency');
		const groupingEntries = catalogEntries.filter(entry => entry.elementID === 'summoner-1-7d');
		expect(groupingEntries.map(entry => entry.zhTW)).toEqual([ '首領陣形、熟練項目', '首領陣形、熟練項目' ]);

		const grouped = renderFeature(grouping);
		expect(readTitle(grouped.container)).toBe('首領陣形、熟練項目');
		expectRendered(grouped.container, '首領陣形、熟練項目');
		grouped.unmount();

		const [ leaderFormation, leaderProficiency ] = grouping.data.features;
		expect(grouping.data.features.map(feature => feature.id)).toEqual([ 'summoner-1-7da', 'summoner-1-7db' ]);

		const leader = renderFeature(leaderFormation);
		expect(readTitle(leader.container)).toBe('首領陣形');
		expectRendered(leader.container, '當小隊中的所有僕從死亡時，你不會受到任何溢出傷害。');
		expectRendered(leader.container, '你可以選擇改由自己承受該傷害。');
		leader.unmount();

		const proficiency = renderFeature(leaderProficiency);
		expect(readTitle(proficiency.container)).toBe('熟練項目');
		proficiency.unmount();
	});

	it('renders Tactic Call’s own parent reading while its four option abilities stay canonical English', () => {
		const tacticCall = getFeature('summoner-1-8');
		const { container } = renderFeature(tacticCall);

		expect(readTitle(container)).toBe('戰術號令');
		expectRendered(container, '你可以向自己的僕從下達特殊命令。');

		// The four option abilities are out of scope, so they keep their canonical English names.
		expectRendered(container, 'Focus Fire!');
		expectRendered(container, 'Halt!');
		expectRendered(container, 'Not Yet!');
		expectRendered(container, 'Shield!');
		expect(catalogEntries.some(entry => outOfScopeAbilityIDs.includes(entry.elementID))).toBe(false);
	});

	it('renders the skill choices, the two bonuses and the 5pt label, and restores canonical English', () => {
		const stamina = renderFeature(getFeature('summoner-stamina'));
		expect(readTitle(stamina.container)).toBe('體力');
		stamina.unmount();

		const recoveries = renderFeature(getFeature('summoner-recoveries'));
		expect(readTitle(recoveries.container)).toBe('復元力');
		recoveries.unmount();

		const skills = renderFeature(getFeature('summoner-1-1'));
		expect(readTitle(skills.container)).toBe('技能');
		expectRendered(skills.container, '從任意列表中選擇 2 項技能。');
		skills.unmount();

		const restricted = renderFeature(getFeature('summoner-1-1c'));
		expect(readTitle(restricted.container)).toBe('隱密類 / 學識類技能');
		expectRendered(restricted.container, '從隱密類技能、學識類技能中選擇 2 項技能。');
		restricted.unmount();

		const hero = makeHero();
		const cost5 = getFeature('summoner-1-9');
		const { container } = renderFeature(cost5, hero);

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: '5pt Ability Feature', capture: () => JSON.stringify(cost5) }),
				protectCanonicalState({ label: 'Summoner Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => expect(readTitle(container)).toBe('5 費招式'),
			switchToEnglish: switchLocale,
			assertEnglish: () => expect(readTitle(container)).toBe('5pt Ability'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expect(readTitle(container)).toBe('5 費招式')
		});
	});
});
