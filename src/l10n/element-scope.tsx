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
 * is left out. The scope keeps the original data text; computed wording can
 * use a key only when that exact field has an explicit calculation binding,
 * whose projection adapter validates the displayed value. Unknown rewrites
 * stay in English.
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
 * HeaderText and Markdown look up matching fields; explicitly bound calculated
 * fields use the same key with projection validation.
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
