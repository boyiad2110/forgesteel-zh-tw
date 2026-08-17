// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { ConfigChoice } from '@/components/features/feature-data/choice';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { FeatureType } from '@/enums/feature-type';
import { PanelMode } from '@/enums/panel-mode';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ConduitLevel1RemainingRequiredCanonicalEnglish, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { FactoryLogic } from '@/logic/factory-logic';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { conduit } from '@/data/classes/conduit/conduit';
import { Feature } from '@/models/feature';
import { Hero } from '@/models/hero';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const conduitLevelOneFeatures = conduit.featuresByLevel.find(level => level.level === 1)?.features || [];
const liveFields = extractLiveBoundedNonAbilityFeatureFields(conduitLevelOneFeatures);
const required = createV1ConduitLevel1RemainingRequiredCanonicalEnglish();
const conduitCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const getFeature = (id: string) => {
	const feature = conduitLevelOneFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Conduit Feature '${id}' is missing`);
	}
	return feature;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...conduit, level: 3, characteristics: FactoryLogic.createCharacteristics(0, 0, 0, 2, 0) };
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

afterEach(cleanup);

describe('V1 Core Conduit L1 remaining catalog and presentation', () => {
	// The live slice is extracted by an independent test-side walk of Conduit's own canonical
	// Level 1 roots, so this compares the manifest against canonical data rather than against
	// the manifest's own traversal. It also keeps the generated and whitespace-sensitive
	// canonical values under exact comparison, not just their identities.
	it('matches the independent live Conduit Level 1 non-Ability slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(42);
		expect(Object.keys(required)).toHaveLength(42);
		expect(Object.keys(required).sort()).toEqual(Object.keys(liveFields).sort());
		expect(required).toEqual(liveFields);
	});

	it('adds exactly the approved 42-record manifest and catalog slice without overlapping the authored Ability slice', () => {
		expect(Object.keys(required)).toHaveLength(42);
		expect(conduitCatalogEntries).toHaveLength(42);
		expect(conduitCatalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(conduitCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(conduitCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(required[elementFieldIdentity('conduit-1-3b', 'description')].startsWith('\n')).toBe(true);
		expect(required[elementFieldIdentity('conduit-1-8c', 'description')]).toContain('wield\na light weapon');
		expect(conduitCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:conduit-1-3b/name')?.zhTW).toBe('祈禱');
		expect(conduitCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:conduit-1-8/name')?.zhTW).toBe('禱詞');
		expect(conduitCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:conduit-1-9d/description')?.zhTW).toBe('無形的靈體會在你受到傷害時環繞在你身邊。每當 1 個相鄰的生物對你造成傷害時，他會受到等於你`直覺`的腐朽傷害。');
	});

	it('records exactly the approved reusable glossary delta and no global Prayer mapping', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^(Ward|Proficiency|Ability damage modifier|Prayer),/.test(row))).toEqual([
			'Ward,護咒,game-term,approved',
			'Proficiency,熟練項目,game-term,approved',
			'Ability damage modifier,招式傷害調整,game-term,approved'
		]);
	});

	it('keeps the catalog complete and the parent class-level domain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('renders context-specific Prayers, nested Choice/Multiple children, and canonical English without mutating Feature data', () => {
		const packageFeature = getFeature('conduit-1-3b');
		const packageSerialized = JSON.stringify(packageFeature);
		const packagePanel = renderFeature(packageFeature);
		expect(packagePanel.container.textContent).toContain('祈禱');
		expect(packagePanel.container.textContent).not.toContain('Prayer');
		fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
		expect(packagePanel.container.textContent).toContain('Prayer');
		expect(JSON.stringify(packageFeature)).toBe(packageSerialized);
		packagePanel.unmount();

		const prayerChoice = getFeature('conduit-1-8');
		const choiceSerialized = JSON.stringify(prayerChoice);
		const choicePanel = renderFeature(prayerChoice);
		expect(choicePanel.container.textContent).toContain('禱詞');
		expect(choicePanel.container.textContent).toContain('戰技禱詞');
		fireEvent.click(screen.getByText('戰技禱詞'));
		fireEvent.click(screen.getByText('特性'));
		expect(choicePanel.container.textContent).toContain('招式傷害調整');
		expect(choicePanel.container.textContent).toContain('熟練項目');
		expect(JSON.stringify(prayerChoice)).toBe(choiceSerialized);
	});

	it('localizes selected ConfigChoice options by their Feature identity without changing selectAt, IDs, or values', () => {
		const wardChoice = getFeature('conduit-1-9');
		const serialized = JSON.stringify(wardChoice);
		const selected = wardChoice.type === FeatureType.Choice ? wardChoice.data.options.find(option => option.feature.id === 'conduit-1-9d') : undefined;
		if ((wardChoice.type !== FeatureType.Choice) || !selected) {
			throw new Error('Conduit Ward options are missing');
		}

		render(
			createElement(
				LocalizationProvider,
				null,
				createElement(ConfigChoice, {
					data: { ...wardChoice.data, selected: [ selected.feature ] },
					feature: wardChoice,
					hero: makeHero(),
					sourcebooks: [],
					setData: vi.fn()
				})
			)
		);

		expect(screen.getByText('靈體護咒')).toBeTruthy();
		expect(screen.getByText(/受到傷害時環繞在你身邊/)).toBeTruthy();
		expect(wardChoice.data.selectAt).toBe('respite');
		expect(JSON.stringify(wardChoice)).toBe(serialized);
	});

	it('renders Piety gain triggers through both Hero and no-Hero data paths while preserving the canonical resource wiring', () => {
		const piety = getFeature('conduit-resource');
		if (piety.type !== FeatureType.HeroicResource) {
			throw new Error('Piety is not a Heroic Resource');
		}
		const serialized = JSON.stringify(piety);
		const noHero = renderFeature(piety);
		expect(noHero.container.textContent).toContain('每當你的回合開始時');
		expect(noHero.container.textContent).toContain('+1d3');
		noHero.unmount();

		const withHero = renderFeature(piety, makeHero());
		expect(withHero.container.textContent).toContain('每當你的回合開始時');
		expect(withHero.container.textContent).toContain('+1d3');
		fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
		expect(withHero.container.textContent).toContain('Start of your turn');
		expect(JSON.stringify(piety)).toBe(serialized);
		expect(piety.data.gains).toEqual([ { tag: 'start', trigger: 'Start of your turn', value: '1d3' } ]);
	});
});
