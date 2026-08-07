/* eslint-disable sort-imports */

import { AppLocale } from '@/localization/locale';
import {
	LocalizationEntry,
	MessageParameters,
	elementFieldIdentity,
	getEntryIdentity,
	getTemplatePlaceholders,
	interpolateTemplate,
	messageIdentity,
	uiStringIdentity
} from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';

// The resolver is the presentation boundary. Everything it returns is display text: it
// must never be written back to a hero, an option value, an ID, a sort key, parser input
// or storage. Callers always pass the canonical English they would otherwise have shown,
// so a missing, unapproved, stale or malformed entry degrades to that canonical English
// rather than to an empty string, an internal key, or an unfilled placeholder.

export interface LocalizationResolver {
	localizeUIString: (locale: AppLocale, key: string, canonicalEnglish: string) => string;
	localizeElementField: (locale: AppLocale, elementID: string, field: string, canonicalEnglish: string) => string;
	localizeMessage: (locale: AppLocale, key: string, parameters: MessageParameters, canonicalEnglishTemplate: string) => string;
}

const hasContent = (value: unknown): value is string => (typeof value === 'string') && (value.trim() !== '');

const samePlaceholders = (a: string[], b: string[]) => {
	return (a.length === b.length) && a.every(name => b.includes(name));
};

export const createLocalizationResolver = (entries: readonly LocalizationEntry[]): LocalizationResolver => {
	const byIdentity = new Map<string, LocalizationEntry>();
	const ambiguous = new Set<string>();

	entries.forEach(entry => {
		const identity = getEntryIdentity(entry);
		if (byIdentity.has(identity)) {
			// An ambiguous identity cannot be resolved to one approved translation, so it
			// resolves to none of them.
			ambiguous.add(identity);
		}
		byIdentity.set(identity, entry);
	});

	const findEntry = (identity: string) => ambiguous.has(identity) ? undefined : byIdentity.get(identity);

	// Shared gate for every entry kind: approved, still matching the English it was
	// approved against, and carrying real content.
	const isDisplayable = (entry: LocalizationEntry | undefined, canonicalEnglish: string): entry is LocalizationEntry => {
		return !!entry
			&& (entry.approval === 'approved')
			&& (entry.canonicalEnglish === canonicalEnglish)
			&& hasContent(entry.zhTW);
	};

	const localizeText = (locale: AppLocale, identity: string, canonicalEnglish: string) => {
		if (locale === 'en') {
			return canonicalEnglish;
		}

		const entry = findEntry(identity);
		return isDisplayable(entry, canonicalEnglish) ? entry.zhTW : canonicalEnglish;
	};

	return {
		localizeUIString: (locale, key, canonicalEnglish) => {
			return localizeText(locale, uiStringIdentity(key), canonicalEnglish);
		},
		localizeElementField: (locale, elementID, field, canonicalEnglish) => {
			return localizeText(locale, elementFieldIdentity(elementID, field), canonicalEnglish);
		},
		localizeMessage: (locale, key, parameters, canonicalEnglishTemplate) => {
			// A parameter the call site did not supply could only ever be shown as an
			// unfilled placeholder, in any locale, so it fails here instead of reaching
			// the screen. This is checked against the template, so a brace inside a
			// parameter value — player-entered text, for instance — is left untouched.
			const missing = getTemplatePlaceholders(canonicalEnglishTemplate).filter(name => typeof parameters[name] !== 'string');
			if (missing.length > 0) {
				throw new Error(`Message '${key}' was given no value for: ${missing.join(', ')}`);
			}

			const canonicalText = interpolateTemplate(canonicalEnglishTemplate, parameters);
			if (locale === 'en') {
				return canonicalText;
			}

			const entry = findEntry(messageIdentity(key));
			if (!entry || (entry.kind !== 'message') || !isDisplayable(entry, canonicalEnglishTemplate)) {
				return canonicalText;
			}

			// The declared placeholders are the entry's contract with the call site; a
			// translation that adds, drops or renames one is not usable as it stands.
			const declared = entry.placeholders;
			if (!samePlaceholders(declared, getTemplatePlaceholders(canonicalEnglishTemplate)) || !samePlaceholders(declared, getTemplatePlaceholders(entry.zhTW))) {
				return canonicalText;
			}

			// Every declared placeholder has a value: the declared set matches the
			// canonical template, which was checked above.
			return interpolateTemplate(entry.zhTW, parameters);
		}
	};
};

const productionResolver = createLocalizationResolver(productionLocalizationEntries);

export const localizeUIString = productionResolver.localizeUIString;
export const localizeElementField = productionResolver.localizeElementField;
export const localizeMessage = productionResolver.localizeMessage;
