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
