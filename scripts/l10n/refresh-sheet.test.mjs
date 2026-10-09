import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { buildSnapshot, refreshSheet, replaceFiles } from './refresh-sheet.mjs';
import { buildCatalog, parseCsv } from './export-sheet.mjs';
import { captureSheet, projectCapture, SHEET_ID, TAB_HEADERS } from './sheet-capture.mjs';
import { hashEnglish } from './check.mjs';
import { hashDependencyIds } from './source-dependencies.mjs';

const roots = [];
const scratch = () => {
	const root = mkdtempSync(path.join(tmpdir(), 'l10n-refresh-test-'));
	roots.push(root);
	return root;
};
const write = (root, file, text) => {
	const target = path.join(root, file);
	mkdirSync(path.dirname(target), { recursive: true });
	writeFileSync(target, text);
};
afterEach(() => roots.splice(0).forEach(root => rmSync(root, { recursive: true, force: true })));

const metadata = { id: SHEET_ID, mime_type: 'application/vnd.google-apps.spreadsheet', modified_time: '2026-10-08T00:00:00.000Z' };
const en = 'Gain equal to your Might.';
const zh = '獲得你力量點。';
const display = { status: 'APPROVED', target: '你力量', template: ' {value} 點' };
const note = `Approved context, "verbatim".\r\nCalculation Display: ${JSON.stringify(display)}`;
const fixture = () => {
	const root = scratch();
	const tables = {
		Glossary: { values: [ TAB_HEADERS.Glossary, [ 'term.demo', 'APPROVED', '示範', 'Demo', '2026-10-08' ] ] },
		Names: { values: [ TAB_HEADERS.Names ] },
		Strings: { values: [ TAB_HEADERS.Strings, [ 'demo', 'APPROVED', zh, en, '2026-10-08', en, zh, 'APPROVED', hashEnglish(zh), note ] ] }
	};
	const binding = { sheetId: 'demo', enHash: hashEnglish(en), zhHash: hashEnglish(zh),
		sourceSpan: [ en.indexOf('your Might'), en.length - 1 ], targetSpan: [ 2, 5 ],
		sourceLength: en.length, targetLength: zh.length, valueSuffix: '', useDisplayTemplate: true };
	write(root, 'src/data/demo.ts', `export const item = { id: 'demo', description: '${en}' };`);
	write(root, 'src/l10n/mapping.ts', `export const mapping = { 'element:demo:description': { sheetId: 'demo', enHash: '${hashEnglish(en)}' } };`);
	write(root, 'src/l10n/calculation-bindings.json', JSON.stringify({ 'element:demo:description': binding }));
	const sources = [ { sheetId: 'demo', enHash: hashEnglish(en), zhHash: hashEnglish(zh) } ];
	write(root, 'src/l10n/source-dependencies.json', JSON.stringify({ version: 1, rows: {
		demo: { sources, sourcesHash: hashDependencyIds(sources), fs: { enHash: hashEnglish(en), zhHash: hashEnglish(zh) } }
	} }));
	const input = projectCapture(metadata, tables, metadata);
	const snapshot = buildSnapshot(input);
	for (const [ name, text ] of snapshot) write(root, `l10n/sheet-snapshot/${name}`, text);
	for (const [ name, text ] of buildCatalog(path.join(root, 'l10n/sheet-snapshot'))) write(root, `src/l10n/generated/zh-TW/${name}`, text);
	return { root, tables, input, binding };
};
const filesAt = root => {
	const files = [ ...buildSnapshot(fixtureInput()).keys() ].map(name => `l10n/sheet-snapshot/${name}`);
	files.push(...[ 'glossary', 'names', 'strings', 'meta' ].map(name => `src/l10n/generated/zh-TW/${name}.json`));
	return files.map(file => readFileSync(path.join(root, file), 'utf8'));
};
const fixtureInput = () => ({ sheetFileId: SHEET_ID, modifiedTimeBefore: metadata.modified_time, modifiedTimeAfter: metadata.modified_time,
	tabs: Object.fromEntries(Object.entries(TAB_HEADERS).map(([ name, headers ]) => [ name, { headers, rows: [] } ])) });

describe('one connector capture', () => {
	test('captures metadata before and after all tab reads, and projects only approved necessary cells', async () => {
		const { tables } = fixture();
		tables.Strings.values[0] = [ ...TAB_HEADERS.Strings, 'Reviewer Note' ];
		tables.Strings.values[1].push('private unrelated note');
		tables.Strings.values.push([ 'draft', 'REVIEW', 'private draft' ]);
		const calls = [];
		const input = await captureSheet(async () => { calls.push('metadata'); return metadata; }, async name => { calls.push(name); return tables[name]; });
		expect(calls[0]).toBe('metadata');
		expect(calls.at(-1)).toBe('metadata');
		expect(JSON.stringify(input)).not.toContain('private');
		expect(input.tabs.Strings.rows[0][9]).toBe(note);
	});
	test('header order and missing trailing empty cells do not change projected values', () => {
		const { tables } = fixture();
		tables.Names.values = [ [ ...TAB_HEADERS.Names ].reverse(), [ '2026-10-08', 'Demo', '名', 'APPROVED', 'name.demo' ] ];
		expect(projectCapture(metadata, tables, metadata).tabs.Names.rows[0]).toEqual([ 'name.demo', 'APPROVED', '名', 'Demo', '2026-10-08' ]);
	});
	test('draft Forge Steel cells never enter the approved bundle', () => {
		const { tables } = fixture();
		tables.Strings.values[1][7] = 'REVIEW';
		expect(projectCapture(metadata, tables, metadata).tabs.Strings.rows[0].slice(5)).toEqual([ '', '', '', '', '' ]);
	});
	test('an unapproved dynamic template is rejected in memory before writing the bundle', () => {
		const { tables } = fixture();
		tables.Strings.values[1][9] = 'Calculation Display: ' + JSON.stringify({ ...display, status: 'REVIEW' });
		expect(() => projectCapture(metadata, tables, metadata)).toThrow('expected an APPROVED');
	});
	test.each([ 'changed time', 'wrong sheet', 'missing time', 'missing tab', 'missing header', 'duplicate header' ])('rejects %s', reason => {
		const { tables } = fixture();
		const after = { ...metadata };
		if (reason === 'changed time') after.modified_time = '2026-10-08T00:00:01.000Z';
		if (reason === 'wrong sheet') after.id = 'another';
		if (reason === 'missing time') after.modified_time = null;
		if (reason === 'missing tab') delete tables.Names;
		if (reason === 'missing header') tables.Strings.values[0] = TAB_HEADERS.Strings.slice(0, -1);
		if (reason === 'duplicate header') tables.Strings.values[0] = [ ...TAB_HEADERS.Strings, 'String ID' ];
		expect(() => projectCapture(metadata, tables, after)).toThrow();
	});
	test('failed tab fetch rejects without creating an input bundle', async () => {
		await expect(captureSheet(async () => metadata, async () => { throw new Error('fetch failed'); })).rejects.toThrow('fetch failed');
	});
});

describe('staged integration and publication', () => {
	test('preserves quotes, newlines, spaces and exact Note; sorts IDs deterministically', () => {
		const { input } = fixture();
		input.tabs.Strings.rows[0][2] = zh + '  "引號",\r\n第二行';
		input.tabs.Glossary.rows.push([ 'term.aaa', 'APPROVED', '首列', 'First', '2026-10-08' ]);
		input.tabs.Strings.rows[0][9] += '\r\n';
		const files = buildSnapshot(input);
		expect(parseCsv(files.get('strings.csv'), 'strings.csv')[1][2]).toBe(input.tabs.Strings.rows[0][2]);
		expect(JSON.parse(files.get('calculation-displays.json')).demo).toBe(input.tabs.Strings.rows[0][9]);
		expect(parseCsv(files.get('glossary.csv'), 'glossary.csv')[1][0]).toBe('term.aaa');
		input.tabs.Glossary.rows.reverse();
		expect(Array.from(buildSnapshot(input))).toEqual(Array.from(files));
	});
	test('dry-run leaves files unchanged; apply updates both snapshot and catalog; repeat is a no-op', () => {
		const { root, input } = fixture();
		input.modifiedTimeBefore = input.modifiedTimeAfter = '2026-10-08T01:00:00.000Z';
		input.tabs.Strings.rows[0][9] = note.replace('Approved context', 'Updated approved context');
		const original = filesAt(root);
		const dry = refreshSheet(input, { root });
		expect(dry.applied).toBe(false);
		expect(filesAt(root)).toEqual(original);
		const result = refreshSheet(input, { root, apply: true });
		expect(result.dynamicNotes).toBe(1);
		expect(result.changes.map(change => change.file)).toContain('l10n/sheet-snapshot/calculation-displays.json');
		expect(JSON.parse(readFileSync(path.join(root, 'src/l10n/generated/zh-TW/meta.json'), 'utf8')).sheetModifiedTime).toBe(input.modifiedTimeAfter);
		expect(refreshSheet(input, { root, apply: true }).changes).toEqual([]);
	});
	test.each([ 'missing Note', 'review template', 'duplicate record', 'bad target', 'bad placeholder', 'invalid JSON', 'duplicate ID', 'stale Chinese', 'stale source', 'incomplete row', 'unmapped adaptation' ])('%s fails before touching committed files', reason => {
		const { root, input } = fixture();
		const original = filesAt(root);
		const row = input.tabs.Strings.rows[0];
		if (reason === 'missing Note') row[9] = '';
		if (reason === 'review template') row[9] = 'Calculation Display: ' + JSON.stringify({ ...display, status: 'REVIEW' });
		if (reason === 'duplicate record') row[9] += '\nCalculation Display: ' + JSON.stringify(display);
		if (reason === 'bad target') row[9] = 'Calculation Display: ' + JSON.stringify({ ...display, target: '不存在' });
		if (reason === 'bad placeholder') row[9] = 'Calculation Display: ' + JSON.stringify({ ...display, template: '{value} {value}' });
		if (reason === 'invalid JSON') row[9] = 'Calculation Display: {';
		if (reason === 'duplicate ID') input.tabs.Strings.rows.push([ ...row ]);
		if (reason === 'stale Chinese') row[6] = row[2] = '獲得別力量點。';
		if (reason === 'stale source') row[5] = 'Gain equal to your Agility.';
		if (reason === 'incomplete row') row.pop();
		if (reason === 'unmapped adaptation') input.tabs.Strings.rows.push([ 'other', ...row.slice(1) ]);
		expect(() => refreshSheet(input, { root, apply: true })).toThrow();
		expect(filesAt(root)).toEqual(original);
	});
	test('a binding to a different target span fails against staged, not old catalog', () => {
		const { root, input } = fixture();
		const original = filesAt(root);
		input.tabs.Strings.rows[0][9] = 'Calculation Display: ' + JSON.stringify({ ...display, target: '獲得' });
		expect(() => refreshSheet(input, { root, apply: true })).toThrow('display template must match');
		expect(filesAt(root)).toEqual(original);
	});
	test('a partial write failure restores old bytes and removes newly created files', () => {
		const root = scratch();
		const a = path.join(root, 'a');
		const b = path.join(root, 'b');
		const c = path.join(root, 'c');
		writeFileSync(a, 'old a');
		writeFileSync(c, 'old c');
		const files = new Map([ [ a, 'new a' ], [ b, 'new b' ], [ c, 'new c' ] ]);
		expect(() => replaceFiles(files, (file, text) => {
			writeFileSync(file, text);
			if (file === c) throw new Error('disk failure');
		})).toThrow('original files restored');
		expect(readFileSync(a, 'utf8')).toBe('old a');
		expect(readFileSync(c, 'utf8')).toBe('old c');
		expect(() => readFileSync(b)).toThrow();
	});
});
