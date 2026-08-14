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
	[ 'taunted', '嘲諷' ],
	[ 'bleeding', '出血' ],
	[ 'weakened', '虛弱' ]
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
		canonical: /takes extra damage equal to your Might score for each opportunity attack you trigger during your move/gi,
		calculated: /takes extra damage equal to (-?\d+) for each opportunity attack you trigger during your move/gi,
		localized: /會額外受到 1 次傷害，傷害量等於你的力量 × 你在移動期間引發的藉機攻擊次數/g,
		canonicalReplacement: value => `takes extra damage equal to ${value} for each opportunity attack you trigger during your move`,
		localizedReplacement: value => `會額外受到 ${value} × 你在移動期間引發的藉機攻擊次數傷害`
	},
	{
		canonical: /takes damage equal to your Might score at the end of your turns/gi,
		calculated: /takes damage equal to (-?\d+) at the end of your turns/gi,
		localized: /目標會受到等於你力量的傷害/g,
		canonicalReplacement: value => `takes damage equal to ${value} at the end of your turns`,
		localizedReplacement: value => `目標會受到 ${value} 點傷害`
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

// Tide of Death's multi-sentence prose is intentionally bound to its approved identity;
// this is a safe speed projection, not a general Chinese grammar rewrite.
const projectFuryTideOfDeathSpeed = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	if ((elementID !== 'fury-ability-7') || (field !== 'sections.0.text')) {
		return undefined;
	}

	const canonicalPrefix = 'You move up to your speed in a straight line';
	const calculatedMatch = calculatedEnglish.match(/^You move up to (-?\d+) squares in a straight line/);
	if (!canonicalEnglish.startsWith(canonicalPrefix) || !calculatedMatch) {
		return undefined;
	}

	const projectedCanonical = canonicalEnglish.replace(canonicalPrefix, `You move up to ${calculatedMatch[1]} squares in a straight line`);
	if (projectedCanonical !== calculatedEnglish) {
		return undefined;
	}

	const localizedPrefix = '你直線移動最多等於你速度的距離';
	if (!localizedRaw.includes(localizedPrefix)) {
		return undefined;
	}

	return localizedRaw.replace(localizedPrefix, `你直線移動最多 ${calculatedMatch[1]} 格`);
};

// These two approved Conduit readings are identity-bound: AbilityLogic resolves their
// Intuition values, while Library keeps the approved unresolved raw zh-TW wording.
const projectConduitIntuitionValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const projections = [
		{
			elementID: 'conduit-ability-7',
			field: 'sections.1.text',
			canonical: 'gains temporary Stamina equal to your Intuition score',
			calculated: /gains temporary Stamina equal to (-?\d+)/,
			localized: '獲得等於你直覺的臨時體力',
			localizedReplacement: (value: string) => `獲得 ${value} 點臨時體力`
		},
		{
			elementID: 'conduit-ability-10',
			field: 'sections.0.text',
			canonical: 'takes holy damage equal to your Intuition score',
			calculated: /takes holy damage equal to (-?\d+)/,
			localized: '受到等於你直覺的神聖傷害',
			localizedReplacement: (value: string) => `受到 ${value} 點神聖傷害`
		}
	];
	const projection = projections.find(candidate => (candidate.elementID === elementID) && (candidate.field === field));
	if (!projection) {
		return undefined;
	}

	const calculatedMatch = calculatedEnglish.match(projection.calculated);
	if (!calculatedMatch) {
		return undefined;
	}

	const projectedCanonical = canonicalEnglish.replace(projection.canonical, calculatedMatch[0]);
	if ((projectedCanonical !== calculatedEnglish) || !localizedRaw.includes(projection.localized)) {
		return undefined;
	}

	return localizedRaw.replace(projection.localized, projection.localizedReplacement(calculatedMatch[1]));
};

// These Elementalist Reason-score readings are identity-bound snapshots. The canonical
// calculator resolves the English first; this only projects the verified value into the
// Owner-approved zh-TW grammar. The Earth pillar's "up to" phrasing is intentionally not
// listed: the canonical calculator leaves it unresolved, so Library and Hero keep its raw
// approved zh-TW text.
const projectElementalistReasonValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	if ((elementID === 'elementalist-1-6') && (field === 'sections.0.text')) {
		const damageCanonical = 'That creature takes damage of the chosen type equal to your Reason score.';
		const teleportCanonical = 'You teleport up to a number of squares equal to your Reason score.';
		const damageCalculated = calculatedEnglish.match(/That creature takes damage of the chosen type equal to (-?\d+)\./);
		const teleportCalculated = calculatedEnglish.match(/You teleport up to a number of squares equal to (-?\d+)\./);
		const damageLocalized = '該生物會受到等於你`理智`的所選類型傷害。';
		const teleportLocalized = '你傳送最多等於你`理智`的格數。';

		if (!damageCalculated || !teleportCalculated || !localizedRaw.includes(damageLocalized) || !localizedRaw.includes(teleportLocalized)) {
			return undefined;
		}

		const projectedCanonical = canonicalEnglish
			.replace(damageCanonical, damageCalculated[0])
			.replace(teleportCanonical, teleportCalculated[0]);
		if (projectedCanonical !== calculatedEnglish) {
			return undefined;
		}

		return localizedRaw
			.replace(damageLocalized, `該生物會受到 ${damageCalculated[1]} 點所選類型傷害。`)
			.replace(teleportLocalized, `你傳送最多 ${teleportCalculated[1]} 格。`);
	}

	const projections = [
		{
			elementID: 'elementalist-1-8c',
			field: 'type.trigger',
			canonical: 'A creature within a number of squares equal to your Reason score deals damage to you,',
			calculated: /A creature within a number of squares equal to (-?\d+) deals damage to you,/,
			localized: '當位於你`理智`格數內的',
			localizedReplacement: (value: string) => `當位於你 ${value} 格內的`
		},
		{
			elementID: 'elementalist-1-8c',
			field: 'sections.0.text',
			canonical: 'You slide the attacking creature up to a number of squares equal to your Reason score.',
			calculated: /You slide the attacking creature up to a number of squares equal to (-?\d+)\./,
			localized: '你將該生物滑動最多等於你`理智`的格數。',
			localizedReplacement: (value: string) => `你將該生物滑動最多 ${value} 格。`
		},
		{
			elementID: 'elementalist-1-8d',
			field: 'sections.0.text',
			canonical: 'You push that creature a number of squares equal to twice your Reason score.',
			calculated: /You push that creature a number of squares equal to (-?\d+)\./,
			localized: '你將該生物推動你`理智` ×2 的格數。',
			localizedReplacement: (value: string) => `你將該生物推動 ${value} 格。`
		},
		{
			elementID: 'elementalist-ability-3',
			field: 'sections.1.text',
			canonical: 'You can teleport up to a number of squares equal to your Reason score.',
			calculated: /You can teleport up to a number of squares equal to (-?\d+)\./,
			localized: '你可以傳送最多等於你`理智`的格數。',
			localizedReplacement: (value: string) => `你可以傳送最多 ${value} 格。`
		}
	];
	const projection = projections.find(candidate => (candidate.elementID === elementID) && (candidate.field === field));
	if (!projection) {
		return undefined;
	}

	const calculatedMatch = calculatedEnglish.match(projection.calculated);
	if (!calculatedMatch || !localizedRaw.includes(projection.localized)) {
		return undefined;
	}

	const projectedCanonical = canonicalEnglish.replace(projection.canonical, calculatedMatch[0]);
	if (projectedCanonical !== calculatedEnglish) {
		return undefined;
	}

	return localizedRaw.replace(projection.localized, projection.localizedReplacement(calculatedMatch[1]));
};

const projectNullCalculatedValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	if ((elementID === 'null-ability-10') && (field === 'sections.0.text')) {
		const calculatedMatches = Array.from(calculatedEnglish.matchAll(/takes psychic damage equal to (-?\d+)/g));
		const firstCanonical = 'takes psychic damage equal to twice your Intuition score';
		const secondCanonical = 'takes psychic damage equal to your Intuition score';
		const firstLocalized = '每個目標都會受到等於你`直覺` ×2 的心靈傷害。';
		const secondLocalized = '位於你無念場區域內的每個敵人都會受到等於你`直覺`的心靈傷害。';

		if ((calculatedMatches.length !== 2) || !localizedRaw.includes(firstLocalized) || !localizedRaw.includes(secondLocalized)) {
			return undefined;
		}

		const projectedCanonical = canonicalEnglish
			.replace(firstCanonical, calculatedMatches[0][0])
			.replace(secondCanonical, calculatedMatches[1][0]);
		if (projectedCanonical !== calculatedEnglish) {
			return undefined;
		}

		return localizedRaw
			.replace(firstLocalized, `每個目標都會受到 ${calculatedMatches[0][1]} 點心靈傷害。`)
			.replace(secondLocalized, `位於你無念場區域內的每個敵人都會受到 ${calculatedMatches[1][1]} 點心靈傷害。`);
	}

	const projections = [
		{ elementID: 'null-ability-1', field: 'sections.1.text', canonical: 'You can slide one adjacent enemy up to a number of squares equal to your Intuition score.', calculated: /You can slide one adjacent enemy up to a number of squares equal to (-?\d+)\./, localized: '你可以將 1 個相鄰的敵人滑動最多等於你`直覺`的格數。', replacement: (value: string) => `你可以將 1 個相鄰的敵人滑動最多 ${value} 格。` },
		{ elementID: 'null-ability-2', field: 'sections.1.text', canonical: 'You can deal damage equal to your Agility score to one creature or object adjacent to you.', calculated: /You can deal damage equal to (-?\d+) to one creature or object adjacent to you\./, localized: '你可以對 1 個相鄰的生物或物體造成等於你`敏捷`的傷害。', replacement: (value: string) => `你可以對 1 個相鄰的生物或物體造成 ${value} 點傷害。` },
		{ elementID: 'null-ability-3', field: 'sections.1.text', canonical: 'You can shift up to half your speed before or after you make the strike.', calculated: /You can shift up to (-?\d+) squares before or after you make the strike\./, localized: '遁移最多等於你速度一半的距離', replacement: (value: string) => `遁移最多 ${value} 格` },
		{ elementID: 'null-ability-9', field: 'sections.1.text', canonical: 'You can shift up to half your speed before or after you make this strike.', calculated: /You can shift up to (-?\d+) squares before or after you make this strike\./, localized: '遁移最多等於你速度一半的距離', replacement: (value: string) => `遁移最多 ${value} 格` },
		{ elementID: 'null-ability-11', field: 'sections.1.text', canonical: 'shift up to your speed. You must end this shift adjacent to the target.', calculated: /shift up to (-?\d+) squares\. You must end this shift adjacent to the target\./, localized: '遁移最多等於你速度的距離', replacement: (value: string) => `遁移最多 ${value} 格` },
		{ elementID: 'null-ability-13', field: 'sections.1.text', canonical: 'the target takes damage equal to your Intuition score whenever they use a supernatural ability that costs Malice.', calculated: /the target takes damage equal to (-?\d+) whenever they use a supernatural ability that costs Malice\./, localized: '就會受到等於你`直覺`的傷害。', replacement: (value: string) => `就會受到 ${value} 點傷害。` }
	];
	const projection = projections.find(candidate => (candidate.elementID === elementID) && (candidate.field === field));
	if (!projection) {
		return undefined;
	}
	const match = calculatedEnglish.match(projection.calculated);
	if (!match || !localizedRaw.includes(projection.localized)) {
		return undefined;
	}
	const projectedCanonical = canonicalEnglish.replace(projection.canonical, match[0]);
	const projectedLocalized = localizedRaw.replace(projection.localized, projection.replacement(match[1]));
	return projectCalculatedConditionEmphasis({
		canonicalEnglish: projectedCanonical,
		calculatedEnglish: calculatedEnglish,
		localizedRaw: projectedLocalized
	});
};

// Shadow's two authored Speed readings. AbilityLogic resolves the canonical English speed
// first; this only carries that verified value into the Owner-approved zh-TW grammar, and
// Library keeps the approved unresolved raw wording.
const projectShadowSpeedValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const projections = [
		{ elementID: 'shadow-ability-7', field: 'sections.1.text' },
		{ elementID: 'shadow-ability-10', field: 'sections.0.text' }
	];
	if (!projections.some(candidate => (candidate.elementID === elementID) && (candidate.field === field))) {
		return undefined;
	}

	const canonicalSpeed = 'shift up to your speed';
	const calculatedMatch = calculatedEnglish.match(/shift up to (-?\d+) squares/);
	const localizedSpeed = '遁移最多等於速度的距離';
	if (!calculatedMatch || !canonicalEnglish.includes(canonicalSpeed) || !localizedRaw.includes(localizedSpeed)) {
		return undefined;
	}

	const projectedCanonical = canonicalEnglish.replace(canonicalSpeed, calculatedMatch[0]);
	if (projectedCanonical !== calculatedEnglish) {
		return undefined;
	}

	return localizedRaw.replace(localizedSpeed, `遁移最多 ${calculatedMatch[1]} 格`);
};

// Mark: Trigger is the one Tactician reading whose canonical grammar the calculator rewrites.
// Both Reason-score expressions are resolved in English first and only their verified values
// are carried into the approved zh-TW; the taunted emphasis is then added by the shared
// condition projection. Squad! Forward! is deliberately absent: its 'their speed' is
// target-relative, so the calculator leaves it alone and Hero keeps the approved raw wording.
const projectTacticianReasonValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	if ((elementID !== 'tactician-1-5b') || (field !== 'sections.0.text')) {
		return undefined;
	}

	const damageCanonical = 'The ability deals extra damage equal to twice your Reason score.';
	const shiftCanonical = 'The creature dealing the damage can shift up to a number of squares equal to your Reason score.';
	const damageCalculated = calculatedEnglish.match(/The ability deals extra damage equal to (-?\d+)\./);
	const shiftCalculated = calculatedEnglish.match(/The creature dealing the damage can shift up to a number of squares equal to (-?\d+)\./);
	const damageLocalized = '該招式額外造成你`理智` × 2 的傷害。';
	const shiftLocalized = '造成傷害的生物可以遁移最多等於你`理智`的格數。';

	if (!damageCalculated || !shiftCalculated || !localizedRaw.includes(damageLocalized) || !localizedRaw.includes(shiftLocalized)) {
		return undefined;
	}

	const projectedCanonical = canonicalEnglish
		.replace(damageCanonical, damageCalculated[0])
		.replace(shiftCanonical, shiftCalculated[0]);
	const projectedLocalized = localizedRaw
		.replace(damageLocalized, `該招式額外造成 ${damageCalculated[1]} 點傷害。`)
		.replace(shiftLocalized, `造成傷害的生物可以遁移最多 ${shiftCalculated[1]} 格。`);

	return projectCalculatedConditionEmphasis({
		canonicalEnglish: projectedCanonical,
		calculatedEnglish: calculatedEnglish,
		localizedRaw: projectedLocalized
	});
};

// Talent's authored Reason and Presence readings are identity-bound snapshots. AbilityLogic
// resolves each value in canonical English first and only that verified number is carried into
// the approved zh-TW grammar; the multiplication in Awe's 'three times your Presence score' is
// never redone here. Library keeps the approved unresolved raw wording for all of them.
const projectTalentCharacteristicValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	// Materialize resolves two separate damage values in one reading, so both the calculated
	// cardinality and both approved zh-TW phrasings are verified before either is projected.
	if ((elementID === 'talent-ability-6') && (field === 'sections.2.effect')) {
		const explosionCanonical = 'each creature adjacent to the target takes damage equal to your Reason score.';
		const selfCanonical = 'You also take damage equal to your Reason score that can’t be reduced in any way.';
		const explosionCalculated = calculatedEnglish.match(/each creature adjacent to the target takes damage equal to (-?\d+)\./);
		const selfCalculated = calculatedEnglish.match(/You also take damage equal to (-?\d+) that can’t be reduced in any way\./);
		const explosionLocalized = '與目標相鄰的每個生物都會受到等於你`理智`的傷害。';
		const selfLocalized = '你也同時受到等於你`理智`的傷害（無法被任何方式減免）。';

		if (!explosionCalculated || !selfCalculated || !localizedRaw.includes(explosionLocalized) || !localizedRaw.includes(selfLocalized)) {
			return undefined;
		}

		return projectCalculatedConditionEmphasis({
			canonicalEnglish: canonicalEnglish
				.replace(explosionCanonical, explosionCalculated[0])
				.replace(selfCanonical, selfCalculated[0]),
			calculatedEnglish: calculatedEnglish,
			localizedRaw: localizedRaw
				.replace(explosionLocalized, `與目標相鄰的每個生物都會受到 ${explosionCalculated[1]} 點傷害。`)
				.replace(selfLocalized, `你也同時受到 ${selfCalculated[1]} 點傷害（無法被任何方式減免）。`)
		});
	}

	const projections = [
		{ elementID: 'talent-1-6b', field: 'sections.0.text', canonical: 'You can push your attacker up to a number of squares equal to your Reason score.', calculated: /You can push your attacker up to a number of squares equal to (-?\d+)\./, localized: '你可以將攻擊者推動最多等於你`理智`的格數。', replacement: (value: string) => `你可以將攻擊者推動最多 ${value} 格。` },
		{ elementID: 'talent-ability-7', field: 'sections.2.effect', canonical: 'you take damage equal to your Reason score that can’t be reduced in any way.', calculated: /you take damage equal to (-?\d+) that can’t be reduced in any way\./, localized: '但你也會受到等於你`理智`的傷害（無法被任何方式減免）。', replacement: (value: string) => `但你也會受到 ${value} 點傷害（無法被任何方式減免）。` },
		{ elementID: 'talent-ability-9', field: 'sections.0.text', canonical: 'they gain temporary Stamina equal to three times your Presence score,', calculated: /they gain temporary Stamina equal to (-?\d+),/, localized: '他會獲得等於你`氣場` ×3 的臨時體力，', replacement: (value: string) => `他會獲得 ${value} 點臨時體力，` },
		{ elementID: 'talent-ability-14', field: 'sections.0.text', canonical: 'they can push one adjacent creature up to a number of squares equal to your Reason score.', calculated: /they can push one adjacent creature up to a number of squares equal to (-?\d+)\./, localized: '他可以將 1 個相鄰的生物推動最多等於你`理智`的格數。', replacement: (value: string) => `他可以將 1 個相鄰的生物推動最多 ${value} 格。` },
		{ elementID: 'talent-ability-15', field: 'sections.0.text', canonical: 'The target’s stability increases by an amount equal to your Reason score,', calculated: /The target’s stability increases by an amount equal to (-?\d+),/, localized: '目標的穩度增加等於你`理智`的數值，', replacement: (value: string) => `目標的穩度增加 ${value}，` }
	];
	const projection = projections.find(candidate => (candidate.elementID === elementID) && (candidate.field === field));
	if (!projection) {
		return undefined;
	}

	const calculatedMatch = calculatedEnglish.match(projection.calculated);
	if (!calculatedMatch || !localizedRaw.includes(projection.localized)) {
		return undefined;
	}

	return projectCalculatedConditionEmphasis({
		canonicalEnglish: canonicalEnglish.replace(projection.canonical, calculatedMatch[0]),
		calculatedEnglish: calculatedEnglish,
		localizedRaw: localizedRaw.replace(projection.localized, projection.replacement(calculatedMatch[1]))
	});
};

/**
 * Localizes an authored text section from its approved raw canonical snapshot, then
 * projects only explicitly authorized, identity-bound values AbilityLogic can safely rewrite.
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

	const furyTideOfDeath = projectFuryTideOfDeathSpeed(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (furyTideOfDeath) {
		return furyTideOfDeath;
	}

	const conduitIntuitionValue = projectConduitIntuitionValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (conduitIntuitionValue) {
		return conduitIntuitionValue;
	}

	const elementalistReasonValue = projectElementalistReasonValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (elementalistReasonValue) {
		return elementalistReasonValue;
	}

	const nullCalculatedValue = projectNullCalculatedValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (nullCalculatedValue) {
		return nullCalculatedValue;
	}

	const shadowSpeedValue = projectShadowSpeedValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (shadowSpeedValue) {
		return shadowSpeedValue;
	}

	const tacticianReasonValue = projectTacticianReasonValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (tacticianReasonValue) {
		return tacticianReasonValue;
	}

	const talentCharacteristicValue = projectTalentCharacteristicValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (talentCharacteristicValue) {
		return talentCharacteristicValue;
	}

	return projectAuthorizedValues(canonicalEnglish, calculatedEnglish, localizedRaw) ?? calculatedEnglish;
};
