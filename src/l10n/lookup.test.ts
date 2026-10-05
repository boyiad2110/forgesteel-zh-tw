import { Catalog, peekCatalog } from '@/l10n/catalog';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { characteristicNameKey, textAfterCharacteristicSymbol } from '@/l10n/characteristic-text';
import { displayKey, resolveText, translate } from '@/l10n/text';
import { getLanguage, languageLabel, setLanguage, toggleLanguage } from '@/l10n/language';
import { Characteristic } from '@/enums/characteristic';
import { elementScopeFields } from '@/l10n/element-scope';
import exceptions from '@/l10n/english-exceptions.json';
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

	test('bold and code marks still match the original field', () => {
		const slowed = 'When you are slowed, your speed is reduced to 3 instead of 2.';
		const grabbed = 'You can have up to two creatures grabbed at a time.';
		const marked = {
			id: 'human-feature-2-2a',
			fields: [
				{ field: 'name', text: 'Perseverence' },
				{ field: 'description', text: slowed }
			]
		};
		expect(displayKey(undefined, 'When you are **slowed**, your speed is reduced to 3 instead of 2.', marked)).toBe('element:human-feature-2-2a:description');
		expect(displayKey(undefined, 'When you are <strong>slowed</strong>, your speed is reduced to 3 instead of 2.', marked)).toBe('element:human-feature-2-2a:description');
		expect(displayKey(undefined, 'You gain an edge on `Endurance` tests.', {
			id: 'human-feature-2-2b',
			fields: [ { field: 'description', text: 'You gain an edge on Endurance tests.' } ]
		})).toBe('element:human-feature-2-2b:description');
		const grabScope = {
			id: 'time-raider-feature-2-4',
			fields: [ { field: 'description', text: grabbed } ]
		};
		expect(displayKey(undefined, 'You can have up to two creatures **grabbed** at a time.', grabScope)).toBe('element:time-raider-feature-2-4:description');
		expect(displayKey(undefined, 'When you are **slowed**, your speed is reduced to 5 instead of 2.', marked)).toBeUndefined();
		expect(displayKey(undefined, '**Perseverence**', {
			id: 'human-feature-2-2a',
			fields: [
				{ field: 'name', text: 'Perseverence' },
				{ field: 'description', text: 'Perseverence' }
			]
		})).toBeUndefined();
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

	test('the mapping still has the dwarf, hakaan, memonek, and orc Forge Steel keys', () => {
		expect(mapping['element:ancestry-dwarf:name']).toBeDefined();
		expect(mapping['element:ancestry-hakaan:name']).toBeDefined();
		expect(mapping['element:ancestry-memonek:name']).toBeDefined();
		expect(mapping['element:orc-feature-2-2:description']).toBeDefined();
		expect(mapping['element:orc-feature-2-5:description']).toBeDefined();
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

describe('ancestry third batch', () => {
	const catalog = strings as Catalog;

	test('the third batch keys stay mapped', () => {
		expect(mapping['element:ancestry-devil:name']).toBeDefined();
		expect(mapping['element:ancestry-high-elf:name']).toBeDefined();
		expect(mapping['element:ancestry-polder:name']).toBeDefined();
	});

	test('devil, high elf, and polder names use the approved Chinese', () => {
		const rows: [string, string, string, string][] = [
			[ 'element:ancestry-devil:name', 'heroes.ancestries.devil.name', 'Devil', '魔鬼' ],
			[ 'element:ancestry-high-elf:name', 'heroes.ancestries.high-elf.name', 'Elf (high)', '高等精靈' ],
			[ 'element:ancestry-polder:name', 'heroes.ancestries.polder.name', 'Polder', '波德人' ]
		];
		for (const [ key, sheetId, english, zh ] of rows) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
		}
		expect(catalog['heroes.ancestries.high-elf.name'].fs?.zh).toBe('高等精靈');
		expect(catalog['heroes.ancestries.high-elf.name'].zh).toBe('高等精靈');
	});

	test('punctuation and article differences are listed as exceptions', () => {
		expect(exceptions['element:ancestry-devil:description']).toEqual({
			kind: 'punctuation',
			note: 'Forge Steel uses \' - \' where the sheet uses an em dash.'
		});
		expect(exceptions['element:ancestry-high-elf:description']).toEqual({
			kind: 'article',
			note: 'Forge Steel says \'the high elf history\'; the sheet says \'high elf history\'.'
		});
		expect(mapping['element:ancestry-devil:description']?.sheetId).toBe('heroes.ancestries.devil.description.1');
		expect(mapping['element:ancestry-high-elf:description']?.sheetId).toBe('heroes.ancestries.high-elf.description.1');
	});

	test('a trimmed Forge Steel description is the text on screen', () => {
		const rows: [string, string, string, string][] = [
			[
				'element:high-elf-feature-1a:description',
				'heroes.ancestries.high-elf.signature.high-elf-glamor.effect',
				'A magic glamor makes others perceive you as interesting and engaging. This glamor makes you appear and sound slightly different to each creature you meet, since what is engaging differs from creature to creature.',
				'你的魔法魅力會讓人不自覺地被你吸引。由於每個人喜歡的特徵不盡相同，這種魔法魅力會讓你在每個生物眼中呈現出略為不同的外表與聲音。'
			],
			[
				'element:high-elf-feature-2-5:description',
				'heroes.ancestries.high-elf.trait.unstoppable-mind.effect',
				'Your mind allows you to maintain your focus in any situation.',
				'你的心智能讓你在任何情況下保持專注。'
			],
			[
				'element:polder-feature-2:description',
				'heroes.ancestries.polder.signature.small.effect',
				'Your diminutive stature lets you easily get out of — or into — trouble.',
				'你嬌小的身材能讓你更輕易地擺脫（或陷入）麻煩。'
			],
			[
				'element:polder-feature-3-5:description',
				'heroes.ancestries.polder.trait.fearless.effect',
				'Courage is all you know.',
				'你天生勇敢無懼。'
			],
			[
				'element:polder-feature-3-2:description',
				'heroes.ancestries.polder.trait.graceful-retreat.effect',
				'Your small size makes it easier for you to slip away from the fray.',
				'你矮小的體型能讓你更容易從混戰中溜走。'
			],
			[
				'element:devil-feature-2-2:description',
				'heroes.ancestries.devil.trait.beast-legs.effect',
				'Your powerful legs improve your speed. Your Speed is 6.',
				'你強壯的雙腿能讓你跑得更快。你的速度為 6。'
			],
			[
				'element:devil-feature-2-5:description',
				'heroes.ancestries.devil.trait.impressive-horns.effect',
				'Your cherished horns are larger than your average devil’s, and a hardened representation of your force of will. Whenever you make a saving throw, you succeed on a roll of 5 or higher.',
				'你珍愛的雙角比一般魔鬼的更大，是你堅定意志力的象徵。每當你進行豁免時，擲出 5 以上就算成功。'
			]
		];
		for (const [ key, sheetId, english, zh ] of rows) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(catalog[sheetId].fs?.en).toBe(english);
			expect(catalog[sheetId].fs?.zh).toBe(zh);
			expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
		}
	});

	test('the items left in English for this batch are not mapped', () => {
		const unmapped = [
			'element:devil-feature-2-3:name',
			'element:devil-feature-2-3:description',
			'element:high-elf-feature-2-0:name',
			'element:high-elf-feature-2-0:description',
			'element:polder-feature-1:name',
			'element:polder-feature-1:description',
			'element:polder-feature-3-4:name',
			'element:polder-feature-3-4:description',
			'element:devil-feature-2:name',
			'element:high-elf-feature-2:name',
			'element:polder-feature-3:name',
			'element:devil-feature-1a:condition',
			'element:high-elf-feature-2-2:condition',
			'element:high-elf-feature-2-3:condition',
			'element:devil-feature-1b:name',
			'element:devil-feature-2-7b:name'
		];
		for (const key of unmapped) {
			expect(mapping[key]).toBeUndefined();
		}
		expect(Object.keys(mapping).some(key => key.startsWith('element:devil-feature-1b'))).toBe(false);
		expect(Object.keys(mapping).some(key => key.startsWith('element:devil-feature-2-7b'))).toBe(false);
	});
});

describe('ancestry fourth batch', () => {
	const catalog = strings as Catalog;

	test('this batch adds 37 keys', () => {
		expect(Object.keys(mapping)).toHaveLength(170);
		expect(Object.keys(exceptions)).toHaveLength(9);
	});

	test('human, wode elf, and time raider names use the approved Chinese', () => {
		const rows: [string, string, string, string][] = [
			[ 'element:ancestry-human:name', 'heroes.ancestries.human.name', 'Human', '人類' ],
			[ 'element:ancestry-wode-elf:name', 'heroes.ancestries.wode-elf.name', 'Elf (wode)', '幻林精靈' ],
			[ 'element:ancestry-time-raider:name', 'heroes.ancestries.time-raider.name', 'Time Raider', '時空獵手' ]
		];
		for (const [ key, sheetId, english, zh ] of rows) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
		}
		expect(catalog['heroes.ancestries.wode-elf.name'].fs?.zh).toBe('幻林精靈');
		expect(catalog['heroes.ancestries.wode-elf.name'].fs?.en).toBe('Elf (wode)');
	});

	test('punctuation differences are listed as exceptions', () => {
		expect(exceptions['element:human-feature-2-1:name']).toEqual({
			kind: 'punctuation',
			note: 'Forge Steel uses a straight apostrophe in \'Can\'t\'; the sheet uses a curly one.'
		});
		expect(exceptions['element:ancestry-time-raider:description']).toEqual({
			kind: 'punctuation',
			note: 'Forge Steel puts spaces around the em dashes and has no final period.'
		});
		expect(mapping['element:human-feature-2-1:name']?.sheetId).toBe('heroes.ancestries.human.trait.cant-take-hold.name');
		expect(mapping['element:ancestry-time-raider:description']?.sheetId).toBe('heroes.ancestries.time-raider.description.1');
	});

	test('a bolded condition word still resolves the approved Chinese', () => {
		const slowedKey = 'element:human-feature-2-2a:description';
		const slowedId = 'heroes.ancestries.human.trait.perseverance.effect';
		const slowed = 'When you are slowed, your speed is reduced to 3 instead of 2.';
		const slowedBold = 'When you are **slowed**, your speed is reduced to 3 instead of 2.';
		const slowedZh = '若你處於緩速狀態，你的速度會降至 3，而非 2。';
		const grabbedKey = 'element:time-raider-feature-2-4:description';
		const grabbedId = 'heroes.ancestries.time-raider.trait.four-armed-martial-arts.effect';
		const grabbed = 'Your multiple arms let you take on multiple tasks at the same time. Whenever you use the Grab or Knockback maneuver against an adjacent creature, you can target one additional adjacent creature, using the same power roll for both targets. Additionally, you can have up to two creatures grabbed at a time.';
		const grabbedBold = 'Your multiple arms let you take on multiple tasks at the same time. Whenever you use the Grab or Knockback maneuver against an adjacent creature, you can target one additional adjacent creature, using the same power roll for both targets. Additionally, you can have up to two creatures **grabbed** at a time.';
		const grabbedZh = '你的多隻手臂能讓你同時對付多個目標。每當你對 1 個相鄰生物使用擒抱或擊退機動動作時，你可以指定另 1 個相鄰生物作為額外目標，然後對這 2 個目標進行 1 次檢定。此外，你最多可以同時擒抱 2 個生物。';

		expect(displayKey(undefined, slowedBold, { id: 'human-feature-2-2a', fields: [ { field: 'description', text: slowed } ] })).toBe(slowedKey);
		expect(displayKey(undefined, grabbedBold, { id: 'time-raider-feature-2-4', fields: [ { field: 'description', text: grabbed } ] })).toBe(grabbedKey);
		expect(mapping[slowedKey]).toMatchObject({ sheetId: slowedId });
		expect(mapping[grabbedKey]).toMatchObject({ sheetId: grabbedId });
		expect(catalog[slowedId].fs?.zh).toBe(slowedZh);
		expect(catalog[grabbedId].zh).toBe(grabbedZh);
		expect(resolveText('zh-TW', slowedKey, slowedBold, { [slowedKey]: slowedId }, catalog)).toBe(slowedZh);
		expect(resolveText('zh-TW', grabbedKey, grabbedBold, { [grabbedKey]: grabbedId }, catalog)).toBe(grabbedZh);
		expect(resolveText('en', slowedKey, slowedBold, { [slowedKey]: slowedId }, catalog)).toBe(slowedBold);
		expect(resolveText('en', grabbedKey, grabbedBold, { [grabbedKey]: grabbedId }, catalog)).toBe(grabbedBold);
	});

	test('the three Perseverence keys share one Forge Steel row and show 堅持不懈', () => {
		const sheetId = 'heroes.ancestries.human.trait.perseverance.name';
		const keys = [
			'element:human-feature-2-2:name',
			'element:human-feature-2-2a:name',
			'element:human-feature-2-2b:name'
		];
		for (const key of keys) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(resolveText('zh-TW', key, 'Perseverence', { [key]: sheetId }, catalog)).toBe('堅持不懈');
			expect(resolveText('en', key, 'Perseverence', { [key]: sheetId }, catalog)).toBe('Perseverence');
		}
		expect(catalog[sheetId].fs?.en).toBe('Perseverence');
		expect(catalog[sheetId].fs?.zh).toBe('堅持不懈');
	});

	test('a trimmed Forge Steel description is the text on screen', () => {
		const rows: [string, string, string, string][] = [
			[
				'element:human-feature-2-2a:description',
				'heroes.ancestries.human.trait.perseverance.effect',
				'When you are slowed, your speed is reduced to 3 instead of 2.',
				'若你處於緩速狀態，你的速度會降至 3，而非 2。'
			],
			[
				'element:human-feature-2-5:description',
				'heroes.ancestries.human.trait.staying-power.effect',
				'Your human physiology allows you to fight, run, and stay awake longer than others.',
				'人類的生理構造能讓你比其他族群更持久地戰鬥、奔跑和保持清醒。'
			],
			[
				'element:wode-elf-feature-1a:description',
				'heroes.ancestries.wode-elf.signature.wode-elf-glamor.effect',
				'Tests made to search for you while you are hidden take a bane.',
				'當你處於隱藏時，其他生物試圖搜索你的考驗都會承受 1 個劣勢。'
			],
			[
				'element:time-raider-feature-2-2a:description',
				'heroes.ancestries.time-raider.trait.foresight.effect',
				'You automatically know the location of any creature with concealment who isn’t hidden from you within 20, and you negate the usual bane on strikes against such creatures.',
				'你會自動知道 20 格內任何對你具有遮蔽但並未處於隱藏的生物位置，而且當你對這些生物發動打擊時，你會無視通常需要承受的 1 個劣勢。'
			],
			[
				'element:time-raider-feature-2-6:description',
				'heroes.ancestries.time-raider.trait.unstoppable-mind.effect',
				'Your mind allows you to maintain your focus in any situation.',
				'你的心智能讓你在任何情況下保持專注。'
			]
		];
		for (const [ key, sheetId, english, zh ] of rows) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(catalog[sheetId].fs?.en).toBe(english);
			expect(catalog[sheetId].fs?.zh).toBe(zh);
			expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
		}
	});

	test('the items left in English for this batch are not mapped', () => {
		const unmapped = [
			'element:human-feature-1:name',
			'element:human-feature-1:description',
			'element:human-feature-2-3:name',
			'element:human-feature-2-3:description',
			'element:human-feature-2-4:name',
			'element:human-feature-2-4:description',
			'element:wode-elf-feature-2-5:name',
			'element:wode-elf-feature-2-5:description',
			'element:time-raider-feature-2-1:name',
			'element:time-raider-feature-2-1:description',
			'element:time-raider-feature-2-2b:name',
			'element:time-raider-feature-2-2b:description',
			'element:time-raider-feature-2-5-1:name',
			'element:time-raider-feature-2-5-1:description',
			'element:time-raider-feature-2-5-2:name',
			'element:time-raider-feature-2-5-2:description',
			'element:time-raider-feature-2-5-3:name',
			'element:time-raider-feature-2-5-3:description',
			'element:wode-elf-feature-1:description',
			'element:time-raider-feature-2-2:description',
			'element:human-feature-2:name',
			'element:wode-elf-feature-2:name',
			'element:time-raider-feature-2:name',
			'element:wode-elf-feature-2-2:condition',
			'element:time-raider-feature-2-3b:condition'
		];
		for (const key of unmapped) {
			expect(mapping[key]).toBeUndefined();
		}
	});
});
