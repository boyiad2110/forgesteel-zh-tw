// The localization catalog is presentation-only. It never holds canonical rule data:
// canonical English stays in src/data, and the snapshot kept here exists solely so a
// change to the English source can be detected and the zh-TW content re-approved.

/**
 * A zh-TW entry may only reach the screen once the project owner has approved it.
 * Anything else resolves to the canonical English passed in by the call site.
 */
export type LocalizationApproval = 'approved' | 'unapproved';

interface LocalizationEntryBase {
	// The canonical English text as it was when the zh-TW content was written. A
	// mismatch against the current English means the entry is stale.
	canonicalEnglish: string;
	zhTW: string;
	approval: LocalizationApproval;
}

/** A semantic UI key, e.g. 'hero-edit.save-changes'. */
export interface UIStringEntry extends LocalizationEntryBase {
	kind: 'ui';
	key: string;
}

/** A displayable field of an element that has a stable canonical ID. */
export interface ElementFieldEntry extends LocalizationEntryBase {
	kind: 'element-field';
	elementID: string;
	field: string;
}

/**
 * A displayable field of a Skill record. Skill has no stable ID (see src/models/skill.ts),
 * so this identity is addressed by the Skill's own canonical English `name` instead - the
 * value Hero/Feature selection data and save data already use to reference a Skill.
 */
export interface SkillFieldEntry extends LocalizationEntryBase {
	kind: 'skill-field';
	skillName: string;
	field: string;
}

/**
 * A composed message: a template plus the structured placeholders it interpolates.
 * The placeholder list is the entry's contract; both the canonical English template
 * and the zh-TW template must use exactly these placeholders.
 */
export interface MessageEntry extends LocalizationEntryBase {
	kind: 'message';
	key: string;
	placeholders: string[];
}

export type LocalizationEntry = UIStringEntry | ElementFieldEntry | SkillFieldEntry | MessageEntry;

/** Values interpolated into a composed message; always canonical or already-localized display text. */
export type MessageParameters = Record<string, string>;

const placeholderPattern = /\{([^{}]*)\}/g;

/** The placeholder names a template refers to, in the order they first appear. */
export const getTemplatePlaceholders = (template: string) => {
	const names: string[] = [];

	for (const match of template.matchAll(placeholderPattern)) {
		const name = match[1];
		if (!names.includes(name)) {
			names.push(name);
		}
	}

	return names;
};

/** Substitutes the supplied parameters; an unmatched placeholder is left in place. */
export const interpolateTemplate = (template: string, parameters: MessageParameters) => {
	return template.replace(placeholderPattern, (match, name: string) => {
		const value = parameters[name];
		return typeof value === 'string' ? value : match;
	});
};

export const uiStringIdentity = (key: string) => `ui:${key}`;

export const elementFieldIdentity = (elementID: string, field: string) => `element:${elementID}/${field}`;

export const skillFieldIdentity = (skillName: string, field: string) => `skill:${skillName}/${field}`;

export const messageIdentity = (key: string) => `message:${key}`;

/** The stable localization identity of an entry, used as its catalog key. */
export const getEntryIdentity = (entry: LocalizationEntry) => {
	switch (entry.kind) {
		case 'ui':
			return uiStringIdentity(entry.key);
		case 'element-field':
			return elementFieldIdentity(entry.elementID, entry.field);
		case 'skill-field':
			return skillFieldIdentity(entry.skillName, entry.field);
		case 'message':
			return messageIdentity(entry.key);
	}
};
