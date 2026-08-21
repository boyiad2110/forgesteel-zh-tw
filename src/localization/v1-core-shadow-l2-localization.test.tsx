// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ShadowLevel2RequiredCanonicalEnglish, createV1ShadowLevel1AbilityRequiredCanonicalEnglish, createV1ShadowLevel1CompletionRequiredCanonicalEnglish, getV1ShadowColleges, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, normalizedText, readFieldByExactLabel, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { AbilityLogic } from '@/logic/ability-logic';
import { HeroLogic } from '@/logic/hero-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { Characteristic } from '@/enums/characteristic';
import { FeatureType } from '@/enums/feature-type';
import { Ability } from '@/models/ability';
import { Feature } from '@/models/feature';
import { shadow } from '@/data/classes/shadow/shadow';
import { core } from '@/data/sourcebooks/official/core';

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
 * The live slice, rebuilt here by the test's own level lookup, the shared independent bounded
 * non-Ability walk and the test's own Ability-field reader. The production denominator is not
 * used to compute the expected set: doing so would only prove that extraction agrees with
 * itself, and a traversal or level-selection regression would still pass.
 */
const levelTwoFeatures = (owner: { featuresByLevel: { level: number, features: Feature[] }[] }) => (
	owner.featuresByLevel.find(level => level.level === 2)?.features || []
);

const extractLiveAbilityFields = (ability: Ability): Record<string, string> => {
	const fields: Record<string, string> = {};
	const add = (field: string, canonicalEnglish: string) => {
		if (canonicalEnglish === '') {
			return;
		}
		const identity = elementFieldIdentity(ability.id, field);
		if (fields[identity] !== undefined) {
			throw new Error(`duplicate localization identity '${identity}'`);
		}
		fields[identity] = canonicalEnglish;
	};

	add('name', ability.name);
	add('target', ability.target);
	add('description', ability.description);
	add('type.trigger', ability.type.trigger);
	(ability.sections || []).forEach((section, index) => {
		switch (section.type) {
			case 'text':
				add(`sections.${index}.text`, section.text);
				break;
			case 'field':
				add(`sections.${index}.name`, section.name);
				add(`sections.${index}.effect`, section.effect);
				break;
			case 'roll':
				add(`sections.${index}.roll.tier1`, section.roll.tier1);
				add(`sections.${index}.roll.tier2`, section.roll.tier2);
				add(`sections.${index}.roll.tier3`, section.roll.tier3);
				break;
		}
	});
	return fields;
};

/** The Abilities a Level 2 root list offers, through the same bounded Choice/Multiple descent. */
const boundedAbilities = (features: Feature[], collected: Ability[] = []): Ability[] => {
	features.forEach(feature => {
		if (feature.type === FeatureType.Ability) {
			collected.push(feature.data.ability);
		}
		if (feature.type === FeatureType.Choice) {
			boundedAbilities(feature.data.options.map(option => option.feature), collected);
		}
		if (feature.type === FeatureType.Multiple) {
			boundedAbilities(feature.data.features, collected);
		}
	});
	return collected;
};

const colleges = getV1ShadowColleges();

const liveFields: Record<string, string> = { ...extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(shadow)) };
colleges.forEach(college => {
	const collegeLevelTwo = levelTwoFeatures(college);
	Object.assign(liveFields, extractLiveBoundedNonAbilityFeatureFields(collegeLevelTwo));
	boundedAbilities(collegeLevelTwo).forEach(ability => Object.assign(liveFields, extractLiveAbilityFields(ability)));
});

const required = createV1ShadowLevel2RequiredCanonicalEnglish();

const shadowLevel2CatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

/** The 47 approved identities, written out independently of any extraction under test. */
const approvedIdentities = [
	'element:shadow-2-1/name',
	'element:shadow-sub-1-2-1/name',
	'element:shadow-sub-1-2-1a/name',
	'element:shadow-sub-1-2-1a/target',
	'element:shadow-sub-1-2-1a/description',
	'element:shadow-sub-1-2-1a/sections.0.roll.tier1',
	'element:shadow-sub-1-2-1a/sections.0.roll.tier2',
	'element:shadow-sub-1-2-1a/sections.0.roll.tier3',
	'element:shadow-sub-1-2-1b/name',
	'element:shadow-sub-1-2-1b/target',
	'element:shadow-sub-1-2-1b/description',
	'element:shadow-sub-1-2-1b/type.trigger',
	'element:shadow-sub-1-2-1b/sections.0.text',
	'element:shadow-sub-1-2-2/name',
	'element:shadow-sub-1-2-2/description',
	'element:shadow-sub-2-2-1/name',
	'element:shadow-sub-2-2-1a/name',
	'element:shadow-sub-2-2-1a/target',
	'element:shadow-sub-2-2-1a/description',
	'element:shadow-sub-2-2-1a/sections.0.text',
	'element:shadow-sub-2-2-1a/sections.1.roll.tier1',
	'element:shadow-sub-2-2-1a/sections.1.roll.tier2',
	'element:shadow-sub-2-2-1a/sections.1.roll.tier3',
	'element:shadow-sub-2-2-1b/name',
	'element:shadow-sub-2-2-1b/target',
	'element:shadow-sub-2-2-1b/description',
	'element:shadow-sub-2-2-1b/sections.0.roll.tier1',
	'element:shadow-sub-2-2-1b/sections.0.roll.tier2',
	'element:shadow-sub-2-2-1b/sections.0.roll.tier3',
	'element:shadow-sub-2-2-1b/sections.1.text',
	'element:shadow-sub-2-2-2/name',
	'element:shadow-sub-2-2-2/description',
	'element:shadow-sub-3-2-1/name',
	'element:shadow-sub-3-2-1a/name',
	'element:shadow-sub-3-2-1a/target',
	'element:shadow-sub-3-2-1a/description',
	'element:shadow-sub-3-2-1a/sections.0.roll.tier1',
	'element:shadow-sub-3-2-1a/sections.0.roll.tier2',
	'element:shadow-sub-3-2-1a/sections.0.roll.tier3',
	'element:shadow-sub-3-2-1a/sections.1.text',
	'element:shadow-sub-3-2-1b/name',
	'element:shadow-sub-3-2-1b/target',
	'element:shadow-sub-3-2-1b/description',
	'element:shadow-sub-3-2-1b/type.trigger',
	'element:shadow-sub-3-2-1b/sections.0.text',
	'element:shadow-sub-3-2-2/name',
	'element:shadow-sub-3-2-2/description'
].sort();

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(shadow, [ core ]);

/** Selects one of a panel's segmented pages by its rendered label. */
const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent || '');

const allLevelTwoFeatures = [ ...levelTwoFeatures(shadow), ...colleges.flatMap(college => levelTwoFeatures(college)) ];

const getFeature = (id: string) => {
	const feature = allLevelTwoFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Shadow Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

const getAbility = (id: string) => {
	const ability = colleges.flatMap(college => boundedAbilities(levelTwoFeatures(college))).find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Shadow Level 2 Ability '${id}' is missing`);
	}
	return ability;
};

const zhTWOf = (identity: string) => shadowLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;

// Agility 2 / Might 1 at Level 2; every expected value below is read back from the calculator's
// own output rather than hardcoded.
const makeHero = () => createHeroWithClass(shadow, 2, FactoryLogic.createCharacteristics(1, 2, 0, 2, 0));

afterEach(cleanup);

describe('V1 Core Shadow L2 manifest, catalog and presentation', () => {
	it('matches the independent live Shadow Level 2 slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(47);
		expect(Object.keys(required)).toHaveLength(47);
		expect(Object.keys(required).sort()).toEqual(approvedIdentities);
		expect(Object.keys(liveFields).sort()).toEqual(approvedIdentities);
		expect(required).toEqual(liveFields);

		expect(colleges.map(college => college.id)).toEqual([ 'shadow-sub-1', 'shadow-sub-2', 'shadow-sub-3' ]);
	});

	it('reads the base class Level 2 root only, and reaches every College Level 2 Ability', () => {
		// The Shadow's own Level 2 authors exactly one Feature: the Perk.
		expect(levelTwoFeatures(shadow).map(feature => feature.id)).toEqual([ 'shadow-2-1' ]);
		expect(required[elementFieldIdentity('shadow-2-1', 'name')]).toBe('Exploration / Interpersonal / Intrigue Perk');
		// The Perk carries no description of its own, so it contributes exactly one identity.
		expect(Object.keys(required).filter(identity => identity.startsWith('element:shadow-2-1/'))).toEqual([ 'element:shadow-2-1/name' ]);

		// Each College authors the same two Level 2 roots: an ability Choice and a Text Feature.
		colleges.forEach((college, index) => {
			expect(levelTwoFeatures(college).map(feature => feature.id)).toEqual([
				`shadow-sub-${index + 1}-2-1`,
				`shadow-sub-${index + 1}-2-2`
			]);
		});

		// The one shared collector reaches all six nested Abilities without descending past a
		// Choice's own options.
		expect(colleges.flatMap(college => boundedAbilities(levelTwoFeatures(college))).map(ability => ability.id)).toEqual([
			'shadow-sub-1-2-1a',
			'shadow-sub-1-2-1b',
			'shadow-sub-2-2-1a',
			'shadow-sub-2-2-1b',
			'shadow-sub-3-2-1a',
			'shadow-sub-3-2-1b'
		]);
	});

	it('keeps College metadata, Level 1 content and every Level 3+ sibling out of the slice', () => {
		expect(Object.keys(required).some(identity => /shadow-sub-\d-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(Object.keys(required).some(identity => /^element:shadow-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(required[elementFieldIdentity('shadow-sub-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('shadow-3-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('shadow-sub-1-5-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('class-shadow', 'subclassName')]).toBeUndefined();

		// The Level 3+ content really is there to be missed, so the bound is doing work.
		expect(shadow.featuresByLevel.find(level => level.level === 3)?.features.length).toBeGreaterThan(0);
		expect(colleges[0].featuresByLevel.find(level => level.level === 5)?.features.length).toBeGreaterThan(0);

		// This slice is disjoint from both completed Shadow Level 1 slices.
		const levelOneIdentities = [
			...Object.keys(createV1ShadowLevel1AbilityRequiredCanonicalEnglish()),
			...Object.keys(createV1ShadowLevel1CompletionRequiredCanonicalEnglish())
		];
		expect(levelOneIdentities.filter(identity => Object.keys(required).includes(identity))).toEqual([]);
	});

	it('preserves the authored leading newline on the Friend! description', () => {
		const identity = elementFieldIdentity('shadow-sub-3-2-2', 'description');
		const canonicalEnglish = required[identity];

		expect(canonicalEnglish.startsWith('\nYour illusions make your enemies believe')).toBe(true);
		expect(canonicalEnglish.startsWith('\n\n')).toBe(false);
		// The live class data, the manifest and the catalog all carry the same untrimmed value.
		expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		expect(shadowLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.canonicalEnglish).toBe(canonicalEnglish);
		// Its own name sibling deliberately carries no leading whitespace.
		expect(required[elementFieldIdentity('shadow-sub-3-2-2', 'name')]).toBe('Friend!');
	});

	it('keeps the Sticky Bomb approved reading bomb-centered rather than carrier-centered', () => {
		const identity = elementFieldIdentity('shadow-sub-2-2-1a', 'sections.0.text');

		// Canonical closes on the bomb: 'within 2 squares of it', where 'it' is the bomb.
		expect(required[identity].endsWith('you make a power roll targeting each enemy within 2 squares of it.')).toBe(true);
		// The Owner-authorized zh-TW names the bomb explicitly rather than the carrier.
		expect(zhTWOf(`element:${identity.slice('element:'.length)}`)).toContain('你對炸彈 2 格內的每個敵人進行 1 次檢定。');
		expect(zhTWOf(`element:${identity.slice('element:'.length)}`)).not.toContain('該生物 2 格內');
	});

	it('adds exactly the 47 approved catalog entries and registers them in the live manifest', () => {
		expect(shadowLevel2CatalogEntries).toHaveLength(47);
		expect(shadowLevel2CatalogEntries.map(getEntryIdentity).sort()).toEqual(approvedIdentities);
		expect(shadowLevel2CatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(shadowLevel2CatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(shadowLevel2CatalogEntries.every(entry => (entry.zhTW.trim() !== '') && (entry.zhTW !== entry.canonicalEnglish))).toBe(true);

		Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
			expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		});

		expect(zhTWOf('element:shadow-2-1/name')).toBe('探索類 / 交涉類 / 隱密類專長');
		expect(zhTWOf('element:shadow-sub-1-2-1a/name')).toBe('黑燼一縷');
		expect(zhTWOf('element:shadow-sub-1-2-2/name')).toBe('燃燼');
		expect(zhTWOf('element:shadow-sub-2-2-1a/name')).toBe('黏性炸彈');
		expect(zhTWOf('element:shadow-sub-3-2-1a/name')).toBe('惑敵幻音');
		expect(zhTWOf('element:shadow-sub-3-2-2/name')).toBe('朋友！');
	});

	it('keeps each 2nd-Level College Ability label a separate identity without deduplicating them', () => {
		const choiceIdentities = [
			'element:shadow-sub-1-2-1/name',
			'element:shadow-sub-2-2-1/name',
			'element:shadow-sub-3-2-1/name'
		];

		choiceIdentities.forEach(identity => {
			expect(required[identity]).toBe('2nd-Level College Ability');
			expect(zhTWOf(identity)).toBe('2 級學院招式');
		});
		// Each identity carries its own entry; none was collapsed into a shared one.
		expect(shadowLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === '2nd-Level College Ability')).toHaveLength(3);

		// The repeated target readings are likewise separate identities.
		expect(shadowLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === 'Self')).toHaveLength(2);
		expect(shadowLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === 'One creature')).toHaveLength(2);
	});

	it('keeps the catalog complete while class level content stays unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'class-and-subclass-level-content',
			'official-ability-authored-content'
		]));
		expect(result.complete).toBe(false);
	});

	it('reads each College Level 2 non-Ability surface in zh-TW and back in canonical English', () => {
		const readings: { id: string, zhTW: string[], english: string[] }[] = [
			{ id: 'shadow-sub-1-2-2', zhTW: [ '燃燼', '你留下的黑燼會灼燒敵人。' ], english: [ 'Burning Ash', 'The ash you leave behind burns your foes.' ] },
			{ id: 'shadow-sub-2-2-2', zhTW: [ '老練刺客', '你很清楚如何攻擊敵人的要害。' ], english: [ 'Trained Assassin', 'You know just where to cut your enemies.' ] },
			{ id: 'shadow-sub-3-2-2', zhTW: [ '朋友！', '你的幻象讓敵人在關鍵時刻' ], english: [ 'Friend!', 'Your illusions make your enemies believe' ] }
		];

		readings.forEach(reading => {
			const protectedFeatures = protectCanonicalState({
				label: `Shadow Level 2 canonical Feature data (${reading.id})`,
				capture: () => JSON.stringify(allLevelTwoFeatures)
			});

			const panel = renderFeature(getFeature(reading.id));
			const expectZhTW = () => {
				reading.zhTW.forEach(text => expectRendered(panel.container, text));
				reading.english.forEach(text => expect(normalizedText(panel.container)).not.toContain(text));
			};

			verifyLocaleDifferentialInvariants({
				protectedStates: [ protectedFeatures ],
				assertZhTW: expectZhTW,
				switchToEnglish: switchLocale,
				assertEnglish: () => reading.english.forEach(text => expectRendered(panel.container, text)),
				switchToZhTW: switchLocale,
				assertZhTWAfterRoundTrip: expectZhTW
			});

			panel.unmount();
		});
	});

	it('presents each College ability-choice root and its two nested Ability options', () => {
		const expected = [
			{ choice: 'shadow-sub-1-2-1', options: [ '黑燼一縷', '太慢了' ], english: [ 'In a Puff of Ash', 'Too Slow' ] },
			{ choice: 'shadow-sub-2-2-1', options: [ '黏性炸彈', '臭氣炸彈' ], english: [ 'Sticky Bomb', 'Stink Bomb' ] },
			{ choice: 'shadow-sub-3-2-1', options: [ '惑敵幻音', '太天真了' ], english: [ 'Machinations of Sound', 'So Gullible' ] }
		];

		expected.forEach(entry => {
			const choice = getFeature(entry.choice);
			if (choice.type !== FeatureType.Choice) {
				throw new Error(`${entry.choice} is not a Choice`);
			}
			const serialized = JSON.stringify(choice);
			const panel = renderFeature(choice);

			expectRendered(panel.container, '2 級學院招式');
			entry.options.forEach(option => expectRendered(panel.container, option));

			switchLocale();
			expectRendered(panel.container, '2nd-Level College Ability');
			entry.english.forEach(option => expectRendered(panel.container, option));

			expect(choice.data.options.map(option => option.feature.id)).toEqual([ `${entry.choice}a`, `${entry.choice}b` ]);
			expect(JSON.stringify(choice)).toBe(serialized);
			panel.unmount();
		});
	});

	it('projects the Burning Ash Agility damage in Hero context and keeps the approved raw reading without one', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('shadow-sub-1-2-2', 'description')];
		const approvedRaw = zhTWOf('element:shadow-sub-1-2-2/description');
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'shadow-sub-1-2-2',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		});

		// Library / no Hero keeps the packet-approved unresolved reading.
		const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
		expect(noHeroCalculated).toBe(canonicalEnglish);
		expect(present(noHeroCalculated)).toBe(approvedRaw);
		expect(present(noHeroCalculated)).toContain('受到等於你`敏捷`的火焰傷害');

		// Hero context projects only the value AbilityLogic actually resolved.
		const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		const value = heroCalculated.match(/that enemy takes fire damage equal to (-?\d+)\./)?.[1];
		expect(value).toBeDefined();

		const projected = present(heroCalculated);
		expect(projected).toContain(`該敵人會受到 ${value} 點火焰傷害。`);
		expect(projected).not.toContain('受到等於你`敏捷`的火焰傷害');
		// The approved prose around the projected value is untouched.
		expect(projected).toContain('你留下的黑燼會灼燒敵人。');
		expect(projected).not.toMatch(/[A-Za-z]/);

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'shadow-sub-1-2-2',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: heroCalculated
		})).toBe(heroCalculated);
	});

	it('projects the Stink Bomb potency and weakened emphasis in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('shadow-sub-2-2-1b', 'sections.1.text')];
		const approvedRaw = zhTWOf('element:shadow-sub-2-2-1b/sections.1.text') as string;
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'shadow-sub-2-2-1b',
			field: 'sections.1.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		});

		// Without a Hero the calculator adds its own potency code marks and the condition
		// emphasis but resolves no value, so the approved reading keeps its `[中]` threshold.
		const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
		expect(noHeroCalculated).toContain('**weakened**');
		expect(noHeroCalculated).toContain('[average]');
		expect(present(noHeroCalculated)).toBe(approvedRaw.replace('虛弱', '**虛弱**'));
		expect(present(noHeroCalculated)).toContain('`力量` < [中]');

		// Hero context reads the calculator's own resolved potency.
		const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		const resolved = heroCalculated.match(/M\s*<\s*(-?\d+)/)?.[1];
		expect(resolved).toBeDefined();

		const projected = present(heroCalculated);
		expect(projected).toContain(`\`力量\` < ${resolved}`);
		expect(projected).not.toContain('[中]');
		expect(projected).toContain('**虛弱**');
		// The authored 'until the end of the encounter' clause carries no value and is kept.
		expect(projected).toContain('臭氣會停留在區域內，直到遭遇結束。');
		expect(projected).not.toMatch(/[A-Za-z]/);

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'shadow-sub-2-2-1b',
			field: 'sections.1.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: heroCalculated
		})).toBe(heroCalculated);
	});

	it('leaves the Machinations of Sound target-relative Intuition expression authored in both contexts', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('shadow-sub-3-2-1a', 'sections.1.text')];
		const approvedRaw = zhTWOf('element:shadow-sub-3-2-1a/sections.1.text');

		expect(canonicalEnglish).toContain('equal to the target’s Intuition score');

		// The score belongs to the target, not the Hero, so the calculator resolves nothing here
		// in either context and both surfaces show the approved raw zh-TW.
		([ undefined, hero ] as const).forEach(context => {
			const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, context);
			expect(calculatedEnglish).toBe(canonicalEnglish);

			expect(localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: 'shadow-sub-3-2-1a',
				field: 'sections.1.text',
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			})).toBe(approvedRaw);
		});

		expect(approvedRaw).toContain('減少等於目標`直覺`的格數');
		// The Hero's own Intuition is never substituted into this reading.
		expect(approvedRaw).not.toContain(String(HeroLogic.getCharacteristic(hero, Characteristic.Intuition)));
	});

	it('fails closed rather than guessing when the calculated English no longer matches the approved structure', () => {
		const burningAshCanonical = required[elementFieldIdentity('shadow-sub-1-2-2', 'description')];
		const burningAshUnsupported = `${burningAshCanonical.replace('equal to your Agility score', 'equal to 2')} They also gain an edge.`;

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'shadow-sub-1-2-2',
			field: 'description',
			canonicalEnglish: burningAshCanonical,
			calculatedEnglish: burningAshUnsupported
		})).toBe(burningAshUnsupported);

		// A Stink Bomb rewrite that also restated the duration clause is a structure this
		// projection cannot prove, so it falls back whole rather than mixing the two languages.
		const stinkBombCanonical = required[elementFieldIdentity('shadow-sub-2-2-1b', 'sections.1.text')];
		const stinkBombUnsupported = stinkBombCanonical
			.replace('M < [average]', 'M < 1')
			.replace('until the end of the encounter', 'until the end of the next round');

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'shadow-sub-2-2-1b',
			field: 'sections.1.text',
			canonicalEnglish: stinkBombCanonical,
			calculatedEnglish: stinkBombUnsupported
		})).toBe(stinkBombUnsupported);
	});

	it('reuses the existing Power Roll presenter for all twelve approved tier identities', () => {
		const hero = makeHero();
		const powerRollIdentities = [
			[ 'shadow-sub-1-2-1a', 'sections.0' ],
			[ 'shadow-sub-2-2-1a', 'sections.1' ],
			[ 'shadow-sub-2-2-1b', 'sections.0' ],
			[ 'shadow-sub-3-2-1a', 'sections.0' ]
		] as const;

		let covered = 0;
		powerRollIdentities.forEach(([ abilityID, section ]) => {
			const ability = getAbility(abilityID);

			([ 1, 2, 3 ] as const).forEach(tier => {
				const field = `${section}.roll.tier${tier}`;
				const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
				expect(canonicalEnglish).toBeDefined();
				assertCanonicalEnglishCalculationInput(canonicalEnglish);

				const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
				const zhTW = localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

				// Every tier localizes; none falls back to the calculated English.
				expect(zhTW).not.toBe(calculatedEnglish);
				expect(zhTW).not.toMatch(/[A-Za-z]/);
				expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish })).toBe(calculatedEnglish);
				covered += 1;
			});
		});
		expect(covered).toBe(12);
	});

	it('presents In a Puff of Ash and Sticky Bomb damage with their authored structure left alone', () => {
		const hero = makeHero();
		const agility = HeroLogic.getCharacteristic(hero, Characteristic.Agility);
		const cases = [
			{
				abilityID: 'shadow-sub-1-2-1a',
				section: 'sections.0',
				unresolved: '`敏捷`傷害',
				// The teleport distance is authored structure the calculator never touches.
				keeps: [ '你可以將目標傳送 1 格', '你可以將目標傳送最多 3 格', '你可以將目標傳送最多 5 格' ]
			},
			{
				abilityID: 'shadow-sub-2-2-1a',
				section: 'sections.1',
				unresolved: '`敏捷`火焰傷害',
				keeps: [ '火焰傷害', '火焰傷害', '火焰傷害' ]
			}
		];

		cases.forEach(scenario => {
			const ability = getAbility(scenario.abilityID);

			([ 1, 2, 3 ] as const).forEach(tier => {
				const field = `${scenario.section}.roll.tier${tier}`;
				const canonicalEnglish = required[elementFieldIdentity(scenario.abilityID, field)];
				const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: scenario.abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

				// Library / no Hero keeps the approved unresolved characteristic arithmetic.
				const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
				expect(noHeroCalculated).toBe(canonicalEnglish);
				expect(present(noHeroCalculated)).toContain(scenario.unresolved);
				expect(present(noHeroCalculated)).toContain(scenario.keeps[tier - 1]);

				// Hero context reads the calculator's own resolved damage.
				const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
				const resolved = heroCalculated.match(/^(-?\d+)\s/)?.[1];
				expect(resolved).toBeDefined();
				expect(Number(resolved)).toBe(Number(canonicalEnglish.match(/^(\d+)/)?.[1]) + agility);

				const projected = present(heroCalculated);
				expect(projected.startsWith(`${resolved} `)).toBe(true);
				expect(projected).not.toContain(scenario.unresolved);
				expect(projected).toContain(scenario.keeps[tier - 1]);
				expect(projected).not.toMatch(/[A-Za-z]/);
			});
		});
	});

	it('keeps the Stink Bomb and Machinations of Sound authored tiers free of any new numeric layer', () => {
		const hero = makeHero();
		const flatTiers = [
			{ abilityID: 'shadow-sub-2-2-1b', section: 'sections.0', expected: [ '2 劇毒傷害', '5 劇毒傷害', '7 劇毒傷害' ] },
			{ abilityID: 'shadow-sub-3-2-1a', section: 'sections.0', expected: [ '滑動 4', '滑動 5', '滑動 7' ] }
		];

		flatTiers.forEach(scenario => {
			const ability = getAbility(scenario.abilityID);

			([ 1, 2, 3 ] as const).forEach(tier => {
				const field = `${scenario.section}.roll.tier${tier}`;
				const canonicalEnglish = required[elementFieldIdentity(scenario.abilityID, field)];

				// The calculator leaves these authored in both contexts.
				([ undefined, hero ] as const).forEach(context => {
					const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, context);
					expect(calculatedEnglish).toBe(canonicalEnglish);
					expect(localizePowerRollTierPresentation({
						locale: 'zh-TW',
						abilityID: scenario.abilityID,
						field: field,
						canonicalEnglish: canonicalEnglish,
						calculatedEnglish: calculatedEnglish
					})).toBe(scenario.expected[tier - 1]);
				});
			});
		});
	});

	it('renders Burning Ash through the real Feature panel in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const agility = HeroLogic.getCharacteristic(hero, Characteristic.Agility);
		const feature = getFeature('shadow-sub-1-2-2');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const protectedFeature = protectCanonicalState({
			label: 'Burning Ash canonical Feature data',
			capture: () => JSON.stringify(feature)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Burning Ash Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const heroPanel = renderFeature(feature, hero);
		const expectZhTW = () => {
			expectRendered(heroPanel.container, '燃燼');
			expectRendered(heroPanel.container, `該敵人會受到 ${agility} 點火焰傷害。`);
			expect(normalizedText(heroPanel.container)).not.toContain('Burning Ash');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedFeature, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(heroPanel.container, 'Burning Ash');
				expectRendered(heroPanel.container, `that enemy takes fire damage equal to ${agility}.`);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});
		heroPanel.unmount();

		// Library / no Hero never reaches the auto-calc path, so the approved raw reading stands.
		const libraryPanel = renderFeature(feature);
		expectRendered(libraryPanel.container, '燃燼');
		expectRendered(libraryPanel.container, '該敵人會受到等於你敏捷的火焰傷害。');
		expect(normalizedText(libraryPanel.container)).not.toContain(`該敵人會受到 ${agility} 點火焰傷害。`);

		const inputs = getTextEffect.mock.calls.map(call => call[0]);
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('renders Stink Bomb through the real ability panel and sends only canonical English to the calculator', () => {
		const hero = makeHero();
		const ability = getAbility('shadow-sub-2-2-1b');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const protectedAbility = protectCanonicalState({
			label: 'Stink Bomb canonical Ability data',
			capture: () => JSON.stringify(ability)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Stink Bomb Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderAbility(ability, hero);
		const expectZhTW = () => {
			expectRendered(container, '臭氣炸彈');
			expectRendered(container, '臭氣會停留在區域內，直到遭遇結束。');
			expectRendered(container, '虛弱');
			expect(tierTexts(container)[0]).toContain('2 劇毒傷害');
			expect(normalizedText(container)).not.toContain('Stink Bomb');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Stink Bomb');
				expectRendered(container, 'The gas remains in the area until the end of the encounter.');
				expectRendered(container, 'weakened');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		const inputs = [
			...getTextEffect.mock.calls.map(call => call[0]),
			...getTierEffectCreature.mock.calls.map(call => call[0])
		];
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders In a Puff of Ash through the real ability panel with all three tiers localized', () => {
		const hero = makeHero();
		const ability = getAbility('shadow-sub-1-2-1a');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, hero);

		expectRendered(container, '黑燼一縷');
		expectRendered(container, '你以傳送魔法增強打擊能力。');
		// Every tier row reads in zh-TW, with its authored teleport distance intact.
		tierTexts(container).forEach(text => {
			expect(text).toContain('傷害');
			expect(text).toContain('傳送');
			expect(text).not.toMatch(/damage|teleport/);
		});

		switchLocale();
		tierTexts(container).forEach(text => expect(text).toContain('teleport'));
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('renders Machinations of Sound through the real ability panel keeping its target-relative clause raw', () => {
		const hero = makeHero();
		const ability = getAbility('shadow-sub-3-2-1a');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, hero);

		expectRendered(container, '惑敵幻音');
		expectRendered(container, '此強制移動無視穩度');
		expectRendered(container, '減少等於目標直覺的格數');
		expect(tierTexts(container)[0]).toContain('滑動 4');
		expect(normalizedText(container)).not.toContain('Intuition');

		switchLocale();
		expectRendered(container, 'equal to the target’s Intuition score');
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('reads the Shadow Level 1 and Level 2 progression together in the class panel across a full locale round trip', () => {
		const hero = makeHero();
		const heroBefore = JSON.stringify(hero);
		const protectedClass = protectCanonicalState({
			label: 'Shadow canonical class data (class panel)',
			capture: () => JSON.stringify(shadow)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (class panel Level 1 to 2 progression)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderClassPanel(hero);
		clickPage(container, '特性');

		const expectZhTW = () => {
			// A Level 1 reading from the earlier Shadow slices, next to this batch's Level 2 one.
			expect(readFieldByExactLabel(container, '1 級')).toContain('洞察');
			expect(readFieldByExactLabel(container, '2 級')).toBe('探索類 / 交涉類 / 隱密類專長');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedClass, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readFieldByExactLabel(container, 'Level 1')).toContain('Insight');
				expect(readFieldByExactLabel(container, 'Level 2')).toBe('Exploration / Interpersonal / Intrigue Perk');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		expect(JSON.stringify(hero)).toBe(heroBefore);
		expect(hero.class?.id).toBe(shadow.id);
		expect(hero.class?.level).toBe(2);
	});

	it('shows a selected College Level 2 progression without disturbing its completed Level 1 content', () => {
		const harlequinMask = colleges[2];
		const serialized = JSON.stringify(harlequinMask);
		const protectedCollege = protectCanonicalState({
			label: 'Harlequin Mask canonical College data',
			capture: () => JSON.stringify(harlequinMask)
		});

		const { container } = renderSubclass(harlequinMask);
		clickPage(container, '特性');

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedCollege ],
			assertZhTW: () => {
				expectRendered(container, '朋友！');
				expectRendered(container, '2 級學院招式');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Friend!');
				expectRendered(container, '2nd-Level College Ability');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(container, '朋友！')
		});

		expect(harlequinMask.id).toBe('shadow-sub-3');
		expect(JSON.stringify(harlequinMask)).toBe(serialized);
	});
});
