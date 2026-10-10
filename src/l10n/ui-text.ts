import { getCatalogTick, subscribeToCatalog } from '@/l10n/catalog';
import { getLanguage, subscribeToLanguage } from '@/l10n/language';
import approvedEnglish from '@/l10n/ui-english.json';
import { translate } from '@/l10n/text';
import { useSyncExternalStore } from 'react';

type UIId = keyof typeof approvedEnglish;
type Variables = Record<string, string | number>;

const uiKey = (id: UIId) => `ui:${id}`;

const resolve = (id: UIId, english: string): string => {
	if (approvedEnglish[id] !== english) {
		return english;
	}
	return translate(uiKey(id), english);
};

export const applyUITemplate = (target: string, source: string, english: string, values: Variables): string => {
	if (target === source) {
		return english;
	}
	const matches = Array.from(target.matchAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g));
	const found = matches.map(match => match[1]).sort();
	const expected = Object.keys(values).sort();
	if (found.length !== expected.length || found.some((name, index) => name !== expected[index])) {
		return english;
	}
	return target.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (_, name: string) => String(values[name]));
};

/**
 * UI translations use the approved source text as their lookup guard. A changed
 * English literal, missing approval, or unloaded catalog remains in English.
 */
export const useUI = () => {
	useSyncExternalStore(subscribeToLanguage, getLanguage, getLanguage);
	useSyncExternalStore(subscribeToCatalog, getCatalogTick, getCatalogTick);
	return {
		language: getLanguage(),
		text: resolve,
		format: (id: UIId, source: string, english: string, values: Variables): string =>
			applyUITemplate(resolve(id, source), source, english, values)
	};
};
