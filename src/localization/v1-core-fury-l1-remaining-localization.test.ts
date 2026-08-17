// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { FeatureType } from '@/enums/feature-type';
import { PanelMode } from '@/enums/panel-mode';
import { fury } from '@/data/classes/fury/fury';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1FuryLevel1RemainingRequiredCanonicalEnglish, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { FactoryLogic } from '@/logic/factory-logic';
import { AbilityLogic } from '@/logic/ability-logic';
import { Feature } from '@/models/feature';
import { Hero } from '@/models/hero';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const furyLevelOneFeatures = fury.featuresByLevel.find(level => level.level === 1)?.features || [];
const liveFields = extractLiveBoundedNonAbilityFeatureFields(furyLevelOneFeatures);
const required = createV1FuryLevel1RemainingRequiredCanonicalEnglish();
const furyCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const getFeature = (id: string) => {
	const feature = furyLevelOneFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Fury Feature '${id}' is missing`);
	}
	return feature;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...fury, level: 1, characteristics: FactoryLogic.createCharacteristics(2, 0, 0, 0, 0) };
	return hero;
};

const renderFeature = (feature: Feature, hero?: Hero) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(FeaturePanel, { feature, hero, mode: PanelMode.Full })
	)
);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const expectFerocityZhTW = (container: HTMLElement) => {
	expect(container.textContent).toContain('狠勁');
	expect(container.textContent).toContain('每當你的回合開始時');
	expect(container.textContent).toContain('每輪中，當你首次受到傷害時');
	expect(container.textContent).toContain('每場遭遇中，當你首次陷入疲態或瀕死時');
};

const expectFerocityEnglish = (container: HTMLElement) => {
	expect(container.textContent).toContain('Ferocity');
	expect(container.textContent).toContain('Start of your turn');
	expect(container.textContent).toContain('The first time each combat round that you take damage');
	expect(container.textContent).toContain('The first time you become winded or are dying in an encounter');
};

afterEach(cleanup);

describe('V1 Core Fury L1 remaining catalog and presentation', () => {
	// The live slice is extracted by an independent test-side walk of Fury's own canonical
	// Level 1 roots, so this compares the manifest against canonical data rather than against
	// the manifest's own traversal.
	it('matches the independent live Fury Level 1 non-Ability slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(15);
		expect(Object.keys(required)).toHaveLength(15);
		expect(Object.keys(required).sort()).toEqual(Object.keys(liveFields).sort());
		expect(required).toEqual(liveFields);
	});

	it('adds exactly the approved non-Ability manifest and catalog slice', () => {
		expect(Object.keys(required)).toHaveLength(15);
		expect(furyCatalogEntries).toHaveLength(15);
		expect(furyCatalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(furyCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(furyCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(Object.keys(required)).not.toContain(elementFieldIdentity('fury-ability-1', 'name'));
		expect(furyCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:fury-resource/gains.1.trigger')?.zhTW).toBe('每輪中，當你首次受到傷害時');
		expect(furyCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:fury-1-4/description')?.zhTW).toBe('當你進行跳躍的`力量`考驗時，結果不會低於 T2。');
	});

	it('keeps the catalog complete and the class-level domain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('renders Ferocity and all three gain triggers through no-Hero and Hero paths without changing canonical state', () => {
		const ferocity = getFeature('fury-resource');
		if (ferocity.type !== FeatureType.HeroicResource) {
			throw new Error('Ferocity is not a Heroic Resource');
		}

		const noHero = renderFeature(ferocity);
		expectFerocityZhTW(noHero.container);
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeature(ferocity, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Ferocity Feature', capture: () => JSON.stringify(ferocity) }),
				protectCanonicalState({ label: 'Fury Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => expectFerocityZhTW(withHero.container),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectFerocityEnglish(withHero.container),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectFerocityZhTW(withHero.container)
		});
		expect(ferocity.data.gains).toEqual([
			{ tag: 'start', trigger: 'Start of your turn', value: '1d3' },
			{ tag: 'take-damage', trigger: 'The first time each combat round that you take damage', value: '1' },
			{ tag: 'winded', trigger: 'The first time you become winded or are dying in an encounter', value: '1d3' }
		]);
	});

	it('keeps Mighty Leaps localized with a Hero when canonical calculation has no delta', () => {
		const mightyLeaps = getFeature('fury-1-4');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const noHero = renderFeature(mightyLeaps);
		expect(noHero.container.textContent).toContain('強力飛躍');
		expect(noHero.container.textContent).toContain('當你進行跳躍的力量考驗時，結果不會低於 T2。');
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeature(mightyLeaps, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Mighty Leaps Feature', capture: () => JSON.stringify(mightyLeaps) }),
				protectCanonicalState({ label: 'Fury Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				expect(withHero.container.textContent).toContain('強力飛躍');
				expect(withHero.container.textContent).toContain('當你進行跳躍的力量考驗時，結果不會低於 T2。');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expect(withHero.container.textContent).toContain('You can’t obtain lower than a tier 2 outcome on any Might test made to jump.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expect(withHero.container.textContent).toContain('當你進行跳躍的力量考驗時，結果不會低於 T2。')
		});
		expect(getTextEffect.mock.calls.map(([ input ]) => input)).toContain(mightyLeaps.description);
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});
});
