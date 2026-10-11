#!/usr/bin/env node
/** Offline Stage C integration; dry-run unless --apply. Both source versions are mandatory. */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDualCatalog, buildDualCatalogFromSnapshot, projectDualCapture } from './dual-sheet.mjs';
import { formatIssues, runCheck } from './check.mjs';
import { replaceFiles } from './refresh-sheet.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export function refreshDualSheet(raw, { root: target = root, apply = false } = {}) {
  const capture = projectDualCapture(raw);
  const { snapshot, catalog } = buildDualCatalog(capture);
  const stage = mkdtempSync(path.join(tmpdir(), 'l10n-dual-refresh-'));
  try {
    const snapshotDir = path.join(stage, 'l10n/sheet-snapshot');
    const catalogDir = path.join(stage, 'src/l10n/generated/zh-TW');
    mkdirSync(snapshotDir, { recursive: true });
    mkdirSync(catalogDir, { recursive: true });
    for (const [ name, value ] of snapshot) writeFileSync(path.join(snapshotDir, name), value);
    for (const [ name, value ] of catalog) writeFileSync(path.join(catalogDir, name), value);
    const rebuilt = buildDualCatalogFromSnapshot(snapshotDir);
    for (const [ name, text ] of catalog) {
      if (rebuilt.get(name) !== text) throw new Error(`${name}: dual rebuild differs`);
    }
    const issues = runCheck(target, stage);
    if (issues.length) throw new Error(formatIssues(issues));
    const files = new Map([
      ...Array.from(snapshot, ([ name, text ]) => [ path.join(target, 'l10n/sheet-snapshot', name), text ]),
      ...Array.from(catalog, ([ name, text ]) => [ path.join(target, 'src/l10n/generated/zh-TW', name), text ])
    ]);
    const changes = Array.from(files).filter(([ file, text ]) =>
      !existsSync(file) || !readFileSync(file).equals(Buffer.from(text)))
      .map(([ file, text ]) => ({ file: path.relative(target, file).replaceAll('\\', '/'),
        sha256: createHash('sha256').update(text).digest('hex') }));
    if (apply) replaceFiles(files);
    return { applied: apply, changes, counts: JSON.parse(catalog.get('meta.json')).counts,
      sources: JSON.parse(snapshot.get('source.json')).sources };
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if ((args.length !== 2 && args.length !== 3) || args[0] !== '--input'
      || (args.length === 3 && args[2] !== '--apply')) {
      throw new Error('usage: node scripts/l10n/refresh-dual-sheet.mjs --input <approved-dual-capture.json> [--apply]');
    }
    console.log(JSON.stringify(refreshDualSheet(JSON.parse(readFileSync(args[1], 'utf8')),
      { apply: args.length === 3 }), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
