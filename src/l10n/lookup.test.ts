import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { displayKey, resolveText, translate } from '@/l10n/text';
import { getLanguage, languageLabel, setLanguage, toggleLanguage } from '@/l10n/language';
import { peekCatalog } from '@/l10n/catalog';

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
	test('the empty mapping table returns the original string and does not load JSON', () => {
		setLanguage('zh-TW');
		expect(translate(orcKey, 'Orc')).toBe('Orc');
		setLanguage('en');
		expect(translate(orcKey, 'Orc')).toBe('Orc');
		expect(peekCatalog()).toBeNull();
	});
});
