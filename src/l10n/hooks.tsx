import { L10nScopeState, displayKey, translate } from '@/l10n/text';
import { ReactNode, createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { getCatalogTick, subscribeToCatalog } from '@/l10n/catalog';
import { getLanguage, setLanguage, subscribeToLanguage, toggleLanguage } from '@/l10n/language';
import { ensureCjkFont } from '@/l10n/cjk-font';

const L10nScopeContext = createContext<L10nScopeState | null>(null);

interface ScopeProps {
	id: string;
	fields: L10nScopeState['fields'];
	children: ReactNode;
}

/**
 * Marks the element a block of screen is showing, so titles and descriptions
 * inside it can be looked up. The same wrapper is used on every screen that
 * renders the element, including Director tools — nothing is forced back to
 * English by route. Screens mount it through ElementScope. A field translates
 * when the text on screen still equals the data text. Bold and inline-code
 * marks the display adds are ignored for that comparison. A renamed feature
 * or a rewritten sentence stays in English.
 */
export const L10nScope = (props: ScopeProps) => {
	return (
		<L10nScopeContext value={{ id: props.id, fields: props.fields }}>
			{props.children}
		</L10nScopeContext>
	);
};

/** Drops the surrounding element scope so this block stays in English. */
export const L10nUnscoped = (props: { children: ReactNode }) => {
	return (
		<L10nScopeContext value={null}>
			{props.children}
		</L10nScopeContext>
	);
};

/** The saved language, and the two ways the footer and the settings drawer change it. */
export const useLanguage = () => {
	const language = useSyncExternalStore(subscribeToLanguage, getLanguage);

	useEffect(() => {
		ensureCjkFont(language);
	}, [ language ]);

	return {
		language,
		setLanguage,
		toggleLanguage
	};
};

/** Resolves an explicit key, or the one field in the surrounding scope that matches this text. */
export const useDisplayKey = (explicit: string | undefined, text: string | undefined): string | undefined => {
	const scope = useContext(L10nScopeContext);
	return displayKey(explicit, text, scope);
};

/**
 * The string a shared component should render. Subscribes to the language and
 * to the catalog so a later filled-in table appears without a reload.
 */
export const useL10nText = (key: string | undefined, english: string): string => {
	useSyncExternalStore(subscribeToLanguage, getLanguage);
	useSyncExternalStore(subscribeToCatalog, getCatalogTick);
	return translate(key, english);
};
