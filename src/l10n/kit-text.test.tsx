import { Catalog, loadCatalog } from '@/l10n/catalog';
import { OptionsContext, SourcebooksContext } from '@/contexts/data-context';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { kitAbilityNameKey, kitEquipmentLabel, kitEquipmentLabels, kitModifierName, kitSourceName, standardKits, stormwightKitIds } from '@/l10n/kit-text';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { AbilitiesPanel } from '@/components/panels/hero/abilities/abilities-panel';
import { ConfigKit } from '@/components/features/feature-data/kit';
import { ChoicesPanel } from '@/components/panels/hero/choices/choices-panel';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { HeroLogic } from '@/logic/hero-logic';
import { HeroSheet } from '@/models/classic-sheets/hero-sheet';
import { KitData } from '@/data/kit-data';
import { KitPanel, KitStats } from '@/components/panels/elements/kit-panel/kit-panel';
import { ModifiersCard } from '@/components/panels/classic-sheet/modifiers-card/modifiers-card';
import { PanelMode } from '@/enums/panel-mode';
import { abilityNameKey } from '@/l10n/ability-text';
import { core } from '@/data/sourcebooks/official/core';
import { createElement } from 'react';
import { mapping } from '@/l10n/mapping';
import names from '@/l10n/generated/zh-TW/names.json';
import glossary from '@/l10n/generated/zh-TW/glossary.json';
import { playerNameKey } from '@/l10n/player-name';
import { renderToStaticMarkup } from 'react-dom/server';
import { normalizeChineseSlashes, resolveText } from '@/l10n/text';
import { setLanguage } from '@/l10n/language';
import strings from '@/l10n/generated/zh-TW/strings.json';
import ui from '@/l10n/generated/zh-TW/ui.json';

vi.mock('dompurify', () => ({
	default: {
		sanitize: (html: string) => html
	}
}));

vi.mock('@/hooks/use-clipboard', () => ({
	useClipboard: () => ({
		hasData: () => false,
		getData: () => null,
		setData: () => undefined
	})
}));

const generated = { ...glossary, ...names, ...strings } as Catalog;
let store: Record<string, string>;

beforeEach(() => {
	store = {};
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => (key in store ? store[key] : null),
		setItem: (key: string, value: string) => { store[key] = value; }
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('standard kit localization', () => {
	test('translates all approved kit stat labels and reuses the approved Disengage glossary term', async () => {
		setLanguage('zh-TW');
		await loadCatalog();
		const kit = {
			...KitData.raider,
			meleeDamage: { tier1: 1, tier2: 2, tier3: 3 },
			rangedDamage: { tier1: 4, tier2: 5, tier3: 6 },
			meleeDistance: 1,
			rangedDistance: 2,
			disengage: 1
		};
		const rendered = renderToStaticMarkup(createElement(KitStats, { kit }));
		const expected = [
			[ 'Weapon', 'ui.hero-builder.weapon.1710782c' ],
			[ 'Melee Damage', 'ui.hero-builder.melee-damage.025e8b60' ],
			[ 'Ranged Damage', 'ui.hero-builder.ranged-damage.ed353d2b' ],
			[ 'Melee Distance', 'ui.hero-builder.melee-distance.7c498629' ],
			[ 'Ranged Distance', 'ui.hero-builder.ranged-distance.b55a9de7' ]
		] as const;
		expected.forEach(([ , id ]) => expect(rendered).toContain(ui[id].zh));
		expect(rendered).toContain(glossary['term.disengage-action'].zh);
		expect(rendered).toContain('+1 / +2 / +3');
		expect(rendered).toContain('+4 / +5 / +6');
		expect(rendered).toContain('+1');

		setLanguage('en');
		const english = renderToStaticMarkup(createElement(KitStats, { kit }));
		expected.forEach(([ source ]) => expect(english).toContain(source));
		expect(english).toContain('Disengage');
	});

	test('translates the twelve approved equipment values and preserves unknown values', async () => {
		setLanguage('zh-TW');
		await loadCatalog();
		const expected: Record<string, string> = {
			'Light Armor': 'term.light-armor',
			'Medium Armor': 'term.medium-armor',
			'Heavy Armor': 'term.heavy-armor',
			'Shield': 'term.shield',
			'Light Weapon': 'term.light-weapon',
			'Medium Weapon': 'term.medium-weapon',
			'Heavy Weapon': 'term.heavy-weapon',
			'Bow': 'term.bow',
			'Ensnaring Weapon': 'term.ensnaring-weapon',
			'Polearm': 'term.polearm',
			'Unarmed Strike': 'term.unarmed-strike',
			'Whip': 'term.whip'
		};
		Object.entries(expected).forEach(([ english, sheetId ]) => expect(kitEquipmentLabel(english)).toBe(generated[sheetId].zh));
		expect(kitEquipmentLabels([ 'Light Armor', 'Bow', 'Custom Weapon' ]))
			.toBe(`${generated['term.light-armor'].zh}, ${generated['term.bow'].zh}, Custom Weapon`);
		setLanguage('en');
		expect(kitEquipmentLabel('Light Armor')).toBe('Light Armor');
	});

	test('resolves the approved names and exact descriptions across all 21 standard kits', async () => {
		setLanguage('zh-TW');
		await loadCatalog();
		expect(standardKits).toHaveLength(21);
		expect(standardKits.some(kit => stormwightKitIds.has(kit.id))).toBe(false);

		const mappedNames: string[] = [];
		const mappedDescriptions: string[] = [];
		const mappedAbilities: string[] = [];
		standardKits.forEach(kit => {
			const nameKey = playerNameKey(kit, [ core ]);
			if (mapping[`element:${kit.id}:name`]) {
				expect(nameKey).toBe(`element:${kit.id}:name`);
				mappedNames.push(kit.id);
				const entry = mapping[nameKey!];
				expect(resolveText('zh-TW', nameKey, kit.name, { [nameKey!]: entry.sheetId }, generated)).toBe(generated[entry.sheetId].zh);
			} else {
				expect(nameKey).toBeUndefined();
			}

			const descriptionKey = `element:${kit.id}:description`;
			if (mapping[descriptionKey]) {
				mappedDescriptions.push(kit.id);
				const entry = mapping[descriptionKey];
				expect(resolveText('zh-TW', descriptionKey, kit.description, { [descriptionKey]: entry.sheetId }, generated)).toBe(generated[entry.sheetId].zh);
			} else {
				expect(resolveText('zh-TW', descriptionKey, kit.description, {}, generated)).toBe(kit.description);
			}

			const abilityFeature = kit.features.find(feature => feature.type === FeatureType.Ability);
			if (!abilityFeature || abilityFeature.type !== FeatureType.Ability) {
				return;
			}
			const ability = abilityFeature.data.ability;
			const abilityKey = kitAbilityNameKey(ability);
			expect(abilityNameKey(ability)).toBe(abilityKey);
			if (abilityKey) {
				mappedAbilities.push(kit.id);
				const entry = mapping[abilityKey];
				expect(resolveText('zh-TW', abilityKey, ability.name, { [abilityKey]: entry.sheetId }, generated)).toBe(generated[entry.sheetId].zh);
			} else {
				expect(abilityNameKey({ ...ability, name: `${ability.name} (custom)` })).toBeUndefined();
			}
		});

		expect(mappedNames).toHaveLength(21);
		expect(mappedDescriptions).toHaveLength(21);
		expect(mappedAbilities).toHaveLength(21);
		expect(Object.keys(mapping).filter(key => key.startsWith('element:kit-'))).toHaveLength(84);
		const arcaneArcherName = generated[mapping['element:kit-arcane-archer:name'].sheetId].zh;
		const pantherName = generated[mapping['element:kit-panther:name'].sheetId].zh;
		expect(kitModifierName('Arcane Archer & Panther', [ KitData.arcaneArcher, KitData.panther ])).toBe(`${arcaneArcherName} & ${pantherName}`);
		expect(kitModifierName('Arcane Archer (custom) & Panther', [ KitData.arcaneArcher, KitData.panther ])).toBe(`Arcane Archer (custom) & ${pantherName}`);
		expect(kitSourceName('Arcane Archer', [ KitData.arcaneArcher ])).toBe(generated[mapping['element:kit-arcane-archer:name'].sheetId].zh);
		expect(kitSourceName('Homebrew Archer', [ { ...KitData.arcaneArcher, name: 'Homebrew Archer' } ])).toBe('Homebrew Archer');
		setLanguage('en');
	});

	test('shows the mapped name, description, and signature name in compact and full kit panels', async () => {
		setLanguage('zh-TW');
		await loadCatalog();
		const kit = KitData.arcaneArcher;
		const render = (mode?: PanelMode) => renderToStaticMarkup(
			createElement(SourcebooksContext, { value: [ core ] }, createElement(KitPanel, { kit, sourcebooks: [ core ], mode }))
		);
		const compact = render();
		const full = render(PanelMode.Full);
		const rapidFire = renderToStaticMarkup(createElement(SourcebooksContext, { value: [ core ] }, createElement(KitPanel, {
			kit: KitData.rapidFire, sourcebooks: [ core ]
		})));
		const mountain = renderToStaticMarkup(createElement(SourcebooksContext, { value: [ core ] }, createElement(KitPanel, {
			kit: KitData.mountain, sourcebooks: [ core ], mode: PanelMode.Full
		})));
		const name = generated[mapping['element:kit-arcane-archer:name'].sheetId].zh;
		const rapidFireName = generated[mapping['element:kit-rapid-fire:name'].sheetId].zh;
		const ability = generated[mapping['element:kit-arcane-archer-signature:name'].sheetId].zh;

		expect(compact).toContain(name);
		expect(full).toContain(ui['ui.hero-builder.stats.b4a73657'].zh);
		expect(full).toContain(ui['ui.hero-builder.uses.9e6151ac'].zh);
		expect(compact).toContain(generated[mapping['element:kit-arcane-archer:description'].sheetId].zh);
		expect(full).toContain(name);
		expect(full).toContain(ability);
		expect(full).toContain(generated['term.bow'].zh);
		expect(mountain).toContain(generated['term.heavy-armor'].zh);
		expect(mountain).toContain(generated['term.heavy-weapon'].zh);
		expect(rapidFire).toContain(rapidFireName);
	});

	test('shows translated equipment values in the selected-kit hero summary', async () => {
		setLanguage('zh-TW');
		await loadCatalog();
		const options = FactoryLogic.createOptions();
		const hero = FactoryLogic.createHero();
		const feature = FactoryLogic.feature.createKitChoice({ id: 'test-kit-choice', count: 1 });
		feature.data.selected = [ KitData.mountain ];
		hero.features = [ feature ];
		const summary = renderToStaticMarkup(createElement(OptionsContext, { value: options }, createElement(SourcebooksContext, { value: [ core ] }, createElement(ChoicesPanel, {
			hero,
			sourcebooks: [ core ],
			onSelectAncestry: () => undefined,
			onSelectCulture: () => undefined,
			onSelectCareer: () => undefined,
			onSelectClass: () => undefined,
			onSelectComplication: () => undefined,
			onSelectDomain: () => undefined,
			onSelectKit: () => undefined,
			onSelectTitle: () => undefined,
			onShowState: () => undefined
		}))));
		expect(summary).toContain(generated['term.heavy-armor'].zh);
		expect(summary).toContain(generated['term.heavy-weapon'].zh);
	});

	test('keeps mapped names in kit configuration, ability panels, and classic modifiers', async () => {
		setLanguage('zh-TW');
		await loadCatalog();
		const kit = KitData.arcaneArcher;
		const options = FactoryLogic.createOptions();
		const hero = FactoryLogic.createHero();
		const feature = FactoryLogic.feature.createKitChoice({ id: 'test-kit-choice', count: 1 });
		const selectedKits = [ kit, KitData.panther ];
		const data = { ...feature.data, selected: selectedKits };
		feature.data.selected = selectedKits;
		hero.features = [ feature ];
		expect(HeroLogic.getKits(hero).map(item => item.id)).toEqual(selectedKits.map(item => item.id));
		const signature = kit.features.find(item => item.type === FeatureType.Ability);
		if (!signature || signature.type !== FeatureType.Ability) {
			throw new Error('Expected Arcane Archer to have a signature ability.');
		}
		const config = renderToStaticMarkup(createElement(SourcebooksContext, { value: [ core ] }, createElement(ConfigKit, {
			data,
			feature,
			hero,
			sourcebooks: [ core ],
			setData: () => undefined
		})));
		const ability = renderToStaticMarkup(createElement(OptionsContext, { value: options }, createElement(AbilityPanel, {
			ability: signature.data.ability,
			mode: PanelMode.Compact
		})));
		vi.stubGlobal('window', { matchMedia: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }) });
		const abilitySourceTag = renderToStaticMarkup(createElement(OptionsContext, { value: { ...options, compactView: true, showSources: true } }, createElement(AbilitiesPanel, {
			title: 'Abilities',
			abilities: [ { ability: signature.data.ability, source: kit.name, level: undefined } ],
			hero,
			onSelectAbility: () => undefined
		})));
		const character = {
			hero,
			modifierTypes: [ 'Kit' ],
			modifierName: 'Arcane Archer & Panther',
			modifierWeaponImplement: '',
			modifierArmorWard: '',
			modifierBenefits: [],
			immunities: [],
			weaknesses: [],
			stamina: {},
			recoveries: {},
			extraComplications: [],
			projects: [],
			abilities: [],
			standardAbilities: [],
			followers: [],
			summons: [],
			fixtures: [],
			featuresReferenceOther: [],
			extraReferenceItems: [],
			notes: ''
		} as HeroSheet;
		const modifiers = renderToStaticMarkup(createElement(ModifiersCard, { character }));
		const kitName = generated[mapping['element:kit-arcane-archer:name'].sheetId].zh;
		const abilityName = generated[mapping['element:kit-arcane-archer-signature:name'].sheetId].zh;

		expect(config).toContain(kitName);
		expect(config).toContain(`<span class="field-label">${kitName}</span>`);
		expect(config).toContain(generated[mapping['element:kit-arcane-archer:description'].sheetId].zh);
		expect(ability).toContain(abilityName);
		expect(abilitySourceTag).toContain(kitName);
		const modifierName = [ KitData.arcaneArcher, KitData.panther ].map(item => {
			const entry = mapping[`element:${item.id}:name`];
			return generated[entry.sheetId].zh;
		}).join(' & ');
		expect(modifiers).toContain(modifierName.replace(' & ', ' &amp; '));
		expect(kitModifierName('Arcane Archer (custom) & Panther', [ KitData.arcaneArcher, KitData.panther ]))
			.toBe(`Arcane Archer (custom) & ${modifierName.split(' & ')[1]}`);
		expect(kitModifierName('Arcane Archer & Panther', [ { ...KitData.arcaneArcher, id: 'homebrew-archer' }, KitData.panther ]))
			.toBe(`Arcane Archer & ${modifierName.split(' & ')[1]}`);
	});

	test('localizes approved Classic View kit labels and equipment values', async () => {
		setLanguage('zh-TW');
		await loadCatalog();
		const hero = FactoryLogic.createHero();
		const feature = FactoryLogic.feature.createKitChoice({ id: 'test-classic-kit' });
		feature.data.selected = [ KitData.arcaneArcher ];
		hero.features = [ feature ];
		const signatureFeature = KitData.arcaneArcher.features.find(item => item.type === FeatureType.Ability);
		if (!signatureFeature || signatureFeature.type !== FeatureType.Ability) {
			throw new Error('Expected Arcane Archer to have a signature feature.');
		}
		const character = {
			hero,
			modifierTypes: [ 'Kit' ],
			modifierName: 'Arcane Archer',
			modifierWeaponImplement: 'Bow, Light Weapon',
			modifierArmorWard: 'Light Armor',
			modifierSpeed: 1,
			modifierDisengage: 2,
			modifierStamina: 3,
			modifierStability: 4,
			modifierMeleeDistance: 5,
			modifierRangedDistance: 6,
			modifierMeleeDamageT1: 1,
			modifierMeleeDamageT2: 2,
			modifierMeleeDamageT3: 3,
			modifierRangedDamageT1: 4,
			modifierRangedDamageT2: 5,
			modifierRangedDamageT3: 6,
			modifierBenefits: [ signatureFeature ],
			immunities: [],
			weaknesses: [],
			stamina: {},
			recoveries: {},
			extraComplications: [],
			projects: [],
			abilities: [],
			standardAbilities: [],
			followers: [],
			summons: [],
			fixtures: [],
			featuresReferenceOther: [],
			extraReferenceItems: [],
			notes: ''
		} as HeroSheet;
		const rendered = renderToStaticMarkup(createElement(ModifiersCard, { character }));
		[
			ui['ui.hero-builder.kit.63d5adfa'].zh,
			generated['term.light-armor'].zh,
			generated['term.bow'].zh,
			ui['ui.hero-builder.speed.a2b81141'].zh,
			generated['term.stamina'].zh,
			generated['term.stability'].zh,
			generated['term.disengage-action'].zh,
			ui['ui.hero-builder.melee-distance.7c498629'].zh,
			ui['ui.hero-builder.ranged-distance.b55a9de7'].zh
		].forEach(label => expect(rendered).toContain(label));
		expect(rendered).toContain(generated[mapping['element:kit-arcane-archer-signature:name'].sheetId].zh);
		expect(rendered).toContain(ui['ui.hero-builder.main-action.147a0625'].zh);
		expect(rendered).toContain(ui['ui.hero-builder.classic-equipment-and-modifiers.94215895'].zh);
		expect(rendered).toContain(normalizeChineseSlashes(ui['ui.hero-builder.classic-weapon-implement.23348605'].zh));
		expect(rendered).toContain(normalizeChineseSlashes(ui['ui.hero-builder.classic-armor-ward.cc07ef85'].zh));
		expect(rendered).toContain(ui['ui.hero-builder.classic-melee-damage-bonus.a17961ad'].zh);
		expect(rendered).toContain(ui['ui.hero-builder.classic-ranged-damage-bonus.0ea33528'].zh);
		expect(rendered).toContain(ui['ui.hero-builder.classic-effects.358511c8'].zh);
		expect(rendered).not.toContain('Bow, Light Weapon');
		setLanguage('en');
		const renderedEnglish = renderToStaticMarkup(createElement(ModifiersCard, { character }));
		[
			'Equipment and Modifiers',
			'Weapon / Implement',
			'Armor / Ward',
			'Melee Damage Bonus',
			'Ranged Damage Bonus',
			'Effects'
		].forEach(label => expect(renderedEnglish).toContain(label));
	});
});
