import { getCatalogTick, subscribeToCatalog } from '@/l10n/catalog';
import { getLanguage, subscribeToLanguage } from '@/l10n/language';
import { translate } from '@/l10n/text';
import { useL10nText } from '@/l10n/hooks';
import { useSyncExternalStore } from 'react';

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
