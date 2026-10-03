import { L10nScope, useDisplayKey, useL10nText } from '@/l10n/hooks';
import { L10nField } from '@/l10n/text';
import { ReactNode } from 'react';

export { L10nUnscoped } from '@/l10n/hooks';

export interface ElementText {
	id: string;
	name: string;
	description: string;
}

/**
 * A hero customization that replaces the data text on screen.
 * An empty string means that field was not replaced.
 */
export interface ElementOverlay {
	name?: string;
	description?: string;
}

/**
 * Fields the surrounding screen may translate.
 *
 * A non-empty overlay is a rename or a rewritten description, so that field
 * is left out and the text on screen stays in English. Computed wording stays
 * in English too: the scope keeps the data text, and a display string that no
 * longer matches it is not looked up.
 */
export const elementScopeFields = (element: ElementText, overlay?: ElementOverlay | null): L10nField[] => {
	const fields: L10nField[] = [];
	if (!overlay?.name && element.name) {
		fields.push({ field: 'name', text: element.name });
	}
	if (!overlay?.description && element.description) {
		fields.push({ field: 'description', text: element.description });
	}
	return fields;
};

/**
 * Mounts element:<id>:name and element:<id>:description for one data object.
 * HeaderText and Markdown inside look those up only when the text still matches.
 */
export const ElementScope = (props: { element: ElementText, overlay?: ElementOverlay | null, children: ReactNode }) => {
	return (
		<L10nScope id={props.element.id} fields={elementScopeFields(props.element, props.overlay)}>
			{props.children}
		</L10nScope>
	);
};

/** The same lookup HeaderText uses, for a label that is not a header. */
export const L10nText = (props: { text: string }) => {
	const key = useDisplayKey(undefined, props.text);
	return useL10nText(key, props.text);
};
