// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1CoreStandardKitRequiredCanonicalEnglish,
	getV1CoreStandardKitSignatureAbilities,
	getV1CoreStandardKits,
	v1CoreStandardKitIDs,
	v1HeroCreationSourcebooks,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { ConfigKit } from '@/components/features/feature-data/kit';
import { KitPanel } from '@/components/panels/elements/kit-panel/kit-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { ElementFieldEntry, LocalizationEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { KitArmor } from '@/enums/kit-armor';
import { KitWeapon } from '@/enums/kit-weapon';
import { Kit } from '@/models/kit';
import { FeatureKitData } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { core } from '@/data/sourcebooks/official/core';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { PanelMode } from '@/enums/panel-mode';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const required = createV1CoreStandardKitRequiredCanonicalEnglish(v1HeroCreationSourcebooks);
const kits = getV1CoreStandardKits(v1HeroCreationSourcebooks);
const signatureAbilityIDs = getV1CoreStandardKitSignatureAbilities(v1HeroCreationSourcebooks).map(ability => ability.id);
const kitIdentityPrefixes = [ ...v1CoreStandardKitIDs, ...signatureAbilityIDs ];

const kitCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && kitIdentityPrefixes.includes(entry.elementID as typeof kitIdentityPrefixes[number])
));
const kitUIEntries = productionLocalizationEntries.filter((entry: LocalizationEntry) => (
	((entry.kind === 'ui') || (entry.kind === 'message'))
	&& (/^(kit\.|kit-panel\.|kit-armor\.|kit-weapon\.|feature-kit\.)/.test(entry.key))
));

const getKit = (id: typeof v1CoreStandardKitIDs[number]) => {
	const kit = kits.find(candidate => candidate.id === id);
	if (!kit) {
		throw new Error(`Core standard Kit '${id}' is missing`);
	}
	return kit;
};

const getAbility = (id: string) => {
	const ability = getV1CoreStandardKitSignatureAbilities(v1HeroCreationSourcebooks).find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Kit signature ability '${id}' is missing`);
	}
	return ability;
};

const renderKit = (kit: Kit, mode: PanelMode) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(KitPanel, { kit: kit, sourcebooks: [ core ], mode: mode })
	)
);

const fieldReading = (container: HTMLElement, label: string) => {
	const field = Array.from(container.querySelectorAll('.field')).find(node => node.querySelector('.field-label')?.textContent?.trim() === label);
	return field?.querySelector('.field-value')?.textContent?.trim();
};

// 'Features' is both a page label and an Overview field label, so the page is switched by
// clicking the Segmented control itself rather than by text alone.
const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Kit panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent?.trim() || '');

const heroWithCharacteristics = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(2, 3, 1, 0, -1);
	return hero;
};

const tierReading = (abilityID: string, field: string, tier: number, hero?: ReturnType<typeof FactoryLogic.createHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getAbility(abilityID), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const textReading = (abilityID: string, field: string, hero?: ReturnType<typeof FactoryLogic.createHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Core standard Kit manifest', () => {
	it('enumerates exactly the approved 21-Kit, 181-identity slice and its catalog entries', () => {
		expect(kits.map(kit => kit.id)).toEqual([ ...v1CoreStandardKitIDs ]);
		expect(v1CoreStandardKitIDs).toHaveLength(21);
		expect(signatureAbilityIDs).toHaveLength(21);
		expect(Object.keys(required)).toHaveLength(181);
		expect(kitCatalogEntries).toHaveLength(181);

		// 21 Kits x (name, description); the remaining 139 identities are signature Ability content.
		const kitMetadataIdentities = v1CoreStandardKitIDs.flatMap(id => [ elementFieldIdentity(id, 'name'), elementFieldIdentity(id, 'description') ]);
		expect(kitMetadataIdentities).toHaveLength(42);
		expect(kitMetadataIdentities.every(identity => required[identity] !== undefined)).toBe(true);
		expect(Object.keys(required).filter(identity => !kitMetadataIdentities.includes(identity))).toHaveLength(139);

		const catalogIdentities = kitCatalogEntries.map(getEntryIdentity);
		expect(new Set(catalogIdentities).size).toBe(181);
		expect(catalogIdentities.slice().sort()).toEqual(Object.keys(required).sort());
		expect(kitCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(kitCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
	});

	it('adds exactly 181 identities to the manifest denominator', () => {
		const manifestIdentities = Object.keys(v1LocalizationManifest.requiredCanonicalEnglish);
		const kitIdentities = Object.keys(required);

		expect(kitIdentities.every(identity => manifestIdentities.includes(identity))).toBe(true);
		expect(kitIdentities.every(identity => v1LocalizationManifest.requiredCanonicalEnglish[identity] === required[identity])).toBe(true);
		// Nothing else in the manifest addresses a Kit identity, so this slice is the whole delta.
		expect(manifestIdentities.filter(identity => identity.startsWith('element:kit-'))).toHaveLength(181);
	});

	it('leaves the four Stormwight Kits and every other Kit outside this slice', () => {
		const identities = Object.keys(required);

		[ 'kit-boren', 'kit-corven', 'kit-raden', 'kit-vuken' ].forEach(id => {
			expect(identities.some(identity => identity.startsWith(`element:${id}`))).toBe(false);
		});
		// Every standard Kit is type '', which is what separates them from the Stormwight Kits.
		expect(kits.every(kit => kit.type === '')).toBe(true);
	});

	it('carries the approved 30 Kit UI and enum-display identities', () => {
		expect(kitUIEntries).toHaveLength(30);
		expect(kitUIEntries.every(entry => entry.approval === 'approved')).toBe(true);

		// Every KitArmor and KitWeapon value has a reading; the enum values themselves are unchanged.
		expect(Object.values(KitArmor)).toEqual([ 'Light Armor', 'Medium Armor', 'Heavy Armor', 'Shield' ]);
		expect(Object.values(KitWeapon)).toEqual([ 'Bow', 'Ensnaring Weapon', 'Heavy Weapon', 'Light Weapon', 'Medium Weapon', 'Polearm', 'Unarmed Strike', 'Whip' ]);
		[ ...Object.values(KitArmor), ...Object.values(KitWeapon) ].forEach(value => {
			expect(kitUIEntries.some(entry => entry.canonicalEnglish === value)).toBe(true);
		});
	});

	it('records exactly the approved glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^(Kit|Armor|Weapon|Light Armor|Medium Armor|Heavy Armor|Shield|Bow|Ensnaring Weapon|Heavy Weapon|Light Weapon|Medium Weapon|Polearm|Unarmed Strike|Whip),/.test(row))).toEqual([
			'Kit,套裝,game-term,approved',
			'Armor,護甲,game-term,approved',
			'Weapon,武器,game-term,approved',
			'Light Armor,輕甲,game-term,approved',
			'Medium Armor,中甲,game-term,approved',
			'Heavy Armor,重甲,game-term,approved',
			'Shield,盾牌,game-term,approved',
			'Bow,弓箭,game-term,approved',
			'Ensnaring Weapon,捕縛武器,game-term,approved',
			'Heavy Weapon,重型武器,game-term,approved',
			'Light Weapon,輕型武器,game-term,approved',
			'Medium Weapon,中型武器,game-term,approved',
			'Polearm,長柄武器,game-term,approved',
			'Unarmed Strike,徒手打擊,game-term,approved',
			'Whip,鞭笞武器,game-term,approved'
		]);
		// Stats and Uses stay context-local KitPanel labels rather than reusable glossary terms.
		expect(rows.some(row => /^(Stats|Uses),/.test(row))).toBe(false);
	});

	it('keeps the catalog valid and the five parent domains unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual([
			'official-ability-authored-content',
			'class-and-subclass-level-content',
			'hero-creation-nested-authored-content',
			'hero-sheet',
			'hero-edit-semantic-keys'
		]);
		expect(result.complete).toBe(false);
	});
});

describe('Kit panel presentation', () => {
	it('renders a full Kit in zh-TW, including enum values and the feature summary', () => {
		const { container } = renderKit(getKit('kit-sword-and-board'), PanelMode.Full);

		expect(container.textContent).toContain('劍盾');
		expect(container.textContent).toContain('劍盾套裝不只提供你一面盾牌');
		expect(Array.from(container.querySelectorAll('.ant-segmented-item-label')).map(node => node.textContent)).toEqual([ '概述', '數據', '特性' ]);
		// 'Uses' joins the KitArmor and KitWeapon readings; the enum values are never shown raw.
		expect(fieldReading(container, '裝備')).toBe('中甲, 盾牌, 中型武器');
		expect(fieldReading(container, '特性')).toBe('盾擊');
		expect(container.textContent).not.toContain('Medium Armor');
		expect(container.textContent).not.toContain('Shield,');
	});

	it('renders the Stats page labels and values in zh-TW', () => {
		const { container } = renderKit(getKit('kit-sword-and-board'), PanelMode.Full);

		clickPage(container, '數據');

		expect(fieldReading(container, '護甲')).toBe('中甲, 盾牌');
		expect(fieldReading(container, '武器')).toBe('中型武器');
		expect(fieldReading(container, '體力')).toBe('+9');
		expect(fieldReading(container, '穩度')).toBe('+1');
		expect(fieldReading(container, '近戰傷害')).toBe('+2 / +2 / +2');
		expect(container.textContent).not.toContain('Stamina');
		expect(container.textContent).not.toContain('Stability');
	});

	it('renders Speed, distance and Disengage labels from a Kit that carries them', () => {
		const { container } = renderKit(getKit('kit-arcane-archer'), PanelMode.Full);

		clickPage(container, '數據');

		expect(fieldReading(container, '速度')).toBe('+1');
		expect(fieldReading(container, '遠程傷害')).toBe('+2 / +2 / +2');
		expect(fieldReading(container, '遠程射程')).toBe('+10');
		expect(fieldReading(container, '撤離')).toBe('+1');
	});

	it('renders the compact mode in zh-TW and falls back to canonical English in the English locale', () => {
		const { container } = renderKit(getKit('kit-panther'), PanelMode.Compact);

		expect(container.textContent).toContain('獵豹');
		expect(container.textContent).not.toContain('Panther');

		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

		expect(container.textContent).toContain('Panther');
		expect(container.textContent).not.toMatch(/[一-鿿]/);
	});

	it('shows the approved unnamed reading rather than an empty header', () => {
		const unnamed: Kit = { ...getKit('kit-panther'), name: '' };
		const { container } = renderKit(unnamed, PanelMode.Compact);

		expect(container.textContent).toContain('未命名套裝');
	});

	it('does not mutate the Kit it was given when switching locale', () => {
		const kit = getKit('kit-sword-and-board');
		const serialized = JSON.stringify(kit);

		renderKit(kit, PanelMode.Full);
		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

		expect(JSON.stringify(kit)).toBe(serialized);
		expect(kit.armor).toEqual([ KitArmor.Medium, KitArmor.Shield ]);
		expect(kit.weapon).toEqual([ KitWeapon.Medium ]);
	});
});

describe('Kit feature selection presentation', () => {
	const renderConfig = (data: FeatureKitData) => {
		const hero = heroWithCharacteristics();
		const feature = { id: 'test-kit-feature', name: 'Kit', description: '', type: FeatureType.Kit as const, data: data };

		return render(
			createElement(
				LocalizationProvider,
				null,
				createElement(ConfigKit, { data: data, feature: feature, hero: hero, sourcebooks: [ core ], setData: vi.fn() })
			)
		);
	};

	it('localizes the choose-a-kit action', () => {
		const { container } = renderConfig({ types: [ '' ], count: 1, selected: [] });

		expect(container.textContent).toContain('選擇 1 個套裝');
		expect(container.textContent).not.toContain('Choose a kit');
	});

	it('localizes the multi-selection count message with its placeholder filled', () => {
		const { container } = renderConfig({ types: [ '' ], count: 2, selected: [] });

		expect(container.textContent).toContain('選擇 2 個：');
		expect(container.textContent).not.toContain('Choose 2:');
	});

	it('localizes the selected Kit summary', () => {
		const { container } = renderConfig({ types: [ '' ], count: 1, selected: [ getKit('kit-panther') ] });

		expect(container.textContent).toContain('獵豹');
		expect(container.textContent).toContain('若你想兼顧防護、速度和傷害，獵豹套裝正適合你。');
		expect(container.textContent).not.toContain('The Panther kit');
	});
});

describe('Kit signature Ability presentation', () => {
	it('presents packet-approved raw content on the no-Hero path', () => {
		// Two-characteristic choice, with shift, swap-places and vertical-pull tails.
		expect(tierReading('kit-cloak-and-dagger-signature', 'sections.0.roll.tier1', 1)).toBe('2 + `力量`或`敏捷`傷害；你遁移 1 格');
		expect(tierReading('kit-martial-artist-signature', 'sections.0.roll.tier2', 2)).toBe('6 + `力量`或`敏捷`傷害；你可以與目標互換位置');
		expect(tierReading('kit-whirlwind-signature', 'sections.0.roll.tier1', 1)).toBe('3 + `力量`或`敏捷`傷害；垂直拉動 1');
		// Four-characteristic choice, with and without the Oxford comma.
		expect(tierReading('kit-arcane-archer-signature', 'sections.0.roll.tier1', 1)).toBe('3 + `敏捷`、`理智`、`直覺`或`氣場`火焰傷害');
		expect(tierReading('kit-spellsword-signature', 'sections.0.roll.tier1', 1)).toBe('3 + `力量`、`理智`、`直覺`或`氣場`閃電傷害');
		// Composite '3 damage + M or A damage'; the calculator leaves it authored without a Hero.
		expect(tierReading('kit-mountain-signature', 'sections.0.roll.tier1', 1)).toBe('3 傷害 + `力量`或`敏捷`傷害');
		// Potency and condition tails; emphasis is the one thing the calculator adds here.
		expect(tierReading('kit-sword-and-board-signature', 'sections.0.roll.tier3', 3)).toBe('7 + `力量`或`敏捷`傷害；推動 3；`力量` < [強]，**伏地**');
		expect(tierReading('kit-retiarius-signature', 'sections.0.roll.tier3', 3)).toBe('6 + `力量`或`敏捷`傷害；`敏捷` < [強]，**束縛**（EoT）');
		expect(tierReading('kit-ranger-signature', 'sections.0.roll.tier1', 1)).toBe('2 + `力量`或`敏捷`傷害；`敏捷` < [弱]，**緩速**（豁免解除）');
		expect(tierReading('kit-pugilist-signature', 'sections.0.roll.tier2', 2)).toBe('5 + `力量`或`敏捷`傷害；滑動 1');
		expect(tierReading('kit-swashbuckler-signature', 'sections.0.roll.tier2', 2)).toBe('5 + `力量`或`敏捷`傷害；推動 1');
		// Authored prose keeps its unresolved characteristic expression without a Hero.
		expect(textReading('kit-mountain-signature', 'sections.1.text')).toBe('若目標從你上個回合結束後曾對你造成傷害，此次打擊會額外造成等於你`力量`或`敏捷`（由你選擇）的傷害。');
		expect(textReading('kit-sniper-signature', 'sections.1.text')).toBe('若你在本回合沒有進行移動動作，此打擊會額外造成等於你`力量`或`敏捷`的傷害（由你選擇）。');
		expect(textReading('kit-arcane-archer-signature', 'sections.1.text')).toBe('目標 2 格內的 1 個生物或物體（由你選擇）會受到等於此招式檢定所用屬性值的火焰傷害。');
	});

	it('calculates canonical English first, then projects the resolved values', () => {
		const hero = heroWithCharacteristics();
		const ability = getAbility('kit-sword-and-board-signature');
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		expect(tierReading('kit-cloak-and-dagger-signature', 'sections.0.roll.tier1', 1, hero)).toBe('5 傷害；你遁移 1 格');
		expect(tierReading('kit-martial-artist-signature', 'sections.0.roll.tier2', 2, hero)).toBe('9 傷害；你可以與目標互換位置');
		expect(tierReading('kit-whirlwind-signature', 'sections.0.roll.tier1', 1, hero)).toBe('6 傷害；垂直拉動 1');
		expect(tierReading('kit-arcane-archer-signature', 'sections.0.roll.tier1', 1, hero)).toBe('6 火焰傷害');
		expect(tierReading('kit-spellsword-signature', 'sections.0.roll.tier1', 1, hero)).toBe('5 閃電傷害');
		expect(tierReading('kit-sword-and-board-signature', 'sections.0.roll.tier3', 3, hero)).toBe('10 傷害；推動 3；`力量` < 3，**伏地**');
		expect(tierReading('kit-retiarius-signature', 'sections.0.roll.tier3', 3, hero)).toBe('9 傷害；`敏捷` < 3，**束縛**（EoT）');
		expect(tierReading('kit-ranger-signature', 'sections.0.roll.tier1', 1, hero)).toBe('5 傷害；`敏捷` < 1，**緩速**（豁免解除）');
		expect(textReading('kit-mountain-signature', 'sections.1.text', hero)).toBe('若目標從你上個回合結束後曾對你造成傷害，此次打擊會額外造成 3 點傷害（由你選擇）。');
		expect(textReading('kit-sniper-signature', 'sections.1.text', hero)).toBe('若你在本回合沒有進行移動動作，此打擊會額外造成 3 點傷害（由你選擇）。');

		// The calculator only ever sees canonical English, and neither input was written to.
		expect(getTierEffectCreature.mock.calls.every(([ input ]) => !/[一-鿿]/.test(input))).toBe(true);
		expect(getTierEffectCreature.mock.calls.map(([ input ]) => input)).toContain('7 + M or A damage; push 3; M < [strong] prone');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);

		getTierEffectCreature.mockRestore();
	});

	it('fails closed to calculated English when the calculator rewrites the authored structure', () => {
		const hero = heroWithCharacteristics();

		// '3 damage + M or A damage' becomes one merged '6 damage'. That is a structural rewrite,
		// not a resolved value, so the approved zh-TW is not restated around it.
		expect(tierReading('kit-mountain-signature', 'sections.0.roll.tier1', 1, hero)).toBe('6 damage');
		expect(tierReading('kit-mountain-signature', 'sections.0.roll.tier3', 3, hero)).toBe('12 damage');
	});

	it('leaves an unresolved characteristic reading as approved zh-TW on the Hero path too', () => {
		const hero = heroWithCharacteristics();

		// The calculator cannot resolve 'the characteristic score used for this ability's power
		// roll', so both surfaces keep the approved raw wording rather than falling back.
		expect(textReading('kit-arcane-archer-signature', 'sections.1.text', hero)).toBe('目標 2 格內的 1 個生物或物體（由你選擇）會受到等於此招式檢定所用屬性值的火焰傷害。');
		expect(textReading('kit-warrior-priest-signature', 'sections.1.text', hero)).toBe('直到目標的下個回合結束前，他會獲得等於此招式檢定所用屬性值的傷害弱點。');
	});

	it('renders a signature Ability through the production Kit panel in both locales', () => {
		const { container } = renderKit(getKit('kit-sword-and-board'), PanelMode.Full);

		clickPage(container, '特性');

		expect(container.textContent).toContain('盾擊');
		expect(container.textContent).toContain('你手中的盾牌不僅僅是防禦工具。');
		expect(tierTexts(container)).toEqual([
			'2 + 力量或敏捷傷害；推動 1',
			'5 + 力量或敏捷傷害；推動 2',
			'7 + 力量或敏捷傷害；推動 3；力量 < [強]，伏地'
		]);

		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));
		clickPage(container, 'Features');

		expect(tierTexts(container)).toEqual([
			'2 + M or A damage; push 1',
			'5 + M or A damage; push 2',
			'7 + M or A damage; push 3; M < [strong] prone'
		]);
		expect(container.textContent).not.toMatch(/[一-鿿]/);
	});
});
