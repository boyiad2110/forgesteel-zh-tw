// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { Feature } from '@/models/feature';
import { ConditionType } from '@/enums/condition-type';
import { summoner } from '@/data/classes/summoner/summoner';
import { core } from '@/data/sourcebooks/official/core';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1SummonerLevel1BaseAbilityRemainderRequiredCanonicalEnglish, createV1SummonerLevel1BaseNonAbilityRequiredCanonicalEnglish, createV1SummonerLevel1Cost5AbilityRequiredCanonicalEnglish, createV1SummonerLevel2BaseRequiredCanonicalEnglish, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
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
 * The approved slice, transcribed from packet `summoner-l2-base-class-localization-r2` rather
 * than generated from the manifest builder under test, so a change to that builder cannot
 * silently redefine what this slice is expected to contain.
 */
const approvedSliceIdentities = [
	'element:summoner-2-1/name',
	'element:summoner-2-2/name',
	'element:summoner-2-2/description'
];

/** The exact Owner-approved Dominion prose, as two paragraphs with no leading newline. */
const approvedDominionZhTW = '每場遭遇 1 次，你可以使用機動動作從你僕從的原生衍界或起源地召喚 1 處地景，將其放置在召喚師射程內的未占據空間地面。在你的回合中，你可以花費 1 點精髓並使用免費機動動作重新放置該地景。該地景會持續存在，直到遭遇結束、體力歸 0，或你陷入瀕死。\n\n你的地景會在 5 級與 9 級時獲得額外特性。';

const required = createV1SummonerLevel2BaseRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const summonerLevelTwo = (): Feature[] => {
	const levelTwo = summoner.featuresByLevel.find(level => level.level === 2);
	if (!levelTwo) {
		throw new Error('Summoner Level 2 features are missing');
	}
	return levelTwo.features;
};

const getFeature = (id: string): Feature => {
	const feature = summonerLevelTwo().find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Summoner Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

/** A Level 2 Summoner; Reason 3 is the characteristic every Summoner reading refers to. */
const makeHero = () => createHeroWithClass(summoner, 2, FactoryLogic.createCharacteristics(1, 2, 3, 0, 1));

const { renderFeature } = createClassPresentationHarness(summoner, [ core, summonerSourcebook ]);

/** The rendered feature title, read exactly so a substring can never stand in for it. */
const readTitle = (container: HTMLElement) => container.querySelector('.header-text')?.textContent?.trim();

/** The auto-calculate toggle FeaturePanel offers only when a calculator actually rewrites the text. */
const readAutoCalcToggle = (container: HTMLElement) => container.querySelector('[title="Auto-calculate damage, potency, etc"]');

afterEach(cleanup);

describe('V1 Summoner Level 2 base-class catalog and presentation', () => {
	it('adds exactly the approved 3-identity manifest and catalog slice', () => {
		expect(approvedSliceIdentities).toHaveLength(3);
		expect(new Set(approvedSliceIdentities).size).toBe(3);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());

		const catalogIdentities = catalogEntries.map(getEntryIdentity);
		expect(catalogIdentities).toHaveLength(3);
		expect(new Set(catalogIdentities).size).toBe(3);
		expect(catalogIdentities.slice().sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);

		// Each snapshot equals the live canonical source, not just the packet's own copy.
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(required[elementFieldIdentity('summoner-2-1', 'name')]).toBe('Perk');
		expect(required[elementFieldIdentity('summoner-2-2', 'name')]).toBe('Dominion');
		expect(required[elementFieldIdentity('summoner-2-2', 'description')]).toBe(getFeature('summoner-2-2').description);

		// Every one of the 3 reaches the production manifest as its own required identity.
		const manifestRequired = v1LocalizationManifest.requiredCanonicalEnglish;
		approvedSliceIdentities.forEach(identity => expect(manifestRequired[identity]).toBe(required[identity]));
	});

	it('agrees with an independent bounded walk of the base Level 2 list', () => {
		const independentlyWalked = extractLiveBoundedNonAbilityFeatureFields(summonerLevelTwo());

		expect(Object.keys(independentlyWalked).sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(Object.keys(independentlyWalked).every(identity => required[identity] === independentlyWalked[identity])).toBe(true);

		// Perk carries no description at all, so the walk contributes only its name.
		expect(getFeature('summoner-2-1').description).toBe('');
		expect(required[elementFieldIdentity('summoner-2-1', 'description')]).toBeUndefined();
	});

	it('snapshots Dominion’s canonical leading newline without prefixing the zh-TW', () => {
		const canonicalEnglish = required[elementFieldIdentity('summoner-2-2', 'description')];

		expect(canonicalEnglish.startsWith('\nOnce per encounter,')).toBe(true);
		expect(canonicalEnglish.startsWith('\n\n')).toBe(false);
		expect(canonicalEnglish.endsWith('\n')).toBe(false);
		// Exactly two paragraphs separated by one blank line, on both sides.
		expect(canonicalEnglish.split('\n\n')).toHaveLength(2);
		expect(approvedDominionZhTW.split('\n\n')).toHaveLength(2);

		const entry = catalogEntries.find(candidate => getEntryIdentity(candidate) === 'element:summoner-2-2/description');
		expect(entry?.zhTW).toBe(approvedDominionZhTW);
		expect(catalogEntries.filter(candidate => candidate.zhTW !== candidate.zhTW.trim())).toEqual([]);
		expect(catalogEntries.filter(candidate => candidate.canonicalEnglish !== candidate.canonicalEnglish.trim()).map(getEntryIdentity)).toEqual([ 'element:summoner-2-2/description' ]);
	});

	it('stays disjoint from every merged Summoner Level 1 slice and every out-of-scope identity', () => {
		const level1Slices = [
			createV1SummonerLevel1Cost5AbilityRequiredCanonicalEnglish(),
			createV1SummonerLevel1BaseNonAbilityRequiredCanonicalEnglish(),
			createV1SummonerLevel1BaseAbilityRemainderRequiredCanonicalEnglish()
		];
		level1Slices.forEach(other => {
			expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(other, identity))).toBe(false);
			expect(Object.keys(other).some(identity => Object.prototype.hasOwnProperty.call(required, identity))).toBe(false);
		});

		// The Circles are subclasses; none of their content, at any level, enters this slice.
		expect(summoner.subclasses.length).toBeGreaterThan(0);
		summoner.subclasses.forEach(subclass => {
			expect(Object.keys(required).some(identity => identity.startsWith(`element:${subclass.id}`))).toBe(false);
			subclass.featuresByLevel.forEach(level => {
				level.features.forEach(feature => {
					expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
				});
			});
		});

		// Level 1 and Level 3+ features, `summoner.abilities` and PackageContent all stay outside.
		summoner.featuresByLevel.filter(level => level.level !== 2).forEach(level => {
			level.features.forEach(feature => {
				expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
			});
		});
		expect(Object.keys(required).some(identity => /^element:summoner-ability-\d+\//.test(identity))).toBe(false);
		expect(Object.keys(required).some(identity => identity.includes('summoner-strike'))).toBe(false);
	});

	it('confirms Dominion is a calculated-presentation identity with no material rewrite', () => {
		const dominion = getFeature('summoner-2-2');
		const canonicalEnglish = required[elementFieldIdentity('summoner-2-2', 'description')];
		const hero = makeHero();

		// It is a Text Feature, so FeaturePanel does route it through the calculator with a Hero.
		expect(dominion.type).toBe(FeatureType.Text);

		/**
		 * The calculator's condition emphasis is derived only from `ConditionType`, which has no
		 * `Dying` member, and this prose carries no potency or characteristic term. So the
		 * calculated output is byte-equal to canonical English and there is no material rewrite:
		 * FeaturePanel keeps the approved raw localized description and never reaches the
		 * calculated authored-text presenter. This asserts the property that makes that true.
		 */
		expect(Object.values(ConditionType).some(condition => condition.toLowerCase() === 'dying')).toBe(false);
		expect(canonicalEnglish).toContain('you become dying');
		expect(AbilityLogic.getTextEffect(canonicalEnglish, undefined)).toBe(canonicalEnglish);
		expect(AbilityLogic.getTextEffect(canonicalEnglish, hero)).toBe(canonicalEnglish);
		expect(AbilityLogic.getTextEffect(canonicalEnglish, hero)).not.toContain('**dying**');
	});

	it('renders Perk and Dominion in approved zh-TW without a Hero', () => {
		const perk = renderFeature(getFeature('summoner-2-1'));
		expect(readTitle(perk.container)).toBe('專長');
		expect(perk.container.textContent).not.toContain('Perk');
		perk.unmount();

		const dominion = renderFeature(getFeature('summoner-2-2'));
		expect(readTitle(dominion.container)).toBe('疆域');
		expectRendered(dominion.container, approvedDominionZhTW.split('\n\n')[0]);
		expectRendered(dominion.container, '你的地景會在 5 級與 9 級時獲得額外特性。');
		expect(dominion.container.textContent).not.toContain('Dominion');
		expect(dominion.container.textContent).not.toContain('Once per encounter');

		// Two authored paragraphs reach the reader as real structure.
		expect(dominion.container.querySelectorAll('p').length).toBeGreaterThan(1);
		dominion.unmount();
	});

	it('renders the identical approved prose with a Hero, with no auto-calc toggle and no synthetic emphasis', () => {
		const dominion = getFeature('summoner-2-2');
		const hero = makeHero();
		const serializedFeature = JSON.stringify(dominion);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const { container } = renderFeature(dominion, hero);

		const assertZhTW = () => {
			expect(readTitle(container)).toBe('疆域');
			expectRendered(container, approvedDominionZhTW.split('\n\n')[0]);
			expectRendered(container, '你的地景會在 5 級與 9 級時獲得額外特性。');

			// This batch introduces no emphasis: 瀕死 is plain prose, not a bolded condition.
			expect(container.querySelectorAll('strong')).toHaveLength(0);
			expect(container.textContent).toContain('或你陷入瀕死。');
			expect(container.textContent).not.toContain('**');

			// No calculator rewrites this text, so FeaturePanel offers no auto-calculate toggle.
			expect(readAutoCalcToggle(container)).toBeNull();
		};

		assertZhTW();

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Dominion Feature', capture: () => JSON.stringify(dominion) }),
				protectCanonicalState({ label: 'Summoner Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: assertZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readTitle(container)).toBe('Dominion');
				expectRendered(container, 'Once per encounter, you can use a maneuver to summon a fixture');
				expectRendered(container, 'Your fixture gains additional features at 5th and 9th level.');
				expect(container.textContent).not.toContain('地景');
				expect(container.querySelectorAll('strong')).toHaveLength(0);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: assertZhTW
		});

		// Only canonical English ever reaches the calculator - never the approved zh-TW.
		expect(getTextEffect).toHaveBeenCalled();
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(getTextEffect.mock.calls.some(([ input ]) => input.includes('地景'))).toBe(false);

		expect(JSON.stringify(dominion)).toBe(serializedFeature);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('keeps localization integrity healthy while the parent domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.complete).toBe(false);
	});

	it('records no glossary change for this batch', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		// 疆域 / 地景 / 起源地 stay bound to these identities; none becomes a reusable mapping.
		[ '疆域', '地景', '起源地' ].forEach(reading => expect(rows.some(row => row.includes(reading))).toBe(false));
		expect(rows.some(row => /^(Dominion|Fixture|Origin)\b/.test(row))).toBe(false);

		// The approved entries this slice leans on are pre-existing and untouched.
		expect(rows).toContain('Perk,專長,game-term,approved');
		expect(rows).toContain('Dying,瀕死,condition,approved');
	});
});
