import { Catalog, peekCatalog } from '@/l10n/catalog';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { characteristicNameKey, textAfterCharacteristicSymbol } from '@/l10n/characteristic-text';
import { displayKey, resolveText, translate } from '@/l10n/text';
import { getLanguage, languageLabel, setLanguage, toggleLanguage } from '@/l10n/language';
import { Characteristic } from '@/enums/characteristic';
import { elementScopeFields } from '@/l10n/element-scope';
import glossary from '@/l10n/generated/zh-TW/glossary.json';
import { mapping } from '@/l10n/mapping';
import strings from '@/l10n/generated/zh-TW/strings.json';

const orcKey = 'element:ancestry-orc:name';
const orcSheet = 'heroes.ancestries.orc.name';
const table = { [orcKey]: orcSheet };
const catalog = {
	[orcSheet]: { zh: '歐克', en: 'Orc—', updated: '2026-10-01' }
};

let store: Record<string, string>;

const loadLanguage = async () => {
	vi.resetModules();
	return import('@/l10n/language');
};

beforeEach(() => {
	store = {};
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => (key in store ? store[key] : null),
		setItem: (key: string, value: string) => { store[key] = value; }
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

describe('getLanguage', () => {
	test('defaults to zh-TW when nothing is saved', async () => {
		const language = await loadLanguage();
		expect(language.getLanguage()).toBe('zh-TW');
	});

	test('returns a saved choice', async () => {
		const language = await loadLanguage();
		store['forgesteel-language'] = 'en';
		expect(language.getLanguage()).toBe('en');
	});

	test('falls back to zh-TW when the saved value is not recognised', async () => {
		const language = await loadLanguage();
		store['forgesteel-language'] = 'zh';
		expect(language.getLanguage()).toBe('zh-TW');
	});
});

describe('setLanguage', () => {
	test('stores the choice under forgesteel-language', () => {
		setLanguage('en');
		expect(store['forgesteel-language']).toBe('en');
		expect(getLanguage()).toBe('en');

		setLanguage('zh-TW');
		expect(store['forgesteel-language']).toBe('zh-TW');
		expect(getLanguage()).toBe('zh-TW');
	});

	test('toggle flips between the two languages', () => {
		expect(getLanguage()).toBe('zh-TW');
		toggleLanguage();
		expect(getLanguage()).toBe('en');
		toggleLanguage();
		expect(getLanguage()).toBe('zh-TW');
	});
});

describe('languageLabel', () => {
	test('names the language that is currently showing', () => {
		expect(languageLabel('zh-TW')).toBe('中文');
		expect(languageLabel('en')).toBe('EN');
	});
});

describe('resolveText', () => {
	test('returns the original string from an empty table in both languages', () => {
		expect(resolveText('zh-TW', orcKey, 'Orc', {}, null)).toBe('Orc');
		expect(resolveText('en', orcKey, 'Orc', {}, catalog)).toBe('Orc');
	});

	test('returns the translation only in zh-TW when the table hits', () => {
		expect(resolveText('zh-TW', orcKey, 'Orc', table, catalog)).toBe('歐克');
	});

	test('English mode returns the original string even when the table has a row', () => {
		expect(resolveText('en', orcKey, 'Orc', table, catalog)).toBe('Orc');
	});

	test('a blank translation stays on the original string', () => {
		const blank = { [orcSheet]: { zh: '   ', en: 'Orc—', updated: '2026-10-01' } };
		expect(resolveText('zh-TW', orcKey, 'Orc', table, blank)).toBe('Orc');
	});

	test('a missing sheet row stays on the original string', () => {
		expect(resolveText('zh-TW', orcKey, 'Orc', table, {})).toBe('Orc');
		expect(resolveText('zh-TW', undefined, 'Orc', table, catalog)).toBe('Orc');
	});

	test('a titled rules row drops the heading only in zh-TW', () => {
		const key = 'data:ConditionData:bleeding';
		const sheetId = 'heroes.conditions.bleeding.rules';
		const english = '\nWhile bleeding.';
		const rules = {
			[sheetId]: { zh: '出血\n\n規則', en: 'Bleeding\n\nWhile bleeding.', updated: '2026-10-01' }
		};
		const rulesTable = { [key]: sheetId };
		expect(resolveText('zh-TW', key, english, rulesTable, rules, true)).toBe('規則');
		expect(resolveText('en', key, english, rulesTable, rules, true)).toBe(english);
	});

	test('a rules row without a heading stays on the original string', () => {
		const key = 'data:ConditionData:bleeding';
		const sheetId = 'heroes.conditions.bleeding.rules';
		const rules = {
			[sheetId]: { zh: '規則', en: 'While bleeding.', updated: '2026-10-01' }
		};
		expect(resolveText('zh-TW', key, '\nWhile bleeding.', { [key]: sheetId }, rules, true)).toBe('\nWhile bleeding.');
	});

	test('a Forge Steel version is preferred in zh-TW and ignored in English', () => {
		const row = {
			zh: '書本全文。你的穩度 +1。',
			en: 'Book English. You have a +1 bonus to stability.',
			updated: '2026-10-01',
			fs: { basisHash: 'a'.repeat(64), en: 'Book English.', zh: '書本全文。' }
		};
		const withFs = { [orcSheet]: row };
		expect(resolveText('zh-TW', orcKey, 'Book English.', table, withFs)).toBe('書本全文。');
		expect(resolveText('en', orcKey, 'Book English.', table, withFs)).toBe('Book English.');
	});

	test('a blank Forge Steel version stays on the original English', () => {
		const row = {
			zh: '書本全文。',
			en: 'Book English.',
			updated: '2026-10-01',
			fs: { basisHash: 'a'.repeat(64), en: 'Book English.', zh: '   ' }
		};
		expect(resolveText('zh-TW', orcKey, 'Book English.', table, { [orcSheet]: row })).toBe('Book English.');
	});

	test('a row without a Forge Steel version still uses the book Chinese', () => {
		expect(resolveText('zh-TW', orcKey, 'Orc', table, catalog)).toBe('歐克');
	});
});

describe('displayKey', () => {
	const scope = {
		id: 'ancestry-orc',
		fields: [ { field: 'name', text: 'Orc' }, { field: 'description', text: 'An anger.' } ]
	};

	test('an explicit key wins', () => {
		expect(displayKey('ui:library', 'Orc', scope)).toBe('ui:library');
	});

	test('a single matching field becomes an element key', () => {
		expect(displayKey(undefined, 'Orc', scope)).toBe('element:ancestry-orc:name');
	});

	test('no scope, no match, or two matches produce no key', () => {
		expect(displayKey(undefined, 'Orc', null)).toBeUndefined();
		expect(displayKey(undefined, 'Unnamed Ancestry', scope)).toBeUndefined();
		const doubled = {
			id: 'ancestry-orc',
			fields: [ { field: 'name', text: 'Orc' }, { field: 'title', text: 'Orc' } ]
		};
		expect(displayKey(undefined, 'Orc', doubled)).toBeUndefined();
	});
});

describe('translate', () => {
	test('an unmapped key returns the original string and does not load JSON', () => {
		setLanguage('zh-TW');
		expect(translate(orcKey, 'Orc')).toBe('Orc');
		setLanguage('en');
		expect(translate(orcKey, 'Orc')).toBe('Orc');
		expect(peekCatalog()).toBeNull();
	});
});

describe('characteristic names', () => {
	const rows: { characteristic: Characteristic, sheetId: string }[] = [
		{ characteristic: Characteristic.Might, sheetId: 'term.might' },
		{ characteristic: Characteristic.Agility, sheetId: 'term.agility' },
		{ characteristic: Characteristic.Reason, sheetId: 'term.reason' },
		{ characteristic: Characteristic.Intuition, sheetId: 'term.intuition' },
		{ characteristic: Characteristic.Presence, sheetId: 'term.presence' }
	];

	test('zh-TW uses the approved glossary name and English mode keeps the enum', () => {
		const catalog = glossary as Catalog;
		for (const row of rows) {
			const key = characteristicNameKey(row.characteristic);
			expect(key).toBe(`enum:Characteristic:${row.characteristic}`);
			expect(mapping[key!]).toMatchObject({ sheetId: row.sheetId });
			const sheet = catalog[row.sheetId];
			expect(sheet.en).toBe(row.characteristic);
			expect(sheet.zh.trim().length).toBeGreaterThan(0);
			expect(sheet.zh).not.toBe(row.characteristic);
			const table = { [key!]: row.sheetId };
			expect(resolveText('zh-TW', key, row.characteristic, table, catalog)).toBe(sheet.zh);
			expect(resolveText('en', key, row.characteristic, table, catalog)).toBe(row.characteristic);
			expect(textAfterCharacteristicSymbol(row.characteristic, row.characteristic)).toBe(row.characteristic.substring(1));
			expect(textAfterCharacteristicSymbol(row.characteristic, sheet.zh)).toBe(sheet.zh);
		}
	});
});

describe('element scope', () => {
	const catalog = strings as Catalog;
	const relentless = 'Whenever a creature deals damage to you that leaves you dying, you can make a free strike against any creature. If the creature is reduced to 0 Stamina by your strike, you can spend a Recovery.';
	const feature = {
		id: 'orc-feature-1',
		name: 'Relentless',
		description: relentless
	};

	test('a matching field becomes an element key and resolves the approved row', () => {
		const key = 'element:ancestry-orc:name';
		const sheetId = 'heroes.ancestries.orc.name';
		const scope = {
			id: 'ancestry-orc',
			fields: elementScopeFields({ id: 'ancestry-orc', name: 'Orc', description: 'An anger.' })
		};

		expect(displayKey(undefined, 'Orc', scope)).toBe(key);
		expect(mapping[key]).toMatchObject({ sheetId });
		expect(resolveText('zh-TW', key, 'Orc', { [key]: sheetId }, catalog)).toBe(catalog[sheetId].zh);
		expect(resolveText('en', key, 'Orc', { [key]: sheetId }, catalog)).toBe('Orc');
	});

	test('a renamed feature and computed text fall back to the English on screen', () => {
		const scope = { id: feature.id, fields: elementScopeFields(feature) };
		const renamed = 'My Trait';
		const computed = `${relentless} The strike deals 5 damage.`;

		expect(displayKey(undefined, feature.name, scope)).toBe('element:orc-feature-1:name');
		expect(displayKey(undefined, renamed, scope)).toBeUndefined();
		expect(displayKey(undefined, computed, scope)).toBeUndefined();
		expect(resolveText('zh-TW', undefined, renamed, { 'element:orc-feature-1:name': mapping['element:orc-feature-1:name'].sheetId }, catalog)).toBe(renamed);
		expect(resolveText('zh-TW', undefined, computed, {}, catalog)).toBe(computed);
	});

	test('a customization overlay drops the replaced field and keeps the other', () => {
		const fields = elementScopeFields(feature, { name: 'My Trait', description: '' });
		const scope = { id: feature.id, fields };

		expect(displayKey(undefined, 'My Trait', scope)).toBeUndefined();
		expect(displayKey(undefined, feature.name, scope)).toBeUndefined();
		expect(displayKey(undefined, feature.description, scope)).toBe('element:orc-feature-1:description');
	});

	test('Purchased Traits stays in English', () => {
		expect(mapping['element:orc-feature-2:name']).toBeUndefined();
		expect(mapping['element:dwarf-feature-2:name']).toBeUndefined();
		expect(mapping['element:hakaan-feature-2:name']).toBeUndefined();
		expect(mapping['element:memonek-feature-3:name']).toBeUndefined();
	});

	test('orc grounded and nonstop descriptions use the Forge Steel Chinese', () => {
		const groundedKey = 'element:orc-feature-2-2:description';
		const nonstopKey = 'element:orc-feature-2-5:description';
		const groundedId = 'heroes.ancestries.orc.trait.grounded.effect';
		const nonstopId = 'heroes.ancestries.orc.trait.nonstop.effect';
		const groundedEnglish = 'The magic in your blood makes it difficult for others to move you.';
		const nonstopEnglish = 'Your bloodfire supplies you with a constant rush of adrenaline.';
		expect(mapping[groundedKey]).toMatchObject({ sheetId: groundedId });
		expect(mapping[nonstopKey]).toMatchObject({ sheetId: nonstopId });
		expect(catalog[groundedId].fs?.zh).toBe('你血液中的魔力讓他人難以移動你。');
		expect(catalog[nonstopId].fs?.zh).toBe('你的血焰讓你的腎上腺素持續翻湧。');
		expect(resolveText('zh-TW', groundedKey, groundedEnglish, { [groundedKey]: groundedId }, catalog)).toBe('你血液中的魔力讓他人難以移動你。');
		expect(resolveText('zh-TW', nonstopKey, nonstopEnglish, { [nonstopKey]: nonstopId }, catalog)).toBe('你的血焰讓你的腎上腺素持續翻湧。');
		expect(resolveText('en', groundedKey, groundedEnglish, { [groundedKey]: groundedId }, catalog)).toBe(groundedEnglish);
		expect(resolveText('en', nonstopKey, nonstopEnglish, { [nonstopKey]: nonstopId }, catalog)).toBe(nonstopEnglish);
	});
});

describe('ancestry continuation', () => {
	const catalog = strings as Catalog;

	test('the mapping gained the dwarf, hakaan, memonek, and orc Forge Steel keys', () => {
		expect(Object.keys(mapping)).toHaveLength(88);
	});

	test('dwarf, hakaan, and memonek names use the approved rows', () => {
		const rows: [string, string, string, string][] = [
			[ 'element:ancestry-dwarf:name', 'heroes.ancestries.dwarf.name', 'Dwarf', '矮人' ],
			[ 'element:ancestry-hakaan:name', 'heroes.ancestries.hakaan.name', 'Hakaan', '哈肯人' ],
			[ 'element:ancestry-memonek:name', 'heroes.ancestries.memonek.name', 'Memonek', '梅莫人' ]
		];
		for (const [ key, sheetId, english, zh ] of rows) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
		}
	});

	test('a trimmed Forge Steel description is the text on screen', () => {
		const key = 'element:dwarf-feature-2-1:description';
		const sheetId = 'heroes.ancestries.dwarf.trait.grounded.effect';
		const english = 'Your heavy stone body and connection to the earth make it difficult for others to move you.';
		expect(mapping[key]).toMatchObject({ sheetId });
		expect(catalog[sheetId].fs?.zh).toBe('你岩石般的厚重身軀與大地緊密相連，讓他人難以移動你。');
		expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(catalog[sheetId].fs?.zh);
		expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
	});

	test('the items left in English for this batch are not mapped', () => {
		const unmapped = [
			'element:memonek-feature-3-5:name',
			'element:memonek-feature-3-5:description',
			'element:dwarf-feature-1:description',
			'element:ancestry-hakaan:description',
			'element:hakaan-feature-2-5:description',
			'element:dwarf-feature-2-2b:condition',
			'element:hakaan-feature-2-1:condition',
			'element:hakaan-feature-2-3b:condition',
			'element:memonek-feature-3-2b:condition',
			'element:hakaan-feature-2-2a:name',
			'element:hakaan-feature-2-2b:name',
			'element:hakaan-feature-2-2c:name'
		];
		for (const key of unmapped) {
			expect(mapping[key]).toBeUndefined();
		}
	});
});
