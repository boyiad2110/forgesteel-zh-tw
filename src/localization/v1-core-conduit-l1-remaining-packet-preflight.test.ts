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
import { verifyPacketCanonicalAlignment } from '@/localization/test-support/packet-canonical-alignment';
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

const approvedPacketCanonicalHashes: Record<string, string> = {
	'element:conduit-stamina/name': 'cc350ea3393968f7cd7cbf135e8c1ec826c85b881b68dc619c699667805a3e96',
	'element:conduit-recoveries/name': '75b168468e6d7c9e715a2f2eb6b5039e120016d6441d2be853dea553ab302e67',
	'element:conduit-resource/name': '528c585b86c2fe7aae835e782c812343987b38c922a93cefaede79e191f8e1b8',
	'element:conduit-resource/gains.0.trigger': '65b8bc678dcd96b16bb8bcb467fa8ecad483b57b53442ee3cbf2c8febb2b5d5f',
	'element:conduit-1-1/name': '244f8bb5577b42f1894a24fd19a13ed8c729388b68eeecf76e916b035fb6fec0',
	'element:conduit-1-1/description': 'c9854a23f48361ae2f01a3602eee7ea678e8833e40551471c8f7785c510f6955',
	'element:conduit-1-2/name': '79fa33618d8eaa1fc55f6f8a2d34c65ececc4c5961ac2b1433802c2629d55ca1',
	'element:conduit-1-3b/name': '6e399f2787a0602f604bd89c19e077a5546c05698b6be5b96baa895cc23a0ec0',
	'element:conduit-1-3b/description': '1d25d56f4fabf02444572708de047b5cc0187abbe3efcb6718f5a94b0d9f90fd',
	'element:conduit-1-4/name': '5d754431c1152989e5c497a0d57d10857655ef12ab56fa02522d46f4a6bd03ae',
	'element:conduit-1-4/description': '004ea56c634aa8f640bded845806834084e19009db34afe26534510ebf4a964c',
	'element:conduit-1-7/name': '5550c36afbbb7c38dc7f49a4d6dd4a0f2cdfe6f0b4501bea6e66483a8dd91f98',
	'element:conduit-1-8/name': '6e399f2787a0602f604bd89c19e077a5546c05698b6be5b96baa895cc23a0ec0',
	'element:conduit-1-8a/name': '223351a2b5ac551ce663831ce97b00f915fb51f261d9854b910a0f1ad072eca4',
	'element:conduit-1-8a/description': 'd0809d7390a2f4a9b310fab902ae7c5fa99c48ba0d8b97b8ba8b3c86b46a55f5',
	'element:conduit-1-8b/name': 'bd9acebe9d8f6c3fbd31b20b7444dddfde64a0da9efa02268bad85ccedae8c87',
	'element:conduit-1-8b/description': 'd302809ec8c23421e5375e2885ff19b80d5a94da13e5a994a0f23e504e6890a9',
	'element:conduit-1-8c/name': '5665ddb8bb742f4dd18c35d18ff31029be9888d3a71cfe0045d53f0ac7c50556',
	'element:conduit-1-8c/description': 'b18b8810d3d375d2fd5525f15e9bf062a116bce93659caf62ed99ec734ceafe6',
	'element:conduit-1-8da/name': 'cc350ea3393968f7cd7cbf135e8c1ec826c85b881b68dc619c699667805a3e96',
	'element:conduit-1-8db/name': '1bcb40b52474e5e2a0ab04b986e4ae0ae94ee9fd872bd463e034a55a864de5b5',
	'element:conduit-1-8dc/name': 'fb907481c9eb524a61f17b6ecd240e504fcafb7b05c3608b4bca8573f7c715a5',
	'element:conduit-1-8d/name': 'b22307c100d9782199156ee54c428f7cce13f8f253e43a1dda8d4374107081fd',
	'element:conduit-1-8d/description': '44c868c0e5b7c3885595c6823c936dd1edd2e20e33a2299d580a6da816729259',
	'element:conduit-1-8ca/name': 'c372fee9b4566b85a592ae6e98e571f3929c8e262cf2feff7acba63a65a50f14',
	'element:conduit-1-8cb/name': '8f5776cce47ea63d30932c17fd969bac2dc2ffadeb131a2ea1d9127965dad72c',
	'element:conduit-1-8e/name': 'a9999907cfb00c31bd423a2c716a03bd711aebb041bbae977a09408bb5caf5ee',
	'element:conduit-1-8e/description': '1dcf3ef408890b2ebffb34ee8c504a213be3a14dfe0ed3f95ce88678c8e51441',
	'element:conduit-1-8ea/name': 'cc350ea3393968f7cd7cbf135e8c1ec826c85b881b68dc619c699667805a3e96',
	'element:conduit-1-8eb/name': '1e42d0c86af7a9c6a4d88038a3fe9043520f95c6b06afd2ac6ca5dcc885f6c36',
	'element:conduit-1-9/name': 'cd2aa6aeac480618193e21e03694a68932a998344756bd214ee2fbaccba2ec84',
	'element:conduit-1-9a/name': 'e51417f5dd8361a77cdc9e21a0ca9f768c2d1cfd429cb411ff5c2b826154bf58',
	'element:conduit-1-9a/description': '160421de13abbfa8889d0a51cbb28134b44deae7061aca0ad16dd9ec47edc078',
	'element:conduit-1-9b/name': 'e3f7998e7cec33a35d0a11e30309f9f243993a1380e6d85e66b70f6ddf095941',
	'element:conduit-1-9b/description': '6f718c423ebd6555a12c78f37e36f30a4260d6e800fe4196bba9fc7d0a2b43fe',
	'element:conduit-1-9c/name': '80e1f6bf8f0577b5c520eaae03dba117b3a131a4a63ae7efc7beef2e7efb2df2',
	'element:conduit-1-9c/description': '9644dd61840d9e356d7907a8ebc2f85d2ec905759253bab7fb4b42eda578ef7d',
	'element:conduit-1-9d/name': '0238a9f4b43285926637fabe5c40269db39286fd255f7269b83db117384bd492',
	'element:conduit-1-9d/description': 'bfca2109e47c0acfba2f900fa0ed6d2f80a5f71200f152b0611963e6af554240',
	'element:conduit-1-10/name': '5252b981253954620c51b164e20b9a6ddbf79dcfd898e13b6b8b7fbdcc0dda10',
	'element:conduit-1-11/name': '7730d1ae4f479ef7597e99e22df581ee1281587f92e1871dd27ec2c6a5d085b9',
	'element:conduit-1-12/name': 'daa2a05b433080df49cbc9953b06287acdad908998052e3fc71a70c597b48370'
};

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
		feature.data.gains.forEach((gain, index) => add(`gains.${index}.trigger`, gain.trigger));
	}
	if (feature.type === FeatureType.Choice) {
		feature.data.options.forEach(option => addLiveFeatureFields(fields, option.feature));
	}
	if (feature.type === FeatureType.Multiple) {
		feature.data.features.forEach(child => addLiveFeatureFields(fields, child));
	}
};

const getLiveConduitLevel1NonAbilityFields = () => {
	const levelOne = conduit.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Conduit Level 1 features are missing');
	}

	const fields: Record<string, string> = {};
	levelOne.features.forEach(feature => addLiveFeatureFields(fields, feature));
	return fields;
};

const conduitLevelOneFeatures = conduit.featuresByLevel.find(level => level.level === 1)?.features || [];
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

describe('Core Conduit L1 remaining approved packet preflight', () => {
	it('aligns all 42 canonical snapshots, including generated and whitespace-sensitive values, to the live exact-base source', async () => {
		const liveFields = getLiveConduitLevel1NonAbilityFields();
		const result = await verifyPacketCanonicalAlignment({
			packetRecords: Object.entries(approvedPacketCanonicalHashes).map(([ identity, canonicalSha256 ]) => ({ identity, canonicalSha256 })),
			liveCanonicalEnglish: liveFields
		});

		expect(Object.keys(approvedPacketCanonicalHashes)).toHaveLength(42);
		expect(Object.keys(liveFields)).toHaveLength(42);
		expect(result).toEqual({ packetRecordCount: 42, liveCanonicalCount: 42, alignedCount: 42, issues: [] });
	});
});

describe('V1 Core Conduit L1 remaining catalog and presentation', () => {
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
