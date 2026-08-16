import { LocalizationCatalogIssue } from '@/localization/catalog-validator';
import { V1LocalizationCompletenessResult } from '@/localization/v1-localization-completeness';
import { V1LocalizationUnresolvedDomain } from '@/localization/v1-localization-manifest';

export interface LocalizationStatusCatalogIssue {
	code: LocalizationCatalogIssue['code'];
	identity: string;
	detail: string;
}

export interface LocalizationStatusReport {
	requiredCount: number;
	missing: string[];
	unapproved: string[];
	catalogIssues: LocalizationStatusCatalogIssue[];
	unresolvedDomains: V1LocalizationUnresolvedDomain[];
	integrityHealthy: boolean;
	complete: boolean;
}

const compareStrings = (left: string, right: string) => {
	if (left === right) {
		return 0;
	}

	return left < right ? -1 : 1;
};

const compareIssues = (left: LocalizationStatusCatalogIssue, right: LocalizationStatusCatalogIssue) => {
	return compareStrings(left.code, right.code)
		|| compareStrings(left.identity, right.identity)
		|| compareStrings(left.detail, right.detail);
};

const compareDomains = (left: V1LocalizationUnresolvedDomain, right: V1LocalizationUnresolvedDomain) => {
	return compareStrings(left.id, right.id) || compareStrings(left.description, right.description);
};

/**
 * Converts the authoritative completeness result into a deterministic report for
 * reviewers and CI. This does not calculate a second denominator.
 */
export const createLocalizationStatusReport = (result: V1LocalizationCompletenessResult): LocalizationStatusReport => {
	const missing = [ ...result.missing ].sort(compareStrings);
	const unapproved = [ ...result.unapproved ].sort(compareStrings);
	const catalogIssues = result.catalogIssues
		.map(issue => ({ code: issue.code, identity: issue.identity, detail: issue.detail }))
		.sort(compareIssues);
	const unresolvedDomains = [ ...result.unresolvedDomains ].sort(compareDomains);

	return {
		requiredCount: result.requiredCount,
		missing: missing,
		unapproved: unapproved,
		catalogIssues: catalogIssues,
		unresolvedDomains: unresolvedDomains,
		integrityHealthy: (missing.length === 0) && (unapproved.length === 0) && (catalogIssues.length === 0),
		complete: result.complete
	};
};

const describeIdentities = (identities: string[]) => identities.length === 0 ? 'none' : identities.join('\n  - ');

export const formatLocalizationStatusReport = (report: LocalizationStatusReport): string => {
	const catalogIssues = report.catalogIssues.length === 0
		? 'none'
		: report.catalogIssues.map(issue => `${issue.code} (${issue.identity}): ${issue.detail}`).join('\n  - ');
	const unresolvedDomains = report.unresolvedDomains.length === 0
		? 'none'
		: report.unresolvedDomains.map(domain => `${domain.id}: ${domain.description}`).join('\n  - ');

	return [
		'Localization pipeline status',
		`Required identities: ${report.requiredCount}`,
		`Missing (${report.missing.length}): ${describeIdentities(report.missing)}`,
		`Unapproved (${report.unapproved.length}): ${describeIdentities(report.unapproved)}`,
		`Catalog issues (${report.catalogIssues.length}): ${catalogIssues}`,
		`Unresolved domains (${report.unresolvedDomains.length}): ${unresolvedDomains}`,
		`Localization integrity: ${report.integrityHealthy ? 'PASS' : 'FAIL'}`,
		`V1 complete: ${report.complete ? 'PASS' : 'INCOMPLETE'}`
	].join('\n');
};
