import { describe, expect, it } from 'vitest';

import { LocalizationEntry } from '@/localization/catalog';
import { verifyApprovedTranslationsAgainstCatalog } from '@/localization/test-support/approved-translation-catalog-reconciliation';

const catalogEntry = (key: string, zhTW: string): LocalizationEntry => ({
	kind: 'ui',
	key,
	canonicalEnglish: key,
	zhTW,
	approval: 'approved'
});

describe('approved translation catalog reconciliation', () => {
	it('reconciles a supplied slice by exact identity and whitespace-sensitive zh-TW values', () => {
		const result = verifyApprovedTranslationsAgainstCatalog({
			approvedTranslations: [
				{ identity: 'ui:alpha', zhTW: '甲' },
				{ identity: 'ui:prayer', zhTW: '\n**祈禱。**  ' }
			],
			catalogEntries: [
				catalogEntry('alpha', '甲'),
				catalogEntry('prayer', '\n**祈禱。**  '),
				catalogEntry('outside-slice', '不在本批')
			]
		});

		expect(result).toEqual({
			approvedRecordCount: 2,
			catalogEntryCount: 3,
			reconciledCount: 2,
			issues: []
		});
	});

	it('reports missing, duplicate or ambiguous identities, and exact text mismatches deterministically', () => {
		const result = verifyApprovedTranslationsAgainstCatalog({
			approvedTranslations: [
				{ identity: 'ui:duplicate-approved', zhTW: '甲' },
				{ identity: 'ui:duplicate-approved', zhTW: '乙' },
				{ identity: 'ui:duplicate-catalog', zhTW: '丙' },
				{ identity: 'ui:missing', zhTW: '丁' },
				{ identity: 'ui:mismatch', zhTW: '戊' }
			],
			catalogEntries: [
				catalogEntry('duplicate-catalog', '丙'),
				catalogEntry('duplicate-catalog', '丙'),
				catalogEntry('mismatch', '戊 ')
			]
		});

		expect(result).toEqual({
			approvedRecordCount: 5,
			catalogEntryCount: 3,
			reconciledCount: 0,
			issues: [
				{ type: 'duplicate-approved-identity', identity: 'ui:duplicate-approved' },
				{ type: 'missing-catalog-identity', identity: 'ui:duplicate-approved' },
				{ type: 'duplicate-catalog-identity', identity: 'ui:duplicate-catalog' },
				{ type: 'zh-tw-mismatch', identity: 'ui:mismatch' },
				{ type: 'missing-catalog-identity', identity: 'ui:missing' }
			]
		});
	});
});
