import { Ability } from '@/models/ability';
import { AbilityLogic } from '@/logic/ability-logic';
import { FormatLogic } from '@/logic/format-logic';
import { Catalog, SheetEntry, peekCatalog } from '@/l10n/catalog';
import { mapping } from '@/l10n/mapping';
import { standardKits } from '@/l10n/kit-text';
import { FeatureType } from '@/enums/feature-type';
import { ConditionType } from '@/enums/condition-type';
import { getLanguage } from '@/l10n/language';

export interface KitAbilityDetails {
	keywords: (string | undefined)[];
	actionType?: string;
	distance?: string;
	target?: string;
	rollHeader: string;
	localizedCharacteristicText: string;
	tiers: [ string | undefined, string | undefined, string | undefined ];
	canonical: {
		metadata: string;
		metadataParts: [ string, string, string, string ];
		rollHeader: string;
		tiers: [ string, string, string ];
	};
}

const abilities = new Map<string, Ability>();
standardKits.forEach(kit => kit.features.forEach(feature => {
	if (feature.type === FeatureType.Ability) {
		abilities.set(feature.data.ability.id, feature.data.ability);
	}
}));

const stripPrefix = (line: string, prefix: RegExp): string | undefined => {
	const match = prefix.exec(line);
	return match?.[1];
};

const joinCommasOr = (values: string[]) => values.length <= 2
	? values.join(' or ')
	: `${values.slice(0, -1).join(', ')}, or ${values[values.length - 1]}`;

const splitCharacteristics = (value: string) => value.replace(/,\s*or\s+/g, ', ').split(/,\s*|\s+or\s+/).map(part => part.trim());

const normalizeTierSource = (value: string) => value.toLowerCase()
	.replace(/\d+/g, '#')
	.replace(/# damage \+/g, '# +')
	.replace(/\bcan\s+(?=(?:shift|swap)\b)/g, '')
	.replace(/\[(weak|average|avg|strong)\]/g, '$1')
	.replace(/\bweak\b/g, 'w')
	.replace(/\b(?:average|avg)\b/g, 'v')
	.replace(/\bstrong\b/g, 's')
	.replace(/[,\s]+/g, ' ')
	.trim();

const sameExceptNumbers = (left: string, right: string) => normalizeTierSource(left) === normalizeTierSource(right);

const projectNumbers = (source: string, translatedSource: string, target: string): string | undefined => {
	const sourceNumbers = source.match(/\d+/g) ?? [];
	const translatedNumbers = translatedSource.match(/\d+/g) ?? [];
	const targetNumbers = target.match(/\d+/g) ?? [];
	if (sourceNumbers.length !== translatedNumbers.length || targetNumbers.length !== translatedNumbers.length) {
		return undefined;
	}
	let index = 0;
	return target.replace(/\d+/g, () => sourceNumbers[index++]);
};

const parseDetails = (id: string, row: SheetEntry): KitAbilityDetails | undefined => {
	const ability = abilities.get(id);
	const rollSection = ability?.sections.find(section => section.type === 'roll');
	if (!ability || !rollSection || rollSection.type !== 'roll') {
		return undefined;
	}
	const en = row.en.split('\n').filter(line => line.trim().length > 0);
	const zh = row.zh.split('\n').filter(line => line.trim().length > 0);
	const metadataIndex = en.findIndex(line => line.includes(' • '));
	const rollIndex = en.findIndex(line => line.startsWith('Power Roll + '));
	if (metadataIndex < 0 || rollIndex < 0 || zh.length <= rollIndex) {
		return undefined;
	}
	const sourceMetadataParts = en[metadataIndex].split(' • ');
	const targetMetadataParts = zh[metadataIndex]?.split('／');
	const bookSourceTiers = [ 1, 2, 3 ].map(tier => stripPrefix(en[rollIndex + tier] ?? '', new RegExp(`^Tier ${tier}:\\s*(.*)$`)));
	const targetTiers = [ 1, 2, 3 ].map((_, index) => stripPrefix(zh[rollIndex + index + 1] ?? '', /^[①②③]\s*(.*)$/));
	const distance = ability.distance.map(item => AbilityLogic.getDistance(item, ability, undefined)).join(' or ');
	const metadata = [
		ability.keywords.join(', '),
		FormatLogic.getAbilityType(ability.type),
		distance,
		ability.target
	].join(' • ');
	const powerRollHeader = `Power Roll + ${joinCommasOr(rollSection.roll.characteristic)}:`;
	const bookCharacteristics = splitCharacteristics(/^Power Roll \+ (.*):$/.exec(en[rollIndex])?.[1] ?? '');
	const actualMetadataParts = metadata.split(' • ');
	const sourceKeywords = sourceMetadataParts[0]?.split(', ') ?? [];
	const targetKeywords = targetMetadataParts?.[0]?.split('、') ?? [];
	const keywords = ability.keywords.map((keyword, index) => sourceKeywords[index] === keyword ? targetKeywords[index] : undefined);
	const actionType = sourceMetadataParts[1]?.toLowerCase() === actualMetadataParts[1]?.toLowerCase() ? targetMetadataParts?.[1] : undefined;
	const distanceZh = sameExceptNumbers(sourceMetadataParts[2] ?? '', actualMetadataParts[2] ?? '')
		? projectNumbers(actualMetadataParts[2], sourceMetadataParts[2], targetMetadataParts?.[2] ?? '')
		: undefined;
	const target = sourceMetadataParts[3] === actualMetadataParts[3] ? targetMetadataParts?.[3] : undefined;
	const sourceTiers = [ rollSection.roll.tier1, rollSection.roll.tier2, rollSection.roll.tier3 ];
	const tiers = sourceTiers.map((siteTier, index) => {
		const bookTier = bookSourceTiers[index];
		const translatedTier = targetTiers[index];
		if (bookTier === undefined || translatedTier === undefined || !sameExceptNumbers(siteTier, bookTier)) {
			return undefined;
		}
		return projectNumbers(siteTier, bookTier, translatedTier);
	});
	if (sourceMetadataParts.length !== 4 || targetMetadataParts?.length !== 4
		|| bookCharacteristics.length !== rollSection.roll.characteristic.length
		|| !bookCharacteristics.every((value, index) => value === rollSection.roll.characteristic[index])
		|| targetTiers.some(tier => tier === undefined)
		|| !zh[rollIndex].includes(' + ')) {
		return undefined;
	}
	const translatedRollHeader = zh[rollIndex].replace(/：$/, '');
	const localizedCharacteristicText = translatedRollHeader.split(' + ')[1];
	return {
		keywords,
		actionType,
		distance: distanceZh,
		target,
		rollHeader: translatedRollHeader,
		localizedCharacteristicText,
		tiers: tiers as [ string | undefined, string | undefined, string | undefined ],
		canonical: {
			metadata,
			metadataParts: actualMetadataParts as [ string, string, string, string ],
			rollHeader: powerRollHeader,
			tiers: sourceTiers as [ string, string, string ]
		}
	};
};

const getDetailForId = (id: string, catalog: Catalog | null): KitAbilityDetails | undefined => {
	if (!catalog) {
		return undefined;
	}
	const key = `element:${id}:description`;
	const sheetId = mapping[key]?.sheetId;
	const row = sheetId ? catalog[sheetId] : undefined;
	return row ? parseDetails(id, row) : undefined;
};

/** Approved Book Master fields, guarded against any change to the canonical ability data. */
export const kitAbilityDetails = (ability: { id: string, name?: string }): KitAbilityDetails | undefined => {
	if (getLanguage() !== 'zh-TW') {
		return undefined;
	}
	const canonical = abilities.get(ability.id);
	if (!canonical || (ability.name !== undefined && ability.name !== canonical.name
		&& ability.name.toLocaleLowerCase('en-US') !== canonical.name.toLocaleLowerCase('en-US'))) {
		return undefined;
	}
	return getDetailForId(ability.id, peekCatalog());
};

const plain = (value: string) => value.replace(/\*\*|`/g, '').trim();

const computedDamageValue = (value: string, source: string): string | undefined => {
	const computed = /^((?:\d+d\d+(?:\s*\+\s*\d+)?|\d+))\s+(?:(?:fire|lightning|holy)\s+)?damage$/i.exec(plain(value));
	if (!computed || !/\bdamage$/i.test(source)) {
		return undefined;
	}
	return computed[1];
};

const translatedPotencyEffect = (source: string, computed: string, zh: string): string | undefined => {
	const sourceMatch = /^([MARIP])\s*<\s*\[?(weak|average|avg|strong|w|v|s)\]?(.*)$/i.exec(plain(source));
	const computedMatch = /^([MARIP])\s*<\s*(\d+)(.*)$/i.exec(plain(computed));
	if (!sourceMatch || !computedMatch || sourceMatch[1].toUpperCase() !== computedMatch[1].toUpperCase()
		|| sourceMatch[3].replace(/[\s,]+/g, '').toLowerCase() !== computedMatch[3].replace(/[\s,]+/g, '').toLowerCase()) {
		return undefined;
	}
	const zhMatch = /^(.+?)\s*<\s*(\p{Script=Han}+)([\p{P}\s].*)$/u.exec(zh);
	if (!zhMatch) {
		return undefined;
	}
	return `${zhMatch[1]} < ${computedMatch[2]}${zhMatch[3]}`;
};

const translatedMovementEffect = (source: string, computed: string, zh: string): string | undefined => {
	const movement = /\b(vertical pull|push|pushed|pushes|slide|slid|slides|pull|pulled|pulls|shift)\s+(\d+)/gi;
	const sourceMatches = [ ...source.matchAll(movement) ];
	const computedMatches = [ ...plain(computed).matchAll(movement) ];
	if (sourceMatches.length === 0 || sourceMatches.length !== computedMatches.length) {
		return undefined;
	}
	const normalize = (value: string) => plain(value).replace(/\bcan\s+(?=shift\b)/gi, '').replace(movement, '$1 #').toLowerCase();
	if (normalize(source) !== normalize(computed)) {
		return undefined;
	}
	const zhNumbers = zh.match(/\d+/g) ?? [];
	if (zhNumbers.length !== sourceMatches.length) {
		return undefined;
	}
	let index = 0;
	return zh.replace(/\d+/g, () => computedMatches[index++][2]);
};

const sourceDamageSuffix = (zh: string, characteristicText: string) => {
	const characteristicIndex = characteristicText ? zh.lastIndexOf(characteristicText) : -1;
	if (characteristicIndex >= 0) {
		return zh.slice(characteristicIndex + characteristicText.length);
	}
	return /\p{Script=Han}+$/u.exec(zh)?.[0] ?? '';
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const conditionPairs = (catalog: Catalog) => Object.entries(ConditionType)
	.filter(([ key ]) => key !== 'Custom' && key !== 'Quick')
	.flatMap(([ key, english ]) => {
		const sheetId = mapping[`enum:ConditionType:${key}`]?.sheetId;
		const translated = sheetId ? catalog[sheetId]?.zh : undefined;
		return translated ? [ { english, translated } ] : [];
	});

const projectTierFormatting = (computed: string, translated: string, catalog: Catalog): string | undefined => {
	let result = translated;
	const codePotencies = [ ...computed.matchAll(/`([MARIP])\s*<\s*\d+`/gi) ];
	for (let i = 0; i < codePotencies.length; i++) {
		const potency = /\p{Script=Han}+\s*<\s*(?:\d+|\p{Script=Han}+)/u.exec(result);
		if (!potency) {
			return undefined;
		}
		result = result.replace(potency[0], `\`${potency[0]}\``);
	}

	const strongTokens = [ ...computed.matchAll(/\*\*(.+?)\*\*/g) ].map(match => plain(match[1]).toLocaleLowerCase('en-US'));
	const conditions = conditionPairs(catalog);
	for (const token of strongTokens) {
		const condition = conditions.find(item => item.english.toLocaleLowerCase('en-US') === token);
		if (!condition) {
			return undefined;
		}
		const unformatted = new RegExp(`(?<!\\*)${escapeRegExp(condition.translated)}(?!\\*)`, 'u');
		if (!unformatted.test(result)) {
			return undefined;
		}
		result = result.replace(unformatted, `**${condition.translated}**`);
	}
	return result;
};

const translateTierSegment = (source: string, computed: string, zh: string, characteristicText: string): string | undefined => {
	if (plain(source).toLowerCase() === plain(computed).toLowerCase()) {
		return zh;
	}
	const damage = computedDamageValue(computed, source);
	if (damage) {
		const suffix = sourceDamageSuffix(zh, characteristicText);
		return suffix ? `${damage} ${suffix}` : undefined;
	}
	const potency = translatedPotencyEffect(source, computed, zh);
	if (potency) {
		return potency;
	}
	return translatedMovementEffect(source, computed, zh);
};

/** Projects only upstream-computed damage, potency, or forced-movement numbers into an approved tier. */
export const kitAbilityTier = (ability: { id: string, name?: string }, tier: number, computed: string): string => {
	const details = kitAbilityDetails(ability);
	if (!details || tier < 1 || tier > 3) {
		return computed;
	}
	const source = details.canonical.tiers[tier - 1];
	const translated = details.tiers[tier - 1];
	if (!translated) {
		return computed;
	}
	const sourceParts = source.split(/;\s*/);
	const computedParts = computed.split(/;\s*/);
	const translatedParts = translated.split('；');
	if (sourceParts.length !== computedParts.length || sourceParts.length !== translatedParts.length) {
		return computed;
	}
	const result = sourceParts.map((part, index) => translateTierSegment(part, computedParts[index], translatedParts[index], details.localizedCharacteristicText));
	if (result.some(part => part === undefined)) {
		return computed;
	}
	const catalog = peekCatalog();
	if (!catalog) {
		return computed;
	}
	const formatted = result.map((part, index) => projectTierFormatting(computedParts[index], part!, catalog));
	return formatted.some(part => part === undefined) ? computed : formatted.join('；');
};

/** True only when the supplied source line is the canonical roll header. */
export const kitAbilityRollHeader = (ability: { id: string, name?: string }, source: string): string | undefined => {
	const details = kitAbilityDetails(ability);
	if (!details) {
		return undefined;
	}
	const shownCharacteristics = /^Power Roll \+ (.*)$/.exec(source.replace(/:$/, ''))?.[1].split(/\s+or\s+/);
	const canonicalCharacteristics = splitCharacteristics(/^Power Roll \+ (.*)$/.exec(details.canonical.rollHeader.replace(/:$/, ''))?.[1] ?? '');
	return shownCharacteristics && canonicalCharacteristics
		&& shownCharacteristics.length === canonicalCharacteristics.length
		&& shownCharacteristics.every((value, index) => value === canonicalCharacteristics[index])
		? details.rollHeader
		: undefined;
};

/** Classic View uses characteristic initials in the same upstream roll block. */
export const kitAbilityClassicRollHeader = (ability: { id: string, name?: string }, rollPower: string): string | undefined => {
	const details = kitAbilityDetails(ability);
	if (!details) {
		return undefined;
	}
	if (/^\d+$/.test(rollPower)) {
		return `${details.rollHeader.split(' + ')[0]} + ${rollPower}`;
	}
	const source = /^Power Roll \+ (.*)$/.exec(details.canonical.rollHeader.replace(/:$/, ''))?.[1];
	if (!source) {
		return undefined;
	}
	const shortNames: Record<string, string> = { Might: 'M', Agility: 'A', Reason: 'R', Intuition: 'I', Presence: 'P' };
	const initials = splitCharacteristics(source).map(name => shortNames[name]);
	const shown = splitCharacteristics(rollPower);
	return initials.length > 0 && initials.every((value, index) => value && value === shown[index]) && initials.length === shown.length
		? details.rollHeader
		: undefined;
};

/** Translate one metadata value only when it still equals its approved source field. */
export const kitAbilityMetadataValue = (ability: { id: string, name?: string }, field: 'keywords' | 'actionType' | 'distance' | 'target', source: string, index?: number): string | undefined => {
	const details = kitAbilityDetails(ability);
	if (!details) {
		return undefined;
	}
	const partIndex = field === 'keywords' ? 0 : field === 'actionType' ? 1 : field === 'distance' ? 2 : 3;
	const canonical = details.canonical.metadataParts[partIndex];
	if (field === 'distance' && sameExceptNumbers(canonical.replace(/,\s*/g, ' or '), source.replace(/,\s*/g, ' or '))) {
		return projectNumbers(source, canonical, details.distance ?? '');
	}
	if (field === 'keywords' && index !== undefined) {
		const sourceKeywords = canonical.split(', ');
		return sourceKeywords[index] === source ? details.keywords[index] : undefined;
	}
	if (field === 'keywords') {
		return canonical === source ? details.keywords.join('、') : undefined;
	}
	if (canonical !== source) {
		return undefined;
	}
	switch (field) {
		case 'actionType': return details.actionType;
		case 'distance': return details.distance;
		case 'target': return details.target;
	}
};
