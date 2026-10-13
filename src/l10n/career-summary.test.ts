import { describe, expect, test } from 'vitest';
import { Catalog } from '@/l10n/catalog';
import { core } from '@/data/sourcebooks/official/core';
import { mapping } from '@/l10n/mapping';
import { resolveText } from '@/l10n/text';
import strings from '@/l10n/generated/zh-TW/strings.json';

const catalog = strings as Catalog;

describe('Career name and description localization', () => {
	test('resolves all 18 official Career names and summaries in both languages', () => {
		expect(core.careers).toHaveLength(18);

		for (const career of core.careers) {
			const slug = career.id.replace(/^career-/, '');
			for (const field of [ 'name', 'description' ] as const) {
				const key = `element:${career.id}:${field}`;
				const sheetId = `heroes.background.career.${slug}.${field}`;
				const row = catalog[sheetId];
				const source = field === 'name' ? career.name : career.description;
				const expectedChinese = row?.fs?.zh || row?.zh;

				expect(mapping[key]?.sheetId).toBe(sheetId);
				expect(row).toBeDefined();
				expect(expectedChinese).toMatch(/[\u3400-\u9fff]/);
				expect(resolveText('zh-TW', key, source, { [key]: sheetId }, catalog)).toBe(expectedChinese);
				expect(resolveText('en', key, source, { [key]: sheetId }, catalog)).toBe(source);
			}
		}
	});
});
