import {
	LocalizationApproval,
	LocalizationEntry,
	getEntryIdentity,
	getTemplatePlaceholders
} from '@/localization/catalog';

// Catalog problems must be caught by automated tests rather than by a player seeing the
// wrong text, so the validator works on unknown input: it is the check that a catalog is
// shaped the way the resolver assumes, not a restatement of the TypeScript types.

export type LocalizationCatalogIssueCode =
	| 'invalid-entry'
	| 'duplicate-identity'
	| 'canonical-drift'
	| 'approved-without-content'
	| 'placeholder-mismatch'
	| 'replacement-character';

export interface LocalizationCatalogIssue {
	code: LocalizationCatalogIssueCode;
	/** The entry's localization identity, or its position when the entry is too malformed to have one. */
	identity: string;
	detail: string;
}

/**
 * Identity to the canonical English as it reads today. Entries absent from the map are
 * not drift-checked, so a caller can check as much of the catalog as it has a source for.
 */
export type CanonicalEnglishSource = Record<string, string>;

const approvalStates: LocalizationApproval[] = [ 'approved', 'unapproved' ];

const isFilledString = (value: unknown): value is string => (typeof value === 'string') && (value.trim() !== '');

const describe = (names: string[]) => names.map(name => `{${name}}`).join(', ');

// Returns the structural problem with a candidate entry, or null when it is well formed.
const getStructuralProblem = (entry: unknown) => {
	if ((typeof entry !== 'object') || (entry === null) || Array.isArray(entry)) {
		return 'entry is not an object';
	}

	const candidate = entry as Partial<LocalizationEntry> & Record<string, unknown>;

	switch (candidate.kind) {
		case 'ui':
		case 'message':
			if (!isFilledString(candidate.key)) {
				return 'key must be a non-empty string';
			}
			break;
		case 'element-field':
			if (!isFilledString(candidate.elementID)) {
				return 'elementID must be a non-empty string';
			}
			if (!isFilledString(candidate.field)) {
				return 'field must be a non-empty string';
			}
			break;
		case 'skill-field':
			if (!isFilledString(candidate.skillName)) {
				return 'skillName must be a non-empty string';
			}
			if (!isFilledString(candidate.field)) {
				return 'field must be a non-empty string';
			}
			break;
		case 'language-field':
			if (!isFilledString(candidate.languageName)) {
				return 'languageName must be a non-empty string';
			}
			if (!isFilledString(candidate.field)) {
				return 'field must be a non-empty string';
			}
			break;
		default:
			return `unknown entry kind '${String(candidate.kind)}'`;
	}

	if (!isFilledString(candidate.canonicalEnglish)) {
		return 'canonicalEnglish must be a non-empty string';
	}

	if (typeof candidate.zhTW !== 'string') {
		return 'zhTW must be a string';
	}

	if (!approvalStates.some(state => state === candidate.approval)) {
		return `invalid approval state '${String(candidate.approval)}'`;
	}

	if (candidate.kind === 'message') {
		const placeholders = candidate.placeholders;
		if (!Array.isArray(placeholders) || !placeholders.every(isFilledString)) {
			return 'placeholders must be an array of non-empty strings';
		}
		if (new Set(placeholders).size !== placeholders.length) {
			return 'placeholders must not repeat a name';
		}
	}

	return null;
};

const getPlaceholderProblem = (declared: string[], template: string, templateName: string) => {
	const used = getTemplatePlaceholders(template);
	const missing = declared.filter(name => !used.includes(name));
	const unexpected = used.filter(name => !declared.includes(name));

	if ((missing.length === 0) && (unexpected.length === 0)) {
		return null;
	}

	const parts = [
		missing.length > 0 ? `missing ${describe(missing)}` : null,
		unexpected.length > 0 ? `unexpected ${describe(unexpected)}` : null
	].filter(part => part !== null);

	return `${templateName} ${parts.join(' and ')}`;
};

/**
 * Every problem found in a catalog. An empty result means the catalog is safe for the
 * resolver to use; it does not mean the translations themselves are correct.
 */
export const validateLocalizationCatalog = (entries: readonly unknown[], currentCanonicalEnglish: CanonicalEnglishSource = {}): LocalizationCatalogIssue[] => {
	const issues: LocalizationCatalogIssue[] = [];
	const seen = new Set<string>();

	entries.forEach((candidate, index) => {
		const structuralProblem = getStructuralProblem(candidate);
		if (structuralProblem !== null) {
			issues.push({ code: 'invalid-entry', identity: `entry[${index}]`, detail: structuralProblem });
			return;
		}

		const entry = candidate as LocalizationEntry;
		const identity = getEntryIdentity(entry);

		if (seen.has(identity)) {
			issues.push({ code: 'duplicate-identity', identity: identity, detail: `entry[${index}] repeats a localization identity` });
		}
		seen.add(identity);

		const canonicalToday = currentCanonicalEnglish[identity];
		if ((canonicalToday !== undefined) && (canonicalToday !== entry.canonicalEnglish)) {
			issues.push({
				code: 'canonical-drift',
				identity: identity,
				detail: `canonical English has changed from '${entry.canonicalEnglish}' to '${canonicalToday}'; the zh-TW content needs re-approval`
			});
		}

		if ((entry.approval === 'approved') && !isFilledString(entry.zhTW)) {
			issues.push({ code: 'approved-without-content', identity: identity, detail: 'approved entry has no zh-TW content' });
		}

		if (entry.zhTW.includes('\uFFFD')) {
			issues.push({ code: 'replacement-character', identity: identity, detail: 'zh-TW content contains the Unicode replacement character (U+FFFD)' });
		}

		if (entry.kind === 'message') {
			const canonicalProblem = getPlaceholderProblem(entry.placeholders, entry.canonicalEnglish, 'canonical English template');
			if (canonicalProblem !== null) {
				issues.push({ code: 'placeholder-mismatch', identity: identity, detail: canonicalProblem });
			}

			// An empty zh-TW template is reported as missing content, not as a placeholder problem.
			if (isFilledString(entry.zhTW)) {
				const localizedProblem = getPlaceholderProblem(entry.placeholders, entry.zhTW, 'zh-TW template');
				if (localizedProblem !== null) {
					issues.push({ code: 'placeholder-mismatch', identity: identity, detail: localizedProblem });
				}
			}
		}
	});

	return issues;
};
