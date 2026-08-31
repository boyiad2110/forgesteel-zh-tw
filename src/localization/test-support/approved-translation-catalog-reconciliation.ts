import { LocalizationEntry, getEntryIdentity } from '@/localization/catalog';

export interface ApprovedTranslationRecord {
	identity: string;
	zhTW: string;
}

export type ApprovedTranslationCatalogReconciliationIssueType =
	| 'duplicate-approved-identity'
	| 'duplicate-catalog-identity'
	| 'missing-catalog-identity'
	| 'zh-tw-mismatch';

export interface ApprovedTranslationCatalogReconciliationIssue {
	type: ApprovedTranslationCatalogReconciliationIssueType;
	identity: string;
}

export interface ApprovedTranslationCatalogReconciliationResult {
	approvedRecordCount: number;
	catalogEntryCount: number;
	reconciledCount: number;
	issues: ApprovedTranslationCatalogReconciliationIssue[];
}

export interface VerifyApprovedTranslationsAgainstCatalogOptions {
	approvedTranslations: readonly ApprovedTranslationRecord[];
	catalogEntries: readonly LocalizationEntry[];
}

const issueTypeOrder: Record<ApprovedTranslationCatalogReconciliationIssueType, number> = {
	'duplicate-approved-identity': 0,
	'duplicate-catalog-identity': 1,
	'missing-catalog-identity': 2,
	'zh-tw-mismatch': 3
};

const compareStrings = (left: string, right: string) => {
	if (left === right) {
		return 0;
	}
	return left < right ? -1 : 1;
};

const compareIssues = (left: ApprovedTranslationCatalogReconciliationIssue, right: ApprovedTranslationCatalogReconciliationIssue) => (
	compareStrings(left.identity, right.identity) || (issueTypeOrder[left.type] - issueTypeOrder[right.type])
);

const collectByIdentity = <T>(records: readonly T[], getIdentity: (record: T) => string) => {
	const byIdentity = new Map<string, T[]>();

	for (const record of records) {
		const identity = getIdentity(record);
		const matchingRecords = byIdentity.get(identity) ?? [];
		matchingRecords.push(record);
		byIdentity.set(identity, matchingRecords);
	}

	return byIdentity;
};

/**
 * Compares a frozen approved translation slice against the production catalog by stable
 * identity. It deliberately checks only the supplied slice and never discovers a denominator.
 */
export const verifyApprovedTranslationsAgainstCatalog = (options: VerifyApprovedTranslationsAgainstCatalogOptions): ApprovedTranslationCatalogReconciliationResult => {
	const approvedByIdentity = collectByIdentity(options.approvedTranslations, record => record.identity);
	const catalogByIdentity = collectByIdentity(options.catalogEntries, getEntryIdentity);
	const issues: ApprovedTranslationCatalogReconciliationIssue[] = [];

	for (const [ identity, records ] of approvedByIdentity) {
		if (records.length > 1) {
			issues.push({ type: 'duplicate-approved-identity', identity });
		}
	}

	for (const [ identity, approvedRecords ] of approvedByIdentity) {
		const catalogEntries = catalogByIdentity.get(identity) ?? [];
		if (catalogEntries.length > 1) {
			issues.push({ type: 'duplicate-catalog-identity', identity });
			continue;
		}

		if (catalogEntries.length === 0) {
			issues.push({ type: 'missing-catalog-identity', identity });
			continue;
		}

		if ((approvedRecords.length === 1) && (approvedRecords[0].zhTW !== catalogEntries[0].zhTW)) {
			issues.push({ type: 'zh-tw-mismatch', identity });
		}
	}

	const orderedIssues = issues.sort(compareIssues);
	return {
		approvedRecordCount: options.approvedTranslations.length,
		catalogEntryCount: options.catalogEntries.length,
		reconciledCount: orderedIssues.length === 0 ? approvedByIdentity.size : 0,
		issues: orderedIssues
	};
};
