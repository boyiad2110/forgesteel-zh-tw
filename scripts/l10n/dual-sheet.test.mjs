import { describe, expect, test } from 'vitest';
import { BOOK_SHEET_ID, FORGE_SHEET_ID, DUAL_HEADERS, buildDualCatalog,
  buildDualCatalogFromSnapshot, captureDualSheets, projectDualCapture } from './dual-sheet.mjs';
import { hashDependencyIds, hashDependencyText } from './source-dependencies.mjs';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const sha = text => createHash('sha256').update(text).digest('hex');
const bookTime = '2026-10-11T01:00:00.000Z';
const forgeTime = '2026-10-11T02:00:00.000Z';
const meta = (id, time) => ({ id, mime_type: 'application/vnd.google-apps.spreadsheet', modified_time: time });
const bookId = 'heroes.demo.rules';
const sourceId = 'heroes.demo.extra';
const en = 'Gain Might.';
const zh = '獲得力量。';
const fsEn = 'Gain Might';
const fsZh = '獲得力量';
const note = 'Reviewer kept this line.\r\nCalculation Display: {"status":"APPROVED","target":"力量","template":"{value} 點"}';
const base = () => {
  const sources = [ bookId, sourceId ];
  const adaptation = [ `fs-adapt:${bookId}`, bookId, '', fsEn, fsZh, 'APPROVED',
    hashDependencyText(zh), note, '2026-10-11', hashDependencyIds(sources.map(sheetId => ({ sheetId }))),
    hashDependencyText(fsEn), hashDependencyText(fsZh) ];
  const sourceRows = sources.map((id, i) => [ adaptation[0], String(i + 1), 'Book String', id,
    hashDependencyText(i ? 'More.' : en), hashDependencyText(i ? '更多。' : zh), BOOK_SHEET_ID ]);
  return { bookBefore: meta(BOOK_SHEET_ID, bookTime), bookAfter: meta(BOOK_SHEET_ID, bookTime),
    forgeBefore: meta(FORGE_SHEET_ID, forgeTime), forgeAfter: meta(FORGE_SHEET_ID, forgeTime),
    book: {
      Glossary: { values: [ DUAL_HEADERS.book.Glossary, [ 'term.demo', 'APPROVED', '示範', 'Demo', '2026-10-11' ] ] },
      Names: { values: [ DUAL_HEADERS.book.Names ] },
      Strings: { values: [ DUAL_HEADERS.book.Strings,
        [ bookId, 'APPROVED', zh, en, '2026-10-11' ],
        [ sourceId, 'APPROVED', '更多。', 'More.', '2026-10-11' ] ] }
    },
    forge: {
      'Forge Steel UI': { values: [ DUAL_HEADERS.forge['Forge Steel UI'],
        [ 'ui.hero-builder.demo.1234abcd', 'APPROVED', '選擇', 'Choose', '2026-10-11', sha('Choose') ] ] },
      Adaptations: { values: [ DUAL_HEADERS.forge.Adaptations, adaptation ] },
      'Adaptation Sources': { values: [ DUAL_HEADERS.forge['Adaptation Sources'], ...sourceRows ] }
    }
  };
};

describe('dual-source capture', () => {
  test('preserves stable IDs, blank Usage Key, ordered multi-source links and verbatim Note', () => {
    const capture = projectDualCapture(base());
    const { snapshot, catalog } = buildDualCatalog(capture);
    const strings = JSON.parse(catalog.get('strings.json'));
    expect(strings[bookId].fs.zh).toBe(fsZh);
    expect(strings[bookId].fs.calculationDisplay.template).toBe('{value} 點');
    expect(JSON.parse(snapshot.get('calculation-displays.json'))[bookId]).toBe(note);
    expect(snapshot.get('adaptations.csv')).toContain(`fs-adapt:${bookId}`);
    expect(snapshot.get('adaptation-sources.csv')).toContain(sourceId);
    expect(JSON.parse(snapshot.get('source.json')).sources.forge.spreadsheetId).toBe(FORGE_SHEET_ID);
    expect(JSON.parse(catalog.get('adaptations.json'))[`fs-adapt:${bookId}`].sources).toHaveLength(2);
  });
  test('accepts a second approved website use of the same Book String with its own ID', () => {
    const raw = base();
    const second = [ ...raw.forge.Adaptations.values[1] ];
    second[0] = 'fs-adapt:second-use';
    second[2] = 'section:second-use:0';
    second[7] = '';
    raw.forge.Adaptations.values.push(second);
    raw.forge['Adaptation Sources'].values.push(...raw.forge['Adaptation Sources'].values.slice(1)
      .map(row => [ second[0], ...row.slice(1) ]));
    const { snapshot, catalog } = buildDualCatalog(projectDualCapture(raw));
    expect(snapshot.get('adaptations.csv')).toContain(second[0]);
    expect(JSON.parse(catalog.get('adaptations.json'))[second[0]].usageKey).toBe('section:second-use:0');
    expect(JSON.parse(catalog.get('strings.json'))[bookId].fs.zh).toBe(fsZh);
  });
  test.each([ 'NEW', 'REVIEW' ])('ignores %s Adaptation and its existing source links', status => {
    const raw = base();
    const draft = [ ...raw.forge.Adaptations.values[1] ];
    draft[0] = 'fs-adapt:future-use';
    draft[2] = 'section:future-use:0';
    draft[4] = '未核准文字';
    draft[5] = status;
    draft[7] = 'Do not publish';
    raw.forge.Adaptations.values.push(draft);
    raw.forge['Adaptation Sources'].values.push(...raw.forge['Adaptation Sources'].values.slice(1)
      .map(row => [ draft[0], ...row.slice(1) ]));
    const projected = projectDualCapture(raw);
    expect(projected.forge.Adaptations).toHaveLength(1);
    expect(projected.forge['Adaptation Sources']).toHaveLength(2);
    const current = buildDualCatalog(projected);
    const approvedOnly = buildDualCatalog(projectDualCapture(base()));
    expect(Array.from(current.snapshot)).toEqual(Array.from(approvedOnly.snapshot));
    expect(Array.from(current.catalog)).toEqual(Array.from(approvedOnly.catalog));
    expect(JSON.stringify(Array.from(current.snapshot))).not.toContain('未核准文字');
  });
  test.each([
    [ 'Book version change', raw => { raw.bookAfter.modified_time = '2026-10-11T01:00:01.000Z'; } ],
    [ 'Forge version change', raw => { raw.forgeAfter.modified_time = '2026-10-11T02:00:01.000Z'; } ],
    [ 'wrong Forge ID', raw => { raw.forgeAfter.id = BOOK_SHEET_ID; } ],
    [ 'missing adaptation ID with source links', raw => { raw.forge.Adaptations.values.pop(); } ],
    [ 'duplicate adaptation', raw => { raw.forge.Adaptations.values.push(raw.forge.Adaptations.values[1]); } ],
    [ 'stale Book source', raw => { raw.book.Strings.values[2][2] = '改寫。'; } ],
    [ 'reordered sources', raw => { raw.forge['Adaptation Sources'].values[1][1] = '2'; raw.forge['Adaptation Sources'].values[2][1] = '1'; } ],
    [ 'missing multi-source link', raw => { raw.forge['Adaptation Sources'].values.pop(); } ],
    [ 'duplicate source order', raw => { raw.forge['Adaptation Sources'].values[2][1] = '1'; } ],
    [ 'changed Source List hash', raw => { raw.forge.Adaptations.values[1][9] = sha('wrong'); } ],
    [ 'changed Basis hash', raw => { raw.forge.Adaptations.values[1][6] = sha('wrong'); } ],
    [ 'changed Forge Chinese hash', raw => { raw.forge.Adaptations.values[1][11] = sha('wrong'); } ],
    [ 'changed UI hash', raw => { raw.forge['Forge Steel UI'].values[1][5] = sha('wrong'); } ],
    [ 'duplicate active usage', raw => {
      const other = [ ...raw.forge.Adaptations.values[1] ];
      other[0] = 'fs-adapt:other';
      other[2] = 'section:other:0';
      raw.forge.Adaptations.values[1][2] = 'section:other:0';
      raw.forge.Adaptations.values.push(other);
    } ]
  ])('rejects %s', (_name, change) => {
    const raw = base();
    change(raw);
    expect(() => projectDualCapture(raw)).toThrow();
  });
  test('fetch failure aborts before a capture is returned', async () => {
    const raw = base();
    await expect(captureDualSheets(async () => raw.bookBefore, async () => raw.forgeBefore,
      async name => raw.book[name], async () => { throw new Error('Forge read failed'); }))
      .rejects.toThrow('Forge read failed');
  });
  test('rebuilds a dual snapshot and rejects missing or changed approved relation data', () => {
    const { snapshot, catalog } = buildDualCatalog(projectDualCapture(base()));
    const dir = mkdtempSync(path.join(tmpdir(), 'l10n-dual-test-'));
    try {
      for (const [ name, text ] of snapshot) writeFileSync(path.join(dir, name), text);
      expect(buildDualCatalogFromSnapshot(dir).get('strings.json')).toBe(catalog.get('strings.json'));
      const file = path.join(dir, 'adaptation-sources.csv');
      const original = readFileSync(file, 'utf8');
      writeFileSync(file, original.replace(sourceId, 'heroes.missing.source'));
      expect(() => buildDualCatalogFromSnapshot(dir)).toThrow();
      writeFileSync(file, original);
      const sourceFile = path.join(dir, 'source.json');
      writeFileSync(sourceFile, readFileSync(sourceFile, 'utf8').replace(FORGE_SHEET_ID, BOOK_SHEET_ID));
      expect(() => buildDualCatalogFromSnapshot(dir)).toThrow('missing dual-source metadata');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
