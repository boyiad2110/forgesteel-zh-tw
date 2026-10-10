import { Catalog, getCatalogTick, loadCatalog, peekCatalog, subscribeToCatalog } from '@/l10n/catalog';
import { getLanguage, subscribeToLanguage } from '@/l10n/language';
import { Skill } from '@/models/skill';
import { SkillList } from '@/enums/skill-list';
import { translate } from '@/l10n/text';
import { useL10nText } from '@/l10n/hooks';
import { useSyncExternalStore } from 'react';

const skillRules: Partial<Record<SkillList, string>> = {
	[ SkillList.Crafting ]: 'heroes.skills.crafting.rules',
	[ SkillList.Exploration ]: 'heroes.skills.exploration.rules',
	[ SkillList.Interpersonal ]: 'heroes.skills.interpersonal.rules',
	[ SkillList.Intrigue ]: 'heroes.skills.intrigue.rules',
	[ SkillList.Lore ]: 'heroes.skills.lore.rules'
};

/** Reuse the approved skill table row only when both source and target contain this exact skill. */
export const resolveSkillDescription = (skill: Pick<Skill, 'name' | 'description' | 'list'>, catalog: Catalog | null): string => {
	const rowID = skillRules[skill.list];
	const row = rowID ? catalog?.[rowID] : undefined;
	if (!row?.en || !row.zh || !skill.description) {
		return skill.description;
	}

	const englishLines = row.en.split('\n');
	const englishHeader = englishLines.indexOf('Skill | Use');
	const endsInPeriod = skill.description.endsWith('.');
	const sourceDescription = endsInPeriod ? skill.description.slice(0, -1) : skill.description;
	if (englishHeader < 0 || englishLines.slice(englishHeader + 1).filter(line => line === `${skill.name} | ${sourceDescription}`).length !== 1) {
		return skill.description;
	}

	const escapedName = skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const matches = row.zh.split('\n').filter(line => new RegExp(`^.+（${escapedName}）｜(.+)$`).test(line));
	if (matches.length !== 1) {
		return skill.description;
	}
	const translated = new RegExp(`^.+（${escapedName}）｜(.+)$`).exec(matches[0])?.[1];
	return translated ? `${translated}${endsInPeriod ? '。' : ''}` : skill.description;
};

/** The player-facing skill use text, extracted from its approved skill-group translation. */
export const useSkillDescription = (skill: Skill): string => {
	const language = useSyncExternalStore(subscribeToLanguage, getLanguage, getLanguage);
	useSyncExternalStore(subscribeToCatalog, getCatalogTick, getCatalogTick);
	if (language === 'en') {
		return skill.description;
	}
	if (!peekCatalog()) {
		void loadCatalog();
	}
	return resolveSkillDescription(skill, peekCatalog());
};

/**
 * The key for a skill's name. The saved value stays the Forge Steel English.
 * An unmapped name, including a custom skill, has no approved row.
 */
export const skillNameKey = (name: string): string => {
	return `skill:${name}`;
};

/** The skill name to draw. English mode, and an unmapped name, stay as written. */
export const useSkillName = (name: string): string => {
	return useL10nText(skillNameKey(name), name);
};

/**
 * Names for a list, in the same order. One subscription, so the list length
 * can change. English mode returns the stored names unchanged.
 */
export const useSkillNames = (names: readonly string[]): string[] => {
	useSyncExternalStore(subscribeToLanguage, getLanguage, getLanguage);
	useSyncExternalStore(subscribeToCatalog, getCatalogTick, getCatalogTick);
	return names.map(name => translate(skillNameKey(name), name));
};

/** One skill name. Use this inside a list, where a hook cannot be called. */
export const SkillName = (props: { name: string }) => {
	return useSkillName(props.name);
};

/**
 * The key for a skill group's name. SkillList.Custom has no row, so it stays
 * the Forge Steel English.
 */
export const skillListKey = (list: string): string => {
	return `enum:SkillList:${list}`;
};

/** The skill group to draw. English mode, and Custom, stay as written. */
export const useSkillListName = (list: string): string => {
	return useL10nText(skillListKey(list), list);
};

/**
 * Group names for a list, in the same order. One subscription, so the list
 * length can change. English mode returns the stored names unchanged.
 * SkillList.Custom has no row, so it stays the Forge Steel English.
 */
export const useSkillListNames = (lists: readonly string[]): string[] => {
	useSyncExternalStore(subscribeToLanguage, getLanguage, getLanguage);
	useSyncExternalStore(subscribeToCatalog, getCatalogTick, getCatalogTick);
	return lists.map(list => translate(skillListKey(list), list));
};

/** One skill group. Use this inside a list, where a hook cannot be called. */
export const SkillListName = (props: { list: string }) => {
	return useSkillListName(props.list);
};
