// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { Ability } from '@/models/ability';
import { summoner } from '@/data/classes/summoner/summoner';
import { core } from '@/data/sourcebooks/official/core';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1SummonerLevel1Cost5AbilityRequiredCanonicalEnglish, getV1SummonerLevel1Cost5Abilities, v1LocalizationManifest, v1SummonerLevel1Cost5AbilityIDs } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
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
 * The approved slice, transcribed from packet `summoner-l1-cost5-ability-localization-r1` rather
 * than generated from the manifest builder under test, so a change to that builder cannot
 * silently redefine what this slice is expected to contain.
 */
const approvedSliceIdentities = [
	'element:summoner-ability-1/name',
	'element:summoner-ability-1/target',
	'element:summoner-ability-1/description',
	'element:summoner-ability-1/sections.0.roll.tier1',
	'element:summoner-ability-1/sections.0.roll.tier2',
	'element:summoner-ability-1/sections.0.roll.tier3',
	'element:summoner-ability-1/sections.1.text',
	'element:summoner-ability-2/name',
	'element:summoner-ability-2/target',
	'element:summoner-ability-2/description',
	'element:summoner-ability-2/sections.0.roll.tier1',
	'element:summoner-ability-2/sections.0.roll.tier2',
	'element:summoner-ability-2/sections.0.roll.tier3',
	'element:summoner-ability-2/sections.1.text',
	'element:summoner-ability-2/sections.2.name',
	'element:summoner-ability-2/sections.2.effect',
	'element:summoner-ability-3/name',
	'element:summoner-ability-3/target',
	'element:summoner-ability-3/description',
	'element:summoner-ability-3/sections.0.text',
	'element:summoner-ability-4/name',
	'element:summoner-ability-4/target',
	'element:summoner-ability-4/description',
	'element:summoner-ability-4/sections.0.text',
	'element:summoner-ability-5/name',
	'element:summoner-ability-5/target',
	'element:summoner-ability-5/description',
	'element:summoner-ability-5/sections.0.roll.tier1',
	'element:summoner-ability-5/sections.0.roll.tier2',
	'element:summoner-ability-5/sections.0.roll.tier3',
	'element:summoner-ability-5/sections.1.text',
	'element:summoner-ability-6/name',
	'element:summoner-ability-6/target',
	'element:summoner-ability-6/description',
	'element:summoner-ability-6/sections.0.roll.tier1',
	'element:summoner-ability-6/sections.0.roll.tier2',
	'element:summoner-ability-6/sections.0.roll.tier3',
	'element:summoner-ability-6/sections.1.text'
];

const required = createV1SummonerLevel1Cost5AbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const abilities = getV1SummonerLevel1Cost5Abilities();

const getAbility = (abilityID: string): Ability => {
	const ability = abilities.find(candidate => candidate.id === abilityID);
	if (!ability) {
		throw new Error(`Summoner Level 1 cost-5 ability '${abilityID}' is missing`);
	}
	return ability;
};

/**
 * Reason 2 drives every `+ R` damage tier and Intuition 3 is the highest characteristic, so
 * AbilityLogic derives weak 1 / average 2 / strong 3 from it. The two never produce the same
 * number in this slice, so a projected potency can never be mistaken for a projected damage.
 */
const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...summoner, level: 1, characteristics: FactoryLogic.createCharacteristics(1, 0, 2, 3, 1) };
	return hero;
};

const { renderAbility } = createClassPresentationHarness(summoner, [ core, summonerSourcebook ]);

const textReading = (elementID: string, field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: elementID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

/** PowerRollPanel only offers a distance selection when an ability authors more than one. */
const productionDistance = (ability: Ability) => (ability.distance.length > 1 ? ability.distance[0].type : undefined);

const tierReading = (abilityID: string, sectionIndex: number, tier: number, hero?: ReturnType<typeof makeHero>, locale: 'zh-TW' | 'en' = 'zh-TW') => {
	const ability = getAbility(abilityID);
	const field = `sections.${sectionIndex}.roll.tier${tier}`;
	const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, productionDistance(ability), hero);
	return localizePowerRollTierPresentation({ locale: locale, abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Summoner Level 1 cost-5 ability catalog and presentation', () => {
	it('adds exactly the approved 38-identity manifest and catalog slice', () => {
		expect(v1SummonerLevel1Cost5AbilityIDs).toEqual([ 'summoner-ability-1', 'summoner-ability-2', 'summoner-ability-3', 'summoner-ability-4', 'summoner-ability-5', 'summoner-ability-6' ]);
		expect(abilities.map(ability => ability.id)).toEqual([ ...v1SummonerLevel1Cost5AbilityIDs ]);
		expect(abilities.every(ability => ability.cost === 5)).toBe(true);

		expect(approvedSliceIdentities).toHaveLength(38);
		expect(new Set(approvedSliceIdentities).size).toBe(38);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());

		const catalogIdentities = catalogEntries.map(getEntryIdentity);
		expect(catalogIdentities).toHaveLength(38);
		expect(new Set(catalogIdentities).size).toBe(38);
		expect(catalogIdentities.slice().sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(catalogEntries.every(entry => entry.zhTW === entry.zhTW.trim())).toBe(true);

		// Every one of the 38 reaches the production manifest as its own required identity.
		const manifestRequired = v1LocalizationManifest.requiredCanonicalEnglish;
		approvedSliceIdentities.forEach(identity => expect(manifestRequired[identity]).toBe(required[identity]));
	});

	it('snapshots both multi-paragraph section texts with the leading newline the source carries', () => {
		// The canonical template literals open with a newline. The resolver compares its snapshot
		// byte for byte, so an entry that trimmed it would silently read English instead.
		([ 'summoner-ability-1', 'summoner-ability-2' ] as const).forEach(abilityID => {
			const identity = elementFieldIdentity(abilityID, 'sections.1.text');
			expect(required[identity].startsWith('\n')).toBe(true);
			const entry = catalogEntries.find(candidate => getEntryIdentity(candidate) === identity);
			expect(entry?.canonicalEnglish).toBe(required[identity]);
			expect(entry?.zhTW.startsWith('\n')).toBe(false);
			expect(entry?.zhTW).toContain('\n\n');
		});
	});

	it('leaves the Level 1 feature abilities, the class packages, the Circles and ability 7+ outside the slice', () => {
		// The four direct Level 1 feature abilities exist in the live class data and stay out.
		([ 'summoner-1-3', 'summoner-1-4', 'summoner-1-5', 'summoner-1-6' ] as const).forEach(featureID => {
			expect(JSON.stringify(summoner.featuresByLevel).includes(`"${featureID}"`)).toBe(true);
			expect(Object.keys(required).some(identity => identity.startsWith(`element:${featureID}/`))).toBe(false);
		});

		// Every Summoner Feature, at every level, stays outside this ability-only slice.
		summoner.featuresByLevel.forEach(level => {
			level.features.forEach(feature => {
				expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
			});
		});

		// The Circle subclasses stay outside.
		expect(summoner.subclasses.length).toBeGreaterThan(0);
		expect(Object.keys(required).some(identity => identity.startsWith('element:summoner-sub-'))).toBe(false);

		// Ability 7 exists and is deliberately the first one left out.
		expect(summoner.abilities.some(ability => ability.id === 'summoner-ability-7')).toBe(true);
		expect(Object.keys(required).some(identity => /^element:summoner-ability-(?:[7-9]|\d\d+)\//.test(identity))).toBe(false);
		expect(catalogEntries.every(entry => ([ ...v1SummonerLevel1Cost5AbilityIDs ] as string[]).includes(entry.elementID))).toBe(true);
	});

	it('keeps localization integrity healthy while the parent domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);

		// This slice closes no domain; nothing here pins a global required total.
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('records no glossary change for this batch', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		// 僕從 / 招牌僕從 / 小隊 and Essence Transfer's 充能 are approved inside these identities
		// only, so `glossaryDelta = []` and none of them becomes a reusable mapping.
		[ '僕從', '招牌僕從', '小隊', '充能' ].forEach(reading => expect(rows.some(row => row.includes(reading))).toBe(false));
		expect(rows.some(row => /^(Minion|Signature Minion|Squad)s?,/i.test(row))).toBe(false);

		// The Charge keyword keeps its own approved, unrelated reading.
		expect(rows).toContain('Charge,衝鋒,game-term,approved');
		expect(rows).toContain('Summoner,召喚師,game-term,approved');
		// Essence was approved before this batch and is unchanged by it.
		expect(rows).toContain('Essence,精髓,game-term,approved');
	});

	it.each([
		{ abilityID: 'summoner-ability-1', name: '精髓轉移', description: '你刺穿敵人，重新利用他那「派不上用場的生命本質」。', target: '1 個生物', canonicalName: 'Essence Transfer' },
		{ abilityID: 'summoner-ability-2', name: '爆破遊行', description: '你的僕從充滿膨脹的能量，直到再也無法存在於這個世界。', target: '特殊', canonicalName: 'Explosive Parade' },
		{ abilityID: 'summoner-ability-3', name: '牽制戰術', description: '你的僕從負責吸引炮火，替盟友轉移敵人的注意力。', target: '特殊', canonicalName: 'Distraction Tactics' },
		{ abilityID: 'summoner-ability-4', name: '集結戰吼', description: '「展現你們的能耐吧！」', target: '所有盟友', canonicalName: 'Rally Cry' },
		{ abilityID: 'summoner-ability-5', name: '召喚師搖籃', description: '你引導守護之力，庇護眾人免受傷害。', target: '特殊', canonicalName: 'Summoner\'s Cradle' },
		{ abilityID: 'summoner-ability-6', name: '召喚師之劍', description: '你從環繞自身的軍勢汲取力量，召出一把由灼熱能量凝成的利刃。', target: '1 個生物或物體', canonicalName: 'Summoner\'s Sword' }
	])('renders $canonicalName through AbilityPanel in approved zh-TW and restores canonical English', ({ abilityID, name, description, target, canonicalName }) => {
		const ability = getAbility(abilityID);
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, makeHero());

		expectRendered(container, name);
		expectRendered(container, description);
		expect(readFieldByLabelPrefix(container, '目標')).toBe(target);
		expect(container.textContent).not.toContain(canonicalName);

		switchLocale();

		expectRendered(container, canonicalName);
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('keeps Summoner\'s Sword\'s description exactly as the Owner approved it', () => {
		// The Owner's explicit decision: this reading stands as written, and canonical `fervor`
		// deliberately gains no Chinese game term here or anywhere else.
		const entry = catalogEntries.find(candidate => getEntryIdentity(candidate) === elementFieldIdentity('summoner-ability-6', 'description'));
		expect(entry?.zhTW).toBe('你從環繞自身的軍勢汲取力量，召出一把由灼熱能量凝成的利刃。');
		expect(entry?.canonicalEnglish).toBe('You draw your strength from the army you surround yourself with and summon a hot blade of energy and fervor.');
	});

	it.each([
		// Essence Transfer: `+ R` corruption damage beside authored charge prose the calculator never touches.
		{ abilityID: 'summoner-ability-1', tier: 1, rawZhTW: '5 + `理智`腐朽傷害；2 點充能（見下文）', heroZhTW: '7 腐朽傷害；2 點充能（見下文）' },
		{ abilityID: 'summoner-ability-1', tier: 2, rawZhTW: '8 + `理智`腐朽傷害；3 點充能', heroZhTW: '10 腐朽傷害；3 點充能' },
		{ abilityID: 'summoner-ability-1', tier: 3, rawZhTW: '11 + `理智`腐朽傷害；4 點充能', heroZhTW: '13 腐朽傷害；4 點充能' },
		// Summoner's Sword: tier 1 is bare `R damage`, tiers 2 and 3 the ordinary `N + R` grammar.
		{ abilityID: 'summoner-ability-6', tier: 1, rawZhTW: '`理智`傷害', heroZhTW: '2 傷害' },
		{ abilityID: 'summoner-ability-6', tier: 2, rawZhTW: '2 + `理智`傷害', heroZhTW: '4 傷害' },
		{ abilityID: 'summoner-ability-6', tier: 3, rawZhTW: '4 + `理智`傷害', heroZhTW: '6 傷害' }
	])('projects $abilityID tier $tier on the Hero path and keeps the approved raw reading without one', ({ abilityID, tier, rawZhTW, heroZhTW }) => {
		expect(tierReading(abilityID, 0, tier)).toBe(rawZhTW);
		expect(tierReading(abilityID, 0, tier, makeHero())).toBe(heroZhTW);
	});

	it.each([
		// Explosive Parade and Summoner's Cradle state a count, not damage: the calculator leaves
		// both alone, so the approved reading is identical with and without a Hero.
		{ abilityID: 'summoner-ability-2', tier: 1, zhTW: '你召喚 4 個招牌僕從', canonical: 'You summon four signature minions' },
		{ abilityID: 'summoner-ability-2', tier: 2, zhTW: '你召喚 5 個招牌僕從', canonical: 'You summon five signature minions' },
		{ abilityID: 'summoner-ability-2', tier: 3, zhTW: '你召喚 6 個招牌僕從', canonical: 'You summon six signature minions' },
		{ abilityID: 'summoner-ability-5', tier: 1, zhTW: '3 個生物', canonical: 'Three creatures' },
		{ abilityID: 'summoner-ability-5', tier: 2, zhTW: '4 個生物', canonical: 'Four creatures' },
		{ abilityID: 'summoner-ability-5', tier: 3, zhTW: '5 個生物', canonical: 'Five creatures' }
	])('leaves $abilityID tier $tier calculator-unchanged on both paths', ({ abilityID, tier, zhTW, canonical }) => {
		expect(AbilityLogic.getTierEffectCreature(canonical, tier, getAbility(abilityID), undefined, makeHero())).toBe(canonical);
		expect(tierReading(abilityID, 0, tier)).toBe(zhTW);
		expect(tierReading(abilityID, 0, tier, makeHero())).toBe(zhTW);
		expect(tierReading(abilityID, 0, tier, makeHero(), 'en')).toBe(canonical);
	});

	it('projects Distraction Tactics\' potency with a Hero and keeps the approved threshold without one', () => {
		// The calculator adds the potency code marks and the taunted emphasis on both paths, but
		// resolves the potency value only in Hero context.
		expect(textReading('summoner-ability-3', 'sections.0.text')).toBe('直到遭遇結束或你陷入瀕死前，本遭遇中由你控制的每個僕從都會受到以下效果：\n\n目標的打擊可以對敵人施加 `直覺` < [弱] 的**嘲諷**（EoT）。每有 1 個加入該次打擊的僕從，效力提高 1 點。');
		expect(textReading('summoner-ability-3', 'sections.0.text', makeHero())).toBe('直到遭遇結束或你陷入瀕死前，本遭遇中由你控制的每個僕從都會受到以下效果：\n\n目標的打擊可以對敵人施加 `直覺` < 1 的**嘲諷**（EoT）。每有 1 個加入該次打擊的僕從，效力提高 1 點。');
	});

	it.each([
		// Rally Cry's `equal to your Reason` is left authored by the calculator in both contexts,
		// so the approved raw expression stands and no new grammar was needed for it.
		{ abilityID: 'summoner-ability-4', field: 'sections.0.text', zhTW: '每個目標選擇以下 1 項效果：獲得 2 點鬥志，或讓下次打擊額外造成等於你`理智`的傷害。' },
		{ abilityID: 'summoner-ability-1', field: 'sections.1.text', zhTW: '* **2 點充能**：你在召喚師射程內的 1 個未占據空間召喚 1 個招牌僕從。' },
		{ abilityID: 'summoner-ability-2', field: 'sections.1.text', zhTW: '這些僕從會在射程內被召喚出來，不受僕從數量上限的限制，也不會編入小隊。' },
		{ abilityID: 'summoner-ability-2', field: 'sections.2.effect', zhTW: '除了此招式召喚的僕從之外，你也可以命令射程內任意數量的僕從，前提是他們在本回合尚未使用主要動作或機動動作。' },
		{ abilityID: 'summoner-ability-5', field: 'sections.1.text', zhTW: '直到遭遇結束前，每個目標在受到傷害時，都可以使用免費反應動作將該次傷害減半，然後失去此效果。' },
		{ abilityID: 'summoner-ability-6', field: 'sections.1.text', zhTW: '每有 1 個與你相鄰的盟友，此打擊就額外造成 2 點傷害。' }
	])('leaves $abilityID $field calculator-unchanged and reads the approved zh-TW', ({ abilityID, field, zhTW }) => {
		const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
		expect(AbilityLogic.getTextEffect(canonicalEnglish, undefined)).toBe(canonicalEnglish);
		expect(AbilityLogic.getTextEffect(canonicalEnglish, makeHero())).toBe(canonicalEnglish);
		expect(textReading(abilityID, field)).toContain(zhTW);
		expect(textReading(abilityID, field, makeHero())).toContain(zhTW);
	});

	it.each([
		{ abilityID: 'summoner-ability-1', heroZhTW: '7 腐朽傷害；2 點充能（見下文）', heroEnglish: '7 corruption damage; 2 charges (see below)' },
		{ abilityID: 'summoner-ability-6', heroZhTW: '2 傷害', heroEnglish: '2 damage' }
	])('renders $abilityID tier 1 through PowerRollPanel without mutating protected state', ({ abilityID, heroZhTW, heroEnglish }) => {
		const ability = getAbility(abilityID);
		const hero = makeHero();
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: `${abilityID} Ability`, capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Summoner Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expectRendered(withHero.container, heroZhTW.replace(/[`*]/g, '')),
			switchToEnglish: () => switchLocale(),
			assertEnglish: () => expectRendered(withHero.container, heroEnglish),
			switchToZhTW: () => switchLocale(),
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW.replace(/[`*]/g, ''))
		});

		// Only canonical English ever reaches the calculator.
		getTierEffectCreature.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTierEffectCreature.mockRestore();
	});

	it('renders Distraction Tactics through AbilityPanel on both the Hero and the Library path', () => {
		const ability = getAbility('summoner-ability-3');
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const noHero = renderAbility(ability);
		expectRendered(noHero.container, '目標的打擊可以對敵人施加 直覺 < [弱] 的嘲諷（EoT）。');
		expect(noHero.container.textContent).not.toContain('`');
		expect(noHero.container.textContent).not.toContain('taunted');
		noHero.unmount();

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'summoner-ability-3 Ability', capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Summoner Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expectRendered(withHero.container, '目標的打擊可以對敵人施加 直覺 < 1 的嘲諷（EoT）。'),
			switchToEnglish: () => switchLocale(),
			assertEnglish: () => expectRendered(withHero.container, 'can inflict I < 1 taunted (EoT) to enemies'),
			switchToZhTW: () => switchLocale(),
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, '目標的打擊可以對敵人施加 直覺 < 1 的嘲諷（EoT）。')
		});

		// The emphasis the calculator introduced is real Markdown, not literal asterisks.
		expect(Array.from(withHero.container.querySelectorAll('strong')).map(node => node.textContent)).toContain('嘲諷');

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('renders the two multi-paragraph section texts as approved zh-TW paragraphs', () => {
		const essenceTransfer = renderAbility(getAbility('summoner-ability-1'), makeHero());
		expectRendered(essenceTransfer.container, '你可以花費充能來啟動以下效果（每個效果都可以多次啟動）。發動此招式後，所有充能都會消失。');
		expectRendered(essenceTransfer.container, '1 點充能：你或召喚師射程內的 1 個盟友可以花費 1 點復元力。');
		expect(essenceTransfer.container.textContent).not.toContain('All charges disappear');
		expect(essenceTransfer.container.querySelectorAll('li')).toHaveLength(3);
		essenceTransfer.unmount();

		const explosiveParade = renderAbility(getAbility('summoner-ability-2'), makeHero());
		expectRendered(explosiveParade.container, '也不會編入小隊');
		expectRendered(explosiveParade.container, '你也不會因為僕從死亡而獲得精髓。');
		expect(explosiveParade.container.textContent).not.toContain('without organizing them into squads');
		// The Special field section keeps its own approved label and effect.
		expect(readFieldByLabelPrefix(explosiveParade.container, '特殊')).toContain('除了此招式召喚的僕從之外');
	});

	it('falls back to the whole calculated English reading rather than a mixed one', () => {
		const hero = makeHero();
		const isWholeEnglishReading = (value: string) => !/[一-鿿]/.test(value);

		// The Summoner's Sword tier projection is refused for an identity it was not approved
		// against, and for a tier whose canonical grammar it does not own.
		const swordCanonical = required[elementFieldIdentity('summoner-ability-6', 'sections.0.roll.tier1')];
		const swordCalculated = AbilityLogic.getTierEffectCreature(swordCanonical, 1, getAbility('summoner-ability-6'), undefined, hero);
		expect(swordCalculated).toBe('2 damage');
		expect(localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'summoner-ability-5', field: 'sections.0.roll.tier1', canonicalEnglish: swordCanonical, calculatedEnglish: swordCalculated })).toBe(swordCalculated);
		expect(localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'summoner-ability-6', field: 'sections.0.roll.tier2', canonicalEnglish: swordCanonical, calculatedEnglish: swordCalculated })).toBe(swordCalculated);

		// And for a calculated grammar this batch does not authorize.
		const unsupportedTier = '2 corruption damage and 2 fire damage';
		expect(localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'summoner-ability-6', field: 'sections.0.roll.tier1', canonicalEnglish: swordCanonical, calculatedEnglish: unsupportedTier })).toBe(unsupportedTier);

		// English keeps the canonical calculated reading.
		expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: 'summoner-ability-6', field: 'sections.0.roll.tier1', canonicalEnglish: swordCanonical, calculatedEnglish: swordCalculated })).toBe(swordCalculated);

		// The Distraction Tactics projection is refused under another identity, and an
		// unsupported structural rewrite falls back whole rather than mixing the two languages.
		const tacticsCanonical = required[elementFieldIdentity('summoner-ability-3', 'sections.0.text')];
		const tacticsCalculated = AbilityLogic.getTextEffect(tacticsCanonical, hero);
		expect(isWholeEnglishReading(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'summoner-ability-5', field: 'sections.1.text', canonicalEnglish: tacticsCanonical, calculatedEnglish: tacticsCalculated }))).toBe(true);

		const unsupportedText = tacticsCalculated.replace('The potency increases by 1 for each minion that joined the strike.', 'The potency increases by 2 for each minion that joined the strike.');
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'summoner-ability-3', field: 'sections.0.text', canonicalEnglish: tacticsCanonical, calculatedEnglish: unsupportedText })).toBe(unsupportedText);

		// English is never rewritten by any of this.
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'en', elementID: 'summoner-ability-3', field: 'sections.0.text', canonicalEnglish: tacticsCanonical, calculatedEnglish: tacticsCalculated })).toBe(tacticsCalculated);
	});
});
