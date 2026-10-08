/**
 * Export the approved zh-TW Master Sheet snapshot to JSON.
 *
 *   node scripts/l10n/export-sheet.mjs
 *   node scripts/l10n/export-sheet.mjs --check
 *
 * Reads l10n/sheet-snapshot/*.csv by column header name (never by position)
 * and writes src/l10n/generated/zh-TW/. The sheet id and modified time come
 * from l10n/sheet-snapshot/source.json so a later refresh only replaces data.
 *
 * strings.csv may also carry four Forge Steel columns, found by header name:
 * Forge Steel Source Text, Forge Steel Target Text, Forge Steel Status, and
 * Forge Steel Basis Hash. They are all present once, or all absent. A row
 * that fills any of them must be APPROVED in both Status columns, with
 * non-empty source and target text and a 64-character lowercase basis hash.
 * That row is exported as `fs`. Export does not check whether the basis hash
 * is stale. Glossary and names ignore these columns.
 *
 * A temp copy can be checked without touching the committed snapshot:
 *   node scripts/l10n/export-sheet.mjs --snapshot <dir> --out <dir>
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const ALLOWED_STATUS = [ 'NEW', 'AI_DRAFT', 'REVIEW', 'APPROVED', 'DEPRECATED' ];
const ALLOWED_STATUS_SET = new Set(ALLOWED_STATUS);
// Every ID in the approved snapshot matches this, so the rule was not relaxed.
const ID_PATTERN = /^[a-z0-9]+(?:[.\-_][a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TM_CHECK_HEADER = 'TM Check';
const STATUS_HEADER = 'Status';
const UPDATED_HEADER = 'Last Updated';
const FS_HEADERS = [
	'Forge Steel Source Text',
	'Forge Steel Target Text',
	'Forge Steel Status',
	'Forge Steel Basis Hash'
];
const FS_HASH = /^[0-9a-f]{64}$/;

const TABS = [
	{
		file: 'glossary.csv',
		out: 'glossary.json',
		countKey: 'glossary',
		idHeader: 'Glossary ID',
		zhHeader: 'Target Term',
		enHeader: 'Source Term'
	},
	{
		file: 'names.csv',
		out: 'names.json',
		countKey: 'names',
		idHeader: 'Name ID',
		zhHeader: 'Target Name',
		enHeader: 'Source Name'
	},
	{
		file: 'strings.csv',
		out: 'strings.json',
		countKey: 'strings',
		idHeader: 'String ID',
		zhHeader: 'Target Text',
		enHeader: 'Source Text'
	}
];

const fail = message => {
	throw new Error(message);
};

const parseArgs = argv => {
	const options = {
		check: false,
		snapshotDir: path.join(root, 'l10n/sheet-snapshot'),
		outDir: path.join(root, 'src/l10n/generated/zh-TW')
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--check') {
			options.check = true;
			continue;
		}
		if (arg === '--snapshot' || arg === '--out') {
			const value = argv[++i];
			if (!value || value.startsWith('--')) {
				fail(`${arg} requires a directory`);
			}
			const resolved = path.resolve(value);
			if (arg === '--snapshot') {
				options.snapshotDir = resolved;
			} else {
				options.outDir = resolved;
			}
			continue;
		}
		fail(`unknown argument ${JSON.stringify(arg)}`);
	}

	return options;
};

const readText = file => {
	try {
		const text = readFileSync(file, 'utf8');
		return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
	} catch (error) {
		fail(`cannot read ${file}: ${error.message}`);
	}
};

/**
 * RFC 4180 reader. Separators are comma and LF or CRLF.
 * Quoted fields may contain commas, newlines, and "" escapes.
 * Field text is returned verbatim (no trim, no newline normalization).
 */
export const parseCsv = (text, file) => {
	const rows = [];
	let row = [];
	let field = '';
	// start: next char begins a field; bare: unquoted; quoted: inside quotes;
	// closed: closing quote seen, only a delimiter or EOF may follow.
	let state = 'start';
	let record = 1;

	const malformed = message => fail(`${file} row ${record}: ${message}`);

	const endField = () => {
		row.push(field);
		field = '';
		state = 'start';
	};

	const endRecord = () => {
		endField();
		rows.push(row);
		row = [];
		record += 1;
	};

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (state === 'quoted') {
			if (char === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i += 1;
				} else {
					state = 'closed';
				}
			} else {
				field += char;
			}
			continue;
		}

		if (char === '"') {
			if (state !== 'start') {
				malformed('unexpected quote in unquoted field');
			}
			state = 'quoted';
			continue;
		}

		if (char === ',') {
			endField();
			continue;
		}

		if (char === '\n' || char === '\r') {
			if (char === '\r' && text[i + 1] === '\n') {
				i += 1;
			}
			endRecord();
			continue;
		}

		if (state === 'closed') {
			malformed('unexpected character after closing quote');
		}

		field += char;
		state = 'bare';
	}

	if (state === 'quoted') {
		malformed('unclosed quoted field');
	}

	if (state !== 'start' || row.length > 0) {
		endRecord();
	}

	return rows;
};

const headerIndexes = (headers, name) => {
	const indexes = [];
	headers.forEach((header, index) => {
		if (header === name) {
			indexes.push(index);
		}
	});
	return indexes;
};

const where = (file, row, id) => `${file} row ${row} (${JSON.stringify(id)})`;

const hasEdgeWhitespace = value => value !== value.trim();

const readSource = snapshotDir => {
	const file = path.join(snapshotDir, 'source.json');
	let data;
	try {
		data = JSON.parse(readText(file));
	} catch (error) {
		fail(`cannot parse ${file}: ${error.message}`);
	}
	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		fail(`${file}: expected an object`);
	}
	if (typeof data.sheetFileId !== 'string' || data.sheetFileId === '') {
		fail(`${file}: missing sheetFileId`);
	}
	if (typeof data.sheetModifiedTime !== 'string' || data.sheetModifiedTime === '') {
		fail(`${file}: missing sheetModifiedTime`);
	}
	return {
		sheetFileId: data.sheetFileId,
		sheetModifiedTime: data.sheetModifiedTime
	};
};

const loadTab = (snapshotDir, spec, seen, errors) => {
	const file = spec.file;
	const rows = parseCsv(readText(path.join(snapshotDir, file)), file);
	const entries = {};

	if (rows.length === 0) {
		errors.push(`${file} row 1: missing required header ${JSON.stringify(spec.idHeader)}`);
		return { spec, entries };
	}

	const headers = rows[0];
	const required = [ spec.idHeader, STATUS_HEADER, spec.zhHeader, spec.enHeader, UPDATED_HEADER ];
	const columns = {};
	let headersOk = true;

	for (const name of required) {
		const indexes = headerIndexes(headers, name);
		if (indexes.length !== 1) {
			const problem = indexes.length === 0 ? 'missing required header' : 'duplicate header';
			errors.push(`${file} row 1: ${problem} ${JSON.stringify(name)}`);
			headersOk = false;
			continue;
		}
		columns[name] = indexes[0];
	}

	const tmIndexes = headerIndexes(headers, TM_CHECK_HEADER);
	if (tmIndexes.length > 1) {
		errors.push(`${file} row 1: duplicate header ${JSON.stringify(TM_CHECK_HEADER)}`);
		headersOk = false;
	}
	const tmIndex = tmIndexes.length === 1 ? tmIndexes[0] : -1;

	let fsColumns = null;
	if (spec.file === 'strings.csv') {
		const indexes = FS_HEADERS.map(name => headerIndexes(headers, name));
		const allAbsent = indexes.every(found => found.length === 0);
		const allOnce = indexes.every(found => found.length === 1);
		if (!allAbsent && !allOnce) {
			errors.push(`${file} row 1: Forge Steel columns must all be present once, or all be absent`);
			headersOk = false;
		} else if (allOnce) {
			fsColumns = {
				en: indexes[0][0],
				zh: indexes[1][0],
				status: indexes[2][0],
				basisHash: indexes[3][0]
			};
		}
	}

	if (!headersOk) {
		return { spec, entries };
	}

	for (let index = 1; index < rows.length; index++) {
		const row = rows[index];
		const sheetRow = index + 1;
		const id = columns[spec.idHeader] < row.length ? row[columns[spec.idHeader]] : '';

		if (row.length !== headers.length) {
			errors.push(`${where(file, sheetRow, id)}: expected ${headers.length} fields, found ${row.length}`);
			continue;
		}

		const status = row[columns[STATUS_HEADER]];
		const zh = row[columns[spec.zhHeader]];
		const en = row[columns[spec.enHeader]];
		const updated = row[columns[UPDATED_HEADER]];

		const fields = [
			[ spec.idHeader, id ],
			[ spec.zhHeader, zh ],
			[ spec.enHeader, en ],
			[ UPDATED_HEADER, updated ]
		];
		for (const [ name, value ] of fields) {
			if (hasEdgeWhitespace(value)) {
				errors.push(`${where(file, sheetRow, id)}: leading or trailing whitespace in ${JSON.stringify(name)}`);
			}
		}

		if (!ID_PATTERN.test(id)) {
			errors.push(`${where(file, sheetRow, id)}: malformed ID`);
		}

		if (!ALLOWED_STATUS_SET.has(status)) {
			errors.push(`${where(file, sheetRow, id)}: unknown Status ${JSON.stringify(status)} (allowed: ${ALLOWED_STATUS.join(', ')})`);
		}

		if (!DATE_PATTERN.test(updated)) {
			errors.push(`${where(file, sheetRow, id)}: Last Updated ${JSON.stringify(updated)} is not YYYY-MM-DD`);
		}

		if (status === 'APPROVED' && zh === '') {
			errors.push(`${where(file, sheetRow, id)}: APPROVED row has empty ${JSON.stringify(spec.zhHeader)}`);
		}
		if (status === 'APPROVED' && en === '') {
			errors.push(`${where(file, sheetRow, id)}: APPROVED row has empty ${JSON.stringify(spec.enHeader)}`);
		}

		if (tmIndex !== -1 && status === 'APPROVED' && row[tmIndex] !== 'PASS') {
			console.warn(`${where(file, sheetRow, id)}: TM Check is ${JSON.stringify(row[tmIndex])}, expected PASS`);
		}

		const previous = seen.get(id);
		if (previous) {
			errors.push(`${where(file, sheetRow, id)}: duplicate ID (also ${previous.file} row ${previous.row})`);
		} else {
			seen.set(id, { file, row: sheetRow });
		}

		let fs = null;
		if (fsColumns) {
			const fsEn = row[fsColumns.en];
			const fsZh = row[fsColumns.zh];
			const fsStatus = row[fsColumns.status];
			const fsBasis = row[fsColumns.basisHash];
			const fsCells = [
				[ 'Forge Steel Source Text', fsEn ],
				[ 'Forge Steel Target Text', fsZh ],
				[ 'Forge Steel Status', fsStatus ],
				[ 'Forge Steel Basis Hash', fsBasis ]
			];
			if (fsCells.some(([ , value ]) => value !== '')) {
				if (fsStatus !== 'APPROVED') {
					errors.push(`${where(file, sheetRow, id)}: Forge Steel Status must be APPROVED`);
				}
				if (status !== 'APPROVED') {
					errors.push(`${where(file, sheetRow, id)}: Status must be APPROVED when a Forge Steel version is present`);
				}
				if (fsEn === '' || fsZh === '') {
					errors.push(`${where(file, sheetRow, id)}: Forge Steel Source Text and Forge Steel Target Text must not be empty`);
				}
				for (const [ name, value ] of fsCells) {
					if (value !== '' && hasEdgeWhitespace(value)) {
						errors.push(`${where(file, sheetRow, id)}: leading or trailing whitespace in ${JSON.stringify(name)}`);
					}
				}
				if (!FS_HASH.test(fsBasis)) {
					errors.push(`${where(file, sheetRow, id)}: Forge Steel Basis Hash must be 64 lowercase hex characters`);
				}
				if (
					status === 'APPROVED'
					&& fsStatus === 'APPROVED'
					&& fsEn !== ''
					&& fsZh !== ''
					&& !hasEdgeWhitespace(fsEn)
					&& !hasEdgeWhitespace(fsZh)
					&& FS_HASH.test(fsBasis)
				) {
					fs = { basisHash: fsBasis, en: fsEn, zh: fsZh };
				}
			}
		}

		if (status === 'APPROVED') {
			entries[id] = {
				en,
				updated,
				zh
			};
			if (fs) {
				entries[id].fs = fs;
			}
		}
	}

	return { spec, entries };
};

const sortKeys = value => {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		return value;
	}
	const sorted = {};
	for (const key of Object.keys(value).sort()) {
		sorted[key] = sortKeys(value[key]);
	}
	return sorted;
};

const serialize = value => `${JSON.stringify(sortKeys(value), null, 2)}\n`;

const buildOutput = (source, tabs) => {
	const counts = {};
	const files = new Map();

	for (const tab of tabs) {
		counts[tab.spec.countKey] = Object.keys(tab.entries).length;
		files.set(tab.spec.out, serialize(tab.entries));
	}

	files.set('meta.json', serialize({
		_comment: 'GENERATED by scripts/l10n/export-sheet.mjs from l10n/sheet-snapshot/ - DO NOT EDIT',
		counts,
		sheetFileId: source.sheetFileId,
		sheetModifiedTime: source.sheetModifiedTime
	}));

	return files;
};

const checkOutput = (outDir, files) => {
	const diffs = [];

	for (const [ name, text ] of files) {
		const file = path.join(outDir, name);
		let actual;
		try {
			actual = readFileSync(file);
		} catch (error) {
			if (error.code === 'ENOENT') {
				diffs.push(`${name} (missing)`);
				continue;
			}
			fail(`cannot read ${file}: ${error.message}`);
		}
		if (!actual.equals(Buffer.from(text, 'utf8'))) {
			diffs.push(`${name} (content differs)`);
		}
	}

	if (diffs.length > 0) {
		fail(`check failed: ${path.relative(root, outDir) || outDir} differs from the snapshot\n${diffs.join('\n')}`);
	}

	console.log(`check ok: ${path.relative(root, outDir)}`);
};

const writeOutput = (outDir, files) => {
	mkdirSync(outDir, { recursive: true });
	for (const [ name, text ] of files) {
		writeFileSync(path.join(outDir, name), text);
	}
	console.log(`exported ${path.relative(root, outDir)}`);
};

/** Verbatim Note cells captured separately so the static translation CSV stays unchanged. */
const loadCalculationDisplays = (snapshotDir, tabs, errors) => {
	const file = path.join(snapshotDir, 'calculation-displays.json');
	if (!existsSync(file)) {
		return;
	}
	let notes;
	try {
		notes = JSON.parse(readText(file));
	} catch (error) {
		errors.push(`calculation-displays.json: ${error.message}`);
		return;
	}
	if (!notes || typeof notes !== 'object' || Array.isArray(notes)) {
		errors.push('calculation-displays.json: expected an object of String IDs and verbatim Forge Steel Note cells');
		return;
	}
	const strings = tabs.find(tab => tab.spec.file === 'strings.csv').entries;
	for (const [ id, note ] of Object.entries(notes)) {
		try {
			const lines = typeof note === 'string' ? note.split(/\r?\n/).filter(line => line.startsWith('Calculation Display: ')) : [];
			if (lines.length !== 1 || !strings[id]?.fs) {
				throw new Error('expected one Calculation Display record on an approved Forge Steel row');
			}
			const display = JSON.parse(lines[0].slice('Calculation Display: '.length));
			if (!display || typeof display !== 'object' || Array.isArray(display)
				|| Object.keys(display).length !== 3 || display.status !== 'APPROVED'
				|| typeof display.target !== 'string' || !display.target
				|| strings[id].fs.zh.split(display.target).length !== 2
				|| typeof display.template !== 'string' || display.template.split('{value}').length !== 2
				|| /[{}]/.test(display.template.replace('{value}', ''))) {
				throw new Error('expected an APPROVED { status, target, template } with one unique target and one {value} placeholder');
			}
			strings[id].fs.calculationDisplay = { target: display.target, template: display.template };
		} catch (error) {
			errors.push(`calculation-displays.json [${id}]: ${error.message}`);
		}
	}
};

export const buildCatalog = snapshotDir => {
	const source = readSource(snapshotDir);
	const seen = new Map();
	const errors = [];
	const tabs = TABS.map(spec => loadTab(snapshotDir, spec, seen, errors));
	loadCalculationDisplays(snapshotDir, tabs, errors);

	if (errors.length > 0) {
		fail(errors.join('\n'));
	}

	return buildOutput(source, tabs);
};

const main = () => {
	const options = parseArgs(process.argv.slice(2));
	const files = buildCatalog(options.snapshotDir);
	if (options.check) {
		checkOutput(options.outDir, files);
	} else {
		writeOutput(options.outDir, files);
	}
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		main();
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
