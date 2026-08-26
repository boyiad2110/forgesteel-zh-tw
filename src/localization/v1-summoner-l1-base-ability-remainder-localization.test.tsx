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
import { createV1SummonerLevel1BaseAbilityRemainderRequiredCanonicalEnglish, createV1SummonerLevel1BaseNonAbilityRequiredCanonicalEnglish, createV1SummonerLevel1Cost5AbilityRequiredCanonicalEnglish, getV1SummonerLevel1BaseAbilityRemainder, v1LocalizationManifest, v1SummonerLevel1BaseAbilityRemainderIDs } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, readFieldByLabelPrefix, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
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
 * The approved slice, transcribed from packet `summoner-l1-base-ability-remainder-localization-r1`
 * rather than generated from the manifest builder under test, so a change to that builder cannot
 * silently redefine what this slice is expected to contain. Trigger identities are `type.trigger`,
 * which is the repository-authoritative path the packet was corrected to.
 */
const approvedSliceIdentities = [
	'element:summoner-1-3/name',
	'element:summoner-1-3/target',
	'element:summoner-1-3/description',
	'element:summoner-1-3/sections.0.text',
	'element:summoner-1-3/sections.1.name',
	'element:summoner-1-3/sections.1.effect',
	'element:summoner-1-4/name',
	'element:summoner-1-4/target',
	'element:summoner-1-4/description',
	'element:summoner-1-4/type.trigger',
	'element:summoner-1-4/sections.0.roll.tier1',
	'element:summoner-1-4/sections.0.roll.tier2',
	'element:summoner-1-4/sections.0.roll.tier3',
	'element:summoner-1-4/sections.1.name',
	'element:summoner-1-4/sections.1.effect',
	'element:summoner-1-4/sections.2.text',
	'element:summoner-1-5/name',
	'element:summoner-1-5/target',
	'element:summoner-1-5/description',
	'element:summoner-1-5/sections.0.text',
	'element:summoner-1-5/sections.1.name',
	'element:summoner-1-5/sections.1.effect',
	'element:summoner-1-5/sections.2.name',
	'element:summoner-1-5/sections.2.effect',
	'element:summoner-1-6/name',
	'element:summoner-1-6/target',
	'element:summoner-1-6/description',
	'element:summoner-1-6/sections.0.text',
	'element:summoner-1-6/sections.1.name',
	'element:summoner-1-6/sections.1.effect',
	'element:summoner-1-8a/name',
	'element:summoner-1-8a/target',
	'element:summoner-1-8a/description',
	'element:summoner-1-8a/type.trigger',
	'element:summoner-1-8a/sections.0.text',
	'element:summoner-1-8a/sections.1.name',
	'element:summoner-1-8a/sections.1.effect',
	'element:summoner-1-8b/name',
	'element:summoner-1-8b/target',
	'element:summoner-1-8b/description',
	'element:summoner-1-8b/type.trigger',
	'element:summoner-1-8b/sections.0.text',
	'element:summoner-1-8b/sections.1.name',
	'element:summoner-1-8b/sections.1.effect',
	'element:summoner-1-8c/name',
	'element:summoner-1-8c/target',
	'element:summoner-1-8c/description',
	'element:summoner-1-8c/type.trigger',
	'element:summoner-1-8c/sections.0.name',
	'element:summoner-1-8c/sections.0.effect',
	'element:summoner-1-8c/sections.1.text',
	'element:summoner-1-8d/name',
	'element:summoner-1-8d/target',
	'element:summoner-1-8d/description',
	'element:summoner-1-8d/type.trigger',
	'element:summoner-1-8d/sections.0.text',
	'element:summoner-1-8d/sections.1.name',
	'element:summoner-1-8d/sections.1.effect'
];

const required = createV1SummonerLevel1BaseAbilityRemainderRequiredCanonicalEnglish();
const cost5Required = createV1SummonerLevel1Cost5AbilityRequiredCanonicalEnglish();
const nonAbilityRequired = createV1SummonerLevel1BaseNonAbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const abilities = getV1SummonerLevel1BaseAbilityRemainder();

const getAbility = (id: string): Ability => {
	const ability = abilities.find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Summoner Level 1 base ability '${id}' is missing`);
	}
	return ability;
};

/** Reason 3 gives Summoner Strike a weak potency of 1, distinct from every other number here. */
const makeHero = () => createHeroWithClass(summoner, 1, FactoryLogic.createCharacteristics(1, 2, 3, 0, 1));

const { renderAbility } = createClassPresentationHarness(summoner, [ core, summonerSourcebook ]);

/** The rendered ability title, read exactly so a substring can never stand in for it. */
const readTitle = (container: HTMLElement) => container.querySelector('.header-text')?.textContent?.trim();

const textReading = (elementID: string, field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: elementID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const tierReading = (elementID: string, tier: number, hero?: ReturnType<typeof makeHero>) => {
	const field = `sections.0.roll.tier${tier}`;
	const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getAbility(elementID), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: elementID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Summoner Level 1 base Ability remainder catalog and presentation', () => {
	it('adds exactly the approved 58-identity manifest and catalog slice', () => {
		expect(v1SummonerLevel1BaseAbilityRemainderIDs).toEqual([ 'summoner-1-3', 'summoner-1-4', 'summoner-1-5', 'summoner-1-6', 'summoner-1-8a', 'summoner-1-8b', 'summoner-1-8c', 'summoner-1-8d' ]);
		expect(abilities.map(ability => ability.id)).toEqual([ ...v1SummonerLevel1BaseAbilityRemainderIDs ]);

		expect(approvedSliceIdentities).toHaveLength(58);
		expect(new Set(approvedSliceIdentities).size).toBe(58);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());

		const catalogIdentities = catalogEntries.map(getEntryIdentity);
		expect(catalogIdentities).toHaveLength(58);
		expect(new Set(catalogIdentities).size).toBe(58);
		expect(catalogIdentities.slice().sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		// Every one of the 58 reaches the production manifest as its own required identity.
		const manifestRequired = v1LocalizationManifest.requiredCanonicalEnglish;
		approvedSliceIdentities.forEach(identity => expect(manifestRequired[identity]).toBe(required[identity]));
	});

	it('addresses every ability trigger at type.trigger, never at a bare trigger path', () => {
		const triggerIdentities = Object.keys(required).filter(identity => identity.includes('trigger'));

		expect(triggerIdentities.sort()).toEqual([
			'element:summoner-1-4/type.trigger',
			'element:summoner-1-8a/type.trigger',
			'element:summoner-1-8b/type.trigger',
			'element:summoner-1-8c/type.trigger',
			'element:summoner-1-8d/type.trigger'
		]);
		expect(Object.keys(required).some(identity => identity.endsWith('/trigger'))).toBe(false);

		// Each reads the live canonical trigger off the ability's own type.
		triggerIdentities.forEach(identity => {
			const elementID = identity.slice('element:'.length).split('/')[0];
			expect(required[identity]).toBe(getAbility(elementID).type.trigger);
		});
	});

	it('snapshots Minion Bridge’s canonical leading newline without prefixing the zh-TW', () => {
		const canonicalEnglish = required[elementFieldIdentity('summoner-1-6', 'sections.0.text')];

		expect(canonicalEnglish.startsWith('\nYou shift into a square adjacent to the target')).toBe(true);
		expect(canonicalEnglish.startsWith('\n\n')).toBe(false);
		expect(canonicalEnglish.endsWith('\n')).toBe(false);

		const entry = catalogEntries.find(candidate => getEntryIdentity(candidate) === 'element:summoner-1-6/sections.0.text');
		expect(entry?.zhTW.startsWith('你遁移到與目標相鄰的 1 個方格')).toBe(true);

		// It is the only canonical reading in the slice carrying surrounding whitespace, and no
		// approved zh-TW carries any. Nothing in the slice carries an invisible character either.
		expect(catalogEntries.filter(candidate => candidate.canonicalEnglish !== candidate.canonicalEnglish.trim()).map(getEntryIdentity)).toEqual([ 'element:summoner-1-6/sections.0.text' ]);
		expect(catalogEntries.filter(candidate => candidate.zhTW !== candidate.zhTW.trim())).toEqual([]);
		expect(catalogEntries.filter(candidate => /[\u200B-\u200D\uFEFF]/.test(candidate.zhTW))).toEqual([]);
	});

	it('stays disjoint from both merged Summoner Level 1 slices and every out-of-scope identity', () => {
		expect(Object.keys(cost5Required)).toHaveLength(38);
		expect(Object.keys(nonAbilityRequired)).toHaveLength(28);
		[ cost5Required, nonAbilityRequired ].forEach(other => {
			expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(other, identity))).toBe(false);
			expect(Object.keys(other).some(identity => Object.prototype.hasOwnProperty.call(required, identity))).toBe(false);
		});

		// Tactic Call's own parent reading belongs to the merged non-Ability slice, not here.
		expect(Object.keys(required).some(identity => identity.startsWith('element:summoner-1-8/'))).toBe(false);
		expect(nonAbilityRequired[elementFieldIdentity('summoner-1-8', 'name')]).toBe('Tactic Call');

		// The Summoner Strike PackageContent is authored on its own package, never as an ability field.
		expect(Object.keys(required).some(identity => identity.includes('summoner-strike'))).toBe(false);
		expect(catalogEntries.some(entry => entry.elementID === 'summoner-strike')).toBe(false);

		// `summoner.abilities` (the selectable list), Circles and Level 2+ all stay outside.
		expect(Object.keys(required).some(identity => /^element:summoner-ability-\d+\//.test(identity))).toBe(false);
		summoner.subclasses.forEach(subclass => {
			expect(Object.keys(required).some(identity => identity.startsWith(`element:${subclass.id}`))).toBe(false);
		});
		summoner.featuresByLevel.filter(level => level.level > 1).forEach(level => {
			level.features.forEach(feature => {
				expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
			});
		});
	});

	it('confirms Summoner Strike is the only reading a canonical calculator rewrites', () => {
		/**
		 * Independent discovery over the whole live slice rather than a restatement of the packet:
		 * every identity is replayed through its own calculator on both the Hero and no-Hero path,
		 * and only readings the calculator actually changes are collected.
		 */
		const hero = makeHero();
		const rewritten = abilities.flatMap(ability => Object.keys(required)
			.filter(identity => identity.startsWith(`element:${ability.id}/`))
			.filter(identity => {
				const field = identity.slice('element:'.length).split('/').slice(1).join('/');
				const canonicalEnglish = required[identity];
				const tierMatch = /^sections\.\d+\.roll\.tier(\d)$/.exec(field);
				const calculate = (context: typeof hero | undefined) => (tierMatch
					? AbilityLogic.getTierEffectCreature(canonicalEnglish, Number(tierMatch[1]), ability, undefined, context)
					: AbilityLogic.getTextEffect(canonicalEnglish, context));
				return (calculate(undefined) !== canonicalEnglish) || (calculate(hero) !== canonicalEnglish);
			}));

		expect(rewritten).toEqual([ 'element:summoner-1-3/sections.0.text' ]);
	});

	it('keeps Summoner Strike’s bare R damage unresolved and projects only potency and emphasis', () => {
		const canonicalEnglish = required[elementFieldIdentity('summoner-1-3', 'sections.0.text')];
		expect(canonicalEnglish).toBe('R damage. If the target has R < [weak], they are slowed (save ends).');

		// The canonical calculator never resolves the bare `R damage` term, with or without a Hero.
		const hero = makeHero();
		expect(AbilityLogic.getTextEffect(canonicalEnglish, undefined)).toContain('R damage.');
		expect(AbilityLogic.getTextEffect(canonicalEnglish, hero)).toContain('R damage.');
		expect(AbilityLogic.getTextEffect(canonicalEnglish, hero)).toContain('R < 1');

		// Library / no-Hero: the approved raw potency stands, and only the emphasis is added.
		expect(textReading('summoner-1-3', 'sections.0.text')).toBe('`理智`傷害。若目標的`理智` < [弱]，則陷入**緩速**（豁免解除）。');

		// Hero: the raw `理智` damage wording is untouched, only the potency number is projected.
		expect(textReading('summoner-1-3', 'sections.0.text', hero)).toBe('`理智`傷害。若目標的`理智` < 1，則陷入**緩速**（豁免解除）。');
	});

	it('falls back to whole calculated English when Summoner Strike is rewritten unexpectedly', () => {
		const canonicalEnglish = required[elementFieldIdentity('summoner-1-3', 'sections.0.text')];
		// A structural rewrite this presenter cannot prove: the damage clause itself changed shape.
		const unsupportedCalculatedEnglish = canonicalEnglish.replace('R damage.', '3 damage.');

		const presented = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'summoner-1-3',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupportedCalculatedEnglish
		});

		// A whole English reading, never a mixed partial Chinese/English sentence.
		expect(presented).toBe(unsupportedCalculatedEnglish);
		expect(presented).not.toMatch(/[一-鿿]/);
	});

	it('keeps Strike For Me’s Power Roll tiers as approved zh-TW on both paths', () => {
		const hero = makeHero();

		// The calculator leaves this prose structurally unchanged, so no projection is needed.
		([ 1, 2, 3 ] as const).forEach(tier => {
			const expected = [ '最多 3 個目標各自發動 1 次基礎打擊', '最多 5 個目標各自發動 1 次基礎打擊', '最多 7 個目標各自發動 1 次基礎打擊' ][tier - 1];
			expect(tierReading('summoner-1-4', tier)).toBe(expected);
			expect(tierReading('summoner-1-4', tier, hero)).toBe(expected);
		});
	});

	it('keeps Halt!’s minion-relative their speed raw and never projects it from Hero Speed', () => {
		const identity = elementFieldIdentity('summoner-1-8b', 'sections.1.effect');
		const canonicalEnglish = required[identity];
		const hero = makeHero();

		expect(canonicalEnglish).toContain('shift up to their speed');

		// The calculator leaves it authored in both contexts, so the approved raw reading stands.
		expect(AbilityLogic.getTextEffect(canonicalEnglish, undefined)).toBe(canonicalEnglish);
		expect(AbilityLogic.getTextEffect(canonicalEnglish, hero)).toBe(canonicalEnglish);

		const expected = '你可以選擇不召喚新的僕從，而是命令射程內的 1 個僕從在任何額外效果發生前，朝與目標相鄰的 1 個方格遁移最多等於其速度的距離。';
		expect(textReading('summoner-1-8b', 'sections.1.effect')).toBe(expected);
		expect(textReading('summoner-1-8b', 'sections.1.effect', hero)).toBe(expected);

		// The Hero's own Speed never appears in the reading.
		expect(textReading('summoner-1-8b', 'sections.1.effect', hero)).not.toMatch(/遁移最多 \d+ /);
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

		// 法器 / 僕從名錄 and the Summoner-context minion readings stay identity-bound.
		[ '法器', '僕從名錄', '僕從', '招牌僕從', '小隊' ].forEach(reading => expect(rows.some(row => row.includes(reading))).toBe(false));
		expect(rows.some(row => /^(Implement|Portfolio|Minions|Signature Minion)\b/.test(row))).toBe(false);

		// The already-approved entries the slice leans on are untouched.
		expect(rows).toContain('Summoner,召喚師,game-term,approved');
		expect(rows).toContain('Charge,衝鋒,game-term,approved');
	});

	const staticReadings = [
		{ abilityID: 'summoner-1-3', name: '召喚師打擊', description: '劇烈能量從你的法器中迸發，震顫敵人的神經。', target: '1 個生物或物體', canonicalName: 'Summoner Strike' },
		{ abilityID: 'summoner-1-4', name: '替我出手', description: '僕從替你作戰。', target: '你的每個僕從', canonicalName: 'Strike For Me' },
		{ abilityID: 'summoner-1-5', name: '召喚', description: '承汝之威，顯吾之能。吾喚汝現身。', target: '自身', canonicalName: 'Call Forth' },
		{ abilityID: 'summoner-1-6', name: '僕從之橋', description: '你的僕從竭盡所能為你搭建安全通路。', target: '你的 1 個僕從', canonicalName: 'Minion Bridge' },
		{ abilityID: 'summoner-1-8a', name: '集火！', description: '你確保敵人無法躲過接下來的攻勢。', target: '自身或 1 個盟友', canonicalName: 'Focus Fire!' },
		{ abilityID: 'summoner-1-8b', name: '攔下！', description: '你命令僕從上前阻擋。', target: '1 個生物', canonicalName: 'Halt!' },
		{ abilityID: 'summoner-1-8c', name: '還早！', description: '我命令你不准死。', target: '1 個盟友', canonicalName: 'Not Yet!' },
		{ abilityID: 'summoner-1-8d', name: '護駕！', description: '你呼喚僕從用身體為目標擋下這一擊。', target: '自身或 1 個盟友', canonicalName: 'Shield!' }
	];

	it('renders all eight abilities’ approved names, descriptions and targets', () => {
		staticReadings.forEach(expected => {
			const ability = getAbility(expected.abilityID);
			const { container, unmount } = renderAbility(ability);

			expect(readTitle(container)).toBe(expected.name);
			expectRendered(container, expected.description);
			expect(readFieldByLabelPrefix(container, '目標')).toBe(expected.target);
			expect(container.textContent).not.toContain(expected.canonicalName);
			unmount();
		});
	});

	it('renders the four Tactic Call option triggers in approved zh-TW', () => {
		([
			{ abilityID: 'summoner-1-8a', trigger: '當目標對其他生物造成傷害時。', canonical: 'The target deals damage to another creature.' },
			{ abilityID: 'summoner-1-8b', trigger: '當目標開始回合、移動，或被強制移動時。', canonical: 'The target starts their turn, moves, or is force moved.' },
			{ abilityID: 'summoner-1-8c', trigger: '當目標受到足以死亡或被摧毀的傷害時。', canonical: 'The target receives enough damage to die or be destroyed.' },
			{ abilityID: 'summoner-1-8d', trigger: '當目標成為打擊的目標時。', canonical: 'The target is targeted by a strike.' }
		]).forEach(expected => {
			const { container, unmount } = renderAbility(getAbility(expected.abilityID));
			expectRendered(container, expected.trigger);
			expect(container.textContent).not.toContain(expected.canonical);
			unmount();
		});
	});

	it('renders Summoner Strike through the production panel on both paths and restores English', () => {
		const strike = getAbility('summoner-1-3');
		const hero = makeHero();
		const serializedAbility = JSON.stringify(strike);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		// Code marks and emphasis render as their own elements, so these DOM readings carry
		// neither; the exact backticked form is asserted on the presenter above.
		const noHero = renderAbility(strike);
		expectRendered(noHero.container, '理智傷害。若目標的理智 < [弱]，則陷入緩速（豁免解除）。');
		expectRendered(noHero.container, '此招式以近戰打擊發動時，具有「衝鋒」關鍵詞。');
		expect(noHero.container.textContent).not.toContain('R damage');
		noHero.unmount();

		const withHero = renderAbility(strike, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Summoner Strike Ability', capture: () => JSON.stringify(strike) }),
				protectCanonicalState({ label: 'Summoner Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				// The raw `理智` damage wording survives; only the potency number is projected.
				expectRendered(withHero.container, '理智傷害。若目標的理智 < 1，則陷入緩速');
				expect(withHero.container.textContent).not.toContain('[弱]');
				expect(withHero.container.textContent).not.toContain('R damage');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'R damage.');
				expectRendered(withHero.container, 'R < 1');
				expect(withHero.container.textContent).not.toContain('理智');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, '理智傷害。若目標的理智 < 1，則陷入緩速')
		});

		// Only canonical English ever reaches the calculator.
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(strike)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('renders the remaining authored sections in approved zh-TW with a Hero', () => {
		const hero = makeHero();

		([
			{ abilityID: 'summoner-1-4', reading: '你的僕從會代替你發動基礎打擊或招牌招式。' },
			{ abilityID: 'summoner-1-4', reading: '若擲出天然 19 或 20，每個目標各自發動 1 次基礎打擊。' },
			{ abilityID: 'summoner-1-5', reading: '你從自己的僕從名錄中召喚任意數量的僕從，並放置在射程內的未占據空間。' },
			{ abilityID: 'summoner-1-5', reading: '你在此招式每花費 1 點精髓，就召喚 1 個招牌僕從。' },
			{ abilityID: 'summoner-1-6', reading: '你遁移到與目標相鄰的 1 個方格（包括垂直相鄰的方格）。' },
			{ abilityID: 'summoner-1-6', reading: '與你相鄰的 1 個盟友可以在這次移動中與你一起遁移。' },
			{ abilityID: 'summoner-1-8a', reading: '目標每與 1 個你的僕從相鄰，就獲得 1 點鬥志（最多 3 點）' },
			{ abilityID: 'summoner-1-8c', reading: '目標受到的傷害減免至剛好讓其存活，剩下 1 點體力。' },
			{ abilityID: 'summoner-1-8d', reading: '若你的 1 個僕從與目標相鄰，而且位於打擊的射程內，則該僕從成為這次打擊的新目標。' }
		]).forEach(expected => {
			const { container, unmount } = renderAbility(getAbility(expected.abilityID), hero);
			expectRendered(container, expected.reading);
			unmount();
		});
	});

	it('renders Minion Bridge’s two paragraphs and restores canonical English', () => {
		const bridge = getAbility('summoner-1-6');
		const serialized = JSON.stringify(bridge);
		const { container } = renderAbility(bridge);

		expect(readTitle(container)).toBe('僕從之橋');
		expectRendered(container, '你遁移到與目標相鄰的 1 個方格（包括垂直相鄰的方格）。');
		expectRendered(container, '你可以遁移進入由僕從占據的方格（即使是困難地形也可以）。');
		expectRendered(container, '花費');
		expect(container.querySelectorAll('p').length).toBeGreaterThan(1);

		switchLocale();

		expect(readTitle(container)).toBe('Minion Bridge');
		expectRendered(container, 'You shift into a square adjacent to the target, including vertically.');
		expect(JSON.stringify(bridge)).toBe(serialized);
	});
});
