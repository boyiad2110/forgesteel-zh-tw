// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1CensorLevel2RequiredCanonicalEnglish, getV1CensorOrders, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
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
import { censor } from '@/data/classes/censor/censor';
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
 * The live slice, rebuilt here by the test's own level lookup and its own Ability-field reader.
 *
 * The non-Ability half reuses the shared independent bounded walk; the Ability half is written
 * out again below rather than imported from the manifest, because the claim under test is that
 * the production denominator resolves the right identities from canonical data. Producing the
 * expected set through the production extraction would only prove that extraction agrees with
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

const orders = getV1CensorOrders();

const choiceAbilities = (features: Feature[]): Ability[] => features
	.filter(feature => feature.type === FeatureType.Choice)
	.flatMap(feature => (feature.type === FeatureType.Choice ? feature.data.options : [])
		.map(option => option.feature)
		.filter(option => option.type === FeatureType.Ability)
		.map(option => (option.type === FeatureType.Ability ? option.data.ability : undefined))
		.filter((ability): ability is Ability => ability !== undefined));

const liveFields: Record<string, string> = { ...extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures(censor)) };
orders.forEach(order => {
	const orderLevelTwo = levelTwoFeatures(order);
	Object.assign(liveFields, extractLiveBoundedNonAbilityFeatureFields(orderLevelTwo));
	choiceAbilities(orderLevelTwo).forEach(ability => Object.assign(liveFields, extractLiveAbilityFields(ability)));
});

const required = createV1CensorLevel2RequiredCanonicalEnglish();

const censorLevel2CatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

/** The 47 approved identities, written out independently of any extraction under test. */
const approvedIdentities = [
	'element:censor-2-1/name',
	'element:censor-sub-1-2-1/name',
	'element:censor-sub-1-2-1/description',
	'element:censor-sub-1-2-2/name',
	'element:censor-sub-1-2-2/description',
	'element:censor-sub-1-2-3/name',
	'element:censor-sub-1-2-3a/name',
	'element:censor-sub-1-2-3a/target',
	'element:censor-sub-1-2-3a/description',
	'element:censor-sub-1-2-3a/sections.0.roll.tier1',
	'element:censor-sub-1-2-3a/sections.0.roll.tier2',
	'element:censor-sub-1-2-3a/sections.0.roll.tier3',
	'element:censor-sub-1-2-3a/sections.1.text',
	'element:censor-sub-1-2-3b/name',
	'element:censor-sub-1-2-3b/target',
	'element:censor-sub-1-2-3b/description',
	'element:censor-sub-1-2-3b/sections.0.text',
	'element:censor-sub-2-2-1/name',
	'element:censor-sub-2-2-1/description',
	'element:censor-sub-2-2-2/name',
	'element:censor-sub-2-2-2/description',
	'element:censor-sub-2-2-3/name',
	'element:censor-sub-2-2-3a/name',
	'element:censor-sub-2-2-3a/target',
	'element:censor-sub-2-2-3a/description',
	'element:censor-sub-2-2-3a/type.trigger',
	'element:censor-sub-2-2-3a/sections.0.text',
	'element:censor-sub-2-2-3b/name',
	'element:censor-sub-2-2-3b/target',
	'element:censor-sub-2-2-3b/description',
	'element:censor-sub-2-2-3b/sections.0.text',
	'element:censor-sub-3-2-1/name',
	'element:censor-sub-3-2-1/description',
	'element:censor-sub-3-2-2/name',
	'element:censor-sub-3-2-2/description',
	'element:censor-sub-3-2-3/name',
	'element:censor-sub-3-2-3a/name',
	'element:censor-sub-3-2-3a/target',
	'element:censor-sub-3-2-3a/description',
	'element:censor-sub-3-2-3a/sections.0.text',
	'element:censor-sub-3-2-3b/name',
	'element:censor-sub-3-2-3b/target',
	'element:censor-sub-3-2-3b/description',
	'element:censor-sub-3-2-3b/sections.0.roll.tier1',
	'element:censor-sub-3-2-3b/sections.0.roll.tier2',
	'element:censor-sub-3-2-3b/sections.0.roll.tier3',
	'element:censor-sub-3-2-3b/sections.1.text'
].sort();

const { renderFeature, renderClassPanel, renderAbility } = createClassPresentationHarness(censor, [ core ]);

/** Selects one of a panel's segmented pages by its rendered label. */
const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent || '');

const allLevelTwoFeatures = [ ...levelTwoFeatures(censor), ...orders.flatMap(order => levelTwoFeatures(order)) ];

const getFeature = (id: string) => {
	const feature = allLevelTwoFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Censor Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

const getAbility = (id: string) => {
	const ability = orders.flatMap(order => choiceAbilities(levelTwoFeatures(order))).find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Censor Level 2 Ability '${id}' is missing`);
	}
	return ability;
};

const zhTWOf = (identity: string) => censorLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;

const makeHero = () => createHeroWithClass(censor, 2, FactoryLogic.createCharacteristics(2, 0, 0, 0, 2));

afterEach(cleanup);

describe('V1 Core Censor L2 manifest, catalog and presentation', () => {
	it('matches the independent live Censor Level 2 slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(47);
		expect(Object.keys(required)).toHaveLength(47);
		expect(Object.keys(required).sort()).toEqual(approvedIdentities);
		expect(Object.keys(liveFields).sort()).toEqual(approvedIdentities);
		expect(required).toEqual(liveFields);

		// The bounded reachability the batch fixed: the three Level 2 ability-choice roots
		// contribute their own label, and exactly the six Abilities they offer directly.
		expect(orders.map(order => order.id)).toEqual([ 'censor-sub-1', 'censor-sub-2', 'censor-sub-3' ]);
		expect(orders.flatMap(order => choiceAbilities(levelTwoFeatures(order))).map(ability => ability.id)).toEqual([
			'censor-sub-1-2-3a', 'censor-sub-1-2-3b',
			'censor-sub-2-2-3a', 'censor-sub-2-2-3b',
			'censor-sub-3-2-3a', 'censor-sub-3-2-3b'
		]);
		// Level 1 Order content and Order metadata stay with the Level 1 slice; Level 3+ stays out.
		expect(Object.keys(required).some(identity => /censor-sub-\d-(1|3)-/.test(identity))).toBe(false);
		expect(required[elementFieldIdentity('censor-sub-1', 'name')]).toBeUndefined();
	});

	it('adds exactly the 47 approved catalog entries and registers them in the live manifest', () => {
		expect(censorLevel2CatalogEntries).toHaveLength(47);
		expect(censorLevel2CatalogEntries.map(getEntryIdentity).sort()).toEqual(approvedIdentities);
		expect(censorLevel2CatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(censorLevel2CatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(censorLevel2CatalogEntries.every(entry => (entry.zhTW.trim() !== '') && (entry.zhTW !== entry.canonicalEnglish))).toBe(true);

		Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
			expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		});

		expect(zhTWOf('element:censor-2-1/name')).toBe('交涉類 / 學識類 / 超常類專長');
		expect(zhTWOf('element:censor-sub-1-2-3/name')).toBe('2 級驅邪招式');
		expect(zhTWOf('element:censor-sub-2-2-3/name')).toBe('2 級神諭招式');
		expect(zhTWOf('element:censor-sub-3-2-3/name')).toBe('2 級典範招式');
		expect(zhTWOf('element:censor-sub-1-2-3a/sections.0.roll.tier1')).toBe('8 + `力量`神聖傷害；`氣場` < [弱]，畏縮（豁免解除）');
		expect(zhTWOf('element:censor-sub-3-2-3b/sections.0.roll.tier3')).toBe('12 + `氣場`傷害；`氣場` < [強]，束縛（豁免解除）');
	});

	it('carries the two Reviewer-mechanical Judgment spacing corrections and no stray bracket space anywhere in the slice', () => {
		expect(zhTWOf('element:censor-sub-1-2-1/description')).toContain('你可以使用免費反應動作對他發動【審判】招式。');
		expect(zhTWOf('element:censor-sub-1-2-3b/sections.0.text')).toContain('你可以使用免費反應動作對其中 1 個目標發動【審判】招式。');
		expect(censorLevel2CatalogEntries.filter(entry => entry.zhTW.includes('【審判 】'))).toEqual([]);
	});

	it('leaves the glossary untouched, including the context-only montage reading', () => {
		expect(zhTWOf('element:censor-sub-2-2-1/description')).toContain('蒙太奇考驗');
		expect(glossaryCsv).not.toContain('蒙太奇');
		expect(glossaryCsv.split(/\r?\n/).some(row => /^montage/i.test(row))).toBe(false);
	});

	it('keeps the catalog complete while class level content stays unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		// Censor Level 2 being complete closes neither Censor Level 3+ nor any other class.
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'class-and-subclass-level-content',
			'official-ability-authored-content'
		]));
		expect(result.complete).toBe(false);
	});

	it('reads the base Censor and all three Orders in zh-TW and back in canonical English', () => {
		const readings: { id: string, zhTW: string[], english: string[] }[] = [
			{ id: 'censor-2-1', zhTW: [ '交涉類 / 學識類 / 超常類專長' ], english: [ 'Interpersonal / Lore / Supernatural Perk' ] },
			{ id: 'censor-sub-1-2-1', zhTW: [ '聖者警覺', '任何被你審判的生物都無法使用躲藏機動動作。' ], english: [ "Saint's Vigilance", 'Any creature judged by you can’t use the Hide maneuver.' ] },
			{ id: 'censor-sub-1-2-2', zhTW: [ '明辨真偽' ], english: [ 'A Sense for Truth' ] },
			{ id: 'censor-sub-2-2-1', zhTW: [ '預言之兆', '蒙太奇考驗' ], english: [ 'It Was Foretold', 'montage test' ] },
			{ id: 'censor-sub-2-2-2', zhTW: [ '洞察之眼' ], english: [ 'Judge of Character' ] },
			{ id: 'censor-sub-3-2-1', zhTW: [ '以身作則' ], english: [ 'Lead by Example' ] },
			{ id: 'censor-sub-3-2-2', zhTW: [ '堅定象徵' ], english: [ 'Stalwart Example' ] }
		];

		readings.forEach(reading => {
			const protectedFeatures = protectCanonicalState({
				label: `Censor Level 2 canonical Feature data (${reading.id})`,
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

	it('presents each ability-choice root and its two nested Ability options through the real Choice panel', () => {
		const expected = [
			{ choice: 'censor-sub-1-2-3', label: '2 級驅邪招式', options: [ '天理昭彰', '聖光揭示' ], english: [ 'It Is Justice You Fear', 'Revelator' ] },
			{ choice: 'censor-sub-2-2-3', label: '2 級神諭招式', options: [ '預知恩典', '吾之祝福' ], english: [ 'Prescient Grace', 'With My Blessing' ] },
			{ choice: 'censor-sub-3-2-3', label: '2 級典範招式', options: [ '虔信祝福', '裁決' ], english: [ 'Blessing of the Faithful', 'Sentenced' ] }
		];

		expected.forEach(entry => {
			const choice = getFeature(entry.choice);
			if (choice.type !== FeatureType.Choice) {
				throw new Error(`${entry.choice} is not a Choice`);
			}
			const serialized = JSON.stringify(choice);
			const panel = renderFeature(choice);

			expectRendered(panel.container, entry.label);
			entry.options.forEach(option => expectRendered(panel.container, option));

			switchLocale();
			entry.english.forEach(option => expectRendered(panel.container, option));

			// The options stay addressed by their canonical Feature/Ability IDs.
			expect(choice.data.options.map(option => option.feature.id)).toEqual([ `${entry.choice}a`, `${entry.choice}b` ]);
			expect(JSON.stringify(choice)).toBe(serialized);
			panel.unmount();
		});
	});

	it('reuses the existing Power Roll presenter for all six approved tier identities', () => {
		const hero = makeHero();

		([
			[ 'censor-sub-1-2-3a', '神聖傷害', '畏縮' ],
			[ 'censor-sub-3-2-3b', '傷害', '束縛' ]
		] as const).forEach(([ abilityID, damageReading, conditionReading ]) => {
			const ability = getAbility(abilityID);

			([ 1, 2, 3 ] as const).forEach(tier => {
				const field = `sections.0.roll.tier${tier}`;
				const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
				expect(canonicalEnglish).toBeDefined();
				assertCanonicalEnglishCalculationInput(canonicalEnglish);

				const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, undefined, hero);
				const zhTW = localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });

				// The number comes from the canonical calculator, not from the localizer.
				const calculatedDamage = calculatedEnglish.match(/^(\d+)/)?.[1];
				expect(calculatedDamage).toBeDefined();
				expect(zhTW).toContain(`${calculatedDamage} ${damageReading}`);
				expect(zhTW).toContain(conditionReading);
				expect(zhTW).not.toMatch(/[A-Za-z]/);

				// English mode is the calculator's own output, untouched.
				expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish })).toBe(calculatedEnglish);
			});
		});
	});

	it('renders Sentenced through the real ability panel with the calculated tier readings in zh-TW', () => {
		const hero = makeHero();
		const ability = getAbility('censor-sub-3-2-3b');
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability, hero);

		expectRendered(container, '裁決');
		expect(tierTexts(container)[0]).toContain('束縛');
		expect(screen.getAllByText('束縛', { selector: 'strong' }).length).toBeGreaterThan(0);

		// `sections.1.text` is calculated as well, beyond the three families the packet enumerated:
		// AbilityLogic emphasises `restrained` with or without a Hero. No new grammar is needed -
		// the existing shared condition-emphasis projector already carries it into the approved
		// zh-TW, which is asserted directly here so the behavior is not left to the render alone.
		const conditionText = required[elementFieldIdentity('censor-sub-3-2-3b', 'sections.1.text')];
		expect(AbilityLogic.getTextEffect(conditionText, undefined)).toContain('**restrained**');
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'censor-sub-3-2-3b',
			field: 'sections.1.text',
			canonicalEnglish: conditionText,
			calculatedEnglish: AbilityLogic.getTextEffect(conditionText, undefined)
		})).toBe('若目標以此方式陷入**束縛**，你那些具有強制移動效果的招式仍然可以移動對方。');
		expectRendered(container, '若目標以此方式陷入束縛，你那些具有強制移動效果的招式仍然可以移動對方。');

		switchLocale();
		expect(tierTexts(container)[0]).toContain('restrained');
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('reuses the existing recovery-value presenter for Prescient Grace in both Library and Hero context', () => {
		const hero = makeHero();
		const canonicalEnglish = required[elementFieldIdentity('censor-sub-2-2-3a', 'sections.0.text')];
		const approvedRaw = zhTWOf('element:censor-sub-2-2-3a/sections.0.text');
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		// Library / no Hero: the calculator resolves nothing, so the approved raw wording stands.
		expect(AbilityLogic.getTextEffect(canonicalEnglish, undefined)).toBe(canonicalEnglish);
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'censor-sub-2-2-3a',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: AbilityLogic.getTextEffect(canonicalEnglish, undefined)
		})).toBe(approvedRaw);
		expect(approvedRaw).toContain('恢復等於你復元值的體力');

		// Hero context: only the calculator-resolved recovery value is projected.
		const recoveryValue = HeroLogic.getRecoveryValue(hero);
		const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		expect(calculatedEnglish).toContain(`regain Stamina equal to ${recoveryValue}.`);
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'censor-sub-2-2-3a',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		})).toBe(`你可以花費 1 點復元力，讓目標恢復 ${recoveryValue} 點體力。然後，目標可以在觸發敵人之前立刻進行自己的回合。`);
	});

	it('projects the two bounded twice-Presence readings without ever calculating from Chinese', () => {
		const hero = makeHero();
		const twicePresence = 2 * HeroLogic.getCharacteristic(hero, Characteristic.Presence);

		const cases = [
			{
				elementID: 'censor-sub-1-2-3a',
				field: 'sections.1.text',
				// No Hero still emphasises the condition, so the Library reading is the approved raw
				// wording plus that emphasis - never a fallback to English.
				noHero: '若目標已經對你或其他生物陷入**畏縮**，而此招式會讓他再次陷入畏縮，則目標改為受到等於你`氣場` ×2 的心靈傷害。',
				hero: `若目標已經對你或其他生物陷入**畏縮**，而此招式會讓他再次陷入畏縮，則目標改為受到 ${twicePresence} 點心靈傷害。`
			},
			{
				elementID: 'censor-sub-1-2-3b',
				field: 'sections.0.text',
				noHero: undefined,
				hero: `每個目標都會受到 ${twicePresence} 點神聖傷害。此外，每個處於隱藏的目標會自動被揭露，直到你下個回合開始前都無法再次隱藏。然後，你可以使用免費反應動作對其中 1 個目標發動【審判】招式。`
			}
		];

		cases.forEach(scenario => {
			const identity = `element:${scenario.elementID}/${scenario.field}`;
			const canonicalEnglish = required[elementFieldIdentity(scenario.elementID, scenario.field)];
			const approvedRaw = zhTWOf(identity);
			assertCanonicalEnglishCalculationInput(canonicalEnglish);

			const present = (calculatedEnglish: string) => localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: scenario.elementID,
				field: scenario.field,
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			});

			// Library / no Hero keeps the packet-approved raw wording; the twice-Presence
			// expression is never resolved to a number without a Hero.
			const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
			expect(noHeroCalculated).toContain('twice your Presence score');
			expect(present(noHeroCalculated)).toBe(scenario.noHero ?? approvedRaw);
			expect(present(noHeroCalculated)).toContain('等於你`氣場` ×2');

			// Hero context projects the calculator's own number into the approved Chinese grammar.
			const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
			expect(heroCalculated).toContain(`equal to ${twicePresence}`);
			expect(heroCalculated).not.toContain('twice your Presence score');
			expect(present(heroCalculated)).toBe(scenario.hero);
			expect(present(heroCalculated)).not.toMatch(/[A-Za-z]/);

			// English mode stays the calculator's own output.
			expect(localizeCalculatedAuthoredTextPresentation({
				locale: 'en',
				elementID: scenario.elementID,
				field: scenario.field,
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: heroCalculated
			})).toBe(heroCalculated);
		});
	});

	it('fails closed rather than guessing when the calculated English no longer matches the approved structure', () => {
		const canonicalEnglish = required[elementFieldIdentity('censor-sub-1-2-3b', 'sections.0.text')];

		// A calculated English that the authorized rewrite cannot fully explain must fall back to
		// the complete calculated English, never to a partly-projected Chinese/English mixture.
		const unsupported = `${canonicalEnglish.replace('twice your Presence score', '4')} They also fall prone.`;
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'censor-sub-1-2-3b',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupported
		})).toBe(unsupported);
	});

	it('sends only canonical English into the calculator while rendering the Hero-context Exorcist ability', () => {
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const ability = getAbility('censor-sub-1-2-3a');

		const protectedAbility = protectCanonicalState({
			label: 'It Is Justice You Fear canonical Ability data',
			capture: () => JSON.stringify(ability)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (Exorcist Level 2 Hero context)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderAbility(ability, hero);
		const expectZhTW = () => {
			expectRendered(container, '天理昭彰');
			expectRendered(container, '則目標改為受到 4 點心靈傷害');
			expect(normalizedText(container)).not.toContain('It Is Justice You Fear');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, 'It Is Justice You Fear');
				expectRendered(container, 'they instead take psychic damage equal to 4.');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		const calculatorInputs = [
			...getTextEffect.mock.calls.map(call => call[0]),
			...getTierEffectCreature.mock.calls.map(call => call[0])
		];
		expect(calculatorInputs.length).toBeGreaterThan(0);
		calculatorInputs.forEach(input => assertCanonicalEnglishCalculationInput(input));

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('reads the Censor Level 1 and Level 2 progression together in the class panel across a full locale round trip', () => {
		const hero = makeHero();
		const heroBefore = JSON.stringify(hero);
		const protectedClass = protectCanonicalState({
			label: 'Censor canonical class data (class panel)',
			capture: () => JSON.stringify(censor)
		});
		const protectedHero = protectCanonicalState({
			label: 'Hero state (class panel Level 1 to 2 progression)',
			capture: () => JSON.stringify(hero)
		});

		const { container } = renderClassPanel(hero);
		clickPage(container, '特性');

		const expectZhTW = () => {
			// A Level 1 reading from the earlier Censor slice, next to this batch's Level 2 one.
			expect(readFieldByExactLabel(container, '1 級')).toContain('怒火');
			expect(readFieldByExactLabel(container, '2 級')).toBe('交涉類 / 學識類 / 超常類專長');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedClass, protectedHero ],
			assertZhTW: expectZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(readFieldByExactLabel(container, 'Level 1')).toContain('Wrath');
				expect(readFieldByExactLabel(container, 'Level 2')).toBe('Interpersonal / Lore / Supernatural Perk');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectZhTW
		});

		expect(JSON.stringify(hero)).toBe(heroBefore);
		expect(hero.class?.id).toBe(censor.id);
		expect(hero.class?.level).toBe(2);
	});

	it('shows the selected Order Level 2 progression in the subclass panel without mutating Order data', () => {
		const exorcist = orders[0];
		const serialized = JSON.stringify(exorcist);
		const protectedOrder = protectCanonicalState({
			label: 'Exorcist canonical Order data',
			capture: () => JSON.stringify(exorcist)
		});

		const { renderSubclass } = createClassPresentationHarness(censor, [ core ]);
		const { container } = renderSubclass(exorcist);
		clickPage(container, '特性');

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedOrder ],
			assertZhTW: () => {
				expectRendered(container, '聖者警覺');
				expectRendered(container, '明辨真偽');
				expectRendered(container, '2 級驅邪招式');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(container, "Saint's Vigilance");
				expectRendered(container, 'A Sense for Truth');
				expectRendered(container, '2nd-Level Exorcist Ability');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(container, '2 級驅邪招式')
		});

		expect(exorcist.id).toBe('censor-sub-1');
		expect(JSON.stringify(exorcist)).toBe(serialized);
	});
});
