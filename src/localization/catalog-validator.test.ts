/* eslint-disable sort-imports */

import { LocalizationEntry } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { validateLocalizationCatalog } from '@/localization/catalog-validator';
import { describe, expect, it } from 'vitest';

// Engineering sentinels, not translations: no zh-TW game terminology has been approved,
// and none is introduced here.
const zhUIString = '測試字串一';
const zhMessageTemplate = '測試訊息 {abilityName} / {target}';

const uiEntry: LocalizationEntry = {
	kind: 'ui',
	key: 'hero-edit.save-changes',
	canonicalEnglish: 'Save Changes',
	zhTW: zhUIString,
	approval: 'approved'
};

const elementEntry: LocalizationEntry = {
	kind: 'element-field',
	elementID: 'free-melee',
	field: 'name',
	canonicalEnglish: 'Free Strike (melee)',
	zhTW: '測試字串二',
	approval: 'approved'
};

const messageEntry: LocalizationEntry = {
	kind: 'message',
	key: 'ability.free-melee.summary',
	canonicalEnglish: '{abilityName} | Target: {target}',
	zhTW: zhMessageTemplate,
	approval: 'approved',
	placeholders: [ 'abilityName', 'target' ]
};

const codes = (entries: readonly unknown[], canonical?: Record<string, string>) => {
	return validateLocalizationCatalog(entries, canonical).map(issue => issue.code);
};

describe('catalog validator: a well-formed catalog', () => {
	it('reports nothing for valid entries, including an unapproved draft with no content', () => {
		const entries = [ uiEntry, elementEntry, messageEntry, { ...uiEntry, key: 'hero-edit.cancel', zhTW: '', approval: 'unapproved' } ];

		expect(validateLocalizationCatalog(entries)).toEqual([]);
	});

	it('reports nothing for the production catalog', () => {
		expect(validateLocalizationCatalog(productionLocalizationEntries)).toEqual([]);
	});
});

describe('catalog validator: duplicate or ambiguous identity', () => {
	it('reports two entries claiming the same identity', () => {
		const issues = validateLocalizationCatalog([ uiEntry, { ...uiEntry, zhTW: '測試字串三' } ]);

		expect(issues.map(issue => issue.code)).toEqual([ 'duplicate-identity' ]);
		expect(issues[0].identity).toBe('ui:hero-edit.save-changes');
	});

	it('reports a repeated element field, and accepts different fields of one element', () => {
		expect(codes([ elementEntry, { ...elementEntry } ])).toEqual([ 'duplicate-identity' ]);
		expect(codes([ elementEntry, { ...elementEntry, field: 'target', canonicalEnglish: 'One creature or object' } ])).toEqual([]);
	});
});

describe('catalog validator: canonical English drift', () => {
	it('reports an entry whose snapshot no longer matches the canonical English', () => {
		const issues = validateLocalizationCatalog([ elementEntry ], { 'element:free-melee/name': 'Free Strike (melee, revised)' });

		expect(issues.map(issue => issue.code)).toEqual([ 'canonical-drift' ]);
		expect(issues[0].detail).toContain('Free Strike (melee, revised)');
	});

	it('accepts a snapshot that still matches, and skips identities with no known source', () => {
		expect(codes([ elementEntry ], { 'element:free-melee/name': 'Free Strike (melee)' })).toEqual([]);
		expect(codes([ elementEntry ], { 'element:other/name': 'Something Else' })).toEqual([]);
	});
});

describe('catalog validator: approved entries without content', () => {
	it('reports an approved entry with empty or blank zh-TW content', () => {
		expect(codes([ { ...uiEntry, zhTW: '' } ])).toEqual([ 'approved-without-content' ]);
		expect(codes([ { ...uiEntry, zhTW: ' \t ' } ])).toEqual([ 'approved-without-content' ]);
	});
});

describe('catalog validator: malformed entries', () => {
	it('reports an invalid approval state', () => {
		expect(codes([ { ...uiEntry, approval: 'pending' } ])).toEqual([ 'invalid-entry' ]);
		expect(codes([ { ...uiEntry, approval: undefined } ])).toEqual([ 'invalid-entry' ]);
	});

	it('reports entries that are not usable catalog entries at all', () => {
		expect(codes([ null ])).toEqual([ 'invalid-entry' ]);
		expect(codes([ 'ui:hero-edit.save-changes' ])).toEqual([ 'invalid-entry' ]);
		expect(codes([ [ uiEntry ] ])).toEqual([ 'invalid-entry' ]);
		expect(codes([ { ...uiEntry, kind: 'tooltip' } ])).toEqual([ 'invalid-entry' ]);
	});

	it('reports missing or unusable identity fields', () => {
		expect(codes([ { ...uiEntry, key: '' } ])).toEqual([ 'invalid-entry' ]);
		expect(codes([ { ...elementEntry, elementID: undefined } ])).toEqual([ 'invalid-entry' ]);
		expect(codes([ { ...elementEntry, field: 42 } ])).toEqual([ 'invalid-entry' ]);
	});

	it('reports missing canonical English or unusable content', () => {
		expect(codes([ { ...uiEntry, canonicalEnglish: '' } ])).toEqual([ 'invalid-entry' ]);
		expect(codes([ { ...uiEntry, zhTW: null } ])).toEqual([ 'invalid-entry' ]);
	});

	it('reports an unusable placeholder declaration', () => {
		expect(codes([ { ...messageEntry, placeholders: 'abilityName' } ])).toEqual([ 'invalid-entry' ]);
		expect(codes([ { ...messageEntry, placeholders: [ 'abilityName', 'abilityName' ] } ])).toEqual([ 'invalid-entry' ]);
		expect(codes([ { ...messageEntry, placeholders: [ 'abilityName', '' ] } ])).toEqual([ 'invalid-entry' ]);
	});

	it('stops at the structural problem instead of reporting knock-on issues', () => {
		const issues = validateLocalizationCatalog([ { ...uiEntry, approval: 'pending', zhTW: '' } ]);

		expect(issues.map(issue => issue.code)).toEqual([ 'invalid-entry' ]);
		expect(issues[0].identity).toBe('entry[0]');
	});
});

describe('catalog validator: composed message placeholders', () => {
	it('reports a zh-TW template that drops a declared placeholder', () => {
		const issues = validateLocalizationCatalog([ { ...messageEntry, zhTW: '測試訊息 {abilityName}' } ]);

		expect(issues.map(issue => issue.code)).toEqual([ 'placeholder-mismatch' ]);
		expect(issues[0].detail).toBe('zh-TW template missing {target}');
	});

	it('reports a zh-TW template that adds an undeclared placeholder', () => {
		const issues = validateLocalizationCatalog([ { ...messageEntry, zhTW: '測試訊息 {abilityName} / {target} / {extra}' } ]);

		expect(issues.map(issue => issue.code)).toEqual([ 'placeholder-mismatch' ]);
		expect(issues[0].detail).toBe('zh-TW template unexpected {extra}');
	});

	it('reports a renamed placeholder as both missing and unexpected', () => {
		const issues = validateLocalizationCatalog([ { ...messageEntry, zhTW: '測試訊息 {abilityName} / {goal}' } ]);

		expect(issues.map(issue => issue.code)).toEqual([ 'placeholder-mismatch' ]);
		expect(issues[0].detail).toBe('zh-TW template missing {target} and unexpected {goal}');
	});

	it('reports a canonical English template that no longer matches the declared placeholders', () => {
		const issues = validateLocalizationCatalog([ { ...messageEntry, canonicalEnglish: '{abilityName} | Target: {targets}' } ]);

		expect(issues.map(issue => issue.code)).toEqual([ 'placeholder-mismatch' ]);
		expect(issues[0].detail).toBe('canonical English template missing {target} and unexpected {targets}');
	});

	it('does not raise a placeholder problem for an empty zh-TW template', () => {
		expect(codes([ { ...messageEntry, zhTW: '', approval: 'unapproved' } ])).toEqual([]);
	});
});
