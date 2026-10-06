import { getCatalogTick, subscribeToCatalog } from '@/l10n/catalog';
import { getLanguage, subscribeToLanguage } from '@/l10n/language';
import { translate } from '@/l10n/text';
import { useL10nText } from '@/l10n/hooks';
import { useSyncExternalStore } from 'react';

/**
 * The key for a language's name. The saved value stays the Forge Steel English,
 * including the Kalliac spelling. An unmapped name has no approved row.
 */
export const languageNameKey = (name: string): string => {
	return `language:${name}`;
};

/** The language name to draw. English mode, and an unmapped name, stay as written. */
export const useLanguageName = (name: string): string => {
	return useL10nText(languageNameKey(name), name);
};

/**
 * Names for a list, in the same order. One subscription, so the list length
 * can change. English mode returns the stored names unchanged.
 */
export const useLanguageNames = (names: readonly string[]): string[] => {
	useSyncExternalStore(subscribeToLanguage, getLanguage);
	useSyncExternalStore(subscribeToCatalog, getCatalogTick);
	return names.map(name => translate(languageNameKey(name), name));
};

/** One language name. Use this inside a list, where a hook cannot be called. */
export const LanguageName = (props: { name: string }) => {
	return useLanguageName(props.name);
};
