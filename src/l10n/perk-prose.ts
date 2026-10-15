import { loadCatalog, peekCatalog, peekUsageAdaptation } from '@/l10n/catalog';
import { FeatureType } from '@/enums/feature-type';
import { Hero } from '@/models/hero';
import { ModifierLogic } from '@/logic/modifier-logic';
import { Monster } from '@/models/monster';
import { getLanguage } from '@/l10n/language';

const ARCANE_ABILITY = 'perk-arcane-trick-1';
const ARCANE_ITEMS = 7;
const FAMILIAR_PARAGRAPHS = [
	'element:familiar:description',
	'element:familiar:description:1',
	'element:familiar:description:2',
	'element:familiar:description:3'
];
const FAMILIAR_FORMULA_SHEET = 'heroes.perks.familiar.effect';
const FAMILIAR_FORMULA_SPAN: readonly [ number, number ] = [ 223, 231 ];

const ready = () => {
	if (getLanguage() !== 'zh-TW') {
		return false;
	}
	if (!peekCatalog()) {
		void loadCatalog();
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
	const intro = peekUsageAdaptation('section:perk-arcane-trick-1:0');
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
		const usage = peekUsageAdaptation(`section:perk-arcane-trick-1:0:item:${index + 1}`);
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
		const usage = peekUsageAdaptation(key);
		return usage && usage.en === parts[index] && usage.zh.trim() ? usage.zh : undefined;
	});
	if (translated.some(item => !item)) {
		return undefined;
	}
	return translated.join('\n\n');
};

/**
 * Display-only stamina. Saved monster numbers stay at level 0.
 * A loaded hero shows the upstream bonus at that hero's level.
 * No hero shows the approved book formula, sliced from the book row.
 */
export const familiarStaminaValue = (monster: Monster, hero?: Hero): string | undefined => {
	if (monster.id !== 'familiar' || !ready()) {
		return undefined;
	}
	const bonus = monster.features.find(feature => feature.id === 'familiar-1' && feature.type === FeatureType.Bonus);
	if (!bonus || bonus.type !== FeatureType.Bonus) {
		return undefined;
	}
	if (hero?.class) {
		return String(monster.stamina + ModifierLogic.calculateModifierValue(bonus.data, hero));
	}
	const formula = peekCatalog()?.[FAMILIAR_FORMULA_SHEET]?.zh.slice(FAMILIAR_FORMULA_SPAN[0], FAMILIAR_FORMULA_SPAN[1]);
	return formula || undefined;
};
