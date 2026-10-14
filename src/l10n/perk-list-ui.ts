import { Language } from '@/l10n/language';
import { PerkList } from '@/enums/perk-list';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';
import { mapping } from '@/l10n/mapping';
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

const officialPerk = (id: string, sourcebooks: Sourcebook[]) => {
	return sourcebooks
		.filter(sourcebook => sourcebook.type === SourcebookType.Official)
		.flatMap(sourcebook => sourcebook.perks)
		.find(perk => perk.id === id);
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
