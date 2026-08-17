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

const approvedPacketCanonicalHashes: Record<string, string> = {
	'element:fury-stamina/name': 'cc350ea3393968f7cd7cbf135e8c1ec826c85b881b68dc619c699667805a3e96',
	'element:fury-recoveries/name': '75b168468e6d7c9e715a2f2eb6b5039e120016d6441d2be853dea553ab302e67',
	'element:fury-resource/name': '486847688441273b2d1bf64e9db1f7d038a5560c7fbcd18c0268925c38f75a26',
	'element:fury-resource/gains.0.trigger': '65b8bc678dcd96b16bb8bcb467fa8ecad483b57b53442ee3cbf2c8febb2b5d5f',
	'element:fury-resource/gains.1.trigger': 'fe388b6233ef32a6b00ba6d626aee1d204d71c7346bb19974898a3a26b61e0b6',
	'element:fury-resource/gains.2.trigger': '5fe904508f5b7a77728b021de8f18ac2b974a11891b5f895c79cacace66ef37d',
	'element:fury-1-1/name': '6df1bb18a59ab97df82e307b93fe4f3bbda34d531bcbb79ec573dda23ba64918',
	'element:fury-1-1/description': '3a536ec415b64b9f3f84afc3adddfd9ffd30dde5b2acb0b8ed4fb74640dfc3f6',
	'element:fury-1-2/name': '71a1dbb094c2c1de1b203acace9a7ccfa991b58daeb2fde9db01c5761d365ace',
	'element:fury-1-2/description': 'cba1def258111f60bda7c79eae83ca6bf7601a46682bd3c7f428aaa670b6ee90',
	'element:fury-1-4/name': '2de1ff92d5afd184ef5fe94864c69df4e5efe7c3b675bd23ea59b812c0ada5af',
	'element:fury-1-4/description': '05cf2a72daa8f9c37ea3e11a0bebbe9edb1e2726af741ef73f11a14070aa0f8e',
	'element:fury-1-5/name': '5252b981253954620c51b164e20b9a6ddbf79dcfd898e13b6b8b7fbdcc0dda10',
	'element:fury-1-6/name': '7730d1ae4f479ef7597e99e22df581ee1281587f92e1871dd27ec2c6a5d085b9',
	'element:fury-1-7/name': 'daa2a05b433080df49cbc9953b06287acdad908998052e3fc71a70c597b48370'
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

const getLiveFuryLevel1NonAbilityFields = () => {
	const levelOne = fury.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Fury Level 1 features are missing');
	}

	const fields: Record<string, string> = {};
	levelOne.features.forEach(feature => addLiveFeatureFields(fields, feature));
	return fields;
};

const furyLevelOneFeatures = fury.featuresByLevel.find(level => level.level === 1)?.features || [];
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

describe('Core Fury L1 remaining approved packet preflight', () => {
	it('aligns all 15 canonical snapshots to the live exact-base source', async () => {
		const liveFields = getLiveFuryLevel1NonAbilityFields();
		const result = await verifyPacketCanonicalAlignment({
			packetRecords: Object.entries(approvedPacketCanonicalHashes).map(([ identity, canonicalSha256 ]) => ({ identity, canonicalSha256 })),
			liveCanonicalEnglish: liveFields
		});

		expect(Object.keys(approvedPacketCanonicalHashes)).toHaveLength(15);
		expect(Object.keys(liveFields)).toHaveLength(15);
		expect(result).toEqual({ packetRecordCount: 15, liveCanonicalCount: 15, alignedCount: 15, issues: [] });
	});
});

describe('V1 Core Fury L1 remaining catalog and presentation', () => {
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
