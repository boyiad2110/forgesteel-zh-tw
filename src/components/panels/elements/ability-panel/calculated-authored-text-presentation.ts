import { AppLocale } from '@/localization/locale';
import { localizeElementField } from '@/localization/resolver';

interface CalculatedAuthoredTextPresentation {
	locale: AppLocale;
	elementID: string;
	field: string;
	canonicalEnglish: string;
	calculatedEnglish: string;
}

interface ConditionEmphasisPresentation {
	canonicalEnglish: string;
	calculatedEnglish: string;
	localizedRaw: string;
}

interface AuthorizedRewrite {
	canonical: RegExp;
	calculated: RegExp;
	localized: RegExp;
	canonicalReplacement: (value: string) => string;
	localizedReplacement: (value: string) => string;
}

// This is deliberately a bounded presentation mapping, not a second Chinese parser or
// a terminology source. Each pair is an Owner-approved condition reading which appears
// in calculated Censor content. The approved raw element snapshot remains the authority.
const approvedConditionReadings: ReadonlyArray<readonly [ string, string ]> = [
	[ 'slowed', '緩速' ],
	[ 'dazed', '暈眩' ],
	[ 'grabbed', '擒制' ],
	[ 'frightened', '畏縮' ],
	[ 'prone', '伏地' ],
	[ 'taunted', '嘲諷' ]
];

// getTextEffect formats potency with code marks and consumes its following comma. That is
// presentation-only punctuation, so normalize precisely that grammar before comparing the
// raw and calculated canonical readings for a safe localized projection.
const removeCalculationFormatting = (value: string) => value
	.replace(/[*`]/g, '')
	.replace(/([MARIP]\s*<\s*(?:\[[^\]]+\]|-?\d+)),\s*/gi, '$1 ');

const matchAll = (value: string, pattern: RegExp) => Array.from(value.matchAll(pattern));

/**
 * Adds only canonical condition emphasis that AbilityLogic introduced. It returns
 * undefined when an approved raw reading cannot be projected without guessing.
 */
export const projectCalculatedConditionEmphasis = ({
	canonicalEnglish,
	calculatedEnglish,
	localizedRaw
}: ConditionEmphasisPresentation): string | undefined => {
	let projectedCanonical = canonicalEnglish;
	let projectedLocalized = localizedRaw;

	for (const [ canonicalCondition, localizedCondition ] of approvedConditionReadings) {
		const calculatedPattern = new RegExp(`\\*\\*${canonicalCondition}\\*\\*`, 'gi');
		const calculatedMatches = matchAll(calculatedEnglish, calculatedPattern);
		if (calculatedMatches.length === 0) {
			continue;
		}

		const canonicalPattern = new RegExp(`\\b${canonicalCondition}\\b`, 'gi');
		const canonicalMatches = matchAll(canonicalEnglish, canonicalPattern);
		const localizedPattern = new RegExp(localizedCondition, 'g');
		const localizedMatches = matchAll(localizedRaw, localizedPattern);

		if ((canonicalMatches.length !== calculatedMatches.length) || (localizedMatches.length !== canonicalMatches.length)) {
			return undefined;
		}

		projectedCanonical = projectedCanonical.replace(canonicalPattern, '**$&**');
		projectedLocalized = projectedLocalized.replace(localizedPattern, '**$&**');
	}

	return removeCalculationFormatting(projectedCanonical) === removeCalculationFormatting(calculatedEnglish) ? projectedLocalized : undefined;
};

const authorizedRewrites: readonly AuthorizedRewrite[] = [
	{
		canonical: /deal holy damage equal to twice your Presence score to them/gi,
		calculated: /deal holy damage equal to (-?\d+) to them/gi,
		localized: /對他造成等於你氣場 ×2 的神聖傷害/g,
		canonicalReplacement: value => `deal holy damage equal to ${value} to them`,
		localizedReplacement: value => `對他造成 ${value} 點神聖傷害`
	},
	{
		canonical: /deal holy damage to them equal to your Presence score/gi,
		calculated: /deal holy damage to them equal to (-?\d+)/gi,
		localized: /對他造成等於你氣場的神聖傷害/g,
		canonicalReplacement: value => `deal holy damage to them equal to ${value}`,
		localizedReplacement: value => `對他造成 ${value} 點神聖傷害`
	},
	{
		canonical: /takes psychic damage equal to your Presence score/gi,
		calculated: /takes psychic damage equal to (-?\d+)/gi,
		localized: /受到等於你氣場的心靈傷害/g,
		canonicalReplacement: value => `takes psychic damage equal to ${value}`,
		localizedReplacement: value => `受到 ${value} 點心靈傷害`
	},
	{
		canonical: /regains Stamina equal to your Recovery value/gi,
		calculated: /regains Stamina equal to (-?\d+)/gi,
		localized: /恢復等於你復元值的體力/g,
		canonicalReplacement: value => `regains Stamina equal to ${value}`,
		localizedReplacement: value => `恢復 ${value} 點體力`
	},
	{
		canonical: /regain Stamina equal to your recovery value/gi,
		calculated: /regain Stamina equal to (-?\d+)/gi,
		localized: /恢復等於你復元值的體力/g,
		canonicalReplacement: value => `regain Stamina equal to ${value}`,
		localizedReplacement: value => `恢復 ${value} 點體力`
	},
	{
		canonical: /shift up to your speed in a straight line toward the target after pushing them/gi,
		calculated: /shift up to (-?\d+) squares in a straight line toward the target after pushing them/gi,
		localized: /推動目標後，你可以朝目標直線遁移最多等於你速度的距離/g,
		canonicalReplacement: value => `shift up to ${value} squares in a straight line toward the target after pushing them`,
		localizedReplacement: value => `推動目標後，你可以朝目標直線遁移最多 ${value} 格`
	},
	{
		canonical: /is pushed away from the target up to a number of squares equal to your Presence score/gi,
		calculated: /is pushed away from the target up to a number of squares equal to (-?\d+)/gi,
		localized: /推動最多等於你氣場的格數/g,
		canonicalReplacement: value => `is pushed away from the target up to a number of squares equal to ${value}`,
		localizedReplacement: value => `推動最多 ${value} 格`
	},
	{
		canonical: /pushed (\d+) squares away from the target/gi,
		calculated: /pushed (\d+) squares away from the target/gi,
		localized: /推動 (\d+) 格/g,
		canonicalReplacement: value => `pushed ${value} squares away from the target`,
		localizedReplacement: value => `推動 ${value} 格`
	}
];

const projectAuthorizedValues = (canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	let projectedCanonical = canonicalEnglish;
	let projectedLocalized = localizedRaw;

	for (const rewrite of authorizedRewrites) {
		const canonicalMatches = matchAll(canonicalEnglish, rewrite.canonical);
		if (canonicalMatches.length === 0) {
			continue;
		}

		const calculatedMatches = matchAll(calculatedEnglish, rewrite.calculated);
		const unchangedCanonicalMatches = matchAll(calculatedEnglish, rewrite.canonical);
		if ((calculatedMatches.length === 0) && (unchangedCanonicalMatches.length === canonicalMatches.length)) {
			continue;
		}
		const localizedMatches = matchAll(localizedRaw, rewrite.localized);
		if ((canonicalMatches.length !== 1) || (calculatedMatches.length !== 1) || (localizedMatches.length !== 1)) {
			return undefined;
		}

		const value = calculatedMatches[0][1];
		projectedCanonical = projectedCanonical.replace(rewrite.canonical, rewrite.canonicalReplacement(value));
		projectedLocalized = projectedLocalized.replace(rewrite.localized, rewrite.localizedReplacement(value));
	}

	return projectCalculatedConditionEmphasis({
		canonicalEnglish: projectedCanonical,
		calculatedEnglish: calculatedEnglish,
		localizedRaw: projectedLocalized
	});
};

/**
 * Localizes an authored text section from its approved raw canonical snapshot, then
 * projects only the small set of values AbilityLogic can safely rewrite for Censor.
 */
export const localizeCalculatedAuthoredTextPresentation = ({
	locale,
	elementID,
	field,
	canonicalEnglish,
	calculatedEnglish
}: CalculatedAuthoredTextPresentation) => {
	if (locale === 'en') {
		return calculatedEnglish;
	}

	const localizedRaw = localizeElementField(locale, elementID, field, canonicalEnglish);
	if (localizedRaw === canonicalEnglish) {
		return calculatedEnglish;
	}

	if (calculatedEnglish === canonicalEnglish) {
		return localizedRaw;
	}

	return projectAuthorizedValues(canonicalEnglish, calculatedEnglish, localizedRaw) ?? calculatedEnglish;
};
