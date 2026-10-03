import { Catalog, loadCatalog, peekCatalog } from '@/l10n/catalog';
import { Language, getLanguage } from '@/l10n/language';
import { mapping } from '@/l10n/mapping';

export interface L10nField {
	field: string;
	text: string;
}

export interface L10nScopeState {
	id: string;
	fields: L10nField[];
}

const blank = (text: string) => {
	return text.trim().length === 0;
};

/**
 * Picks the sheet lookup key for one displayed string.
 *
 * An explicit key wins. Otherwise, when the surrounding scope has exactly
 * one field whose English text is this string, the key is
 * `element:<id>:<field>`. Two fields with the same text are left untranslated
 * rather than guessed. No scope means no key.
 */
export const displayKey = (explicit: string | undefined, text: string | undefined, scope: L10nScopeState | null): string | undefined => {
	if (explicit) {
		return explicit;
	}
	if (!scope || text === undefined) {
		return undefined;
	}

	const matches = scope.fields.filter(field => field.text === text);
	if (matches.length !== 1) {
		return undefined;
	}

	return `element:${scope.id}:${matches[0].field}`;
};

/**
 * The string to show. English mode always returns `english`, the exact value
 * the screen already had — never the sheet's own English copy.
 *
 * In zh-TW, a missing key, a missing table row, a sheet id that is not
 * loaded, or a blank translation also returns `english`.
 */
export const resolveText = (language: Language, key: string | undefined, english: string, table: Record<string, string>, catalog: Catalog | null): string => {
	if (language === 'en' || !key) {
		return english;
	}

	const sheetId = table[key];
	if (!sheetId || !catalog) {
		return english;
	}

	const zh = catalog[sheetId]?.zh;
	if (!zh || blank(zh)) {
		return english;
	}

	return zh;
};

/**
 * Live lookup used by shared display components. Starts loading the generated
 * JSON only when zh-TW mode has a real sheet id to read. An empty mapping
 * table never loads it.
 */
export const translate = (key: string | undefined, english: string): string => {
	const language = getLanguage();
	const entry = language === 'zh-TW' && key ? mapping[key] : undefined;
	const sheetId = entry?.sheetId;
	if (sheetId && !peekCatalog()) {
		void loadCatalog();
	}

	const table: Record<string, string> = {};
	if (key && sheetId) {
		table[key] = sheetId;
	}

	return resolveText(language, key, english, table, peekCatalog());
};
