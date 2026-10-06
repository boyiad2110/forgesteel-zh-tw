import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test } from 'vitest';
import { checkCjk, checkGenerated, checkMapping, englishDifference, forgeEnglish, formatIssues, hashEnglish, runCheck, stripRulesHeading } from './check.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const roots = [];

const scratch = () => {
	const root = mkdtempSync(path.join(tmpdir(), 'l10n-check-'));
	roots.push(root);
	return root;
};

const write = (root, rel, text) => {
	const file = path.join(root, rel);
	mkdirSync(path.dirname(file), { recursive: true });
	writeFileSync(file, text);
};

const sheet = (root, ids, english = {}) => {
	const data = {};
	for (const id of ids) {
		data[id] = { en: english[id] ?? 'En', updated: '2026-10-01', zh: '字' };
	}
	const text = `${JSON.stringify(data, null, 2)}\n`;
	for (const name of [ 'glossary.json', 'names.json', 'strings.json' ]) {
		write(root, `src/l10n/generated/zh-TW/${name}`, text);
	}
};

const dataFile = `export const item = {
	id: 'demo-item',
	name: 'Orc',
	features: [
		{
			id: 'demo-feature',
			name: 'Relentless'
		}
	]
};
`;

const enumFile = `export enum Characteristic {
	Might = 'Might',
	Agility = 'Agility'
}
`;

const mappingSource = entries => {
	const lines = entries.map(entry => {
		const strip = entry.stripHeading ? ', stripHeading: true' : '';
		return `\t'${entry.key}': { sheetId: '${entry.sheetId}', enHash: '${entry.enHash}'${strip} },`;
	});
	return `export const mapping = {\n${lines.join('\n')}\n};\n`;
};

afterEach(() => {
	while (roots.length > 0) {
		rmSync(roots.pop(), { recursive: true, force: true });
	}
});

describe('cjk', () => {
	test('fails on Han text outside the generated catalog', () => {
		const root = scratch();
		write(root, 'src/panels/hero.ts', 'const title = \'Hero\';\nconst label = \'英雄\';\n');

		const issues = checkCjk(root);

		expect(formatIssues(issues)).toBe(
			'cjk: src/panels/hero.ts:2 Han text is not allowed outside src/l10n/generated ("英")'
		);
	});

	test('allows the generated catalog and the two documented files', () => {
		const root = scratch();
		write(root, 'src/l10n/language.ts', 'export const label = \'中文\';\n');
		write(root, 'src/l10n/lookup.test.ts', 'const zh = \'歐克\';\n');
		write(root, 'src/l10n/generated/zh-TW/strings.json', '{ "zh": "招式" }\n');
		write(root, 'src/panels/hero.ts', 'const title = \'Hero\';\n');

		expect(checkCjk(root)).toEqual([]);
	});
});

describe('mapping keys', () => {
	test('fails on a malformed key, a bad entry, and a duplicate key', () => {
		const root = scratch();
		const hash = hashEnglish('Orc');
		write(root, 'src/data/item.ts', dataFile);
		sheet(root, [ 'term.demo' ]);
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'not-a-key', sheetId: 'term.demo', enHash: hash },
			{ key: 'element:demo-item:name', sheetId: 'term.demo', enHash: 'nope' },
			{ key: 'element:demo-item:name', sheetId: 'term.demo', enHash: hash },
			{ key: 'element:demo-item:name', sheetId: 'term.demo', enHash: hash }
		]));

		const text = formatIssues(checkMapping(root));

		expect(text).toContain('mapping-key: src/l10n/mapping.ts:2 [not-a-key] malformed key');
		expect(text).toContain('mapping-entry: src/l10n/mapping.ts:3 [element:demo-item:name] enHash must be a sha256 hex digest');
		expect(text).toContain('mapping-duplicate: src/l10n/mapping.ts:4 [element:demo-item:name] duplicate key (first seen at line 3)');
		expect(text).toContain('mapping-duplicate: src/l10n/mapping.ts:5 [element:demo-item:name] duplicate key (first seen at line 3)');
	});
});

describe('sheet id', () => {
	test('fails when the sheet id was not exported', () => {
		const root = scratch();
		write(root, 'src/data/item.ts', dataFile);
		sheet(root, [ 'term.other' ]);
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'element:demo-item:name', sheetId: 'not.exported', enHash: hashEnglish('Orc') }
		]));

		expect(formatIssues(checkMapping(root))).toBe(
			'mapping-sheet: src/l10n/mapping.ts:2 [element:demo-item:name] not.exported is not an APPROVED sheet id'
		);
	});
});

describe('stale english', () => {
	test('fails when the approved hash does not match the current Forge Steel English', () => {
		const root = scratch();
		write(root, 'src/data/item.ts', dataFile);
		sheet(root, [ 'term.demo' ]);
		const approved = hashEnglish('Goblin');
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'element:demo-item:name', sheetId: 'term.demo', enHash: approved }
		]));

		const current = hashEnglish('Orc');
		expect(formatIssues(checkMapping(root))).toBe(
			`stale-english: src/l10n/mapping.ts:2 [element:demo-item:name] Forge Steel English changed ("Orc"); approved ${approved}, current ${current}`
		);
	});

	test('passes when element, enum, and ui hashes still match', () => {
		const root = scratch();
		write(root, 'src/data/item.ts', dataFile);
		write(root, 'src/enums/characteristic.ts', enumFile);
		write(root, 'src/l10n/ui-english.json', `${JSON.stringify({ 'library.ancestries': 'Ancestries' }, null, 2)}\n`);
		sheet(root, [ 'term.name', 'term.feature', 'term.might', 'ui.library' ], {
			'term.name': 'Orc',
			'term.feature': 'Relentless',
			'term.might': 'Might',
			'ui.library': 'Ancestries'
		});
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'element:demo-item:name', sheetId: 'term.name', enHash: hashEnglish('Orc') },
			{ key: 'element:demo-feature:name', sheetId: 'term.feature', enHash: hashEnglish('Relentless') },
			{ key: 'enum:Characteristic:Might', sheetId: 'term.might', enHash: hashEnglish('Might') },
			{ key: 'ui:library.ancestries', sheetId: 'ui.library', enHash: hashEnglish('Ancestries') }
		]));

		expect(checkMapping(root)).toEqual([]);
	});

	test('fails closed when the element id exists twice', () => {
		const root = scratch();
		write(root, 'src/data/a.ts', dataFile);
		write(root, 'src/data/b.ts', dataFile);
		sheet(root, [ 'term.demo' ]);
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'element:demo-item:name', sheetId: 'term.demo', enHash: hashEnglish('Orc') }
		]));

		expect(formatIssues(checkMapping(root))).toContain(
			'element id demo-item is defined more than once under src/data'
		);
	});
});

describe('rules heading', () => {
	const template = '\nWhile bleeding.';

	const writeRules = (root, en, zh) => {
		write(root, 'src/data/condition-data.ts', `export class ConditionData {\n\tstatic bleeding = \`${template}\`;\n}\n`);
		write(root, 'src/l10n/generated/zh-TW/glossary.json', '{}\n');
		write(root, 'src/l10n/generated/zh-TW/names.json', '{}\n');
		write(root, 'src/l10n/generated/zh-TW/strings.json', `${JSON.stringify({
			'heroes.conditions.bleeding.rules': { en, updated: '2026-10-01', zh }
		}, null, 2)}\n`);
	};

	test('a data key hashes the template and accepts a matching titled row', () => {
		const root = scratch();
		writeRules(root, 'Bleeding\n\nWhile bleeding.', '出血\n\n規則');
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'data:ConditionData:bleeding', sheetId: 'heroes.conditions.bleeding.rules', enHash: hashEnglish(template), stripHeading: true }
		]));

		expect(forgeEnglish(root, 'data:ConditionData:bleeding')).toEqual({ english: template });
		expect(stripRulesHeading('Bleeding\n\nWhile bleeding.')).toBe('While bleeding.');
		expect(checkMapping(root)).toEqual([]);
	});

	test('refuses a titled row whose English body differs', () => {
		const root = scratch();
		writeRules(root, 'Bleeding\n\nWhile bleeding. (see Chapter 10: Combat)', '出血\n\n規則');
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'data:ConditionData:bleeding', sheetId: 'heroes.conditions.bleeding.rules', enHash: hashEnglish(template), stripHeading: true }
		]));

		expect(formatIssues(checkMapping(root))).toContain('rules-heading:');
		expect(formatIssues(checkMapping(root))).toContain('sheet English body does not match');
	});

	test('a CRLF data file hashes like the LF template', () => {
		const root = scratch();
		const lf = '\nWhile a creature is bleeding, you are dying.';
		const source = `export class ConditionData {\n\tstatic bleeding = \`${lf}\`;\n}\n`.replace(/\n/g, '\r\n');
		write(root, 'src/data/condition-data.ts', source);
		const resolved = forgeEnglish(root, 'data:ConditionData:bleeding');

		expect(hashEnglish(resolved.english)).toBe(hashEnglish(lf));

		write(root, 'src/l10n/generated/zh-TW/glossary.json', '{}\n');
		write(root, 'src/l10n/generated/zh-TW/names.json', '{}\n');
		write(root, 'src/l10n/generated/zh-TW/strings.json', `${JSON.stringify({
			'heroes.conditions.bleeding.rules': {
				en: 'Bleeding\r\n\r\nWhile a creature is bleeding, you are dying.',
				updated: '2026-10-01',
				zh: '出血\n\n規則'
			}
		}, null, 2)}\n`);
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'data:ConditionData:bleeding', sheetId: 'heroes.conditions.bleeding.rules', enHash: hashEnglish(lf), stripHeading: true }
		]));

		expect(checkMapping(root)).toEqual([]);
	});

	test('refuses stripHeading on an enum key', () => {
		const root = scratch();
		write(root, 'src/enums/condition-type.ts', 'export enum ConditionType {\n\tBleeding = \'Bleeding\'\n}\n');
		sheet(root, [ 'term.bleeding' ]);
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'enum:ConditionType:Bleeding', sheetId: 'term.bleeding', enHash: hashEnglish('Bleeding'), stripHeading: true }
		]));

		expect(formatIssues(checkMapping(root))).toContain('stripHeading is only valid on a data: key');
	});
});

describe('sheet english', () => {
	const forge = 'warriors - a reputation';
	const sheetEn = 'warriors—a reputation';
	const articleForge = 'stirred by passion';
	const articleSheet = 'stirred by a passion';

	const writePair = (root, english, en) => {
		write(root, 'src/data/item.ts', `export const item = {\n\tid: 'demo-item',\n\tname: '${english}'\n};\n`);
		sheet(root, [ 'term.demo' ], { 'term.demo': en });
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'element:demo-item:name', sheetId: 'term.demo', enHash: hashEnglish(english) }
		]));
	};

	test('fails when sheet English differs and the key is not listed', () => {
		const root = scratch();
		writePair(root, forge, sheetEn);

		expect(formatIssues(checkMapping(root))).toContain(
			'sheet-english: src/l10n/mapping.ts:2 [element:demo-item:name] sheet English does not match Forge Steel English'
		);
	});

	test('allows a listed punctuation-only difference', () => {
		const root = scratch();
		writePair(root, forge, sheetEn);
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'element:demo-item:name': { kind: 'punctuation', note: 'hyphen versus em dash' }
		}, null, 2)}\n`);

		expect(englishDifference(forge, sheetEn)).toBe('punctuation');
		expect(checkMapping(root)).toEqual([]);
	});

	test('allows a listed article-only difference', () => {
		const root = scratch();
		writePair(root, articleForge, articleSheet);
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'element:demo-item:name': { kind: 'article', note: 'sheet adds a' }
		}, null, 2)}\n`);

		expect(englishDifference(articleForge, articleSheet)).toBe('article');
		expect(checkMapping(root)).toEqual([]);
	});

	test('rejects a content change listed as punctuation', () => {
		const root = scratch();
		writePair(root, 'You have a +1 bonus to stability.', 'You have a +1 bonus to stability. You can’t be moved.');
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'element:demo-item:name': { kind: 'punctuation', note: 'extra sentence' }
		}, null, 2)}\n`);

		expect(formatIssues(checkMapping(root))).toContain(
			'listed as punctuation, but the difference is content'
		);
	});

	test('rejects an exception whose English already matches', () => {
		const root = scratch();
		writePair(root, 'Orc', 'Orc');
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'element:demo-item:name': { kind: 'punctuation', note: 'none' }
		}, null, 2)}\n`);

		expect(formatIssues(checkMapping(root))).toContain(
			'exception is unnecessary; the English already matches'
		);
	});

	test('rejects an exception key that is not mapped', () => {
		const root = scratch();
		writePair(root, 'Orc', 'Orc');
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'element:missing:name': { kind: 'article', note: 'not mapped' }
		}, null, 2)}\n`);

		expect(formatIssues(checkMapping(root))).toContain(
			'sheet-english: src/l10n/english-exceptions.json [element:missing:name] exception key is not in the mapping table'
		);
	});

	test('rejects a kind other than punctuation or article', () => {
		const root = scratch();
		writePair(root, forge, sheetEn);
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'element:demo-item:name': { kind: 'wording', note: 'not allowed' }
		}, null, 2)}\n`);

		expect(formatIssues(checkMapping(root))).toContain('kind must be punctuation, article, or spelling');
	});
});

describe('generated files', () => {
	test('fails when the generated JSON does not match the snapshot', () => {
		const root = scratch();
		write(root, 'l10n/sheet-snapshot/source.json', `${JSON.stringify({
			sheetFileId: 'sheet-1',
			sheetModifiedTime: '2026-10-01T00:00:00.000Z'
		}, null, 2)}\n`);
		write(root, 'l10n/sheet-snapshot/glossary.csv', 'Glossary ID,Status,Target Term,Source Term,Last Updated\nterm.demo,APPROVED,示範,Demo,2026-10-01\n');
		write(root, 'l10n/sheet-snapshot/names.csv', 'Name ID,Status,Target Name,Source Name,Last Updated\nname.demo,APPROVED,示範名,Demo Name,2026-10-01\n');
		write(root, 'l10n/sheet-snapshot/strings.csv', 'String ID,Status,Target Text,Source Text,Last Updated\nstring.demo,APPROVED,示範字,Demo text,2026-10-01\n');
		write(root, 'src/l10n/generated/zh-TW/glossary.json', '{}\n');
		write(root, 'src/l10n/generated/zh-TW/names.json', '{}\n');
		write(root, 'src/l10n/generated/zh-TW/strings.json', '{}\n');
		write(root, 'src/l10n/generated/zh-TW/meta.json', '{}\n');

		const issues = checkGenerated(root);
		expect(issues).toHaveLength(1);
		expect(issues[0].rule).toBe('generated');
		expect(issues[0].file).toBe('src/l10n/generated/zh-TW');
		expect(issues[0].message).toContain('content differs');
		expect(issues[0].message).toContain('glossary.json');
	});
});

describe('forge steel version', () => {
	const forge = 'warriors - a reputation';
	const bookEn = 'Totally different book sentence.';
	const bookZh = 'Book Chinese line.';
	const sheetId = 'heroes.demo';

	const writeFs = (root, { english = forge, fsEn = forge, basisHash = hashEnglish(bookZh), mapped = true, exception = false, stripHeading = false } = {}) => {
		const literal = english.includes('\n') || english.includes('`') ? `\`${english}\`` : `'${english}'`;
		write(root, 'src/data/item.ts', `export const item = {\n\tid: 'demo-item',\n\tdescription: ${literal}\n};\n`);
		write(root, 'src/l10n/generated/zh-TW/glossary.json', '{}\n');
		write(root, 'src/l10n/generated/zh-TW/names.json', '{}\n');
		write(root, 'src/l10n/generated/zh-TW/strings.json', `${JSON.stringify({
			[sheetId]: {
				en: bookEn,
				fs: { basisHash, en: fsEn, zh: 'Forge line.' },
				updated: '2026-10-01',
				zh: bookZh
			}
		}, null, 2)}\n`);
		const entries = mapped
			? [ { key: 'element:demo-item:description', sheetId, enHash: hashEnglish(english), stripHeading } ]
			: [];
		write(root, 'src/l10n/mapping.ts', entries.length === 0 ? 'export const mapping = {\n};\n' : mappingSource(entries));
		if (exception) {
			write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
				'element:demo-item:description': { kind: 'punctuation', note: 'dash versus em dash' }
			}, null, 2)}\n`);
		}
	};

	test('passes when Forge Steel English matches and the book English differs', () => {
		const root = scratch();
		writeFs(root);

		expect(checkMapping(root)).toEqual([]);
	});

	test('fails when Forge Steel Source Text differs from Forge Steel English', () => {
		const root = scratch();
		writeFs(root, { fsEn: 'warriors—a reputation' });

		const text = formatIssues(checkMapping(root));
		expect(text).toContain('Forge Steel English does not match Forge Steel Source Text');
		expect(text).not.toContain('sheet English does not match');
	});

	test('fails when the basis hash is stale', () => {
		const root = scratch();
		writeFs(root, { basisHash: hashEnglish('other') });

		expect(formatIssues(checkMapping(root))).toContain('Forge Steel version is stale');
	});

	test('fails when a Forge Steel key is listed as an exception', () => {
		const root = scratch();
		writeFs(root, { exception: true });

		expect(formatIssues(checkMapping(root))).toContain(
			'Forge Steel version cannot be listed in english-exceptions'
		);
	});

	test('fails when a Forge Steel row has no mapping key', () => {
		const root = scratch();
		writeFs(root, { mapped: false });

		expect(formatIssues(checkMapping(root))).toContain(
			`forge-steel: src/l10n/generated/zh-TW/strings.json [${sheetId}] Forge Steel version has no mapping key`
		);
	});

	test('fails when stripHeading is set on a Forge Steel key', () => {
		const root = scratch();
		writeFs(root, { stripHeading: true });

		expect(formatIssues(checkMapping(root))).toContain('stripHeading cannot be set on a Forge Steel version');
	});

	test('trims Forge Steel English before comparing it to Forge Steel Source Text', () => {
		const body = 'warriors - a reputation';
		const leading = scratch();
		writeFs(leading, { english: `\n${body}`, fsEn: body });
		expect(checkMapping(leading)).toEqual([]);

		const mismatch = scratch();
		writeFs(mismatch, { english: `\n${body}`, fsEn: 'warriors—a reputation' });
		const text = formatIssues(checkMapping(mismatch));
		expect(text).toContain('Forge Steel English does not match Forge Steel Source Text');
		expect(text).not.toContain('sheet English does not match');
	});
});

describe('createCulture calls', () => {
	test('indexes string-literal calls and skips other arguments', () => {
		const root = scratch();
		write(root, 'src/data/cultures.ts', `
			FactoryLogic.createCulture('Artisan Guild', 'Urban, bureaucratic, creative.', CultureType.Professional);
			FactoryLogic.createCulture('Pauper Neighborhood', 'Urban, communal, labor.', CultureType.Professional);
			FactoryLogic.createCulture('High Elf', 'Secluded, bureaucratic, martial.', CultureType.Ancestral);
			FactoryLogic.createCulture('Time Raider', 'Nomadic, communal, martial.', CultureType.Ancestral);
			FactoryLogic.createCulture('A B C', 'Kept.');
			FactoryLogic.createCulture(ancestry.name, '', CultureType.Ancestral);
			FactoryLogic.createCulture(name, 'Skipped.');
			FactoryLogic.createCulture('', 'Empty name.');
		`);

		expect(forgeEnglish(root, 'element:culture-artisan-guild:name')).toEqual({ english: 'Artisan Guild' });
		expect(forgeEnglish(root, 'element:culture-artisan-guild:description')).toEqual({ english: 'Urban, bureaucratic, creative.' });
		expect(forgeEnglish(root, 'element:culture-pauper-neighborhood:name')).toEqual({ english: 'Pauper Neighborhood' });
		expect(forgeEnglish(root, 'element:culture-pauper-neighborhood:description')).toEqual({ english: 'Urban, communal, labor.' });
		expect(forgeEnglish(root, 'element:culture-high-elf:name')).toEqual({ english: 'High Elf' });
		expect(forgeEnglish(root, 'element:culture-time-raider:name')).toEqual({ english: 'Time Raider' });
		expect(forgeEnglish(root, 'element:culture-a-b c:name')).toEqual({ english: 'A B C' });
		expect(forgeEnglish(root, 'element:culture-:name').error).toContain('was not found');
		expect(forgeEnglish(root, 'element:culture-skipped:name').error).toContain('was not found');
	});

	test('reports a duplicate id', () => {
		const root = scratch();
		write(root, 'src/data/a.ts', 'export const item = {\n\tid: \'culture-artisan-guild\',\n\tname: \'Other\'\n};\n');
		write(root, 'src/data/b.ts', 'FactoryLogic.createCulture(\'Artisan Guild\', \'One.\');\nFactoryLogic.createCulture(\'Artisan Guild\', \'Two.\');\n');

		expect(forgeEnglish(root, 'element:culture-artisan-guild:name').error).toContain('defined more than once');
	});
});

describe('language names', () => {
	const orden = `export const orden = {
	name: 'Orden',
	skills: [
		{ name: 'Timescape', description: 'Planets.' }
	],
	languages: [
		{ name: 'Caelian', description: 'The common tongue.', type: LanguageType.Common, related: [] },
		{ name: 'The First Language', description: 'Magic.', type: LanguageType.Cultural, related: [] },
		{ name: 'Proto-Ctholl', description: 'Demons.', type: LanguageType.Cultural, related: [ 'Tholl' ] }
	],
	decoy: [
		{ name: 'NotLanguage', description: 'Nope.' }
	]
};
`;

	test('reads a language-list literal and a culture preset, and ignores nearby names', () => {
		const root = scratch();
		write(root, 'src/data/orden.ts', orden);
		write(root, 'src/data/orc.ts', `
			// FactoryLogic.createCulture('Commented', 'Skipped.', CultureType.Ancestral, EnvironmentData.wilderness, OrganizationData.communal, UpbringingData.creative, 'Commented');
			FactoryLogic.createCulture('Orc', 'Wilderness, communal, creative.', CultureType.Ancestral, EnvironmentData.wilderness, OrganizationData.communal, UpbringingData.creative, 'Kalliac');
			FactoryLogic.createCulture('Bespoke Culture', 'Choose any.', CultureType.Bespoke);
		`);
		write(root, 'src/data/lore.ts', 'export const source = \'Texts or lore in Kalliac\';\n');
		sheet(root, [ 'heroes.language.caelian', 'heroes.language.first-language', 'heroes.language.proto-ctholl', 'heroes.language.kalliak' ], {
			'heroes.language.caelian': 'Caelian',
			'heroes.language.first-language': 'The First Language',
			'heroes.language.proto-ctholl': 'Proto-Ctholl',
			'heroes.language.kalliak': 'Kalliak'
		});
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'language:Caelian', sheetId: 'heroes.language.caelian', enHash: hashEnglish('Caelian') },
			{ key: 'language:The First Language', sheetId: 'heroes.language.first-language', enHash: hashEnglish('The First Language') },
			{ key: 'language:Proto-Ctholl', sheetId: 'heroes.language.proto-ctholl', enHash: hashEnglish('Proto-Ctholl') },
			{ key: 'language:Kalliac', sheetId: 'heroes.language.kalliak', enHash: hashEnglish('Kalliac') }
		]));
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'language:Kalliac': { kind: 'spelling', note: 'orc preset; official spelling is Kalliak' }
		}, null, 2)}\n`);

		expect(forgeEnglish(root, 'language:Caelian')).toEqual({ english: 'Caelian' });
		expect(forgeEnglish(root, 'language:The First Language')).toEqual({ english: 'The First Language' });
		expect(forgeEnglish(root, 'language:Proto-Ctholl')).toEqual({ english: 'Proto-Ctholl' });
		expect(forgeEnglish(root, 'language:Kalliac')).toEqual({ english: 'Kalliac' });
		expect(forgeEnglish(root, 'language:Timescape').error).toContain('not a literal');
		expect(forgeEnglish(root, 'language:NotLanguage').error).toContain('not a literal');
		expect(forgeEnglish(root, 'language:Commented').error).toContain('not a literal');
		expect(checkMapping(root)).toEqual([]);
	});

	test('fails when the name is only inside a longer string', () => {
		const root = scratch();
		write(root, 'src/data/lore.ts', 'export const source = \'Texts or lore in Kalliac\';\n');
		sheet(root, [ 'heroes.language.kalliak' ], { 'heroes.language.kalliak': 'Kalliak' });
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'language:Kalliac', sheetId: 'heroes.language.kalliak', enHash: hashEnglish('Kalliac') }
		]));

		expect(formatIssues(checkMapping(root))).toContain(
			'language "Kalliac" is not a literal in a src/data language list or a culture preset language'
		);
	});

	test('fails when a spelling difference is not listed', () => {
		const root = scratch();
		write(root, 'src/data/orc.ts', 'FactoryLogic.createCulture(\'Orc\', \'Wilderness.\', CultureType.Ancestral, EnvironmentData.wilderness, OrganizationData.communal, UpbringingData.creative, \'Kalliac\');\n');
		sheet(root, [ 'heroes.language.kalliak' ], { 'heroes.language.kalliak': 'Kalliak' });
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'language:Kalliac', sheetId: 'heroes.language.kalliak', enHash: hashEnglish('Kalliac') }
		]));

		expect(formatIssues(checkMapping(root))).toContain('sheet English does not match Forge Steel English');
	});

	test('rejects spelling on an element key', () => {
		const root = scratch();
		write(root, 'src/data/item.ts', 'export const item = {\n\tid: \'demo-item\',\n\tname: \'Kalliac\'\n};\n');
		sheet(root, [ 'heroes.language.kalliak' ], { 'heroes.language.kalliak': 'Kalliak' });
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'element:demo-item:name', sheetId: 'heroes.language.kalliak', enHash: hashEnglish('Kalliac') }
		]));
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'element:demo-item:name': { kind: 'spelling', note: 'not a language key' }
		}, null, 2)}\n`);

		expect(formatIssues(checkMapping(root))).toContain('spelling is only valid on a language: key');
	});

	test('rejects a spelling exception whose English already matches', () => {
		const root = scratch();
		write(root, 'src/data/orden.ts', orden);
		sheet(root, [ 'heroes.language.caelian' ], { 'heroes.language.caelian': 'Caelian' });
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'language:Caelian', sheetId: 'heroes.language.caelian', enHash: hashEnglish('Caelian') }
		]));
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'language:Caelian': { kind: 'spelling', note: 'already the same' }
		}, null, 2)}\n`);

		expect(formatIssues(checkMapping(root))).toContain('exception is unnecessary; the English already matches');
	});

	test('rejects spelling when the difference is only punctuation', () => {
		const root = scratch();
		write(root, 'src/data/orden.ts', 'export const orden = {\n\tlanguages: [\n\t\t{ name: \'Proto-Ctholl\', description: \'Demons.\' }\n\t]\n};\n');
		sheet(root, [ 'heroes.language.proto-ctholl' ], { 'heroes.language.proto-ctholl': 'Proto Ctholl' });
		write(root, 'src/l10n/mapping.ts', mappingSource([
			{ key: 'language:Proto-Ctholl', sheetId: 'heroes.language.proto-ctholl', enHash: hashEnglish('Proto-Ctholl') }
		]));
		write(root, 'src/l10n/english-exceptions.json', `${JSON.stringify({
			'language:Proto-Ctholl': { kind: 'spelling', note: 'hyphen versus space' }
		}, null, 2)}\n`);

		expect(englishDifference('Proto-Ctholl', 'Proto Ctholl')).toBe('punctuation');
		expect(formatIssues(checkMapping(root))).toContain('listed as spelling, but the difference is punctuation');
	});
});

describe('repository', () => {
	test('reads upstream English from source text', () => {
		expect(forgeEnglish(repoRoot, 'element:ancestry-orc:name')).toEqual({ english: 'Orc' });
		expect(forgeEnglish(repoRoot, 'enum:Characteristic:Might')).toEqual({ english: 'Might' });
		expect(forgeEnglish(repoRoot, 'data:ConditionData:weakened').english.trim()).toBe('A creature who is weakened takes a bane on power rolls.');
		expect(forgeEnglish(repoRoot, 'language:Caelian')).toEqual({ english: 'Caelian' });
		expect(forgeEnglish(repoRoot, 'language:The First Language')).toEqual({ english: 'The First Language' });
		expect(forgeEnglish(repoRoot, 'language:Proto-Ctholl')).toEqual({ english: 'Proto-Ctholl' });
		expect(forgeEnglish(repoRoot, 'language:Kalliak')).toEqual({ english: 'Kalliak' });
		expect(forgeEnglish(repoRoot, 'language:Kalliac')).toEqual({ english: 'Kalliac' });
		expect(forgeEnglish(repoRoot, 'language:Zaliac')).toEqual({ english: 'Zaliac' });
		expect(forgeEnglish(repoRoot, 'language:Ullorvic')).toEqual({ english: 'Ullorvic' });
	});

	test('the two orc rows differ only by punctuation or an article', () => {
		const strings = JSON.parse(readFileSync(path.join(repoRoot, 'src/l10n/generated/zh-TW/strings.json'), 'utf8'));
		const description = forgeEnglish(repoRoot, 'element:ancestry-orc:description');
		const artisan = forgeEnglish(repoRoot, 'element:orc-feature-2-3:description');

		expect(englishDifference(description.english, strings['heroes.ancestries.orc.description.1'].en)).toBe('punctuation');
		expect(englishDifference(artisan.english, strings['heroes.ancestries.orc.trait.passionate-artisan.effect'].en)).toBe('article');
	});

	test('the real tree passes', () => {
		expect(runCheck(repoRoot)).toEqual([]);
	}, 30000);
});
