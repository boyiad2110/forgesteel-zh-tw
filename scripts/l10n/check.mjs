#!/usr/bin/env node
/**
 * Localization guard. Zero dependencies.
 *
 *   node scripts/l10n/check.mjs
 *
 * Fails when Chinese is hand-written into the app, when the mapping table
 * points at a sheet row that was not exported, when upstream English has
 * moved since a row was approved, when the generated JSON is stale, or when
 * a mapping key is malformed or repeated.
 *
 * CJK allowlist — keep this tiny. Everything under src/l10n/generated/ is
 * already skipped (it is the exported sheet). These two files are the only
 * other places Han characters may appear:
 *
 *   src/l10n/language.ts
 *     The language switch's own labels. They are not translations of game text.
 *   src/l10n/lookup.test.ts
 *     A fake translation the lookup tests assert against.
 *
 * Mapping shape (src/l10n/mapping.ts):
 *
 *   'element:<id>:<field>':  { sheetId, enHash }
 *   'enum:<Enum>:<Member>':  { sheetId, enHash }
 *   'ui:<id>':               { sheetId, enHash }
 *   'data:<Class>:<field>':  { sheetId, enHash, stripHeading? }
 *
 * enHash is sha256 hex of the Forge Steel English at approval time.
 * The check recomputes that English in plain Node, with no browser:
 *
 *   element  — the string literal on the object in src/data whose id matches
 *   enum     — the string literal assigned to that member in src/enums
 *   ui       — the value of that id in src/l10n/ui-english.json
 *   data     — the template literal on that static field of the class in src/data
 *
 * A template literal cooks CR LF and a lone CR into LF. The check does the
 * same to every recomputed English string, and to Sheet English before a
 * comparison, so a core.autocrlf checkout hashes like the runtime string.
 *
 * stripHeading means the sheet row is a title line, a blank line, then the
 * rules. The display strips that title when it shows the Chinese. The check
 * strips the same way and requires the sheet English body to equal the
 * trimmed Forge Steel template. The exported JSON is left unchanged.
 *
 * Every mapped key's sheet English must equal the Forge Steel English.
 * Sheet English is the exported `en` field, copied from the snapshot's
 * Source Text column. stripHeading rows compare the body after the title
 * is removed, so a rules heading is not itself a difference. A difference
 * that is only punctuation, or only the articles a/an/the, may be listed in
 * src/l10n/english-exceptions.json with a kind (`punctuation` or `article`)
 * and a note. Any other difference fails. An exception whose texts already
 * match, or whose kind does not match the actual difference, also fails.
 *
 * A strings.json row may include `fs`, the Forge Steel version. For a mapped
 * key whose row has `fs`, English is compared with `fs.en` instead of the
 * book `en`. `fs.en` must equal the Forge Steel English exactly. `fs.basisHash`
 * must equal the sha256 of the current book Chinese (`zh`); if it does not,
 * the check fails and the message says the Forge Steel version is stale.
 * That key cannot be listed in english-exceptions.json and cannot set
 * stripHeading. Every `fs` row must be referenced by at least one mapping key.
 *
 * Element and enum English are read from the source text (one string literal,
 * no browser and no TypeScript loader). A computed value has no literal, so
 * the check fails closed instead of guessing. ui-english.json is only required
 * when a ui: key exists.
 *
 *   node -e "import { hashEnglish } from './scripts/l10n/check.mjs'; console.log(hashEnglish('Orc'))"
 */

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');

const CJK_ALLOWLIST = new Set([
	'src/l10n/language.ts',
	'src/l10n/lookup.test.ts'
]);

const HAN = /\p{Script=Han}/u;
const HASH = /^[0-9a-f]{64}$/;
const KEY_PATTERNS = [
	/^element:[a-z0-9]+(?:[-_][a-z0-9]+)*:[A-Za-z][A-Za-z0-9]*$/,
	/^enum:[A-Za-z][A-Za-z0-9]*:[A-Za-z][A-Za-z0-9]*$/,
	/^ui:[a-z0-9]+(?:[.\-_][a-z0-9]+)*$/,
	/^data:[A-Za-z][A-Za-z0-9]*:[A-Za-z][A-Za-z0-9]*$/
];
const BINARY_EXT = new Set([
	'.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico',
	'.ttf', '.otf', '.woff', '.woff2', '.mp3', '.wav'
]);
const SHEET_FILES = [ 'glossary.json', 'names.json', 'strings.json' ];

const posix = value => value.split(path.sep).join('/');

export const hashEnglish = text => {
	return createHash('sha256').update(text, 'utf8').digest('hex');
};

/**
 * Cooked template values turn CR LF and a lone CR into LF.
 * Do CR LF first so it does not become two line feeds.
 */
export const normalizeEnglish = text => {
	return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};

const ARTICLES = new Set([ 'a', 'an', 'the' ]);

/** Punctuation becomes a space, then spaces collapse, so a dash and ' - ' agree. */
export const withoutPunctuation = text => {
	return normalizeEnglish(text).replace(/\p{P}/gu, ' ').replace(/\s+/g, ' ').trim();
};

/** Drops the articles a, an, and the. The remaining words and punctuation stay. */
export const withoutArticles = text => {
	return normalizeEnglish(text)
		.split(/\s+/)
		.filter(word => !ARTICLES.has(word.toLowerCase()))
		.join(' ')
		.trim();
};

/**
 * How two English strings differ.
 * `same`, `punctuation`, `article`, or `content`.
 * Punctuation is tested first. A mix of both is `content` and cannot be listed.
 */
export const englishDifference = (forge, sheet) => {
	const left = normalizeEnglish(forge);
	const right = normalizeEnglish(sheet);
	if (left === right) {
		return 'same';
	}
	if (withoutPunctuation(left) === withoutPunctuation(right)) {
		return 'punctuation';
	}
	if (withoutArticles(left) === withoutArticles(right)) {
		return 'article';
	}
	return 'content';
};

/**
 * Drop the first line and the blank line under it.
 * The same rule lives in src/l10n/text.ts. Keep the two copies identical.
 */
export const stripRulesHeading = text => {
	if (typeof text !== 'string') {
		return null;
	}
	const splitAt = text.indexOf('\n');
	if (splitAt <= 0) {
		return null;
	}
	const rest = text.slice(splitAt + 1);
	if (!rest.startsWith('\n')) {
		return null;
	}
	const body = rest.slice(1);
	if (body.trim().length === 0) {
		return null;
	}
	return body;
};

const issue = (rule, file, line, key, message) => {
	return { rule, file, line, key, message };
};

const formatIssue = item => {
	const where = item.line ? `${item.file}:${item.line}` : item.file;
	const key = item.key ? ` [${item.key}]` : '';
	return `${item.rule}: ${where}${key} ${item.message}`;
};

const walk = dir => {
	const files = [];
	let entries;
	try {
		entries = readdirSync(dir);
	} catch (error) {
		if (error.code === 'ENOENT') {
			return files;
		}
		throw error;
	}
	for (const name of entries) {
		const file = path.join(dir, name);
		const stat = statSync(file);
		if (stat.isDirectory()) {
			files.push(...walk(file));
		} else {
			files.push(file);
		}
	}
	return files;
};

const read = file => {
	try {
		return readFileSync(file, 'utf8');
	} catch (error) {
		if (error.code === 'ENOENT') {
			return null;
		}
		throw error;
	}
};

const lineOf = (text, index) => {
	let line = 1;
	for (let i = 0; i < index && i < text.length; i++) {
		if (text[i] === '\n') {
			line += 1;
		}
	}
	return line;
};

const skipComment = (text, i, line) => {
	if (text[i] !== '/' ) {
		return null;
	}
	if (text[i + 1] === '/') {
		while (i < text.length && text[i] !== '\n') {
			i += 1;
		}
		return { i, line };
	}
	if (text[i + 1] === '*') {
		i += 2;
		while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
			if (text[i] === '\n') {
				line += 1;
			}
			i += 1;
		}
		return { i: i + 2, line };
	}
	return null;
};

const readString = (text, i, line) => {
	const quote = text[i];
	let value = '';
	i += 1;
	while (i < text.length) {
		const char = text[i];
		if (char === '\n') {
			line += 1;
			if (quote !== '`') {
				return { ok: false, i, line };
			}
		}
		if (char === '\\') {
			const next = text[i + 1] ?? '';
			if (next === 'n') {
				value += '\n';
			} else if (next === 'r') {
				value += '\r';
			} else if (next === 't') {
				value += '\t';
			} else {
				value += next;
			}
			if (next === '\n') {
				line += 1;
			}
			i += 2;
			continue;
		}
		if (quote === '`' && char === '$' && text[i + 1] === '{') {
			return { ok: false, i, line };
		}
		if (char === quote) {
			return { ok: true, value, i: i + 1, line };
		}
		value += char;
		i += 1;
	}
	return { ok: false, i, line };
};

const tokenize = text => {
	const tokens = [];
	let i = 0;
	let line = 1;
	while (i < text.length) {
		const char = text[i];
		if (char === '\n') {
			line += 1;
			i += 1;
			continue;
		}
		if (char === ' ' || char === '\t' || char === '\r') {
			i += 1;
			continue;
		}
		const comment = skipComment(text, i, line);
		if (comment) {
			i = comment.i;
			line = comment.line;
			continue;
		}
		if (char === '\'' || char === '"' || char === '`') {
			const parsed = readString(text, i, line);
			i = parsed.i;
			line = parsed.line;
			if (parsed.ok) {
				tokens.push({ kind: 'string', value: parsed.value, line });
			}
			continue;
		}
		if (/[A-Za-z_$]/.test(char)) {
			const start = i;
			const startLine = line;
			i += 1;
			while (i < text.length && /[A-Za-z0-9_$]/.test(text[i])) {
				i += 1;
			}
			tokens.push({ kind: 'ident', value: text.slice(start, i), line: startLine });
			continue;
		}
		if (char === '{' || char === '}' || char === ':' || char === '=') {
			const kind = char === ':' ? 'colon' : char === '=' ? 'equals' : 'brace';
			tokens.push({ kind, value: char, line });
			i += 1;
			continue;
		}
		i += 1;
	}
	return tokens;
};

const objectsWithId = text => {
	const tokens = tokenize(text);
	const stack = [];
	const found = [];
	let depth = 0;
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.kind === 'brace' && token.value === '{') {
			depth += 1;
			stack.push({ depth, fields: new Map(), line: token.line });
			continue;
		}
		if (token.kind === 'brace' && token.value === '}') {
			const top = stack.pop();
			if (top?.fields.has('id')) {
				found.push(top);
			}
			depth -= 1;
			continue;
		}
		const colon = tokens[i + 1];
		const value = tokens[i + 2];
		if (token.kind === 'ident' && colon?.kind === 'colon' && value?.kind === 'string') {
			const top = stack[stack.length - 1];
			if (top && top.depth === depth && !top.fields.has(token.value)) {
				top.fields.set(token.value, { text: value.value, line: token.line });
			}
			i += 2;
		}
	}
	return found;
};

const indexElements = root => {
	const index = new Map();
	const duplicates = new Set();
	for (const file of walk(path.join(root, 'src/data'))) {
		if (!file.endsWith('.ts')) {
			continue;
		}
		const text = read(file);
		if (text === null || text.includes('\0')) {
			continue;
		}
		for (const object of objectsWithId(text)) {
			const id = object.fields.get('id').text;
			if (index.has(id)) {
				duplicates.add(id);
			}
			index.set(id, { fields: object.fields, file: posix(path.relative(root, file)) });
		}
	}
	return { index, duplicates };
};

const enumEnglish = (root, enumName, member) => {
	for (const file of walk(path.join(root, 'src/enums'))) {
		if (!file.endsWith('.ts')) {
			continue;
		}
		const text = read(file);
		if (text === null || !new RegExp(`export enum ${enumName}\\b`).test(text)) {
			continue;
		}
		const tokens = tokenize(text);
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			const name = tokens[i + 1];
			if (token.kind !== 'ident' || token.value !== 'enum' || name?.kind !== 'ident' || name.value !== enumName) {
				continue;
			}
			let open = i + 2;
			while (open < tokens.length && !(tokens[open].kind === 'brace' && tokens[open].value === '{')) {
				open += 1;
			}
			let depth = 0;
			for (let k = open; k < tokens.length; k++) {
				const current = tokens[k];
				if (current.kind === 'brace' && current.value === '{') {
					depth += 1;
					continue;
				}
				if (current.kind === 'brace' && current.value === '}') {
					depth -= 1;
					if (depth === 0) {
						break;
					}
					continue;
				}
				const equals = tokens[k + 1];
				const value = tokens[k + 2];
				if (depth === 1 && current.kind === 'ident' && current.value === member && equals?.kind === 'equals' && value?.kind === 'string') {
					return { english: value.value };
				}
			}
			return { error: `enum ${enumName} has no string member ${member}` };
		}
		return { error: `enum ${enumName} was not found under src/enums` };
	}
	return { error: `enum ${enumName} was not found under src/enums` };
};

const uiEnglish = (root, id) => {
	const file = path.join(root, 'src/l10n/ui-english.json');
	const text = read(file);
	if (text === null) {
		return { error: 'src/l10n/ui-english.json is missing' };
	}
	let data;
	try {
		data = JSON.parse(text);
	} catch (error) {
		return { error: `src/l10n/ui-english.json: ${error.message}` };
	}
	if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data[id] !== 'string') {
		return { error: `src/l10n/ui-english.json has no string ${id}` };
	}
	return { english: data[id] };
};

const elementEnglish = (root, cache, id, field) => {
	cache.current ??= indexElements(root);
	const { index, duplicates } = cache.current;
	if (duplicates.has(id)) {
		return { error: `element id ${id} is defined more than once under src/data` };
	}
	const object = index.get(id);
	if (!object) {
		return { error: `element id ${id} was not found under src/data` };
	}
	const value = object.fields.get(field);
	if (!value) {
		return { error: `element ${id} has no string field ${field} (${object.file})` };
	}
	return { english: value.text };
};

const dataEnglish = (root, className, field) => {
	for (const file of walk(path.join(root, 'src/data'))) {
		if (!file.endsWith('.ts')) {
			continue;
		}
		const text = read(file);
		if (text === null || !new RegExp(`export class ${className}\\b`).test(text)) {
			continue;
		}
		const tokens = tokenize(text);
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			const name = tokens[i + 1];
			if (token.kind !== 'ident' || token.value !== 'class' || name?.kind !== 'ident' || name.value !== className) {
				continue;
			}
			let open = i + 2;
			while (open < tokens.length && !(tokens[open].kind === 'brace' && tokens[open].value === '{')) {
				open += 1;
			}
			let depth = 0;
			for (let k = open; k < tokens.length; k++) {
				const current = tokens[k];
				if (current.kind === 'brace' && current.value === '{') {
					depth += 1;
					continue;
				}
				if (current.kind === 'brace' && current.value === '}') {
					depth -= 1;
					if (depth === 0) {
						break;
					}
					continue;
				}
				const equals = tokens[k + 1];
				const value = tokens[k + 2];
				const previous = tokens[k - 1];
				if (
					depth === 1
					&& previous?.kind === 'ident'
					&& previous.value === 'static'
					&& current.kind === 'ident'
					&& current.value === field
					&& equals?.kind === 'equals'
					&& value?.kind === 'string'
				) {
					return { english: value.value };
				}
			}
			return { error: `class ${className} has no template field ${field}` };
		}
		return { error: `class ${className} was not found under src/data` };
	}
	return { error: `class ${className} was not found under src/data` };
};

const cookedEnglish = resolved => {
	if (typeof resolved.english === 'string') {
		return { english: normalizeEnglish(resolved.english) };
	}
	return resolved;
};

export const forgeEnglish = (root, key, cache = { current: null }) => {
	const element = /^element:([^:]+):([^:]+)$/.exec(key);
	if (element) {
		return cookedEnglish(elementEnglish(root, cache, element[1], element[2]));
	}
	const enumeration = /^enum:([^:]+):([^:]+)$/.exec(key);
	if (enumeration) {
		return cookedEnglish(enumEnglish(root, enumeration[1], enumeration[2]));
	}
	const data = /^data:([^:]+):([^:]+)$/.exec(key);
	if (data) {
		return cookedEnglish(dataEnglish(root, data[1], data[2]));
	}
	const ui = /^ui:(.+)$/.exec(key);
	if (ui) {
		return cookedEnglish(uiEnglish(root, ui[1]));
	}
	return { error: 'key is not an element, enum, data, or ui key' };
};

const matchBrace = (text, open) => {
	let depth = 0;
	let i = open;
	let line = lineOf(text, open);
	while (i < text.length) {
		const char = text[i];
		if (char === '\n') {
			line += 1;
			i += 1;
			continue;
		}
		const comment = skipComment(text, i, line);
		if (comment) {
			i = comment.i;
			line = comment.line;
			continue;
		}
		if (char === '\'' || char === '"' || char === '`') {
			const parsed = readString(text, i, line);
			i = parsed.i;
			line = parsed.line;
			continue;
		}
		if (char === '{') {
			depth += 1;
		} else if (char === '}') {
			depth -= 1;
			if (depth === 0) {
				return i;
			}
		}
		i += 1;
	}
	return -1;
};

const parseMapping = (file, text) => {
	const errors = [];
	const entries = [];
	const marker = text.indexOf('export const mapping');
	if (marker < 0) {
		errors.push(issue('mapping-key', file, 1, null, 'missing `export const mapping`'));
		return { entries, errors };
	}
	const eq = text.indexOf('=', marker);
	const open = text.indexOf('{', eq);
	if (eq < 0 || open < 0) {
		errors.push(issue('mapping-key', file, lineOf(text, marker), null, 'mapping has no object literal'));
		return { entries, errors };
	}
	const close = matchBrace(text, open);
	if (close < 0) {
		errors.push(issue('mapping-key', file, lineOf(text, open), null, 'mapping object is not closed'));
		return { entries, errors };
	}

	const tokens = tokenize(text.slice(open, close + 1));
	const lineOffset = lineOf(text, open) - 1;
	for (const token of tokens) {
		token.line += lineOffset;
	}
	const seen = new Map();
	let depth = 0;
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.kind === 'brace') {
			depth += token.value === '{' ? 1 : -1;
			continue;
		}
		if (depth !== 1 || token.kind !== 'string') {
			continue;
		}
		const colon = tokens[i + 1];
		const brace = tokens[i + 2];
		if (colon?.kind !== 'colon' || brace?.kind !== 'brace' || brace.value !== '{') {
			errors.push(issue('mapping-entry', file, token.line, token.value, 'each entry must be { sheetId, enHash }'));
			continue;
		}
		if (seen.has(token.value)) {
			errors.push(issue(
				'mapping-duplicate',
				file,
				token.line,
				token.value,
				`duplicate key (first seen at line ${seen.get(token.value)})`
			));
		} else {
			seen.set(token.value, token.line);
		}

		const fields = {};
		let inner = 1;
		let j = i + 3;
		for (; j < tokens.length; j++) {
			const innerToken = tokens[j];
			if (innerToken.kind === 'brace') {
				inner += innerToken.value === '{' ? 1 : -1;
				if (inner === 0) {
					break;
				}
				continue;
			}
			if (inner === 1 && innerToken.kind === 'ident') {
				const value = tokens[j + 2];
				if (tokens[j + 1]?.kind !== 'colon') {
					continue;
				}
				if (value?.kind === 'string') {
					fields[innerToken.value] = value.value;
					j += 2;
				} else if (value?.kind === 'ident' && (value.value === 'true' || value.value === 'false')) {
					fields[innerToken.value] = value.value === 'true';
					j += 2;
				}
			}
		}
		i = j;

		const keyOk = KEY_PATTERNS.some(pattern => pattern.test(token.value));
		if (!keyOk) {
			errors.push(issue('mapping-key', file, token.line, token.value, 'malformed key'));
			continue;
		}
		const unexpected = Object.keys(fields).filter(name => name !== 'sheetId' && name !== 'enHash' && name !== 'stripHeading');
		if (unexpected.length > 0) {
			errors.push(issue('mapping-entry', file, token.line, token.value, `unknown field ${unexpected[0]}`));
			continue;
		}
		if (typeof fields.sheetId !== 'string' || fields.sheetId === '') {
			errors.push(issue('mapping-entry', file, token.line, token.value, 'missing sheetId'));
			continue;
		}
		if (!HASH.test(fields.enHash ?? '')) {
			errors.push(issue('mapping-entry', file, token.line, token.value, 'enHash must be a sha256 hex digest'));
			continue;
		}
		if ('stripHeading' in fields && fields.stripHeading !== true) {
			errors.push(issue('mapping-entry', file, token.line, token.value, 'stripHeading must be true'));
			continue;
		}
		if (!seen.get(token.value) || seen.get(token.value) === token.line) {
			entries.push({
				key: token.value,
				sheetId: fields.sheetId,
				enHash: fields.enHash,
				stripHeading: fields.stripHeading === true,
				line: token.line
			});
		}
	}
	return { entries, errors };
};

const loadSheetIds = (dir, file) => {
	const ids = new Set();
	const errors = [];
	for (const name of SHEET_FILES) {
		const text = read(path.join(dir, name));
		if (text === null) {
			errors.push(issue('mapping-sheet', file, null, null, `generated file ${name} is missing`));
			continue;
		}
		let data;
		try {
			data = JSON.parse(text);
		} catch (error) {
			errors.push(issue('mapping-sheet', file, null, null, `${name}: ${error.message}`));
			continue;
		}
		if (!data || typeof data !== 'object' || Array.isArray(data)) {
			errors.push(issue('mapping-sheet', file, null, null, `${name} is not an object`));
			continue;
		}
		for (const id of Object.keys(data)) {
			ids.add(id);
		}
	}
	return { ids, errors };
};

const hasForgeSteel = row => {
	return !!row && typeof row === 'object' && Object.prototype.hasOwnProperty.call(row, 'fs') && row.fs !== undefined;
};

const loadSheetRows = dir => {
	const rows = new Map();
	for (const name of SHEET_FILES) {
		const text = read(path.join(dir, name));
		if (text === null) {
			continue;
		}
		let data;
		try {
			data = JSON.parse(text);
		} catch {
			continue;
		}
		if (!data || typeof data !== 'object' || Array.isArray(data)) {
			continue;
		}
		for (const [ id, row ] of Object.entries(data)) {
			if (!row || typeof row !== 'object' || rows.has(id)) {
				continue;
			}
			const stored = { en: row.en, zh: row.zh };
			if (hasForgeSteel(row)) {
				stored.fs = row.fs;
			}
			rows.set(id, stored);
		}
	}
	return rows;
};

const EXCEPTION_KINDS = new Set([ 'punctuation', 'article' ]);
const EXCEPTIONS_FILE = 'src/l10n/english-exceptions.json';

const loadExceptions = root => {
	const exceptions = new Map();
	const errors = [];
	const text = read(path.join(root, EXCEPTIONS_FILE));
	if (text === null) {
		return { exceptions, errors };
	}
	let data;
	try {
		data = JSON.parse(text);
	} catch (error) {
		errors.push(issue('sheet-english', EXCEPTIONS_FILE, null, null, error.message));
		return { exceptions, errors };
	}
	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		errors.push(issue('sheet-english', EXCEPTIONS_FILE, null, null, 'exceptions file must be an object'));
		return { exceptions, errors };
	}
	for (const [ key, value ] of Object.entries(data)) {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			errors.push(issue('sheet-english', EXCEPTIONS_FILE, null, key, 'each exception must be { kind, note }'));
			continue;
		}
		const extra = Object.keys(value).filter(name => name !== 'kind' && name !== 'note');
		if (extra.length > 0) {
			errors.push(issue('sheet-english', EXCEPTIONS_FILE, null, key, `unknown field ${extra[0]}`));
			continue;
		}
		if (!EXCEPTION_KINDS.has(value.kind)) {
			errors.push(issue('sheet-english', EXCEPTIONS_FILE, null, key, 'kind must be punctuation or article'));
			continue;
		}
		if (typeof value.note !== 'string' || value.note.trim() === '') {
			errors.push(issue('sheet-english', EXCEPTIONS_FILE, null, key, 'note must be a non-empty string'));
			continue;
		}
		exceptions.set(key, { kind: value.kind, note: value.note });
	}
	return { exceptions, errors };
};

const englishPreview = (sheet, forge) => {
	let index = 0;
	const limit = Math.min(sheet.length, forge.length);
	while (index < limit && sheet[index] === forge[index]) {
		index += 1;
	}
	const start = Math.max(0, index - 24);
	const sheetBit = sheet.slice(start, index + 24);
	const forgeBit = forge.slice(start, index + 24);
	return `sheet ${JSON.stringify(sheetBit)} forge ${JSON.stringify(forgeBit)}`;
};

const forgeSteelShape = fs => {
	return !!fs
		&& typeof fs === 'object'
		&& !Array.isArray(fs)
		&& typeof fs.en === 'string'
		&& typeof fs.zh === 'string'
		&& typeof fs.basisHash === 'string';
};

const checkForgeSteelVersion = (entry, row, forgeEn, hasException) => {
	const found = [];
	const fs = row.fs;
	if (!forgeSteelShape(fs)) {
		found.push(issue('forge-steel', 'src/l10n/mapping.ts', entry.line, entry.key, 'Forge Steel version is missing en, zh, or basisHash'));
		return found;
	}
	if (entry.stripHeading) {
		found.push(issue('forge-steel', 'src/l10n/mapping.ts', entry.line, entry.key, 'stripHeading cannot be set on a Forge Steel version'));
	}
	if (hasException) {
		found.push(issue('forge-steel', EXCEPTIONS_FILE, null, entry.key, 'Forge Steel version cannot be listed in english-exceptions'));
	}
	if (forgeEn !== fs.en) {
		found.push(issue(
			'forge-steel',
			'src/l10n/mapping.ts',
			entry.line,
			entry.key,
			`Forge Steel English does not match Forge Steel Source Text (${englishPreview(fs.en, forgeEn)})`
		));
	}
	const current = typeof row.zh === 'string' ? hashEnglish(row.zh) : '';
	if (current !== fs.basisHash) {
		found.push(issue(
			'forge-steel',
			'src/l10n/mapping.ts',
			entry.line,
			entry.key,
			`Forge Steel version is stale (basis ${fs.basisHash}, book Chinese ${current})`
		));
	}
	return found;
};

/**
 * Sheet English to compare with Forge Steel English.
 * A rules row uses the body under the title, matching checkRulesHeading.
 * Returns null when that body is missing; the rules-heading rule reports it.
 */
const comparableSheetEnglish = (entry, sheetEn, forgeEn) => {
	if (typeof sheetEn !== 'string') {
		return null;
	}
	if (entry.stripHeading) {
		const body = stripRulesHeading(normalizeEnglish(sheetEn));
		if (body === null) {
			return null;
		}
		return { sheet: body, forge: normalizeEnglish(forgeEn).trim() };
	}
	return { sheet: sheetEn, forge: forgeEn };
};

const checkSheetEnglish = (entry, sheetEn, forgeEn, exception) => {
	const pair = comparableSheetEnglish(entry, sheetEn, forgeEn);
	if (!pair) {
		return null;
	}
	const diff = englishDifference(pair.forge, pair.sheet);
	if (diff === 'same') {
		if (exception) {
			return issue(
				'sheet-english',
				EXCEPTIONS_FILE,
				null,
				entry.key,
				'exception is unnecessary; the English already matches'
			);
		}
		return null;
	}
	if (!exception) {
		return issue(
			'sheet-english',
			'src/l10n/mapping.ts',
			entry.line,
			entry.key,
			`sheet English does not match Forge Steel English (${englishPreview(pair.sheet, pair.forge)})`
		);
	}
	if (exception.kind !== diff) {
		return issue(
			'sheet-english',
			EXCEPTIONS_FILE,
			null,
			entry.key,
			`listed as ${exception.kind}, but the difference is ${diff}`
		);
	}
	return null;
};

const checkRulesHeading = (root, entry, english) => {
	if (!entry.key.startsWith('data:')) {
		return issue('rules-heading', 'src/l10n/mapping.ts', entry.line, entry.key, 'stripHeading is only valid on a data: key');
	}
	const rows = loadSheetRows(path.join(root, 'src/l10n/generated/zh-TW'));
	const row = rows.get(entry.sheetId);
	if (!row || typeof row.en !== 'string' || typeof row.zh !== 'string') {
		return issue('rules-heading', 'src/l10n/mapping.ts', entry.line, entry.key, `${entry.sheetId} has no English and Chinese text`);
	}
	const sheetBody = stripRulesHeading(normalizeEnglish(row.en));
	if (sheetBody === null) {
		return issue('rules-heading', 'src/l10n/mapping.ts', entry.line, entry.key, 'sheet English has no title line and blank line to drop');
	}
	if (sheetBody !== normalizeEnglish(english).trim()) {
		const preview = sheetBody.length > 80 ? `${sheetBody.slice(0, 80)}…` : sheetBody;
		return issue(
			'rules-heading',
			'src/l10n/mapping.ts',
			entry.line,
			entry.key,
			`sheet English body does not match the Forge Steel rules (${JSON.stringify(preview)})`
		);
	}
	if (stripRulesHeading(row.zh) === null) {
		return issue('rules-heading', 'src/l10n/mapping.ts', entry.line, entry.key, 'sheet Chinese has no title line and blank line to drop');
	}
	return null;
};

export const checkCjk = root => {
	const errors = [];
	for (const file of walk(path.join(root, 'src'))) {
		const ext = path.extname(file).toLowerCase();
		if (BINARY_EXT.has(ext)) {
			continue;
		}
		const rel = posix(path.relative(root, file));
		if (rel.startsWith('src/l10n/generated/') || CJK_ALLOWLIST.has(rel)) {
			continue;
		}
		const text = read(file);
		if (text === null || text.includes('\0')) {
			continue;
		}
		const lines = text.split('\n');
		for (let index = 0; index < lines.length; index++) {
			const match = HAN.exec(lines[index]);
			HAN.lastIndex = 0;
			if (match) {
				errors.push(issue(
					'cjk',
					rel,
					index + 1,
					null,
					`Han text is not allowed outside src/l10n/generated (${JSON.stringify(match[0])})`
				));
			}
		}
	}
	return errors;
};

export const checkMapping = root => {
	const file = 'src/l10n/mapping.ts';
	const full = path.join(root, file);
	const text = read(full);
	if (text === null) {
		return [ issue('mapping-key', file, null, null, 'mapping file is missing') ];
	}
	const parsed = parseMapping(file, text);
	const errors = [ ...parsed.errors ];
	const loadedExceptions = loadExceptions(root);
	errors.push(...loadedExceptions.errors);
	const mappedKeys = new Set(parsed.entries.map(entry => entry.key));
	for (const key of loadedExceptions.exceptions.keys()) {
		if (!mappedKeys.has(key)) {
			errors.push(issue(
				'sheet-english',
				EXCEPTIONS_FILE,
				null,
				key,
				'exception key is not in the mapping table'
			));
		}
	}
	const sheet = loadSheetIds(path.join(root, 'src/l10n/generated/zh-TW'), file);
	if (parsed.entries.length > 0) {
		errors.push(...sheet.errors);
	}
	const rows = loadSheetRows(path.join(root, 'src/l10n/generated/zh-TW'));
	const cache = { current: null };
	for (const entry of parsed.entries) {
		if (sheet.errors.length === 0 && !sheet.ids.has(entry.sheetId)) {
			errors.push(issue(
				'mapping-sheet',
				file,
				entry.line,
				entry.key,
				`${entry.sheetId} is not an APPROVED sheet id`
			));
		}
		const resolved = forgeEnglish(root, entry.key, cache);
		if (resolved.error) {
			errors.push(issue('stale-english', file, entry.line, entry.key, resolved.error));
			continue;
		}
		const current = hashEnglish(resolved.english);
		if (current !== entry.enHash) {
			const preview = resolved.english.length > 80 ? `${resolved.english.slice(0, 80)}…` : resolved.english;
			errors.push(issue(
				'stale-english',
				file,
				entry.line,
				entry.key,
				`Forge Steel English changed (${JSON.stringify(preview)}); approved ${entry.enHash}, current ${current}`
			));
			continue;
		}
		const row = rows.get(entry.sheetId);
		if (hasForgeSteel(row)) {
			errors.push(...checkForgeSteelVersion(
				entry,
				row,
				resolved.english,
				loadedExceptions.exceptions.has(entry.key)
			));
		} else {
			if (entry.stripHeading) {
				const heading = checkRulesHeading(root, entry, resolved.english);
				if (heading) {
					errors.push(heading);
				}
			}
			const englishIssue = checkSheetEnglish(
				entry,
				row?.en,
				resolved.english,
				loadedExceptions.exceptions.get(entry.key)
			);
			if (englishIssue) {
				errors.push(englishIssue);
			}
		}
	}
	const stringsFile = 'src/l10n/generated/zh-TW/strings.json';
	const stringsText = read(path.join(root, stringsFile));
	if (stringsText !== null) {
		let stringsData = null;
		try {
			stringsData = JSON.parse(stringsText);
		} catch {
			stringsData = null;
		}
		if (stringsData && typeof stringsData === 'object' && !Array.isArray(stringsData)) {
			const mappedIds = new Set(parsed.entries.map(entry => entry.sheetId));
			for (const [ id, row ] of Object.entries(stringsData)) {
				if (hasForgeSteel(row) && !mappedIds.has(id)) {
					errors.push(issue(
						'forge-steel',
						stringsFile,
						null,
						id,
						'Forge Steel version has no mapping key'
					));
				}
			}
		}
	}
	return errors;
};

export const checkGenerated = root => {
	const script = path.join(scriptDir, 'export-sheet.mjs');
	const result = spawnSync(process.execPath, [
		script,
		'--check',
		'--snapshot', path.join(root, 'l10n/sheet-snapshot'),
		'--out', path.join(root, 'src/l10n/generated/zh-TW')
	], { encoding: 'utf8' });
	if (result.status === 0) {
		return [];
	}
	const detail = (result.stderr || result.stdout || 'export-sheet --check failed').trim();
	return [ issue('generated', 'src/l10n/generated/zh-TW', null, null, detail) ];
};

export const runCheck = (root = repoRoot) => {
	return [
		...checkCjk(root),
		...checkMapping(root),
		...checkGenerated(root)
	];
};

export const formatIssues = issues => issues.map(formatIssue).join('\n');

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
	const issues = runCheck();
	if (issues.length > 0) {
		console.error(formatIssues(issues));
		process.exit(1);
	}
	console.log('l10n check ok');
}
