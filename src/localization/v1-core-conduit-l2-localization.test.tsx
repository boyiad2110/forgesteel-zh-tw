// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ConduitLevel2RequiredCanonicalEnglish, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, normalizedText, readFieldByExactLabel, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { Feature } from '@/models/feature';
import { conduit } from '@/data/classes/conduit/conduit';
import { creation } from '@/data/domains/creation';
import { core } from '@/data/sourcebooks/official/core';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

installResizeObserverStub();

/**
 * The Conduit's Level 2 roots, read here by the test's own level lookup rather than through the
 * manifest's accessor. Together with the independent bounded walk below this keeps the expected
 * identity set from being produced by the same extraction path as the production manifest slice,
 * so a traversal or level-selection regression cannot pass by agreeing with itself.
 */
const levelTwoFeatures = conduit.featuresByLevel.find(level => level.level === 2)?.features || [];

const liveFields = extractLiveBoundedNonAbilityFeatureFields(levelTwoFeatures);
const required = createV1ConduitLevel2RequiredCanonicalEnglish();

const conduitLevel2CatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const { renderFeature, renderClassPanel } = createClassPresentationHarness(conduit, [ core ]);

/** Selects one of a panel's segmented pages by its rendered label. */
const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const getFeature = (id: string) => {
	const feature = levelTwoFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Conduit Level 2 Feature '${id}' is missing`);
	}
	return feature;
};

const makeHero = () => createHeroWithClass(conduit, 2, FactoryLogic.createCharacteristics(0, 0, 0, 2, 0));

const zhTWOf = (identity: string) => conduitLevel2CatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;

afterEach(cleanup);

describe('V1 Core Conduit L2 manifest, catalog and presentation', () => {
	it('matches the independent live Conduit Level 2 slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(7);
		expect(Object.keys(required)).toHaveLength(7);
		expect(Object.keys(required).sort()).toEqual(Object.keys(liveFields).sort());
		expect(required).toEqual(liveFields);

		// The four Level 2 roots contribute four names and only three descriptions: the Perk
		// choice carries no description of its own, so no empty identity is invented for it.
		expect(Object.keys(required).sort()).toEqual([
			'element:conduit-2-1/description',
			'element:conduit-2-1/name',
			'element:conduit-2-2/name',
			'element:conduit-2-3/description',
			'element:conduit-2-3/name',
			'element:conduit-2-4/description',
			'element:conduit-2-4/name'
		]);
		expect(required[elementFieldIdentity('conduit-2-2', 'description')]).toBeUndefined();
		expect(getFeature('conduit-2-2').description).toBe('');
	});

	it('records the factory-composed canonical readings exactly as the factory produces them', () => {
		// Both of these are Feature-factory output, not authored prose. The Level 2 Domain
		// Ability's default description stays 'Choose a level 2 domain feature.' even though the
		// Feature is named '2nd-Level Domain Ability'; canonical data is not reshaped to make the
		// two read symmetrically.
		expect(required[elementFieldIdentity('conduit-2-2', 'name')]).toBe('Crafting / Lore / Supernatural Perk');
		expect(required[elementFieldIdentity('conduit-2-4', 'name')]).toBe('2nd-Level Domain Ability');
		expect(required[elementFieldIdentity('conduit-2-4', 'description')]).toBe('Choose a level 2 domain feature.');

		// The typographic apostrophe in 'didn’t' is part of the canonical value.
		expect(required[elementFieldIdentity('conduit-2-3', 'description')]).toContain('didn’t take at that level.');
	});

	it('adds exactly the seven approved catalog entries and registers them in the live manifest', () => {
		expect(conduitLevel2CatalogEntries).toHaveLength(7);
		expect(conduitLevel2CatalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(conduitLevel2CatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(conduitLevel2CatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		expect(zhTWOf('element:conduit-2-1/name')).toBe('天界名冊');
		expect(zhTWOf('element:conduit-2-1/description')).toBe('你的神明注意到你日益增長的影響力，讓你在治療盟友時更容易引導祂的力量。每當你讓其他生物花費 1 點復元力時，你自己也可以花費 1 點復元力。');
		expect(zhTWOf('element:conduit-2-2/name')).toBe('工藝類 / 學識類 / 超常類專長');
		expect(zhTWOf('element:conduit-2-3/name')).toBe('2 級領域特性');
		expect(zhTWOf('element:conduit-2-3/description')).toBe('你獲得你在 1 級時沒有選擇的另 1 個 1 級領域特性，並為該領域選擇 1 項技能。');
		expect(zhTWOf('element:conduit-2-4/name')).toBe('2 級領域招式');
		expect(zhTWOf('element:conduit-2-4/description')).toBe('選擇 1 個 2 級領域特性。');

		// The slice this batch adds is the delta the live manifest now carries, asserted as a
		// delta rather than against a global requiredCount this batch does not own.
		Object.entries(required).forEach(([ identity, canonicalEnglish ]) => {
			expect(v1LocalizationManifest.requiredCanonicalEnglish[identity]).toBe(canonicalEnglish);
		});
	});

	it('does not duplicate or rewrite the already-approved Domain translations', () => {
		expect(conduitLevel2CatalogEntries.some(entry => entry.elementID.startsWith('domain-'))).toBe(false);
	});

	it('keeps the catalog complete while class level content stays unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		// Conduit Level 2 being complete does not close the domain: Conduit Level 3+ and every
		// other class's level content are still outside the denominator.
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('reads all four Level 2 features in zh-TW and back in canonical English without mutating canonical data', () => {
		// Each Feature is taken through the full zh-TW -> English -> zh-TW sequence on its own
		// panel, so a reading that only survives the first render, or an English value that never
		// comes back, is caught per identity rather than hidden behind a shared container.
		const readings: { id: string, zhTW: string[], english: string[] }[] = [
			{
				id: 'conduit-2-1',
				zhTW: [ '天界名冊', '每當你讓其他生物花費 1 點復元力時，你自己也可以花費 1 點復元力。' ],
				english: [ 'The Lists of Heaven', 'Whenever you allow another creature to spend a Recovery, you can also spend a Recovery.' ]
			},
			{
				id: 'conduit-2-2',
				zhTW: [ '工藝類 / 學識類 / 超常類專長' ],
				english: [ 'Crafting / Lore / Supernatural Perk' ]
			},
			{
				id: 'conduit-2-3',
				zhTW: [ '2 級領域特性', '你獲得你在 1 級時沒有選擇的另 1 個 1 級領域特性，並為該領域選擇 1 項技能。' ],
				english: [ '2nd-Level Domain Feature', 'didn’t take at that level.' ]
			},
			{
				id: 'conduit-2-4',
				zhTW: [ '2 級領域招式', '選擇 1 個 2 級領域特性。' ],
				english: [ '2nd-Level Domain Ability', 'Choose a level 2 domain feature.' ]
			}
		];

		readings.forEach(reading => {
			const protectedFeatures = protectCanonicalState({
				label: `Conduit Level 2 canonical Feature data (${reading.id})`,
				capture: () => JSON.stringify(levelTwoFeatures)
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

	it('renders the Hero-context path without a calculated transform reaching the Conduit Level 2 fields', () => {
		const hero = makeHero();

		// Defense in depth for the Calculated Path Discovery result: only a FeatureType.Text
		// description is ever routed through AbilityLogic by FeaturePanel, and the one Text
		// feature here produces no calculation delta, so none of the seven identities needs a
		// calculated zh-TW grammar.
		levelTwoFeatures.forEach(feature => {
			assertCanonicalEnglishCalculationInput(feature.description);
			expect(AbilityLogic.getTextEffect(feature.description, hero)).toBe(feature.description);
			expect(AbilityLogic.getTextEffect(feature.description, undefined)).toBe(feature.description);
		});
		expect(levelTwoFeatures.filter(feature => feature.type === FeatureType.Text).map(feature => feature.id)).toEqual([ 'conduit-2-1' ]);

		const serialized = JSON.stringify(levelTwoFeatures);
		const { container } = renderFeature(getFeature('conduit-2-1'), hero);
		expectRendered(container, '天界名冊');
		expectRendered(container, '每當你讓其他生物花費 1 點復元力時');
		expect(JSON.stringify(levelTwoFeatures)).toBe(serialized);
	});

	it('delegates a selected Domain feature to its already-approved Domain translation', () => {
		const domainFeature = getFeature('conduit-2-3');
		if (domainFeature.type !== FeatureType.DomainFeature) {
			throw new Error('conduit-2-3 is not a Domain Feature choice');
		}

		const selected = creation.featuresByLevel.find(level => level.level === 1)?.features[0];
		if (!selected) {
			throw new Error('Creation domain Level 1 feature is missing');
		}

		const selectedID = selected.id;
		const withSelection: Feature = { ...domainFeature, data: { ...domainFeature.data, selected: [ selected ] } };
		const serialized = JSON.stringify(levelTwoFeatures);

		const { container } = renderFeature(withSelection);

		expectRendered(container, '2 級領域特性');
		// The delegated reading comes from the Core Domain slice this batch does not touch.
		expectRendered(container, '造物之手、工藝類技能');

		switchLocale();
		expectRendered(container, '2nd-Level Domain Feature');
		expectRendered(container, 'Hands Of The Maker, Crafting Skill');

		// Locale switching leaves the Domain selection addressed by its canonical Feature ID.
		expect(selectedID).toBe('domain-creation-1');
		expect(selected.id).toBe('domain-creation-1');
		expect(JSON.stringify(levelTwoFeatures)).toBe(serialized);
	});

	it('reads the Conduit Level 1 and Level 2 progression together in the class panel', () => {
		const hero = makeHero();
		const serialized = JSON.stringify(conduit);
		const { container } = renderClassPanel(hero);

		clickPage(container, '特性');

		// The Level 1 summary is the earlier Conduit slice's already-approved reading; the Level 2
		// summary is this batch's. Reading them from the same rendered progression is the minimum
		// useful evidence that the Level 1 -> 2 player content is continuous in zh-TW.
		const levelOneSummary = readFieldByExactLabel(container, '1 級');
		const levelTwoSummary = readFieldByExactLabel(container, '2 級');

		expect(levelOneSummary).toContain('虔誠');
		expect(levelTwoSummary).toContain('天界名冊');
		expect(levelTwoSummary).toContain('工藝類 / 學識類 / 超常類專長');
		expect(levelTwoSummary).toContain('2 級領域特性');
		expect(levelTwoSummary).toContain('2 級領域招式');
		expect(levelTwoSummary).not.toContain('The Lists of Heaven');

		switchLocale();

		expect(readFieldByExactLabel(container, 'Level 1')).toContain('Piety');
		const englishLevelTwo = readFieldByExactLabel(container, 'Level 2');
		expect(englishLevelTwo).toContain('The Lists of Heaven');
		expect(englishLevelTwo).toContain('Crafting / Lore / Supernatural Perk');
		expect(englishLevelTwo).toContain('2nd-Level Domain Feature');
		expect(englishLevelTwo).toContain('2nd-Level Domain Ability');
		expect(JSON.stringify(conduit)).toBe(serialized);
	});
});
