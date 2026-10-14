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

/** The perk measure word, the character after "1 " in the approved "Choose a perk." prompt. */
const perkMeasureWord = () => {
	const prompt = translate('ui:ui.hero-builder.choose-a-perk.38f11151', 'Choose a perk.');
	return prompt.match(/1 (\p{Script=Han})/u)?.[1] ?? '';
};

/**
 * The list conjunction. The approved Small! description places it inside fullwidth
 * parentheses. A missing catalog keeps the English word so this file stores no Han text.
 */
const perkListConjunction = () => {
	const sentence = translate(
		'element:polder-feature-2:description',
		'Your diminutive stature lets you easily get out of — or into — trouble.'
	);
	return sentence.match(/\uFF08(\p{Script=Han})/u)?.[1] ?? ' or ';
};

const joinPerkCategories = (categories: string[], language: Language) => {
	if (categories.length === 0) {
		return '';
	}
	if (language === 'zh-TW') {
		const conjunction = perkListConjunction();
		if (categories.length === 1) {
			return categories[0];
		}
		if (categories.length === 2) {
			return categories.join(conjunction);
		}
		return `${categories.slice(0, -1).join('\u3001')}${conjunction}${categories[categories.length - 1]}`;
	}
	if (categories.length <= 2) {
		return categories.join(' or ');
	}
	return `${categories.slice(0, -2).join(', ')}, ${categories.slice(-2).join(' or ')}`;
};

/** Classic-sheet count line. Chinese inserts the perk measure word and leaves Perk in English. */
export const perkCountCategoryLine = (count: number, categories: string[], language: Language) => {
	const label = joinPerkCategories(categories, language);
	if (language === 'zh-TW') {
		const measure = perkMeasureWord();
		const counted = measure ? `${count} ${measure}` : `${count}`;
		return label ? `${counted}${label} Perk` : `${counted} Perk`;
	}
	const word = count === 1 ? 'Perk' : 'Perks';
	return label ? `${count} ${label} ${word}` : `${count} ${word}`;
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
