import { Language } from '@/l10n/language';
import { PerkList } from '@/enums/perk-list';
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
