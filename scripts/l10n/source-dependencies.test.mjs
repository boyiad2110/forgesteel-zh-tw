import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test } from 'vitest';
import { checkSourceDependencies, hashDependencyIds, hashDependencyText, SOURCE_DEPENDENCIES_FILE, validateSourceDependencies } from './source-dependencies.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const roots = [];
afterEach(() => roots.splice(0).forEach(root => rmSync(root, { recursive: true, force: true })));

const fixture = () => {
	const rows = {
		'book.first': { en: 'First paragraph.', zh: 'First approved translation.', fs: { en: 'Combined.', zh: 'Approved combined translation.' } },
		'book.second': { en: 'Second paragraph.', zh: 'Second approved translation.' },
		'book.third': { en: 'Third paragraph.', zh: 'Third approved translation.' }
	};
	const hashes = row => ({ enHash: hashDependencyText(row.en), zhHash: hashDependencyText(row.zh) });
	const sources = Object.entries(rows).map(([ sheetId, row ]) => ({ sheetId, ...hashes(row) }));
	const manifest = { version: 1, rows: { 'book.first': { sources, sourcesHash: hashDependencyIds(sources), fs: hashes(rows['book.first'].fs) } } };
	return { rows, manifest };
};

describe('all-source approval checkpoints', () => {
	test('accepts a fully approved multi-source adaptation', () => {
		const { rows, manifest } = fixture();
		expect(validateSourceDependencies(manifest, rows)).toEqual([]);
	});
	for (const id of [ 'book.first', 'book.second', 'book.third' ]) {
		for (const field of [ 'en', 'zh' ]) {
			test(`invalidates the combined adaptation when ${id} ${field} changes`, () => {
				const { rows, manifest } = fixture();
				rows[id][field] += ' Changed.';
				expect(validateSourceDependencies(manifest, rows)).toEqual(expect.arrayContaining([
					expect.objectContaining({ key: 'book.first', message: expect.stringContaining(`source ${id} ${field} changed`) })
				]));
			});
		}
		test(`rejects deleted or unapproved ${id}`, () => {
			const { rows, manifest } = fixture();
			delete rows[id];
			expect(validateSourceDependencies(manifest, rows)).toEqual(expect.arrayContaining([
				expect.objectContaining({ message: expect.stringContaining(`${id} is missing`) })
			]));
		});
	}
	test('rejects a dropped later dependency even when remaining hashes match', () => {
		const { rows, manifest } = fixture();
		manifest.rows['book.first'].sources.pop();
		expect(validateSourceDependencies(manifest, rows)).toEqual(expect.arrayContaining([
			expect.objectContaining({ message: expect.stringContaining('list changed or is incomplete') })
		]));
	});
	test('rejects reordered dependencies', () => {
		const { rows, manifest } = fixture();
		manifest.rows['book.first'].sources.reverse();
		expect(validateSourceDependencies(manifest, rows).map(issue => issue.message)).toEqual(expect.arrayContaining([
			'First dependency must be the Forge Steel version target Sheet ID',
			'Source dependency list changed or is incomplete; reapprove the full source list'
		]));
	});
	test('rejects duplicate source IDs even if the list hash is recomputed', () => {
		const { rows, manifest } = fixture();
		const entry = manifest.rows['book.first'];
		entry.sources.push(entry.sources[1]);
		entry.sourcesHash = hashDependencyIds(entry.sources);
		expect(validateSourceDependencies(manifest, rows)[0].message).toContain('Duplicate');
	});
	for (const field of [ 'en', 'zh' ]) {
		test(`rejects changed combined Forge Steel ${field} even when book sources match`, () => {
			const { rows, manifest } = fixture();
			rows['book.first'].fs[field] += ' Changed.';
			expect(validateSourceDependencies(manifest, rows)[0].message).toContain(`Forge Steel ${field} changed`);
		});
	}
	test('requires a checkpoint for every newly approved Forge Steel version', () => {
		const { rows, manifest } = fixture();
		rows['book.second'].fs = { en: 'New adaptation', zh: 'New approved adaptation' };
		expect(validateSourceDependencies(manifest, rows)[0].key).toBe('book.second');
	});
	test('rejects obsolete checkpoints', () => {
		const { rows, manifest } = fixture();
		delete rows['book.first'].fs;
		expect(validateSourceDependencies(manifest, rows)[0].message).toContain('missing its approved Forge Steel version');
	});
	test.each([ null, [], {}, { version: 2, rows: {} } ])('rejects malformed manifests without throwing: %j', manifest => {
		expect(validateSourceDependencies(manifest, fixture().rows)).toHaveLength(1);
	});
	test('rejects malformed dependencies and translation text in the manifest', () => {
		const { rows, manifest } = fixture();
		manifest.rows['book.first'].sources.push(null);
		expect(validateSourceDependencies(manifest, rows).some(issue => issue.message.startsWith('Invalid dependency'))).toBe(true);
		manifest.rows['book.first'].translation = 'Unapproved text';
		expect(validateSourceDependencies(manifest, rows)[0].message).toContain('only source IDs');
	});
	test('normalizes checkout line endings without weakening content checks', () => {
		expect(hashDependencyText('A\r\nB\rC')).toBe(hashDependencyText('A\nB\nC'));
		expect(hashDependencyText('A B')).not.toBe(hashDependencyText('A  B'));
	});
	test('file loader fails closed for missing or invalid catalogs and manifests', () => {
		const root = mkdtempSync(path.join(tmpdir(), 'l10n-dependencies-'));
		roots.push(root);
		const write = (file, value) => {
			mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
			writeFileSync(path.join(root, file), value);
		};
		expect(checkSourceDependencies(root)[0].message).toContain('Cannot read source dependency manifest');
		write(SOURCE_DEPENDENCIES_FILE, JSON.stringify(fixture().manifest));
		expect(checkSourceDependencies(root)[0].message).toContain('Cannot read approved sources');
		write('src/l10n/generated/zh-TW/glossary.json', '[]');
		expect(checkSourceDependencies(root)[0].message).toContain('Invalid approved source catalog');
		write('src/l10n/generated/zh-TW/glossary.json', '{}');
		write('src/l10n/generated/zh-TW/names.json', '{}');
		write('src/l10n/generated/zh-TW/strings.json', JSON.stringify(fixture().rows));
		expect(checkSourceDependencies(root)).toEqual([]);
		write('src/l10n/generated/zh-TW/names.json', JSON.stringify({ 'book.second': fixture().rows['book.second'] }));
		expect(checkSourceDependencies(root)[0].message).toContain('Ambiguous approved source ID');
	});
	test('staged catalog uses the committed root manifest and detects changed later sources before publication', () => {
		const root = mkdtempSync(path.join(tmpdir(), 'l10n-dependencies-root-'));
		const stage = mkdtempSync(path.join(tmpdir(), 'l10n-dependencies-stage-'));
		roots.push(root, stage);
		const write = (directory, file, value) => {
			mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
			writeFileSync(path.join(directory, file), JSON.stringify(value));
		};
		const { rows, manifest } = fixture();
		write(root, SOURCE_DEPENDENCIES_FILE, manifest);
		for (const directory of [ root, stage ]) {
			write(directory, 'src/l10n/generated/zh-TW/glossary.json', {});
			write(directory, 'src/l10n/generated/zh-TW/names.json', {});
			write(directory, 'src/l10n/generated/zh-TW/strings.json', rows);
		}
		// No staged manifest is required or trusted: approvals remain in root.
		expect(checkSourceDependencies(root, stage)).toEqual([]);
		rows['book.second'].zh += ' Staged change.';
		write(stage, 'src/l10n/generated/zh-TW/strings.json', rows);
		// Even a staged checkpoint claiming the new hashes cannot bypass review.
		const stagedManifest = structuredClone(manifest);
		stagedManifest.rows['book.first'].sources[1].zhHash = hashDependencyText(rows['book.second'].zh);
		write(stage, SOURCE_DEPENDENCIES_FILE, stagedManifest);
		expect(checkSourceDependencies(root)).toEqual([]);
		expect(checkSourceDependencies(root, stage)).toEqual([
			expect.objectContaining({ key: 'book.first', message: expect.stringContaining('source book.second zh changed') })
		]);
	});
});

describe('committed approved source inventory', () => {
	const manifest = JSON.parse(readFileSync(path.join(repo, SOURCE_DEPENDENCIES_FILE), 'utf8'));
	test('all current Forge Steel rows have a valid checkpoint', () => {
		expect(checkSourceDependencies(repo)).toEqual([]);
	});
	test('a Book Name checkpoint uses the same hash guard as a Book String', () => {
		const row = { en: 'Traveling Artisan', zh: '旅行工匠', fs: { en: 'Travelling Artisan', zh: '旅行工匠' } };
		const source = { sheetId: 'name.perk.traveling-artisan', enHash: hashDependencyText(row.en), zhHash: hashDependencyText(row.zh) };
		const manifest = { version: 1, rows: { [source.sheetId]: {
			sources: [ source ], sourcesHash: hashDependencyIds([ source ]),
			fs: { enHash: hashDependencyText(row.fs.en), zhHash: hashDependencyText(row.fs.zh) }
		} } };
		expect(validateSourceDependencies(manifest, { [source.sheetId]: row })).toEqual([]);
		row.zh = '改寫';
		expect(validateSourceDependencies(manifest, { [source.sheetId]: row })[0].message).toContain('zh changed');
	});
	test('every adaptation derives from its declared book sources, except explicitly approved compositions', () => {
		const rows = {};
		for (const file of [ 'glossary.json', 'names.json', 'strings.json' ]) {
			Object.assign(rows, JSON.parse(readFileSync(path.join(repo, 'src/l10n/generated/zh-TW', file), 'utf8')));
		}
		const optionPrefix = 'heroes.ancestries.dragon-knight.trait.prismatic-scales.option.';
		const exceptions = new Set([
			...([ 'acid', 'cold', 'corruption', 'fire', 'lightning', 'poison' ].map(type => `${optionPrefix}${type}.name`)),
			// The approved website tagline is new wording, not a literal excerpt.
			'heroes.ancestries.dragon-knight.trait.draconian-guard.effect',
			// These approved website strings compose multiple source regions or add formatting.
			'heroes.ancestries.dragon-knight.trait.remember-your-oath.effect',
			'heroes.ancestries.dwarf.signature.runic-carving.intro',
			'heroes.ancestries.hakaan.trait.doomsight.effect.1',
			'heroes.ancestries.revenant.trait.vengeance-mark.effect.1'
		]);
		for (const [ id, entry ] of Object.entries(manifest.rows)) {
			if (exceptions.has(id)) continue;
			const source = entry.sources.map(item => rows[item.sheetId].zh).join('').replace(/\s/g, '');
			const target = rows[id].fs.zh.replace(/\s/g, '');
			let position = 0;
			for (const char of source) {
				if (char === target[position]) position++;
			}
			expect(position, `Declared sources do not cover the approved adaptation ${id}`).toBe(target.length);
		}
	});
	test('the linguist child use deletes from the same approved paragraph', () => {
		const adaptations = JSON.parse(readFileSync(path.join(repo, 'src/l10n/generated/zh-TW/adaptations.json'), 'utf8'));
		const strings = JSON.parse(readFileSync(path.join(repo, 'src/l10n/generated/zh-TW/strings.json'), 'utf8'));
		const child = adaptations['fs-adapt:heroes.perks.linguist.effect.1'];
		const source = strings['heroes.perks.linguist.effect'].zh.replace(/\s/g, '');
		const target = child.zh.replace(/\s/g, '');
		let position = 0;
		for (const char of source) {
			if (char === target[position]) position += 1;
		}
		expect(position).toBe(target.length);
		expect(child.sources[0].sourceId).toBe('heroes.perks.linguist.effect');
		expect(strings['heroes.perks.linguist.effect'].fs.zh.startsWith('你自動學會')).toBe(true);
		expect(child.zh.includes('此外')).toBe(false);
	});
	// Independent evidence from approved Sheet rows and DECISIONS P2-9-1/P2-9-2.
	// These assertions prevent a later manifest rebuild from forgetting a source.
	test.each([
		[ 'heroes.ancestries.dwarf.signature.runic-carving.intro', [ 'heroes.ancestries.dwarf.signature.runic-carving.limit' ] ],
		[ 'heroes.ancestries.hakaan.description.1', [ 'heroes.ancestries.hakaan.description.2' ] ],
		[ 'heroes.ancestries.hakaan.trait.doomsight.effect.1', [ 'heroes.ancestries.hakaan.trait.doomsight.effect.2', 'heroes.ancestries.hakaan.trait.doomsight.effect.3' ] ],
		[ 'heroes.ancestries.revenant.description.1', [ 'heroes.ancestries.revenant.description.2' ] ],
		[ 'heroes.ancestries.revenant.trait.vengeance-mark.effect.1', [ 'heroes.ancestries.revenant.trait.vengeance-mark.effect.2' ] ]
	])('retains every known merged source for %s', (id, others) => {
		expect(manifest.rows[id].sources.map(source => source.sheetId)).toEqual([ id, ...others ]);
	});
});
