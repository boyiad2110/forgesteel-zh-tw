// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { FeatureType } from '@/enums/feature-type';
import { elementalist } from '@/data/classes/elementalist/elementalist';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ElementalistLevel1RemainingRequiredCanonicalEnglish, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { createHeroWithClass, levelOneFeatures, renderFeaturePanel, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import { FactoryLogic } from '@/logic/factory-logic';
import { AbilityLogic } from '@/logic/ability-logic';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const elementalistLevelOneFeatures = levelOneFeatures(elementalist);
const liveFields = extractLiveBoundedNonAbilityFeatureFields(elementalistLevelOneFeatures);
const required = createV1ElementalistLevel1RemainingRequiredCanonicalEnglish();
const elementalistCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const getFeature = (id: string) => {
	const feature = elementalistLevelOneFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Elementalist Feature '${id}' is missing`);
	}
	return feature;
};

const makeHero = () => createHeroWithClass(elementalist, 1, FactoryLogic.createCharacteristics(0, 0, 2, 0, 0));

const approvedPersistentMagicThresholdZhTW = '若你在 1 個回合內受到的傷害 ≧ 你的理智 ×5，你會停止維持所有續發型招式。';
const calculatedPersistentMagicThresholdZhTW = '若你在 1 個回合內受到的傷害 ≧ 10，你會停止維持所有續發型招式。';

const expectEssenceZhTW = (container: HTMLElement) => {
	expect(container.textContent).toContain('精髓');
	expect(container.textContent).toContain('每當你的回合開始時');
	expect(container.textContent).toContain('每輪中，當你自己或 10 格內的 1 個生物首次受到無類型或神聖以外的傷害時');
};

const expectEssenceEnglish = (container: HTMLElement) => {
	expect(container.textContent).toContain('Essence');
	expect(container.textContent).toContain('Start of your turn');
	expect(container.textContent).toContain('The first time in a round that you or a creature within 10 of you takes damage that isn’t untyped or holy');
};

afterEach(cleanup);

describe('V1 Core Elementalist L1 remaining catalog and presentation', () => {
	// The live slice is extracted by an independent test-side walk of Elementalist's own
	// canonical Level 1 roots, so this compares the manifest against canonical data rather than
	// against the manifest's own traversal.
	it('matches the independent live Elementalist Level 1 non-Ability slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(44);
		expect(Object.keys(required)).toHaveLength(44);
		expect(Object.keys(required).sort()).toEqual(Object.keys(liveFields).sort());
		expect(required).toEqual(liveFields);
	});

	it('adds exactly the approved non-Ability manifest and catalog slice', () => {
		expect(Object.keys(required)).toHaveLength(44);
		expect(elementalistCatalogEntries).toHaveLength(44);
		expect(elementalistCatalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(elementalistCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(elementalistCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		[ 'elementalist-1-4', 'elementalist-1-6', 'elementalist-1-8c', 'elementalist-1-8d', 'elementalist-ability-1' ].forEach(abilityID => {
			expect(Object.keys(required)).not.toContain(elementFieldIdentity(abilityID, 'name'));
			expect(Object.keys(required)).not.toContain(elementFieldIdentity(abilityID, 'description'));
		});

		const zhTWOf = (identity: string) => elementalistCatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;
		expect(zhTWOf('element:elementalist-resource/gains.1.trigger')).toBe('每輪中，當你自己或 10 格內的 1 個生物首次受到無類型或神聖以外的傷害時');
		expect(zhTWOf('element:elementalist-1-7/name')).toBe('附魔');
		expect(zhTWOf('element:elementalist-1-8a/description')).toContain('虛冥魔法');
		expect(zhTWOf('element:elementalist-1-5/description')).toContain('1 個生物不能同時受到多個相同續發效果的影響。');
	});

	it('keeps the catalog complete and the class-level domain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('renders Essence and both gain triggers through no-Hero and Hero paths without changing canonical state', () => {
		const essence = getFeature('elementalist-resource');
		if (essence.type !== FeatureType.HeroicResource) {
			throw new Error('Essence is not a Heroic Resource');
		}

		const noHero = renderFeaturePanel(essence);
		expectEssenceZhTW(noHero.container);
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeaturePanel(essence, { hero });
		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Essence Feature', capture: () => JSON.stringify(essence) }),
				protectCanonicalState({ label: 'Elementalist Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => expectEssenceZhTW(withHero.container),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectEssenceEnglish(withHero.container),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectEssenceZhTW(withHero.container)
		});
		expect(essence.data.gains).toEqual([
			{ tag: 'start', trigger: 'Start of your turn', value: '2' },
			{ tag: 'take-damage', trigger: 'The first time in a round that you or a creature within 10 of you takes damage that isn’t untyped or holy', value: '1' }
		]);
	});

	it('projects only the calculated Persistent Magic threshold into the approved zh-TW', () => {
		const persistentMagic = getFeature('elementalist-1-5');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const noHero = renderFeaturePanel(persistentMagic);
		expect(noHero.container.textContent).toContain('續發魔法');
		expect(noHero.container.textContent).toContain(approvedPersistentMagicThresholdZhTW);
		expect(noHero.container.textContent).not.toContain('傷害 ≧ 10');
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeaturePanel(persistentMagic, { hero });
		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Persistent Magic Feature', capture: () => JSON.stringify(persistentMagic) }),
				protectCanonicalState({ label: 'Elementalist Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				expect(withHero.container.textContent).toContain('續發魔法');
				expect(withHero.container.textContent).toContain(calculatedPersistentMagicThresholdZhTW);
				expect(withHero.container.textContent).toContain('1 個生物不能同時受到多個相同續發效果的影響。');
				expect(withHero.container.textContent).not.toContain('equal to or greater than');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(withHero.container.textContent).toContain('equal to or greater than 10');
				expect(withHero.container.textContent).not.toContain('續發魔法');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expect(withHero.container.textContent).toContain(calculatedPersistentMagicThresholdZhTW)
		});

		expect(getTextEffect.mock.calls.map(([ input ]) => input)).toContain(persistentMagic.description);
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('returns to the approved raw zh-TW when auto-calc is switched off', () => {
		const persistentMagic = getFeature('elementalist-1-5');
		const withHero = renderFeaturePanel(persistentMagic, { hero: makeHero() });

		expect(withHero.container.textContent).toContain(calculatedPersistentMagicThresholdZhTW);
		fireEvent.click(screen.getByTitle('Auto-calculate damage, potency, etc'));
		expect(withHero.container.textContent).toContain(approvedPersistentMagicThresholdZhTW);
		expect(withHero.container.textContent).not.toContain('傷害 ≧ 10');
	});
});
