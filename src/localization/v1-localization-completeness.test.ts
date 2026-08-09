import { LocalizationEntry } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { describe, expect, it } from 'vitest';

const required = {
	'ui:example.required': 'Required reading'
};

const approvedEntry: LocalizationEntry = {
	kind: 'ui',
	key: 'example.required',
	canonicalEnglish: 'Required reading',
	zhTW: 'fixture-localized-reading',
	approval: 'approved'
};

describe('V1 localization completeness', () => {
	it('is complete when every required identity is current and approved', () => {
		const result = analyzeV1LocalizationCompleteness({
			requiredCanonicalEnglish: required,
			catalogEntries: [ approvedEntry ],
			unresolvedDomains: []
		});

		expect(result.requiredCount).toBe(1);
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains).toEqual([]);
		expect(result.complete).toBe(true);
	});

	it('reports a required identity missing from the catalog', () => {
		const result = analyzeV1LocalizationCompleteness({
			requiredCanonicalEnglish: required,
			catalogEntries: [],
			unresolvedDomains: []
		});

		expect(result.missing).toEqual([ 'ui:example.required' ]);
		expect(result.complete).toBe(false);
	});

	it('reports an unapproved required identity', () => {
		const result = analyzeV1LocalizationCompleteness({
			requiredCanonicalEnglish: required,
			catalogEntries: [ { ...approvedEntry, approval: 'unapproved' } ],
			unresolvedDomains: []
		});

		expect(result.unapproved).toEqual([ 'ui:example.required' ]);
		expect(result.complete).toBe(false);
	});

	it('reuses canonical-drift validation for required identities', () => {
		const result = analyzeV1LocalizationCompleteness({
			requiredCanonicalEnglish: { 'ui:example.required': 'Revised reading' },
			catalogEntries: [ approvedEntry ],
			unresolvedDomains: []
		});

		expect(result.catalogIssues.map(issue => issue.code)).toEqual([ 'canonical-drift' ]);
		expect(result.complete).toBe(false);
	});

	it('fails closed on duplicate or malformed catalog entries', () => {
		const result = analyzeV1LocalizationCompleteness({
			requiredCanonicalEnglish: required,
			catalogEntries: [ approvedEntry, { ...approvedEntry }, null ],
			unresolvedDomains: []
		});

		expect(result.catalogIssues.map(issue => issue.code)).toEqual([ 'duplicate-identity', 'invalid-entry' ]);
		expect(result.complete).toBe(false);
	});

	it('propagates placeholder validation failures into the completeness result', () => {
		const messageEntry: LocalizationEntry = {
			kind: 'message',
			key: 'example.message',
			canonicalEnglish: 'Required {value}',
			zhTW: 'fixture-localized-reading',
			approval: 'approved',
			placeholders: [ 'value' ]
		};
		const result = analyzeV1LocalizationCompleteness({
			requiredCanonicalEnglish: { 'message:example.message': 'Required {value}' },
			catalogEntries: [ messageEntry ],
			unresolvedDomains: []
		});

		expect(result.catalogIssues.map(issue => issue.code)).toEqual([ 'placeholder-mismatch' ]);
		expect(result.complete).toBe(false);
	});

	it('does not report complete while a V1 domain is unresolved', () => {
		const unresolvedDomain = { id: 'hero-sheet', description: 'Hero Sheet content has no required source yet.' };
		const result = analyzeV1LocalizationCompleteness({
			requiredCanonicalEnglish: required,
			catalogEntries: [ approvedEntry ],
			unresolvedDomains: [ unresolvedDomain ]
		});

		expect(result.missing).toEqual([]);
		expect(result.unresolvedDomains).toEqual([ unresolvedDomain ]);
		expect(result.complete).toBe(false);
	});

	it('ignores unrelated well-formed catalog entries when calculating the denominator', () => {
		const extraEntry: LocalizationEntry = {
			kind: 'ui',
			key: 'example.extra',
			canonicalEnglish: 'Extra reading',
			zhTW: 'fixture-extra-reading',
			approval: 'approved'
		};
		const result = analyzeV1LocalizationCompleteness({
			requiredCanonicalEnglish: required,
			catalogEntries: [ approvedEntry, extraEntry ],
			unresolvedDomains: []
		});

		expect(result.requiredCount).toBe(1);
		expect(result.missing).toEqual([]);
		expect(result.complete).toBe(true);
	});

	it('keeps the current V1 manifest incomplete until its domains are enumerated', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		expect(result.requiredCount).toBe(0);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual([
			'official-ability-authored-content',
			'class-and-subclass-level-content',
			'skills-and-languages',
			'hero-sheet',
			'hero-edit-semantic-keys'
		]);
		expect(result.complete).toBe(false);
	});
});
