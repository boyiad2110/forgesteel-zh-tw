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
	[ 'weakened', '虛弱' ],
	[ 'restrained', '束縛' ]
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
			// Persistent Magic is a FeatureType.Text Feature, not an ability section, so this is
			// the FeaturePanel auto-calc path. The calculator resolves the '5 times your Reason
			// score' threshold; the worked example's own authored '10' is left alone by the
			// calculator and is never recomputed here.
			elementID: 'elementalist-1-5',
			field: 'description',
			canonical: 'equal to or greater than 5 times your Reason score',
			calculated: /equal to or greater than (-?\d+)/,
			localized: '傷害 ≧ 你的`理智` ×5',
			localizedReplacement: (value: string) => `傷害 ≧ ${value}`
		},
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
		},
		// The five subclass completion readings the canonical calculator resolves. Fire's two
		// forced-movement bonuses and Void's two teleport distances are authored ability
		// sections, one normal and one Spend each; Acolyte of the Green is a FeatureType.Text
		// Feature and so arrives through the FeaturePanel auto-calc path. The '×2' in each
		// Spend reading is never redone here - the calculator resolves twice-Reason in English
		// first and only that one verified number is carried into the approved zh-TW.
		{
			elementID: 'elementalist-sub-2-1-3',
			field: 'sections.0.text',
			canonical: 'The forced movement distance gains a bonus equal to your Reason score.',
			calculated: /The forced movement distance gains a bonus equal to (-?\d+)\./,
			localized: '強制移動的距離會獲得等於你`理智`的加值。',
			localizedReplacement: (value: string) => `強制移動的距離會獲得 ${value} 點加值。`
		},
		{
			elementID: 'elementalist-sub-2-1-3',
			field: 'sections.1.effect',
			canonical: 'The forced movement distance gains a bonus equal to twice your Reason score instead.',
			calculated: /The forced movement distance gains a bonus equal to (-?\d+) instead\./,
			localized: '強制移動的距離改為獲得等於你`理智` ×2 的加值。',
			localizedReplacement: (value: string) => `強制移動的距離改為獲得 ${value} 點加值。`
		},
		{
			elementID: 'elementalist-sub-3-1-1',
			field: 'description',
			canonical: 'gains temporary Stamina equal to your Reason score.',
			calculated: /gains temporary Stamina equal to (-?\d+)\./,
			localized: '會獲得等於你`理智`的臨時體力。',
			localizedReplacement: (value: string) => `會獲得 ${value} 點臨時體力。`
		},
		{
			elementID: 'elementalist-sub-4-1-4',
			field: 'sections.0.text',
			canonical: 'You teleport the target up to a number of squares equal to your Reason score.',
			calculated: /You teleport the target up to a number of squares equal to (-?\d+)\./,
			localized: '你將目標傳送最多等於你`理智`的格數。',
			localizedReplacement: (value: string) => `你將目標傳送最多 ${value} 格。`
		},
		{
			elementID: 'elementalist-sub-4-1-4',
			field: 'sections.1.effect',
			canonical: 'You teleport the target up to a number of squares equal to twice your Reason score instead.',
			calculated: /You teleport the target up to a number of squares equal to (-?\d+) instead\./,
			localized: '你改為將目標傳送最多等於你`理智` ×2 的格數。',
			localizedReplacement: (value: string) => `你改為將目標傳送最多 ${value} 格。`
		},
		{
			// O Flower Aid, O Earth Defend is a Level 2 5-cost class ability. Only the third of
			// its three authored Markdown bullets carries a calculated value; the leading newline
			// and the other two bullets are untouched by both the calculator and this projection.
			elementID: 'elementalist-ability-17',
			field: 'sections.0.text',
			canonical: 'takes damage equal to your Reason score.',
			calculated: /takes damage equal to (-?\d+)\./,
			localized: '他會受到等於你`理智`的傷害。',
			localizedReplacement: (value: string) => `他會受到 ${value} 點傷害。`
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

/** Counts non-overlapping occurrences of a literal snippet, for exact-occurrence guards. */
const occurrenceCount = (text: string, snippet: string) => text.split(snippet).length - 1;

// The two Elementalist Level 2 Feature descriptions the canonical calculator rewrites. Both
// arrive through the FeaturePanel auto-calc path, which only runs in Hero context, so Library
// keeps the approved raw zh-TW untouched. Each projection is identity-bound and is applied
// only when replaying it onto the canonical English reproduces the calculator's output
// exactly; nothing here recomputes a level, a speed or a characteristic.
const projectElementalistLevel2FeatureValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	// Disciple of Fire states its immunity as a level-derived expression. The Owner-approved
	// zh-TW reads the resolved value with the same 'N 點' grammar the rest of the slice uses.
	if ((elementID === 'elementalist-sub-2-2-1') && (field === 'description')) {
		const canonical = 'You have fire immunity equal to 5 plus your level.';
		const localized = '你擁有等於 5 + 你等級的火焰免疫。';
		const calculatedMatch = calculatedEnglish.match(/You have fire immunity equal to (-?\d+)\./);

		if (!calculatedMatch || (occurrenceCount(canonicalEnglish, canonical) !== 1) || (occurrenceCount(localizedRaw, localized) !== 1)) {
			return undefined;
		}

		if (canonicalEnglish.replace(canonical, calculatedMatch[0]) !== calculatedEnglish) {
			return undefined;
		}

		return localizedRaw.replace(localized, `你擁有 ${calculatedMatch[1]} 點火焰免疫。`);
	}

	// Disciple of the Green is one atomic canonical field whose Animal Forms table runs through
	// the Level 10 rows. The calculator touches it in two ways: it emphasizes the five condition
	// readings the table names, and it resolves the one authored jump distance the Giant frog
	// and Kangaroo rows share. Every other row, and the whole Markdown table structure, is
	// carried through untouched.
	if ((elementID === 'elementalist-sub-3-2-1') && (field === 'description')) {
		const jumpCanonical = 'you can high jump or long jump up to half your speed.';
		const jumpLocalized = '你可以跳高或跳遠最多等於你速度一半的距離。';
		const jumpMatches = Array.from(calculatedEnglish.matchAll(/you can high jump or long jump up to (-?\d+) squares\./g));

		let projectedCanonical = canonicalEnglish;
		let projectedLocalized = localizedRaw;

		if (jumpMatches.length > 0) {
			const resolvedValues = new Set(jumpMatches.map(match => match[1]));
			const agrees = (jumpMatches.length === occurrenceCount(canonicalEnglish, jumpCanonical))
				&& (jumpMatches.length === occurrenceCount(localizedRaw, jumpLocalized))
				&& (resolvedValues.size === 1);
			if (!agrees) {
				return undefined;
			}

			const value = jumpMatches[0][1];
			projectedCanonical = projectedCanonical.split(jumpCanonical).join(`you can high jump or long jump up to ${value} squares.`);
			projectedLocalized = projectedLocalized.split(jumpLocalized).join(`你可以跳高或跳遠最多 ${value} 格。`);
		}

		// The approved zh-TW uses 擒制 for both the 'grab' verb and the 'grabbed' condition, so
		// the shared condition-emphasis helper cannot count them apart. These clauses carry the
		// exact reading each emphasis belongs to instead, one occurrence each.
		const emphasisClauses = [
			{ canonical: 'knocked prone', calculated: 'knocked **prone**', localized: '被擊倒伏地', emphasized: '被擊倒**伏地**' },
			{ canonical: 'While grabbed this way', calculated: 'While **grabbed** this way', localized: '若目標以此方式被擒制', emphasized: '若目標以此方式被**擒制**' },
			{ canonical: 'the target is dazed (save ends)', calculated: 'the target is **dazed** (save ends)', localized: '目標會陷入暈眩（豁免解除）', emphasized: '目標會陷入**暈眩**（豁免解除）' },
			{ canonical: 'targets who are bleeding or winded', calculated: 'targets who are **bleeding** or winded', localized: '你對陷入出血或疲態的目標', emphasized: '你對陷入**出血**或疲態的目標' },
			{ canonical: 'up to eight creatures grabbed.', calculated: 'up to eight creatures **grabbed**.', localized: '你最多可以同時擒制 8 個生物。', emphasized: '你最多可以同時**擒制** 8 個生物。' }
		];

		for (const clause of emphasisClauses) {
			if (occurrenceCount(calculatedEnglish, clause.calculated) === 0) {
				continue;
			}

			const agrees = (occurrenceCount(canonicalEnglish, clause.canonical) === 1)
				&& (occurrenceCount(calculatedEnglish, clause.calculated) === 1)
				&& (occurrenceCount(localizedRaw, clause.localized) === 1);
			if (!agrees) {
				return undefined;
			}

			projectedCanonical = projectedCanonical.replace(clause.canonical, clause.calculated);
			projectedLocalized = projectedLocalized.replace(clause.localized, clause.emphasized);
		}

		return projectedCanonical === calculatedEnglish ? projectedLocalized : undefined;
	}

	return undefined;
};

// These Fury Primordial Aspect readings are identity-bound snapshots. The canonical
// calculator resolves the English value first; this only projects that one verified number
// into the Owner-approved zh-TW grammar. Nothing here recomputes a characteristic, and the
// Berserker Spend's 'twice your Might score' is never doubled on the Chinese side - the
// calculator resolves it in English and only the result is carried across.
const projectFurySubclassCalculatedValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	// Primordial Strength resolves three separate Might readings in one Feature description:
	// the two extra-damage clauses and the Ferocity 2 Knockback bonus. Each is matched and
	// counted on its own, and the whole calculated English is reconstructed before any
	// Chinese text is touched.
	if ((elementID === 'fury-sub-1-1-3') && (field === 'description')) {
		const clauses = [
			{
				canonical: 'the strike deals extra damage equal to your Might score.',
				calculated: /the strike deals extra damage equal to (-?\d+)\./g,
				localized: '你會額外造成等於你`力量`的傷害。',
				replacement: (value: string) => `你會額外造成 ${value} 點傷害。`
			},
			{
				canonical: 'the creature takes extra damage equal to your Might score.',
				calculated: /the creature takes extra damage equal to (-?\d+)\./g,
				localized: '該生物會額外受到等於你`力量`的傷害。',
				replacement: (value: string) => `該生物會額外受到 ${value} 點傷害。`
			},
			{
				canonical: 'the forced movement distance gains a bonus equal to your Might score.',
				calculated: /the forced movement distance gains a bonus equal to (-?\d+)\./g,
				localized: '強制移動的距離會獲得等於你`力量`的加值。',
				replacement: (value: string) => `強制移動的距離會獲得 ${value} 點加值。`
			}
		];

		const matches = clauses.map(clause => Array.from(calculatedEnglish.matchAll(clause.calculated)));
		const occurrencesAgree = clauses.every((clause, index) => (
			(occurrenceCount(canonicalEnglish, clause.canonical) === 1)
			&& (matches[index].length === 1)
			&& (occurrenceCount(localizedRaw, clause.localized) === 1)
		));
		if (!occurrencesAgree) {
			return undefined;
		}

		const projectedCanonical = clauses.reduce((text, clause, index) => text.replace(clause.canonical, matches[index][0][0]), canonicalEnglish);
		if (projectedCanonical !== calculatedEnglish) {
			return undefined;
		}

		return clauses.reduce((text, clause, index) => text.replace(clause.localized, clause.replacement(matches[index][0][1])), localizedRaw);
	}

	const projections = [
		{
			// Primordial Cunning is a Feature description, so this arrives through the
			// FeaturePanel auto-calc path rather than an ability section.
			elementID: 'fury-sub-2-1-3',
			field: 'description',
			canonical: 'the forced movement distance gains a bonus equal to your Agility score.',
			calculated: /the forced movement distance gains a bonus equal to (-?\d+)\./,
			localized: '強制移動的距離會獲得等於你`敏捷`的加值。',
			localizedReplacement: (value: string) => `強制移動的距離會獲得 ${value} 點加值。`
		},
		{
			// Lines of Force's own effect text. The bonus clause is the last of three approved
			// sentences; the other two carry no calculated value and are preserved verbatim.
			elementID: 'fury-sub-1-1-4',
			field: 'sections.0.text',
			canonical: 'the forced movement distance gains a bonus equal to your Might score.',
			calculated: /the forced movement distance gains a bonus equal to (-?\d+)\./,
			localized: '強制移動的距離會獲得等於你`力量`的加值。',
			localizedReplacement: (value: string) => `強制移動的距離會獲得 ${value} 點加值。`
		},
		{
			elementID: 'fury-sub-1-1-4',
			field: 'sections.1.effect',
			canonical: 'The forced movement distance gains a bonus equal to twice your Might score instead.',
			calculated: /The forced movement distance gains a bonus equal to (-?\d+) instead\./,
			localized: '強制移動的距離改為獲得等於你`力量` ×2 的加值。',
			localizedReplacement: (value: string) => `強制移動的距離改為獲得 ${value} 點加值。`
		},
		{
			elementID: 'fury-sub-2-1-4',
			field: 'sections.0.text',
			canonical: 'can shift up to a number of squares equal to your Agility score.',
			calculated: /can shift up to a number of squares equal to (-?\d+)\./,
			localized: '遁移最多等於你`敏捷`的格數。',
			localizedReplacement: (value: string) => `遁移最多 ${value} 格。`
		},
		{
			elementID: 'fury-sub-3-1-4',
			field: 'sections.0.text',
			canonical: 'You gain temporary Stamina equal to your Might score',
			calculated: /You gain temporary Stamina equal to (-?\d+)/,
			localized: '你獲得等於你`力量`的臨時體力',
			localizedReplacement: (value: string) => `你獲得 ${value} 點臨時體力`
		},
		// Level 2. Special Delivery's Might clause is worded differently from the Level 1
		// extra-damage clauses above ('that deals' rather than 'the strike deals'), so it needs
		// its own entry rather than widening theirs.
		{
			elementID: 'fury-sub-1-2-2a',
			field: 'sections.0.text',
			canonical: 'deals extra damage equal to your Might score.',
			calculated: /deals extra damage equal to (-?\d+)\./,
			localized: '並額外造成等於你`力量`的傷害。',
			localizedReplacement: (value: string) => `並額外造成 ${value} 點傷害。`
		},
		{
			// Tooth and Claw is a non-Ability Feature description, so this arrives through the
			// FeaturePanel auto-calc path rather than an ability section.
			elementID: 'fury-sub-3-2-1',
			field: 'description',
			canonical: 'takes damage equal to your Might score.',
			calculated: /takes damage equal to (-?\d+)\./,
			localized: '都會受到等於你`力量`的傷害。',
			localizedReplacement: (value: string) => `都會受到 ${value} 點傷害。`
		},
		{
			// Wrecking Ball resolves the same speed clause Tide of Death does, but its canonical
			// text opens with an authored newline and continues into two more paragraphs. Only the
			// clause is rewritten, so the leading newline and both paragraph breaks are preserved
			// exactly; Tide of Death's own projector stays bound to its own identity.
			elementID: 'fury-sub-1-2-2b',
			field: 'sections.0.text',
			canonical: 'You move up to your speed in a straight line',
			calculated: /You move up to (-?\d+) squares in a straight line/,
			localized: '你直線移動最多等於你速度的距離',
			localizedReplacement: (value: string) => `你直線移動最多 ${value} 格`
		},
		{
			elementID: 'fury-sub-2-2-2b',
			field: 'sections.0.text',
			canonical: 'You shift up to your speed',
			calculated: /You shift up to (-?\d+) squares/,
			localized: '你遁移最多等於你速度的距離',
			localizedReplacement: (value: string) => `你遁移最多 ${value} 格`
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

/**
 * The five Stormwight Kit Feature descriptions the canonical calculator resolves a value in.
 * Each is identity-bound to one Kit: Corven and Raden share the same canonical grammar and
 * the same approved Chinese, but neither identity authorizes the other.
 *
 * These are FeatureType.Text Features, so they arrive through the FeaturePanel auto-calc
 * path. The calculator resolves the English first; only that one verified number is carried
 * into the approved zh-TW, and no potency or characteristic arithmetic happens here.
 *
 * Reconstruction is compared with `removeCalculationFormatting` because the calculator also
 * adds its own presentation-only markup to these fields - code marks around a resolved
 * potency, and bold around condition names. Stripping exactly that markup from both sides
 * proves nothing but the intended value changed, without this code having to reproduce the
 * calculator's formatting.
 *
 * Boren's Growing Ferocity is the one reading whose conditions are deliberately not
 * emphasized: its approved Chinese uses 擒制 for both the Grab maneuver and the grabbed
 * condition, so the occurrence counts cannot line up and the shared condition presenter
 * would rightly refuse. Only its Ferocity 12 potency value is projected.
 */
const projectStormwightKitCalculatedValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const projections = [
		{
			// Aspect Benefits: the pull-and-grab potency threshold, plus grabbed emphasis.
			elementID: 'kit-boren-feature-1',
			canonical: 'M < [average]',
			calculated: /M\s*<\s*(-?\d+)/,
			localized: '`力量` < [中]',
			localizedReplacement: (value: string) => `\`力量\` < ${value}`,
			emphasizeConditions: true
		},
		{
			// Growing Ferocity 12: the potency bonus equal to Might.
			elementID: 'kit-boren-feature-4',
			canonical: 'gains a bonus to its potency equal to your Might score.',
			calculated: /gains a bonus to its potency equal to (-?\d+)\./,
			localized: '其效力都會獲得等於你`力量`的加值。',
			localizedReplacement: (value: string) => `其效力都會獲得 ${value} 點加值。`,
			emphasizeConditions: false
		},
		{
			// Growing Ferocity 2: the Disengage shift bonus equal to Agility.
			elementID: 'kit-corven-feature-4',
			canonical: 'the distance you can shift gains a bonus equal to your Agility score.',
			calculated: /the distance you can shift gains a bonus equal to (-?\d+)\./,
			localized: '你可以遁移的距離會獲得等於你`敏捷`的加值。',
			localizedReplacement: (value: string) => `你可以遁移的距離會獲得 ${value} 點加值。`,
			emphasizeConditions: false
		},
		{
			// Raden's Growing Ferocity reads identically to Corven's, and is bound separately.
			elementID: 'kit-raden-feature-4',
			canonical: 'the distance you can shift gains a bonus equal to your Agility score.',
			calculated: /the distance you can shift gains a bonus equal to (-?\d+)\./,
			localized: '你可以遁移的距離會獲得等於你`敏捷`的加值。',
			localizedReplacement: (value: string) => `你可以遁移的距離會獲得 ${value} 點加值。`,
			emphasizeConditions: false
		},
		{
			// Growing Ferocity 12: the forced movement bonus equal to Agility, plus prone.
			elementID: 'kit-vuken-feature-4',
			canonical: 'the forced movement distance gains a bonus equal to your Agility score.',
			calculated: /the forced movement distance gains a bonus equal to (-?\d+)\./,
			localized: '強制移動的距離會獲得等於你`敏捷`的加值。',
			localizedReplacement: (value: string) => `強制移動的距離會獲得 ${value} 點加值。`,
			emphasizeConditions: true
		}
	];
	const projection = projections.find(candidate => (candidate.elementID === elementID) && (field === 'description'));
	if (!projection) {
		return undefined;
	}

	if ((occurrenceCount(canonicalEnglish, projection.canonical) !== 1) || (occurrenceCount(localizedRaw, projection.localized) !== 1)) {
		return undefined;
	}

	const calculatedMatch = calculatedEnglish.match(projection.calculated);
	if (!calculatedMatch) {
		// Without a Hero the calculator resolves no value here but still adds its own condition
		// emphasis, so the calculated English differs from the canonical by presentation markup
		// alone. Boren's Growing Ferocity is the reading that cannot go through the shared
		// condition presenter, so it would otherwise drop to English on the Library path. When
		// nothing but that markup changed, the approved reading is already correct as authored.
		return removeCalculationFormatting(canonicalEnglish) === removeCalculationFormatting(calculatedEnglish) ? localizedRaw : undefined;
	}

	const projectedCanonical = canonicalEnglish.replace(projection.canonical, calculatedMatch[0].replace(/\s+/g, ' '));
	const projectedLocalized = localizedRaw.replace(projection.localized, projection.localizedReplacement(calculatedMatch[1]));

	if (projection.emphasizeConditions) {
		return projectCalculatedConditionEmphasis({
			canonicalEnglish: projectedCanonical,
			calculatedEnglish: calculatedEnglish,
			localizedRaw: projectedLocalized
		});
	}

	return removeCalculationFormatting(projectedCanonical) === removeCalculationFormatting(calculatedEnglish) ? projectedLocalized : undefined;
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

/**
 * The three Tradition Mastery tables. Their only calculated reading is the Intuition-derived
 * forced movement bonus: Chronokinetic and Cryokinetic carry it once, in their Discipline 12
 * row, and Metakinetic carries it twice, in its Discipline 2 and Discipline 12 rows. The rest
 * of each Markdown table is left alone by the calculator, so only those verified values are
 * carried into the Owner-approved zh-TW, and Library keeps the approved unresolved wording.
 *
 * The expected count has to hold on all three sides - canonical, calculated and approved
 * localized - before anything is projected, and the canonical text with those values put back
 * has to reproduce the calculated English exactly. Any other rewrite the calculator made, or
 * any drift in the approved snapshot, returns undefined so the shared presenter falls back to
 * the whole calculated English instead of mixing the two languages.
 */
const projectNullTraditionMasteryBonus = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const expectedOccurrencesByElementID: Record<string, number> = {
		'null-sub-1-1-2a': 1,
		'null-sub-2-1-2a': 1,
		'null-sub-3-1-2a': 2
	};
	const expectedOccurrences = expectedOccurrencesByElementID[elementID];
	if ((expectedOccurrences === undefined) || (field !== 'description')) {
		return undefined;
	}

	const canonicalBonus = /the forced movement distance gains a bonus equal to your Intuition score/g;
	const calculatedBonus = /the forced movement distance gains a bonus equal to (-?\d+)/g;
	const localizedBonus = /強制移動的距離會獲得等於你`直覺`的加值/g;

	const calculatedMatches = matchAll(calculatedEnglish, calculatedBonus);
	if ((matchAll(canonicalEnglish, canonicalBonus).length !== expectedOccurrences)
		|| (calculatedMatches.length !== expectedOccurrences)
		|| (matchAll(localizedRaw, localizedBonus).length !== expectedOccurrences)) {
		return undefined;
	}

	let canonicalIndex = 0;
	const projectedCanonical = canonicalEnglish.replace(canonicalBonus, () => calculatedMatches[canonicalIndex++][0]);
	if (projectedCanonical !== calculatedEnglish) {
		return undefined;
	}

	let localizedIndex = 0;
	return localizedRaw.replace(localizedBonus, () => `強制移動的距離會獲得 ${calculatedMatches[localizedIndex++][1]} 點加值`);
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

// Smoke Bomb resolves one self Agility expression in canonical English first. The projection
// only carries that verified number into its Owner-approved zh-TW wording; without a Hero the
// approved raw expression remains intact.
const projectShadowAgilityValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	if ((elementID !== 'shadow-sub-2-1-3') || (field !== 'description')) {
		return undefined;
	}

	const canonicalExpression = 'shift a number of squares equal to your Agility score';
	const calculatedMatch = calculatedEnglish.match(/shift a number of squares equal to (-?\d+)/);
	const localizedExpression = '遁移等於`敏捷`的格數';
	if (!calculatedMatch || !canonicalEnglish.includes(canonicalExpression) || !localizedRaw.includes(localizedExpression)) {
		return undefined;
	}

	const projectedCanonical = canonicalEnglish.replace(canonicalExpression, calculatedMatch[0]);
	if (projectedCanonical !== calculatedEnglish) {
		return undefined;
	}

	return localizedRaw.replace(localizedExpression, `遁移 ${calculatedMatch[1]} 格`);
};

// Mark: Trigger is the one Tactician reading whose canonical grammar the calculator rewrites.
// Both Reason-score expressions are resolved in English first and only their verified values
// are carried into the approved zh-TW; the taunted emphasis is then added by the shared
// condition projection. Squad! Forward! is deliberately absent: its 'their speed' is
// target-relative, so the calculator leaves it alone and Hero keeps the approved raw wording.
const projectTacticianReasonValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	if ((elementID === 'tactician-1-5b') && (field === 'sections.0.text')) {
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
	}

	// Parry's Spend text resolves two Reason-score expressions: the ability's own distance and
	// its shift distance. Both are verified in canonical English first and only their resolved
	// values are carried into the approved zh-TW; the static '，而且'/'，而非 1 格。' wording
	// around them is untouched.
	if ((elementID === 'tactician-sub-3-1-3') && (field === 'sections.1.effect')) {
		const distanceCanonical = 'This ability’s distance becomes Melee 1 + your Reason score,';
		const shiftCanonical = 'you can shift up to a number of squares equal to your Reason score instead of 1 square.';
		const distanceCalculated = calculatedEnglish.match(/This ability’s distance becomes Melee (-?\d+),/);
		const shiftCalculated = calculatedEnglish.match(/you can shift up to a number of squares equal to (-?\d+) instead of 1 square\./);
		const distanceLocalized = '此招式的射程改為近戰 1 + 你的`理智`，';
		const shiftLocalized = '你可以遁移最多等於`理智`的格數，而非 1 格。';

		if (!distanceCalculated || !shiftCalculated || !localizedRaw.includes(distanceLocalized) || !localizedRaw.includes(shiftLocalized)) {
			return undefined;
		}

		const projectedCanonical = canonicalEnglish
			.replace(distanceCanonical, distanceCalculated[0])
			.replace(shiftCanonical, shiftCalculated[0]);
		if (projectedCanonical !== calculatedEnglish) {
			return undefined;
		}

		return localizedRaw
			.replace(distanceLocalized, `此招式的射程改為近戰 ${distanceCalculated[1]}，`)
			.replace(shiftLocalized, `你可以遁移最多 ${shiftCalculated[1]} 格，而非 1 格。`);
	}

	return undefined;
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

	// Repel resolves two separate Reason-derived forced-movement values in one authored
	// paragraph. Both calculated occurrences and both approved zh-TW phrasings are verified
	// before either is projected, so a partially-proven reading can never produce a mixed
	// Chinese/English sentence - it falls back to the whole calculated English instead.
	if ((elementID === 'talent-sub-2-1-2') && (field === 'sections.0.text')) {
		const reduceCanonical = 'the distance of the triggering forced movement is reduced by a number of squares equal to your Reason score.';
		const pushCanonical = 'the target can push the source of the forced movement a number of squares equal to your Reason score.';
		const reduceCalculated = calculatedEnglish.match(/the distance of the triggering forced movement is reduced by a number of squares equal to (-?\d+)\./);
		const pushCalculated = calculatedEnglish.match(/the target can push the source of the forced movement a number of squares equal to (-?\d+)\./);
		const reduceLocalized = '或將觸發的強制移動距離減少等於你`理智`的格數。';
		const pushLocalized = '目標可以將強制移動的來源推動等於你`理智`的格數。';

		if (!reduceCalculated || !pushCalculated || !localizedRaw.includes(reduceLocalized) || !localizedRaw.includes(pushLocalized)) {
			return undefined;
		}

		return projectCalculatedConditionEmphasis({
			canonicalEnglish: canonicalEnglish
				.replace(reduceCanonical, reduceCalculated[0])
				.replace(pushCanonical, pushCalculated[0]),
			calculatedEnglish: calculatedEnglish,
			localizedRaw: localizedRaw
				.replace(reduceLocalized, `或將觸發的強制移動距離減少 ${reduceCalculated[1]} 格。`)
				.replace(pushLocalized, `目標可以將強制移動的來源推動 ${pushCalculated[1]} 格。`)
		});
	}

	const projections = [
		{ elementID: 'talent-1-6a', field: 'description', canonical: 'their speed is reduced by an amount equal to your Reason score', calculated: /their speed is reduced by an amount equal to (-?\d+)/, localized: '他的速度會減少等於你`理智`的數值，', replacement: (value: string) => `他的速度會減少 ${value}，` },
		{ elementID: 'talent-1-6c', field: 'description', canonical: 'you gain damage immunity equal to your Reason score', calculated: /you gain damage immunity equal to (-?\d+)/, localized: '你會獲得等於你`理智`的傷害免疫，', replacement: (value: string) => `你會獲得 ${value} 點傷害免疫，` },
		{ elementID: 'talent-sub-1-1-1', field: 'sections.0.text', canonical: 'The target shifts up to a number of squares equal to your Reason score.', calculated: /The target shifts up to a number of squares equal to (-?\d+)\./, localized: '目標可以遁移最多等於你`理智`的格數。', replacement: (value: string) => `目標可以遁移最多 ${value} 格。` },
		{ elementID: 'talent-sub-2-1-1', field: 'sections.0.text', canonical: 'You slide the target up to a number of squares equal to your Reason score.', calculated: /You slide the target up to a number of squares equal to (-?\d+)\./, localized: '你將目標滑動最多等於你`理智`的格數。', replacement: (value: string) => `你將目標滑動最多 ${value} 格。` },
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

// Troubadour's two authored characteristic readings. AbilityLogic resolves the Presence count
// and the Speed in canonical English first; only that verified number is carried into the
// approved zh-TW, which keeps its 最多 ('up to') wording. Library keeps the raw approved text.
const projectTroubadourCalculatedValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const projections = [
		{ elementID: 'troubadour-11', field: 'sections.0.text', canonical: 'you can choose up to a number of targets equal to your Presence score.', calculated: /you can choose up to a number of targets equal to (-?\d+)\./, localized: '你可以選擇最多等於你`氣場`數量的目標。', replacement: (value: string) => `你可以選擇最多 ${value} 個目標。` },
		{ elementID: 'troubadour-62', field: 'sections.0.text', canonical: 'You shift up to your speed.', calculated: /You shift up to (-?\d+) squares\./, localized: '你遁移最多等於你速度的距離。', replacement: (value: string) => `你遁移最多 ${value} 格。` }
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
 * Flip the Script is the one approved reading whose condition cardinality is deliberately
 * asymmetric: canonical names 'slowed' twice, while the Owner-approved zh-TW names 緩速 once
 * and refers back to it as 該狀態. The shared projector requires one-to-one cardinality and
 * must stay that way, so this identity carries its own structural check instead: the whole
 * calculated reading has to be the canonical text with emphasis added around those two
 * occurrences and nothing else, and the approved reading has to hold exactly one 緩速.
 */
const projectTroubadourAsymmetricCondition = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	if ((elementID !== 'troubadour-65') || (field !== 'sections.0.text')) {
		return undefined;
	}

	const condition = /\bslowed\b/gi;
	if (matchAll(canonicalEnglish, condition).length !== 2) {
		return undefined;
	}
	if (calculatedEnglish !== canonicalEnglish.replace(condition, '**$&**')) {
		return undefined;
	}

	const localizedCondition = /緩速/g;
	if (matchAll(localizedRaw, localizedCondition).length !== 1) {
		return undefined;
	}

	return localizedRaw.replace(localizedCondition, '**$&**');
};

/**
 * The two Class Act completion readings whose canonical calculation resolves a level- or
 * Presence-derived reference in place. Scene Partner is a FeatureType.Text Feature, so it
 * arrives through the FeaturePanel auto-calc path; Blocking is an authored ability section.
 * The rest of each reading is left alone by the calculator, so only that one verified value
 * is carried into the Owner-approved zh-TW, and Library keeps the approved raw wording.
 */
const projectTroubadourCompletionCalculatedValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const projections = [
		{
			elementID: 'troubadour-8',
			field: 'description',
			canonical: 'You can have a number of bonds active equal to your level.',
			calculated: /You can have a number of bonds active equal to (-?\d+)\./,
			localized: '你可以同時維持的羈絆數量等於你的等級。',
			replacement: (value: string) => `你可以同時維持的羈絆數量為 ${value}。`
		},
		{
			elementID: 'troubadour-auteur-2',
			field: 'sections.0.text',
			canonical: 'you can choose up to a number of targets equal to your Presence score',
			calculated: /you can choose up to a number of targets equal to (-?\d+)/,
			localized: '你可以選擇數量最多等於你`氣場`的目標',
			replacement: (value: string) => `你可以選擇最多 ${value} 個目標`
		}
	];
	const projection = projections.find(candidate => (candidate.elementID === elementID) && (candidate.field === field));
	if (!projection) {
		return undefined;
	}

	const calculatedMatch = calculatedEnglish.match(projection.calculated);
	if (!calculatedMatch || !canonicalEnglish.includes(projection.canonical) || !localizedRaw.includes(projection.localized)) {
		return undefined;
	}

	const projectedCanonical = canonicalEnglish.replace(projection.canonical, calculatedMatch[0]);
	if (projectedCanonical !== calculatedEnglish) {
		return undefined;
	}

	return localizedRaw.replace(projection.localized, projection.replacement(calculatedMatch[1]));
};

/**
 * The two Kit signature readings whose canonical calculation resolves an authored
 * characteristic-score reference in place. The rest of each sentence is untouched by the
 * calculator, so only that verified value is carried into the Owner-approved zh-TW, and
 * Library keeps the approved unresolved raw wording.
 *
 * Mountain's Power Roll tiers are deliberately absent. There the calculator rewrites
 * '3 damage + M or A damage' into a single '6 damage', which merges two authored clauses;
 * that is a structural rewrite, not a resolved value, so it is left to fall back to
 * calculated English rather than restated in Chinese.
 */
const projectKitCharacteristicScoreValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const projections = [
		{
			elementID: 'kit-mountain-signature',
			field: 'sections.1.text',
			canonical: 'this strike deals additional damage equal to your Might or Agility score (your choice).',
			calculated: /this strike deals additional damage equal to (-?\d+) \(your choice\)\./,
			localized: '此次打擊會額外造成等於你`力量`或`敏捷`（由你選擇）的傷害。',
			replacement: (value: string) => `此次打擊會額外造成 ${value} 點傷害（由你選擇）。`
		},
		{
			elementID: 'kit-sniper-signature',
			field: 'sections.1.text',
			canonical: 'this strike deals extra damage equal to your Might or Agility score (your choice).',
			calculated: /this strike deals extra damage equal to (-?\d+) \(your choice\)\./,
			localized: '此打擊會額外造成等於你`力量`或`敏捷`的傷害（由你選擇）。',
			replacement: (value: string) => `此打擊會額外造成 ${value} 點傷害（由你選擇）。`
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

	return localizedRaw.replace(projection.localized, projection.replacement(calculatedMatch[1]));
};

/**
 * The three Core Domain Level 1-2 readings whose canonical calculation resolves an authored
 * Intuition expression in place. Everything else in each sentence is left alone by the
 * calculator, so only that one verified value is carried into the Owner-approved zh-TW, and
 * Library keeps the approved unresolved raw wording.
 *
 * The other Domain readings in this slice are deliberately absent: the calculator leaves them
 * as authored, so both surfaces already show the approved raw zh-TW without any projection.
 */
const projectCoreDomainIntuitionValue = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const projections = [
		{
			elementID: 'domain-creation-1-1',
			field: 'sections.0.text',
			canonical: 'You can maintain a number of objects created this way equal to your Intuition score.',
			calculated: /You can maintain a number of objects created this way equal to (-?\d+)\./,
			localized: '你可以同時維持的自創物體數量等於你的`直覺`。',
			replacement: (value: string) => `你可以同時維持的自創物體數量為 ${value}。`
		},
		{
			elementID: 'domain-death-2',
			field: 'sections.0.text',
			canonical: 'they regain Stamina equal to 5 + your Intuition score.',
			calculated: /they regain Stamina equal to (-?\d+)\./,
			localized: '目標會恢復等於 5 + 你`直覺`的體力。',
			replacement: (value: string) => `目標會恢復 ${value} 點體力。`
		},
		{
			elementID: 'domain-sun-2',
			field: 'sections.1.text',
			canonical: 'deals fire damage equal to your Intuition score with their next strike',
			calculated: /deals fire damage equal to (-?\d+) with their next strike/,
			localized: '會額外造成等於你`直覺`的火焰傷害。',
			replacement: (value: string) => `會額外造成 ${value} 點火焰傷害。`
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

	return localizedRaw.replace(projection.localized, projection.replacement(calculatedMatch[1]));
};

/**
 * The two Censor Level 2 Exorcist readings whose canonical prose spends `twice your Presence
 * score` inline. The shared `authorizedRewrites` table above cannot carry them: its Presence
 * entries are bound to different surrounding canonical phrasing, and `It Is Justice You Fear`
 * additionally reads the condition twice in Chinese while AbilityLogic emphasises it only once
 * in English, which makes the shared condition-emphasis projector fail closed on a count
 * mismatch. Both are therefore projected here, bound to their exact approved identities.
 *
 * Each part is applied only when the calculated English actually shows it, because these two
 * fields differ in what the calculator does to them. `It Is Justice You Fear` gains its
 * condition emphasis with or without a Hero but resolves the damage value only in Hero context,
 * so its Library reading keeps the approved raw `等於你`氣場` ×2` wording and adds nothing but
 * the emphasis. `Revelator` has no condition at all and changes only in Hero context.
 *
 * The final identity check is the fail-closed gate the rest of this module uses: the projection
 * is returned only when the authorized rewrites, replayed onto the raw canonical English,
 * reproduce the calculator's output exactly. Anything else - a new sentence, a second value, a
 * changed phrase - leaves the canonical projection different and falls back to calculated
 * English rather than guessing at Chinese.
 */
const projectCensorLevel2PresenceDamage = (elementID: string, field: string, canonicalEnglish: string, calculatedEnglish: string, localizedRaw: string) => {
	const projections = [
		{
			elementID: 'censor-sub-1-2-3a',
			field: 'sections.1.text',
			// AbilityLogic emphasises the condition state, not the later verb 'frighten', so only
			// the matching first Chinese reading is emphasised.
			emphasis: {
				canonical: 'is already frightened of',
				calculated: 'is already **frightened** of',
				localized: '已經對你或其他生物陷入畏縮',
				localizedReplacement: '已經對你或其他生物陷入**畏縮**'
			},
			canonical: 'they instead take psychic damage equal to twice your Presence score.',
			calculated: /they instead take psychic damage equal to (-?\d+)\./,
			localized: '則目標改為受到等於你`氣場` ×2 的心靈傷害。',
			replacement: (value: string) => `則目標改為受到 ${value} 點心靈傷害。`
		},
		{
			elementID: 'censor-sub-1-2-3b',
			field: 'sections.0.text',
			emphasis: undefined,
			canonical: 'Each target takes holy damage equal to twice your Presence score.',
			calculated: /Each target takes holy damage equal to (-?\d+)\./,
			localized: '每個目標都會受到等於你`氣場` ×2 的神聖傷害。',
			replacement: (value: string) => `每個目標都會受到 ${value} 點神聖傷害。`
		}
	];

	const projection = projections.find(candidate => (candidate.elementID === elementID) && (candidate.field === field));
	if (!projection) {
		return undefined;
	}

	let projectedCanonical = canonicalEnglish;
	let projectedLocalized = localizedRaw;

	const emphasis = projection.emphasis;
	if (emphasis && calculatedEnglish.includes(emphasis.calculated)) {
		if (!projectedCanonical.includes(emphasis.canonical) || !projectedLocalized.includes(emphasis.localized)) {
			return undefined;
		}
		projectedCanonical = projectedCanonical.replace(emphasis.canonical, emphasis.calculated);
		projectedLocalized = projectedLocalized.replace(emphasis.localized, emphasis.localizedReplacement);
	}

	const calculatedMatch = calculatedEnglish.match(projection.calculated);
	if (calculatedMatch) {
		if (!projectedCanonical.includes(projection.canonical) || !projectedLocalized.includes(projection.localized)) {
			return undefined;
		}
		projectedCanonical = projectedCanonical.replace(projection.canonical, () => calculatedMatch[0]);
		projectedLocalized = projectedLocalized.replace(projection.localized, () => projection.replacement(calculatedMatch[1]));
	}

	return projectedCanonical === calculatedEnglish ? projectedLocalized : undefined;
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

	const furySubclassCalculatedValue = projectFurySubclassCalculatedValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (furySubclassCalculatedValue) {
		return furySubclassCalculatedValue;
	}

	const stormwightKitCalculatedValue = projectStormwightKitCalculatedValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (stormwightKitCalculatedValue) {
		return stormwightKitCalculatedValue;
	}

	const conduitIntuitionValue = projectConduitIntuitionValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (conduitIntuitionValue) {
		return conduitIntuitionValue;
	}

	const elementalistReasonValue = projectElementalistReasonValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (elementalistReasonValue) {
		return elementalistReasonValue;
	}

	const elementalistLevel2FeatureValue = projectElementalistLevel2FeatureValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (elementalistLevel2FeatureValue) {
		return elementalistLevel2FeatureValue;
	}

	const nullCalculatedValue = projectNullCalculatedValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (nullCalculatedValue) {
		return nullCalculatedValue;
	}

	const nullTraditionMasteryBonus = projectNullTraditionMasteryBonus(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (nullTraditionMasteryBonus) {
		return nullTraditionMasteryBonus;
	}

	const shadowSpeedValue = projectShadowSpeedValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (shadowSpeedValue) {
		return shadowSpeedValue;
	}

	const shadowAgilityValue = projectShadowAgilityValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (shadowAgilityValue) {
		return shadowAgilityValue;
	}

	const tacticianReasonValue = projectTacticianReasonValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (tacticianReasonValue) {
		return tacticianReasonValue;
	}

	const talentCharacteristicValue = projectTalentCharacteristicValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (talentCharacteristicValue) {
		return talentCharacteristicValue;
	}

	const troubadourCalculatedValue = projectTroubadourCalculatedValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (troubadourCalculatedValue) {
		return troubadourCalculatedValue;
	}

	const troubadourAsymmetricCondition = projectTroubadourAsymmetricCondition(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (troubadourAsymmetricCondition) {
		return troubadourAsymmetricCondition;
	}

	const troubadourCompletionCalculatedValue = projectTroubadourCompletionCalculatedValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (troubadourCompletionCalculatedValue) {
		return troubadourCompletionCalculatedValue;
	}

	const kitCharacteristicScoreValue = projectKitCharacteristicScoreValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (kitCharacteristicScoreValue) {
		return kitCharacteristicScoreValue;
	}

	const coreDomainIntuitionValue = projectCoreDomainIntuitionValue(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (coreDomainIntuitionValue) {
		return coreDomainIntuitionValue;
	}

	const censorLevel2PresenceDamage = projectCensorLevel2PresenceDamage(elementID, field, canonicalEnglish, calculatedEnglish, localizedRaw);
	if (censorLevel2PresenceDamage) {
		return censorLevel2PresenceDamage;
	}

	return projectAuthorizedValues(canonicalEnglish, calculatedEnglish, localizedRaw) ?? calculatedEnglish;
};
