import { AncestryData } from '@/data/ancestry-data';
import { FeatureComponent } from '@/components/panels/classic-sheet/components/feature-component';
import { InfoDamageModifier } from '@/components/features/feature-data/damage-modifier';
import { InfoMovementMode } from '@/components/features/feature-data/movement-mode';
import { InfoRollModifier } from '@/components/features/feature-data/roll-modifier';
import { InfoBonus } from '@/components/features/feature-data/bonus';
import { InfoSurgeGain } from '@/components/features/feature-data/surge-gain';
import { InfoChoice } from '@/components/features/feature-data/choice';
import { AbilityCard } from '@/components/panels/classic-sheet/ability-card/ability-card';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { AbilityInfoPanel } from '@/components/panels/ability-info/ability-info-panel';
import { Feature, isFeature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { OptionsContext, SourcebooksContext } from '@/contexts/data-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { HeroSheetBuilder } from '@/logic/hero-sheet/hero-sheet-builder';
import { ClassicSheetBuilder } from '@/logic/classic-sheet/classic-sheet-builder';
import { PerksCard } from '@/components/panels/classic-sheet/perks-card/perks-card';
import { Catalog, loadCatalog } from '@/l10n/catalog';
import { hasCalculationBinding } from '@/l10n/calculated-text';
import { mapping } from '@/l10n/mapping';
import { setLanguage } from '@/l10n/language';
import { translate } from '@/l10n/text';
import { applyUITemplate } from '@/l10n/ui-text';
import { abilityMetadataLabel, ancestryAbilityMetadataValue, ancestryAbilityRollHeader, ancestryAbilityTarget, ancestryAbilityTier, ancestryAbilityTriggerText } from '@/l10n/ability-text';
import { ancestryDamageModifierText } from '@/l10n/damage-modifier-ui';
import { PowerRollPanel } from '@/components/panels/power-roll/power-roll-panel';
import { useUI } from '@/l10n/ui-text';
import { core } from '@/data/sourcebooks/official/core';
import { Sourcebook } from '@/models/sourcebook';
import { Options } from '@/models/options';
import { PanelMode } from '@/enums/panel-mode';
import strings from '@/l10n/generated/zh-TW/strings.json';
import adaptations from '@/l10n/generated/zh-TW/adaptations.json';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

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

const sourcebooks: Sourcebook[] = [ core ];
const catalog = strings as Catalog;
const approvedAdaptations = Object.values(adaptations) as Array<{
	usageKey: string;
	zh: string;
	calculationDisplay?: { target: string; template: string };
}>;
const approvedChinese = (key: string) => {
	const usage = approvedAdaptations.find(adaptation => adaptation.usageKey === key);
	if (usage) {
		return usage.zh;
	}
	const row = mapping[key];
	return row ? catalog[row.sheetId]?.fs?.zh ?? catalog[row.sheetId]?.zh : undefined;
};

const calculatedChinese = (key: string, value: string) => {
	const row = approvedAdaptations.find(item => item.usageKey === key)
		?? catalog[mapping[key]?.sheetId]?.fs;
	const adaptation = row as { zh: string; calculationDisplay?: { target: string; template: string } } | undefined;
	if (!adaptation?.calculationDisplay) {
		return undefined;
	}
	const targetIndex = adaptation.zh.indexOf(adaptation.calculationDisplay.target);
	const beforeTarget = adaptation.zh.slice(0, targetIndex);
	const spacing = /[\u3400-\u9fff]$/.test(beforeTarget) ? ' ' : '';
	return adaptation.zh.replace(adaptation.calculationDisplay.target, spacing + adaptation.calculationDisplay.template.replace('{value}', value));
};

const collectFeatures = () => {
	const features: Feature[] = [];
	const seen = new Set<string>();
	const visit = (value: unknown) => {
		if (!value || typeof value !== 'object') {
			return;
		}
		if (isFeature(value)) {
			if (!seen.has(value.id)) {
				seen.add(value.id);
				features.push(value);
			}
			if (value.type === FeatureType.Choice) {
				value.data.options.forEach(option => visit(option.feature));
			} else if (value.type === FeatureType.Multiple) {
				value.data.features.forEach(visit);
			}
			return;
		}
		Object.values(value).forEach(visit);
	};
	Object.values(AncestryData).forEach(ancestry => ancestry.features.forEach(visit));
	return features;
};

const render = (feature: Feature) => renderToStaticMarkup(
	createElement(SourcebooksContext, { value: sourcebooks },
		createElement(OptionsContext, { value: FactoryLogic.createOptions() },
			createElement(FeatureComponent, { feature })
		)
	)
);

const plainText = (html: string) => html.replace(/<[^>]*>/g, '').replaceAll('&nbsp;', ' ');

describe('classic ancestry approved display coverage', () => {
	beforeEach(async () => {
		await loadCatalog();
		vi.stubGlobal('localStorage', {
			getItem: () => 'zh-TW',
			setItem: () => undefined
		});
		setLanguage('zh-TW');
		vi.stubGlobal('window', {
			matchMedia: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined })
		});
	});

	test('all mapped ancestry names and descriptions render their approved Chinese in FeatureComponent', () => {
		const failures: string[] = [];
		const features = collectFeatures();
		for (const feature of features) {
			const html = plainText(render(feature));
			const nameKey = `element:${feature.id}:name`;
			const nameRow = mapping[nameKey];
			const nameChinese = nameRow && catalog[nameRow.sheetId]?.zh;
			if (nameChinese && ![ FeatureType.Choice, FeatureType.Multiple ].includes(feature.type) && !html.includes(nameChinese)) {
				failures.push(`${feature.id} (${feature.type}) name: ${feature.name} → ${nameChinese}; rendered=${html}`);
			}

			const descriptionKey = `element:${feature.id}:description`;
			const descriptionChinese = approvedChinese(descriptionKey);
			const displaysDescription = [ FeatureType.Text, FeatureType.Ability ].includes(feature.type)
				|| (feature.type === FeatureType.Multiple && !!feature.description)
				|| feature.type === FeatureType.PotencyResistance;
			if (descriptionChinese && displaysDescription && feature.description
				&& !hasCalculationBinding(descriptionKey)
				&& !html.includes(descriptionChinese.slice(0, 12))) {
				failures.push(`${feature.id} (${feature.type}) description: ${feature.name}; rendered=${html}`);
			}
		}
		expect(features.length).toBeGreaterThan(130);
		expect(failures).toEqual([]);
	});

	test('all mapped ancestry ability sections render their approved Chinese in AbilityCard', () => {
		const hero = FactoryLogic.createHero();
		const options = FactoryLogic.createOptions() as Options;
		const failures: string[] = [];
		for (const feature of collectFeatures()) {
			if (feature.type !== FeatureType.Ability) {
				continue;
			}
			const html = plainText(renderToStaticMarkup(createElement(AbilityCard, {
				ability: ClassicSheetBuilder.buildAbilitySheet(feature.data.ability, hero, undefined, options)
			})));
			if (feature.id === 'dragon-knight-feature-2-1') {
				// The approved display binding keeps the calculated level in Chinese.
				expect(html).toContain(calculatedChinese('section:dragon-knight-feature-2-1:0', '1'));
				continue;
			}
			for (const key of Object.keys(mapping)) {
				if (!key.startsWith(`section:${feature.id}:`)) {
					continue;
				}
				const chinese = approvedChinese(key);
				if (chinese && !html.includes(chinese.slice(0, 12))) {
					failures.push(`${feature.id} ${key}: ${chinese}; rendered=${html}`);
				}
			}
		}
		expect(failures).toEqual([]);
	});

	test('translates official ancestry damage modifiers in feature details and Classic View', () => {
		const feature = AncestryData.revenant.features.find(item => item.id === 'revenant-feature-2');
		if (!feature || feature.type !== FeatureType.DamageModifier) {
			throw new Error('Revenant damage modifier feature is missing');
		}

		const detail = plainText(renderToStaticMarkup(createElement(SourcebooksContext, { value: sourcebooks },
			createElement(InfoDamageModifier, { data: feature.data, feature, sourcebooks })
		)));
		const uiText = (id: string, english: string) => translate(`ui:${id}`, english);
		const title = uiText('ui.hero-builder.damage-modifier.a9292a2f', 'Damage Modifier');
		expect(title).not.toBe('Damage Modifier');
		expect(detail).toContain(
			uiText('ui.hero-builder.cold.f151cd9e', 'Cold')
				+ uiText('ui.hero-builder.immunity.806f8b53', 'Immunity')
				+ uiText('ui.hero-builder.per-level.1caaa3dd', '+1 per level')
		);
		expect(detail).toContain(uiText('ui.hero-builder.fire.c141faa8', 'Fire')
			+ uiText('ui.hero-builder.weakness.f3e0689e', 'Weakness') + ' +5');
		expect(detail).not.toContain('Immunity');

		const classic = plainText(render(feature));
		expect(classic).toContain(`- ${uiText('ui.hero-builder.immunity.806f8b53', 'Immunity')}\uFF1A ${uiText('ui.hero-builder.cold.f151cd9e', 'Cold')} 1`);
		expect(classic).toContain(`- ${uiText('ui.hero-builder.weakness.f3e0689e', 'Weakness')}\uFF1A ${uiText('ui.hero-builder.fire.c141faa8', 'Fire')} 5`);
		expect(classic).not.toContain('Cold');
		expect(classic).not.toContain('Weakness');

		const renamed = structuredClone(feature);
		renamed.name = 'My Damage Modifier';
		const custom = plainText(renderToStaticMarkup(createElement(SourcebooksContext, { value: sourcebooks },
			createElement(InfoDamageModifier, { data: renamed.data, feature: renamed, sourcebooks })
		)));
		expect(custom).toContain('Cold Immunity +1 per level');
	});

	test('the Revenant ancestry section localizes approved labels and protects unbound dynamic text', () => {
		const hero = FactoryLogic.createHero();
		hero.ancestry = structuredClone(AncestryData.revenant);
		const purchasedTraits = hero.ancestry.features.find(feature => feature.id === 'revenant-feature-4');
		if (!purchasedTraits || purchasedTraits.type !== FeatureType.Choice) {
			throw new Error('Revenant Purchased Traits choice is missing');
		}
		purchasedTraits.data.selected = [ purchasedTraits.data.options.find(option => option.feature.id === 'revenant-feature-4-5')!.feature ];
		const options = FactoryLogic.createOptions() as Options;
		const sheet = HeroSheetBuilder.buildHeroSheet(hero, sourcebooks, options);
		const html = () => plainText(renderToStaticMarkup(
			createElement(SourcebooksContext, { value: sourcebooks },
				createElement(OptionsContext, { value: options }, createElement(PerksCard, { character: sheet }))
			)
		));
		const chinese = html();
		expect(chinese).toContain(approvedChinese('element:revenant-feature-3:name'));
		expect(chinese).toContain(approvedChinese('element:revenant-feature-3:description')!.slice(0, 12));
		expect(chinese).toContain(calculatedChinese('element:revenant-feature-3:description', '0'));
		expect(chinese).toContain(approvedChinese('element:revenant-feature-4-5-1:name'));
		expect(chinese).toContain(approvedChinese('element:revenant-feature-4-5-1:description')!.slice(0, 12));
		expect(chinese).not.toContain('As a maneuver, you place a magic sigil');
		expect(chinese).not.toContain('You can have an active number of sigils equal to 1');
		expect(chinese).toContain(approvedChinese('element:revenant-feature-4-5-2:name'));
		const mainAction = translate('ui:ui.hero-builder.main-action.147a0625', 'Main Action');
		expect(mainAction).not.toBe('Main Action');
		expect(chinese).toContain(mainAction);
		expect(chinese).not.toContain('A magic sigil you placed on a creature explodes with energy.');
		const detonate = collectFeatures().find(feature => feature.id === 'revenant-feature-4-5-2');
		if (!detonate || detonate.type !== FeatureType.Ability) {
			throw new Error('Revenant Detonate Sigil ability is missing');
		}
		const abilityCard = plainText(renderToStaticMarkup(createElement(AbilityCard, {
			ability: ClassicSheetBuilder.buildAbilitySheet(detonate.data.ability, hero, undefined, options)
		})));
		expect(abilityCard).toContain(mainAction);
		expect(abilityCard).not.toContain('Main Action');
	});

	test('approved dynamic ancestry descriptions render in feature panels with a hero', () => {
		const hero = FactoryLogic.createHero();
		hero.class = FactoryLogic.createClass();
		hero.class.level = 3;
		hero.class.characteristics = FactoryLogic.createCharacteristics(4, 2, 0, 0, 0);
		const options = FactoryLogic.createOptions() as Options;
		const renderFeaturePanel = (id: string) => {
			const feature = collectFeatures().find(item => item.id === id);
			if (!feature) {
				throw new Error(`Missing ancestry feature ${id}`);
			}
			return plainText(renderToStaticMarkup(createElement(SourcebooksContext, { value: sourcebooks },
				createElement(OptionsContext, { value: options }, createElement(FeaturePanel, {
					feature,
					hero,
					sourcebooks,
					mode: PanelMode.Full
				}))
			)));
		};

		const tail = renderFeaturePanel('devil-feature-2-1');
		expect(tail).toContain(calculatedChinese('element:devil-feature-2-1:description', '4'));
		expect(tail).not.toContain('Your pointy tail allows you');
		const wings = renderFeaturePanel('devil-feature-2-7a');
		expect(wings).toContain(calculatedChinese('element:devil-feature-2-7a:description', '4'));
		expect(wings).not.toContain('You possess wings powerful enough');
		const polder = renderFeaturePanel('polder-feature-3-1');
		expect(polder).toContain(approvedChinese('element:polder-feature-3-1:description')!.slice(0, 12));
		expect(polder).not.toContain('Your innate shadow magic grants you');
	});

	test('official ancestry ability metadata uses approved UI and glossary entries', () => {
		const devil = collectFeatures().find(feature => feature.id === 'devil-feature-2-3');
		const guard = collectFeatures().find(feature => feature.id === 'dragon-knight-feature-2-1');
		const mode = collectFeatures().find(feature => feature.id === 'devil-feature-2-7b');
		if (!devil || devil.type !== FeatureType.Ability || !guard || guard.type !== FeatureType.Ability || !mode || mode.type !== FeatureType.MovementMode) {
			throw new Error('Expected official ancestry ability and movement mode features');
		}
		const ui = {
			language: 'zh-TW',
			text: (id: string, english: string) => translate(`ui:${id}`, english),
			format: (id: string, source: string, english: string, values: Record<string, string | number>) =>
				applyUITemplate(translate(`ui:${id}`, source), source, english, values)
		} as ReturnType<typeof useUI>;
		const glowingEyes = devil.data.ability;
		const draconianGuard = guard.data.ability;
		const actionType = abilityMetadataLabel(glowingEyes, 'Triggered Action', ui);
		const triggerLabel = abilityMetadataLabel(glowingEyes, 'Trigger', ui);
		const distanceTargetLabel = abilityMetadataLabel(draconianGuard, 'Distance / Target', ui);
		expect(actionType).toBe(translate('ui:ui.hero-builder.triggered-action.5550c36a', 'Triggered Action'));
		expect(triggerLabel).toBe(translate('ui:ui.hero-builder.trigger.8b9c6437', 'Trigger'));
		expect(distanceTargetLabel).toBe(translate('ui:ui.hero-builder.distance-target.2c3fa3ef', 'Distance / Target'));
		expect(ancestryAbilityMetadataValue(draconianGuard, 'Self', ui)).toBe(translate('ui:ui.hero-builder.self.85bc0f95', 'Self'));
		expect(ancestryAbilityTriggerText(draconianGuard, draconianGuard.type.trigger, ui)).toBe(translate('ui:ui.hero-builder.trigger-draconian-guard.59674111', draconianGuard.type.trigger));
		expect(abilityMetadataLabel(draconianGuard, 'Magic', ui)).toBe(translate('enum:AbilityKeyword:Magic', 'Magic'));
		const pride = collectFeatures().find(feature => feature.id === 'dragon-knight-feature-2-9');
		if (!pride || pride.type !== FeatureType.Ability) {
			throw new Error('Draconic Pride ability is missing');
		}
		expect(abilityMetadataLabel(pride.data.ability, 'Area', ui)).toBe(translate('ui:ui.hero-builder.ancestry-area.024dc204', 'Area'));

		const guardInfo = plainText(renderToStaticMarkup(createElement(AbilityInfoPanel, { ability: draconianGuard })));
		expect(guardInfo).toContain(actionType);
		expect(guardInfo).toContain(distanceTargetLabel);
		expect(guardInfo).toContain(triggerLabel);
		expect(guardInfo).toContain(ancestryAbilityTriggerText(draconianGuard, draconianGuard.type.trigger, ui));
		expect(guardInfo).not.toContain('takes damage from a strike');
		expect(guardInfo).toContain(translate('ui:ui.hero-builder.self.85bc0f95', 'Self'));
		expect(guardInfo).not.toContain('Triggered Action');
		expect(guardInfo).not.toContain('Distance / Target');

		const modeText = plainText(renderToStaticMarkup(createElement(InfoMovementMode, { data: mode.data, feature: mode })));
		expect(modeText).toContain(translate('element:devil-feature-2-7b:mode', 'Fly'));
		expect(modeText).not.toContain('Fly');
	});

	test('approved ancestry move metadata and power-roll formats keep their upstream numbers', () => {
		const features = collectFeatures();
		const prideFeature = features.find(feature => feature.id === 'dragon-knight-feature-2-9');
		const breathFeature = features.find(feature => feature.id === 'dragon-knight-feature-2-10');
		if (!prideFeature || prideFeature.type !== FeatureType.Ability || !breathFeature || breathFeature.type !== FeatureType.Ability) {
			throw new Error('Dragon Knight move features are missing');
		}
		const ui = {
			language: 'zh-TW',
			text: (id: string, english: string) => translate(`ui:${id}`, english),
			format: (id: string, source: string, english: string, values: Record<string, string | number>) =>
				applyUITemplate(translate(`ui:${id}`, source), source, english, values)
		} as ReturnType<typeof useUI>;
		const pride = prideFeature.data.ability;
		const breath = breathFeature.data.ability;
		const prideRoll = pride.sections.find(section => section.type === 'roll');
		expect(ancestryAbilityMetadataValue(pride, '1 Burst', ui)).toBe(ui.format('ui.hero-builder.ancestry-burst.b3ee1661', '{value} Burst', '1 Burst', { value: '1' }));
		expect(ancestryAbilityMetadataValue(breath, '3 Cube within 1', ui)).toBe(ui.format('ui.hero-builder.ancestry-cube-within.7de28835', '{size} Cube within {distance}', '3 Cube within 1', { size: '3', distance: '1' }));
		expect(ancestryAbilityTarget(pride, pride.target, ui)).toBe(translate('ui:ui.hero-builder.ancestry-each-enemy.9f98d4d1', 'Each enemy in the area'));
		expect(ancestryAbilityTier(pride, 1, '2 damage', ui)).toBe(ui.format('ui.hero-builder.ancestry-damage.04b5358f', '{value} damage', '2 damage', { value: '2' }));
		expect(ancestryAbilityTier(pride, 2, '8 damage; push 3', ui)).toBe(ui.format('ui.hero-builder.ancestry-damage-push.002730d6', '{damage} damage; push {distance}', '8 damage; push 3', { damage: '8', distance: '3' }));
		expect(ancestryAbilityTier(pride, 2, '8 damage; slide 3', ui)).toBe('8 damage; slide 3');
		expect(ancestryAbilityTier(breath, 3, '9 damage', ui)).toBe(ui.format('ui.hero-builder.ancestry-damage.04b5358f', '{value} damage', '9 damage', { value: '9' }));
		const wode = features.find(feature => feature.id === 'wode-elf-feature-2-5');
		const sigil = features.find(feature => feature.id === 'revenant-feature-4-5-2');
		const slam = features.find(feature => feature.id === 'time-raider-feature-2-5-1');
		const bolt = features.find(feature => feature.id === 'time-raider-feature-2-5-2');
		if (!wode || wode.type !== FeatureType.Ability || !sigil || sigil.type !== FeatureType.Ability
			|| !slam || slam.type !== FeatureType.Ability || !bolt || bolt.type !== FeatureType.Ability) {
			throw new Error('Expected Wode Elf, Revenant, and Time Raider signature abilities');
		}
		expect(ancestryAbilityTier(wode.data.ability, 1, wode.data.ability.sections[0].type === 'roll' ? wode.data.ability.sections[0].roll.tier1 : '', ui))
			.toBe(translate('ui:ui.hero-builder.wode-tier-1.3703ac76', '2 + M or A damage; A < [weak] slowed (save ends)'));
		expect(ancestryAbilityTier(sigil.data.ability, 3, '7 + R, I, or P damage; slide 3', ui))
			.toBe(translate('ui:ui.hero-builder.sigil-tier-3.fc65f971', '7 + R, I, or P damage; slide 3'));
		expect(ancestryAbilityTier(slam.data.ability, 3, '7 + R, I, or P damage; push 2; M < [strong] prone', ui))
			.toBe(translate('ui:ui.hero-builder.slam-tier-3.9cbf7f6d', '7 + R, I, or P damage; push 2; M < [strong] prone'));
		expect(ancestryAbilityTier(bolt.data.ability, 2, '5 + R, I, or P psychic damage; slide 2', ui))
			.toBe(translate('ui:ui.hero-builder.bolt-tier-2.d520ad1c', '5 + R, I, or P psychic damage; slide 2'));
		expect(ancestryAbilityTier(wode.data.ability, 1, '6 damage; A < 2 slowed (save ends)', ui))
			.toContain('6 ');
		expect(ancestryAbilityTier(wode.data.ability, 1, '6 damage; A < 2 slowed (save ends)', ui)).toContain('`2`');
		expect(ancestryAbilityTier(sigil.data.ability, 1, '7 damage; slide 1', ui))
			.toContain('7 ');
		expect(ancestryAbilityTier(slam.data.ability, 3, '8 damage; push 2; M < 4 prone', ui))
			.toContain('8 ');
		expect(ancestryAbilityTier(slam.data.ability, 3, '8 damage; push 2; M < 4 prone', ui)).toContain('`4`');
		if (!prideRoll || prideRoll.type !== 'roll') {
			throw new Error('Draconic Pride power roll is missing');
		}
		const panel = plainText(renderToStaticMarkup(createElement(PowerRollPanel, { ability: pride, powerRoll: prideRoll.roll })));
		expect(panel).toContain(plainText(ui.format('ui.hero-builder.ancestry-damage.04b5358f', '{value} damage', '2 damage', { value: '2' })));
		expect(panel).toContain(plainText(ui.format('ui.hero-builder.ancestry-damage-push.002730d6', '{damage} damage; push {distance}', '5 damage; push 1', { damage: '5', distance: '1' })));
		expect(panel).toContain(plainText(ui.format('ui.hero-builder.ancestry-damage-push.002730d6', '{damage} damage; push {distance}', '7 damage; push 2', { damage: '7', distance: '2' })));
	});

	test('approved Polder corruption immunity growth uses the approved level wording', () => {
		const feature = collectFeatures().find(item => item.id === 'polder-feature-3-1');
		if (!feature || feature.type !== FeatureType.DamageModifier) {
			throw new Error('Polder corruption immunity feature is missing');
		}
		const ui = {
			language: 'zh-TW',
			text: (id: string, english: string) => translate(`ui:${id}`, english)
		} as ReturnType<typeof useUI>;
		const line = ancestryDamageModifierText(ui, feature.data.modifiers[0]);
		const growth = translate('ui:ui.hero-builder.ancestry-corruption-growth.7932cd16', 'Corruption Immunity +3 +1 per level after 1st');
		expect(line).toBe(growth);
		const detail = plainText(renderToStaticMarkup(createElement(SourcebooksContext, { value: sourcebooks },
			createElement(InfoDamageModifier, { data: feature.data, feature, sourcebooks })
		)));
		expect(detail).toContain(growth);
	});

	test('approved ancestry conditions, roll headers, and modifiers render from unchanged source data', () => {
		const features = collectFeatures();
		const fourArmed = features.find(feature => feature.id === 'time-raider-feature-2-3b');
		const hardAsStone = features.find(feature => feature.id === 'dwarf-feature-2-5');
		const surge = features.find(feature => feature.id === 'memonek-feature-3-4');
		const targeted = features.find(feature => feature.id === 'time-raider-feature-2-2b');
		const bolt = features.find(feature => feature.id === 'time-raider-feature-2-5-2');
		if (!fourArmed || fourArmed.type !== FeatureType.RollModifier
			|| !hardAsStone || hardAsStone.type !== FeatureType.Bonus
			|| !surge || surge.type !== FeatureType.SurgeGain
			|| !targeted || targeted.type !== FeatureType.Ability
			|| !bolt || bolt.type !== FeatureType.Ability) {
			throw new Error('Expected approved ancestry feature sources');
		}
		const ui = {
			language: 'zh-TW',
			text: (id: string, english: string) => translate(`ui:${id}`, english),
			format: (id: string, source: string, english: string, values: Record<string, string | number>) =>
				applyUITemplate(translate(`ui:${id}`, source), source, english, values)
		} as ReturnType<typeof useUI>;
		const roll = plainText(renderToStaticMarkup(createElement(SourcebooksContext, { value: sourcebooks },
			createElement(InfoRollModifier, { data: fourArmed.data, feature: fourArmed, sourcebooks })
		)));
		expect(roll).toContain(translate('ui:ui.hero-builder.ancestry-scope-climb-gymnastics-swim.4aa03efa', 'Climb, Gymnastics, Swim'));
		expect(roll).toContain(translate('ui:ui.hero-builder.ancestry-condition-all-arms.8cc038d7', 'When you can use all your arms in the attempt'));
		const bonusHtml = renderToStaticMarkup(createElement(SourcebooksContext, { value: sourcebooks },
			createElement(InfoBonus, { data: hardAsStone.data, feature: hardAsStone, sourcebooks })
		));
		const bonus = plainText(bonusHtml);
		expect(bonus).toContain(translate('ui:ui.hero-builder.ancestry-stamina-per-echelon.56bdc7d5', 'Stamina +6 per echelon'));
		expect(bonusHtml).toContain('field-label');
		const gain = plainText(renderToStaticMarkup(createElement(SourcebooksContext, { value: sourcebooks },
			createElement(InfoSurgeGain, { data: surge.data, feature: surge, sourcebooks })
		)));
		expect(gain).toContain(translate('ui:ui.hero-builder.ancestry-surge-start-of-combat.787b64ff', 'Start of combat'));
		expect(gain).toContain(translate('ui:ui.hero-builder.ancestry-surge-per-encounter.9459bbc7', '+1 SURGE PER ENCOUNTER'));
		expect(ancestryAbilityTriggerText(targeted.data.ability, targeted.data.ability.type.trigger, ui))
			.toBe(translate('ui:ui.hero-builder.ancestry-trigger-targeted-by-strike.3b5a09c7', 'You are targeted with a strike'));
		const powerRoll = bolt.data.ability.sections.find(section => section.type === 'roll');
		if (!powerRoll || powerRoll.type !== 'roll') {
			throw new Error('Expected approved ancestry power roll');
		}
		const panel = plainText(renderToStaticMarkup(createElement(PowerRollPanel, { ability: bolt.data.ability, powerRoll: powerRoll.roll })));
		expect(panel).toContain(translate('ui:ui.hero-builder.ancestry-power-roll-reason-intuition-presence.c37df268', 'Power Roll + Reason or Intuition or Presence'));
		expect(ancestryAbilityRollHeader(bolt.data.ability, 'Power Roll + Reason or Intuition or Presence', ui))
			.toBe(translate('ui:ui.hero-builder.ancestry-power-roll-reason-intuition-presence.c37df268', 'Power Roll + Reason or Intuition or Presence'));
	});

	test('shared ancestry panels translate approved field labels, Edge, skill choice text, and choice headings', () => {
		const features = collectFeatures();
		const wyrmplate = features.find(feature => feature.id === 'dragon-knight-feature-1');
		const silverTongue = features.find(feature => feature.id === 'devil-feature-1b');
		const edge = features.find(feature => feature.id === 'time-raider-feature-2-3b');
		const stability = features.find(feature => feature.id === 'orc-feature-2-2');
		const disengage = features.find(feature => feature.id === 'high-elf-feature-2-1');
		const recoveries = features.find(feature => feature.id === 'human-feature-2-5');
		if (!wyrmplate || wyrmplate.type !== FeatureType.Choice || !silverTongue
			|| !edge || edge.type !== FeatureType.RollModifier
			|| !stability || stability.type !== FeatureType.Bonus
			|| !disengage || disengage.type !== FeatureType.Bonus
			|| !recoveries || recoveries.type !== FeatureType.Bonus) {
			throw new Error('Expected ancestry display regression sources');
		}
		const renderWithProviders = (element: ReturnType<typeof createElement>) => renderToStaticMarkup(
			createElement(SourcebooksContext, { value: sourcebooks },
				createElement(OptionsContext, { value: FactoryLogic.createOptions() }, element)
			)
		);
		const choiceText = plainText(renderWithProviders(createElement(InfoChoice, {
			data: wyrmplate.data, feature: wyrmplate, sourcebooks
		})));
		expect(choiceText.match(new RegExp(translate('ui:ui.hero-builder.damage-modifier.a9292a2f', 'Damage Modifier'), 'g'))).toHaveLength(6);
		expect(choiceText).not.toContain('Damage Modifier');
		const interpersonal = plainText(renderWithProviders(createElement(FeaturePanel, {
			feature: silverTongue, sourcebooks, mode: PanelMode.Full
		})));
		expect(interpersonal).toContain(translate('ui:ui.hero-builder.interpersonal-skill.3095ff6f', 'Interpersonal Skill'));
		expect(interpersonal).toContain(translate('ui:ui.hero-builder.interpersonal-skill-description.3ff1394b', 'Choose a skill from Interpersonal skills.'));
		expect(interpersonal).not.toContain('Interpersonal Skill');
		const edgeText = plainText(renderWithStaticProviders(createElement(InfoRollModifier, {
			data: edge.data, feature: edge, sourcebooks
		})));
		expect(edgeText).toContain(translate('enum:RollModifierType:Edge', 'Edge'));
		for (const feature of [ stability, disengage, recoveries ]) {
			const labelText = plainText(renderWithStaticProviders(createElement(InfoBonus, {
				data: feature.data, feature, sourcebooks
			})));
			expect(labelText).toContain(translate(`enum:FeatureField:${feature.data.field}`, feature.data.field));
		}
	});
});

const renderWithStaticProviders = (element: ReturnType<typeof createElement>) => renderToStaticMarkup(
	createElement(SourcebooksContext, { value: sourcebooks }, element)
);
