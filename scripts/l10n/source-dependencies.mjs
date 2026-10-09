/** Approval checkpoints for every source of a Forge Steel adaptation.
 * This module reads generated APPROVED rows; it never generates translations or
 * refreshes checkpoints automatically. The manifest contains IDs and hashes only.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const SOURCE_DEPENDENCIES_FILE = 'src/l10n/source-dependencies.json';
const CATALOG_FILES = [ 'glossary.json', 'names.json', 'strings.json' ];
const HASH = /^[0-9a-f]{64}$/;
const ID = /^[a-z0-9]+(?:[.\-_][a-z0-9]+)*$/;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const shape = (value, fields) => record(value)
	&& Object.keys(value).length === fields.length
	&& fields.every(field => Object.hasOwn(value, field));

export const hashDependencyText = value => createHash('sha256')
	.update(value.replace(/\r\n?/g, '\n'), 'utf8').digest('hex');

// Preserve source order: concatenation order is part of the approved adaptation.
export const hashDependencyIds = sources => hashDependencyText(JSON.stringify(sources.map(source => source?.sheetId)));

/** Pure validation shared by the repository guard and mutation tests. */
export const validateSourceDependencies = (manifest, rows) => {
	const found = [];
	const add = (key, message) => found.push({ rule: 'source-dependencies', file: SOURCE_DEPENDENCIES_FILE, line: null, key, message });
	if (!shape(manifest, [ 'version', 'rows' ]) || manifest.version !== 1 || !record(manifest.rows)) {
		add(null, 'Invalid source dependency manifest: expected version 1 and rows');
		return found;
	}
	const catalog = rows instanceof Map ? rows : new Map(Object.entries(rows));
	for (const [ sheetId, row ] of catalog) {
		if (record(row) && Object.hasOwn(row, 'fs') && !Object.hasOwn(manifest.rows, sheetId)) {
			add(sheetId, 'Forge Steel version has no approved source dependency checkpoint');
		}
	}
	for (const [ sheetId, entry ] of Object.entries(manifest.rows)) {
		if (!ID.test(sheetId) || !shape(entry, [ 'sources', 'sourcesHash', 'fs' ])
			|| !Array.isArray(entry.sources) || !entry.sources.length || !HASH.test(entry.sourcesHash)
			|| !shape(entry.fs, [ 'enHash', 'zhHash' ]) || !HASH.test(entry.fs.enHash) || !HASH.test(entry.fs.zhHash)) {
			add(sheetId, 'Invalid source dependency checkpoint; only source IDs and SHA-256 hashes are allowed');
			continue;
		}
		const target = catalog.get(sheetId);
		if (!record(target?.fs)) {
			add(sheetId, 'Checkpoint target is missing its approved Forge Steel version');
		}
		const seen = new Set();
		for (const source of entry.sources) {
			if (!shape(source, [ 'sheetId', 'enHash', 'zhHash' ]) || !ID.test(source.sheetId)
				|| !HASH.test(source.enHash) || !HASH.test(source.zhHash)) {
				add(sheetId, 'Invalid dependency: expected Sheet ID and English/Chinese SHA-256 hashes');
				continue;
			}
			if (seen.has(source.sheetId)) {
				add(sheetId, `Duplicate source dependency ${source.sheetId}`);
			}
			seen.add(source.sheetId);
			const row = catalog.get(source.sheetId);
			if (!record(row)) {
				add(sheetId, `Approved source dependency ${source.sheetId} is missing from generated catalog`);
				continue;
			}
			for (const field of [ 'en', 'zh' ]) {
				if (typeof row[field] !== 'string' || hashDependencyText(row[field]) !== source[`${field}Hash`]) {
					add(sheetId, `Forge Steel version is stale: source ${source.sheetId} ${field} changed; reapprove all dependent content`);
				}
			}
		}
		if (!seen.has(sheetId) || entry.sources[0]?.sheetId !== sheetId) {
			add(sheetId, 'First dependency must be the Forge Steel version target Sheet ID');
		}
		if (hashDependencyIds(entry.sources) !== entry.sourcesHash) {
			add(sheetId, 'Source dependency list changed or is incomplete; reapprove the full source list');
		}
		if (record(target?.fs)) {
			for (const field of [ 'en', 'zh' ]) {
				if (typeof target.fs[field] !== 'string' || hashDependencyText(target.fs[field]) !== entry.fs[`${field}Hash`]) {
					add(sheetId, `Approved Forge Steel ${field} changed; source checkpoint must be reviewed with the Sheet approval`);
				}
			}
		}
	}
	return found;
};

/** Same issue shape as check.mjs; catalogRoot supports temporary snapshots. */
export const checkSourceDependencies = (root, catalogRoot = root) => {
	const error = message => [ { rule: 'source-dependencies', file: SOURCE_DEPENDENCIES_FILE, line: null, key: null, message } ];
	let manifest;
	try {
		manifest = JSON.parse(readFileSync(path.join(root, SOURCE_DEPENDENCIES_FILE), 'utf8'));
	} catch (cause) {
		return error(`Cannot read source dependency manifest: ${cause.message}`);
	}
	const rows = new Map();
	for (const file of CATALOG_FILES) {
		let data;
		try {
			data = JSON.parse(readFileSync(path.join(catalogRoot, 'src/l10n/generated/zh-TW', file), 'utf8'));
		} catch (cause) {
			return error(`Cannot read approved sources ${file}: ${cause.message}`);
		}
		if (!record(data)) {
			return error(`Invalid approved source catalog ${file}`);
		}
		for (const [ id, row ] of Object.entries(data)) {
			if (rows.has(id)) {
				return error(`Ambiguous approved source ID ${id} occurs in multiple catalogs`);
			}
			rows.set(id, row);
		}
	}
	return validateSourceDependencies(manifest, rows);
};
