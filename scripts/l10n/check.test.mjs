import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test } from 'vitest';
import { checkCjk, checkGenerated, checkMapping, forgeEnglish, formatIssues, hashEnglish, runCheck } from './check.mjs';

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

const sheet = (root, ids) => {
	const data = {};
	for (const id of ids) {
		data[id] = { en: 'En', updated: '2026-10-01', zh: '字' };
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
		return `\t'${entry.key}': { sheetId: '${entry.sheetId}', enHash: '${entry.enHash}' },`;
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
		sheet(root, [ 'term.name', 'term.feature', 'term.might', 'ui.library' ]);
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

describe('repository', () => {
	test('reads upstream English from source text', () => {
		expect(forgeEnglish(repoRoot, 'element:ancestry-orc:name')).toEqual({ english: 'Orc' });
		expect(forgeEnglish(repoRoot, 'enum:Characteristic:Might')).toEqual({ english: 'Might' });
	});

	test('the real tree passes', () => {
		expect(runCheck(repoRoot)).toEqual([]);
	}, 30000);
});
