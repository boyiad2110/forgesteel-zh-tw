// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { FeatureType } from '@/enums/feature-type';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { PanelMode } from '@/enums/panel-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { Feature } from '@/models/feature';
import { core } from '@/data/sourcebooks/official/core';
import { shadow } from '@/data/classes/shadow/shadow';
import { ElementFieldEntry, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ShadowLevel1AbilityRequiredCanonicalEnglish, createV1ShadowLevel1CompletionRequiredCanonicalEnglish, getV1ShadowColleges, v1LocalizationManifest, v1ShadowCollegeIDs } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { elementFieldIdentity } from '@/localization/catalog';
import { localizeElementField } from '@/localization/resolver';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

const levelOneFeatures = (owner: { featuresByLevel: { level: number, features: Feature[] }[] }) => owner.featuresByLevel.find(level => level.level === 1)?.features || [];
const shadowLevelOne = levelOneFeatures(shadow);
const colleges = getV1ShadowColleges();
const required = createV1ShadowLevel1CompletionRequiredCanonicalEnglish();
const existingAbilityRequired = createV1ShadowLevel1AbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => entry.kind === 'element-field' && (required[getEntryIdentity(entry)] !== undefined));

const getFeature = (features: Feature[], id: string) => {
	const feature = features.find(candidate => candidate.id === id);
	if (!feature) throw new Error(`Shadow Feature '${id}' is missing`);
	return feature;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...shadow, level: 1, characteristics: FactoryLogic.createCharacteristics(0, 2, 0, 0, 0) };
	return hero;
};

const renderFeature = (feature: Feature, hero?: Hero) => render(createElement(LocalizationProvider, null,
	createElement(LocaleToggle), createElement(FeaturePanel, { feature, hero, mode: PanelMode.Full, sourcebooks: [ core ] })
));
const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

afterEach(cleanup);

describe('V1 Core Shadow Level 1 completion catalog and presentation', () => {
	it('adds the exact bounded 66-identity manifest and catalog slice without overlapping the approved base Ability slice', () => {
		const independentlyWalkedBase = extractLiveBoundedNonAbilityFeatureFields(shadowLevelOne);
		expect(v1ShadowCollegeIDs).toEqual([ 'shadow-sub-1', 'shadow-sub-2', 'shadow-sub-3' ]);
		expect(Object.keys(required)).toHaveLength(66);
		expect(Object.keys(catalogEntries)).toHaveLength(66);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved' && entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(required[elementFieldIdentity('shadow-resource', 'details')]).toBe(getFeature(shadowLevelOne, 'shadow-resource').data.details);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingAbilityRequired, identity))).toBe(false);
		expect(Object.keys(independentlyWalkedBase).every(identity => required[identity] === independentlyWalkedBase[identity])).toBe(true);
		expect(Object.keys(required).some(identity => /shadow-(?:2|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
	});

	it('keeps completeness healthy while the parent class domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('resolves the Shadow class and renders every College Level 1 ability through the approved zh-TW catalog', () => {
		expect(localizeElementField('zh-TW', shadow.id, 'subclassName', shadow.subclassName)).toBe('影舞學院');
		colleges.forEach(college => {
			expect(localizeElementField('zh-TW', college.id, 'name', college.name)).toBe(catalogEntries.find(entry => getEntryIdentity(entry) === elementFieldIdentity(college.id, 'name'))?.zhTW);
			expect(localizeElementField('zh-TW', college.id, 'description', college.description)).toBe(catalogEntries.find(entry => getEntryIdentity(entry) === elementFieldIdentity(college.id, 'description'))?.zhTW);
			levelOneFeatures(college).filter(feature => feature.type === FeatureType.Ability).forEach(feature => {
				const ability = feature.data.ability;
				const panel = renderFeature(feature);
				expect(panel.container.textContent).toContain(catalogEntries.find(entry => getEntryIdentity(entry) === elementFieldIdentity(ability.id, 'name'))?.zhTW);
				expect(panel.container.textContent).toContain(catalogEntries.find(entry => getEntryIdentity(entry) === elementFieldIdentity(ability.id, 'description'))?.zhTW);
				panel.unmount();
			});
		});
	});

	it('renders Insight details on no-Hero and Hero paths without mutating canonical state', () => {
		const insight = getFeature(shadowLevelOne, 'shadow-resource');
		if (insight.type !== FeatureType.HeroicResource) throw new Error('Insight is not a Heroic Resource');
		const noHero = renderFeature(insight);
		expect(noHero.container.textContent).toContain('若你的檢定帶有優勢，該招式的洞察費用會減少 1 點。');
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeature(insight, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Insight Feature', capture: () => JSON.stringify(insight) }), protectCanonicalState({ label: 'Shadow Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expect(withHero.container.textContent).toContain('即使只對其中 1 個目標帶有優勢，費用仍然會減少 1 點。'),
			switchToEnglish: switchLocale,
			assertEnglish: () => expect(withHero.container.textContent).toContain('If the ability has multiple targets'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expect(withHero.container.textContent).toContain('該招式的洞察費用會減少 1 點。')
		});
	});

	it('keeps Smoke Bomb raw without a Hero and projects only canonical calculated Agility with a Hero', () => {
		const smokeBomb = getFeature(levelOneFeatures(colleges[1]), 'shadow-sub-2-1-3');
		const noHero = renderFeature(smokeBomb);
		expect(noHero.container.textContent).toContain('遁移等於敏捷的格數。');
		noHero.unmount();

		const hero = makeHero();
		const calculated = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderFeature(smokeBomb, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Smoke Bomb Feature', capture: () => JSON.stringify(smokeBomb) }), protectCanonicalState({ label: 'Shadow Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expect(withHero.container.textContent).toContain('遁移 2 格。'),
			switchToEnglish: switchLocale,
			assertEnglish: () => expect(withHero.container.textContent).toContain('shift a number of squares equal to 2'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expect(withHero.container.textContent).toContain('遁移 2 格。')
		});
		calculated.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		calculated.mockRestore();
	});
});
