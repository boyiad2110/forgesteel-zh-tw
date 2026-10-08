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
 *   'section:<ability id>:<n>': { sheetId, enHash, stripHeading? }
 *   'language:<English>':    { sheetId, enHash }
 *   'skill:<English>':       { sheetId, enHash }
 *
 * enHash is sha256 hex of the Forge Steel English at approval time.
 * The check recomputes that English in plain Node, with no browser:
 *
 *   element  — the string literal on the object in src/data whose id matches.
 *              FactoryLogic.createCulture is included when the name and the
 *              description are both string literals. The id is
 *              culture-${name.replace(' ', '-').toLowerCase()}, and replace
 *              changes only the first space. An empty name, or an argument
 *              that is not a string literal, is skipped.
 *   enum     — the string literal assigned to that member in src/enums
 *   ui       — the value of that id in src/l10n/ui-english.json
 *   data     — the template literal on that static field of the class in src/data
 *   language — the English name after `language:`. It must be a string-literal
 *              `name` on an object in a `languages` array under src/data, or
 *              the preset-language string of FactoryLogic.createCulture (the
 *              third string argument). The hash is that name. A name that is
 *              not one of those literals fails. Upstream language objects have
 *              no id, so this check does not invent one.
 *   skill    — the English name after `skill:`. It must be a string-literal
 *              `name` on an object in a `skills` array under src/data. The
 *              hash is that name. A name that is not one of those literals
 *              fails. Upstream skill objects have no id, so this check does
 *              not invent one.
 *   section  — the string or template literal passed to
 *              FactoryLogic.createAbilitySectionText for section n of the
 *              FactoryLogic.createAbility({ ... }) object under src/data whose
 *              id matches. The argument must be one literal and must not
 *              contain a ${} interpolation. A missing id, an id defined more
 *              than once, no sections array, an index past the end, a section
 *              that is not createAbilitySectionText, or an argument that is
 *              not a literal fails closed. The message says which.
 *
 * Glossary rows have no Basis Hash. A `skill:` key and an `enum:SkillList:`
 * key are checked against the Strings row that supplied the Chinese:
 *
 *   skill — the object's `list: SkillList.X` selects
 *           `heroes.skills.<x>.rules`. One line of that row's Chinese must
 *           start with `<Glossary Chinese>（<English>）｜`.
 *   enum:SkillList — the Glossary Chinese must occur in
 *           `heroes.skills.groups.rules`.
 *
 * When that text is gone, the check fails and the message names the Glossary
 * id, the Strings id, and says the source row no longer contains this name.
 *
 * A mapping whose sheet id is `term.<slug>-action` is checked the same way.
 * The Glossary Chinese must equal the first line (the heading) of
 * `heroes.actions.<slug>.rules`. Free Strike, Opportunity Attack, and Claw
 * Dirt reuse older Glossary rows, so they are not checked here. When the
 * source row is missing, or the heading no longer equals that Chinese, the
 * check fails and the message names the Glossary id, the Strings id, and
 * says the source row no longer contains this name.
 *
 * A template literal cooks CR LF and a lone CR into LF. The check does the
 * same to every recomputed English string, and to Sheet English before a
 * comparison, so a core.autocrlf checkout hashes like the runtime string.
 *
 * stripHeading means the sheet row is a title line, a blank line, then the
 * rules. It is valid on a data: key and a section: key. The display strips
 * that title when it shows the Chinese. The check strips the same way and
 * requires the sheet English body to equal the trimmed Forge Steel English.
 * The exported JSON is left unchanged.
 *
 * Every mapped key's sheet English must equal the Forge Steel English.
 * Sheet English is the exported `en` field, copied from the snapshot's
 * Source Text column. stripHeading rows compare the body after the title
 * is removed, so a rules heading is not itself a difference. A difference
 * that is only punctuation, or only the articles a/an/the, may be listed in
 * src/l10n/english-exceptions.json with a kind (`punctuation` or `article`)
 * and a note. Any other difference fails. An exception whose texts already
 * match, or whose kind does not match the actual difference, also fails.
 * `spelling` is a third kind, and only on a `language:` key: the Forge Steel
 * name is not the sheet Source Name (Kalliac versus Kalliak). Each spelling
 * exception must be approved by Marc. The check rejects `spelling` on every
 * other key type.
 *
 * A strings.json row may include `fs`, the Forge Steel version. For a mapped
 * key whose row has `fs`, English is compared with `fs.en` instead of the
 * book `en`. `fs.en` must equal the Forge Steel English with leading and
 * trailing whitespace removed (a template that starts with a newline still
 * matches the sheet cell). `enHash` stays the sha256 of that English before
 * trimming. `fs.basisHash` must equal the sha256 of the current book Chinese
 * (`zh`); if it does not, the check fails and the message says the Forge Steel
 * version is stale. That key cannot be listed in english-exceptions.json and
 * cannot set stripHeading. Every `fs` row must be referenced by at least one
 * mapping key.
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
export const KEY_PATTERNS = [
	/^element:[a-z0-9]+(?:[-_][a-z0-9]+)*:[A-Za-z][A-Za-z0-9]*$/,
	/^enum:[A-Za-z][A-Za-z0-9]*:[A-Za-z][A-Za-z0-9]*$/,
	/^ui:[a-z0-9]+(?:[.\-_][a-z0-9]+)*$/,
	/^data:[A-Za-z][A-Za-z0-9]*:[A-Za-z][A-Za-z0-9]*$/,
	/^section:[a-z0-9]+(?:[-_][a-z0-9]+)*:(?:0|[1-9][0-9]*)$/,
	/^language:[A-Za-z0-9]+(?:[ '\u2019-][A-Za-z0-9]+)*$/,
	/^skill:[A-Za-z0-9]+(?:[ '\u2019-][A-Za-z0-9]+)*$/
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

/**
 * Skip one string while matching braces. A template may contain ${}.
 * readString refuses those; this only needs the closing quote.
 */
const skipLiteral = (text, i, line) => {
	const quote = text[i];
	i += 1;
	if (quote !== '`') {
		while (i < text.length) {
			const char = text[i];
			if (char === '\n') {
				line += 1;
				return { i, line };
			}
			if (char === '\\') {
				if ((text[i + 1] ?? '') === '\n') {
					line += 1;
				}
				i += 2;
				continue;
			}
			if (char === quote) {
				return { i: i + 1, line };
			}
			i += 1;
		}
		return { i, line };
	}
	let expr = 0;
	while (i < text.length) {
		const char = text[i];
		if (char === '\n') {
			line += 1;
			i += 1;
			continue;
		}
		if (char === '\\') {
			if ((text[i + 1] ?? '') === '\n') {
				line += 1;
			}
			i += 2;
			continue;
		}
		if (expr === 0 && char === '`') {
			return { i: i + 1, line };
		}
		if (expr === 0 && char === '$' && text[i + 1] === '{') {
			expr = 1;
			i += 2;
			continue;
		}
		if (expr > 0 && (char === '\'' || char === '"' || char === '`')) {
			const nested = skipLiteral(text, i, line);
			i = nested.i;
			line = nested.line;
			continue;
		}
		if (expr > 0 && char === '{') {
			expr += 1;
		} else if (expr > 0 && char === '}') {
			expr -= 1;
		}
		i += 1;
	}
	return { i, line };
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
			if (parsed.ok) {
				tokens.push({ kind: 'string', value: parsed.value, line });
				i = parsed.i;
				line = parsed.line;
			} else {
				const skipped = skipLiteral(text, i, line);
				i = skipped.i;
				line = skipped.line;
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

/**
 * FactoryLogic.createCulture uses name.replace(' ', '-'), which changes only
 * the first space. A call is indexed only when both arguments are string
 * literals and the name is not empty (an empty name becomes a guid).
 */
const culturesFromCalls = text => {
	const tokens = tokenize(text);
	const found = [];
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.kind !== 'ident' || token.value !== 'createCulture') {
			continue;
		}
		const name = tokens[i + 1];
		const description = tokens[i + 2];
		if (name?.kind !== 'string' || description?.kind !== 'string' || name.value === '') {
			continue;
		}
		const id = `culture-${name.value.replace(' ', '-').toLowerCase()}`;
		const fields = new Map();
		fields.set('id', { text: id, line: token.line });
		fields.set('name', { text: name.value, line: name.line });
		fields.set('description', { text: description.value, line: description.line });
		found.push({ fields });
	}
	return found;
};

const indexElements = root => {
	const index = new Map();
	const duplicates = new Set();
	const remember = (id, record) => {
		if (index.has(id)) {
			duplicates.add(id);
		}
		index.set(id, record);
	};
	for (const file of walk(path.join(root, 'src/data'))) {
		if (!file.endsWith('.ts')) {
			continue;
		}
		const text = read(file);
		if (text === null || text.includes('\0')) {
			continue;
		}
		const rel = posix(path.relative(root, file));
		for (const object of objectsWithId(text)) {
			remember(object.fields.get('id').text, { fields: object.fields, file: rel });
		}
		for (const culture of culturesFromCalls(text)) {
			remember(culture.fields.get('id').text, { fields: culture.fields, file: rel });
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

/**
 * `name` string literals on objects in a `languages` array.
 * A later sibling property of the same object ends the array.
 */
const languageListNames = text => {
	const tokens = tokenize(text);
	const names = [];
	let depth = 0;
	let listDepth = null;
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.kind === 'brace' && token.value === '{') {
			depth += 1;
			continue;
		}
		if (token.kind === 'brace' && token.value === '}') {
			depth -= 1;
			if (listDepth !== null && depth < listDepth) {
				listDepth = null;
			}
			continue;
		}
		if (token.kind !== 'ident' || tokens[i + 1]?.kind !== 'colon') {
			continue;
		}
		if (token.value === 'languages') {
			listDepth = depth;
			continue;
		}
		if (listDepth !== null && depth === listDepth) {
			listDepth = null;
			continue;
		}
		if (listDepth !== null && depth === listDepth + 1 && token.value === 'name' && tokens[i + 2]?.kind === 'string') {
			names.push(tokens[i + 2].value);
		}
	}
	return names;
};

/** String literals that are arguments of one call, not of a nested call. */
const topLevelStrings = (text, openParen) => {
	const strings = [];
	let depth = 1;
	let i = openParen + 1;
	let line = lineOf(text, openParen);
	while (i < text.length && depth > 0) {
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
			if (depth === 1 && parsed.ok) {
				strings.push(parsed.value);
			}
			i = parsed.i;
			line = parsed.line;
			continue;
		}
		if (char === '(') {
			depth += 1;
		} else if (char === ')') {
			depth -= 1;
		}
		i += 1;
	}
	return strings;
};

/**
 * The preset language is the third string argument of createCulture.
 * The first two are the culture name and description.
 */
const presetLanguages = text => {
	const names = [];
	let i = 0;
	let line = 1;
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
		if (text.startsWith('createCulture', i)) {
			const before = i > 0 ? text[i - 1] : '';
			const afterIndex = i + 'createCulture'.length;
			const after = text[afterIndex] ?? '';
			if (!/[A-Za-z0-9_$]/.test(before) && !/[A-Za-z0-9_$]/.test(after)) {
				let j = afterIndex;
				while (j < text.length && /[ \t\r\n]/.test(text[j])) {
					j += 1;
				}
				if (text[j] === '(') {
					const strings = topLevelStrings(text, j);
					if (strings.length >= 3 && strings[2] !== '') {
						names.push(strings[2]);
					}
				}
			}
			i = afterIndex;
			continue;
		}
		i += 1;
	}
	return names;
};

const indexLanguageNames = root => {
	const names = new Set();
	for (const file of walk(path.join(root, 'src/data'))) {
		if (!file.endsWith('.ts')) {
			continue;
		}
		const text = read(file);
		if (text === null || text.includes('\0')) {
			continue;
		}
		for (const name of languageListNames(text)) {
			names.add(name);
		}
		for (const name of presetLanguages(text)) {
			names.add(name);
		}
	}
	return names;
};

const languageEnglish = (root, cache, name) => {
	cache.languages ??= indexLanguageNames(root);
	if (!cache.languages.has(name)) {
		return { error: `language ${JSON.stringify(name)} is not a literal in a src/data language list or a culture preset language` };
	}
	return { english: name };
};

/**
 * `name` string literals on objects in a `skills` array, with `list: SkillList.X`
 * when that member is also a literal. A later sibling property ends the array.
 * A string array such as `skills: [ 'Hide' ]` has no object name, so it is skipped.
 */
const skillObjects = text => {
	const tokens = tokenize(text);
	const found = [];
	let depth = 0;
	let listDepth = null;
	const stack = [];
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.kind === 'brace' && token.value === '{') {
			depth += 1;
			stack.push({ depth, name: undefined, list: undefined });
			continue;
		}
		if (token.kind === 'brace' && token.value === '}') {
			const top = stack.pop();
			if (listDepth !== null && top && top.depth === listDepth + 1 && typeof top.name === 'string') {
				found.push({ name: top.name, list: top.list ?? null });
			}
			depth -= 1;
			if (listDepth !== null && depth < listDepth) {
				listDepth = null;
			}
			continue;
		}
		if (token.kind !== 'ident' || tokens[i + 1]?.kind !== 'colon') {
			continue;
		}
		if (token.value === 'skills') {
			listDepth = depth;
			continue;
		}
		if (listDepth !== null && depth === listDepth) {
			listDepth = null;
			continue;
		}
		const top = stack[stack.length - 1];
		if (!top || listDepth === null || top.depth !== depth || depth !== listDepth + 1) {
			continue;
		}
		if (token.value === 'name' && tokens[i + 2]?.kind === 'string' && top.name === undefined) {
			top.name = tokens[i + 2].value;
		}
		if (token.value === 'list' && top.list === undefined) {
			const enumName = tokens[i + 2];
			const member = tokens[i + 3];
			if (enumName?.kind === 'ident' && enumName.value === 'SkillList' && member?.kind === 'ident') {
				top.list = member.value;
			}
		}
	}
	return found;
};

const indexSkills = root => {
	const skills = new Map();
	for (const file of walk(path.join(root, 'src/data'))) {
		if (!file.endsWith('.ts')) {
			continue;
		}
		const text = read(file);
		if (text === null || text.includes('\0')) {
			continue;
		}
		for (const entry of skillObjects(text)) {
			const previous = skills.get(entry.name);
			if (!previous) {
				skills.set(entry.name, { list: entry.list, conflict: false });
				continue;
			}
			if (previous.list !== entry.list) {
				previous.conflict = true;
			}
		}
	}
	return skills;
};

const skillEnglish = (root, cache, name) => {
	cache.skills ??= indexSkills(root);
	if (!cache.skills.has(name)) {
		return { error: `skill ${JSON.stringify(name)} is not a literal name in a src/data skills array` };
	}
	return { english: name };
};

const SKILL_LIST_SOURCE = {
	Crafting: 'heroes.skills.crafting.rules',
	Exploration: 'heroes.skills.exploration.rules',
	Interpersonal: 'heroes.skills.interpersonal.rules',
	Intrigue: 'heroes.skills.intrigue.rules',
	Lore: 'heroes.skills.lore.rules'
};
const SKILL_GROUP_SOURCE = 'heroes.skills.groups.rules';

const sourceMiss = (glossaryId, sourceId) => {
	return `${glossaryId} ${sourceId}: source row no longer contains this name`;
};

/**
 * Glossary has no Basis Hash. The Chinese must still be present in the
 * Strings row named by the Glossary Source Reference.
 */
const checkSkillSource = (entry, rows, skills) => {
	const skill = /^skill:(.+)$/.exec(entry.key);
	if (skill) {
		const english = skill[1];
		const found = skills.get(english);
		const list = found && !found.conflict ? found.list : null;
		const sourceId = list ? SKILL_LIST_SOURCE[list] : null;
		if (!sourceId) {
			return issue(
				'skill-source',
				'src/l10n/mapping.ts',
				entry.line,
				entry.key,
				`${entry.sheetId} has no SkillList source row for ${JSON.stringify(english)}`
			);
		}
		const glossaryZh = rows.get(entry.sheetId)?.zh;
		const sourceZh = rows.get(sourceId)?.zh;
		const prefix = `${glossaryZh}（${english}）｜`;
		const hit = typeof glossaryZh === 'string'
			&& glossaryZh !== ''
			&& typeof sourceZh === 'string'
			&& sourceZh.split('\n').some(line => line.startsWith(prefix));
		if (!hit) {
			return issue('skill-source', 'src/l10n/mapping.ts', entry.line, entry.key, sourceMiss(entry.sheetId, sourceId));
		}
		return null;
	}
	if (/^enum:SkillList:/.test(entry.key)) {
		const glossaryZh = rows.get(entry.sheetId)?.zh;
		const sourceZh = rows.get(SKILL_GROUP_SOURCE)?.zh;
		const hit = typeof glossaryZh === 'string'
			&& glossaryZh !== ''
			&& typeof sourceZh === 'string'
			&& sourceZh.includes(glossaryZh);
		if (!hit) {
			return issue('skill-source', 'src/l10n/mapping.ts', entry.line, entry.key, sourceMiss(entry.sheetId, SKILL_GROUP_SOURCE));
		}
	}
	return null;
};

const ACTION_SHEET = /^term\.(.+)-action$/;

/**
 * Glossary has no Basis Hash. An action name taken from a Strings heading
 * must still equal that heading. Older rows such as term.free-strike are
 * not checked here.
 */
const checkActionSource = (entry, rows) => {
	const action = ACTION_SHEET.exec(entry.sheetId);
	if (!action) {
		return null;
	}
	const sourceId = `heroes.actions.${action[1]}.rules`;
	const glossaryZh = rows.get(entry.sheetId)?.zh;
	const sourceZh = rows.get(sourceId)?.zh;
	const heading = typeof sourceZh === 'string' ? sourceZh.split('\n')[0] : '';
	const hit = typeof glossaryZh === 'string' && glossaryZh !== '' && heading === glossaryZh;
	if (!hit) {
		return issue('action-source', 'src/l10n/mapping.ts', entry.line, entry.key, sourceMiss(entry.sheetId, sourceId));
	}
	return null;
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
	const language = /^language:(.+)$/.exec(key);
	if (language) {
		return cookedEnglish(languageEnglish(root, cache, language[1]));
	}
	const skill = /^skill:(.+)$/.exec(key);
	if (skill) {
		return cookedEnglish(skillEnglish(root, cache, skill[1]));
	}
	const section = /^section:([^:]+):([^:]+)$/.exec(key);
	if (section) {
		return cookedEnglish(sectionEnglish(root, cache, section[1], section[2]));
	}
	return { error: 'key is not an element, enum, data, ui, language, skill, or section key' };
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
			const parsed = skipLiteral(text, i, line);
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

/** Same walk as matchBrace, for a `[` … `]` array. */
const matchBracket = (text, open) => {
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
			const parsed = skipLiteral(text, i, line);
			i = parsed.i;
			line = parsed.line;
			continue;
		}
		if (char === '[') {
			depth += 1;
		} else if (char === ']') {
			depth -= 1;
			if (depth === 0) {
				return i;
			}
		}
		i += 1;
	}
	return -1;
};

/** Comma-separated pieces at the top of one sections array body. */
const splitTopLevel = text => {
	const parts = [];
	let start = 0;
	let paren = 0;
	let brace = 0;
	let bracket = 0;
	let i = 0;
	let line = 1;
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
			const parsed = skipLiteral(text, i, line);
			i = parsed.i;
			line = parsed.line;
			continue;
		}
		if (char === '(') {
			paren += 1;
		} else if (char === ')') {
			paren -= 1;
		} else if (char === '{') {
			brace += 1;
		} else if (char === '}') {
			brace -= 1;
		} else if (char === '[') {
			bracket += 1;
		} else if (char === ']') {
			bracket -= 1;
		} else if (char === ',' && paren === 0 && brace === 0 && bracket === 0) {
			parts.push(text.slice(start, i));
			start = i + 1;
		}
		i += 1;
	}
	parts.push(text.slice(start));
	return parts.map(part => part.trim()).filter(part => part.length > 0);
};

/**
 * One createAbilitySectionText argument: a single string or a template
 * literal with no ${} interpolation. Anything else fails closed.
 */
const textSectionLiteral = element => {
	const trimmed = element.trim();
	const call = 'FactoryLogic.createAbilitySectionText';
	if (!trimmed.startsWith(call)) {
		if (trimmed.includes('createAbilitySectionRoll')) {
			return { error: 'is a roll section, not createAbilitySectionText' };
		}
		if (trimmed.includes('createAbilitySectionField') || trimmed.includes('createAbilitySectionSpend')) {
			return { error: 'is a field section, not createAbilitySectionText' };
		}
		if (trimmed.includes('createAbilitySectionPackage')) {
			return { error: 'is a package section, not createAbilitySectionText' };
		}
		return { error: 'is not createAbilitySectionText' };
	}
	let i = call.length;
	while (i < trimmed.length && /[ \t\r\n]/.test(trimmed[i])) {
		i += 1;
	}
	if (trimmed[i] !== '(') {
		return { error: 'argument is not a string literal' };
	}
	i += 1;
	while (i < trimmed.length && /[ \t\r\n]/.test(trimmed[i])) {
		i += 1;
	}
	const quote = trimmed[i];
	if (quote !== '\'' && quote !== '"' && quote !== '`') {
		return { error: 'argument is not a string literal' };
	}
	const parsed = readString(trimmed, i, 1);
	if (!parsed.ok) {
		if (quote === '`' && trimmed[parsed.i] === '$' && trimmed[parsed.i + 1] === '{') {
			return { error: 'template has an interpolation' };
		}
		return { error: 'argument is not a string literal' };
	}
	let j = parsed.i;
	while (j < trimmed.length && /[ \t\r\n]/.test(trimmed[j])) {
		j += 1;
	}
	if (trimmed[j] !== ')') {
		return { error: 'argument is not a string literal' };
	}
	j += 1;
	while (j < trimmed.length && /[ \t\r\n]/.test(trimmed[j])) {
		j += 1;
	}
	if (j !== trimmed.length) {
		return { error: 'argument is not a string literal' };
	}
	return { english: parsed.value };
};

/** The string value of one depth-1 field, using the shared tokenizer. */
const depth1String = (objectText, name) => {
	const tokens = tokenize(objectText);
	let depth = 0;
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.kind === 'brace' && token.value === '{') {
			depth += 1;
			continue;
		}
		if (token.kind === 'brace' && token.value === '}') {
			depth -= 1;
			continue;
		}
		const colon = tokens[i + 1];
		const value = tokens[i + 2];
		if (depth === 1 && token.kind === 'ident' && token.value === name && colon?.kind === 'colon' && value?.kind === 'string') {
			return value.value;
		}
	}
	return null;
};

/** Index of the value after a depth-1 `name:` property. */
const depth1ValueAt = (objectText, name) => {
	let depth = 0;
	let i = 0;
	let line = 1;
	while (i < objectText.length) {
		const char = objectText[i];
		if (char === '\n') {
			line += 1;
			i += 1;
			continue;
		}
		const comment = skipComment(objectText, i, line);
		if (comment) {
			i = comment.i;
			line = comment.line;
			continue;
		}
		if (char === '\'' || char === '"' || char === '`') {
			const parsed = skipLiteral(objectText, i, line);
			i = parsed.i;
			line = parsed.line;
			continue;
		}
		if (char === '{') {
			depth += 1;
			i += 1;
			continue;
		}
		if (char === '}') {
			depth -= 1;
			i += 1;
			continue;
		}
		if (depth === 1 && objectText.startsWith(name, i)) {
			const before = i > 0 ? objectText[i - 1] : '';
			const after = objectText[i + name.length] ?? '';
			if (!/[A-Za-z0-9_$]/.test(before) && !/[A-Za-z0-9_$]/.test(after)) {
				let j = i + name.length;
				while (j < objectText.length && /[ \t\r\n]/.test(objectText[j])) {
					j += 1;
				}
				if (objectText[j] === ':') {
					j += 1;
					while (j < objectText.length && /[ \t\r\n]/.test(objectText[j])) {
						j += 1;
					}
					return j;
				}
			}
		}
		i += 1;
	}
	return -1;
};

/**
 * FactoryLogic.createAbility({ ... }) objects. The id comes from objectsWithId
 * and must also be the depth-1 string field, so a nested id is not the ability.
 */
const abilitiesFromCalls = text => {
	const found = [];
	const needle = 'FactoryLogic.createAbility';
	let i = 0;
	let line = 1;
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
			const parsed = skipLiteral(text, i, line);
			i = parsed.i;
			line = parsed.line;
			continue;
		}
		if (text.startsWith(needle, i)) {
			const before = i > 0 ? text[i - 1] : '';
			const after = text[i + needle.length] ?? '';
			if (!/[A-Za-z0-9_$]/.test(before) && !/[A-Za-z0-9_$]/.test(after)) {
				let j = i + needle.length;
				while (j < text.length && /[ \t\r\n]/.test(text[j])) {
					j += 1;
				}
				if (text[j] === '(') {
					j += 1;
					while (j < text.length && /[ \t\r\n]/.test(text[j])) {
						j += 1;
					}
					if (text[j] === '{') {
						const close = matchBrace(text, j);
						if (close > j) {
							const objectText = text.slice(j, close + 1);
							const id = depth1String(objectText, 'id');
							const listed = id !== null && objectsWithId(objectText).some(object => object.fields.get('id').text === id);
							if (listed) {
								const valueAt = depth1ValueAt(objectText, 'sections');
								let sections = null;
								if (valueAt >= 0 && objectText[valueAt] === '[') {
									const end = matchBracket(objectText, valueAt);
									if (end > valueAt) {
										sections = splitTopLevel(objectText.slice(valueAt + 1, end)).map(textSectionLiteral);
									}
								}
								found.push({ id, sections });
							}
						}
					}
				}
			}
			i += needle.length;
			continue;
		}
		i += 1;
	}
	return found;
};

const indexAbilitySections = root => {
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
		for (const ability of abilitiesFromCalls(text)) {
			if (index.has(ability.id)) {
				duplicates.add(ability.id);
			}
			index.set(ability.id, ability);
		}
	}
	return { index, duplicates };
};

const sectionEnglish = (root, cache, id, indexText) => {
	if (!/^(?:0|[1-9][0-9]*)$/.test(indexText)) {
		return { error: `section index ${JSON.stringify(indexText)} is not a whole number` };
	}
	const index = Number(indexText);
	cache.abilities ??= indexAbilitySections(root);
	const { index: abilities, duplicates } = cache.abilities;
	if (duplicates.has(id)) {
		return { error: `ability id ${id} is defined more than once under src/data` };
	}
	const ability = abilities.get(id);
	if (!ability) {
		return { error: `ability id ${id} was not found under src/data` };
	}
	if (!ability.sections) {
		return { error: `ability ${id} has no sections` };
	}
	if (index >= ability.sections.length) {
		return { error: `ability ${id} section index ${index} is out of range` };
	}
	const section = ability.sections[index];
	if (section.error) {
		return { error: `ability ${id} section ${index} ${section.error}` };
	}
	return { english: section.english };
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

const EXCEPTION_KINDS = new Set([ 'punctuation', 'article', 'spelling' ]);
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
			errors.push(issue('sheet-english', EXCEPTIONS_FILE, null, key, 'kind must be punctuation, article, or spelling'));
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
	const comparable = forgeEn.trim();
	if (comparable !== fs.en) {
		found.push(issue(
			'forge-steel',
			'src/l10n/mapping.ts',
			entry.line,
			entry.key,
			`Forge Steel English does not match Forge Steel Source Text (${englishPreview(fs.en, comparable)})`
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
	if (exception?.kind === 'spelling') {
		if (!entry.key.startsWith('language:')) {
			return issue(
				'sheet-english',
				EXCEPTIONS_FILE,
				null,
				entry.key,
				'spelling is only valid on a language: key'
			);
		}
		if (diff !== 'content') {
			return issue(
				'sheet-english',
				EXCEPTIONS_FILE,
				null,
				entry.key,
				`listed as spelling, but the difference is ${diff}`
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
	if (!entry.key.startsWith('data:') && !entry.key.startsWith('section:')) {
		return issue('rules-heading', 'src/l10n/mapping.ts', entry.line, entry.key, 'stripHeading is only valid on a data: or section: key');
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
		if (entry.key.startsWith('skill:') || entry.key.startsWith('enum:SkillList:')) {
			cache.skills ??= indexSkills(root);
			const sourceIssue = checkSkillSource(entry, rows, cache.skills);
			if (sourceIssue) {
				errors.push(sourceIssue);
			}
		}
		const actionIssue = checkActionSource(entry, rows);
		if (actionIssue) {
			errors.push(actionIssue);
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

/** Display bindings carry positions; optional sentence templates must come from the approved Sheet snapshot. */
export const checkCalculationBindings = root => {
	const file = 'src/l10n/calculation-bindings.json';
	const text = read(path.join(root, file));
	if (text === null) {
		return [];
	}
	let bindings;
	try {
		bindings = JSON.parse(text);
	} catch (error) {
		return [ issue('calculation-binding', file, null, null, error.message) ];
	}
	if (!bindings || typeof bindings !== 'object' || Array.isArray(bindings)) {
		return [ issue('calculation-binding', file, null, null, 'bindings must be an object') ];
	}
	const entries = parseMapping('src/l10n/mapping.ts', read(path.join(root, 'src/l10n/mapping.ts')) ?? '').entries;
	const rows = loadSheetRows(path.join(root, 'src/l10n/generated/zh-TW'));
	const fields = new Set([ 'sheetId', 'enHash', 'sourceHash', 'zhHash', 'sourceSpan', 'targetSpan', 'sourceLength', 'targetLength', 'valueSuffix', 'useDisplayTemplate' ]);
	const errors = [];
	const validSpan = (span, length) => Array.isArray(span) && span.length === 2 && span.every(Number.isInteger) && span[0] >= 0 && span[0] < span[1] && span[1] <= length;
	for (const [ key, binding ] of Object.entries(bindings)) {
		const fail = detail => errors.push(issue('calculation-binding', file, null, key, detail));
		if (!binding || typeof binding !== 'object' || Array.isArray(binding) || Object.keys(binding).some(field => !fields.has(field))) {
			fail('invalid binding fields');
			continue;
		}
		const entry = entries.find(entry => entry.key === key);
		const row = rows.get(binding.sheetId)?.fs;
		if (!entry || entry.sheetId !== binding.sheetId || !row) {
			fail('binding must reference its mapped approved Forge Steel row');
			continue;
		}
		// Mapping hashes anchor the exact upstream literal. The approved Forge
		// Steel source cell may trim template-only edge whitespace, which the
		// mapping check separately verifies against that same literal.
		if (binding.enHash !== entry.enHash || (binding.sourceHash ?? binding.enHash) !== hashEnglish(row.en)) {
			fail('English binding is stale; reapprove its source positions');
		}
		if (binding.zhHash !== hashEnglish(row.zh)) {
			fail('Chinese binding is stale; reapprove its target positions');
		}
		if (binding.sourceLength !== row.en.length || binding.targetLength !== row.zh.length || !validSpan(binding.sourceSpan, row.en.length) || !validSpan(binding.targetSpan, row.zh.length)) {
			fail('invalid text length or UTF-16 span');
		}
		if (typeof binding.valueSuffix !== 'string' || !/^\s*$/.test(binding.valueSuffix)) {
			fail('valueSuffix may contain only display whitespace');
		}
		if (binding.useDisplayTemplate !== undefined && binding.useDisplayTemplate !== true) {
			fail('useDisplayTemplate must be true or absent');
		}
		if (binding.useDisplayTemplate || row.calculationDisplay) {
			const display = row.calculationDisplay;
			if (!binding.useDisplayTemplate || !display || typeof display.target !== 'string'
				|| !validSpan(binding.targetSpan, row.zh.length) || display.target !== row.zh.slice(...binding.targetSpan)
				|| typeof display.template !== 'string' || display.template.split('{value}').length !== 2
				|| /[{}]/.test(display.template.replace('{value}', ''))) {
				fail('display template must match its approved Sheet target span and contain exactly one {value}');
			}
		}
	}
	return errors;
};

export const runCheck = (root = repoRoot) => {
	return [
		...checkCjk(root),
		...checkMapping(root),
		...checkCalculationBindings(root),
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
