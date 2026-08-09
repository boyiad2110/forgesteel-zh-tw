import { AbilityType } from '@/models/ability';
import { AbilityUsage } from '@/enums/ability-usage';
import { AppLocale } from '@/localization/locale';
import { FormatLogic } from '@/logic/format-logic';
import { localizeUIString } from '@/localization/resolver';

// How an ability's action type reads to a player, at the ability info panel's presentation
// boundary only. FormatLogic.getAbilityType stays the canonical, general-purpose format, and
// is what every locale that has nothing approved to show falls back to. The type itself —
// its usage, order, qualifiers and free flag — is only read here, never rewritten.

// Only these usages have an approved player-facing zh-TW reading. Every other usage — a
// villain action, a champion action, an ability whose type is its own time — is shown as the
// whole canonical English rather than part-translated.
const approvedUsageKeys: Partial<Record<AbilityUsage, string>> = {
	[AbilityUsage.MainAction]: 'ability-info.usage.main-action',
	[AbilityUsage.Maneuver]: 'ability-info.usage.maneuver',
	[AbilityUsage.Move]: 'ability-info.usage.move-action',
	[AbilityUsage.NoAction]: 'ability-info.usage.no-action',
	[AbilityUsage.Trigger]: 'ability-info.usage.triggered-action',
	[AbilityUsage.FreeStrike]: 'ability-info.usage.free-strike'
};

export const getAbilityTypeDisplay = (locale: AppLocale, type: AbilityType) => {
	const canonical = FormatLogic.getAbilityType(type);

	const usageKey = approvedUsageKeys[type.usage];
	if (!usageKey) {
		return canonical;
	}

	// In English, and for any usage whose entry is missing, unapproved or stale, this is the
	// canonical usage value again, and the whole canonical format is what reaches the screen.
	const usage = localizeUIString(locale, usageKey, type.usage);
	if (usage === type.usage) {
		return canonical;
	}

	// A free strike is already the whole term; it is never read as a free version of one.
	let prefix = '';
	if (type.free && (type.usage !== AbilityUsage.FreeStrike)) {
		prefix = localizeUIString(locale, 'ability-info.action-type.free', 'Free');
		if (prefix === 'Free') {
			return canonical;
		}
	}

	// The order and the qualifiers are canonical supplementary data, and keep the spacing and
	// the parentheses the canonical format gives them.
	const qualifiers = (type.qualifiers ?? []).map(q => `(${q})`);

	return [ `${prefix}${usage}`, type.order, ...qualifiers ]
		.filter(x => x)
		.join(' ');
};
