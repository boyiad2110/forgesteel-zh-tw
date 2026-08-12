import { AppLocale } from '@/localization/locale';
import { localizeElementField } from '@/localization/resolver';

interface PowerRollTierPresentation {
	locale: AppLocale;
	abilityID: string;
	field: string;
	canonicalEnglish: string;
	calculatedEnglish: string;
}

const characteristicToken = '(?:might|agility|reason|intuition|presence|m|a|r|i|p)';
const canonicalDamagePattern = new RegExp(`(^|;\\s*)(\\d+(?:\\s*\\+\\s*\\d*${characteristicToken})?)(?=\\s+(?:(?:[a-z]+(?:\\s+or\\s+[a-z]+)*)\\s+)?damage\\b)`, 'gi');
const calculatedDamagePattern = /(^|;\s*)(-?\d+)(?=\s+(?:(?:[a-z]+(?:\s+or\s+[a-z]+)*)\s+)?damage\b)/gi;
const localizedDamagePattern = /(^|[；;]\s*)(\d+(?:\s*\+\s*`[^`]+`)?)[ \t]*(?=[^；;]*傷害)/g;
const canonicalPotencyPattern = /\b(?:might|agility|reason|intuition|presence|m|a|r|i|p)\s*<\s*\[(?:weak|average|avg|strong)\]/gi;
const calculatedPotencyPattern = /`?(?:might|agility|reason|intuition|presence|m|a|r|i|p)\s*<\s*(-?\d+)`?/gi;
const localizedPotencyPattern = /(`[^`]+`\s*<\s*)\[(?:弱|中|強)\]/g;

const removeCalculationFormatting = (value: string) => value.replace(/[*`,]/g, '');

/**
 * Projects calculated canonical values onto an approved zh-TW Power Roll tier.
 *
 * The resolver lookup deliberately uses the raw canonical English, which preserves its
 * approval and freshness checks. Calculation has already happened before this helper is
 * called; no localized text is returned to AbilityLogic or any other parser.
 */
export const localizePowerRollTierPresentation = ({
	locale,
	abilityID,
	field,
	canonicalEnglish,
	calculatedEnglish
}: PowerRollTierPresentation) => {
	if (locale === 'en') {
		return calculatedEnglish;
	}

	const localizedRaw = localizeElementField(locale, abilityID, field, canonicalEnglish);
	if (localizedRaw === canonicalEnglish) {
		return calculatedEnglish;
	}

	if (calculatedEnglish === canonicalEnglish) {
		return localizedRaw;
	}

	const damageValues = Array.from(calculatedEnglish.matchAll(calculatedDamagePattern), match => match[2]);
	const canonicalDamage = Array.from(canonicalEnglish.matchAll(canonicalDamagePattern));
	const localizedDamage = Array.from(localizedRaw.matchAll(localizedDamagePattern));
	const potencyValues = Array.from(calculatedEnglish.matchAll(calculatedPotencyPattern), match => match[1]);
	const canonicalPotencies = Array.from(canonicalEnglish.matchAll(canonicalPotencyPattern));
	const localizedPotencies = Array.from(localizedRaw.matchAll(localizedPotencyPattern));

	if ((damageValues.length !== canonicalDamage.length)
		|| (localizedDamage.length !== canonicalDamage.length)
		|| (potencyValues.length !== canonicalPotencies.length)
		|| (localizedPotencies.length !== canonicalPotencies.length)) {
		return calculatedEnglish;
	}

	let damageIndex = 0;
	let potencyIndex = 0;
	const projectedCanonical = canonicalEnglish
		.replace(canonicalDamagePattern, (_match, prefix: string) => `${prefix}${damageValues[damageIndex++]}`)
		.replace(/(\b(?:might|agility|reason|intuition|presence|m|a|r|i|p)\s*<\s*)\[(?:weak|average|avg|strong)\]/gi, (_match, prefix: string) => `${prefix}${potencyValues[potencyIndex++]}`);

	// Formatting-only rewrites (condition emphasis and potency code spans) are safe to
	// leave in the localized authored reading. Any other rewrite is outside this helper's
	// narrow grammar and keeps the existing calculated-English fallback.
	if (removeCalculationFormatting(projectedCanonical) !== removeCalculationFormatting(calculatedEnglish)) {
		return calculatedEnglish;
	}

	damageIndex = 0;
	potencyIndex = 0;
	return localizedRaw
		.replace(localizedDamagePattern, (_match, prefix: string) => `${prefix}${damageValues[damageIndex++]} `)
		.replace(localizedPotencyPattern, (_match, prefix: string) => `${prefix}${potencyValues[potencyIndex++]}`);
};
