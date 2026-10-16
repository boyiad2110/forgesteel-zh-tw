import * as catalog from '@/l10n/catalog';
import { FeatureField } from '@/enums/feature-field';
import { FeatureType } from '@/enums/feature-type';
import { Hero } from '@/models/hero';
import { Modifier } from '@/models/damage-modifier';
import { ModifierLogic } from '@/logic/modifier-logic';
import { Monster } from '@/models/monster';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { UsageAdaptation } from '@/l10n/catalog';
import { getLanguage } from '@/l10n/language';
import { sha256 } from '@/l10n/sha256';

const ARCANE_ABILITY = 'perk-arcane-trick-1';
const ARCANE_ITEMS = 7;
const FAMILIAR_PARAGRAPHS = [
	'element:familiar:description',
	'element:familiar:description:1',
	'element:familiar:description:2',
	'element:familiar:description:3'
];
const FAMILIAR_BOOK = 'heroes.perks.familiar.effect';
const FAMILIAR_STAMINA_USAGE = 'element:familiar:stamina';
const FAMILIAR_FORMULA_EN = '2 \u00d7 your level';

const ready = () => {
	if (getLanguage() !== 'zh-TW') {
		return false;
	}
	if (!catalog.peekCatalog()) {
		void catalog.loadCatalog();
		return false;
	}
	return true;
};

/**
 * Arcane Trick's approved section is an intro plus seven effects.
 * The book row's Forge Steel version is only the intro, so the bullets stay
 * on their own usage rows. On screen they become the same markdown list
 * Thingspeaker uses. A changed sentence stays English.
 */
export const arcaneTrickSection = (abilityId: string, english: string): string | undefined => {
	if (abilityId !== ARCANE_ABILITY || !ready()) {
		return undefined;
	}
	const intro = catalog.usageAdaptation.peek('section:perk-arcane-trick-1:0');
	if (!intro?.zh.trim()) {
		return undefined;
	}
	const items: string[] = [];
	let sawIntro = false;
	for (const line of english.replace(/\r\n/g, '\n').trim().split('\n')) {
		const trimmed = line.trim();
		if (!trimmed) {
			continue;
		}
		if (!sawIntro) {
			if (trimmed !== intro.en) {
				return undefined;
			}
			sawIntro = true;
			continue;
		}
		if (!trimmed.startsWith('* ')) {
			return undefined;
		}
		items.push(trimmed.slice(2));
	}
	if (!sawIntro || items.length !== ARCANE_ITEMS) {
		return undefined;
	}
	const translated = items.map((item, index) => {
		const usage = catalog.usageAdaptation.peek(`section:perk-arcane-trick-1:0:item:${index + 1}`);
		return usage && usage.en === item && usage.zh.trim() ? usage.zh : undefined;
	});
	if (translated.some(item => !item)) {
		return undefined;
	}
	return `${intro.zh}\n\n${translated.map(item => `* ${item}`).join('\n')}`;
};

/**
 * The familiar's four approved paragraphs. The canonical Forge Steel version
 * is only the first one; the other three stay on their usage rows.
 */
export const familiarDescription = (monsterId: string, english: string): string | undefined => {
	if (monsterId !== 'familiar' || !ready()) {
		return undefined;
	}
	const parts = english.replace(/\r\n/g, '\n').trim().split(/\n\n+/);
	if (parts.length !== FAMILIAR_PARAGRAPHS.length) {
		return undefined;
	}
	const translated = FAMILIAR_PARAGRAPHS.map((key, index) => {
		const usage = catalog.usageAdaptation.peek(key);
		return usage && usage.en === parts[index] && usage.zh.trim() ? usage.zh : undefined;
	});
	if (translated.some(item => !item)) {
		return undefined;
	}
	return translated.join('\n\n');
};

const hashText = (value: string) => {
	return sha256(value.replace(/\r\n?/g, '\n'));
};

const sortValue = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(sortValue);
	}
	if (!value || typeof value !== 'object') {
		return value;
	}
	return Object.keys(value).sort().reduce<Record<string, unknown>>((sorted, key) => {
		sorted[key] = sortValue((value as Record<string, unknown>)[key]);
		return sorted;
	}, {});
};

/** Rule data only. Damage, temporary stamina, and the rest of combat state stay out. */
const sameRules = (shown: Monster, official: Monster) => {
	const rules = (monster: Monster) => {
		const { state, ...data } = monster;
		void state;
		return data;
	};
	return JSON.stringify(sortValue(rules(shown))) === JSON.stringify(sortValue(rules(official)));
};

/**
 * The official familiar is the summon inside an official sourcebook's perk.
 * A missing sourcebook is not treated as official.
 */
const officialFamiliar = (sourcebooks: Sourcebook[]): Monster | undefined => {
	for (const book of sourcebooks) {
		if (book.type !== SourcebookType.Official) {
			continue;
		}
		const perk = SourcebookLogic.getPerks([ book ]).find(item => item.id === 'perk-familiar');
		if (!perk || perk.type !== FeatureType.Summon) {
			continue;
		}
		const monster = perk.data.summons.find(summon => summon.monster.id === 'familiar')?.monster;
		if (monster) {
			return monster;
		}
	}
	return undefined;
};

const officialStaminaBonus = (monster: Monster) => {
	const bonuses = monster.features.filter(feature => feature.type === FeatureType.Bonus && feature.data.field === FeatureField.Stamina);
	const bonus = bonuses.length === 1 ? bonuses[0] : undefined;
	if (!bonus || bonus.type !== FeatureType.Bonus || bonus.id !== 'familiar-1' || monster.stamina !== 0) {
		return undefined;
	}
	const modifier: Modifier = bonus.data;
	if (modifier.value !== 2 || modifier.valuePerLevel !== 2 || modifier.valuePerEchelon !== 0
		|| modifier.valueFromController !== null || modifier.valueCharacteristics.length !== 0
		|| modifier.valueCharacteristicMultiplier !== 1) {
		return undefined;
	}
	return bonus;
};

const approvedFormula = (): string | undefined => {
	const usage = catalog.usageAdaptation.peek(FAMILIAR_STAMINA_USAGE);
	const book = catalog.peekCatalog()?.[FAMILIAR_BOOK];
	if (!usage || !book || !adaptationHashesMatch(usage, book.en, book.zh) || usage.en !== FAMILIAR_FORMULA_EN || !usage.zh.trim()) {
		return undefined;
	}
	return usage.zh;
};

const adaptationHashesMatch = (usage: UsageAdaptation, english: string, chinese: string) => {
	if (usage.bookStringId !== FAMILIAR_BOOK || usage.basisHash !== hashText(chinese)) {
		return false;
	}
	const sources = [ ...usage.sources ].sort((left, right) => left.order - right.order);
	if (sources.length === 0 || sources.some((source, index) => source.order !== index + 1) || sources[0].sourceId !== FAMILIAR_BOOK) {
		return false;
	}
	const loaded = catalog.peekCatalog();
	return !!loaded && sources.every(source => {
		const row = loaded[source.sourceId];
		return !!row && hashText(row.en) === source.enHash && hashText(row.zh) === source.zhHash;
	}) && hashText(english) === sources[0].enHash && hashText(chinese) === sources[0].zhHash;
};

/** Same current/max and +temp shape as MonsterLogic.getStaminaDescription. */
const staminaText = (monster: Monster, max: number) => {
	let text = `${max}`;
	if (monster.state.staminaDamage > 0) {
		text = `${Math.max(max - monster.state.staminaDamage, 0)} / ${max}`;
	}
	if (monster.state.staminaTemp > 0) {
		text += ` +${monster.state.staminaTemp}`;
	}
	return text;
};

/**
 * Display-only stamina. Saved monster numbers stay unchanged.
 * No hero shows the approved formula only for the official familiar whose
 * bonus still matches the confirmed structure and whose adaptation hashes match.
 * A hero with a class shows the upstream bonus at that hero's level.
 */
export const familiarStaminaValue = (monster: Monster, hero: Hero | undefined, sourcebooks: Sourcebook[]): string | undefined => {
	if (!ready()) {
		return undefined;
	}
	const official = officialFamiliar(sourcebooks);
	const bonus = official && sameRules(monster, official) ? officialStaminaBonus(monster) : undefined;
	const formula = bonus ? approvedFormula() : undefined;
	if (!bonus || !formula) {
		return undefined;
	}
	if (hero?.class) {
		return staminaText(monster, monster.stamina + ModifierLogic.calculateModifierValue(bonus.data, hero));
	}
	return formula;
};
