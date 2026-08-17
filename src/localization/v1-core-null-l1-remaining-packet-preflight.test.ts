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
import { nullClass } from '@/data/classes/null/null';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1NullLevel1RemainingRequiredCanonicalEnglish, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { verifyPacketCanonicalAlignment } from '@/localization/test-support/packet-canonical-alignment';
import { FactoryLogic } from '@/logic/factory-logic';
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
// core-null-l1-remaining-r1@6607c39cf3339a9330d751a777d3e0421c8c2846, revision 1.
const approvedPacketCanonicalHashes: Record<string, string> = {
	'element:null-stamina/name': 'cc350ea3393968f7cd7cbf135e8c1ec826c85b881b68dc619c699667805a3e96',
	'element:null-recoveries/name': '75b168468e6d7c9e715a2f2eb6b5039e120016d6441d2be853dea553ab302e67',
	'element:null-resource/name': 'a1b14db94434084b789c0069291250652a46b455cbb2b5c347c9231af8ac51b5',
	'element:null-resource/gains.0.trigger': '65b8bc678dcd96b16bb8bcb467fa8ecad483b57b53442ee3cbf2c8febb2b5d5f',
	'element:null-resource/gains.1.trigger': 'e92f25247b6cd48237b2d3cfec8337f3651a23607421c7a3af2588763021c66f',
	'element:null-resource/gains.2.trigger': '8339c00cd8b0cd560687e0239cdc3665917ab4e142f73e02872ff4aa346d1601',
	'element:null-1-1/name': '6df1bb18a59ab97df82e307b93fe4f3bbda34d531bcbb79ec573dda23ba64918',
	'element:null-1-1/description': '3a536ec415b64b9f3f84afc3adddfd9ffd30dde5b2acb0b8ed4fb74640dfc3f6',
	'element:null-1-2/name': '244f8bb5577b42f1894a24fd19a13ed8c729388b68eeecf76e916b035fb6fec0',
	'element:null-1-2/description': 'c9854a23f48361ae2f01a3602eee7ea678e8833e40551471c8f7785c510f6955',
	'element:null-1-6/name': '4c5da477bf038e5fbec5c556cefc616a0176931ce16f24e3bffae136aa9dee38',
	'element:null-1-6/description': 'dfaf26fe14269da6fdf078b9bf8eb1a835356f7e69f71fea2a3c363f730fa4b7',
	'element:null-1-6a/name': '4c5da477bf038e5fbec5c556cefc616a0176931ce16f24e3bffae136aa9dee38',
	'element:null-1-6b/name': '4c5da477bf038e5fbec5c556cefc616a0176931ce16f24e3bffae136aa9dee38',
	'element:null-1-7/name': '6064bdd5b4ecc2e1777988226752ec5a1fdf4e232fd441262fce2f42eebf73f6',
	'element:null-1-7/description': 'a725ff320f9c56c5934c1fbeed65a9b43edecb1192133e608cd0f2256014b740',
	'element:null-1-7a/name': '6b57656377fb967a9a8dfaabf4eecbd202003164fe47603c60994089f4a841b1',
	'element:null-1-7a/description': '730131818313ef6638529818366d032c8c51a57a53b1feb8fdd6fa9824ec599b',
	'element:null-1-7aa/name': '1e42d0c86af7a9c6a4d88038a3fe9043520f95c6b06afd2ac6ca5dcc885f6c36',
	'element:null-1-7ab/name': 'cc350ea3393968f7cd7cbf135e8c1ec826c85b881b68dc619c699667805a3e96',
	'element:null-1-7b/name': 'effe7c9906fecab653c3673b7aa679e5d6cff56317c892c4004d050921ec01c2',
	'element:null-1-7c/name': '61bcbbeb764502283b9604803ae307d332bdd5ac97c02bad28c6abc33b28b2bd',
	'element:null-1-7c/description': '17ed3a31e7222e210bb55a9eaa17abfb6437062ca95433c79f8ecac780c275ea',
	'element:null-1-7ca/name': 'c372fee9b4566b85a592ae6e98e571f3929c8e262cf2feff7acba63a65a50f14',
	'element:null-1-7cb/name': '8f5776cce47ea63d30932c17fd969bac2dc2ffadeb131a2ea1d9127965dad72c',
	'element:null-1-8/name': 'ed25f1d3b21605dfbdd912724e5e21b4f15177c5f2a9cbe8ebd924c105391d03',
	'element:null-1-8/description': 'ed25f1d3b21605dfbdd912724e5e21b4f15177c5f2a9cbe8ebd924c105391d03',
	'element:null-1-8a/name': '08641c277838950531acfb033e0a3ccb7e5b42c54e4a73643a34539e9d8d21f6',
	'element:null-1-8a/description': '98bd557a41b2077b713f2c1014622087859dfaecf399bccc292dc94c303e67d3',
	'element:null-1-8b/name': '08641c277838950531acfb033e0a3ccb7e5b42c54e4a73643a34539e9d8d21f6',
	'element:null-1-8b/description': '4e4ef1353dc39577426891504ac271a5255762d8584a1cbbbbc3ac2cb4b8ed97',
	'element:null-1-8c/name': '08641c277838950531acfb033e0a3ccb7e5b42c54e4a73643a34539e9d8d21f6',
	'element:null-1-8c/description': '32faca61952e5f9af39dc64be48264b3e015b337ce63b25814ca70522e208dbe',
	'element:null-1-9/name': '5252b981253954620c51b164e20b9a6ddbf79dcfd898e13b6b8b7fbdcc0dda10',
	'element:null-1-10/name': '7730d1ae4f479ef7597e99e22df581ee1281587f92e1871dd27ec2c6a5d085b9',
	'element:null-1-11/name': 'daa2a05b433080df49cbc9953b06287acdad908998052e3fc71a70c597b48370'
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

const getLiveNullLevel1NonAbilityFields = () => {
	const levelOne = nullClass.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Null Level 1 features are missing');
	}

	const fields: Record<string, string> = {};
	levelOne.features.forEach(feature => addLiveFeatureFields(fields, feature));
	return fields;
};

const nullLevelOneFeatures = nullClass.featuresByLevel.find(level => level.level === 1)?.features || [];
const required = createV1NullLevel1RemainingRequiredCanonicalEnglish();
const nullCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const getFeature = (id: string) => {
	const feature = nullLevelOneFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Null Feature '${id}' is missing`);
	}
	return feature;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...nullClass, level: 1, characteristics: FactoryLogic.createCharacteristics(0, 2, 2, 0, 0) };
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

// Nested Choice options and Multiple children are mounted behind collapsed Expanders, so the
// nested player-facing content is revealed the same way a player reveals it.
const expandNestedContent = (container: HTMLElement) => {
	for (let pass = 0; pass < 3; pass++) {
		container.querySelectorAll('.ant-collapse-header').forEach(header => {
			if (header.getAttribute('aria-expanded') !== 'true') {
				fireEvent.click(header);
			}
		});
	}
};

const countOccurrences = (haystack: string, needle: string) => haystack.split(needle).length - 1;

const expectDisciplineZhTW = (container: HTMLElement) => {
	expect(container.textContent).toContain('紀律');
	expect(container.textContent).toContain('每當你的回合開始時');
	expect(container.textContent).toContain('每輪中，當位於你【無念場】內的 1 個敵人首次使用主要動作時');
	expect(container.textContent).toContain('每輪中，當 GM 首次發動 1 個需要花費惡意的招式時');
};

const expectDisciplineEnglish = (container: HTMLElement) => {
	expect(container.textContent).toContain('Discipline');
	expect(container.textContent).toContain('Start of your turn');
	expect(container.textContent).toContain('The first time each combat round that an enemy in the area of your Null Field ability uses a main action');
	expect(container.textContent).toContain('The first time each combat round that the Director uses an ability that costs Malice');
};

afterEach(cleanup);

describe('Core Null L1 remaining approved packet preflight', () => {
	it('aligns all 36 canonical snapshots to the live exact-base source', async () => {
		const liveFields = getLiveNullLevel1NonAbilityFields();
		const result = await verifyPacketCanonicalAlignment({
			packetRecords: Object.entries(approvedPacketCanonicalHashes).map(([ identity, canonicalSha256 ]) => ({ identity, canonicalSha256 })),
			liveCanonicalEnglish: liveFields
		});

		expect(Object.keys(approvedPacketCanonicalHashes)).toHaveLength(36);
		expect(Object.keys(liveFields)).toHaveLength(36);
		expect(result).toEqual({ packetRecordCount: 36, liveCanonicalCount: 36, alignedCount: 36, issues: [] });
	});
});

describe('V1 Core Null L1 remaining catalog and presentation', () => {
	it('adds exactly the approved non-Ability manifest and catalog slice', () => {
		expect(Object.keys(required)).toHaveLength(36);
		expect(Object.keys(required).sort()).toEqual(Object.keys(approvedPacketCanonicalHashes).sort());
		expect(nullCatalogEntries).toHaveLength(36);
		expect(nullCatalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(nullCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(nullCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		// The Null Level 1 Ability nodes and their authored fields stay in the existing ability slice.
		[ 'null-1-4', 'null-1-5' ].forEach(abilityID => {
			expect(Object.keys(required)).not.toContain(elementFieldIdentity(abilityID, 'name'));
			expect(Object.keys(required)).not.toContain(elementFieldIdentity(abilityID, 'description'));
		});

		// The generated ClassAbility choice labels are player-facing, so they belong here.
		expect(required[elementFieldIdentity('null-1-9', 'name')]).toBe('Signature Ability');
		expect(required[elementFieldIdentity('null-1-10', 'name')]).toBe('3pt Ability');
		expect(required[elementFieldIdentity('null-1-11', 'name')]).toBe('5pt Ability');

		const zhTWOf = (identity: string) => nullCatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;
		expect(zhTWOf('element:null-resource/name')).toBe('紀律');
		expect(zhTWOf('element:null-resource/gains.1.trigger')).toBe('每輪中，當位於你【無念場】內的 1 個敵人首次使用主要動作時');
		expect(zhTWOf('element:null-1-2/description')).toBe('從交涉類技能或學識類技能中選擇 2 項技能。');
		expect(zhTWOf('element:null-1-7/name')).toBe('靈能鍛體');
		// Owner explicitly retained the '你可以使用' reading in all three Psionic Martial Arts rows.
		expect(zhTWOf('element:null-1-8a/description')).toBe('每當你使用擊退或擒抱機動動作時，你可以使用`直覺`取代`力量`來進行檢定，以及判斷是否可以指定體型比你大的生物。此外，每當你使用擊退機動動作時，你可以選擇讓目標滑動，而非推動。');
		expect(zhTWOf('element:null-1-8b/description')).toBe('你可以使用`直覺`取代`力量`來進行檢定，以及判斷是否可以指定體型比你大的生物。');
		expect(zhTWOf('element:null-1-8c/description')).toBe('你可以使用`直覺`取代`力量`來進行檢定，而且可以選擇讓目標滑動，而非推動。');
	});

	it('keeps the catalog complete and the class-level domain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('renders Discipline and all three gain triggers through no-Hero and Hero paths without changing canonical state', () => {
		const discipline = getFeature('null-resource');
		if (discipline.type !== FeatureType.HeroicResource) {
			throw new Error('Discipline is not a Heroic Resource');
		}

		const noHero = renderFeature(discipline);
		expectDisciplineZhTW(noHero.container);
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeature(discipline, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Discipline Feature', capture: () => JSON.stringify(discipline) }),
				protectCanonicalState({ label: 'Null Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => expectDisciplineZhTW(withHero.container),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectDisciplineEnglish(withHero.container),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectDisciplineZhTW(withHero.container)
		});
		expect(discipline.data.gains).toEqual([
			{ tag: 'start', trigger: 'Start of your turn', value: '2' },
			{ tag: 'action', trigger: 'The first time each combat round that an enemy in the area of your Null Field ability uses a main action', value: '1' },
			{ tag: 'malice', trigger: 'The first time each combat round that the Director uses an ability that costs Malice', value: '1' }
		]);
	});

	it('resolves the Null Speed parent and both of its bonus children', () => {
		const nullSpeed = getFeature('null-1-6');
		const hero = makeHero();
		const withHero = renderFeature(nullSpeed, hero);
		expandNestedContent(withHero.container);

		// The parent and both children share one canonical label, so all three renders are counted.
		const expectNullSpeedZhTW = () => {
			expect(countOccurrences(withHero.container.textContent || '', '無念速度')).toBeGreaterThanOrEqual(3);
			expect(withHero.container.textContent).toContain('靈能力量流淌於你體內，讓你能夠達到極高的速度。');
			expect(withHero.container.textContent).not.toContain('Null Speed');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Null Speed Feature', capture: () => JSON.stringify(nullSpeed) }),
				protectCanonicalState({ label: 'Null Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: expectNullSpeedZhTW,
			switchToEnglish: () => {
				switchLocale();
				expect(countOccurrences(withHero.container.textContent || '', 'Null Speed')).toBeGreaterThanOrEqual(3);
				expect(withHero.container.textContent).toContain('The flow of psionic power through you allows you to achieve high velocity.');
				expect(withHero.container.textContent).not.toContain('無念速度');
			},
			assertEnglish: () => expect(withHero.container.textContent).toContain('Null Speed'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectNullSpeedZhTW
		});
	});

	it('resolves the Psionic Augmentation choice and its Density, Force and Speed options', () => {
		const augmentation = getFeature('null-1-7');
		const hero = makeHero();
		const withHero = renderFeature(augmentation, hero);
		expandNestedContent(withHero.container);

		const expectAugmentationZhTW = () => {
			expect(withHero.container.textContent).toContain('靈能鍛體');
			expect(withHero.container.textContent).toContain('你的訓練將身體鍛造成完美的靈能兵器，用心靈的力量塑造出強化的肉體。選擇以下 1 種鍛體。作為休整活動，你可以進行靈能冥想來更換你的鍛體。');
			expect(withHero.container.textContent).toContain('密度鍛體');
			expect(withHero.container.textContent).toContain('穩度、體力');
			expect(withHero.container.textContent).toContain('力量鍛體');
			expect(withHero.container.textContent).toContain('速度鍛體');
			expect(withHero.container.textContent).toContain('速度、撤離');
			expect(withHero.container.textContent).not.toContain('Augmentation');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Psionic Augmentation Feature', capture: () => JSON.stringify(augmentation) }),
				protectCanonicalState({ label: 'Null Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: expectAugmentationZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(withHero.container.textContent).toContain('Psionic Augmentation');
				expect(withHero.container.textContent).toContain('Choose one of the following augmentations.');
				expect(withHero.container.textContent).toContain('Density Augmentation');
				expect(withHero.container.textContent).toContain('Stability, Stamina');
				expect(withHero.container.textContent).toContain('Force Augmentation');
				expect(withHero.container.textContent).toContain('Speed Augmentation');
				expect(withHero.container.textContent).toContain('Speed, Disengage');
				expect(withHero.container.textContent).not.toContain('鍛體');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectAugmentationZhTW
		});
	});

	it('resolves the Psionic Martial Arts parent, children and retained Owner prose', () => {
		const martialArts = getFeature('null-1-8');
		const hero = makeHero();
		const withHero = renderFeature(martialArts, hero);
		expandNestedContent(withHero.container);

		// Markdown renders the approved backtick-emphasised characteristics as code, so the
		// rendered text carries the Owner wording without its backticks.
		const expectMartialArtsZhTW = () => {
			expect(withHero.container.textContent).toContain('靈能武術、靈能武術、靈能武術');
			expect(withHero.container.textContent).toContain('每當你使用擊退或擒抱機動動作時，你可以使用直覺取代力量來進行檢定，以及判斷是否可以指定體型比你大的生物。此外，每當你使用擊退機動動作時，你可以選擇讓目標滑動，而非推動。');
			expect(withHero.container.textContent).toContain('你可以使用直覺取代力量來進行檢定，以及判斷是否可以指定體型比你大的生物。');
			expect(withHero.container.textContent).toContain('你可以使用直覺取代力量來進行檢定，而且可以選擇讓目標滑動，而非推動。');
			expect(withHero.container.textContent).not.toContain('Psionic Martial Arts');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Psionic Martial Arts Feature', capture: () => JSON.stringify(martialArts) }),
				protectCanonicalState({ label: 'Null Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: expectMartialArtsZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(withHero.container.textContent).toContain('Psionic Martial Arts, Psionic Martial Arts, Psionic Martial Arts');
				expect(withHero.container.textContent).toContain('Whenever you use the Knockback or Grab maneuver, you use Intuition instead of Might for the power roll and for determining if you can target creatures larger than you. Additionally, whenever you use the Knockback maneuver, you can choose to slide the target instead of pushing them.');
				expect(withHero.container.textContent).toContain('You use Intuition instead of Might for the power roll and for determining if you can target creatures larger than you.');
				expect(withHero.container.textContent).toContain('You use Intuition instead of Might for the power roll and you can choose to slide the target instead of pushing them.');
				expect(withHero.container.textContent).not.toContain('靈能武術');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectMartialArtsZhTW
		});
	});
});
