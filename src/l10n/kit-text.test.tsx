import { Catalog, loadCatalog } from '@/l10n/catalog';
import { OptionsContext, SourcebooksContext } from '@/contexts/data-context';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { kitAbilityNameKey, kitModifierName, standardKits, stormwightKitIds } from '@/l10n/kit-text';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { ConfigKit } from '@/components/features/feature-data/kit';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { HeroLogic } from '@/logic/hero-logic';
import { HeroSheet } from '@/models/classic-sheets/hero-sheet';
import { KitData } from '@/data/kit-data';
import { KitPanel } from '@/components/panels/elements/kit-panel/kit-panel';
import { ModifiersCard } from '@/components/panels/classic-sheet/modifiers-card/modifiers-card';
import { PanelMode } from '@/enums/panel-mode';
import { abilityNameKey } from '@/l10n/ability-text';
import { core } from '@/data/sourcebooks/official/core';
import { createElement } from 'react';
import { mapping } from '@/l10n/mapping';
import names from '@/l10n/generated/zh-TW/names.json';
import { playerNameKey } from '@/l10n/player-name';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveText } from '@/l10n/text';
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

const generated = { ...names, ...strings } as Catalog;
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
	test('resolves the approved names and exact descriptions across all 21 standard kits', () => {
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

		expect(mappedNames).toHaveLength(20);
		expect(mappedDescriptions).toHaveLength(21);
		expect(mappedAbilities).toHaveLength(19);
		expect(Object.keys(mapping).filter(key => key.startsWith('element:kit-'))).toHaveLength(60);
		setLanguage('en');
		expect(kitModifierName('Arcane Archer & Panther', [ KitData.arcaneArcher, KitData.panther ])).toBe('Arcane Archer & Panther');
		expect(kitModifierName('Arcane Archer (custom) & Panther', [ KitData.arcaneArcher, KitData.panther ])).toBe('Arcane Archer (custom) & Panther');
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
		const name = generated[mapping['element:kit-arcane-archer:name'].sheetId].zh;
		const ability = generated[mapping['element:kit-arcane-archer-signature:name'].sheetId].zh;

		expect(compact).toContain(name);
		expect(full).toContain(ui['ui.hero-builder.stats.b4a73657'].zh);
		expect(full).toContain(ui['ui.hero-builder.uses.9e6151ac'].zh);
		expect(compact).toContain(generated[mapping['element:kit-arcane-archer:description'].sheetId].zh);
		expect(full).toContain(name);
		expect(full).toContain(ability);
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
		expect(config).toContain(generated[mapping['element:kit-arcane-archer:description'].sheetId].zh);
		expect(ability).toContain(abilityName);
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
});
