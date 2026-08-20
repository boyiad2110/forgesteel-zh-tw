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
// A characteristic choice is still one calculator-owned operand. The presentation layer
// recognizes its authored structure but never selects or evaluates a characteristic itself.
// Authored content writes the final 'or' three ways - 'M or A' with no list at all,
// 'A, R, I, or P' with an Oxford comma, and 'M, R, I or P' without one - so the comma before
// 'or' is optional and the leading comma-separated list may be empty. Recognizing one operand
// is all this does: which characteristic applies is still decided only by the calculator.
const characteristicChoice = `(?:${characteristicToken}\\s*,\\s*)*${characteristicToken}(?:\\s*,\\s*|\\s+)or\\s+${characteristicToken}`;
const characteristicExpression = `(?:\\d*${characteristicToken}|${characteristicChoice})`;
// A tier may open with a dice term the calculator never resolves, e.g. '2d6 + 7 + A damage'.
// It is matched as part of the leading prefix so it is carried through untouched and only
// the arithmetic the calculator did resolve is projected.
const dicePrefix = '(?:\\d*d\\d+\\s*\\+\\s*)?';
const canonicalDamagePattern = new RegExp(`((?:^|;\\s*)${dicePrefix})(\\d+(?:\\s*\\+\\s*${characteristicExpression})?)(?=\\s+(?:(?:[a-z]+(?:\\s+or\\s+[a-z]+)*)\\s+)?damage\\b)`, 'gi');
const calculatedDamagePattern = new RegExp(`((?:^|;\\s*)${dicePrefix})(-?\\d+)(?=\\s+(?:(?:[a-z]+(?:\\s+or\\s+[a-z]+)*)\\s+)?damage\\b)`, 'gi');
// The zh-TW reading of the same operand. A two-characteristic choice reads '`力量`或`敏捷`'
// with no 、 at all, so the enumerated part may be empty here too.
const localizedCharacteristicChoice = '`[^`]+`(?:、`[^`]+`)*或`[^`]+`';
const localizedDamagePattern = new RegExp(`((?:^|[；;]\\s*)${dicePrefix})(\\d+(?:\\s*\\+\\s*(?:${localizedCharacteristicChoice}|\`[^\`]+\`))?)[ \\t]*(?=[^；;]*傷害)`, 'g');
const canonicalPotencyPattern = /\b(?:might|agility|reason|intuition|presence|m|a|r|i|p)\s*<\s*\[(?:weak|average|avg|strong)\]/gi;
const calculatedPotencyPattern = /`?(?:might|agility|reason|intuition|presence|m|a|r|i|p)\s*<\s*(-?\d+)`?/gi;
const localizedPotencyPattern = /(`[^`]+`\s*<\s*)\[(?:弱|中|強)\]/g;
// A forced movement distance may be authored as characteristic arithmetic, e.g. 'Slide 2 + R'.
// The whole distance expression is captured so a calculator-resolved distance replaces all of
// it, and neither reading is left with a half-projected '+ R' beside an already resolved value.
const canonicalForcedMovementPattern = new RegExp(`\\b(push|pull|slide)\\s+(\\d+(?:\\s*\\+\\s*\\d*${characteristicToken})?)\\b`, 'gi');
const localizedForcedMovementPattern = /(推動|拉動|滑動)\s+(\d+(?:\s*\+\s*`[^`]+`)?)/g;
// A tier may close with authored characteristic arithmetic the calculator resolves in place,
// e.g. 'weakness equal to 5 + your Reason score' becomes 'weakness equal to 8'. Only this exact
// closing grammar is projected, and only when every reading carries it exactly once.
const canonicalWeaknessPattern = /the target has weakness equal to \d+\s*\+\s*your (?:might|agility|reason|intuition|presence) score/gi;
const calculatedWeaknessPattern = /the target has weakness equal to (-?\d+)/gi;
const localizedWeaknessPattern = /目標獲得指定弱點 \d+\s*\+\s*你的`[^`]+`/g;

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
 * Thunder Mother's three tiers are the one approved Power Roll reading in this slice whose
 * canonical grammar states its damage as a level-derived expression ('Lightning damage equal
 * to 5 + your level') rather than the leading '<number> damage' arithmetic the general damage
 * projection above recognizes. AbilityLogic resolves the level in canonical English first,
 * and only that verified value is carried into the Owner-approved zh-TW, which then reads
 * with the same compact 'N 傷害' grammar every other approved tier uses.
 *
 * This is deliberately identity-bound and exact-match on both readings: nothing is projected
 * unless the canonical tier and the approved zh-TW are the ones snapshotted here and the
 * calculator produced the fully resolved form. Without a Hero the calculator leaves the
 * expression authored, so Library keeps the approved raw zh-TW untouched.
 */
const troubadourLevelDamageTiers = [
	{ abilityID: 'troubadour-virtuoso-4', field: 'sections.1.roll.tier1', canonical: 'Lightning damage equal to your level', localized: '等於你等級的閃電傷害' },
	{ abilityID: 'troubadour-virtuoso-4', field: 'sections.1.roll.tier2', canonical: 'Lightning damage equal to 5 + your level', localized: '等於 5 + 你等級的閃電傷害' },
	{ abilityID: 'troubadour-virtuoso-4', field: 'sections.1.roll.tier3', canonical: 'Lightning damage equal to 10 + your level', localized: '等於 10 + 你等級的閃電傷害' }
];

const projectTroubadourLevelDamageTier = (abilityID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const tier = troubadourLevelDamageTiers.find(candidate => (candidate.abilityID === abilityID) && (candidate.field === field));
	if (!tier || (canonicalEnglish !== tier.canonical) || (localizedRaw !== tier.localized)) {
		return undefined;
	}

	const calculatedMatch = calculatedEnglish.match(/^Lightning damage equal to (-?\d+)$/);
	if (!calculatedMatch) {
		return undefined;
	}

	return `${calculatedMatch[1]} 閃電傷害`;
};

/**
 * `No Dying on My Watch` tier 2 is authored with one leading ASCII space that tiers 1 and 3 do
 * not carry. That space is real canonical authority - the manifest and the catalog snapshot it
 * exactly, and nothing here trims the stored reading - but the canonical calculator drops it,
 * so the shared exact-replay comparison below sees two readings that differ only by that space
 * and refuses to project, leaving this one tier in English while its siblings localize.
 *
 * This is deliberately identity-bound: only the reading this exact ability field carries is
 * compared without its authored leading space, and only when the space is actually there. Every
 * other identity keeps the strict comparison unchanged, and the approved zh-TW is still produced
 * by the same shared projection, not by a tier-specific Chinese rewrite.
 */
const authoredLeadingSpaceTiers = [
	{ abilityID: 'tactician-sub-3-2-2a', field: 'sections.1.roll.tier2' }
];

const projectionCanonicalEnglish = (abilityID: string, field: string, canonicalEnglish: string) => (
	authoredLeadingSpaceTiers.some(tier => (tier.abilityID === abilityID) && (tier.field === field)) && canonicalEnglish.startsWith(' ')
		? canonicalEnglish.slice(1)
		: canonicalEnglish
);

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

	const troubadourLevelDamage = projectTroubadourLevelDamageTier(abilityID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (troubadourLevelDamage) {
		return troubadourLevelDamage;
	}

	// The canonical reading this batch's replay comparison uses. It differs from the stored
	// canonical English only for the identity-bound authored leading space above.
	const replayCanonical = projectionCanonicalEnglish(abilityID, field, canonicalEnglish);

	const damageValues = Array.from(calculatedEnglish.matchAll(calculatedDamagePattern), match => match[2]);
	const canonicalDamage = Array.from(replayCanonical.matchAll(canonicalDamagePattern));
	const localizedDamage = Array.from(localizedRaw.matchAll(localizedDamagePattern));
	const potencyValues = Array.from(calculatedEnglish.matchAll(calculatedPotencyPattern), match => match[1]);
	const canonicalPotencies = Array.from(replayCanonical.matchAll(canonicalPotencyPattern));
	const localizedPotencies = Array.from(localizedRaw.matchAll(localizedPotencyPattern));
	const canonicalForcedMovement = Array.from(replayCanonical.matchAll(canonicalForcedMovementPattern), match => ({ type: match[1].toLowerCase(), expression: match[2] }));
	const calculatedForcedMovement = Array.from(calculatedEnglish.matchAll(canonicalForcedMovementPattern), match => ({ type: match[1].toLowerCase(), expression: match[2] }));
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
		|| calculatedForcedMovement.some((movement, index) => movement.type !== canonicalForcedMovement[index].type)
		|| localizedForcedMovement.some((type, index) => type !== canonicalForcedMovement[index].type)) {
		return calculatedEnglish;
	}

	// A distance the calculator left as authored keeps its approved expression on both readings;
	// anything else has to be a resolved plain number before it can be projected at all.
	const forcedMovementValues = calculatedForcedMovement.map((movement, index) => (
		movement.expression === canonicalForcedMovement[index].expression ? undefined : movement.expression
	));
	if (forcedMovementValues.some(value => (value !== undefined) && !/^\d+$/.test(value))) {
		return calculatedEnglish;
	}

	let damageIndex = 0;
	let potencyIndex = 0;
	let forcedMovementIndex = 0;
	let projectedCanonical = replayCanonical;
	if (damageValues.length > 0) {
		projectedCanonical = projectedCanonical.replace(canonicalDamagePattern, (_match, prefix: string) => `${prefix}${damageValues[damageIndex++]}`);
	}
	if (potencyValues.length > 0) {
		projectedCanonical = projectedCanonical.replace(/(\b(?:might|agility|reason|intuition|presence|m|a|r|i|p)\s*<\s*)\[(?:weak|average|avg|strong)\]/gi, (_match, prefix: string) => `${prefix}${potencyValues[potencyIndex++]}`);
	}
	projectedCanonical = projectedCanonical.replace(canonicalForcedMovementPattern, (_match, verb: string, expression: string) => `${verb} ${forcedMovementValues[forcedMovementIndex++] ?? expression}`);

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
	projectedLocalized = projectedLocalized.replace(localizedForcedMovementPattern, (_match, verb: string, expression: string) => `${verb} ${forcedMovementValues[forcedMovementIndex++] ?? expression}`);

	// Without a Hero the calculator leaves this arithmetic authored, and the approved zh-TW
	// expression stays as it is; only a reading the calculator actually resolved is projected.
	const canonicalWeakness = Array.from(projectedCanonical.matchAll(canonicalWeaknessPattern));
	if ((canonicalWeakness.length > 0) && !hasUnchangedCanonicalGrammar(canonicalWeaknessPattern, canonicalWeakness)) {
		const calculatedWeakness = Array.from(calculatedEnglish.matchAll(calculatedWeaknessPattern));
		const localizedWeakness = Array.from(projectedLocalized.matchAll(localizedWeaknessPattern));
		if ((canonicalWeakness.length !== 1) || (calculatedWeakness.length !== 1) || (localizedWeakness.length !== 1)) {
			return calculatedEnglish;
		}

		projectedCanonical = projectedCanonical.replace(canonicalWeaknessPattern, calculatedWeakness[0][0]);
		projectedLocalized = projectedLocalized.replace(localizedWeaknessPattern, `目標獲得指定弱點 ${calculatedWeakness[0][1]}`);
	}

	return projectCalculatedConditionEmphasis({
		canonicalEnglish: projectedCanonical,
		calculatedEnglish: calculatedEnglish,
		localizedRaw: projectedLocalized
	}) ?? calculatedEnglish;
};
