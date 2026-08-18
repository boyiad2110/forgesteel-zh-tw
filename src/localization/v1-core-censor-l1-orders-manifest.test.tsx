// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1CensorLevel1AbilityRequiredCanonicalEnglish,
	createV1CensorLevel1AndOrderRequiredCanonicalEnglish,
	getV1CensorOrders,
	v1CensorOrderIDs,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { ClassSection } from '@/components/pages/heroes/hero-edit/class-section/class-section';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import {
	createClassPresentationHarness,
	createHeroWithClass,
	installResizeObserverStub,
	levelOneFeatures,
	readFieldByExactLabel,
	renderLocalized,
	switchLocale
} from '@/localization/test-support/localization-presentation-test-harness';
import { FactoryLogic } from '@/logic/factory-logic';
import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Hero } from '@/models/hero';
import { Options } from '@/models/options';
import { PanelMode } from '@/enums/panel-mode';
import { SubClass } from '@/models/subclass';
import { censor } from '@/data/classes/censor/censor';
import { core } from '@/data/sourcebooks/official/core';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions,
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/hooks/use-is-small', () => ({ useIsSmall: () => false }));
vi.mock('@/hooks/use-navigation', () => ({ useNavigation: () => ({ goToHeroView: vi.fn(), goToHeroEdit: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));
// The subclass selector belongs to its own batch; it is reduced to the canonical values it is
// handed so the Order selection flow can still be observed.
vi.mock('@/components/modals/select/subclass-select/subclass-select-modal', () => ({
	SubClassSelectModal: ({ classID, subClasses }: { classID: string; subClasses: SubClass[] }) => (
		<output data-testid='subclass-selector'>{`${classID}:${subClasses.map(sc => sc.id).join(',')}`}</output>
	)
}));

installResizeObserverStub();

const required = createV1CensorLevel1AndOrderRequiredCanonicalEnglish();
const censorAbilityRequired = createV1CensorLevel1AbilityRequiredCanonicalEnglish();
const orders = getV1CensorOrders();

const getOrder = (id: string) => {
	const order = orders.find(candidate => candidate.id === id);
	if (!order) {
		throw new Error(`Censor Order '${id}' is missing`);
	}
	return order;
};

const censorLevel1Features = levelOneFeatures(censor);
const censorLevel1NonAbility = censorLevel1Features.filter(feature => feature.type !== FeatureType.Ability);
const orderLevel1Features = orders.flatMap(order => levelOneFeatures(order));

const findFeature = (features: Feature[], id: string) => {
	const feature = features.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Feature '${id}' is missing`);
	}
	return feature;
};

const censorCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const heroWithCensor = (level = 1) => createHeroWithClass(censor, level, FactoryLogic.createCharacteristics(2, 0, 0, 0, 2));

const { renderClassPanel, renderSubclass, renderFeature } = createClassPresentationHarness(censor, [ core ]);

const classSectionCallbacks = {
	selectClass: vi.fn(),
	setLevel: vi.fn(),
	selectPrimaryCharacteristics: vi.fn(),
	selectCharacteristics: vi.fn(),
	addSubclass: vi.fn(),
	removeSubclass: vi.fn(),
	setFeatureData: vi.fn()
};

const renderClassSection = (hero: Hero) => {
	Object.values(classSectionCallbacks).forEach(callback => callback.mockClear());

	return renderLocalized(
		<ClassSection hero={hero} sourcebooks={[ core ]} searchTerm='' {...classSectionCallbacks} />
	);
};

const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const isDrawn = (text: string) => screen.queryAllByText(text).length > 0;

afterEach(cleanup);

describe('V1 Core Censor L1 + Order manifest', () => {
	it('enumerates exactly the approved 34-identity slice and its catalog entries', () => {
		expect(v1CensorOrderIDs).toHaveLength(3);
		expect(orders.map(order => order.id)).toEqual([ ...v1CensorOrderIDs ]);
		expect(Object.keys(required)).toHaveLength(34);
		expect(censorCatalogEntries).toHaveLength(34);

		const catalogIdentities = censorCatalogEntries.map(getEntryIdentity);
		expect(new Set(catalogIdentities).size).toBe(34);
		expect(catalogIdentities.slice().sort()).toEqual(Object.keys(required).sort());
		expect(censorCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(censorCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		// Every reading is Chinese: no canonical English survives in an approved entry.
		expect(censorCatalogEntries.every(entry => !/[A-Za-z]/.test(entry.zhTW))).toBe(true);
	});

	it('splits those 34 identities into the approved content breakdown', () => {
		const subclassCategory = [ elementFieldIdentity(censor.id, 'subclassName') ];
		const wrathTriggers = [ 0, 1, 2 ].map(index => elementFieldIdentity('censor-resource', `gains.${index}.trigger`));
		const orderMetadata = v1CensorOrderIDs.flatMap(id => [ elementFieldIdentity(id, 'name'), elementFieldIdentity(id, 'description') ]);
		const censorFeatureFields = Object.keys(required).filter(identity => censorLevel1NonAbility.some(feature => identity.startsWith(`element:${feature.id}/`)));
		const orderFeatureFields = Object.keys(required).filter(identity => orderLevel1Features.some(feature => identity.startsWith(`element:${feature.id}/`)));

		expect(subclassCategory).toHaveLength(1);
		expect(wrathTriggers).toHaveLength(3);
		expect(orderMetadata).toHaveLength(6);
		// 12 Censor Level 1 non-Ability Feature fields, of which 3 are the Wrath triggers.
		expect(censorFeatureFields).toHaveLength(15);
		// Each Order contributes a SkillChoice name/description and a PackageContent name/description.
		expect(orderLevel1Features).toHaveLength(6);
		expect(orderFeatureFields).toHaveLength(12);

		const all = [ ...subclassCategory, ...orderMetadata, ...censorFeatureFields, ...orderFeatureFields ];
		expect(new Set(all).size).toBe(34);
		expect(all.every(identity => required[identity] !== undefined)).toBe(true);
	});

	it('keeps the completed Censor Level 1 Ability slice separate and untouched', () => {
		const abilityIdentities = Object.keys(censorAbilityRequired);

		expect(abilityIdentities).toHaveLength(92);
		// No identity is claimed by both slices, in either direction.
		expect(Object.keys(required).filter(identity => abilityIdentities.includes(identity))).toEqual([]);
		// The two Censor Level 1 Ability Features contribute nothing to this slice.
		[ 'censor-1-4', 'censor-1-6' ].forEach(id => {
			expect(Object.keys(required).some(identity => identity.startsWith(`element:${id}/`))).toBe(false);
		});
	});

	it('leaves Censor Levels 2+ and Order Levels 2+ outside this slice', () => {
		const identities = Object.keys(required);
		const laterFeatures = [
			...censor.featuresByLevel.filter(lvl => lvl.level > 1).flatMap(lvl => lvl.features),
			...orders.flatMap(order => order.featuresByLevel.filter(lvl => lvl.level > 1).flatMap(lvl => lvl.features))
		];

		expect(laterFeatures.length).toBeGreaterThan(0);
		laterFeatures.forEach(feature => {
			expect(identities.some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
		});
		// The Orders carry Level 2+ abilities; none of them reaches the catalog through this slice.
		expect(orders.flatMap(order => order.abilities).every(ability => !identities.some(identity => identity.startsWith(`element:${ability.id}/`)))).toBe(true);
	});

	it('contributes all 34 of its identities to the manifest denominator', () => {
		const manifestIdentities = Object.keys(v1LocalizationManifest.requiredCanonicalEnglish);
		const identities = Object.keys(required);

		expect(identities).toHaveLength(34);
		expect(identities.every(identity => manifestIdentities.includes(identity))).toBe(true);
		expect(identities.every(identity => v1LocalizationManifest.requiredCanonicalEnglish[identity] === required[identity])).toBe(true);
	});

	it('records exactly the approved glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^(Order|Exorcist|Oracle|Paragon),/.test(row))).toEqual([
			'Order,教團,game-term,approved',
			'Exorcist,驅邪,game-term,approved',
			'Oracle,神諭,game-term,approved',
			'Paragon,典範,game-term,approved'
		]);
	});

	it('keeps the catalog valid and the parent class-level domain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		// Finishing Censor Level 1 and its Orders does not finish class and subclass level content.
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});
});

describe('Censor class panel presentation', () => {
	it('reads the subclass category and Order names in the overview without English plural morphology', () => {
		const { container } = renderClassPanel();

		// 'Order' pluralizes to 'Orders' in English; the zh-TW reading is the word it is.
		expect(readFieldByExactLabel(container, '教團')).toBe('驅邪, 神諭, 典範');
		expect(container.textContent).not.toContain('教團s');
		expect(container.textContent).not.toContain('Orders');
	});

	it('reads the Level 1 Feature summary and the subclass expander titles in zh-TW', () => {
		const { container } = renderClassPanel();

		clickPage(container, '特性');
		const summary = readFieldByExactLabel(container, '1 級');

		expect(summary).toContain('體力');
		expect(summary).toContain('復元力');
		expect(summary).toContain('怒火');
		expect(summary).toContain('招牌招式');
		expect(summary).toContain('3 費招式');
		expect(summary).toContain('5 費招式');
		expect(summary).not.toContain('Stamina');
		expect(summary).not.toContain('Signature Ability');

		clickPage(container, '子範型');
		expect(container.textContent).toContain('驅邪');
		expect(container.textContent).not.toContain('Exorcist');
	});

	it('falls back to canonical English in the English locale', () => {
		const { container } = renderClassPanel();

		switchLocale();

		expect(readFieldByExactLabel(container, 'Orders')).toBe('Exorcist, Oracle, Paragon');
		expect(container.textContent).not.toContain('教團');
	});

	it('does not mutate the class or its Orders when switching locale', () => {
		const serialized = JSON.stringify(censor);

		renderClassPanel();
		switchLocale();

		expect(JSON.stringify(censor)).toBe(serialized);
		expect(censor.subclassName).toBe('Order');
		expect(censor.subclasses.map(sc => sc.id)).toEqual([ ...v1CensorOrderIDs ]);
	});
});

describe('Order subclass panel presentation', () => {
	it.each([
		[ 'censor-sub-1', '驅邪', '你擅長獵捕潛藏的教團之敵，深知敞開的心靈就如同毫無防備的堡壘。', 'Exorcist' ],
		[ 'censor-sub-2', '神諭', '腐敗如同深入骨髓的觸鬚，容易被忽視，因此你擅長揭露教團所面臨的潛藏威脅。', 'Oracle' ],
		[ 'censor-sub-3', '典範', '若沒有堅定的榜樣與嚴格的管束，弱者必定墮落腐化。你擅長為教團樹立典範。', 'Paragon' ]
	])('reads %s in zh-TW in full mode and canonical English after switching', (id, name, description, canonicalName) => {
		const { container } = renderSubclass(getOrder(id), PanelMode.Full);

		expect(container.textContent).toContain(name);
		expect(container.textContent).toContain(description);
		expect(container.textContent).not.toContain(canonicalName);

		switchLocale();

		expect(container.textContent).toContain(canonicalName);
		expect(container.textContent).not.toContain(name);
	});

	it('reads the compact mode and the Level 1 Feature summary in zh-TW', () => {
		const { container } = renderSubclass(getOrder('censor-sub-2'), PanelMode.Compact);

		expect(container.textContent).toContain('神諭');
		expect(container.textContent).not.toContain('Oracle');

		cleanup();

		const full = renderSubclass(getOrder('censor-sub-2'), PanelMode.Full);
		clickPage(full.container, '特性');

		expect(readFieldByExactLabel(full.container, '1 級')).toBe('技能, 審判：教團益處');
		expect(full.container.textContent).not.toContain('Judgment Order Benefit');
	});

	it('does not mutate the Order it was given when switching locale', () => {
		const order = getOrder('censor-sub-3');
		const serialized = JSON.stringify(order);

		renderSubclass(order, PanelMode.Full);
		switchLocale();

		expect(JSON.stringify(order)).toBe(serialized);
		expect(order.name).toBe('Paragon');
	});
});

describe('Order Level 1 Feature presentation', () => {
	it('reads the Skill choice label and keeps the default Skill on shared Skill localization', () => {
		const { container } = renderFeature(findFeature(orderLevel1Features, 'censor-sub-1-1-1'));

		// The label is the Feature's own approved name; the selected Skill keeps using the
		// shared Skill catalog, which is where its reading has always come from.
		expect(readFieldByExactLabel(container, '技能')).toBe('觀色');
		expect(container.textContent).toContain('從任意列表中選擇 1 項技能。');
		expect(container.textContent).not.toContain('Read Person');
	});

	it.each([
		[ 'censor-sub-2-1-1', '魔法' ],
		[ 'censor-sub-3-1-1', '領導' ]
	])('resolves the default Skill selection for %s', (id, skillReading) => {
		const { container } = renderFeature(findFeature(orderLevel1Features, id));

		expect(readFieldByExactLabel(container, '技能')).toBe(skillReading);
	});

	it('reads the Judgment Order Benefit as approved raw zh-TW, with and without a Hero', () => {
		const feature = findFeature(orderLevel1Features, 'censor-sub-1-1-2');
		const approved = '當你在 1 個回合中首次發動【審判】招式審判 1 個生物時，你可以傳送最多等於你`氣場` ×2 的格數。此移動必須讓你更接近被審判的生物。你與終點之間不需要有效果線。';

		const noHero = renderFeature(feature);
		expect(noHero.container.textContent).toContain('審判：教團益處');
		// PackageContent is not an Ability calculator path, so the Presence expression is kept
		// exactly as approved rather than resolved in Chinese.
		expect(noHero.container.textContent).toContain(approved.replace(/`/g, ''));

		cleanup();

		const withHero = renderFeature(feature, heroWithCensor());
		expect(withHero.container.textContent).toContain('審判：教團益處');
		expect(withHero.container.textContent).toContain(approved.replace(/`/g, ''));
		expect(withHero.container.textContent).not.toContain('Judgment Order Benefit');
	});

	it('falls back to canonical English in the English locale', () => {
		const { container } = renderFeature(findFeature(orderLevel1Features, 'censor-sub-3-1-2'));

		switchLocale();

		expect(container.textContent).toContain('Judgment Order Benefit');
		expect(container.textContent).not.toContain('審判：教團益處');
	});
});

describe('Wrath heroic resource presentation', () => {
	const triggers = [
		'每當你的回合開始時',
		'每輪中，當 1 個被你審判的生物首次對你造成傷害時',
		'每輪中，當你首次對 1 個被你審判的生物造成傷害時'
	];

	it('reads all three gain triggers in zh-TW without a Hero', () => {
		const { container } = renderFeature(findFeature(censorLevel1Features, 'censor-resource'));

		expect(container.textContent).toContain('怒火');
		triggers.forEach(trigger => expect(container.textContent).toContain(trigger));
		expect(container.textContent).not.toContain('Start of your turn');
	});

	it('reads all three gain triggers in zh-TW with a Hero, which reads a different data path', () => {
		// With a Hero the component reads the Hero's own resolved resource rather than the
		// Feature's data, so both paths are covered.
		const { container } = renderFeature(findFeature(censorLevel1Features, 'censor-resource'), heroWithCensor(3));

		triggers.forEach(trigger => expect(container.textContent).toContain(trigger));
		expect(container.textContent).not.toContain('Start of your turn');
	});

	it('keeps the gain values, order and canonical objects unchanged across a locale switch', () => {
		const feature = findFeature(censorLevel1Features, 'censor-resource');
		if (feature.type !== FeatureType.HeroicResource) {
			throw new Error('Wrath is not a heroic resource');
		}
		const serialized = JSON.stringify(feature);
		const { container } = renderFeature(feature);

		expect(Array.from(container.querySelectorAll('.pill')).map(node => node.textContent)).toEqual([ '+2', '+1', '+1' ]);

		switchLocale();

		expect(container.textContent).toContain('Start of your turn');
		expect(container.textContent).not.toContain(triggers[0]);
		expect(JSON.stringify(feature)).toBe(serialized);
		expect(feature.data.gains.map(gain => gain.tag)).toEqual([ 'start', 'take-damage', 'deal-damage' ]);
	});

	it('fails closed to canonical English for a trigger the approved reading was not written against', () => {
		const feature = findFeature(censorLevel1Features, 'censor-resource');
		if (feature.type !== FeatureType.HeroicResource) {
			throw new Error('Wrath is not a heroic resource');
		}
		const replaced: Feature = {
			...feature,
			data: { ...feature.data, gains: [ { ...feature.data.gains[0], trigger: 'Start of your turn, if you are bloodied' } ] }
		};

		const { container } = renderFeature(replaced);

		expect(container.textContent).toContain('Start of your turn, if you are bloodied');
		expect(container.textContent).not.toContain(triggers[0]);
	});
});

describe('Censor Hero Builder subclass selection', () => {
	it('reads the subclass category heading and the choose prompt in zh-TW', () => {
		renderClassSection(heroWithCensor());

		expect(isDrawn('教團')).toBe(true);
		// The 個 classifier binds directly to the Chinese reading; the English-style space
		// zh-TW keeps in front of Latin text does not belong between two Chinese words.
		expect(isDrawn('選擇 1 個教團。')).toBe(true);
		expect(screen.getByRole('button', { name: '選擇 1 個教團' })).toBeTruthy();
		expect(isDrawn('選擇 1 個 教團。')).toBe(false);
		expect(screen.queryByRole('button', { name: '選擇 1 個 教團' })).toBeNull();
		expect(isDrawn('Choose an Order.')).toBe(false);
	});

	it('binds the classifier to a Chinese reading in the plural prompt too', () => {
		const hero = heroWithCensor();
		hero.class = { ...censor, level: 1, subclassCount: 2, characteristics: FactoryLogic.createCharacteristics(2, 0, 0, 0, 2) };

		renderClassSection(hero);

		expect(isDrawn('選擇 2 個教團。')).toBe(true);
		expect(isDrawn('選擇 2 個 教團。')).toBe(false);

		switchLocale();

		expect(isDrawn('Choose 2 Orders.')).toBe(true);
	});

	it('keeps the separator in front of a canonical English fallback in the zh-TW locale', () => {
		// A class with no approved reading for its own subclass category falls back to canonical
		// English inside the zh-TW sentence, where the space between Chinese and Latin belongs.
		const hero = heroWithCensor();
		hero.class = { ...censor, id: 'class-unlocalized', level: 1, characteristics: FactoryLogic.createCharacteristics(2, 0, 0, 0, 2) };

		renderClassSection(hero);

		expect(isDrawn('選擇 1 個 Order。')).toBe(true);
		expect(screen.getByRole('button', { name: '選擇 1 個 Order' })).toBeTruthy();
		expect(isDrawn('選擇 1 個Order。')).toBe(false);
	});

	it('picks the English article from the canonical name, not the zh-TW reading', () => {
		renderClassSection(heroWithCensor());

		switchLocale();

		// 'Order' takes 'an'; that choice is made on the canonical English name, so it survives
		// even though the zh-TW reading it interpolates starts with no vowel at all.
		expect(isDrawn('Choose an Order.')).toBe(true);
		expect(screen.getByRole('button', { name: 'Choose an Order' })).toBeTruthy();
		expect(isDrawn('選擇 1 個教團。')).toBe(false);
	});

	it('reads a selected Order name and description in zh-TW without mutating the hero class', () => {
		const hero = heroWithCensor();
		hero.class = {
			...censor,
			level: 1,
			characteristics: FactoryLogic.createCharacteristics(2, 0, 0, 0, 2),
			subclasses: censor.subclasses.map(sc => (sc.id === 'censor-sub-2' ? { ...sc, selected: true } : sc))
		};
		const serialized = JSON.stringify(hero);

		renderClassSection(hero);

		expect(isDrawn('神諭')).toBe(true);
		expect(isDrawn('腐敗如同深入骨髓的觸鬚，容易被忽視，因此你擅長揭露教團所面臨的潛藏威脅。')).toBe(true);
		expect(isDrawn('Oracle')).toBe(false);

		switchLocale();

		expect(isDrawn('Oracle')).toBe(true);
		expect(isDrawn('神諭')).toBe(false);
		expect(JSON.stringify(hero)).toBe(serialized);
		expect(hero.class?.subclassName).toBe('Order');
	});

	it('opens the Order selector with canonical values from the approved zh-TW button', () => {
		renderClassSection(heroWithCensor());

		fireEvent.click(screen.getByRole('button', { name: '選擇 1 個教團' }));

		expect(screen.getByTestId('subclass-selector').textContent).toBe(`class-censor:${v1CensorOrderIDs.join(',')}`);
	});
});
