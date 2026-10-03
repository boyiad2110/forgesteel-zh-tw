import { L10nScopeState, displayKey, translate } from '@/l10n/text';
import { ReactNode, createContext, useContext, useSyncExternalStore } from 'react';
import { getCatalogTick, subscribeToCatalog } from '@/l10n/catalog';
import { getLanguage, setLanguage, subscribeToLanguage, toggleLanguage } from '@/l10n/language';

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
 * English by route. This batch does not mount it: the mapping table is empty,
 * so there is nothing to look up yet.
 */
export const L10nScope = (props: ScopeProps) => {
	return (
		<L10nScopeContext value={{ id: props.id, fields: props.fields }}>
			{props.children}
		</L10nScopeContext>
	);
};

/** The saved language, and the two ways the footer and the settings drawer change it. */
export const useLanguage = () => {
	const language = useSyncExternalStore(subscribeToLanguage, getLanguage);

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
