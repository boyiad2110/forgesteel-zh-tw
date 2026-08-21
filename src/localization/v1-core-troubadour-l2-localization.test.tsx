// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1TroubadourLevel2RequiredCanonicalEnglish, createV1TroubadourLevel1AbilityRequiredCanonicalEnglish, createV1TroubadourLevel1CompletionRequiredCanonicalEnglish, getV1TroubadourClassActs, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
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
import { troubadour } from '@/data/classes/troubadour/troubadour';
import { core } from '@/data/sourcebooks/official/core';
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

const classActs = getV1TroubadourClassActs();

const liveFields: Record<string, string> = {};
[ levelTwoFeatures(troubadour), ...classActs.map(classAct => levelTwoFeatures(classAct)) ].forEach(roots => {
	Object.assign(liveFields, extractLiveBoundedNonAbilityFeatureFields(roots));
	boundedAbilities(roots).forEach(ability => Object.assign(liveFields, extractLiveAbilityFields(ability)));
});

const required = createV1TroubadourLevel2RequiredCanonicalEnglish();

const troubadourLevel2CatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

/** The 45 approved identities, written out independently of any extraction under test. */
const approvedIdentities = [
	'element:troubadour-15/name',
	'element:troubadour-15/description',
	'element:troubadour-16/name',
	'element:troubadour-16/description',
	'element:troubadour-17/name',
	'element:troubadour-17/target',
	'element:troubadour-17/sections.0.text',
	'element:troubadour-18/name',
	'element:troubadour-18/description',
	'element:troubadour-19/name',
	'element:troubadour-19/description',
	'element:troubadour-20/name',
	'element:troubadour-auteur-5/name',
	'element:troubadour-auteur-6/name',
	'element:troubadour-auteur-6/target',
	'element:troubadour-auteur-6/description',
	'element:troubadour-auteur-6/sections.0.text',
	'element:troubadour-auteur-7/name',
	'element:troubadour-auteur-7/target',
	'element:troubadour-auteur-7/description',
	'element:troubadour-auteur-7/sections.0.text',
	'element:troubadour-duelist-5/name',
	'element:troubadour-duelist-6/name',
	'element:troubadour-duelist-6/target',
	'element:troubadour-duelist-6/description',
	'element:troubadour-duelist-6/sections.0.text',
	'element:troubadour-duelist-7/name',
	'element:troubadour-duelist-7/target',
	'element:troubadour-duelist-7/description',
	'element:troubadour-duelist-7/sections.0.roll.tier1',
	'element:troubadour-duelist-7/sections.0.roll.tier2',
	'element:troubadour-duelist-7/sections.0.roll.tier3',
	'element:troubadour-duelist-7/sections.1.text',
	'element:troubadour-virtuoso-7/name',
	'element:troubadour-virtuoso-8/name',
	'element:troubadour-virtuoso-8/target',
	'element:troubadour-virtuoso-8/description',
	'element:troubadour-virtuoso-8/sections.0.text',
	'element:troubadour-virtuoso-9/name',
	'element:troubadour-virtuoso-9/target',
	'element:troubadour-virtuoso-9/description',
	'element:troubadour-virtuoso-9/sections.0.text',
	'element:troubadour-virtuoso-9/sections.1.roll.tier1',
	'element:troubadour-virtuoso-9/sections.1.roll.tier2',
	'element:troubadour-virtuoso-9/sections.1.roll.tier3'
].sort();

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(troubadour, [ core ]);

/** Selects one of a panel's segmented pages by its rendered label. */
const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => (effect.textContent || '').trim());

const levelTwoRoots = [ ...levelTwoFeatures(troubadour), ...classActs.flatMap(classAct => levelTwoFeatures(classAct)) ];

/** Every non-Ability Level 2 node, including the two Text options Invocation nests. */
const allLevelTwoFeatures = ((): Feature[] => {
	const collected: Feature[] = [];
	const walk = (features: Feature[]) => features.forEach(feature => {
		if (feature.type === FeatureType.Ability) {
			return;
		}
		collected.push(feature);
		if (feature.type === FeatureType.Choice) {
			walk(feature.data.options.map(option => option.feature));
		}
		if (feature.type === FeatureType.Multiple) {
			walk(feature.data.features);
		}
	});
	walk(levelTwoRoots);
	return collected;
})();

const getFeature = (id: string) => {
	const feature = allLevelTwoFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Troubadour Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

const getAbility = (id: string) => {
	const ability = [ levelTwoFeatures(troubadour), ...classActs.map(classAct => levelTwoFeatures(classAct)) ]
		.flatMap(roots => boundedAbilities(roots))
		.find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Troubadour Level 2 Ability '${id}' is missing`);
	}
	return ability;
};

const zhTWOf = (identity: string) => troubadourLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;

// Agility 2 / Presence 2 at Level 2, the Troubadour's own primary pair. Every expected value
// below is read back from the calculator's own output rather than hardcoded.
const makeHero = () => createHeroWithClass(troubadour, 2, FactoryLogic.createCharacteristics(1, 2, 0, 0, 2));

afterEach(cleanup);

describe('V1 Core Troubadour L2 manifest, catalog and presentation', () => {
	it('matches the independent live Troubadour Level 2 slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(45);
		expect(Object.keys(required)).toHaveLength(45);
		expect(Object.keys(required).sort()).toEqual(approvedIdentities);
		expect(Object.keys(liveFields).sort()).toEqual(approvedIdentities);
		expect(required).toEqual(liveFields);

		expect(classActs.map(classAct => classAct.id)).toEqual([ 'troubadour-auteur', 'troubadour-duelist', 'troubadour-virtuoso' ]);
	});

	it('reads the base class Level 2 roots and reaches every Class Act Level 2 Ability', () => {
		// The Troubadour's own Level 2 authors three roots: a Text Feature, the Invocation
		// Choice and the Perk.
		expect(levelTwoFeatures(troubadour).map(feature => feature.id)).toEqual([ 'troubadour-15', 'troubadour-16', 'troubadour-20' ]);
		expect(required[elementFieldIdentity('troubadour-20', 'name')]).toBe('Interpersonal / Lore / Supernatural Perk');
		// The Perk carries no description of its own, so it contributes exactly one identity.
		expect(Object.keys(required).filter(identity => identity.startsWith('element:troubadour-20/'))).toEqual([ 'element:troubadour-20/name' ]);

		// Invocation mixes kinds: one Ability option beside two Text options. The bounded walk
		// stops at the Ability and reads the other two; the bounded collector does the reverse.
		const invocation = getFeature('troubadour-16');
		if (invocation.type !== FeatureType.Choice) {
			throw new Error('troubadour-16 is not a Choice');
		}
		expect(invocation.data.options.map(option => option.feature.id)).toEqual([ 'troubadour-17', 'troubadour-18', 'troubadour-19' ]);
		expect(invocation.data.options.map(option => option.feature.type)).toEqual([ FeatureType.Ability, FeatureType.Text, FeatureType.Text ]);
		expect(Object.keys(extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(troubadour))).some(identity => identity.startsWith('element:troubadour-17/'))).toBe(false);
		expect(boundedAbilities(levelTwoFeatures(troubadour)).map(ability => ability.id)).toEqual([ 'troubadour-17' ]);

		// Each Class Act authors one Level 2 root: an ability Choice offering two Abilities.
		expect(classActs.map(classAct => levelTwoFeatures(classAct).map(feature => feature.id))).toEqual([
			[ 'troubadour-auteur-5' ],
			[ 'troubadour-duelist-5' ],
			[ 'troubadour-virtuoso-7' ]
		]);
		expect(classActs.flatMap(classAct => boundedAbilities(levelTwoFeatures(classAct))).map(ability => ability.id)).toEqual([
			'troubadour-auteur-6',
			'troubadour-auteur-7',
			'troubadour-duelist-6',
			'troubadour-duelist-7',
			'troubadour-virtuoso-8',
			'troubadour-virtuoso-9'
		]);
	});

	it('keeps Class Act metadata, Level 1 content and every Level 3+ sibling out of the slice', () => {
		expect(required[elementFieldIdentity('troubadour-auteur', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('class-troubadour', 'subclassName')]).toBeUndefined();
		expect(required[elementFieldIdentity('troubadour-21', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('troubadour-auteur-8', 'description')]).toBeUndefined();
		expect(required[elementFieldIdentity('troubadour-6', 'details')]).toBeUndefined();

		// The Level 3+ content really is there to be missed, so the bound is doing work.
		expect(troubadour.featuresByLevel.find(level => level.level === 3)?.features.length).toBeGreaterThan(0);
		expect(classActs[0].featuresByLevel.find(level => level.level === 3)?.features.length).toBeGreaterThan(0);

		// This slice is disjoint from both completed Troubadour Level 1 slices.
		const levelOneIdentities = [
			...Object.keys(createV1TroubadourLevel1AbilityRequiredCanonicalEnglish()),
			...Object.keys(createV1TroubadourLevel1CompletionRequiredCanonicalEnglish())
		];
		expect(levelOneIdentities.filter(identity => Object.keys(required).includes(identity))).toEqual([]);
	});

	it('preserves the authored trailing space on the Guest Star effect text', () => {
		const identity = elementFieldIdentity('troubadour-auteur-6', 'sections.0.text');
		const canonicalEnglish = required[identity];

		expect(canonicalEnglish.endsWith('more than once during an encounter. ')).toBe(true);
		// The live class data, the manifest and the catalog all carry the same untrimmed value.
		expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		expect(troubadourLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.canonicalEnglish).toBe(canonicalEnglish);
	});

	it('keeps the multi-paragraph base Level 2 prose intact on both readings', () => {
		([ 'troubadour-15', 'troubadour-18', 'troubadour-19' ] as const).forEach(id => {
			const identity = elementFieldIdentity(id, 'description');
			expect(required[identity]).toContain('\n\n');
			expect(zhTWOf(`element:${id}/description`)).toContain('\n\n');
		});

		// Appeal to the Muses keeps all three of its authored bullet lines.
		expect((zhTWOf('element:troubadour-15/description') as string).match(/^\* /gm)).toHaveLength(3);
	});

	it('adds exactly the 45 approved catalog entries and registers them in the live manifest', () => {
		expect(troubadourLevel2CatalogEntries).toHaveLength(45);
		expect(troubadourLevel2CatalogEntries.map(getEntryIdentity).sort()).toEqual(approvedIdentities);
		expect(troubadourLevel2CatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(troubadourLevel2CatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(troubadourLevel2CatalogEntries.every(entry => (entry.zhTW.trim() !== '') && (entry.zhTW !== entry.canonicalEnglish))).toBe(true);

		Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
			expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		});

		expect(zhTWOf('element:troubadour-15/name')).toBe('祈求繆思');
		expect(zhTWOf('element:troubadour-16/name')).toBe('宣示風格');
		expect(zhTWOf('element:troubadour-17/name')).toBe('華麗登場');
		expect(zhTWOf('element:troubadour-18/name')).toBe('正式戰帖');
		expect(zhTWOf('element:troubadour-19/name')).toBe('聲名遠播');
		expect(zhTWOf('element:troubadour-20/name')).toBe('交涉類 / 學識類 / 超常類專長');
		expect(zhTWOf('element:troubadour-auteur-6/name')).toBe('客串明星');
		expect(zhTWOf('element:troubadour-auteur-7/name')).toBe('超展開');
		expect(zhTWOf('element:troubadour-duelist-6/name')).toBe('擺盪特技');
		expect(zhTWOf('element:troubadour-duelist-7/name')).toBe('接招！');
		expect(zhTWOf('element:troubadour-virtuoso-8/name')).toBe('安可');
		expect(zhTWOf('element:troubadour-virtuoso-9/name')).toBe('鬧場觀眾');
	});

	it('keeps each 2nd-Level Class Act Ability label a separate identity without deduplicating them', () => {
		const choiceIdentities = [
			'element:troubadour-auteur-5/name',
			'element:troubadour-duelist-5/name',
			'element:troubadour-virtuoso-7/name'
		];

		choiceIdentities.forEach(identity => {
			expect(required[identity]).toBe('2nd-Level Class Act Ability');
			expect(zhTWOf(identity)).toBe('2 級才華招式');
		});
		// Each identity carries its own entry; none was collapsed into a shared one.
		expect(troubadourLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === '2nd-Level Class Act Ability')).toHaveLength(3);

		// The repeated target readings are likewise separate identities.
		expect(troubadourLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === 'Special')).toHaveLength(3);
		expect(troubadourLevel2CatalogEntries.filter(entry => entry.zhTW === '特殊')).toHaveLength(3);
	});

	it('records the one approved reusable glossary term this batch adds', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^hero token,/.test(row))).toEqual([ 'hero token,英雄幣,game-term,approved' ]);
		// Both approved readings that use it agree on the term.
		expect(zhTWOf('element:troubadour-18/description')).toContain('英雄幣');
		expect(zhTWOf('element:troubadour-19/description')).toContain('英雄幣');
		// Ability and feature names are not glossary terms.
		expect(rows.some(row => /^(Guest Star|En Garde!|Encore|Tough Crowd|Invocation),/.test(row))).toBe(false);
	});

	it('keeps the corrected group quantity in the My Reputation Precedes Me reading', () => {
		const canonicalEnglish = required[elementFieldIdentity('troubadour-19', 'description')];
		const approvedRaw = zhTWOf('element:troubadour-19/description') as string;

		expect(canonicalEnglish).toContain('award the heroes 1 hero token');
		// The heroes collectively receive one token, not one each.
		expect(approvedRaw).toContain('送給英雄們 1 枚英雄幣');
		expect(approvedRaw).not.toContain('每個英雄');
	});

	it('moves completeness by exactly this slice while class level content stays unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		// This batch's own completeness movement, stated as a relation rather than a global
		// total: exactly these 45 identities, and no fewer, are the part of the live denominator
		// this slice contributes. It stays true as later batches grow the denominator around it.
		expect(Object.keys(required)).toHaveLength(45);
		const identitiesOutsideThisSlice = Object.keys(v1LocalizationManifest.requiredCanonicalEnglish).filter(identity => required[identity] === undefined);
		expect(result.requiredCount - identitiesOutsideThisSlice.length).toBe(45);

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'class-and-subclass-level-content',
			'official-ability-authored-content'
		]));
		expect(result.complete).toBe(false);
	});

	it('reads every base Level 2 non-Ability surface in zh-TW and back in canonical English', () => {
		const readings: { id: string, zhTW: string[], english: string[] }[] = [
			{ id: 'troubadour-15', zhTW: [ '祈求繆思', '向神祈禱讓戰鬥的戲劇張力更加高漲' ], english: [ 'Appeal to the Muses', 'appealing to the muses to heighten a battle' ] },
			{ id: 'troubadour-18', zhTW: [ '正式戰帖', '你同時只能維持 1 則通知。' ], english: [ 'Formal Introductions', 'You can have only one notice active at a time.' ] },
			{ id: 'troubadour-19', zhTW: [ '聲名遠播', '自身的聲望會視為比平常高 2 點' ], english: [ 'My Reputation Precedes Me', 'treat their Renown as 2 higher than usual' ] }
		];

		readings.forEach(reading => {
			const protectedFeatures = protectCanonicalState({
				label: `Troubadour Level 2 canonical Feature data (${reading.id})`,
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

	it('presents the Invocation choice with its Ability option beside its two Feature options', () => {
		const invocation = getFeature('troubadour-16');
		const serialized = JSON.stringify(invocation);
		const panel = renderFeature(invocation);

		expectRendered(panel.container, '宣示風格');
		expectRendered(panel.container, '從以下選擇 1 項特性。');
		[ '華麗登場', '正式戰帖', '聲名遠播' ].forEach(option => expectRendered(panel.container, option));

		switchLocale();
		expectRendered(panel.container, 'Invocation');
		[ 'Allow Me to Introduce Tonight’s Players', 'Formal Introductions', 'My Reputation Precedes Me' ].forEach(option => expectRendered(panel.container, option));

		expect(JSON.stringify(invocation)).toBe(serialized);
		panel.unmount();
	});

	it('presents each Class Act ability-choice root and its two nested Ability options', () => {
		const expected = [
			{ choice: 'troubadour-auteur-5', options: [ '客串明星', '超展開' ], english: [ 'Guest Star', 'Twist at the End' ] },
			{ choice: 'troubadour-duelist-5', options: [ '擺盪特技', '接招！' ], english: [ 'Classic Chandelier Stunt', 'En Garde!' ] },
			{ choice: 'troubadour-virtuoso-7', options: [ '安可', '鬧場觀眾' ], english: [ 'Encore', 'Tough Crowd' ] }
		];

		expected.forEach(entry => {
			const choice = getFeature(entry.choice);
			if (choice.type !== FeatureType.Choice) {
				throw new Error(`${entry.choice} is not a Choice`);
			}
			const serialized = JSON.stringify(choice);
			const panel = renderFeature(choice);

			expectRendered(panel.container, '2 級才華招式');
			entry.options.forEach(option => expectRendered(panel.container, option));

			switchLocale();
			expectRendered(panel.container, '2nd-Level Class Act Ability');
			entry.english.forEach(option => expectRendered(panel.container, option));

			expect(JSON.stringify(choice)).toBe(serialized);
			panel.unmount();
		});
	});

	/**
	 * Calculated path discovery, replayed as a regression. Every base Level 2 Text Feature
	 * description really does reach AbilityLogic through FeaturePanel's auto-calc path, and
	 * every in-scope authored ability text reaches it through AbilityPanel, but none of them
	 * carries grammar this calculator resolves - the Speed belongs to an ally, the
	 * highest-characteristic doubling to each target, and the copied Presence power roll to a
	 * different ability. So both the Hero and the no-Hero surface keep the approved raw zh-TW,
	 * and no identity-bound presenter projection is needed for this slice.
	 */
	it('leaves every in-scope authored reading unresolved by the calculator in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const authoredIdentities: { elementID: string, field: string }[] = [
			{ elementID: 'troubadour-15', field: 'description' },
			{ elementID: 'troubadour-18', field: 'description' },
			{ elementID: 'troubadour-19', field: 'description' },
			{ elementID: 'troubadour-17', field: 'sections.0.text' },
			{ elementID: 'troubadour-auteur-6', field: 'description' },
			{ elementID: 'troubadour-auteur-6', field: 'sections.0.text' },
			{ elementID: 'troubadour-auteur-7', field: 'description' },
			{ elementID: 'troubadour-auteur-7', field: 'sections.0.text' },
			{ elementID: 'troubadour-duelist-6', field: 'description' },
			{ elementID: 'troubadour-duelist-6', field: 'sections.0.text' },
			{ elementID: 'troubadour-duelist-7', field: 'description' },
			{ elementID: 'troubadour-duelist-7', field: 'sections.1.text' },
			{ elementID: 'troubadour-virtuoso-8', field: 'description' },
			{ elementID: 'troubadour-virtuoso-8', field: 'sections.0.text' },
			{ elementID: 'troubadour-virtuoso-9', field: 'description' },
			{ elementID: 'troubadour-virtuoso-9', field: 'sections.0.text' }
		];

		authoredIdentities.forEach(({ elementID, field }) => {
			const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
			expect(canonicalEnglish).toBeDefined();
			assertCanonicalEnglishCalculationInput(canonicalEnglish);
			const approvedRaw = zhTWOf(`element:${elementID}/${field}`);

			([ undefined, hero ] as const).forEach(context => {
				const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, context);
				expect(calculatedEnglish).toBe(canonicalEnglish);

				expect(localizeCalculatedAuthoredTextPresentation({
					locale: 'zh-TW',
					elementID: elementID,
					field: field,
					canonicalEnglish: canonicalEnglish,
					calculatedEnglish: calculatedEnglish
				})).toBe(approvedRaw);

				expect(localizeCalculatedAuthoredTextPresentation({
					locale: 'en',
					elementID: elementID,
					field: field,
					canonicalEnglish: canonicalEnglish,
					calculatedEnglish: calculatedEnglish
				})).toBe(calculatedEnglish);
			});
		});
	});

	it('keeps the ally, target and copied-ability expressions out of localization arithmetic', () => {
		const hero = makeHero();
		const speed = HeroLogic.getSpeed(hero);
		const presence = HeroLogic.getCharacteristic(hero, Characteristic.Presence);

		// Each ally shifts up to their own Speed, so the Hero's Speed is never substituted.
		expect(required[elementFieldIdentity('troubadour-17', 'sections.0.text')]).toContain('Each ally can shift up to their speed');
		expect(zhTWOf('element:troubadour-17/sections.0.text')).toContain('遁移最多等於其速度的距離');
		expect(zhTWOf('element:troubadour-17/sections.0.text')).not.toContain(String(speed));

		// The doubled characteristic belongs to each target, not the Hero.
		expect(required[elementFieldIdentity('troubadour-duelist-6', 'sections.0.text')]).toContain('twice their highest characteristic score');
		expect(zhTWOf('element:troubadour-duelist-6/sections.0.text')).toContain('等於自己最高屬性 ×2 的傷害');

		// Encore names the Hero's own Presence, but the copied ability's power roll is not this
		// ability's, so nothing here is resolved into the reading either.
		expect(required[elementFieldIdentity('troubadour-virtuoso-8', 'sections.0.text')]).toContain('you use your Presence score for any power rolls');
		expect(zhTWOf('element:troubadour-virtuoso-8/sections.0.text')).toContain('使用你的`氣場`');
		expect(zhTWOf('element:troubadour-virtuoso-8/sections.0.text')).not.toContain(`${presence} 點`);
	});

	it('fails closed rather than guessing when the calculated English no longer matches the approved structure', () => {
		const canonicalEnglish = required[elementFieldIdentity('troubadour-17', 'sections.0.text')];
		const unsupported = `${canonicalEnglish.replace('up to their speed', 'up to 6 squares')} They also gain an edge.`;

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'troubadour-17',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupported
		})).toBe(unsupported);

		// A tier rewritten into a shape the generic Power Roll projection cannot prove falls
		// back whole rather than mixing the two languages.
		const tierCanonical = required[elementFieldIdentity('troubadour-duelist-7', 'sections.0.roll.tier1')];
		const tierUnsupported = `${tierCanonical.replace('7 + A damage', '9 damage')} and the target is pushed 2`;

		expect(localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: 'troubadour-duelist-7',
			field: 'sections.0.roll.tier1',
			canonicalEnglish: tierCanonical,
			calculatedEnglish: tierUnsupported
		})).toBe(tierUnsupported);
	});

	it('reuses the existing Power Roll presenter for all six approved tier identities', () => {
		const hero = makeHero();
		const powerRollIdentities = [
			[ 'troubadour-duelist-7', 'sections.0' ],
			[ 'troubadour-virtuoso-9', 'sections.1' ]
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
		expect(covered).toBe(6);
	});

	it('projects the En Garde! Agility damage in Hero context and keeps the approved arithmetic without one', () => {
		const hero = makeHero();
		const agility = HeroLogic.getCharacteristic(hero, Characteristic.Agility);
		const ability = getAbility('troubadour-duelist-7');

		([ 1, 2, 3 ] as const).forEach(tier => {
			const field = `sections.0.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity('troubadour-duelist-7', field)];
			const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'troubadour-duelist-7', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

			// Library / no Hero keeps the approved unresolved characteristic arithmetic.
			const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
			expect(noHeroCalculated).toBe(canonicalEnglish);
			expect(present(noHeroCalculated)).toContain('`敏捷`傷害');

			// Hero context reads the calculator's own resolved damage.
			const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
			const resolved = heroCalculated.match(/^(-?\d+)\s/)?.[1];
			expect(resolved).toBeDefined();
			expect(Number(resolved)).toBe(Number(canonicalEnglish.match(/^(\d+)/)?.[1]) + agility);

			const projected = present(heroCalculated);
			expect(projected).toBe(`${resolved} 傷害`);
			expect(projected).not.toContain('敏捷');
			expect(projected).not.toMatch(/[A-Za-z]/);
		});
	});

	it('projects the Tough Crowd potency in Hero context and keeps its approved threshold without one', () => {
		const hero = makeHero();
		const ability = getAbility('troubadour-virtuoso-9');
		const thresholds = [ '[弱]', '[中]', '[強]' ];

		([ 1, 2, 3 ] as const).forEach(tier => {
			const field = `sections.1.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity('troubadour-virtuoso-9', field)];
			const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'troubadour-virtuoso-9', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

			// Without a Hero the calculator adds its own potency code marks but resolves no
			// value, so the approved reading keeps its threshold and its authored pull distance.
			const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
			expect(noHeroCalculated).not.toBe(canonicalEnglish);
			const noHeroProjected = present(noHeroCalculated);
			expect(noHeroProjected).toContain(thresholds[tier - 1]);
			expect(noHeroProjected).toContain(`朝區域中心拉動 ${tier}`);
			expect(noHeroProjected).toContain('腐朽傷害');
			expect(noHeroProjected).not.toMatch(/[A-Za-z]/);

			// Hero context reads the calculator's own resolved potency; the flat damage and the
			// authored pull distance are untouched by either context.
			const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
			const resolved = heroCalculated.match(/M\s*<\s*(-?\d+)/)?.[1];
			expect(resolved).toBeDefined();

			const projected = present(heroCalculated);
			expect(projected).toContain(`\`力量\` < ${resolved}`);
			expect(projected).not.toContain(thresholds[tier - 1]);
			expect(projected).toContain(`朝區域中心拉動 ${tier}`);
			expect(projected.startsWith(`${canonicalEnglish.match(/^(\d+)/)?.[1]} 腐朽傷害`)).toBe(true);
			expect(projected).not.toMatch(/[A-Za-z]/);
		});
	});

	it('renders Allow Me to Introduce Tonight’s Players through the real ability panel in both contexts', () => {
		const hero = makeHero();
		const ability = getAbility('troubadour-17');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const protectedAbility = protectCanonicalState({
			label: 'Allow Me to Introduce Tonight’s Players canonical Ability data',
			capture: () => JSON.stringify(ability)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Allow Me to Introduce Tonight’s Players Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderAbility(ability, hero);
		const expectZhTW = () => {
			expectRendered(container, '華麗登場');
			expectRendered(container, '自身');
			expectRendered(container, '每個盟友都可以遁移最多等於其速度的距離');
			expect(normalizedText(container)).not.toContain('Allow Me to Introduce');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Allow Me to Introduce Tonight’s Players');
				expectRendered(container, 'Each ally can shift up to their speed');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		const inputs = getTextEffect.mock.calls.map(call => call[0]);
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('renders En Garde! through the real ability panel and sends only canonical English to the calculator', () => {
		const hero = makeHero();
		const agility = HeroLogic.getCharacteristic(hero, Characteristic.Agility);
		const ability = getAbility('troubadour-duelist-7');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const protectedAbility = protectCanonicalState({
			label: 'En Garde! canonical Ability data',
			capture: () => JSON.stringify(ability)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (En Garde! Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderAbility(ability, hero);
		const expectZhTW = () => {
			expectRendered(container, '接招！');
			expectRendered(container, '目標可以對你發動 1 次近戰基礎打擊。');
			expect(tierTexts(container)[0]).toBe(`${7 + agility} 傷害`);
			expect(normalizedText(container)).not.toContain('En Garde');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'En Garde!');
				expectRendered(container, 'The target can make a melee free strike against you.');
				expect(tierTexts(container)[0]).toBe(`${7 + agility} damage`);
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

	it('renders Tough Crowd through the real ability panel with every tier localized', () => {
		const hero = makeHero();
		const ability = getAbility('troubadour-virtuoso-9');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, hero);

		expectRendered(container, '鬧場觀眾');
		expectRendered(container, '該區域被一群盤旋的幽魂所占據，持續到遭遇結束。');
		tierTexts(container).forEach((text, index) => {
			expect(text).toContain('腐朽傷害');
			expect(text).toContain(`朝區域中心拉動 ${index + 1}`);
			expect(text).not.toMatch(/damage|pull/);
		});

		switchLocale();
		tierTexts(container).forEach(text => expect(text).toContain('corruption damage'));
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('renders Formal Introductions through the real Feature panel in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const feature = getFeature('troubadour-18');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const protectedFeature = protectCanonicalState({
			label: 'Formal Introductions canonical Feature data',
			capture: () => JSON.stringify(feature)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Formal Introductions Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const heroPanel = renderFeature(feature, hero);
		const expectZhTW = () => {
			expectRendered(heroPanel.container, '正式戰帖');
			expectRendered(heroPanel.container, 'PC 則會額外獲得 2 枚英雄幣');
			expect(normalizedText(heroPanel.container)).not.toContain('Formal Introductions');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedFeature, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(heroPanel.container, 'Formal Introductions');
				expectRendered(heroPanel.container, 'The heroes start each such encounter with 2 additional hero tokens.');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});
		heroPanel.unmount();

		// Library / no Hero reads exactly the same approved zh-TW: nothing here is calculated.
		const libraryPanel = renderFeature(feature);
		expectRendered(libraryPanel.container, '正式戰帖');
		expectRendered(libraryPanel.container, 'PC 則會額外獲得 2 枚英雄幣');

		// The Hero surface really did route this description through the calculator; it simply
		// resolved nothing, which is what keeps the approved raw zh-TW correct on both sides.
		const inputs = getTextEffect.mock.calls.map(call => call[0]);
		expect(inputs.length).toBeGreaterThan(0);
		expect(inputs).toContain(feature.description);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('reads the Troubadour Level 1 and Level 2 progression together in the class panel across a full locale round trip', () => {
		const hero = makeHero();
		const heroBefore = JSON.stringify(hero);
		const protectedClass = protectCanonicalState({
			label: 'Troubadour canonical class data (class panel)',
			capture: () => JSON.stringify(troubadour)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (class panel Level 1 to 2 progression)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderClassPanel(hero);
		clickPage(container, '特性');

		const expectZhTW = () => {
			// A Level 1 reading from the earlier Troubadour slices, next to this batch's Level 2.
			expect(readFieldByExactLabel(container, '1 級')).toContain('張力');
			expect(readFieldByExactLabel(container, '2 級')).toContain('祈求繆思');
			expect(readFieldByExactLabel(container, '2 級')).toContain('宣示風格');
			expect(readFieldByExactLabel(container, '2 級')).toContain('交涉類 / 學識類 / 超常類專長');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedClass, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readFieldByExactLabel(container, 'Level 1')).toContain('Drama');
				expect(readFieldByExactLabel(container, 'Level 2')).toContain('Appeal to the Muses');
				expect(readFieldByExactLabel(container, 'Level 2')).toContain('Interpersonal / Lore / Supernatural Perk');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		expect(JSON.stringify(hero)).toBe(heroBefore);
		expect(hero.class?.id).toBe(troubadour.id);
		expect(hero.class?.level).toBe(2);
	});

	it('shows a selected Class Act Level 2 progression without disturbing its completed Level 1 content', () => {
		const virtuoso = classActs[2];
		const serialized = JSON.stringify(virtuoso);
		const protectedClassAct = protectCanonicalState({
			label: 'Virtuoso canonical Class Act data',
			capture: () => JSON.stringify(virtuoso)
		});

		const { container } = renderSubclass(virtuoso);
		clickPage(container, '特性');

		// The subclass summary lists each level's own root readings; this batch's Level 2 root is
		// the ability Choice, whose two Abilities are read through the Feature panel above.
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedClassAct ],
			assertZhTW: () => {
				expect(readFieldByExactLabel(container, '2 級')).toBe('2 級才華招式');
				// The completed Level 1 content is still read in zh-TW beside it.
				expect(readFieldByExactLabel(container, '1 級')).toContain('強力和弦');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readFieldByExactLabel(container, 'Level 2')).toBe('2nd-Level Class Act Ability');
				expect(readFieldByExactLabel(container, 'Level 1')).toContain('Power Chord');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(container, '2 級才華招式')
		});

		expect(virtuoso.id).toBe('troubadour-virtuoso');
		expect(JSON.stringify(virtuoso)).toBe(serialized);
	});
});
