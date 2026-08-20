// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1FuryLevel2RequiredCanonicalEnglish, getV1FurySubclasses, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
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
import { fury } from '@/data/classes/fury/fury';
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
 * non-Ability walk, and the test's own Ability-field reader. The production denominator is not
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

const aspects = getV1FurySubclasses();

const liveFields: Record<string, string> = { ...extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(fury)) };
aspects.forEach(aspect => {
	const aspectLevelTwo = levelTwoFeatures(aspect);
	Object.assign(liveFields, extractLiveBoundedNonAbilityFeatureFields(aspectLevelTwo));
	boundedAbilities(aspectLevelTwo).forEach(ability => Object.assign(liveFields, extractLiveAbilityFields(ability)));
});

const required = createV1FuryLevel2RequiredCanonicalEnglish();

const furyLevel2CatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

/** The 51 approved identities, written out independently of any extraction under test. */
const approvedIdentities = [
	'element:fury-2-1/name',
	'element:fury-sub-1-2-1/name',
	'element:fury-sub-1-2-1/description',
	'element:fury-sub-1-2-2/name',
	'element:fury-sub-1-2-2a/name',
	'element:fury-sub-1-2-2a/target',
	'element:fury-sub-1-2-2a/description',
	'element:fury-sub-1-2-2a/sections.0.text',
	'element:fury-sub-1-2-2b/name',
	'element:fury-sub-1-2-2b/target',
	'element:fury-sub-1-2-2b/description',
	'element:fury-sub-1-2-2b/sections.0.text',
	'element:fury-sub-1-2-2b/sections.1.roll.tier1',
	'element:fury-sub-1-2-2b/sections.1.roll.tier2',
	'element:fury-sub-1-2-2b/sections.1.roll.tier3',
	'element:fury-sub-2-2-1/name',
	'element:fury-sub-2-2-1/description',
	'element:fury-sub-2-2-1a/name',
	'element:fury-sub-2-2-1a/description',
	'element:fury-sub-2-2-1b/name',
	'element:fury-sub-2-2-2/name',
	'element:fury-sub-2-2-2a/name',
	'element:fury-sub-2-2-2a/target',
	'element:fury-sub-2-2-2a/description',
	'element:fury-sub-2-2-2a/sections.0.roll.tier1',
	'element:fury-sub-2-2-2a/sections.0.roll.tier2',
	'element:fury-sub-2-2-2a/sections.0.roll.tier3',
	'element:fury-sub-2-2-2b/name',
	'element:fury-sub-2-2-2b/target',
	'element:fury-sub-2-2-2b/description',
	'element:fury-sub-2-2-2b/sections.0.text',
	'element:fury-sub-2-2-2b/sections.1.roll.tier1',
	'element:fury-sub-2-2-2b/sections.1.roll.tier2',
	'element:fury-sub-2-2-2b/sections.1.roll.tier3',
	'element:fury-sub-3-2-1/name',
	'element:fury-sub-3-2-1/description',
	'element:fury-sub-3-2-2/name',
	'element:fury-sub-3-2-2a/name',
	'element:fury-sub-3-2-2a/target',
	'element:fury-sub-3-2-2a/description',
	'element:fury-sub-3-2-2a/sections.0.roll.tier1',
	'element:fury-sub-3-2-2a/sections.0.roll.tier2',
	'element:fury-sub-3-2-2a/sections.0.roll.tier3',
	'element:fury-sub-3-2-2a/sections.1.text',
	'element:fury-sub-3-2-2b/name',
	'element:fury-sub-3-2-2b/target',
	'element:fury-sub-3-2-2b/description',
	'element:fury-sub-3-2-2b/sections.0.roll.tier1',
	'element:fury-sub-3-2-2b/sections.0.roll.tier2',
	'element:fury-sub-3-2-2b/sections.0.roll.tier3',
	'element:fury-sub-3-2-2b/sections.1.text'
].sort();

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(fury, [ core ]);

/** Selects one of a panel's segmented pages by its rendered label. */
const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent || '');

const allLevelTwoFeatures = [ ...levelTwoFeatures(fury), ...aspects.flatMap(aspect => levelTwoFeatures(aspect)) ];

const getFeature = (id: string) => {
	const search = (features: Feature[]): Feature | undefined => {
		for (const feature of features) {
			if (feature.id === id) {
				return feature;
			}
			if (feature.type === FeatureType.Multiple) {
				const child = search(feature.data.features);
				if (child) {
					return child;
				}
			}
		}
		return undefined;
	};
	const feature = search(allLevelTwoFeatures);
	if (!feature) {
		throw new Error(`Fury Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

const getAbility = (id: string) => {
	const ability = aspects.flatMap(aspect => boundedAbilities(levelTwoFeatures(aspect))).find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Fury Level 2 Ability '${id}' is missing`);
	}
	return ability;
};

const zhTWOf = (identity: string) => furyLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;

const makeHero = () => createHeroWithClass(fury, 2, FactoryLogic.createCharacteristics(2, 2, 0, 1, 0));

afterEach(cleanup);

describe('V1 Core Fury L2 manifest, catalog and presentation', () => {
	it('matches the independent live Fury Level 2 slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(51);
		expect(Object.keys(required)).toHaveLength(51);
		expect(Object.keys(required).sort()).toEqual(approvedIdentities);
		expect(Object.keys(liveFields).sort()).toEqual(approvedIdentities);
		expect(required).toEqual(liveFields);

		expect(aspects.map(aspect => aspect.id)).toEqual([ 'fury-sub-1', 'fury-sub-2', 'fury-sub-3' ]);
		expect(aspects.flatMap(aspect => boundedAbilities(levelTwoFeatures(aspect))).map(ability => ability.id)).toEqual([
			'fury-sub-1-2-2a',
			'fury-sub-1-2-2b',
			'fury-sub-2-2-2a',
			'fury-sub-2-2-2b',
			'fury-sub-3-2-2a',
			'fury-sub-3-2-2b'
		]);
		// Aspect metadata, Level 1 content and Level 3+ stay with their own slices.
		expect(Object.keys(required).some(identity => /fury-sub-\d-(1|3)-/.test(identity))).toBe(false);
		expect(required[elementFieldIdentity('fury-sub-1', 'name')]).toBeUndefined();
	});

	it('keeps Reaver\'s factory-composed Multiple root and its children in the denominator', () => {
		// The shared walk treats a composed canonical value as the player-facing reading it is;
		// the root is not special-cased out for being factory-built.
		const multiple = getFeature('fury-sub-2-2-1');
		expect(multiple.type).toBe(FeatureType.Multiple);
		expect(required[elementFieldIdentity('fury-sub-2-2-1', 'name')]).toBe('Inescapable Wrath');
		expect(required[elementFieldIdentity('fury-sub-2-2-1', 'description')]).toBe('Inescapable Wrath, Speed');
		expect(required[elementFieldIdentity('fury-sub-2-2-1a', 'name')]).toBe('Inescapable Wrath');
		expect(required[elementFieldIdentity('fury-sub-2-2-1b', 'name')]).toBe('Speed');
		// The Bonus child carries no description of its own, so none is invented.
		expect(required[elementFieldIdentity('fury-sub-2-2-1b', 'description')]).toBeUndefined();

		// The dependent rows read exactly as the Owner-final parent name requires.
		expect(zhTWOf('element:fury-sub-2-2-1/name')).toBe('無赦狂怒');
		expect(zhTWOf('element:fury-sub-2-2-1/description')).toBe('無赦狂怒、速度');
		expect(zhTWOf('element:fury-sub-2-2-1a/name')).toBe('無赦狂怒');
		expect(zhTWOf('element:fury-sub-2-2-1b/name')).toBe('速度');
	});

	it('preserves Wrecking Ball\'s authored leading newline in both canonical and approved zh-TW', () => {
		const canonicalEnglish = required[elementFieldIdentity('fury-sub-1-2-2b', 'sections.0.text')];
		expect(canonicalEnglish.startsWith('\nYou move up to your speed in a straight line.')).toBe(true);
		expect(canonicalEnglish).toContain('mundane structures');
		// The catalog snapshot is the exact same untrimmed value.
		expect(furyLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === 'element:fury-sub-1-2-2b/sections.0.text')?.canonicalEnglish).toBe(canonicalEnglish);
		// Both approved paragraphs survive, and the approved reusable term is used.
		expect(zhTWOf('element:fury-sub-1-2-2b/sections.0.text')).toContain('尋常結構物');
		expect(zhTWOf('element:fury-sub-1-2-2b/sections.0.text')?.split('\n\n')).toHaveLength(2);
	});

	it('adds exactly the 51 approved catalog entries and registers them in the live manifest', () => {
		expect(furyLevel2CatalogEntries).toHaveLength(51);
		expect(furyLevel2CatalogEntries.map(getEntryIdentity).sort()).toEqual(approvedIdentities);
		expect(furyLevel2CatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(furyLevel2CatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(furyLevel2CatalogEntries.every(entry => (entry.zhTW.trim() !== '') && (entry.zhTW !== entry.canonicalEnglish))).toBe(true);

		Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
			expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		});

		expect(zhTWOf('element:fury-2-1/name')).toBe('工藝類 / 探索類 / 隱密類專長');
		expect(zhTWOf('element:fury-sub-1-2-2/name')).toBe('2 級相態招式');
		expect(zhTWOf('element:fury-sub-2-2-2/name')).toBe('2 級相態招式');
		expect(zhTWOf('element:fury-sub-3-2-2/name')).toBe('2 級相態招式');
		expect(zhTWOf('element:fury-sub-1-2-2b/sections.1.roll.tier2')).toBe('推動 2');
		expect(zhTWOf('element:fury-sub-3-2-2b/sections.0.roll.tier3')).toBe('7 傷害；推動 3；`力量` < [強]，暈眩（豁免解除）');
	});

	it('carries the two Reviewer-mechanical corrections exactly as frozen', () => {
		expect(zhTWOf('element:fury-sub-1-2-1/description')).toContain('打擊英雄招式');
		expect(zhTWOf('element:fury-sub-1-2-1/description')).not.toContain('打擊英勇招式');
		expect(zhTWOf('element:fury-sub-3-2-1/description')).toBe('每當你的回合結束時，與你相鄰的每個敵人都會受到等於你`力量`的傷害。');
		// The mistyped modifier-letter glyph must not survive anywhere in the slice.
		expect(furyLevel2CatalogEntries.filter(entry => entry.zhTW.includes('‵'))).toEqual([]);
	});

	it('adds exactly the approved glossary delta and no standalone Law mapping', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^mundane,/.test(row))).toEqual([ 'mundane,尋常,game-term,approved' ]);
		// The contextual Law reading stays identity-specific.
		expect(zhTWOf('element:fury-sub-2-2-2b/description')).toContain('守序');
		expect(rows.some(row => /^Law,/i.test(row))).toBe(false);
		expect(rows.some(row => row.includes('守序'))).toBe(false);
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

	it('reads the Fury base and all three Aspects in zh-TW and back in canonical English', () => {
		const readings: { id: string, zhTW: string[], english: string[] }[] = [
			{ id: 'fury-2-1', zhTW: [ '工藝類 / 探索類 / 隱密類專長' ], english: [ 'Crafting / Exploration / Intrigue Perk' ] },
			{ id: 'fury-sub-1-2-1', zhTW: [ '勢不可當', '打擊英雄招式' ], english: [ 'Unstoppable Force', 'a strike heroic ability' ] },
			{ id: 'fury-sub-2-2-1', zhTW: [ '無赦狂怒', '速度' ], english: [ 'Inescapable Wrath', 'Speed' ] },
			{ id: 'fury-sub-3-2-1', zhTW: [ '尖牙利爪' ], english: [ 'Tooth and Claw' ] }
		];

		readings.forEach(reading => {
			const protectedFeatures = protectCanonicalState({
				label: `Fury Level 2 canonical Feature data (${reading.id})`,
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

	it('presents each Aspect ability-choice root and its two nested Ability options', () => {
		const expected = [
			{ choice: 'fury-sub-1-2-2', options: [ '飛身快遞', '毀滅衝車' ], english: [ 'Special Delivery', 'Wrecking Ball' ] },
			{ choice: 'fury-sub-2-2-2', options: [ '死兆宣告！', '破陣衝擊' ], english: [ 'Death ... Deeaaath!', 'Phalanx-Breaker' ] },
			{ choice: 'fury-sub-3-2-2', options: [ '終極獵殺', '震腑咆哮' ], english: [ 'Apex Predator', 'Visceral Roar' ] }
		];

		expected.forEach(entry => {
			const choice = getFeature(entry.choice);
			if (choice.type !== FeatureType.Choice) {
				throw new Error(`${entry.choice} is not a Choice`);
			}
			const serialized = JSON.stringify(choice);
			const panel = renderFeature(choice);

			expectRendered(panel.container, '2 級相態招式');
			entry.options.forEach(option => expectRendered(panel.container, option));

			switchLocale();
			expectRendered(panel.container, '2nd-Level Aspect Ability');
			entry.english.forEach(option => expectRendered(panel.container, option));

			expect(choice.data.options.map(option => option.feature.id)).toEqual([ `${entry.choice}a`, `${entry.choice}b` ]);
			expect(JSON.stringify(choice)).toBe(serialized);
			panel.unmount();
		});
	});

	it('reuses the existing Power Roll presenter for all twelve approved tier identities', () => {
		const hero = makeHero();
		const powerRollIdentities = [
			[ 'fury-sub-2-2-2a', 'sections.0' ],
			[ 'fury-sub-2-2-2b', 'sections.1' ],
			[ 'fury-sub-3-2-2a', 'sections.0' ],
			[ 'fury-sub-3-2-2b', 'sections.0' ]
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
				expect(calculatedEnglish).not.toBe(canonicalEnglish);

				const zhTW = localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

				// The damage number is the canonical calculator's own output, not the localizer's.
				const calculatedDamage = calculatedEnglish.match(/^(\d+)/)?.[1];
				expect(calculatedDamage).toBeDefined();
				expect(zhTW).toContain(`${calculatedDamage} 傷害`);
				expect(zhTW).not.toMatch(/[A-Za-z]/);
				expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish })).toBe(calculatedEnglish);
				covered += 1;
			});
		});
		expect(covered).toBe(12);
	});

	it('leaves Wrecking Ball\'s Push tiers outside the calculated matrix', () => {
		const hero = makeHero();
		const ability = getAbility('fury-sub-1-2-2b');

		([ 1, 2, 3 ] as const).forEach(tier => {
			const field = `sections.1.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity('fury-sub-1-2-2b', field)];
			// No material calculator transform, so the approved raw reading stands as-is.
			expect(AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero)).toBe(canonicalEnglish);
			expect(localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'fury-sub-1-2-2b', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: canonicalEnglish })).toBe(`推動 ${tier}`);
		});
	});

	it('projects the two Might-score prose identities in Hero and no-Hero context', () => {
		const hero = makeHero();
		const might = HeroLogic.getCharacteristic(hero, Characteristic.Might);

		const cases = [
			{
				elementID: 'fury-sub-1-2-2a',
				field: 'sections.0.text',
				hero: `你將目標垂直推動最多 4 格。此強制移動無視目標的穩度，而且目標不會因為碰撞生物或物體而受到傷害。此強制移動結束時，目標可以發動 1 次基礎打擊，並額外造成 ${might} 點傷害。`
			},
			{
				elementID: 'fury-sub-3-2-1',
				field: 'description',
				hero: `每當你的回合結束時，與你相鄰的每個敵人都會受到 ${might} 點傷害。`
			}
		];

		cases.forEach(scenario => {
			const canonicalEnglish = required[elementFieldIdentity(scenario.elementID, scenario.field)];
			const approvedRaw = zhTWOf(`element:${scenario.elementID}/${scenario.field}`);
			assertCanonicalEnglishCalculationInput(canonicalEnglish);

			const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: scenario.elementID,
				field: scenario.field,
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			});

			// Library / no Hero keeps the packet-approved raw 力量 grammar.
			const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
			expect(noHeroCalculated).toBe(canonicalEnglish);
			expect(present(noHeroCalculated)).toBe(approvedRaw);
			expect(present(noHeroCalculated)).toContain('等於你`力量`');

			// Hero context projects only the value AbilityLogic actually resolved.
			const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
			expect(heroCalculated).toContain(`equal to ${might}.`);
			expect(heroCalculated).not.toContain('your Might score');
			expect(present(heroCalculated)).toBe(scenario.hero);
			expect(present(heroCalculated)).not.toMatch(/[A-Za-z]/);

			expect(localizeCalculatedAuthoredTextPresentation({
				locale: 'en',
				elementID: scenario.elementID,
				field: scenario.field,
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: heroCalculated
			})).toBe(heroCalculated);
		});
	});

	it('projects the two speed prose identities while preserving surrounding approved prose', () => {
		const hero = makeHero();
		const speed = HeroLogic.getSpeed(hero).value;

		const cases = [
			{
				elementID: 'fury-sub-1-2-2b',
				field: 'sections.0.text',
				hero: `你直線移動最多 ${speed} 格。在此移動期間，你可以穿越尋常結構物，包括牆壁（這些結構物對你而言視為困難地形）。你每穿越 1 格結構物，就會自動摧毀該格，並留下 1 格困難地形。\n\n此外，你進行 1 次檢定，目標是你在此移動期間相鄰過的每個敵人。`
			},
			{
				elementID: 'fury-sub-2-2-2b',
				field: 'sections.0.text',
				hero: `你遁移最多 ${speed} 格，並進行 1 次檢定，目標是你在此移動期間相鄰過的最多 3 個敵人。`
			}
		];

		cases.forEach(scenario => {
			const canonicalEnglish = required[elementFieldIdentity(scenario.elementID, scenario.field)];
			const approvedRaw = zhTWOf(`element:${scenario.elementID}/${scenario.field}`);
			assertCanonicalEnglishCalculationInput(canonicalEnglish);

			const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: scenario.elementID,
				field: scenario.field,
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			});

			const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
			expect(noHeroCalculated).toBe(canonicalEnglish);
			expect(present(noHeroCalculated)).toBe(approvedRaw);
			expect(present(noHeroCalculated)).toContain('等於你速度的距離');

			const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
			expect(heroCalculated).toContain(`${speed} squares`);
			expect(present(heroCalculated)).toBe(scenario.hero);
			expect(present(heroCalculated)).not.toMatch(/[A-Za-z]/);
		});

		// Wrecking Ball's canonical leading newline and both paragraph breaks survive projection.
		const wreckingBall = required[elementFieldIdentity('fury-sub-1-2-2b', 'sections.0.text')];
		const projected = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'fury-sub-1-2-2b',
			field: 'sections.0.text',
			canonicalEnglish: wreckingBall,
			calculatedEnglish: AbilityLogic.getTextEffect(wreckingBall, hero)
		});
		expect(projected.split('\n\n')).toHaveLength(2);
		expect(projected).toContain('尋常結構物');
	});

	it('fails closed rather than guessing when the calculated English no longer matches the approved structure', () => {
		const canonicalEnglish = required[elementFieldIdentity('fury-sub-2-2-2b', 'sections.0.text')];
		const unsupported = `${canonicalEnglish.replace('your speed', '5 squares')} They also fall prone.`;

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'fury-sub-2-2-2b',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupported
		})).toBe(unsupported);
	});

	it('renders Tooth and Claw through the real non-Ability Feature path with Hero state protected', () => {
		const hero = makeHero();
		const might = HeroLogic.getCharacteristic(hero, Characteristic.Might);
		const feature = getFeature('fury-sub-3-2-1');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const protectedFeature = protectCanonicalState({
			label: 'Tooth and Claw canonical Feature data',
			capture: () => JSON.stringify(feature)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Tooth and Claw Feature path)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderFeature(feature, hero);
		const expectZhTW = () => {
			expectRendered(container, '尖牙利爪');
			expectRendered(container, `與你相鄰的每個敵人都會受到 ${might} 點傷害。`);
			expect(normalizedText(container)).not.toContain('Tooth and Claw');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedFeature, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Tooth and Claw');
				expectRendered(container, `each enemy adjacent to you takes damage equal to ${might}.`);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		const inputs = getTextEffect.mock.calls.map(call => call[0]);
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('renders Wrecking Ball through the real ability panel and sends only canonical English to the calculator', () => {
		const hero = makeHero();
		const speed = HeroLogic.getSpeed(hero).value;
		const ability = getAbility('fury-sub-1-2-2b');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const protectedAbility = protectCanonicalState({
			label: 'Wrecking Ball canonical Ability data',
			capture: () => JSON.stringify(ability)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Wrecking Ball Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderAbility(ability, hero);
		const expectZhTW = () => {
			expectRendered(container, '毀滅衝車');
			expectRendered(container, `你直線移動最多 ${speed} 格`);
			expectRendered(container, '尋常結構物');
			expect(tierTexts(container)[0]).toContain('推動 1');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Wrecking Ball');
				expectRendered(container, `You move up to ${speed} squares in a straight line`);
				expect(tierTexts(container)[0]).toContain('Push 1');
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

	it('renders Death ... Deeaaath! tiers in zh-TW through the real ability panel', () => {
		const hero = makeHero();
		const ability = getAbility('fury-sub-2-2-2a');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, hero);

		expectRendered(container, '死兆宣告！');
		expect(tierTexts(container)[0]).toContain('暈眩');
		expect(tierTexts(container)[0]).toContain('畏縮');
		expect(screen.getAllByText('暈眩', { selector: 'strong' }).length).toBeGreaterThan(0);

		switchLocale();
		expect(tierTexts(container)[0]).toContain('dazed');
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('reads the Fury Level 1 and Level 2 progression together in the class panel across a full locale round trip', () => {
		const hero = makeHero();
		const heroBefore = JSON.stringify(hero);
		const protectedClass = protectCanonicalState({
			label: 'Fury canonical class data (class panel)',
			capture: () => JSON.stringify(fury)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (class panel Level 1 to 2 progression)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderClassPanel(hero);
		clickPage(container, '特性');

		const expectZhTW = () => {
			// A Level 1 reading from the earlier Fury slices, next to this batch's Level 2 one.
			expect(readFieldByExactLabel(container, '1 級')).toContain('狠勁');
			expect(readFieldByExactLabel(container, '2 級')).toBe('工藝類 / 探索類 / 隱密類專長');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedClass, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readFieldByExactLabel(container, 'Level 1')).toContain('Ferocity');
				expect(readFieldByExactLabel(container, 'Level 2')).toBe('Crafting / Exploration / Intrigue Perk');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		expect(JSON.stringify(hero)).toBe(heroBefore);
		expect(hero.class?.id).toBe(fury.id);
		expect(hero.class?.level).toBe(2);
	});

	it('shows a selected Aspect Level 2 progression without disturbing its completed Level 1 content', () => {
		const stormwight = aspects[2];
		const serialized = JSON.stringify(stormwight);
		const protectedAspect = protectCanonicalState({
			label: 'Stormwight canonical Aspect data',
			capture: () => JSON.stringify(stormwight)
		});

		const { container } = renderSubclass(stormwight);
		clickPage(container, '特性');

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAspect ],
			assertZhTW: () => {
				// This batch's Level 2 readings, alongside the already-approved Level 1 kit content.
				expectRendered(container, '尖牙利爪');
				expectRendered(container, '2 級相態招式');
				expectRendered(container, '獸形');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Tooth and Claw');
				expectRendered(container, '2nd-Level Aspect Ability');
				expectRendered(container, 'Beast Shape');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(container, '尖牙利爪')
		});

		expect(stormwight.id).toBe('fury-sub-3');
		expect(JSON.stringify(stormwight)).toBe(serialized);
	});
});
