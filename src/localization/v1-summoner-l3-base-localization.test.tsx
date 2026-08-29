// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { Ability } from '@/models/ability';
import { Feature, FeatureAbility } from '@/models/feature';
import { summoner } from '@/data/classes/summoner/summoner';
import { core } from '@/data/sourcebooks/official/core';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { createV1SummonerLevel1BaseAbilityRemainderRequiredCanonicalEnglish, createV1SummonerLevel2BaseRequiredCanonicalEnglish, createV1SummonerLevel3BaseRequiredCanonicalEnglish, getV1SummonerLevel3BaseAbilities, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { createClassPresentationHarness, expectRendered, installResizeObserverStub, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

installResizeObserverStub();

const approvedSliceIdentities = [
	'element:summoner-3-1/name',
	'element:summoner-3-1/description',
	'element:summoner-3-2/name',
	'element:summoner-3-2a/name',
	'element:summoner-3-2a/description',
	'element:summoner-3-2b/name',
	'element:summoner-3-2b/description',
	'element:summoner-3-2c/name',
	'element:summoner-3-2c/description',
	'element:summoner-3-2d/name',
	'element:summoner-3-2d/description',
	'element:summoner-3-3/name',
	'element:summoner-ability-7/name',
	'element:summoner-ability-7/target',
	'element:summoner-ability-7/description',
	'element:summoner-ability-7/sections.0.text',
	'element:summoner-ability-8/name',
	'element:summoner-ability-8/target',
	'element:summoner-ability-8/description',
	'element:summoner-ability-8/sections.0.text',
	'element:summoner-ability-9/name',
	'element:summoner-ability-9/target',
	'element:summoner-ability-9/description',
	'element:summoner-ability-9/sections.0.roll.tier1',
	'element:summoner-ability-9/sections.0.roll.tier2',
	'element:summoner-ability-9/sections.0.roll.tier3',
	'element:summoner-ability-9/sections.1.name',
	'element:summoner-ability-9/sections.1.effect',
	'element:summoner-ability-10/name',
	'element:summoner-ability-10/target',
	'element:summoner-ability-10/description',
	'element:summoner-ability-10/sections.0.roll.tier1',
	'element:summoner-ability-10/sections.0.roll.tier2',
	'element:summoner-ability-10/sections.0.roll.tier3'
];

const required = createV1SummonerLevel3BaseRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));
const abilities = getV1SummonerLevel3BaseAbilities();
const levelThreeFeatures = summoner.featuresByLevel.find(level => level.level === 3)?.features || [];
const summonerStrike = summoner.featuresByLevel.find(level => level.level === 1)?.features.find((feature): feature is FeatureAbility => feature.type === FeatureType.Ability && feature.data.ability.id === 'summoner-1-3')?.data.ability;
if (!summonerStrike) {
	throw new Error('Summoner Strike is missing');
}
const getAbility = (id: string): Ability => {
	const ability = abilities.find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Summoner Level 3 ability '${id}' is missing`);
	}
	return ability;
};
const getFeature = (id: string): Feature => {
	const features = extractLiveBoundedNonAbilityFeatureFields(levelThreeFeatures);
	if (features[elementFieldIdentity(id, 'name')] === undefined) {
		throw new Error(`Summoner Level 3 Feature '${id}' is missing`);
	}
	const directFeature = levelThreeFeatures.find(feature => feature.id === id);
	if (directFeature) {
		return directFeature;
	}
	const ward = levelThreeFeatures.find(feature => feature.type === FeatureType.Choice);
	const root = ward?.type === FeatureType.Choice ? ward.data.options.find(option => option.feature.id === id)?.feature : undefined;
	if (!root) {
		throw new Error(`Summoner Level 3 Feature '${id}' cannot be read`);
	}
	return root;
};
const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...summoner, level: 3, characteristics: FactoryLogic.createCharacteristics(1, 2, 3, 0, 1) };
	return hero;
};
const { renderFeature, renderAbility } = createClassPresentationHarness(summoner, [ core, summonerSourcebook ]);

const textReading = (elementID: string, field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
	assertCanonicalEnglishCalculationInput(canonicalEnglish);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID, field, canonicalEnglish, calculatedEnglish: AbilityLogic.getTextEffect(canonicalEnglish, hero) });
};
const tierReading = (abilityID: string, tier: number, hero: ReturnType<typeof makeHero>) => {
	const ability = getAbility(abilityID);
	const field = `sections.0.roll.tier${tier}`;
	const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID, field, canonicalEnglish, calculatedEnglish: AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, ability, ability.distance.length > 1 ? ability.distance[0].type : undefined, hero) });
};

afterEach(cleanup);

describe('V1 Summoner Level 3 base-class catalog and presentation', () => {
	it('adds exactly the packet-aligned 34-identity manifest and catalog slice', () => {
		expect(approvedSliceIdentities).toHaveLength(34);
		expect(new Set(approvedSliceIdentities).size).toBe(34);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(v1LocalizationManifest.requiredCanonicalEnglish).toMatchObject(required);

		expect(Object.keys(extractLiveBoundedNonAbilityFeatureFields(levelThreeFeatures))).toContain('element:summoner-3-2d/description');
		expect(Object.keys(createV1SummonerLevel1BaseAbilityRemainderRequiredCanonicalEnglish()).some(identity => identity.includes('summoner-ability-7'))).toBe(false);
		expect(Object.keys(createV1SummonerLevel2BaseRequiredCanonicalEnglish()).some(identity => identity.includes('summoner-3-'))).toBe(false);
	});

	it('renders raw Level 3 feature readings and keeps their canonical leading newlines out of zh-TW', () => {
		const kit = getFeature('summoner-3-1');
		expect(kit.description.startsWith('\n')).toBe(true);
		const renderedKit = renderFeature(kit);
		expectRendered(renderedKit.container, '你為自己召來 1 組套裝。');
		expect(renderedKit.container.textContent).not.toContain('You conjure a kit');
		renderedKit.unmount();

		const ward = renderFeature(getFeature('summoner-3-2d'));
		expectRendered(ward.container, '將該生物朝召喚師射程內你的 1 個僕從拉動等於你理智的格數。');
		ward.unmount();
	});

	it('projects only the four authorized calculated authored readings and otherwise fails closed', () => {
		const hero = makeHero();
		expect(textReading('summoner-3-1', 'description', hero)).toContain('效力提高至 `理智` < 2。');
		expect(textReading('summoner-3-1', 'description', hero)).toContain('傷害提高至`理智` ×2。');
		expect(textReading('summoner-3-2d', 'description', hero)).toContain('拉動 3 格。');
		expect(textReading('summoner-ability-7', 'sections.0.text', hero)).toContain('`力量` < 1（若目標體型 > 該敵人，則為`力量` < 2），就會陷入**伏地**。');
		const cavalry = textReading('summoner-ability-8', 'sections.0.text', hero);
		expect(cavalry).toContain('`理智` < 2，則被迫朝傷害來源移動 5 格');
		expect(cavalry.split('\n\n')).toHaveLength(2);
		const injectedKit = renderAbility(summonerStrike, hero);
		expectRendered(injectedKit.container, '召喚師套裝');
		expectRendered(injectedKit.container, '效力提高至 理智 < 2。');
		expectRendered(injectedKit.container, '傷害提高至理智 ×2。');
		injectedKit.unmount();

		const unsupported = `${AbilityLogic.getTextEffect(required['element:summoner-ability-8/sections.0.text'], hero)} Unexpected.`;
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'summoner-ability-8', field: 'sections.0.text', canonicalEnglish: required['element:summoner-ability-8/sections.0.text'], calculatedEnglish: unsupported })).toBe(unsupported);
	});

	it('preserves shared Power Roll presentation and public locale round-trip without canonical mutation', () => {
		const hero = makeHero();
		expect(tierReading('summoner-ability-9', 1, hero)).toBe('5 傷害；推動 2');
		expect(tierReading('summoner-ability-10', 1, hero)).toContain('11 傷害；`理智` < 1，**暈眩**（豁免解除）');
		expect(tierReading('summoner-ability-10', 2, hero)).toContain('15 傷害；`理智` < 2，**暈眩**（豁免解除）');
		expect(tierReading('summoner-ability-10', 3, hero)).toContain('19 傷害；`理智` < 3，**暈眩**（豁免解除）');

		const blitz = getAbility('summoner-ability-7');
		const serializedAbility = JSON.stringify(blitz);
		const serializedHero = JSON.stringify(hero);
		const { container } = renderAbility(blitz, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Blitz Tactics', capture: () => JSON.stringify(blitz) }),
				protectCanonicalState({ label: 'Summoner Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => expectRendered(container, '閃擊戰術'),
			switchToEnglish: switchLocale,
			assertEnglish: () => expect(container.textContent).toContain('Blitz Tactics'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expect(container.textContent).toContain('閃擊戰術')
		});
		expect(JSON.stringify(blitz)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
	});
});
