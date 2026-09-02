// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { HeroLogic } from '@/logic/hero-logic';
import { Ability } from '@/models/ability';
import { censor } from '@/data/classes/censor/censor';
import { core } from '@/data/sourcebooks/official/core';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { createV1CensorLevel3RequiredCanonicalEnglish, getV1CensorLevel3Abilities, v1CensorLevel3AbilityIDs, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { verifyApprovedTranslationsAgainstCatalog } from '@/localization/test-support/approved-translation-catalog-reconciliation';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

installResizeObserverStub();

const approvedReadings = [
	[ 'element:censor-3-1/name', '天譴神威' ],
	[ 'element:censor-3-1/description', '你的審判獲得更強大的神力，讓被譴責之人心生畏懼。每當你發動【審判】招式時，你可以花費 1 點怒火，若目標的`氣場` < [中]，目標會對你陷入畏縮（豁免解除）。此外，每當 1 個被你審判的生物體力歸 0 而你使用免費反應動作發動【審判】時，若新目標的`氣場` < [強]，新目標會對你陷入畏縮（豁免解除）。若目標已經對你陷入畏縮，則改為受到等於你`氣場` ×2 的神聖傷害。' ],
	[ 'element:censor-3-2/name', '7 費招式' ],
	[ 'element:censor-ability-13/name', '隔絕律令' ],
	[ 'element:censor-ability-13/target', '區域內的每個敵人' ],
	[ 'element:censor-ability-13/description', '敵人心中的邪惡引爆成神聖火焰，焚燒有罪之人。' ],
	[ 'element:censor-ability-13/sections.0.text', '直到遭遇結束或你陷入瀕死之前，每個目標會在你每回合結束時受到等於你`氣場`的神聖傷害。若目標被你審判或與任何敵人相鄰，則額外受到 2d6 神聖傷害。' ],
	[ 'element:censor-ability-14/name', '肅正律令' ],
	[ 'element:censor-ability-14/target', '區域內的每個敵人' ],
	[ 'element:censor-ability-14/description', '在你神聖威儀籠罩的區域內，敵人會後悔使用兇邪的招式。' ],
	[ 'element:censor-ability-14/sections.0.text', '直到遭遇結束或你陷入瀕死之前，每當目標發動需要花費惡意的招式時，目標會受到等於你`氣場` ×3 的神聖傷害。被你審判的目標會額外受到 2d6 神聖傷害。' ],
	[ 'element:censor-ability-15/name', '止戰律令' ],
	[ 'element:censor-ability-15/target', '區域內的每個敵人' ],
	[ 'element:censor-ability-15/description', '你散發正義的能量，懲罰意圖傷害你或盟友的敵人。' ],
	[ 'element:censor-ability-15/sections.0.text', '直到遭遇結束或你陷入瀕死之前，每當目標發動打擊時，目標會受到等於你`氣場` ×2 的神聖傷害。被你審判的目標會額外受到 2d6 神聖傷害。' ],
	[ 'element:censor-ability-16/name', '禁錮律令' ],
	[ 'element:censor-ability-16/target', '區域內的每個敵人' ],
	[ 'element:censor-ability-16/description', '惡徒一旦離開你神聖靈光的範圍就會痛苦不堪。' ],
	[ 'element:censor-ability-16/sections.0.text', '直到遭遇結束或你陷入瀕死之前，每當目標移動或被強制移動離開區域時，目標會受到等於你`氣場` ×2 的神聖傷害。被你審判的目標若自願移動，則會額外受到 2d6 神聖傷害。' ]
] as const;

const levelThreeFeatures = censor.featuresByLevel.find(level => level.level === 3)?.features || [];
const abilities = getV1CensorLevel3Abilities();
const required = createV1CensorLevel3RequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));
const { renderFeature, renderAbility } = createClassPresentationHarness(censor, [ core ]);

const getFeature = (id: string) => {
	const feature = levelThreeFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Censor Level 3 Feature '${id}' is missing`);
	}
	return feature;
};

const getAbility = (id: string) => {
	const ability = abilities.find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Censor Level 3 Ability '${id}' is missing`);
	}
	return ability;
};

const approvedZhTW = (identity: string) => approvedReadings.find(([ candidate ]) => candidate === identity)?.[1];
const makeHero = () => createHeroWithClass(censor, 3, FactoryLogic.createCharacteristics(2, 0, 0, 0, 2));

const extractLiveAbilityFields = (ability: Ability): Record<string, string> => {
	const section = ability.sections?.[0];
	if (!section || (section.type !== 'text')) {
		throw new Error(`Censor ability '${ability.id}' text section is missing`);
	}
	return {
		[elementFieldIdentity(ability.id, 'name')]: ability.name,
		[elementFieldIdentity(ability.id, 'target')]: ability.target,
		[elementFieldIdentity(ability.id, 'description')]: ability.description,
		[elementFieldIdentity(ability.id, 'sections.0.text')]: section.text
	};
};

afterEach(cleanup);

describe('V1 Core Censor L3 manifest, catalog and presentation', () => {
	it('matches the independent bounded 19-identity live slice and exact approved catalog readings', () => {
		const independentLive = { ...extractLiveBoundedNonAbilityFeatureFields(levelThreeFeatures) };
		abilities.forEach(ability => Object.assign(independentLive, extractLiveAbilityFields(ability)));
		const approvedIdentities = approvedReadings.map(([ identity ]) => identity).sort();

		expect(Object.keys(independentLive).sort()).toEqual(approvedIdentities);
		expect(Object.keys(required).sort()).toEqual(approvedIdentities);
		expect(required).toEqual(independentLive);
		expect(v1CensorLevel3AbilityIDs).toEqual([ 'censor-ability-13', 'censor-ability-14', 'censor-ability-15', 'censor-ability-16' ]);
		expect(abilities.map(ability => ability.id)).toEqual([ ...v1CensorLevel3AbilityIDs ]);
		expect(abilities.every(ability => ability.cost === 7)).toBe(true);
		expect(Object.keys(required).some(identity => /censor-(?:[4-9]-|ability-(?:1[7-9]|[2-9]\d))/.test(identity))).toBe(false);

		expect(catalogEntries).toHaveLength(19);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(approvedIdentities);
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		approvedReadings.forEach(([ identity, zhTW ]) => expect(catalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW).toBe(zhTW));
		expect(verifyApprovedTranslationsAgainstCatalog({
			approvedTranslations: approvedReadings.map(([ identity, zhTW ]) => ({ identity, zhTW })),
			catalogEntries
		})).toMatchObject({ approvedRecordCount: 19, catalogEntryCount: 19, reconciledCount: 19, issues: [] });
		expect(catalogEntries.filter(entry => entry.zhTW.includes('\uFFFD'))).toEqual([]);
	});

	it('keeps catalog integrity green while the parent Censor domains stay unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'class-and-subclass-level-content',
			'official-ability-authored-content'
		]));
	});

	it('renders the calculated Censor Feature in both contexts and restores canonical English without mutation', () => {
		const feature = getFeature('censor-3-1');
		const hero = makeHero();
		const protectedFeature = protectCanonicalState({ label: 'Censor Level 3 Feature', capture: () => JSON.stringify(feature) });
		const protectedHero = protectCanonicalState({ label: 'Censor Level 3 Hero', capture: () => JSON.stringify(hero) });
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const noHero = renderFeature(feature);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedFeature ],
			assertZhTW: () => {
				expectRendered(noHero.container, '目標的氣場 < [中]');
				expectRendered(noHero.container, '陷入畏縮');
				expectRendered(noHero.container, '等於你氣場 ×2 的神聖傷害');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(noHero.container, 'twice your Presence score'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(noHero.container, '目標的氣場 < [強]')
		});
		noHero.unmount();

		const heroPanel = renderFeature(feature, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedFeature, protectedHero ],
			assertZhTW: () => {
				expectRendered(heroPanel.container, '目標的氣場 < 1');
				expectRendered(heroPanel.container, '新目標的氣場 < 2');
				expectRendered(heroPanel.container, '受到 4 點神聖傷害');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(heroPanel.container, 'holy damage equal to 4.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(heroPanel.container, '受到 4 點神聖傷害')
		});
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('projects Censor Feature potency across the reachable negative and non-negative calculator formats', () => {
		const feature = getFeature('censor-3-1');
		const canonicalEnglish = required[elementFieldIdentity(feature.id, 'description')];
		const hero = createHeroWithClass(censor, 3, FactoryLogic.createCharacteristics(0, 0, 0, 0, 0));
		const protectedFeature = protectCanonicalState({ label: 'Censor Level 3 negative-potency Feature', capture: () => JSON.stringify(feature) });
		const protectedHero = protectCanonicalState({ label: 'Censor Level 3 negative-potency Hero', capture: () => JSON.stringify(hero) });

		expect(HeroLogic.getPotency(hero, 'average')).toBe(-1);
		expect(HeroLogic.getPotency(hero, 'strong')).toBe(0);
		const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		expect(calculatedEnglish).toContain('P < -1');
		expect(calculatedEnglish).not.toContain('`P < -1`');
		expect(calculatedEnglish).toContain('`P < 0`');

		const panel = renderFeature(feature, hero);
		expectRendered(panel.container, '目標的氣場 < -1');
		expectRendered(panel.container, '新目標的氣場 < 0');
		expectRendered(panel.container, '受到 0 點神聖傷害');
		expectRendered(panel.container, '陷入畏縮');
		protectedFeature.assertUnchanged();
		protectedHero.assertUnchanged();
	});

	it.each([
		{ id: 'censor-ability-13', name: '隔絕律令', damage: 2, heroText: '每個目標會在你每回合結束時受到 2 點神聖傷害' },
		{ id: 'censor-ability-14', name: '肅正律令', damage: 6, heroText: '目標會受到 6 點神聖傷害' },
		{ id: 'censor-ability-15', name: '止戰律令', damage: 4, heroText: '目標會受到 4 點神聖傷害' },
		{ id: 'censor-ability-16', name: '禁錮律令', damage: 4, heroText: '目標會受到 4 點神聖傷害' }
	])('keeps $id canonical-English-first across no-Hero and Hero AbilityPanel surfaces', ({ id, name, damage, heroText }) => {
		const ability = getAbility(id);
		const identity = elementFieldIdentity(id, 'sections.0.text');
		const canonicalEnglish = required[identity];
		const rawZhTW = approvedZhTW(identity);
		const hero = makeHero();
		const protectedAbility = protectCanonicalState({ label: `${id} canonical Ability`, capture: () => JSON.stringify(ability) });
		const protectedHero = protectCanonicalState({ label: `${id} Hero`, capture: () => JSON.stringify(hero) });
		assertCanonicalEnglishCalculationInput(canonicalEnglish);

		const noHeroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, undefined);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field: 'sections.0.text', canonicalEnglish, calculatedEnglish: noHeroCalculated })).toBe(rawZhTW);
		const noHeroPanel = renderAbility(ability);
		expectRendered(noHeroPanel.container, name);
		expectRendered(noHeroPanel.container, rawZhTW?.replace(/`/g, '') || '');
		noHeroPanel.unmount();

		const heroCalculated = AbilityLogic.getTextEffect(canonicalEnglish, hero);
		expect(heroCalculated).toContain(`equal to ${damage}`);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field: 'sections.0.text', canonicalEnglish, calculatedEnglish: heroCalculated })).toContain(heroText);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'en', elementID: id, field: 'sections.0.text', canonicalEnglish, calculatedEnglish: heroCalculated })).toBe(heroCalculated);

		const heroPanel = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedAbility, protectedHero ],
			assertZhTW: () => expectRendered(heroPanel.container, heroText),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(heroPanel.container, `equal to ${damage}`),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(heroPanel.container, heroText)
		});
	});

	it('fails closed on an unsupported structural calculated delta', () => {
		const feature = getFeature('censor-3-1');
		const canonicalEnglish = required[elementFieldIdentity(feature.id, 'description')];
		const unsupported = `${AbilityLogic.getTextEffect(canonicalEnglish, makeHero())} They also fall prone.`;
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: feature.id,
			field: 'description',
			canonicalEnglish,
			calculatedEnglish: unsupported
		})).toBe(unsupported);
	});
});
