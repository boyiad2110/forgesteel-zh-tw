import { describe, expect, test } from 'vitest';
import { Catalog } from '@/l10n/catalog';
import exceptions from '@/l10n/english-exceptions.json';
import { mapping } from '@/l10n/mapping';
import strings from '@/l10n/generated/zh-TW/strings.json';

// Update only these approved totals when a content batch changes the inventory.
const expectedInventory = {
	mappingKeys: 579,
	forgeSteelStringRows: 105,
	englishExceptions: 11
};

describe('approved localization inventory', () => {
	test('mapping keys match the approved total', () => {
		expect(Object.keys(mapping)).toHaveLength(expectedInventory.mappingKeys);
	});

	test('Forge Steel String rows match the approved total', () => {
		const catalog = strings as Catalog;
		expect(Object.values(catalog).filter(row => row.fs)).toHaveLength(expectedInventory.forgeSteelStringRows);
	});

	test('English exceptions match the approved total', () => {
		expect(Object.keys(exceptions)).toHaveLength(expectedInventory.englishExceptions);
	});
});
