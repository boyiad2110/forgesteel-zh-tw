#!/usr/bin/env node
/** Offline integration of one approved connector capture; dry-run unless --apply. */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog } from './export-sheet.mjs';
import { formatIssues, runCheck } from './check.mjs';
import { projectCapture, TAB_HEADERS } from './sheet-capture.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const csv = rows => rows.map(row => row.map(value => /[",\r\n]/.test(value)
	? `"${value.replaceAll('"', '""')}"` : value).join(',')).join('\n') + '\n';

export function buildSnapshot(input) {
	const metadata = time => ({ id: input?.sheetFileId, mime_type: 'application/vnd.google-apps.spreadsheet', modified_time: time });
	const tables = {};
	for (const name of Object.keys(TAB_HEADERS)) {
		const tab = input?.tabs?.[name];
		if (!Array.isArray(tab?.headers) || !Array.isArray(tab.rows)) throw new Error(`${name}: missing capture tab`);
		for (const row of tab.rows) {
			if (!Array.isArray(row) || row.length !== tab.headers.length) throw new Error(`${name}: incomplete capture row`);
		}
		tables[name] = { values: [ tab.headers, ...tab.rows ] };
	}
	const capture = projectCapture(metadata(input.modifiedTimeBefore), tables, metadata(input.modifiedTimeAfter));
	const files = new Map();
	const notes = {};
	for (const [ name, tab ] of Object.entries(capture.tabs)) {
		const width = name === 'Strings' ? tab.headers.length - 1 : tab.headers.length;
		const rows = tab.rows.slice().sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
		files.set(`${name.toLowerCase()}.csv`, csv([ tab.headers.slice(0, width), ...rows.map(row => row.slice(0, width)) ]));
		if (name === 'Strings') {
			for (const row of rows) {
				if (row[9]) {
					if (Object.hasOwn(notes, row[0])) throw new Error(`Strings: duplicate dynamic ID ${row[0]}`);
					notes[row[0]] = row[9];
				}
			}
		}
	}
	files.set('calculation-displays.json', json(notes));
	files.set('source.json', json({ sheetFileId: capture.sheetFileId, sheetModifiedTime: capture.modifiedTimeAfter }));
	return files;
}

/** Restore every touched file on a caught write failure; never retry with stale data. */
export function replaceFiles(files, write = writeFileSync) {
	const originals = new Map();
	for (const file of files.keys()) originals.set(file, existsSync(file) ? readFileSync(file) : null);
	const touched = [];
	try {
		for (const [ file, text ] of files) {
			if (originals.get(file)?.equals(Buffer.from(text))) continue;
			touched.push(file);
			write(file, text);
		}
	} catch (error) {
		const restoreErrors = [];
		for (const file of touched.reverse()) {
			try {
				const original = originals.get(file);
				if (original === null) rmSync(file, { force: true });
				else writeFileSync(file, original);
			} catch (restoreError) { restoreErrors.push(`${file}: ${restoreError.message}`); }
		}
		throw new Error(`write failed: ${error.message}${restoreErrors.length ? `; restoration failed: ${restoreErrors.join('; ')}` : '; original files restored'}`);
	}
}

export function refreshSheet(input, { root = repoRoot, apply = false } = {}) {
	const snapshot = buildSnapshot(input);
	const stage = mkdtempSync(path.join(tmpdir(), 'l10n-refresh-'));
	try {
		const snapshotDir = path.join(stage, 'l10n/sheet-snapshot');
		const outDir = path.join(stage, 'src/l10n/generated/zh-TW');
		mkdirSync(snapshotDir, { recursive: true });
		mkdirSync(outDir, { recursive: true });
		for (const [ name, text ] of snapshot) writeFileSync(path.join(snapshotDir, name), text);
		const catalog = buildCatalog(snapshotDir);
		for (const [ name, text ] of catalog) writeFileSync(path.join(outDir, name), text);
		const issues = runCheck(root, stage);
		if (issues.length) throw new Error(formatIssues(issues));
		const files = new Map([
			...Array.from(snapshot, ([ name, text ]) => [ path.join(root, 'l10n/sheet-snapshot', name), text ]),
			...Array.from(catalog, ([ name, text ]) => [ path.join(root, 'src/l10n/generated/zh-TW', name), text ])
		]);
		const changes = Array.from(files).filter(([ file, text ]) => !existsSync(file) || !readFileSync(file).equals(Buffer.from(text)))
			.map(([ file, text ]) => ({ file: path.relative(root, file).replaceAll('\\', '/'), sha256: createHash('sha256').update(text).digest('hex') }));
		if (apply) replaceFiles(files);
		return { applied: apply, changes, counts: JSON.parse(catalog.get('meta.json')).counts,
			dynamicNotes: Object.keys(JSON.parse(snapshot.get('calculation-displays.json'))).length };
	} finally {
		rmSync(stage, { recursive: true, force: true });
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		const args = process.argv.slice(2);
		const apply = args.includes('--apply');
		const remaining = args.filter(arg => arg !== '--apply');
		if (remaining.length !== 2 || remaining[0] !== '--input' || remaining[1].startsWith('--')) {
			throw new Error('usage: node scripts/l10n/refresh-sheet.mjs --input <approved-capture.json> [--apply]');
		}
		console.log(json(refreshSheet(JSON.parse(readFileSync(remaining[1], 'utf8')), { apply })));
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
