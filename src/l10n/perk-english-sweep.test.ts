import { Catalog, loadCatalog } from '@/l10n/catalog';
import { Feature, isFeature } from '@/models/feature';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AbilityCard } from '@/components/panels/classic-sheet/ability-card/ability-card';
import { ClassicSheetBuilder } from '@/logic/classic-sheet/classic-sheet-builder';
import { ConfigPerk } from '@/components/features/feature-data/perk';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureComponent } from '@/components/panels/classic-sheet/components/feature-component';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { FeatureType } from '@/enums/feature-type';
import { OptionsContext } from '@/contexts/data-context';
import { PanelMode } from '@/enums/panel-mode';
import { SourcebooksContext } from '@/contexts/data-context';
import { core } from '@/data/sourcebooks/official/core';
import { createElement } from 'react';
import { mapping } from '@/l10n/mapping';
import { renderToStaticMarkup } from 'react-dom/server';
import { setLanguage } from '@/l10n/language';
import strings from '@/l10n/generated/zh-TW/strings.json';

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

const reserved = new Set<string>();

const kept = new Set([ 'Perk', 'Perks', 'info-circle', 'close', 'right', 'left', 'thunderbolt', 'potency', 'etc', 'Auto-calculate damage' ]);

// Level 1 and level 5 match. These leftovers are the segment 4 draft.
const segment4Leftovers: Record<string, string[]> = {
	'familiar-1 @ drawer': [
		'per level'
	],
	'familiar-2 @ drawer': [
		'Telepathic',
		'While you and your familiar are within',
		'squares of each other',
		'you can communicate telepathically and share each other’s senses. While sharing senses',
		'each of you also benefits from your own senses at the same time.'
	],
	'familiar-2 @ sheet': [
		'Telepathic',
		'While you and your familiar are within',
		'squares of each other',
		'you can communicate telepathically and share each other’s senses. While sharing senses',
		'each of you also benefits from your own senses at the same time.'
	],
	'perk-arcane-trick @ card': [
		'Main Action',
		'You cast an entertaining spell that creates a minor but impressive magical effect.',
		'Choose one of the following effects',
		'You teleport a size',
		'S or smaller object adjacent to you into an unoccupied space adjacent to you.',
		'Until the start of your next turn',
		'a part of your body shoots a shower of harmless noisy sparks that light up each square adjacent to you.',
		'You ignite or snuff out',
		'your choice',
		'every mundane light source of',
		'L or smaller adjacent to you.',
		'You transform up to',
		'pound of edible food you touch to make it taste delicious or disgusting.',
		'you make your body exude a particular odor you’ve smelled before. This smell can be sensed by each creature within',
		'squares of you',
		'but can’t impose any condition or other drawback on those creatures.',
		'You place a small magical inscription on the surface of a mundane object you touch',
		'or you can remove an inscription that was made by you or by another creature using Arcane Trick.',
		'You touch a size',
		'T object to cover it with an illusion that makes it look like a different object. Any creature who handles the object becomes aware of the illusion. The illusion ends when you stop touching the object.'
	],
	'perk-arcane-trick @ drawer': [
		'You cast an entertaining spell that creates a minor but impressive magical effect.',
		'main',
		'Main Action',
		'Choose one of the following effects',
		'You teleport a size',
		'S or smaller object adjacent to you into an unoccupied space adjacent to you.',
		'Until the start of your next turn',
		'a part of your body shoots a shower of harmless noisy sparks that light up each square adjacent to you.',
		'You ignite or snuff out',
		'your choice',
		'every mundane light source of',
		'L or smaller adjacent to you.',
		'You transform up to',
		'pound of edible food you touch to make it taste delicious or disgusting.',
		'you make your body exude a particular odor you’ve smelled before. This smell can be sensed by each creature within',
		'squares of you',
		'but can’t impose any condition or other drawback on those creatures.',
		'You place a small magical inscription on the surface of a mundane object you touch',
		'or you can remove an inscription that was made by you or by another creature using Arcane Trick.',
		'You touch a size',
		'T object to cover it with an illusion that makes it look like a different object. Any creature who handles the object becomes aware of the illusion. The illusion ends when you stop touching the object.'
	],
	'perk-arcane-trick @ selected': [
		'You cast an entertaining spell that creates a minor but impressive magical effect.'
	],
	'perk-arcane-trick @ sheet': [
		'Main Action',
		'You cast an entertaining spell that creates a minor but impressive magical effect.'
	],
	'perk-familiar @ drawer': [
		'A supernatural spirit who has taken the form of a specific small animal or animated object has chosen to be your familiar',
		'or to adopt you as their familiar.',
		'The familiar can hold small objects in their mouth or claws',
		'but can’t perform activities that would typically require hands',
		'opening a door',
		'unrolling a scroll',
		'and so forth',
		'They can’t harm other creatures or objects. They can flank in combat',
		'but only with you.',
		'If your familiar is destroyed',
		'you can restore them as a respite activity',
		'or by spending a Recovery as a main action to bring them back into existence in an unoccupied space adjacent to you.',
		'Movement',
		'Telepathic',
		'While you and your familiar are within',
		'squares of each other',
		'you can communicate telepathically and share each other’s senses. While sharing senses',
		'each of you also benefits from your own senses at the same time.'
	],
	'perk-familiar @ sheet': [
		'Summon'
	]
};

const nestedFeatures = (feature: Feature): Feature[] => {
	if (!feature.data || typeof feature.data !== 'object') {
		return [];
	}
	const found: Feature[] = [];
	const visit = (value: unknown) => {
		if (!value || typeof value !== 'object') {
			return;
		}
		if (Array.isArray(value)) {
			value.forEach(visit);
			return;
		}
		if (isFeature(value) && value.id !== feature.id) {
			found.push(value);
			return;
		}
		Object.values(value).forEach(visit);
	};
	Object.values(feature.data).forEach(visit);
	return found;
};

const visibleText = (html: string) => {
	const titles = [ ...html.matchAll(/\b(?:title|aria-label)="([^"]*)"/g) ].map(match => match[1]);
	const body = html
		.replace(/<[^>]+>/g, '\n')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&#x27;|&apos;/g, '\'')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
	return [ body, ...titles ].join('\n');
};

const englishPhrases = (html: string) => {
	const text = visibleText(html);
	const phrases = text.match(/[A-Za-z][A-Za-z'’.-]*(?:[ \u00a0]+[A-Za-z][A-Za-z'’.-]*)*/g) ?? [];
	return [ ...new Set(phrases.map(phrase => phrase.replace(/\s+/g, ' ').trim()).filter(phrase => phrase.length > 1 && !kept.has(phrase))) ];
};

describe('perk English sweep', () => {
	beforeEach(async () => {
		const store: Record<string, string> = {};
		vi.stubGlobal('localStorage', {
			getItem: (key: string) => (key in store ? store[key] : null),
			setItem: (key: string, value: string) => { store[key] = value; }
		});
		await loadCatalog();
		setLanguage('zh-TW');
		vi.stubGlobal('window', { matchMedia: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }) });
	});

	afterEach(() => {
		setLanguage('zh-TW');
	});

	test('lists leftover English on mapped perks', () => {
		const options = FactoryLogic.createOptions();
		const leaks: Record<string, string[]> = {};
		const record = (id: string, surface: string, level: number, html: string) => {
			const phrases = englishPhrases(html);
			if (phrases.length === 0) {
				return;
			}
			leaks[`${id} @ ${surface} L${level}`] = phrases;
		};
		const wrap = (node: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(OptionsContext, { value: options }, createElement(SourcebooksContext, { value: [ core ] }, node)));

		for (const level of [ 1, 5 ]) {
			const hero = FactoryLogic.createHero();
			hero.class = FactoryLogic.createClass();
			hero.class.level = level;
			for (const perk of core.perks) {
				if (reserved.has(perk.id)) {
					continue;
				}
				const features: Feature[] = [ perk, ...nestedFeatures(perk) ];
				for (const feature of features) {
					record(feature.id, 'drawer', level, wrap(createElement(FeaturePanel, {
						feature,
						hero,
						sourcebooks: [ core ],
						mode: PanelMode.Full
					})));
					record(feature.id, 'sheet', level, wrap(createElement(FeatureComponent, {
						feature: feature as Feature,
						hero
					})));
				}
				if (perk.type === FeatureType.Ability && perk.data) {
					record(perk.id, 'card', level, wrap(createElement(AbilityCard, {
						ability: ClassicSheetBuilder.buildAbilitySheet(perk.data.ability, hero, undefined, options)
					})));
				}
				const choice = FactoryLogic.feature.createPerk({
					id: `choice-${perk.id}`,
					lists: [ perk.list ],
					selected: [ perk ]
				});
				record(perk.id, 'selected', level, wrap(createElement(ConfigPerk, {
					data: choice.data,
					feature: choice,
					hero,
					sourcebooks: [ core ],
					setData: () => undefined
				})));
			}
		}

		const catalog = strings as Catalog;
		const approved = (id: string) => {
			const sheetId = mapping[`element:${id}:description`]?.sheetId;
			const row = sheetId ? catalog[sheetId] : undefined;
			return `${row?.zh ?? ''}\n${row?.fs?.zh ?? ''}`;
		};
		const pending: Record<string, string[]> = {};
		for (const [ place, phrases ] of Object.entries(leaks)) {
			const id = place.split(' @ ')[0];
			const text = approved(id);
			const rest = phrases.filter(phrase => !text.includes(phrase));
			if (rest.length > 0) {
				pending[place] = rest;
			}
		}
		const seen: Record<string, string[]> = {};
		for (const [ place, phrases ] of Object.entries(pending)) {
			const level = place.match(/ L(\d+)$/);
			expect(level?.[1]).toMatch(/1|5/);
			const surface = place.replace(/ L\d+$/, '');
			const prior = seen[surface];
			if (prior) {
				expect(phrases, surface).toEqual(prior);
			} else {
				seen[surface] = phrases;
			}
		}
		expect(seen).toEqual(segment4Leftovers);
	});
});
