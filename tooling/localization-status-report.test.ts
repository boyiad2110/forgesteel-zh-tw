/* eslint-disable sort-imports */

import { LocalizationEntry } from '@/localization/catalog';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createLocalizationStatusReport, formatLocalizationStatusReport } from './localization-status-report';
import { describe, expect, it } from 'vitest';

const required = {
	'ui:alpha': 'Alpha',
	'ui:beta': 'Beta'
};

const approvedEntry: LocalizationEntry = {
	kind: 'ui',
	key: 'alpha',
	canonicalEnglish: 'Alpha',
	zhTW: 'fixture-alpha',
	approval: 'approved'
};

const reportFor = (catalogEntries: readonly unknown[], unresolvedDomains = [] as { id: string; description: string }[]) => {
	return createLocalizationStatusReport(analyzeV1LocalizationCompleteness({
		requiredCanonicalEnglish: required,
		catalogEntries: catalogEntries,
		unresolvedDomains: unresolvedDomains
	}));
};

describe('localization status report', () => {
	it('passes known-denominator integrity when all required entries are approved', () => {
		const report = reportFor([ approvedEntry, { ...approvedEntry, key: 'beta', canonicalEnglish: 'Beta', zhTW: 'fixture-beta' } ]);

		expect(report.integrityHealthy).toBe(true);
		expect(report.complete).toBe(true);
	});

	it('fails integrity for a missing required identity', () => {
		const report = reportFor([ approvedEntry ]);

		expect(report.missing).toEqual([ 'ui:beta' ]);
		expect(report.integrityHealthy).toBe(false);
	});

	it('fails integrity for an unapproved required identity', () => {
		const report = reportFor([
			approvedEntry,
			{ ...approvedEntry, key: 'beta', canonicalEnglish: 'Beta', zhTW: '', approval: 'unapproved' }
		]);

		expect(report.unapproved).toEqual([ 'ui:beta' ]);
		expect(report.integrityHealthy).toBe(false);
	});

	it('fails integrity for a catalog validation issue', () => {
		const report = reportFor([
			approvedEntry,
			{ ...approvedEntry },
			{ ...approvedEntry, key: 'beta', canonicalEnglish: 'Beta', zhTW: 'fixture-beta' }
		]);

		expect(report.catalogIssues).toEqual(expect.arrayContaining([
			expect.objectContaining({ code: 'duplicate-identity', identity: 'ui:alpha' })
		]));
		expect(report.integrityHealthy).toBe(false);
	});

	it('keeps unresolved domains separate from known-denominator integrity', () => {
		const report = reportFor([
			approvedEntry,
			{ ...approvedEntry, key: 'beta', canonicalEnglish: 'Beta', zhTW: 'fixture-beta' }
		], [ { id: 'hero-sheet', description: 'Hero Sheet is not yet enumerated.' } ]);

		expect(report.integrityHealthy).toBe(true);
		expect(report.complete).toBe(false);
	});

	it('sorts report identities, catalog issues, and domains deterministically', () => {
		const report = createLocalizationStatusReport({
			requiredCount: 3,
			missing: [ 'ui:zeta', 'ui:alpha' ],
			unapproved: [ 'ui:gamma', 'ui:beta' ],
			catalogIssues: [
				{ code: 'placeholder-mismatch', identity: 'ui:alpha', detail: 'zeta' },
				{ code: 'duplicate-identity', identity: 'ui:zeta', detail: 'alpha' }
			],
			unresolvedDomains: [
				{ id: 'zeta-domain', description: 'Zeta' },
				{ id: 'alpha-domain', description: 'Alpha' }
			],
			complete: false
		});

		expect(report.missing).toEqual([ 'ui:alpha', 'ui:zeta' ]);
		expect(report.unapproved).toEqual([ 'ui:beta', 'ui:gamma' ]);
		expect(report.catalogIssues.map(issue => issue.code)).toEqual([ 'duplicate-identity', 'placeholder-mismatch' ]);
		expect(report.unresolvedDomains.map(domain => domain.id)).toEqual([ 'alpha-domain', 'zeta-domain' ]);
		expect(formatLocalizationStatusReport(report)).toContain('Localization integrity: FAIL');
	});
});
