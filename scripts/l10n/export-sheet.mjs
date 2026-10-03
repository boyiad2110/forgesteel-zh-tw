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
 * A temp copy can be checked without touching the committed snapshot:
 *   node scripts/l10n/export-sheet.mjs --snapshot <dir> --out <dir>
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
	console.error(message);
	process.exit(1);
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
const parseCsv = (text, file) => {
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

		if (status === 'APPROVED') {
			entries[id] = {
				en,
				updated,
				zh
			};
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

const main = () => {
	const options = parseArgs(process.argv.slice(2));
	const source = readSource(options.snapshotDir);
	const seen = new Map();
	const errors = [];
	const tabs = TABS.map(spec => loadTab(options.snapshotDir, spec, seen, errors));

	if (errors.length > 0) {
		fail(errors.join('\n'));
	}

	const files = buildOutput(source, tabs);
	if (options.check) {
		checkOutput(options.outDir, files);
	} else {
		writeOutput(options.outDir, files);
	}
};

main();
