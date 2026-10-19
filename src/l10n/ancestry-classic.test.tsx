import { AncestryData } from '@/data/ancestry-data';
import { FeatureComponent } from '@/components/panels/classic-sheet/components/feature-component';
import { AbilityCard } from '@/components/panels/classic-sheet/ability-card/ability-card';
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
import { core } from '@/data/sourcebooks/official/core';
import { Sourcebook } from '@/models/sourcebook';
import { Options } from '@/models/options';
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

const sourcebooks: Sourcebook[] = [ core ];
const catalog = strings as Catalog;
const approvedAdaptations = Object.values(adaptations) as Array<{ usageKey: string; zh: string }>;
const approvedChinese = (key: string) => {
	const usage = approvedAdaptations.find(adaptation => adaptation.usageKey === key);
	if (usage) {
		return usage.zh;
	}
	const row = mapping[key];
	return row ? catalog[row.sheetId]?.fs?.zh ?? catalog[row.sheetId]?.zh : undefined;
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
				// The rules engine replaces “your level” with a number; no approved
				// calculation binding exists, so the computed English stays intact.
				expect(html).toContain('You reduce the damage from the strike by an amount equal to 1.');
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
		expect(chinese).toContain('When your Stamina reaches the negative');
		expect(chinese).toContain('you regain Stamina equal to 0');
		expect(chinese).toContain(approvedChinese('element:revenant-feature-4-5-1:name'));
		expect(chinese).toContain('As a maneuver, you place a magic sigil');
		expect(chinese).toContain('You can have an active number of sigils equal to 1');
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
});
