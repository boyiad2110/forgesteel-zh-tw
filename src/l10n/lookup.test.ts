import { Catalog, loadCatalog, peekCatalog } from '@/l10n/catalog';
import { EnvironmentData, OrganizationData, UpbringingData } from '@/data/culture-data';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { characteristicNameKey, textAfterCharacteristicSymbol } from '@/l10n/characteristic-text';
import { displayKey, resolveText, translate } from '@/l10n/text';
import { getLanguage, languageLabel, setLanguage, toggleLanguage } from '@/l10n/language';
import { skillListKey, skillNameKey, useSkillListNames } from '@/l10n/skill-text';
import { Characteristic } from '@/enums/characteristic';
import { core } from '@/data/sourcebooks/official/core';
import { createElement } from 'react';
import { elementScopeFields } from '@/l10n/element-scope';
import exceptions from '@/l10n/english-exceptions.json';
import glossary from '@/l10n/generated/zh-TW/glossary.json';
import { languageNameKey } from '@/l10n/language-text';
import { mapping } from '@/l10n/mapping';
import names from '@/l10n/generated/zh-TW/names.json';
import { orden } from '@/data/sourcebooks/official/orden';
import { renderToStaticMarkup } from 'react-dom/server';
import strings from '@/l10n/generated/zh-TW/strings.json';
import { useLanguageNames } from '@/l10n/language-text';

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

	test('english exceptions stay at ten', () => {
		expect(Object.keys(exceptions)).toHaveLength(10);
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
		const slowedZh = '若你處於**緩速**狀態，你的速度會降至 3，而非 2。';
		const grabbedKey = 'element:time-raider-feature-2-4:description';
		const grabbedId = 'heroes.ancestries.time-raider.trait.four-armed-martial-arts.effect';
		const grabbed = 'Your multiple arms let you take on multiple tasks at the same time. Whenever you use the Grab or Knockback maneuver against an adjacent creature, you can target one additional adjacent creature, using the same power roll for both targets. Additionally, you can have up to two creatures grabbed at a time.';
		const grabbedBold = 'Your multiple arms let you take on multiple tasks at the same time. Whenever you use the Grab or Knockback maneuver against an adjacent creature, you can target one additional adjacent creature, using the same power roll for both targets. Additionally, you can have up to two creatures **grabbed** at a time.';
		const grabbedZh = '你的多隻手臂能讓你同時對付多個目標。每當你對 1 個相鄰生物使用擒抱或擊退機動動作時，你可以指定另 1 個相鄰生物作為額外目標，然後對這 2 個目標進行 1 次檢定。此外，你最多可以同時**擒抱** 2 個生物。';

		expect(displayKey(undefined, slowedBold, { id: 'human-feature-2-2a', fields: [ { field: 'description', text: slowed } ] })).toBe(slowedKey);
		expect(displayKey(undefined, grabbedBold, { id: 'time-raider-feature-2-4', fields: [ { field: 'description', text: grabbed } ] })).toBe(grabbedKey);
		expect(mapping[slowedKey]).toMatchObject({ sheetId: slowedId });
		expect(mapping[grabbedKey]).toMatchObject({ sheetId: grabbedId });
		expect(catalog[slowedId].fs?.zh).toBe('若你處於緩速狀態，你的速度會降至 3，而非 2。');
		expect(catalog[grabbedId].zh).toBe('你的多隻手臂能讓你同時對付多個目標。每當你對 1 個相鄰生物使用擒抱或擊退機動動作時，你可以指定另 1 個相鄰生物作為額外目標，然後對這 2 個目標進行 1 次檢定。此外，你最多可以同時擒抱 2 個生物。');
		expect(resolveText('zh-TW', slowedKey, slowedBold, { [slowedKey]: slowedId }, catalog)).toBe(slowedZh);
		expect(resolveText('zh-TW', grabbedKey, grabbedBold, { [grabbedKey]: grabbedId }, catalog)).toBe(grabbedZh);
		expect(resolveText('zh-TW', slowedKey, 'When you are <strong>slowed</strong>, your speed is reduced to 3 instead of 2.', { [slowedKey]: slowedId }, catalog)).toBe(slowedZh);
		expect(resolveText('en', slowedKey, slowedBold, { [slowedKey]: slowedId }, catalog)).toBe(slowedBold);
		expect(resolveText('en', grabbedKey, grabbedBold, { [grabbedKey]: grabbedId }, catalog)).toBe(grabbedBold);
		expect(grabbedZh.includes('使用擒抱或擊退')).toBe(true);
		expect(grabbedZh.includes('使用**擒抱**或擊退')).toBe(false);

		const plain = { zh: '沒有那個詞。', en: 'none', updated: '2026-10-01' };
		const doubled = { zh: '緩速，然後又緩速。', en: 'slowed', updated: '2026-10-01' };
		expect(resolveText('zh-TW', 'element:plain:description', 'You are **slowed**.', { 'element:plain:description': 'id.plain' }, { 'id.plain': plain })).toBe('沒有那個詞。');
		expect(resolveText('zh-TW', 'element:doubled:description', 'You are **slowed**.', { 'element:doubled:description': 'id.doubled' }, { 'id.doubled': doubled })).toBe('緩速，然後又緩速。');
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

describe('ancestry fifth batch', () => {
	const catalog = strings as Catalog;

	test('english exceptions stay at ten', () => {
		expect(Object.keys(exceptions)).toHaveLength(10);
	});

	test('revenant and dragon knight names use the approved Chinese', () => {
		const rows: [string, string, string, string][] = [
			[ 'element:ancestry-revenant:name', 'heroes.ancestries.revenant.name', 'Revenant', '還魂屍' ],
			[ 'element:ancestry-dragon-knight:name', 'heroes.ancestries.dragon-knight.name', 'Dragon Knight', '龍騎士' ],
			[ 'element:revenant-feature-1:name', 'heroes.ancestries.revenant.signature.former-life.name', 'Former Life', '昔日人生' ],
			[ 'element:revenant-feature-3:name', 'heroes.ancestries.revenant.signature.tough-but-withered.name', 'Tough But Withered', '枯而不朽' ],
			[ 'element:revenant-feature-4-2:name', 'heroes.ancestries.revenant.trait.undead-influence.name', 'Undead Influence', '亡靈威儀' ],
			[ 'element:revenant-feature-4-3:name', 'heroes.ancestries.revenant.trait.bloodless.name', 'Bloodless', '無血之軀' ],
			[ 'element:dragon-knight-feature-1:name', 'heroes.ancestries.dragon-knight.signature.wyrmplate.name', 'Wyrmplate', '龍鱗' ]
		];
		for (const [ key, sheetId, english, zh ] of rows) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
		}
	});

	test('shared trait names resolve from one sheet row', () => {
		const vengeance = 'heroes.ancestries.revenant.trait.vengeance-mark.name';
		for (const key of [ 'element:revenant-feature-4-5:name', 'element:revenant-feature-4-5-1:name' ]) {
			expect(mapping[key]).toMatchObject({ sheetId: vengeance });
			expect(resolveText('zh-TW', key, 'Vengeance Mark', { [key]: vengeance }, catalog)).toBe('復仇符印');
		}
		const wings = 'heroes.ancestries.dragon-knight.trait.wings.name';
		for (const key of [ 'element:dragon-knight-feature-2-11:name', 'element:dragon-knight-feature-2-11a:name' ]) {
			expect(mapping[key]).toMatchObject({ sheetId: wings });
			expect(resolveText('zh-TW', key, 'Wings', { [key]: wings }, catalog)).toBe('飛翼');
		}
	});

	test('a directly matching description uses the book Chinese', () => {
		const rows: [string, string, string, string][] = [
			[
				'element:ancestry-dragon-knight:description',
				'heroes.ancestries.dragon-knight.description.1',
				'The ritual of Dracogenesis that grants the power to create a generation of dragon knights—also known as draconians or wyrmwights—is obscure and supremely difficult for even an experienced sorcerer to master. Small populations of draconians in Khemhara, Higara, and Khoursir attest to this. Descendants of original generations created millennia ago by powerful wizards, they have never been numerous. A typical clutch yields only a single egg. After only a few generations, these draconians begin to show new adaptations like feathers or frilled ridges.',
				'能夠創造龍騎士（又名為龍人或龍裔）的龍生儀式極為晦澀，即使是經驗豐富的術士也難以掌握。即使在凱姆哈拉、希伽拉和科爾瑟地區也只有少數龍人出沒，證明了這種儀式有多困難。這些龍人源自強大巫師於千年前創造的原始世代，生育率極低，一窩只會產下一顆蛋，因此族群數量一直未能壯大。短短幾代後，這些龍人便開始展現新的適應特徵，例如羽毛或突脊。'
			],
			[
				'element:revenant-feature-1:description',
				'heroes.ancestries.revenant.signature.former-life.effect',
				'Choose the ancestry you were before you died. Your size is that ancestry’s size and your speed is 5. Unless you select one of the Previous Life traits (see below), you don’t receive any other ancestral traits from your original ancestry.',
				'選擇你死前的族裔。你的體型與原族裔相同，速度為 5。除非你選擇【前世特性】，否則你不會獲得原族裔的任何族裔特性。'
			],
			[
				'element:dragon-knight-feature-1:description',
				'heroes.ancestries.dragon-knight.signature.wyrmplate.effect',
				'Your hardened scales grant you damage immunity equal to your level to one of the following damage types: acid, cold, corruption, fire, lightning, or poison. You can change your damage immunity type when you finish a respite.',
				'你堅硬的鱗片會提供以下其中 1 種傷害類型的免疫（免疫值等於你的等級）：酸蝕、寒冷、腐朽、火焰、閃電、毒素。每次完成休整時，你可以更改傷害免疫的類型。'
			]
		];
		for (const [ key, sheetId, english, zh ] of rows) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(catalog[sheetId].fs).toBeUndefined();
			expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
		}
	});

	test('Forge Steel versions are the text on screen', () => {
		const revenantDescription = 'The dead walk among us. Some of them are happier about it than others. Unlike the necromantic rituals that produce wights and wraiths and zombies, revenants rise from the grave through a combination of an unjust death and a burning desire for vengeance. Creatures sustained on pure will, they have no need of food or water or air - and, unlike their zombified cousins, they retain all their memories and personality from life.';
		const revenantZh = '死者行走在我們之間，但不是所有死者都樂於接受這種情況。不同於製造屍妖、怨靈和殭屍的死靈儀式，還魂屍是因為枉死與強烈的復仇心而從墳墓中爬出來。他們之所以能夠存在於世上，不是依靠食物、水或空氣，而是純粹的意志力。與殭屍不同的是，還魂屍保留了生前的所有記憶和個性。';
		const inert = 'When your Stamina reaches the negative of your winded value, you become inert instead of dying. You fall prone and can’t stand. You continue to observe your surroundings, but you can’t speak, take main actions, maneuvers, move actions, or triggered actions. While inert this way, if you take any fire damage, your body is destroyed and you die. Otherwise, after 12 hours, you regain Stamina equal to your recovery value.';
		const inertZh = '當你的體力降至疲態值的負數時，你會陷入呆滯，而非死亡。你會伏地且無法起身。你能繼續觀察周圍環境，但無法說話，也無法執行主要動作、機動動作、移動動作和反應動作。在這種呆滯狀態下，若你受到任何火焰傷害，你的軀體就會被摧毀，你也會真正死亡。否則，在 12 小時後，你會恢復等於你復元值的體力。';
		const bloodless = 'For you, an open wound is indistinguishable from a scratch.';
		const bloodlessZh = '對你而言，開放性傷口與輕微擦傷沒有區別。';
		const sigil = 'As a maneuver, you place a magic sigil on a creature within 10 squares of you. When you place a sigil, you can decide where it appears on the creature’s body, and whether the sigil is visible to only you or to all creatures.\n\nYou always know the direction to the exact location of a creature who bears one of your sigils and is on the same world. You can have an active number of sigils equal to your level, and can remove a sigil from a creature at will (no action required). If you already have the maximum number of sigils activated and you place a new one, your oldest sigil disappears with no other effect.';
		const sigilZh = '使用機動動作，你可以在 10 格內的 1 個生物身上放置 1 個魔法符印。放置符印時，你可以決定符印出現在生物身體的哪個位置，以及符印是只有你看得見，還是所有生物都看得見。\n\n你始終知道相同世界中帶有你符印之生物的位置方向。你最多可以擁有數量等於你等級的符印，並且可以隨意解除生物身上的符印（無需動作）。若你在符印數量已滿的情況下放置新的符印，最舊的符印就會消失，不會產生任何效果。';
		const wings = 'You possess wings powerful enough to take you airborne. While using your wings to fly, you can stay aloft for a number of rounds equal to your Might (minimum of 1 round) before you fall prone. While using your wings to fly at 1st, 2nd, and 3rd level, you have damage weakness 5.';
		const wingsZh = '你強壯的翅膀能帶你飛上天空。當你使用翅膀飛行時，你最多可以在空中停留等於你力量的輪數（至少 1 輪），之後就會墜落。若你在 3 級以下使用翅膀飛行，你會擁有傷害弱點 5。';
		const rows: [string, string, string, string][] = [
			[ 'element:ancestry-revenant:description', 'heroes.ancestries.revenant.description.1', revenantDescription, revenantZh ],
			[ 'element:revenant-feature-3:description', 'heroes.ancestries.revenant.signature.tough-but-withered.effect.2', inert, inertZh ],
			[ 'element:revenant-feature-4-3:description', 'heroes.ancestries.revenant.trait.bloodless.effect', bloodless, bloodlessZh ],
			[ 'element:revenant-feature-4-5-1:description', 'heroes.ancestries.revenant.trait.vengeance-mark.effect.1', sigil, sigilZh ],
			[ 'element:dragon-knight-feature-2-11a:description', 'heroes.ancestries.dragon-knight.trait.wings.effect', wings, wingsZh ]
		];
		for (const [ key, sheetId, english, zh ] of rows) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(catalog[sheetId].fs?.en).toBe(english);
			expect(catalog[sheetId].fs?.zh).toBe(zh);
			expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
		}
		expect(catalog['heroes.ancestries.revenant.description.1'].zh).toBe('死者行走在我們之間，但不是所有死者都樂於接受這種情況。');
		expect(revenantZh.startsWith(catalog['heroes.ancestries.revenant.description.1'].zh)).toBe(true);
		expect(catalog['heroes.ancestries.revenant.trait.bloodless.effect'].zh).toContain('你不會陷入出血狀態');
		expect(bloodlessZh.includes('出血')).toBe(false);
		expect(sigilZh.includes('\n\n')).toBe(true);
		expect(inertZh.startsWith('此外')).toBe(false);
	});

	test('the items left in English for this batch are not mapped', () => {
		const unmapped = [
			'element:revenant-feature-4-5-2:name',
			'element:revenant-feature-4-5-2:description',
			'element:dragon-knight-feature-2-1:name',
			'element:dragon-knight-feature-2-1:description',
			'element:dragon-knight-feature-2-8:name',
			'element:dragon-knight-feature-2-9:name',
			'element:dragon-knight-feature-2-9:description',
			'element:dragon-knight-feature-2-10:name',
			'element:dragon-knight-feature-2-10:description',
			'element:dragon-knight-feature-2-2:name',
			'element:dragon-knight-feature-2-3:name',
			'element:dragon-knight-feature-2-4:name',
			'element:dragon-knight-feature-2-5:name',
			'element:dragon-knight-feature-2-6:name',
			'element:dragon-knight-feature-2-7:name',
			'element:revenant-feature-4:name',
			'element:dragon-knight-feature-2:name',
			'element:revenant-feature-4-2:condition'
		];
		for (const key of unmapped) {
			expect(mapping[key]).toBeUndefined();
		}
		const generated = [
			'revenant-feature-2',
			'revenant-feature-4-1',
			'revenant-feature-4-4',
			'dragon-knight-feature-1-1',
			'dragon-knight-feature-1-2',
			'dragon-knight-feature-1-3',
			'dragon-knight-feature-1-4',
			'dragon-knight-feature-1-5',
			'dragon-knight-feature-1-6',
			'dragon-knight-feature-2-11b'
		];
		for (const id of generated) {
			expect(Object.keys(mapping).some(key => key.startsWith(`element:${id}:`))).toBe(false);
		}
	});
});

describe('culture first batch', () => {
	const catalog = strings as Catalog;

	test('english exceptions stay at ten', () => {
		expect(Object.keys(exceptions)).toHaveLength(10);
	});

	test('the 13 aspect names and first-sentence descriptions use the approved Chinese', () => {
		const rows: [ { id: string, name: string, description: string }, string, string, string ][] = [
			[ EnvironmentData.nomadic, 'heroes.background.culture.environment.nomadic', '遊牧', '遊牧文化為了生存而不斷從一個地方遷移到另一個地方。' ],
			[ EnvironmentData.rural, 'heroes.background.culture.environment.rural', '鄉村', '鄉村文化存在於小鎮、村莊或更小的聚落。' ],
			[ EnvironmentData.secluded, 'heroes.background.culture.environment.secluded', '隱居', '隱居文化存在於單一且相對狹小的結構中（例如建築物或洞穴），幾乎不會與外界文化有所互動。' ],
			[ EnvironmentData.urban, 'heroes.background.culture.environment.urban', '城市', '城市文化始終以城市為中心。' ],
			[ EnvironmentData.wilderness, 'heroes.background.culture.environment.wilderness', '荒野', '荒野文化的人民不會試圖征服他們居住的地方，無論是沙漠、森林、沼澤、凍原、海洋，還是更特殊的環境。' ],
			[ OrganizationData.bureaucratic, 'heroes.background.culture.organization.bureaucratic', '官僚', '官僚文化深深根植於正式的領導制度與成文法律。' ],
			[ OrganizationData.communal, 'heroes.background.culture.organization.communal', '平權', '平權文化是一個所有成員皆平等的地方。' ],
			[ UpbringingData.academic, 'heroes.background.culture.upbringing.academic', '學術', '你的英雄由那些收藏、研讀並分享書籍與其他紀錄的人們撫養長大。' ],
			[ UpbringingData.creative, 'heroes.background.culture.upbringing.creative', '創作', '擁有創作成長經歷的英雄是在善於創作藝術或其他具有交易價值作品的群體中長大的。' ],
			[ UpbringingData.lawless, 'heroes.background.culture.upbringing.lawless', '法外', '你的英雄在一群從事被他人（無論在其文化內外）視為非法活動的人們中長大。' ],
			[ UpbringingData.labor, 'heroes.background.culture.upbringing.labor', '勞動', '你的英雄成長於一個靠勞動為生的文化中。' ],
			[ UpbringingData.martial, 'heroes.background.culture.upbringing.martial', '尚武', '擁有尚武成長經歷的英雄從小在戰士的薰陶下成長。' ],
			[ UpbringingData.noble, 'heroes.background.culture.upbringing.noble', '貴族', '你的英雄成長於那些統治他人並運用政治手段維持權力的領導者之中。' ]
		];
		for (const [ feature, sheetBase, nameZh, descZh ] of rows) {
			const nameKey = `element:${feature.id}:name`;
			const descKey = `element:${feature.id}:description`;
			const nameId = `${sheetBase}.name`;
			const descId = `${sheetBase}.description`;
			expect(mapping[nameKey]).toMatchObject({ sheetId: nameId });
			expect(catalog[nameId].fs).toBeUndefined();
			expect(resolveText('zh-TW', nameKey, feature.name, { [nameKey]: nameId }, catalog)).toBe(nameZh);
			expect(resolveText('en', nameKey, feature.name, { [nameKey]: nameId }, catalog)).toBe(feature.name);
			expect(mapping[descKey]).toMatchObject({ sheetId: descId });
			expect(catalog[descId].fs?.en).toBe(feature.description);
			expect(catalog[descId].fs?.zh).toBe(descZh);
			expect(catalog[descId].zh.startsWith(descZh.replace(/。$/, ''))).toBe(true);
			expect(resolveText('zh-TW', descKey, feature.description, { [descKey]: descId }, catalog)).toBe(descZh);
			expect(resolveText('en', descKey, feature.description, { [descKey]: descId }, catalog)).toBe(feature.description);
		}
		const communal = catalog['heroes.background.culture.organization.communal.description'];
		expect(communal.zh).toContain('，社群會共同做出影響多數成員的重要決策');
		expect(communal.fs?.zh.includes('社群會共同做出')).toBe(false);
	});

	test('languages, skill options, and cultures outside this batch stay unmapped', () => {
		expect(mapping['element:culture-bespoke-culture:name']).toBeUndefined();
		expect(mapping['element:culture-bespoke-culture:description']).toBeUndefined();
		expect(mapping['element:culture-bespoke-culture-language:name']).toBeUndefined();
		expect(mapping['element:culture-bespoke-culture-language:description']).toBeUndefined();
		for (const id of [ 'culture-orc', 'culture-dragon-knight' ]) {
			expect(mapping[`element:${id}-language:name`]).toBeUndefined();
			expect(mapping[`element:${id}-language:description`]).toBeUndefined();
		}
		expect(mapping['element:up-creative:options']).toBeUndefined();
		expect(mapping['element:up-labor:options']).toBeUndefined();
		expect(mapping['element:up-martial:options']).toBeUndefined();
	});
});

describe('culture second batch', () => {
	const catalog = strings as Catalog;
	const cultures = core.cultures;

	test('the 16 professional culture names use the approved Forge Steel Chinese', () => {
		const rows: [ string, string, string ][] = [
			[ 'artisan-guild', 'heroes.background.culture.archetypical.artisan-guild', '工匠公會' ],
			[ 'borderland-homestead', 'heroes.background.culture.archetypical.borderland-homestead', '邊境家園' ],
			[ 'college-conclave', 'heroes.background.culture.archetypical.college-conclave', '學院集會' ],
			[ 'criminal-gang', 'heroes.background.culture.archetypical.criminal-gang', '犯罪幫派' ],
			[ 'farming-village', 'heroes.background.culture.archetypical.farming-village', '農耕村落' ],
			[ 'herding-community', 'heroes.background.culture.archetypical.herding-community', '牧民社群' ],
			[ 'knightly-order', 'heroes.background.culture.archetypical.knightly-order', '騎士團' ],
			[ 'pauper-neighborhood', 'heroes.background.culture.archetypical.laborer-neighborhood', '勞工社區' ],
			[ 'mercenary-band', 'heroes.background.culture.archetypical.mercenary-band', '傭兵團' ],
			[ 'merchant-caravan', 'heroes.background.culture.archetypical.merchant-caravan', '商隊' ],
			[ 'monastic-order', 'heroes.background.culture.archetypical.monastic-order', '修道會' ],
			[ 'noble-house', 'heroes.background.culture.archetypical.noble-house', '貴族世家' ],
			[ 'outlaw-band', 'heroes.background.culture.archetypical.outlaw-band', '亡命團體' ],
			[ 'pirate-crew', 'heroes.background.culture.archetypical.pirate-crew', '海盜團' ],
			[ 'telepathic-hive', 'heroes.background.culture.archetypical.telepathic-hive', '心靈巢穴' ],
			[ 'traveling-entertainers', 'heroes.background.culture.archetypical.traveling-entertainers', '巡迴藝人' ]
		];
		for (const [ slug, sheetId, zh ] of rows) {
			const culture = cultures.find(item => item.id === `culture-${slug}`);
			if (!culture) {
				throw new Error(`missing culture-${slug}`);
			}
			const key = `element:culture-${slug}:name`;
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(catalog[sheetId].fs?.en).toBe(culture.name);
			expect(catalog[sheetId].fs?.zh).toBe(zh);
			expect(catalog[sheetId].zh.startsWith(`${zh}｜`)).toBe(true);
			expect(resolveText('zh-TW', key, culture.name, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, culture.name, { [key]: sheetId }, catalog)).toBe(culture.name);
			expect(mapping[`element:culture-${slug}:description`]).toBeUndefined();
			expect(resolveText('zh-TW', undefined, culture.description, {}, catalog)).toBe(culture.description);
		}
	});
});

describe('culture third batch', () => {
	const catalog = strings as Catalog;
	const cultures = [ ...core.ancestries, ...orden.ancestries ].flatMap(ancestry => ancestry.culture ? [ ancestry.culture ] : []);

	test('this batch adds 11 name keys and 11 Forge Steel rows', () => {
		expect(Object.keys(mapping)).toHaveLength(346);
		expect(Object.keys(exceptions)).toHaveLength(10);
		expect(Object.values(catalog).filter(row => row.fs).length).toBe(74);
	});

	test('the 11 ancestral culture names use the approved Forge Steel Chinese', () => {
		const rows: [ string, string, string ][] = [
			[ 'devil', 'heroes.background.culture.typical.devil', '魔鬼' ],
			[ 'dragon-knight', 'heroes.background.culture.typical.dragon-knight', '龍騎士' ],
			[ 'dwarf', 'heroes.background.culture.typical.dwarf', '矮人' ],
			[ 'wode-elf', 'heroes.background.culture.typical.wode-elf', '幻林精靈' ],
			[ 'high-elf', 'heroes.background.culture.typical.high-elf', '高等精靈' ],
			[ 'hakaan', 'heroes.background.culture.typical.hakaan', '哈肯人' ],
			[ 'human', 'heroes.background.culture.typical.human', '人類' ],
			[ 'memonek', 'heroes.background.culture.typical.memonek', '梅莫人' ],
			[ 'orc', 'heroes.background.culture.typical.orc', '歐克' ],
			[ 'polder', 'heroes.background.culture.typical.polder', '波德人' ],
			[ 'time-raider', 'heroes.background.culture.typical.time-raider', '時空獵手' ]
		];
		for (const [ slug, sheetId, zh ] of rows) {
			const culture = cultures.find(item => item.id === `culture-${slug}`);
			if (!culture) {
				throw new Error(`missing culture-${slug}`);
			}
			const key = `element:culture-${slug}:name`;
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(catalog[sheetId].fs?.en).toBe(culture.name);
			expect(catalog[sheetId].fs?.zh).toBe(zh);
			expect(catalog[sheetId].zh.startsWith(`${zh}｜`)).toBe(true);
			expect(resolveText('zh-TW', key, culture.name, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, culture.name, { [key]: sheetId }, catalog)).toBe(culture.name);
			expect(mapping[`element:culture-${slug}:description`]).toBeUndefined();
			expect(resolveText('zh-TW', undefined, culture.description, {}, catalog)).toBe(culture.description);
		}
	});

	test('an ancestral culture name resolves inside its culture scope and stays English when unscoped', () => {
		const scope = {
			id: 'culture-orc',
			fields: elementScopeFields({ id: 'culture-orc', name: 'Orc', description: 'Wilderness, communal, creative.' })
		};
		const key = displayKey(undefined, 'Orc', scope);
		const sheetId = 'heroes.background.culture.typical.orc';

		expect(key).toBe('element:culture-orc:name');
		expect(resolveText('zh-TW', key, 'Orc', { 'element:culture-orc:name': sheetId }, catalog)).toBe('歐克');
		expect(displayKey(undefined, 'Orc', null)).toBeUndefined();
		expect(resolveText('zh-TW', undefined, 'Orc', { 'element:ancestry-orc:name': 'heroes.ancestries.orc.name' }, catalog)).toBe('Orc');
	});

	test('the high elf culture row shows 高等精靈 while the ancestry name stays Elf (high)', () => {
		const key = 'element:culture-high-elf:name';
		const sheetId = 'heroes.background.culture.typical.high-elf';
		const culture = cultures.find(item => item.id === 'culture-high-elf');
		if (!culture) {
			throw new Error('missing culture-high-elf');
		}

		expect(resolveText('zh-TW', key, culture.name, { [key]: sheetId }, catalog)).toBe('高等精靈');
		expect(catalog['heroes.ancestries.high-elf.name'].fs?.en).toBe('Elf (high)');
	});
});

describe('language first batch', () => {
	const catalog = names as Catalog;
	const samples = new Map<string, string>([
		[ 'Caelian', '凱利安語' ],
		[ 'Kalliak', '卡力語' ],
		[ 'Zaliac', '札力語' ],
		[ 'The First Language', '太古語' ],
		[ 'Proto-Ctholl', '原墮語' ],
		[ 'Ullorvic', '烏洛維克語' ]
	]);

	test('this batch adds 42 language keys and the Kalliac spelling exception', () => {
		expect(Object.keys(mapping)).toHaveLength(346);
		expect(Object.keys(mapping).filter(key => key.startsWith('language:'))).toHaveLength(42);
		expect(Object.keys(exceptions)).toHaveLength(10);
		expect(exceptions['language:Kalliac']).toEqual({
			kind: 'spelling',
			note: 'Kalliac appears only as the orc culture preset language in src/data/ancestries/orc.ts. Kalliak is the official spelling. Names K9 already notes this.'
		});
	});

	test('the 41 matching language names use the approved Chinese, and descriptions stay English', () => {
		const listed = orden.languages.filter(language => language.name !== 'Za\'hariax');
		const seen = new Set<string>();

		expect(listed).toHaveLength(41);
		expect(orden.languages.some(language => language.name === 'Za\u2019hariax')).toBe(false);

		for (const language of listed) {
			const key = languageNameKey(language.name);
			const entry = mapping[key];
			if (!entry) {
				throw new Error(`missing ${key}`);
			}
			const sheetId = entry.sheetId;
			expect(sheetId.startsWith('heroes.language.')).toBe(true);
			expect(catalog[sheetId].en).toBe(language.name);
			expect(resolveText('zh-TW', key, language.name, { [key]: sheetId }, catalog)).toBe(catalog[sheetId].zh);
			expect(resolveText('en', key, language.name, { [key]: sheetId }, catalog)).toBe(language.name);
			expect(resolveText('zh-TW', undefined, language.description, {}, catalog)).toBe(language.description);
			const sample = samples.get(language.name);
			if (sample) {
				expect(catalog[sheetId].zh).toBe(sample);
				seen.add(language.name);
			}
		}

		expect(seen.size).toBe(samples.size);
		expect(mapping['language:Za\'hariax']).toBeUndefined();
		expect(mapping['language:Za\u2019hariax']).toBeUndefined();
	});

	test('Kalliac displays 卡力語 and English mode keeps the Forge Steel spelling', () => {
		const key = languageNameKey('Kalliac');
		const sheetId = 'heroes.language.kalliak';

		expect(key).toBe('language:Kalliac');
		expect(mapping[key]).toMatchObject({ sheetId });
		expect(catalog[sheetId].en).toBe('Kalliak');
		expect(catalog[sheetId].zh).toBe('卡力語');
		expect(resolveText('zh-TW', key, 'Kalliac', { [key]: sheetId }, catalog)).toBe('卡力語');
		expect(resolveText('en', key, 'Kalliac', { [key]: sheetId }, catalog)).toBe('Kalliac');
		expect(resolveText('zh-TW', undefined, 'Spoken by orcs; an offshoot of Zaliac.', {}, catalog)).toBe('Spoken by orcs; an offshoot of Zaliac.');
	});

	test('useLanguageNames keeps the stored order, maps Kalliac, and leaves an unmapped name unchanged', async () => {
		await loadCatalog();
		const stored = [ 'Zaliac', 'Kalliac', 'I Speak Their Language (Orc)', 'Caelian' ];
		const Probe = (props: { names: readonly string[] }) => {
			const names = useLanguageNames(props.names);
			return names.join('\n');
		};

		expect(renderToStaticMarkup(createElement(Probe, { names: stored }))).toBe([
			'札力語',
			'卡力語',
			'I Speak Their Language (Orc)',
			'凱利安語'
		].join('\n'));

		setLanguage('en');
		expect(renderToStaticMarkup(createElement(Probe, { names: stored }))).toBe(stored.join('\n'));
	});
});

describe('skill first batch', () => {
	const catalog = glossary as Catalog;

	test('this batch adds 57 skill keys and 5 skill-list keys', () => {
		expect(Object.keys(mapping)).toHaveLength(346);
		expect(Object.keys(mapping).filter(key => key.startsWith('skill:'))).toHaveLength(57);
		expect(Object.keys(mapping).filter(key => key.startsWith('enum:SkillList:'))).toHaveLength(5);
		expect(mapping['enum:SkillList:Custom']).toBeUndefined();
	});

	test('every core and orden skill maps to its own term.<slug>-skill row', () => {
		const skills = [ ...core.skills, ...orden.skills ];

		expect(skills).toHaveLength(57);
		for (const skill of skills) {
			const key = skillNameKey(skill.name);
			const slug = skill.name.toLowerCase().replace(/ /g, '-');
			const sheetId = `term.${slug}-skill`;
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(catalog[sheetId].en).toBe(skill.name);
			expect(resolveText('zh-TW', key, skill.name, { [key]: sheetId }, catalog)).toBe(catalog[sheetId].zh);
			expect(resolveText('en', key, skill.name, { [key]: sheetId }, catalog)).toBe(skill.name);
			expect(resolveText('zh-TW', undefined, skill.description, {}, catalog)).toBe(skill.description);
		}
	});

	test('sample names resolve in zh-TW, stay English in English mode, and an unmapped name stays as written', () => {
		const rows: [ string, string, string, string ][] = [
			[ skillNameKey('Alchemy'), 'Alchemy', 'term.alchemy-skill', '鍊金' ],
			[ skillNameKey('Read Person'), 'Read Person', 'term.read-person-skill', '觀色' ],
			[ skillNameKey('Climb'), 'Climb', 'term.climb-skill', '攀爬' ],
			[ skillListKey('Lore'), 'Lore', 'term.lore-skill-group', '學識類' ]
		];

		for (const [ key, english, sheetId, zh ] of rows) {
			expect(mapping[key]).toMatchObject({ sheetId });
			expect(catalog[sheetId].zh).toBe(zh);
			expect(catalog[sheetId].en).toBe(english);
			expect(resolveText('zh-TW', key, english, { [key]: sheetId }, catalog)).toBe(zh);
			expect(resolveText('en', key, english, { [key]: sheetId }, catalog)).toBe(english);
		}

		expect(catalog['term.climb'].zh).toBe('攀爬');
		expect(catalog['term.climb'].en).toBe('Climb');
		expect(resolveText('zh-TW', skillNameKey('Home Brew'), 'Home Brew', {}, catalog)).toBe('Home Brew');
		expect(resolveText('en', skillNameKey('Home Brew'), 'Home Brew', {}, catalog)).toBe('Home Brew');
		expect(resolveText('zh-TW', skillListKey('Custom'), 'Custom', {}, catalog)).toBe('Custom');
	});

	test('useSkillListNames maps Lore and leaves Custom unchanged', async () => {
		await loadCatalog();
		const stored = [ 'Lore', 'Custom' ];
		const Probe = (props: { lists: readonly string[] }) => {
			const names = useSkillListNames(props.lists);
			return names.join('\n');
		};

		expect(renderToStaticMarkup(createElement(Probe, { lists: stored }))).toBe([
			'學識類',
			'Custom'
		].join('\n'));

		setLanguage('en');
		expect(renderToStaticMarkup(createElement(Probe, { lists: stored }))).toBe(stored.join('\n'));
	});
});
