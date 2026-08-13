import { AppLocale } from '@/localization/locale';
import { localizeElementField } from '@/localization/resolver';
import { projectCalculatedConditionEmphasis } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';

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
const canonicalForcedMovementPattern = /\b(push|pull|slide)\s+(\d+)\b/gi;
const localizedForcedMovementPattern = /(推動|拉動|滑動)\s+(\d+)/g;

const localizedForcedMovementType = (verb: string) => {
	switch (verb) {
		case '推動':
			return 'push';
		case '拉動':
			return 'pull';
		case '滑動':
			return 'slide';
	}
};

const countMatches = (value: string, pattern: RegExp) => Array.from(value.matchAll(pattern)).length;

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
	const canonicalForcedMovement = Array.from(canonicalEnglish.matchAll(canonicalForcedMovementPattern), match => match[1].toLowerCase());
	const calculatedForcedMovement = Array.from(calculatedEnglish.matchAll(canonicalForcedMovementPattern), match => ({ type: match[1].toLowerCase(), value: match[2] }));
	const localizedForcedMovement = Array.from(localizedRaw.matchAll(localizedForcedMovementPattern), match => localizedForcedMovementType(match[1]));
	const hasUnchangedCanonicalGrammar = (pattern: RegExp, canonicalMatches: RegExpMatchArray[]) => (
		countMatches(calculatedEnglish, pattern) === canonicalMatches.length
	);
	const damageIsProjected = damageValues.length === canonicalDamage.length;
	const potencyIsProjected = potencyValues.length === canonicalPotencies.length;

	if ((!damageIsProjected && !hasUnchangedCanonicalGrammar(canonicalDamagePattern, canonicalDamage))
		|| (localizedDamage.length !== canonicalDamage.length)
		|| (!potencyIsProjected && !hasUnchangedCanonicalGrammar(canonicalPotencyPattern, canonicalPotencies))
		|| (localizedPotencies.length !== canonicalPotencies.length)
		|| (calculatedForcedMovement.length !== canonicalForcedMovement.length)
		|| (localizedForcedMovement.length !== canonicalForcedMovement.length)
		|| calculatedForcedMovement.some((movement, index) => movement.type !== canonicalForcedMovement[index])
		|| localizedForcedMovement.some((type, index) => type !== canonicalForcedMovement[index])) {
		return calculatedEnglish;
	}

	let damageIndex = 0;
	let potencyIndex = 0;
	let forcedMovementIndex = 0;
	let projectedCanonical = canonicalEnglish;
	if (damageValues.length > 0) {
		projectedCanonical = projectedCanonical.replace(canonicalDamagePattern, (_match, prefix: string) => `${prefix}${damageValues[damageIndex++]}`);
	}
	if (potencyValues.length > 0) {
		projectedCanonical = projectedCanonical.replace(/(\b(?:might|agility|reason|intuition|presence|m|a|r|i|p)\s*<\s*)\[(?:weak|average|avg|strong)\]/gi, (_match, prefix: string) => `${prefix}${potencyValues[potencyIndex++]}`);
	}
	projectedCanonical = projectedCanonical.replace(canonicalForcedMovementPattern, (_match, verb: string) => `${verb} ${calculatedForcedMovement[forcedMovementIndex++].value}`);

	damageIndex = 0;
	potencyIndex = 0;
	forcedMovementIndex = 0;
	let projectedLocalized = localizedRaw;
	if (damageValues.length > 0) {
		projectedLocalized = projectedLocalized.replace(localizedDamagePattern, (_match, prefix: string) => `${prefix}${damageValues[damageIndex++]} `);
	}
	if (potencyValues.length > 0) {
		projectedLocalized = projectedLocalized.replace(localizedPotencyPattern, (_match, prefix: string) => `${prefix}${potencyValues[potencyIndex++]}`);
	}
	projectedLocalized = projectedLocalized.replace(localizedForcedMovementPattern, (_match, verb: string) => `${verb} ${calculatedForcedMovement[forcedMovementIndex++].value}`);

	return projectCalculatedConditionEmphasis({
		canonicalEnglish: projectedCanonical,
		calculatedEnglish: calculatedEnglish,
		localizedRaw: projectedLocalized
	}) ?? calculatedEnglish;
};
