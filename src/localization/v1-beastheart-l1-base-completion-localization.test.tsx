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
import { createV1BeastheartLevel1BaseAbilityRequiredCanonicalEnglish, createV1BeastheartLevel1BaseCompletionRequiredCanonicalEnglish, getV1BeastheartLevel1FeatureAbilities, v1BeastheartLevel1FeatureAbilityIDs, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
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
 * The approved slice, transcribed from packet `beastheart-l1-base-completion-approved-r1`
 * rather than generated from the manifest builder under test, so a change to that builder
 * cannot silently redefine what this slice is expected to contain.
 */
const approvedSliceIdentities = [
	'element:beastheart-stamina/name',
	'element:beastheart-recoveries/name',
	'element:beastheart-resource/name',
	'element:beastheart-resource/description',
	'element:beastheart-resource/gains.0.trigger',
	'element:beastheart-resource/gains.1.trigger',
	'element:beastheart-1-1a/name',
	'element:beastheart-1-1a/description',
	'element:beastheart-1-1b/name',
	'element:beastheart-1-1b/description',
	'element:beastheart-1-2a/name',
	'element:beastheart-1-2a/description',
	'element:beastheart-1-2b/name',
	'element:beastheart-1-2b/description',
	'element:beastheart-1-4/name',
	'element:beastheart-1-4/description',
	'element:beastheart-1-4/details',
	'element:beastheart-1-5/name',
	'element:beastheart-1-5/description',
	'element:beastheart-1-6/name',
	'element:beastheart-1-6/description',
	'element:beastheart-1-7/name',
	'element:beastheart-1-8/name',
	'element:beastheart-1-9/name',
	'element:beastheart-1-3a/name',
	'element:beastheart-1-3a/target',
	'element:beastheart-1-3a/description',
	'element:beastheart-1-3a/sections.0.text',
	'element:beastheart-1-3a/sections.1.name',
	'element:beastheart-1-3a/sections.1.effect',
	'element:beastheart-1-3a/sections.2.name',
	'element:beastheart-1-3a/sections.2.effect',
	'element:beastheart-1-3a/sections.3.name',
	'element:beastheart-1-3a/sections.3.effect',
	'element:beastheart-1-3b/name',
	'element:beastheart-1-3b/target',
	'element:beastheart-1-3b/description',
	'element:beastheart-1-3b/sections.0.text',
	'element:beastheart-1-3b/sections.1.roll.tier1',
	'element:beastheart-1-3b/sections.1.roll.tier2',
	'element:beastheart-1-3b/sections.1.roll.tier3'
];

const required = createV1BeastheartLevel1BaseCompletionRequiredCanonicalEnglish();
const existingAbilityRequired = createV1BeastheartLevel1BaseAbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const beastheartLevelOne = levelOneFeatures(beastheart);

const getFeature = (id: string): Feature => {
	const feature = beastheartLevelOne.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Beastheart Feature '${id}' is missing`);
	}
	return feature;
};

const getFeatureAbility = (id: string): Ability => {
	const ability = getV1BeastheartLevel1FeatureAbilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Beastheart Level 1 feature ability '${id}' is missing`);
	}
	return ability;
};

const getRampage = () => {
	const rampage = getFeature('beastheart-1-4');
	if (rampage.type !== FeatureType.HeroicResource) {
		throw new Error('Rampage is not a Heroic Resource');
	}
	return rampage;
};

/**
 * Might 2 drives Feral Strike's `+ M` damage tiers. Stamina 21 at Level 1 gives a recovery
 * value of 7, which is the only value Heart of the Beast's calculated reading carries, so the
 * two are never confusable in an assertion.
 */
const makeHero = () => createHeroWithClass(beastheart, 1, FactoryLogic.createCharacteristics(2, 1, 0, 3, 1));

const { renderFeature, renderAbility } = createClassPresentationHarness(beastheart, [ core, beastheartSourcebook ]);

/** The rendered ability or feature title, read exactly so a substring can never stand in for it. */
const readTitle = (container: HTMLElement) => container.querySelector('.header-text')?.textContent?.trim();

/**
 * Reads a rendered Markdown table as public DOM structure. Cell prose alone is not evidence of a
 * table: raw pipe syntax carries the same text, which is exactly the bug this guards.
 */
const readTables = (container: HTMLElement) => Array.from(container.querySelectorAll('table')).map(table => ({
	headers: Array.from(table.querySelectorAll('thead th')).map(cell => cell.textContent?.trim()),
	rows: Array.from(table.querySelectorAll('tbody tr')).map(row => Array.from(row.querySelectorAll('td')).map(cell => cell.textContent?.trim()))
}));

const heartTextReading = (hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity('beastheart-1-3a', 'sections.0.text')];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'beastheart-1-3a', field: 'sections.0.text', canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const feralTierReading = (tier: number, hero?: ReturnType<typeof makeHero>) => {
	const field = `sections.1.roll.tier${tier}`;
	const canonicalEnglish = required[elementFieldIdentity('beastheart-1-3b', field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getFeatureAbility('beastheart-1-3b'), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'beastheart-1-3b', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Beastheart Level 1 base completion catalog and presentation', () => {
	it('adds exactly the approved 41-identity manifest and catalog slice', () => {
		expect(approvedSliceIdentities).toHaveLength(41);
		expect(new Set(approvedSliceIdentities).size).toBe(41);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());

		const catalogIdentities = catalogEntries.map(getEntryIdentity);
		expect(catalogIdentities).toHaveLength(41);
		expect(new Set(catalogIdentities).size).toBe(41);
		expect(catalogIdentities.slice().sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		// Leading newlines are part of the approved reading, not stray whitespace: Feral Strike's
		// movement text carries one on both sides, exactly as the canonical field does.
		expect(catalogEntries.filter(entry => entry.zhTW !== entry.zhTW.trim()).map(getEntryIdentity)).toEqual([ 'element:beastheart-1-3b/sections.0.text' ]);
		expect(required[elementFieldIdentity('beastheart-1-3b', 'sections.0.text')].startsWith('\n')).toBe(true);

		// Every one of the 41 reaches the production manifest as its own required identity.
		const manifestRequired = v1LocalizationManifest.requiredCanonicalEnglish;
		approvedSliceIdentities.forEach(identity => expect(manifestRequired[identity]).toBe(required[identity]));
	});

	it('stays disjoint from the frozen 83-identity selectable base-ability slice', () => {
		expect(Object.keys(existingAbilityRequired)).toHaveLength(83);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingAbilityRequired, identity))).toBe(false);
		expect(Object.keys(existingAbilityRequired).some(identity => Object.prototype.hasOwnProperty.call(required, identity))).toBe(false);

		// The two Level 1 feature abilities belong here, not to the selectable slice.
		expect(v1BeastheartLevel1FeatureAbilityIDs).toEqual([ 'beastheart-1-3a', 'beastheart-1-3b' ]);
		expect(getV1BeastheartLevel1FeatureAbilities().map(ability => ability.id)).toEqual([ 'beastheart-1-3a', 'beastheart-1-3b' ]);
		expect(existingAbilityRequired[elementFieldIdentity('beastheart-1-3a', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('beastheart-1-3a', 'name')]).toBe('Heart of the Beast');
		expect(required[elementFieldIdentity('beastheart-1-3b', 'name')]).toBe('Feral Strike');
	});

	it('agrees with an independent bounded walk of the base Level 1 tree', () => {
		const independentlyWalked = extractLiveBoundedNonAbilityFeatureFields(beastheartLevelOne);

		// 24 of the 41 are non-Ability readings: 23 from the shared bounded walk plus Rampage's
		// explicit `details` supplement. The remaining 17 are the two feature abilities' fields.
		expect(Object.keys(independentlyWalked)).toHaveLength(23);
		expect(Object.keys(independentlyWalked).every(identity => required[identity] === independentlyWalked[identity])).toBe(true);

		// The walk stops at Ability nodes, so neither feature ability is counted or descended into.
		expect(independentlyWalked[elementFieldIdentity('beastheart-1-3a', 'name')]).toBeUndefined();
		expect(independentlyWalked[elementFieldIdentity('beastheart-1-3b', 'name')]).toBeUndefined();
	});

	it('requires Rampage’s details in addition to the fields the shared bounded walk supplies', () => {
		const rampage = getRampage();
		const walked = extractLiveBoundedNonAbilityFeatureFields(beastheartLevelOne);

		// The shared walk covers a Heroic Resource's name, description and gain triggers. Rampage
		// has no gains at all, and its whole rules text including the Rampage table lives in details.
		expect(walked[elementFieldIdentity('beastheart-1-4', 'name')]).toBe('Rampage');
		expect(walked[elementFieldIdentity('beastheart-1-4', 'details')]).toBeUndefined();
		expect(rampage.data.gains).toEqual([]);

		// The manifest supplies details explicitly, exactly as authored - the leading newline
		// included, since that is part of the canonical text the catalog snapshots.
		expect(required[elementFieldIdentity('beastheart-1-4', 'details')]).toBe(rampage.data.details);
		expect(required[elementFieldIdentity('beastheart-1-4', 'details')].startsWith('\nYour companion has a resource called rampage.')).toBe(true);
	});

	it('leaves the Companion and Summon records, Wild Nature, Level 2+ and abilities 13+ outside the slice', () => {
		expect(Object.keys(required).some(identity => identity.includes('beastheart-companion'))).toBe(false);
		expect(Object.keys(required).some(identity => identity.includes('summon'))).toBe(false);

		// The Companion SummonChoice contributes its own reading without pulling in its options.
		const companionChoice = getFeature('beastheart-1-2a');
		expect(companionChoice.type).toBe(FeatureType.SummonChoice);
		expect(required[elementFieldIdentity('beastheart-1-2a', 'name')]).toBe('Companion');

		expect(beastheart.subclasses.map(subclass => subclass.id)).toEqual([ 'beastheart-sub-1', 'beastheart-sub-2', 'beastheart-sub-3', 'beastheart-sub-4' ]);
		expect(Object.keys(required).some(identity => identity.startsWith('element:beastheart-sub-'))).toBe(false);
		expect(required[elementFieldIdentity(beastheart.id, 'subclassName')]).toBeUndefined();

		expect(Object.keys(required).some(identity => /^element:beastheart-ability-\d+\//.test(identity))).toBe(false);

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

		// 契獸 and 搭檔 are approved only inside Beastheart identities; neither became a reusable
		// standalone mapping, and no new one-off proper or item term was promoted globally.
		expect(rows.some(row => row.includes('契獸'))).toBe(false);
		expect(rows.some(row => row.includes('搭檔'))).toBe(false);
		expect(rows.some(row => /^(Companion|Partner|Rampage),/.test(row))).toBe(false);
		expect(rows).toContain('Beastheart,獸魂者,game-term,approved');
		expect(rows).toContain('Ferocity,狠勁,game-term,approved');
	});

	it('renders the base Level 1 non-Ability features in approved zh-TW and restores canonical English', () => {
		const stamina = renderFeature(getFeature('beastheart-stamina'));
		expectRendered(stamina.container, '體力');
		stamina.unmount();

		const recoveries = renderFeature(getFeature('beastheart-recoveries'));
		expectRendered(recoveries.container, '復元力');
		recoveries.unmount();

		const skill = renderFeature(getFeature('beastheart-1-1a'));
		expectRendered(skill.container, '技能');
		expectRendered(skill.container, '從任意列表中選擇 1 項技能。');
		skill.unmount();

		const restricted = renderFeature(getFeature('beastheart-1-1b'));
		expectRendered(restricted.container, '探索類 / 隱密類技能');
		expectRendered(restricted.container, '從探索類技能、隱密類技能中選擇 2 項技能。');
		restricted.unmount();

		const companion = renderFeature(getFeature('beastheart-1-2a'));
		expectRendered(companion.container, '契獸');
		expectRendered(companion.container, '你獲得 1 隻與你同行的野生動物作為夥伴。你的契獸並不是寵物，你們之間擁有某種神祕羈絆，能讓你分享契獸的感官與原始本能。');
		companion.unmount();

		const kit = renderFeature(getFeature('beastheart-1-5'));
		expectRendered(kit.container, '套裝');
		expectRendered(kit.container, '只有你可以發動套裝的招牌招式，契獸不能。');
		kit.unmount();

		const treasure = renderFeature(getFeature('beastheart-1-6'));
		expectRendered(treasure.container, '獸魂者與魔法寶物');
		expectRendered(treasure.container, '即使契獸無法揮舞長劍，也能受益於魔法刀刃的效果！');
		treasure.unmount();

		const signature = renderFeature(getFeature('beastheart-1-7'));
		expectRendered(signature.container, '招牌招式');
		signature.unmount();

		const cost3 = renderFeature(getFeature('beastheart-1-8'));
		expectRendered(cost3.container, '3 費招式');
		cost3.unmount();

		const cost5 = renderFeature(getFeature('beastheart-1-9'));
		const serialized = JSON.stringify(getFeature('beastheart-1-9'));
		expectRendered(cost5.container, '5 費招式');

		switchLocale();

		expectRendered(cost5.container, '5pt Ability');
		expect(JSON.stringify(getFeature('beastheart-1-9'))).toBe(serialized);
		cost5.unmount();
	});

	it('renders Companions in Combat’s Owner-final prose without restoring omitted canonical phrasing', () => {
		const combat = getFeature('beastheart-1-2b');
		const serialized = JSON.stringify(combat);
		const { container } = renderFeature(combat);

		expectRendered(container, '戰鬥中的契獸');
		expectRendered(container, '若某個招式可以由你或契獸發動，招式文字中的「你」代表招式發動者，「搭檔」則代表對方。');
		expectRendered(container, '只要你和契獸彼此距離不超過 1 哩，你們就能像進行心靈溝通，但這種溝通是使用模糊的影像與感受，而非言語。');
		expectRendered(container, '你可以放走目前的契獸，然後獲得不同物種的新契獸，或召回先前放走的契獸。');
		expect(container.textContent).not.toContain('Shared Senses');

		switchLocale();

		expectRendered(container, 'Shared Senses');
		expect(JSON.stringify(combat)).toBe(serialized);
	});

	it('renders Ferocity and Rampage, including the Rampage table, on the Hero and no-Hero paths', () => {
		const ferocity = getFeature('beastheart-resource');
		const noHeroFerocity = renderFeature(ferocity);
		expectRendered(noHeroFerocity.container, '狠勁');
		expectRendered(noHeroFerocity.container, '你和契獸擁抱掠食者的嗜血本能，獲得名為「狠勁」的英雄資源。');
		expectRendered(noHeroFerocity.container, '每當你的回合開始時');
		expectRendered(noHeroFerocity.container, '每輪中，當與你的契獸相鄰的 1 個生物首次受到傷害時');
		expect(noHeroFerocity.container.textContent).not.toContain('Start of your turn');
		noHeroFerocity.unmount();

		const rampage = getRampage();
		const hero = makeHero();

		/**
		 * The Rampage table is authored with the legacy `=` delimiter row, which `marked` does not
		 * recognise; before the shared compatibility normalization it reached the reader as raw
		 * pipe text. These assertions therefore read real DOM table structure, and check that the
		 * legacy delimiter is never rendered, rather than only looking for the cell prose - which
		 * the broken raw-pipe rendering contained just as much.
		 */
		const assertRampageTable = (container: HTMLElement, locale: 'zh-TW' | 'en') => {
			const tables = readTables(container);
			expect(tables).toHaveLength(1);
			expect(tables[0].headers).toEqual(locale === 'zh-TW' ? [ '暴走', '效果' ] : [ 'Rampage', 'Effect' ]);
			expect(tables[0].rows).toHaveLength(5);
			expect(tables[0].rows.map(row => row[0])).toEqual(locale === 'zh-TW'
				? [ '8', '12', '16（4 級）', '20（7 級）', '24（10 級）' ]
				: [ '8', '12', '16 (lvl 4)', '20 (lvl 7)', '24 (lvl 10)' ]);
			expect(tables[0].rows.every(row => row.length === 2)).toBe(true);

			// Representative effect cells, one from each end of the table.
			expect(tables[0].rows[1][1]).toBe(locale === 'zh-TW' ? '契獸擁有等於其直覺的傷害免疫。' : 'Your companion has damage immunity equal to their Intuition score.');
			expect(tables[0].rows[4][1]).toContain(locale === 'zh-TW' ? '可以擲 3d10 並捨棄點數最低的 1 顆骰子。' : 'they can roll 3d10 and discard the lowest roll.');

			// The legacy delimiter syntax itself never reaches the reader in either locale.
			expect(container.textContent).not.toContain(':====');
			expect(container.textContent).not.toContain('|:');
		};

		const assertZhTWRampage = (container: HTMLElement) => {
			expect(readTitle(container)).toBe('暴走');
			expectRendered(container, '狠勁會磨利你的殺戮本能，但也可能驅使契獸陷入暴走，在浴血戰鬥中不分敵我地狂亂攻擊。');
			expectRendered(container, '契獸不會花費暴走來發動招式，但當契獸的暴走達到 8 時，牠就會陷入暴走。');
			assertRampageTable(container, 'zh-TW');
		};

		const noHeroRampage = renderFeature(rampage);
		assertZhTWRampage(noHeroRampage.container);
		expect(noHeroRampage.container.textContent).not.toContain('Your companion has a resource called rampage');
		noHeroRampage.unmount();

		const withHero = renderFeature(rampage, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Rampage Feature', capture: () => JSON.stringify(rampage) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => assertZhTWRampage(withHero.container),
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readTitle(withHero.container)).toBe('Rampage');
				expectRendered(withHero.container, 'Your companion has a resource called rampage.');
				assertRampageTable(withHero.container, 'en');
			},
			switchToZhTW: switchLocale,
			// The locale round trip restores the zh-TW table as real structure, not just its prose.
			assertZhTWAfterRoundTrip: () => assertZhTWRampage(withHero.container)
		});
	});

	it('renders Heart of the Beast’s authored shape and keeps its partner-relative readings unresolved', () => {
		const heart = getFeatureAbility('beastheart-1-3a');
		const serialized = JSON.stringify(heart);
		const { container } = renderAbility(heart);

		// The Owner-final reading is 野獸之心. Read the title exactly: the superseded 獸之心 is a
		// substring of it, so a `toContain` assertion could not tell the two apart.
		expect(readTitle(container)).toBe('野獸之心');
		expect(readTitle(container)).not.toBe('獸之心');
		expectRendered(container, '「最好閉上眼睛，接下來的畫面可能不太好看。」');
		expect(readFieldByLabelPrefix(container, '射程 / 目標')).toContain('自身');
		expectRendered(container, '花費');

		// Both Spend effects read the partner's own values, which the canonical calculator leaves
		// authored on every surface, so the approved zh-TW keeps them exactly as written.
		expectRendered(container, '你的搭檔可以遁移最多等於其速度的距離。');
		expectRendered(container, '以此方式每花費 1 點狠勁，你的搭檔會額外獲得等於其力量的臨時體力。');
		expectRendered(container, '即使搭檔的身體已經被摧毀，你仍然可以讓已死的搭檔以 1 點體力復活。');

		switchLocale();

		expect(readTitle(container)).toBe('Heart of the Beast');
		expectRendered(container, 'Your partner can shift up to their speed.');
		expectRendered(container, 'equal to their Might score');
		expect(JSON.stringify(heart)).toBe(serialized);
	});

	it('projects Heart of the Beast’s recovery value with a Hero and keeps the approved raw wording without one', () => {
		const heart = getFeatureAbility('beastheart-1-3a');
		const rawZhTW = '你的搭檔會從你的胸口躍出，獲得等於你復元值的臨時體力。';
		const heroZhTW = '你的搭檔會從你的胸口躍出，獲得 7 點臨時體力。';

		// Library / no-Hero: the calculator leaves the expression authored, so the raw reading stands.
		expect(heartTextReading()).toContain(rawZhTW);
		const noHero = renderAbility(heart);
		expectRendered(noHero.container, rawZhTW);
		expect(noHero.container.textContent).not.toContain('recovery value');
		noHero.unmount();

		const hero = makeHero();
		expect(heartTextReading(hero)).toContain(heroZhTW);

		const serializedAbility = JSON.stringify(heart);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderAbility(heart, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Heart of the Beast Ability', capture: () => JSON.stringify(heart) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				expectRendered(withHero.container, heroZhTW);
				expect(withHero.container.textContent).not.toContain('復元值');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'Your partner gains temporary Stamina equal to 7 as they leap out of your chest.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW)
		});

		// Only canonical English ever reaches the calculator.
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(heart)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('falls back to the complete calculated English when Heart of the Beast’s reading is rewritten unexpectedly', () => {
		const canonicalEnglish = required[elementFieldIdentity('beastheart-1-3a', 'sections.0.text')];
		// A structural rewrite this presenter cannot prove: the sentence itself changed shape.
		const unsupportedCalculatedEnglish = canonicalEnglish.replace('gains temporary Stamina equal to your recovery value', 'gains 7 temporary Stamina');

		const presented = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'beastheart-1-3a',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupportedCalculatedEnglish
		});

		// A whole English reading, never a mixed partial Chinese/English sentence.
		expect(presented).toBe(unsupportedCalculatedEnglish);
		expect(presented).not.toMatch(/[一-鿿]/);
	});

	it('renders Feral Strike’s Power Roll tiers through the shared presenter on both paths', () => {
		const feral = getFeatureAbility('beastheart-1-3b');

		// Library / no-Hero keeps the approved compact zh-TW.
		expect(feralTierReading(1)).toBe('1 + `力量`傷害');
		expect(feralTierReading(2)).toBe('3 + `力量`傷害');
		expect(feralTierReading(3)).toBe('4 + `力量`傷害');

		const hero = makeHero();
		expect(feralTierReading(1, hero)).toBe('3 傷害');
		expect(feralTierReading(2, hero)).toBe('5 傷害');
		expect(feralTierReading(3, hero)).toBe('6 傷害');

		const serializedAbility = JSON.stringify(feral);
		const serializedHero = JSON.stringify(hero);

		const noHero = renderAbility(feral);
		expectRendered(noHero.container, '野性打擊');
		expectRendered(noHero.container, '你的契獸撲進戰局，以尖牙利爪或其他武器狂亂攻擊。');
		expect(readFieldByLabelPrefix(noHero.container, '目標')).toBe('區域內每個生物');
		// The companion-relative Intuition reading and the Owner-final 危險地形 wording both stand.
		expectRendered(noHero.container, '你的契獸沿直線朝牠注意到的最近敵人移動（最多移動等於其直覺的距離）。牠會自己避開危險地形，並在與該敵人相鄰時結束移動。');
		noHero.unmount();

		const withHero = renderAbility(feral, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Feral Strike Ability', capture: () => JSON.stringify(feral) }), protectCanonicalState({ label: 'Beastheart Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				expectRendered(withHero.container, '3 傷害');
				expectRendered(withHero.container, '5 傷害');
				expectRendered(withHero.container, '6 傷害');
				// The companion's own Intuition stays authored even with a Hero.
				expectRendered(withHero.container, '最多移動等於其直覺的距離');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, '3 damage');
				expectRendered(withHero.container, 'equal to their Intuition score');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, '3 傷害')
		});

		expect(JSON.stringify(feral)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
	});
});
