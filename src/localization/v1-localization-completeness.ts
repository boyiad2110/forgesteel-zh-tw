import {
	LocalizationEntry,
	getEntryIdentity
} from '@/localization/catalog';
import {
	CanonicalEnglishSource,
	LocalizationCatalogIssue,
	validateLocalizationCatalog
} from '@/localization/catalog-validator';
import { V1LocalizationUnresolvedDomain } from '@/localization/v1-localization-manifest';

export interface V1LocalizationCompletenessInput {
	requiredCanonicalEnglish: CanonicalEnglishSource;
	catalogEntries: readonly unknown[];
	unresolvedDomains: readonly V1LocalizationUnresolvedDomain[];
}

export interface V1LocalizationCompletenessResult {
	requiredCount: number;
	missing: string[];
	unapproved: string[];
	catalogIssues: LocalizationCatalogIssue[];
	unresolvedDomains: V1LocalizationUnresolvedDomain[];
	complete: boolean;
}

const getCandidateIdentity = (candidate: unknown) => {
	if ((typeof candidate !== 'object') || (candidate === null) || Array.isArray(candidate)) {
		return null;
	}

	const entry = candidate as Partial<LocalizationEntry>;
	switch (entry.kind) {
		case 'ui':
		case 'message':
			return (typeof entry.key === 'string') && (entry.key !== '') ? getEntryIdentity(entry as LocalizationEntry) : null;
		case 'element-field':
			return (typeof entry.elementID === 'string') && (entry.elementID !== '') && (typeof entry.field === 'string') && (entry.field !== '') ? getEntryIdentity(entry as LocalizationEntry) : null;
		default:
			return null;
	}
};

/**
 * Evaluates only the supplied V1 denominator. Extra valid catalog entries do not add
 * requirements, while unresolved domains and catalog validation failures always block
 * completion.
 */
export const analyzeV1LocalizationCompleteness = (input: V1LocalizationCompletenessInput): V1LocalizationCompletenessResult => {
	const requiredIdentities = Object.keys(input.requiredCanonicalEnglish).sort();
	const entriesByIdentity = new Map<string, unknown[]>();

	input.catalogEntries.forEach(candidate => {
		const identity = getCandidateIdentity(candidate);
		if (identity) {
			const entries = entriesByIdentity.get(identity) || [];
			entries.push(candidate);
			entriesByIdentity.set(identity, entries);
		}
	});

	const missing = requiredIdentities.filter(identity => !entriesByIdentity.has(identity));
	const unapproved = requiredIdentities.filter(identity => {
		const entries = entriesByIdentity.get(identity) || [];
		return entries.some(entry => (entry as Partial<LocalizationEntry>).approval !== 'approved');
	});
	const catalogIssues = validateLocalizationCatalog(input.catalogEntries, input.requiredCanonicalEnglish);
	const unresolvedDomains = [ ...input.unresolvedDomains ];

	return {
		requiredCount: requiredIdentities.length,
		missing: missing,
		unapproved: unapproved,
		catalogIssues: catalogIssues,
		unresolvedDomains: unresolvedDomains,
		complete: (missing.length === 0)
			&& (unapproved.length === 0)
			&& (catalogIssues.length === 0)
			&& (unresolvedDomains.length === 0)
	};
};
