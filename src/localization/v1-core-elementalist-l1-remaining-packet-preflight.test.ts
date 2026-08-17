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
import { elementalist } from '@/data/classes/elementalist/elementalist';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ElementalistLevel1RemainingRequiredCanonicalEnglish, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { verifyPacketCanonicalAlignment } from '@/localization/test-support/packet-canonical-alignment';
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

// The approved packet's exact canonical SHA-256 evidence:
// core-elementalist-l1-remaining-r1@6d3c3c6465fc7a9cc56c33a3d5e0beb0d6ab64bc, revision 1.
const approvedPacketCanonicalHashes: Record<string, string> = {
	'element:elementalist-stamina/name': 'cc350ea3393968f7cd7cbf135e8c1ec826c85b881b68dc619c699667805a3e96',
	'element:elementalist-recoveries/name': '75b168468e6d7c9e715a2f2eb6b5039e120016d6441d2be853dea553ab302e67',
	'element:elementalist-resource/name': 'e252d0b058d9c80223a2f8cff799a0c8220463e85f53f47f5291160974f2ccc2',
	'element:elementalist-resource/gains.0.trigger': '65b8bc678dcd96b16bb8bcb467fa8ecad483b57b53442ee3cbf2c8febb2b5d5f',
	'element:elementalist-resource/gains.1.trigger': '42a9be3a714d9767876b8316f66295c975d2ae2075530b2b9915e7feedcb32a4',
	'element:elementalist-1-1/name': '6df1bb18a59ab97df82e307b93fe4f3bbda34d531bcbb79ec573dda23ba64918',
	'element:elementalist-1-1/description': '3a536ec415b64b9f3f84afc3adddfd9ffd30dde5b2acb0b8ed4fb74640dfc3f6',
	'element:elementalist-1-2/name': 'cf41f164e17651c442ab952711fb9e135c6dbf82645b48a435cd59166ca95971',
	'element:elementalist-1-2/description': '9b9792e01f1b7f6cf19b4faea1a709f61a9f74e78d27019da6b940f4f2d5427d',
	'element:elementalist-1-5/name': '8f411b0ce2e218f30915f636c9cf34216ce83cf53adc61b21a9348e50bed46d0',
	'element:elementalist-1-5/description': '951268e67590e27f230546a7e702298806c6f67fc20a4bf6f799703b56483d2e',
	'element:elementalist-1-7/name': 'f2b23cdca8d15004347281a79958f22892fcf2982e5d7dfc5a279bc94c35ba2d',
	'element:elementalist-1-7a/name': '3f240e8c49bd1ab2e52bc4808d483876fbae0239fcc4115e53055d85a6debd50',
	'element:elementalist-1-7a/description': '4b64e35a6aab86f639ef67e9c06ce487f2abf4950dca059986baf6c50ff4dbe4',
	'element:elementalist-1-7aa/name': 'cc350ea3393968f7cd7cbf135e8c1ec826c85b881b68dc619c699667805a3e96',
	'element:elementalist-1-7ab/name': '1bcb40b52474e5e2a0ab04b986e4ae0ae94ee9fd872bd463e034a55a864de5b5',
	'element:elementalist-1-7ac/name': 'fb907481c9eb524a61f17b6ecd240e504fcafb7b05c3608b4bca8573f7c715a5',
	'element:elementalist-1-7b/name': '2cc71b68a43d6a4e3752c66e1daf92fc69aa01afebb161741ce837681f7e2459',
	'element:elementalist-1-7b/description': '03bb0403f5c0ab2b77575758eae878320249c9d0a32dcac82f240bde846a1108',
	'element:elementalist-1-7ba/name': 'c372fee9b4566b85a592ae6e98e571f3929c8e262cf2feff7acba63a65a50f14',
	'element:elementalist-1-7bb/name': '8f5776cce47ea63d30932c17fd969bac2dc2ffadeb131a2ea1d9127965dad72c',
	'element:elementalist-1-7c/name': 'd3e53bef76aed62e407875ad2fb185dc1e0f740b156020c7dcb49cc78d18e1f0',
	'element:elementalist-1-7c/description': '348458d6c15e3a04aeb978727324405119b305c3e7ce63f579aad3e571a864d1',
	'element:elementalist-1-7d/name': '77d8e0dc9892198d57d0af264c4c905247453419ee0b6c8a3ee8489073eacb9a',
	'element:elementalist-1-7d/description': 'dfc69bee68a6669e63c5cf26bb8a183cf2c61ae64ba2aaeba187d48beef6b5eb',
	'element:elementalist-1-7e/name': 'eb5fc1c7cca98ea9366c64d851bfbea051f700dec18086b76779eabef59607ea',
	'element:elementalist-1-7e/description': 'eed5d904cf218223588d2fded1ac91a6d3d2501a6f0f511652c6775c187226a9',
	'element:elementalist-1-7e-1/name': 'cc350ea3393968f7cd7cbf135e8c1ec826c85b881b68dc619c699667805a3e96',
	'element:elementalist-1-7e-2/name': '1e42d0c86af7a9c6a4d88038a3fe9043520f95c6b06afd2ac6ca5dcc885f6c36',
	'element:elementalist-1-8/name': 'f632cc199d25b3b50fff1d11d5fb2238992e71b74cf93cd4d8b8a5090d359b7f',
	'element:elementalist-1-8a/name': 'a134c5fdd610968aee77294325ec001ac03407ff0e7e3ac70580e54af4dfe5d5',
	'element:elementalist-1-8a/description': 'a910674541c09495e740d2a3ed1d4069c3bdfa24d99b8e54f87494965fada0e8',
	'element:elementalist-1-8b/name': '7ae147b5a7f602fdaf02835ff3627bad2c03b3788b03225364370d15e45edfc5',
	'element:elementalist-1-8b/description': '4a918847ca6422b028fadc0715c504c16d409854b7175aab889ee6ad6d44336a',
	'element:elementalist-1-8ba/name': 'a9292a2fe16b3498ef05d95b510ae3587733b5c3bf56b7c3a3477d385f92dab2',
	'element:elementalist-1-8bb/name': 'a9292a2fe16b3498ef05d95b510ae3587733b5c3bf56b7c3a3477d385f92dab2',
	'element:elementalist-1-8bc/name': 'a9292a2fe16b3498ef05d95b510ae3587733b5c3bf56b7c3a3477d385f92dab2',
	'element:elementalist-1-8bd/name': 'a9292a2fe16b3498ef05d95b510ae3587733b5c3bf56b7c3a3477d385f92dab2',
	'element:elementalist-1-8be/name': 'a9292a2fe16b3498ef05d95b510ae3587733b5c3bf56b7c3a3477d385f92dab2',
	'element:elementalist-1-8bf/name': 'a9292a2fe16b3498ef05d95b510ae3587733b5c3bf56b7c3a3477d385f92dab2',
	'element:elementalist-1-8bg/name': 'a9292a2fe16b3498ef05d95b510ae3587733b5c3bf56b7c3a3477d385f92dab2',
	'element:elementalist-1-9/name': '5252b981253954620c51b164e20b9a6ddbf79dcfd898e13b6b8b7fbdcc0dda10',
	'element:elementalist-1-10/name': '7730d1ae4f479ef7597e99e22df581ee1281587f92e1871dd27ec2c6a5d085b9',
	'element:elementalist-1-11/name': 'daa2a05b433080df49cbc9953b06287acdad908998052e3fc71a70c597b48370'
};

// The preflight's own live traversal, written independently of the manifest helper so the
// packet is compared against the class data rather than against the code it is meant to fix.
const addLiveFeatureFields = (fields: Record<string, string>, feature: Feature) => {
	if (feature.type === FeatureType.Ability) {
		return;
	}

	const add = (field: string, value: string) => {
		const identity = elementFieldIdentity(feature.id, field);
		if (fields[identity] !== undefined) {
			throw new Error(`duplicate localization identity '${identity}'`);
		}
		fields[identity] = value;
	};

	add('name', feature.name);
	if (feature.description !== '') {
		add('description', feature.description);
	}
	if (feature.type === FeatureType.HeroicResource) {
		feature.data.gains.forEach((gain, index) => {
			if (gain.trigger !== '') {
				add(`gains.${index}.trigger`, gain.trigger);
			}
		});
	}
	if (feature.type === FeatureType.Choice) {
		feature.data.options.forEach(option => addLiveFeatureFields(fields, option.feature));
	}
	if (feature.type === FeatureType.Multiple) {
		feature.data.features.forEach(child => addLiveFeatureFields(fields, child));
	}
};

const getLiveElementalistLevel1NonAbilityFields = () => {
	const levelOne = elementalist.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Elementalist Level 1 features are missing');
	}

	const fields: Record<string, string> = {};
	levelOne.features.forEach(feature => addLiveFeatureFields(fields, feature));
	return fields;
};

const elementalistLevelOneFeatures = elementalist.featuresByLevel.find(level => level.level === 1)?.features || [];
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

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...elementalist, level: 1, characteristics: FactoryLogic.createCharacteristics(0, 0, 2, 0, 0) };
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

describe('Core Elementalist L1 remaining approved packet preflight', () => {
	it('aligns all 44 canonical snapshots to the live exact-base source', async () => {
		const liveFields = getLiveElementalistLevel1NonAbilityFields();
		const result = await verifyPacketCanonicalAlignment({
			packetRecords: Object.entries(approvedPacketCanonicalHashes).map(([ identity, canonicalSha256 ]) => ({ identity, canonicalSha256 })),
			liveCanonicalEnglish: liveFields
		});

		expect(Object.keys(approvedPacketCanonicalHashes)).toHaveLength(44);
		expect(Object.keys(liveFields)).toHaveLength(44);
		expect(result).toEqual({ packetRecordCount: 44, liveCanonicalCount: 44, alignedCount: 44, issues: [] });
	});
});

describe('V1 Core Elementalist L1 remaining catalog and presentation', () => {
	it('adds exactly the approved non-Ability manifest and catalog slice', () => {
		expect(Object.keys(required)).toHaveLength(44);
		expect(Object.keys(required).sort()).toEqual(Object.keys(approvedPacketCanonicalHashes).sort());
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

		const noHero = renderFeature(essence);
		expectEssenceZhTW(noHero.container);
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeature(essence, hero);
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

		const noHero = renderFeature(persistentMagic);
		expect(noHero.container.textContent).toContain('續發魔法');
		expect(noHero.container.textContent).toContain(approvedPersistentMagicThresholdZhTW);
		expect(noHero.container.textContent).not.toContain('傷害 ≧ 10');
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeature(persistentMagic, hero);
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
		const withHero = renderFeature(persistentMagic, makeHero());

		expect(withHero.container.textContent).toContain(calculatedPersistentMagicThresholdZhTW);
		fireEvent.click(screen.getByTitle('Auto-calculate damage, potency, etc'));
		expect(withHero.container.textContent).toContain(approvedPersistentMagicThresholdZhTW);
		expect(withHero.container.textContent).not.toContain('傷害 ≧ 10');
	});
});
