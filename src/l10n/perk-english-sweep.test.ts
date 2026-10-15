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

const reserved = new Set([
	'perk-arcane-trick',
	'perk-familiar'
]);

const kept = new Set([ 'Perk', 'Perks', 'info-circle', 'close', 'right', 'left', 'thunderbolt', 'potency', 'etc', 'Auto-calculate damage' ]);

// English that still has no approved row or Adaptation. Level 1 and level 5 match.
const segment3Leftovers: Record<string, string[]> = {
	'perk-friend-catapult @ drawer': [
		'You hurl your ally through the air.',
		'Distance',
		'Target',
		'Self',
		'You grab a willing adjacent ally or object of your size or smaller',
		'then vertical push that target up to a number of squares equal to',
		'If a creature you push falls as a result of this movement',
		'the effective distance of the fall is reduced by a number of squares equal to',
		'When you use this perk',
		'you can’t use it again until you earn',
		'or more Victories.'
	],
	'perk-friend-catapult @ sheet': [
		'You hurl your ally through the air.'
	],
	'perk-friend-catapult @ card': [
		'You hurl your ally through the air.',
		'Self',
		'Effect',
		'You grab a willing adjacent ally or object of your size or smaller',
		'then vertical push that target up to a number of squares equal to',
		'If a creature you push falls as a result of this movement',
		'the effective distance of the fall is reduced by a number of squares equal to',
		'When you use this perk',
		'you can’t use it again until you earn',
		'or more Victories.'
	],
	'perk-friend-catapult @ selected': [
		'You hurl your ally through the air.'
	],
	'perk-ive-got-you @ drawer': [
		'You catch a falling ally at the last possible moment.',
		'free',
		'Free Triggered Action',
		'Distance',
		'Target',
		'Self',
		'Trigger',
		'A willing ally lands on you or adjacent to you when they fall.',
		'You catch your ally. Neither of you takes damage from the fall.'
	],
	'perk-ive-got-you @ sheet': [
		'Free Triggered Action',
		'You catch a falling ally at the last possible moment.'
	],
	'perk-ive-got-you @ card': [
		'Triggered Action',
		'You catch a falling ally at the last possible moment.',
		'Free Triggered Action',
		'Self',
		'Trigger',
		'A willing ally lands on you or adjacent to you when they fall.',
		'Effect',
		'You catch your ally. Neither of you takes damage from the fall.'
	],
	'perk-ive-got-you @ selected': [
		'You catch a falling ally at the last possible moment.'
	],
	'perk-gum-up-the-works @ drawer': [
		'You prevent a trap from activating.',
		'trigger',
		'Triggered Action',
		'Distance',
		'Target',
		'Self',
		'Trigger',
		'A mundane trap activates within',
		'squares of you.',
		'You can move up to',
		'squares toward the trap. If this movement brings you adjacent to any of the trap’s mechanisms',
		'you can jam the trap',
		'preventing it from activating. As long as you stay adjacent to the mechanism',
		'the trap can’t go off unless an attempt to disarm it fails.'
	],
	'perk-gum-up-the-works @ sheet': [
		'Triggered Action',
		'You prevent a trap from activating.'
	],
	'perk-gum-up-the-works @ card': [
		'Triggered Action',
		'You prevent a trap from activating.',
		'Self',
		'Trigger',
		'A mundane trap activates within',
		'squares of you.',
		'Effect',
		'You can move up to',
		'squares toward the trap. If this movement brings you adjacent to any of the trap’s mechanisms',
		'you can jam the trap',
		'preventing it from activating. As long as you stay adjacent to the mechanism',
		'the trap can’t go off unless an attempt to disarm it fails.'
	],
	'perk-gum-up-the-works @ selected': [
		'You prevent a trap from activating.'
	],
	'perk-creature-sense @ drawer': [
		'You intuit a creature\'s keywords.',
		'Distance',
		'Target',
		'Self',
		'Choose a creature within',
		'squares. If that creature is your level or lower',
		'you learn the keywords in their stat block',
		'Demon',
		'Humanoid',
		'Undead',
		'and so forth'
	],
	'perk-creature-sense @ sheet': [
		'You intuit a creature\'s keywords.'
	],
	'perk-creature-sense @ card': [
		'You intuit a creature\'s keywords.',
		'Self',
		'Effect',
		'Choose a creature within',
		'squares. If that creature is your level or lower',
		'you learn the keywords in their stat block',
		'Demon',
		'Humanoid',
		'Undead',
		'and so forth'
	],
	'perk-creature-sense @ selected': [
		'You intuit a creature\'s keywords.'
	],
	'perk-invisible-force @ drawer': [
		'You manipulate a tiny object with your mind.',
		'Psionic',
		'Distance',
		'Target',
		'size',
		'T unattended object',
		'You can grab or manipulate the target object with your mind',
		'moving the object up to a number of squares equal to your Reason',
		'Intuition',
		'or Presence score',
		'your choice',
		'You can use this ability to turn doorknobs',
		'pull levers',
		'and so forth. You can manipulate any small movable piece of a larger object as long as the piece is unattended and size',
		'T. You can’t use this ability to break a smaller piece off a larger object.'
	],
	'perk-invisible-force @ sheet': [
		'You manipulate a tiny object with your mind.'
	],
	'perk-invisible-force @ card': [
		'You manipulate a tiny object with your mind.',
		'Psionic',
		'size',
		'T unattended object',
		'Effect',
		'You can grab or manipulate the target object with your mind',
		'moving the object up to a number of squares equal to your Reason',
		'Intuition',
		'or Presence score',
		'your choice',
		'You can use this ability to turn doorknobs',
		'pull levers',
		'and so forth. You can manipulate any small movable piece of a larger object as long as the piece is unattended and size',
		'T. You can’t use this ability to break a smaller piece off a larger object.'
	],
	'perk-invisible-force @ selected': [
		'You manipulate a tiny object with your mind.'
	],
	'perk-psychic-whisper @ drawer': [
		'You send a one-way telepathic message to a friend.',
		'Psionic',
		'Distance',
		'Target',
		'ally who understands at least one language',
		'You send a telepathic message to them that takes',
		'seconds or less to speak. The target knows who the message is from and can decide to ignore it and subsequent messages.'
	],
	'perk-psychic-whisper @ sheet': [
		'You send a one-way telepathic message to a friend.'
	],
	'perk-psychic-whisper @ card': [
		'You send a one-way telepathic message to a friend.',
		'Psionic',
		'ally who understands at least one language',
		'Effect',
		'You send a telepathic message to them that takes',
		'seconds or less to speak. The target knows who the message is from and can decide to ignore it and subsequent messages.'
	],
	'perk-psychic-whisper @ selected': [
		'You send a one-way telepathic message to a friend.'
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
		expect(seen).toEqual(segment3Leftovers);
	});
});
