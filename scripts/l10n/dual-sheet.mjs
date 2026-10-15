/** Stage C dual-source capture. This module never reads the Book Strings P–V columns. */
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildCatalog, parseCsv } from './export-sheet.mjs';
import { parseCalculationDisplay } from './sheet-capture.mjs';
import { hashDependencyIds, hashDependencyText } from './source-dependencies.mjs';

export const BOOK_SHEET_ID = '1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4';
export const FORGE_SHEET_ID = '1bbtgLVODKGrghfsGDnp4ePECcqS9j3SnCXvcptxXWaw';
export const DUAL_HEADERS = {
  book: {
    Glossary: [ 'Glossary ID', 'Status', 'Target Term', 'Source Term', 'Last Updated' ],
    Names: [ 'Name ID', 'Status', 'Target Name', 'Source Name', 'Last Updated' ],
    Strings: [ 'String ID', 'Status', 'Target Text', 'Source Text', 'Last Updated' ]
  },
  forge: {
    'Forge Steel UI': [ 'UI ID', 'Status', 'Target Text', 'Source Text', 'Last Updated', 'Source Hash' ],
    Adaptations: [ 'Adaptation ID', 'Book String ID', 'Usage Key', 'Forge Steel Source Text',
      'Forge Steel Target Text', 'Status', 'Basis Hash', 'Forge Steel Note', 'Last Updated',
      'Source List SHA-256', 'Manifest Forge Steel Source SHA-256',
      'Manifest Forge Steel Target SHA-256' ],
    'Adaptation Sources': [ 'Adaptation ID', 'Source Order', 'Source Type', 'Source Record ID',
      'Source English SHA-256', 'Source Chinese SHA-256', 'Source Book Sheet ID' ]
  }
};

const sha = text => createHash('sha256').update(text, 'utf8').digest('hex');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const csv = rows => rows.map(row => row.map(value => /[",\r\n]/.test(value)
  ? `"${value.replaceAll('"', '""')}"` : value).join(',')).join('\n') + '\n';
const requireText = (value, label) => {
  if (typeof value !== 'string') throw new Error(`${label}: expected text`);
  return value;
};
const rowsOf = (table, headers, name, statusHeader) => {
  const values = table?.values;
  if (!Array.isArray(values) || !Array.isArray(values[0])) throw new Error(`${name}: missing complete range read`);
  const indexes = headers.map(header => {
    const found = values[0].flatMap((value, index) => value === header ? [ index ] : []);
    if (found.length !== 1) throw new Error(`${name}: missing or duplicate header ${header}`);
    return found[0];
  });
  return values.slice(1).map((row, index) => {
    if (!Array.isArray(row)) throw new Error(`${name}: invalid row ${index + 2}`);
    return indexes.map((column, i) => requireText(row[column] ?? '', `${name} row ${index + 2} ${headers[i]}`));
  }).filter(row => statusHeader === undefined || row[headers.indexOf(statusHeader)] === 'APPROVED');
};
const metadata = (before, after, expected, label) => {
  if (before?.id !== expected || after?.id !== expected
    || before.mime_type !== 'application/vnd.google-apps.spreadsheet'
    || after.mime_type !== before.mime_type
    || typeof before.modified_time !== 'string' || !Number.isFinite(Date.parse(before.modified_time))
    || before.modified_time !== after.modified_time) {
    throw new Error(`${label}: identity or modified time changed; discard both captures`);
  }
  return before.modified_time;
};
const unique = (rows, index, name) => {
  const seen = new Set();
  for (const row of rows) {
    if (!row[index] || seen.has(row[index])) throw new Error(`${name}: missing or duplicate ID ${row[index]}`);
    seen.add(row[index]);
  }
};

/** Metadata must be fetched before and after all reads for each spreadsheet. */
export async function captureDualSheets(readBookMetadata, readForgeMetadata, readBookTab, readForgeTab) {
  const [ bookBefore, forgeBefore ] = await Promise.all([ readBookMetadata(), readForgeMetadata() ]);
  const [ bookResults, forgeResults ] = await Promise.all([
    Promise.all(Object.keys(DUAL_HEADERS.book).map(async name => [ name, await readBookTab(name) ])),
    Promise.all(Object.keys(DUAL_HEADERS.forge).map(async name => [ name, await readForgeTab(name) ]))
  ]);
  const [ bookAfter, forgeAfter ] = await Promise.all([ readBookMetadata(), readForgeMetadata() ]);
  return projectDualCapture({ bookBefore, forgeBefore, bookAfter, forgeAfter,
    book: Object.fromEntries(bookResults), forge: Object.fromEntries(forgeResults) });
}

/** Fail closed on source links, approved hashes, order, and ambiguous website usage. */
export function projectDualCapture(raw) {
  const bookTime = metadata(raw.bookBefore, raw.bookAfter, BOOK_SHEET_ID, 'Book Sheet');
  const forgeTime = metadata(raw.forgeBefore, raw.forgeAfter, FORGE_SHEET_ID, 'Forge Sheet');
  const book = Object.fromEntries(Object.entries(DUAL_HEADERS.book).map(([ name, headers ]) =>
    [ name, rowsOf(raw.book[name], headers, name, 'Status') ]));
  const allAdaptations = rowsOf(raw.forge.Adaptations, DUAL_HEADERS.forge.Adaptations, 'Adaptations');
  unique(allAdaptations, 0, 'Adaptations');
  const adaptationById = new Map(allAdaptations.map(row => [ row[0], row ]));
  const forge = Object.fromEntries(Object.entries(DUAL_HEADERS.forge).map(([ name, headers ]) =>
    [ name, name === 'Adaptations' ? allAdaptations.filter(row => row[5] === 'APPROVED')
      : rowsOf(raw.forge[name], headers, name, name === 'Adaptation Sources' ? undefined : 'Status') ]));
  for (const [ name, rows ] of Object.entries(book)) unique(rows, 0, name);
  unique(forge['Forge Steel UI'], 0, 'Forge Steel UI');
  const strings = new Map(book.Strings.map(row => [ row[0], row ]));
  const names = new Map(book.Names.map(row => [ row[0], row ]));
  const locateBookRecord = id => {
    const asString = strings.get(id);
    const asName = names.get(id);
    if (asString && asName) throw new Error(`Adaptations: ${id} is both a Book String and a Book Name`);
    if (asString) return { kind: 'Book String', row: asString };
    if (asName) return { kind: 'Book Name', row: asName };
    return null;
  };
  const usage = new Map();
  const sourceGroups = new Map();
  const sourceLinks = new Set();
  for (const row of forge['Adaptation Sources']) {
    const [ id, order, type, sourceId, enHash, zhHash, sheetId ] = row;
    const adaptation = adaptationById.get(id);
    if (!adaptation) throw new Error(`Adaptation Sources: orphan ${id}`);
    if (adaptation[5] !== 'APPROVED') continue;
    if (!/^\d+$/.test(order) || Number(order) < 1 || sourceLinks.has(`${id}\0${order}`)) {
      throw new Error(`Adaptation Sources: duplicate or invalid Source Order for ${id}`);
    }
    sourceLinks.add(`${id}\0${order}`);
    if ((type !== 'Book String' && type !== 'Book Name') || sheetId !== BOOK_SHEET_ID) {
      throw new Error(`Adaptation Sources: invalid source identity for ${id}`);
    }
    const source = (type === 'Book Name' ? names : strings).get(sourceId);
    if (!source) throw new Error(`Adaptation Sources: unapproved or missing ${type} ${sourceId}`);
    if (hashDependencyText(source[3]) !== enHash || hashDependencyText(source[2]) !== zhHash) {
      throw new Error(`Adaptation Sources: stale English/Chinese hash for ${id} / ${sourceId}`);
    }
    if (!sourceGroups.has(id)) sourceGroups.set(id, []);
    sourceGroups.get(id).push(row);
  }
  forge['Adaptation Sources'] = Array.from(sourceGroups.values()).flat();
  for (const row of forge['Forge Steel UI']) {
    if (sha(row[3]) !== row[5]) throw new Error(`Forge Steel UI: Source Hash mismatch for ${row[0]}`);
  }
  for (const row of forge.Adaptations) {
    const [ id, bookId, key, en, zh, , basis, note, , listHash, enHash, zhHash ] = row;
    const primary = locateBookRecord(bookId);
    if (!id.startsWith('fs-adapt:') || !primary || !en || !zh) {
      throw new Error(`Adaptations: invalid ID, approved Book source, or text for ${id}`);
    }
    // Blank usage keys are approved historical exceptions; IDs remain authoritative.
    if (key && usage.has(key)) throw new Error(`Adaptations: duplicate active Usage Key ${key}`);
    if (key) usage.set(key, id);
    const sources = sourceGroups.get(id) || [];
    sources.sort((a, b) => Number(a[1]) - Number(b[1]));
    if (!sources.length || sources[0][3] !== bookId || sources[0][2] !== primary.kind
      || sources.some((source, index) => Number(source[1]) !== index + 1)
      || new Set(sources.map(source => source[3])).size !== sources.length) {
      throw new Error(`Adaptations: incomplete, reordered, or duplicate sources for ${id}`);
    }
    if (basis !== hashDependencyText(primary.row[2])
      || listHash !== hashDependencyIds(sources.map(source => ({ sheetId: source[3] })))
      || enHash !== hashDependencyText(en) || zhHash !== hashDependencyText(zh)) {
      throw new Error(`Adaptations: stale Basis, Source List, or Forge Steel hash for ${id}`);
    }
    if (/(^|\r?\n)\s*Calculation Display:/.test(note)) {
      if (primary.kind === 'Book Name') {
        throw new Error(`Adaptations: Calculation Display is only valid on a Book String for ${id}`);
      }
      parseCalculationDisplay(note, zh);
    }
  }
  return { sources: {
    book: { spreadsheetId: BOOK_SHEET_ID, modifiedTime: bookTime },
    forge: { spreadsheetId: FORGE_SHEET_ID, modifiedTime: forgeTime }
  }, book, forge };
}

/** A legacy-compatible view is generated only from the two approved inputs. */
export function buildDualSnapshot(capture) {
  if (capture?.sources?.book?.spreadsheetId !== BOOK_SHEET_ID
    || capture?.sources?.forge?.spreadsheetId !== FORGE_SHEET_ID) throw new Error('missing dual-source identity');
  const files = new Map();
  const nameIds = new Set(capture.book.Names.map(row => row[0]));
  const byBook = new Map();
  const byName = new Map();
  const notes = {};
  for (const row of capture.forge.Adaptations) {
    const [ id, bookId, , en, zh, , basis, note ] = row;
    if (id === `fs-adapt:${bookId}`) {
      const canonical = nameIds.has(bookId) ? byName : byBook;
      if (canonical.has(bookId)) throw new Error(`duplicate canonical Adaptation for ${bookId}`);
      canonical.set(bookId, [ en, zh, 'APPROVED', basis ]);
      if (!nameIds.has(bookId) && /(^|\r?\n)\s*Calculation Display:/.test(note)) notes[bookId] = note;
    }
  }
  const nameForgeHeaders = [ 'Forge Steel Source Text', 'Forge Steel Target Text', 'Forge Steel Status', 'Forge Steel Basis Hash' ];
  for (const [ name, headers ] of Object.entries(DUAL_HEADERS.book)) {
    const rows = capture.book[name].slice().sort((a, b) => a[0].localeCompare(b[0], 'en'));
    if (name === 'Strings') {
      files.set('strings.csv', csv([ [ ...headers, ...nameForgeHeaders ], ...rows.map(row => [ ...row, ...(byBook.get(row[0]) || [ '', '', '', '' ]) ]) ]));
    } else if (name === 'Names' && byName.size) {
      files.set('names.csv', csv([ [ ...headers, ...nameForgeHeaders ], ...rows.map(row => [ ...row, ...(byName.get(row[0]) || [ '', '', '', '' ]) ]) ]));
    } else files.set(`${name.toLowerCase()}.csv`, csv([ headers, ...rows ]));
  }
  files.set('ui.csv', csv([ DUAL_HEADERS.forge['Forge Steel UI'],
    ...capture.forge['Forge Steel UI'].slice().sort((a, b) => a[0].localeCompare(b[0], 'en')) ]));
  files.set('adaptations.csv', csv([ DUAL_HEADERS.forge.Adaptations,
    ...capture.forge.Adaptations.slice().sort((a, b) => a[0].localeCompare(b[0], 'en')) ]));
  files.set('adaptation-sources.csv', csv([ DUAL_HEADERS.forge['Adaptation Sources'],
    ...capture.forge['Adaptation Sources'].slice().sort((a, b) =>
      a[0].localeCompare(b[0], 'en') || Number(a[1]) - Number(b[1])) ]));
  files.set('calculation-displays.json', json(notes));
  const namesForFingerprint = byName.size
    ? csv([ DUAL_HEADERS.book.Names, ...capture.book.Names.slice().sort((a, b) => a[0].localeCompare(b[0], 'en')) ])
    : files.get('names.csv');
  const bookFingerprint = sha(files.get('glossary.csv') + namesForFingerprint
    + csv([ DUAL_HEADERS.book.Strings, ...capture.book.Strings.slice()
      .sort((a, b) => a[0].localeCompare(b[0], 'en')) ]));
  const forgeFingerprint = sha([ 'ui.csv', 'adaptations.csv', 'adaptation-sources.csv' ]
    .map(name => files.get(name)).join(''));
  files.set('source.json', json({ sheetFileId: BOOK_SHEET_ID,
    sheetModifiedTime: capture.sources.book.modifiedTime,
    sources: {
      book: { ...capture.sources.book, contentSha256: bookFingerprint },
      forge: { ...capture.sources.forge, contentSha256: forgeFingerprint }
    }
  }));
  return files;
}

export function buildDualCatalog(capture) {
  const snapshot = buildDualSnapshot(capture);
  const dir = mkdtempSync(path.join(tmpdir(), 'l10n-dual-'));
  try {
    for (const [ name, value ] of snapshot) writeFileSync(path.join(dir, name), value);
    const catalog = buildCatalog(dir);
    const meta = JSON.parse(catalog.get('meta.json'));
    meta.sources = JSON.parse(snapshot.get('source.json')).sources;
    catalog.set('meta.json', json(meta));
    const links = new Map();
    for (const [ id, order, , sourceId, enHash, zhHash ] of capture.forge['Adaptation Sources']) {
      if (!links.has(id)) links.set(id, []);
      links.get(id).push({ order: Number(order), sourceId, enHash, zhHash });
    }
    const adaptations = {};
    for (const [ id, bookStringId, usageKey, en, zh, , basisHash, , updated ] of
      capture.forge.Adaptations.slice().sort((a, b) => a[0].localeCompare(b[0], 'en'))) {
      adaptations[id] = { bookStringId, usageKey, en, zh, basisHash, updated,
        sources: (links.get(id) || []).sort((a, b) => a.order - b.order) };
    }
    catalog.set('adaptations.json', json(adaptations));
    return { snapshot, catalog };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Re-read committed dual snapshots and validate every source link and fingerprint. */
export function buildDualCatalogFromSnapshot(dir) {
  const source = JSON.parse(readFileSync(path.join(dir, 'source.json'), 'utf8'));
  if (source?.sources?.book?.spreadsheetId !== BOOK_SHEET_ID
    || source?.sources?.forge?.spreadsheetId !== FORGE_SHEET_ID) throw new Error('missing dual-source metadata');
  const table = name => ({ values: parseCsv(readFileSync(path.join(dir, name), 'utf8'), name) });
  const strings = table('strings.csv');
  strings.values = strings.values.map(row => row.slice(0, DUAL_HEADERS.book.Strings.length));
  const book = { Glossary: table('glossary.csv'), Names: table('names.csv'), Strings: strings };
  const forge = { 'Forge Steel UI': table('ui.csv'), Adaptations: table('adaptations.csv'),
    'Adaptation Sources': table('adaptation-sources.csv') };
  const meta = (spreadsheetId, modifiedTime) => ({
    id: spreadsheetId, mime_type: 'application/vnd.google-apps.spreadsheet', modified_time: modifiedTime
  });
  const capture = projectDualCapture({ book, forge,
    bookBefore: meta(BOOK_SHEET_ID, source.sources.book.modifiedTime),
    bookAfter: meta(BOOK_SHEET_ID, source.sources.book.modifiedTime),
    forgeBefore: meta(FORGE_SHEET_ID, source.sources.forge.modifiedTime),
    forgeAfter: meta(FORGE_SHEET_ID, source.sources.forge.modifiedTime) });
  const expected = buildDualSnapshot(capture);
  for (const [ name, text ] of expected) {
    if (readFileSync(path.join(dir, name), 'utf8') !== text) throw new Error(`${name}: dual snapshot differs`);
  }
  return buildDualCatalog(capture).catalog;
}
