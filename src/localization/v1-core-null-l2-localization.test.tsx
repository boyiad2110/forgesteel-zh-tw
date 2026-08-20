// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1NullLevel2RequiredCanonicalEnglish, createV1NullLevel1AbilityRequiredCanonicalEnglish, createV1NullLevel1RemainingRequiredCanonicalEnglish, createV1NullLevel1SubclassCompletionRequiredCanonicalEnglish, getV1NullTraditions, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
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
import { nullClass } from '@/data/classes/null/null';
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

const traditions = getV1NullTraditions();

const liveFields: Record<string, string> = { ...extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(nullClass)) };
traditions.forEach(tradition => {
	const traditionLevelTwo = levelTwoFeatures(tradition);
	Object.assign(liveFields, extractLiveBoundedNonAbilityFeatureFields(traditionLevelTwo));
	boundedAbilities(traditionLevelTwo).forEach(ability => Object.assign(liveFields, extractLiveAbilityFields(ability)));
});

const required = createV1NullLevel2RequiredCanonicalEnglish();

const nullLevel2CatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

/** The 44 approved identities, written out independently of any extraction under test. */
const approvedIdentities = [
	'element:null-2-1/name',
	'element:null-sub-1-2-1/name',
	'element:null-sub-1-2-1/description',
	'element:null-sub-1-2-2/name',
	'element:null-sub-1-2-2a/name',
	'element:null-sub-1-2-2a/target',
	'element:null-sub-1-2-2a/description',
	'element:null-sub-1-2-2a/sections.0.text',
	'element:null-sub-1-2-2b/name',
	'element:null-sub-1-2-2b/target',
	'element:null-sub-1-2-2b/description',
	'element:null-sub-1-2-2b/sections.0.roll.tier1',
	'element:null-sub-1-2-2b/sections.0.roll.tier2',
	'element:null-sub-1-2-2b/sections.0.roll.tier3',
	'element:null-sub-2-2-1/name',
	'element:null-sub-2-2-1/description',
	'element:null-sub-2-2-1b/name',
	'element:null-sub-2-2-2/name',
	'element:null-sub-2-2-2a/name',
	'element:null-sub-2-2-2a/target',
	'element:null-sub-2-2-2a/description',
	'element:null-sub-2-2-2a/sections.0.roll.tier1',
	'element:null-sub-2-2-2a/sections.0.roll.tier2',
	'element:null-sub-2-2-2a/sections.0.roll.tier3',
	'element:null-sub-2-2-2b/name',
	'element:null-sub-2-2-2b/target',
	'element:null-sub-2-2-2b/description',
	'element:null-sub-2-2-2b/sections.0.text',
	'element:null-sub-3-2-1/name',
	'element:null-sub-3-2-1/description',
	'element:null-sub-3-2-2/name',
	'element:null-sub-3-2-2a/name',
	'element:null-sub-3-2-2a/target',
	'element:null-sub-3-2-2a/description',
	'element:null-sub-3-2-2a/sections.0.roll.tier1',
	'element:null-sub-3-2-2a/sections.0.roll.tier2',
	'element:null-sub-3-2-2a/sections.0.roll.tier3',
	'element:null-sub-3-2-2b/name',
	'element:null-sub-3-2-2b/target',
	'element:null-sub-3-2-2b/description',
	'element:null-sub-3-2-2b/sections.0.roll.tier1',
	'element:null-sub-3-2-2b/sections.0.roll.tier2',
	'element:null-sub-3-2-2b/sections.0.roll.tier3',
	'element:null-sub-3-2-2b/sections.1.text'
].sort();

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(nullClass, [ core ]);

/** Selects one of a panel's segmented pages by its rendered label. */
const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent || '');

const allLevelTwoFeatures = [ ...levelTwoFeatures(nullClass), ...traditions.flatMap(tradition => levelTwoFeatures(tradition)) ];

const getFeature = (id: string) => {
	const feature = allLevelTwoFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Null Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

const getAbility = (id: string) => {
	const ability = traditions.flatMap(tradition => boundedAbilities(levelTwoFeatures(tradition))).find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Null Level 2 Ability '${id}' is missing`);
	}
	return ability;
};

const zhTWOf = (identity: string) => nullLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;

// Agility 2 / Intuition 2 at Level 2; every expected value below is read back from the
// calculator's own output rather than hardcoded.
const makeHero = () => createHeroWithClass(nullClass, 2, FactoryLogic.createCharacteristics(1, 2, 0, 2, 0));

afterEach(cleanup);

describe('V1 Core Null L2 manifest, catalog and presentation', () => {
	it('matches the independent live Null Level 2 slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(44);
		expect(Object.keys(required)).toHaveLength(44);
		expect(Object.keys(required).sort()).toEqual(approvedIdentities);
		expect(Object.keys(liveFields).sort()).toEqual(approvedIdentities);
		expect(required).toEqual(liveFields);

		expect(traditions.map(tradition => tradition.id)).toEqual([ 'null-sub-1', 'null-sub-2', 'null-sub-3' ]);
	});

	it('reads the base class Level 2 root only, and reaches every Tradition Level 2 Ability', () => {
		// The Null's own Level 2 authors exactly one Feature: the Perk.
		expect(levelTwoFeatures(nullClass).map(feature => feature.id)).toEqual([ 'null-2-1' ]);
		expect(required[elementFieldIdentity('null-2-1', 'name')]).toBe('Exploration / Interpersonal / Intrigue Perk');
		// The Perk carries no description of its own, so it contributes exactly one identity.
		expect(Object.keys(required).filter(identity => identity.startsWith('element:null-2-1/'))).toEqual([ 'element:null-2-1/name' ]);

		// Each Tradition's Level 2 ability Choice offers two Abilities; the one shared collector
		// reaches all six without descending past a Choice's own options.
		expect(traditions.flatMap(tradition => boundedAbilities(levelTwoFeatures(tradition))).map(ability => ability.id)).toEqual([
			'null-sub-1-2-2a',
			'null-sub-1-2-2b',
			'null-sub-2-2-2a',
			'null-sub-2-2-2b',
			'null-sub-3-2-2a',
			'null-sub-3-2-2b'
		]);
	});

	it('includes the Cryokinetic Damage Modifier Feature the shared bounded walk yields', () => {
		const damageModifier = getFeature('null-sub-2-2-1b');

		expect(damageModifier.type).toBe(FeatureType.DamageModifier);
		// The name is Feature-factory output rather than authored prose, and is required all the
		// same: FeaturePanel renders it as this Feature's own player-facing text.
		expect(required[elementFieldIdentity('null-sub-2-2-1b', 'name')]).toBe('Damage Modifier');
		expect(zhTWOf('element:null-sub-2-2-1b/name')).toBe('傷害調整');
		// It carries no description, so it contributes exactly that one identity.
		expect(required[elementFieldIdentity('null-sub-2-2-1b', 'description')]).toBeUndefined();
	});

	it('keeps Tradition metadata, Level 1 content and every Level 3+ sibling out of the slice', () => {
		expect(Object.keys(required).some(identity => /null-sub-\d-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(Object.keys(required).some(identity => /^element:null-(1|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
		expect(required[elementFieldIdentity('null-sub-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('null-3-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('null-sub-3-5-1', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('class-null', 'subclassName')]).toBeUndefined();

		// The Level 3+ content really is there to be missed, so the bound is doing work. The
		// Traditions author nothing at their own Levels 3 and 4, so the nearest later Tradition
		// content is Metakinetic's Level 5 Feature.
		expect(nullClass.featuresByLevel.find(level => level.level === 3)?.features.length).toBeGreaterThan(0);
		expect(traditions[2].featuresByLevel.find(level => level.level === 5)?.features.length).toBeGreaterThan(0);

		// This slice is disjoint from all three completed Null Level 1 slices.
		const levelOneIdentities = [
			...Object.keys(createV1NullLevel1AbilityRequiredCanonicalEnglish()),
			...Object.keys(createV1NullLevel1RemainingRequiredCanonicalEnglish()),
			...Object.keys(createV1NullLevel1SubclassCompletionRequiredCanonicalEnglish())
		];
		expect(levelOneIdentities.filter(identity => Object.keys(required).includes(identity))).toEqual([]);
	});

	it('preserves the authored leading newline on the Inertial Sink description', () => {
		const identity = elementFieldIdentity('null-sub-3-2-1', 'description');
		const canonicalEnglish = required[identity];

		expect(canonicalEnglish.startsWith('\nYou add your Intuition score')).toBe(true);
		expect(canonicalEnglish.startsWith('\n\n')).toBe(false);
		expect(canonicalEnglish.endsWith('an amount equal to your level.')).toBe(true);
		// The live class data, the manifest and the catalog all carry the same untrimmed value.
		expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		expect(nullLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.canonicalEnglish).toBe(canonicalEnglish);
		// Its own name sibling deliberately carries no leading whitespace.
		expect(required[elementFieldIdentity('null-sub-3-2-1', 'name')]).toBe('Inertial Sink');
	});

	it('adds exactly the 44 approved catalog entries and registers them in the live manifest', () => {
		expect(nullLevel2CatalogEntries).toHaveLength(44);
		expect(nullLevel2CatalogEntries.map(getEntryIdentity).sort()).toEqual(approvedIdentities);
		expect(nullLevel2CatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(nullLevel2CatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(nullLevel2CatalogEntries.every(entry => (entry.zhTW.trim() !== '') && (entry.zhTW !== entry.canonicalEnglish))).toBe(true);

		Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
			expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		});

		expect(zhTWOf('element:null-2-1/name')).toBe('探索類 / 交涉類 / 隱密類專長');
		expect(zhTWOf('element:null-sub-1-2-2a/name')).toBe('殘像疊影');
		expect(zhTWOf('element:null-sub-2-2-2b/name')).toBe('吸熱成霜');
		expect(zhTWOf('element:null-sub-3-2-1/name')).toBe('慣性沉體');
		expect(zhTWOf('element:null-sub-3-2-2b/name')).toBe('動能護盾');
	});

	it('keeps each 2nd-Level Tradition Ability label a separate identity without deduplicating them', () => {
		const choiceIdentities = [
			'element:null-sub-1-2-2/name',
			'element:null-sub-2-2-2/name',
			'element:null-sub-3-2-2/name'
		];

		choiceIdentities.forEach(identity => {
			expect(required[identity]).toBe('2nd-Level Tradition Ability');
			expect(zhTWOf(identity)).toBe('2 級流派招式');
		});
		// Each identity carries its own entry; none was collapsed into a shared one.
		expect(nullLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === '2nd-Level Tradition Ability')).toHaveLength(3);

		// The two 'Self' and two 'One creature' target readings are likewise separate identities.
		expect(nullLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === 'Self')).toHaveLength(3);
		expect(nullLevel2CatalogEntries.filter(entry => entry.canonicalEnglish === 'One creature')).toHaveLength(2);
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

	it('reads each Tradition Level 2 non-Ability surface in zh-TW and back in canonical English', () => {
		const readings: { id: string, zhTW: string[], english: string[] }[] = [
			{ id: 'null-sub-1-2-1', zhTW: [ '快速解析', '休整活動' ], english: [ 'Rapid Processing', 'respite activity' ] },
			{ id: 'null-sub-2-2-1', zhTW: [ '熵能適性', '困難地形' ], english: [ 'Entropic Adaptability', 'difficult terrain' ] },
			{ id: 'null-sub-2-2-1b', zhTW: [ '傷害調整' ], english: [ 'Damage Modifier' ] }
		];

		readings.forEach(reading => {
			const protectedFeatures = protectCanonicalState({
				label: `Null Level 2 canonical Feature data (${reading.id})`,
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

	it('presents each Tradition ability-choice root and its two nested Ability options', () => {
		const expected = [
			{ choice: 'null-sub-1-2-2', options: [ '殘像疊影', '逆勢偏轉' ], english: [ 'Blur', 'Force Redirected' ] },
			{ choice: 'null-sub-2-2-2', options: [ '熵蝕場域', '吸熱成霜' ], english: [ 'Entropic Field', 'Heat Sink' ] },
			{ choice: 'null-sub-3-2-2', options: [ '牽引重拳', '動能護盾' ], english: [ 'Gravitic Strike', 'Kinetic Shield' ] }
		];

		expected.forEach(entry => {
			const choice = getFeature(entry.choice);
			if (choice.type !== FeatureType.Choice) {
				throw new Error(`${entry.choice} is not a Choice`);
			}
			const serialized = JSON.stringify(choice);
			const panel = renderFeature(choice);

			expectRendered(panel.container, '2 級流派招式');
			entry.options.forEach(option => expectRendered(panel.container, option));

			switchLocale();
			expectRendered(panel.container, '2nd-Level Tradition Ability');
			entry.english.forEach(option => expectRendered(panel.container, option));

			expect(choice.data.options.map(option => option.feature.id)).toEqual([ `${entry.choice}a`, `${entry.choice}b` ]);
			expect(JSON.stringify(choice)).toBe(serialized);
			panel.unmount();
		});
	});

	it('projects the Heat Sink Intuition damage in Hero context and keeps the approved raw reading without one', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('null-sub-2-2-2b', 'sections.0.text')];
		const approvedRaw = zhTWOf('element:null-sub-2-2-2b/sections.0.text');
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'null-sub-2-2-2b',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		});

		// Library / no Hero keeps the packet-approved unresolved reading.
		const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
		expect(noHeroCalculated).toBe(canonicalEnglish);
		expect(present(noHeroCalculated)).toBe(approvedRaw);
		expect(present(noHeroCalculated)).toContain('等於你`直覺`的寒冷傷害');

		// Hero context projects only the value AbilityLogic actually resolved.
		const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		const value = heroCalculated.match(/takes cold damage equal to (-?\d+)\./)?.[1];
		expect(value).toBeDefined();

		const projected = present(heroCalculated);
		expect(projected).toContain(`都會受到 ${value} 點寒冷傷害。`);
		expect(projected).not.toContain('等於你`直覺`的寒冷傷害');
		// The authored 'increases by 1' literal is never recomputed, and the approved 無念場
		// wording around the projected value is untouched.
		expect(projected).toContain('你【無念場】招式的區域增加 1 格');
		expect(projected).not.toMatch(/[A-Za-z]/);

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'null-sub-2-2-2b',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: heroCalculated
		})).toBe(heroCalculated);
	});

	it('projects the Inertial Sink level reduction and grabbed emphasis without touching its unresolved opening', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('null-sub-3-2-1', 'description')];
		const approvedRaw = zhTWOf('element:null-sub-3-2-1/description') as string;
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'null-sub-3-2-1',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		});

		// Without a Hero the calculator resolves no value but still emphasizes the condition, so
		// the approved reading gains exactly that emphasis and keeps its authored level wording.
		const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
		expect(noHeroCalculated).toContain('**grabbed**');
		expect(noHeroCalculated).toContain('an amount equal to your level.');
		expect(present(noHeroCalculated)).toBe(approvedRaw.replace('擒制', '**擒制**'));
		expect(present(noHeroCalculated)).toContain('傷害量會減少等於你等級的數值。');

		// Hero context resolves only the closing level reduction.
		const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		const value = heroCalculated.match(/you reduce that damage by an amount equal to (-?\d+)\./)?.[1];
		expect(value).toBe(String(hero.class?.level));

		const projected = present(heroCalculated);
		expect(projected).toContain(`傷害量會減少 ${value} 點。`);
		expect(projected).not.toContain('傷害量會減少等於你等級的數值。');
		expect(projected).toContain('**擒制**');
		// The opening Intuition expression does not match the calculator's equal-to-characteristic
		// grammar, so both surfaces keep the approved raw wording for it.
		expect(heroCalculated).toContain('You add your Intuition score to your effective size');
		expect(projected).toContain('你的有效體型會視為加上你的`直覺`。');
		// The authored '5 squares' fall reduction is a literal the calculator never touches.
		expect(projected).toContain('你的有效墜落高度還會減少 5 格');
		// The authored leading newline and the paragraph break survive the projection.
		expect(projected.startsWith('當你與生物和物體互動時')).toBe(true);
		expect(projected).toContain('\n\n此外，當你墜落時');
		expect(projected).not.toMatch(/[A-Za-z]/);

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'null-sub-3-2-1',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: heroCalculated
		})).toBe(heroCalculated);
	});

	it('adds the Kinetic Shield bleeding emphasis through the shared condition presenter without emphasizing dying', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('null-sub-3-2-2b', 'sections.1.text')];
		const approvedRaw = zhTWOf('element:null-sub-3-2-2b/sections.1.text') as string;

		([ undefined, hero ] as const).forEach(context => {
			const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, context);

			// The calculator bolds only the condition name; 'dying' stays plain on both sides.
			expect(calculatedEnglish).toContain('can’t be made **bleeding** even while dying.');
			expect(calculatedEnglish).not.toContain('**dying**');

			const projected = localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: 'null-sub-3-2-2b',
				field: 'sections.1.text',
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			});

			expect(projected).toBe(approvedRaw.replace('出血', '**出血**'));
			expect(projected).toContain('即使瀕死也不會');
			expect(projected).not.toContain('**瀕死**');
			expect(projected).not.toMatch(/[A-Za-z]/);
		});
	});

	it('fails closed rather than guessing when the calculated English no longer matches the approved structure', () => {
		const heatSinkCanonical = required[elementFieldIdentity('null-sub-2-2-2b', 'sections.0.text')];
		const heatSinkUnsupported = `${heatSinkCanonical.replace('equal to your Intuition score', 'equal to 2')} They also gain an edge.`;

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'null-sub-2-2-2b',
			field: 'sections.0.text',
			canonicalEnglish: heatSinkCanonical,
			calculatedEnglish: heatSinkUnsupported
		})).toBe(heatSinkUnsupported);

		// An Inertial Sink rewrite that also resolved the opening Intuition expression is a
		// structure this projection cannot prove, so it falls back whole rather than mixing.
		const inertialCanonical = required[elementFieldIdentity('null-sub-3-2-1', 'description')];
		const inertialUnsupported = inertialCanonical
			.replace('You add your Intuition score to your effective size', 'You add 2 to your effective size')
			.replace('an amount equal to your level.', 'an amount equal to 2.');

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'null-sub-3-2-1',
			field: 'description',
			canonicalEnglish: inertialCanonical,
			calculatedEnglish: inertialUnsupported
		})).toBe(inertialUnsupported);
	});

	it('reuses the existing Power Roll presenter for all twelve approved tier identities', () => {
		const hero = makeHero();
		const powerRollAbilityIDs = [ 'null-sub-1-2-2b', 'null-sub-2-2-2a', 'null-sub-3-2-2a', 'null-sub-3-2-2b' ] as const;

		let covered = 0;
		powerRollAbilityIDs.forEach(abilityID => {
			const ability = getAbility(abilityID);

			([ 1, 2, 3 ] as const).forEach(tier => {
				const field = `sections.0.roll.tier${tier}`;
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

	it('presents Force Redirected and Gravitic Strike damage with their forced movement left structural', () => {
		const hero = makeHero();
		const agility = HeroLogic.getCharacteristic(hero, Characteristic.Agility);
		const cases = [
			{ abilityID: 'null-sub-1-2-2b', unresolved: '`敏捷`傷害', movement: [ '滑動 1', '滑動 3', '滑動 5' ] },
			{ abilityID: 'null-sub-3-2-2a', unresolved: '`敏捷`心靈傷害', movement: [ '垂直拉動 3', '垂直拉動 5', '垂直拉動 7' ] }
		];

		cases.forEach(scenario => {
			const ability = getAbility(scenario.abilityID);

			([ 1, 2, 3 ] as const).forEach(tier => {
				const field = `sections.0.roll.tier${tier}`;
				const canonicalEnglish = required[elementFieldIdentity(scenario.abilityID, field)];
				const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: scenario.abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

				// Library / no Hero keeps the approved unresolved characteristic arithmetic.
				const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
				expect(noHeroCalculated).toBe(canonicalEnglish);
				expect(present(noHeroCalculated)).toContain(scenario.unresolved);
				expect(present(noHeroCalculated)).toContain(scenario.movement[tier - 1]);

				// Hero context reads the calculator's own resolved damage; the forced movement
				// distance is authored structure the calculator leaves alone.
				const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
				const resolved = heroCalculated.match(/^(-?\d+)\s/)?.[1];
				expect(resolved).toBeDefined();
				expect(Number(resolved)).toBe(Number(canonicalEnglish.match(/^(\d+)/)?.[1]) + agility);

				const projected = present(heroCalculated);
				expect(projected.startsWith(`${resolved} `)).toBe(true);
				expect(projected).not.toContain(scenario.unresolved);
				expect(projected).toContain(scenario.movement[tier - 1]);
				expect(projected).not.toMatch(/[A-Za-z]/);
			});
		});
	});

	it('presents Entropic Field potency and slowed emphasis in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const ability = getAbility('null-sub-2-2-2a');
		const potencies = [ '[弱]', '[中]', '[強]' ];
		const damage = [ '6', '9', '13' ];

		([ 1, 2, 3 ] as const).forEach(tier => {
			const field = `sections.0.roll.tier${tier}`;
			const canonicalEnglish = required[elementFieldIdentity('null-sub-2-2-2a', field)];
			const present = (calculatedEnglish: string) => localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: 'null-sub-2-2-2a', field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

			// Library / no Hero keeps the approved unresolved potency, with only the emphasis the
			// calculator introduced on the condition projected. The damage here is authored flat.
			const noHeroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, undefined);
			expect(present(noHeroCalculated)).toBe(`${damage[tier - 1]} 寒冷傷害；\`敏捷\` < ${potencies[tier - 1]}，**緩速**（豁免解除）`);

			// Hero context reads the calculator's own resolved potency.
			const heroCalculated = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
			const resolved = heroCalculated.match(/A < (-?\d+)/)?.[1];
			expect(resolved).toBeDefined();
			expect(present(heroCalculated)).toBe(`${damage[tier - 1]} 寒冷傷害；\`敏捷\` < ${resolved}，**緩速**（豁免解除）`);
			expect(present(heroCalculated)).not.toMatch(/[A-Za-z]/);
		});
	});

	it('renders Heat Sink through the real ability panel and sends only canonical English to the calculator', () => {
		const hero = makeHero();
		const intuition = HeroLogic.getCharacteristic(hero, Characteristic.Intuition);
		const ability = getAbility('null-sub-2-2-2b');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const protectedAbility = protectCanonicalState({
			label: 'Heat Sink canonical Ability data',
			capture: () => JSON.stringify(ability)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Heat Sink Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderAbility(ability, hero);
		const expectZhTW = () => {
			expectRendered(container, '吸熱成霜');
			expectRendered(container, `都會受到 ${intuition} 點寒冷傷害。`);
			expect(normalizedText(container)).not.toContain('Heat Sink');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Heat Sink');
				expectRendered(container, `takes cold damage equal to ${intuition}.`);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		const inputs = getTextEffect.mock.calls.map(call => call[0]);
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('renders Inertial Sink through the real Feature panel in both Hero and no-Hero context', () => {
		const hero = makeHero();
		const level = hero.class?.level as number;
		const feature = getFeature('null-sub-3-2-1');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const protectedFeature = protectCanonicalState({
			label: 'Inertial Sink canonical Feature data',
			capture: () => JSON.stringify(feature)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Inertial Sink Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const heroPanel = renderFeature(feature, hero);
		const expectZhTW = () => {
			expectRendered(heroPanel.container, '慣性沉體');
			expectRendered(heroPanel.container, `傷害量會減少 ${level} 點。`);
			expectRendered(heroPanel.container, '你的有效體型會視為加上你的直覺。');
			expect(normalizedText(heroPanel.container)).not.toContain('Inertial Sink');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedFeature, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(heroPanel.container, 'Inertial Sink');
				expectRendered(heroPanel.container, `you reduce that damage by an amount equal to ${level}.`);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});
		heroPanel.unmount();

		// Library / no Hero never reaches the auto-calc path, so the approved raw reading stands.
		const libraryPanel = renderFeature(feature);
		expectRendered(libraryPanel.container, '慣性沉體');
		expectRendered(libraryPanel.container, '傷害量會減少等於你等級的數值。');
		expect(normalizedText(libraryPanel.container)).not.toContain(`傷害量會減少 ${level} 點。`);

		const inputs = getTextEffect.mock.calls.map(call => call[0]);
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach(input => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('renders Gravitic Strike through the real ability panel with all three tiers localized', () => {
		const hero = makeHero();
		const ability = getAbility('null-sub-3-2-2a');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, hero);

		expectRendered(container, '牽引重拳');
		expectRendered(container, '你的拳頭釋放一道引力，將遠處的敵人拉近。');
		// Every tier row reads in zh-TW, with its authored vertical pull distance intact.
		tierTexts(container).forEach(text => {
			expect(text).toContain('心靈傷害');
			expect(text).toContain('垂直拉動');
			expect(text).not.toMatch(/psychic|vertical pull/);
		});

		switchLocale();
		tierTexts(container).forEach(text => expect(text).toContain('vertical pull'));
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('renders Kinetic Shield temporary Stamina tiers and its bleeding emphasis through the real ability panel', () => {
		const hero = makeHero();
		const ability = getAbility('null-sub-3-2-2b');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, hero);

		expectRendered(container, '動能護盾');
		// The fixed 10 / 15 / 20 tiers need no numeric Chinese calculation layer.
		[ '你獲得 10 點臨時體力', '你獲得 15 點臨時體力', '你獲得 20 點臨時體力' ].forEach((text, index) => {
			expect(tierTexts(container)[index]).toContain(text);
		});
		expectRendered(container, '你不會陷入出血');
		expect(normalizedText(container)).not.toContain('bleeding');

		switchLocale();
		expectRendered(container, 'Kinetic Shield');
		expectRendered(container, 'You gain 10 temporary Stamina');
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('reads the Null Level 1 and Level 2 progression together in the class panel across a full locale round trip', () => {
		const hero = makeHero();
		const heroBefore = JSON.stringify(hero);
		const protectedClass = protectCanonicalState({
			label: 'Null canonical class data (class panel)',
			capture: () => JSON.stringify(nullClass)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (class panel Level 1 to 2 progression)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderClassPanel(hero);
		clickPage(container, '特性');

		const expectZhTW = () => {
			// A Level 1 reading from the earlier Null slices, next to this batch's Level 2 one.
			expect(readFieldByExactLabel(container, '1 級')).toContain('紀律');
			expect(readFieldByExactLabel(container, '2 級')).toBe('探索類 / 交涉類 / 隱密類專長');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedClass, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readFieldByExactLabel(container, 'Level 1')).toContain('Discipline');
				expect(readFieldByExactLabel(container, 'Level 2')).toBe('Exploration / Interpersonal / Intrigue Perk');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		expect(JSON.stringify(hero)).toBe(heroBefore);
		expect(hero.class?.id).toBe(nullClass.id);
		expect(hero.class?.level).toBe(2);
	});

	it('shows a selected Tradition Level 2 progression without disturbing its completed Level 1 content', () => {
		const metakinetic = traditions[2];
		const serialized = JSON.stringify(metakinetic);
		const protectedTradition = protectCanonicalState({
			label: 'Metakinetic canonical Tradition data',
			capture: () => JSON.stringify(metakinetic)
		});

		const { container } = renderSubclass(metakinetic);
		clickPage(container, '特性');

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedTradition ],
			assertZhTW: () => {
				expectRendered(container, '慣性沉體');
				expectRendered(container, '2 級流派招式');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'Inertial Sink');
				expectRendered(container, '2nd-Level Tradition Ability');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(container, '慣性沉體')
		});

		expect(metakinetic.id).toBe('null-sub-3');
		expect(JSON.stringify(metakinetic)).toBe(serialized);
	});
});
