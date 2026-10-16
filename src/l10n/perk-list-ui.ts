import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Language } from '@/l10n/language';
import { LanguageType } from '@/enums/language-type';
import { PerkList } from '@/enums/perk-list';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';
import { applyUITemplate } from '@/l10n/ui-text';
import { getChoiceDisplaySource } from '@/l10n/official-feature-source';
import { mapping } from '@/l10n/mapping';
import { skillListKey } from '@/l10n/skill-text';
import { translate } from '@/l10n/text';
import { useUI } from '@/l10n/ui-text';

export const perkListText = (list: PerkList, ui: ReturnType<typeof useUI>) => {
	switch (list) {
		case PerkList.Crafting:
		case PerkList.Exploration:
		case PerkList.Interpersonal:
		case PerkList.Intrigue:
		case PerkList.Lore: return translate(`enum:PerkList:${list}`, list);
		case PerkList.Supernatural: return ui.text('ui.hero-builder.supernatural.fe29726a', 'Supernatural');
		case PerkList.Special: return ui.text('ui.hero-builder.special.997c544f', 'Special');
	}
};

const PERK_COUNT_LIST = 'ui.hero-builder.perk-count-list.9eaae349';
const PERK_COUNT = 'ui.hero-builder.perk-count.e5bc2580';
const LIST_OR = 'ui.hero-builder.list-or.7382d0ab';
const PERK_COUNT_LIST_SOURCE = '`${count} ${list} Perk`';
const PERK_COUNT_SOURCE = '`${count} Perk`';
const LIST_OR_SOURCE = '`${items} or ${last}`';

const knownPerkLists = new Set<string>(Object.values(PerkList));

/** The English count line. One perk stays singular; every other count uses Perks. */
const englishPerkCountLine = (count: number, categories: readonly string[]) => {
	const label = categories.length === 0
		? ''
		: categories.length <= 2
			? categories.join(' or ')
			: `${categories.slice(0, -2).join(', ')}, ${categories.slice(-2).join(' or ')}`;
	const word = count === 1 ? 'Perk' : 'Perks';
	return label ? `${count} ${label} ${word}` : `${count} ${word}`;
};

/** An approved category name. An unknown or still-English category stays unresolved. */
const approvedPerkCategory = (category: string) => {
	if (!knownPerkLists.has(category)) {
		return undefined;
	}
	const [ key, english ] = category === PerkList.Supernatural
		? [ 'ui:ui.hero-builder.supernatural.fe29726a', 'Supernatural' ]
		: category === PerkList.Special
			? [ 'ui:ui.hero-builder.special.997c544f', 'Special' ]
			: [ `enum:PerkList:${category}`, category ];
	const translated = translate(key, english);
	return translated === english ? undefined : translated;
};

/**
 * Classic-sheet perk count. Count and category order come from the caller.
 * Chinese uses only the templates that case needs. A missing template, a wrong
 * placeholder, or any untranslated or unknown category keeps the whole English line.
 */
export const perkCountCategoryLine = (count: number, categories: readonly string[], language: Language) => {
	const english = englishPerkCountLine(count, categories);
	if (language !== 'zh-TW') {
		return english;
	}
	const translated: string[] = [];
	for (const category of categories) {
		const name = approvedPerkCategory(category);
		if (!name) {
			return english;
		}
		translated.push(name);
	}
	if (translated.length === 0) {
		return applyUITemplate(
			translate(`ui:${PERK_COUNT}`, PERK_COUNT_SOURCE),
			PERK_COUNT_SOURCE,
			english,
			{ count }
		);
	}
	let list = translated[0];
	if (translated.length > 1) {
		const joined = applyUITemplate(
			translate(`ui:${LIST_OR}`, LIST_OR_SOURCE),
			LIST_OR_SOURCE,
			english,
			{ items: translated.slice(0, -1).join('\u3001'), last: translated[translated.length - 1] }
		);
		if (joined === english) {
			return english;
		}
		list = joined;
	}
	return applyUITemplate(
		translate(`ui:${PERK_COUNT_LIST}`, PERK_COUNT_LIST_SOURCE),
		PERK_COUNT_LIST_SOURCE,
		english,
		{ count, list }
	);
};

const featuresWithin = (feature: Feature): Feature[] => {
	if (feature.type !== FeatureType.Multiple || !feature.data) {
		return [];
	}
	return feature.data.features.flatMap(child => [ child, ...featuresWithin(child) ]);
};

const officialPerks = (sourcebooks: Sourcebook[]) => {
	return sourcebooks
		.filter(sourcebook => sourcebook.type === SourcebookType.Official)
		.flatMap(sourcebook => sourcebook.perks);
};

const officialPerk = (id: string, sourcebooks: Sourcebook[]) => {
	const perks = officialPerks(sourcebooks);
	return perks.find(perk => perk.id === id)
		?? perks.flatMap(featuresWithin).find(feature => feature.id === id);
};

const standardLanguageTypes = [ LanguageType.Common, LanguageType.Regional, LanguageType.Cultural, LanguageType.Dead ];

/**
 * An official language-choice label whose English is still the factory sentence.
 * The approved UI row supplies the Chinese. A rewritten label stays English.
 */
export const officialLanguageChoiceDisplay = (feature: Feature, sourcebooks: Sourcebook[]) => {
	const source = getChoiceDisplaySource(feature, sourcebooks);
	if (!source || source.type !== FeatureType.LanguageChoice || feature.type !== FeatureType.LanguageChoice) {
		return {};
	}
	const shown: { name?: string, description?: string } = {};
	if (feature.name === source.name && (feature.name === 'Languages' || feature.name === 'Language')) {
		const id = feature.name === 'Languages'
			? 'ui.hero-builder.languages.318655ce'
			: 'ui.hero-builder.language.996aaf3b';
		const translated = translate(`ui:${id}`, feature.name);
		if (translated !== feature.name) {
			shown.name = translated;
		}
	}
	const { count, allowedTypes } = source.data;
	const unrestricted = allowedTypes.length === standardLanguageTypes.length
		&& standardLanguageTypes.every((type, index) => allowedTypes[index] === type);
	if (feature.description === source.description && unrestricted && count === 2 && feature.description === 'Choose 2  languages.') {
		const translated = translate('ui:ui.hero-builder.two-languages-description.0139e42b', feature.description);
		if (translated !== feature.description) {
			shown.description = translated;
		}
	}
	return shown;
};

/**
 * A perk sub-feature that repeats its perk's English name uses that perk's approved name.
 * Its own mapped name wins. Two perks with the same name stay English.
 */
export const reusedOfficialPerkName = (feature: { id: string, name: string }, sourcebooks: Sourcebook[]) => {
	if (!feature.id.startsWith('perk-') || !feature.name || mapping[`element:${feature.id}:name`]) {
		return undefined;
	}
	const matches = officialPerks(sourcebooks)
		.filter(perk => perk.id !== feature.id && perk.name === feature.name && mapping[`element:${perk.id}:name`]);
	if (matches.length !== 1) {
		return undefined;
	}
	const translated = translate(`element:${matches[0].id}:name`, feature.name);
	return translated === feature.name ? undefined : translated;
};

/**
 * Classic-sheet skill count for a perk. Chinese uses the approved skill-list template.
 * A missing group translation keeps the English line.
 */
export const perkSkillCountLine = (count: number, lists: string[], language: Language) => {
	if (language !== 'zh-TW' || lists.length === 0) {
		return undefined;
	}
	const translated = lists.map(list => translate(skillListKey(list), list));
	if (translated.some((name, index) => name === lists[index])) {
		return undefined;
	}
	const list = translated.join(' / ');
	const english = `${list} skills`;
	const grouped = applyUITemplate(
		translate('ui:ui.hero-builder.skill-list-description.f94c20ab', '`${list} skills`'),
		'`${list} skills`',
		english,
		{ list }
	);
	if (grouped === english) {
		return undefined;
	}
	return `${count} ${grouped}`;
};

/**
 * Description key for an official perk whose rules text is still the sourcebook text.
 * A rewrite, a missing catalog row, or a perk outside the official books stays untranslated.
 */
export const officialPerkDescriptionKey = (
	feature: { id: string, description: string },
	sourcebooks: Sourcebook[]
) => {
	const canonical = officialPerk(feature.id, sourcebooks);
	if (!canonical || canonical.description !== feature.description) {
		return undefined;
	}
	const key = `element:${feature.id}:description`;
	return mapping[key] ? key : undefined;
};

/** An official perk exists and its description is no longer the sourcebook text. */
export const perkDescriptionRewritten = (
	feature: { id: string, description: string },
	sourcebooks: Sourcebook[]
) => {
	const canonical = officialPerk(feature.id, sourcebooks);
	return !!canonical && canonical.description !== feature.description;
};
