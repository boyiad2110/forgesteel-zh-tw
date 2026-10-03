/**
 * One approved display string.
 *
 * `sheetId` is a row in the generated zh-TW JSON.
 * `enHash` is the sha256 of the Forge Steel English at the moment this row
 * was approved. `scripts/l10n/check.mjs` recomputes that English from
 * upstream data and fails when the hash no longer matches.
 */
export interface MappingEntry {
	sheetId: string;
	enHash: string;
}

/**
 * Forge Steel display key → approved sheet row.
 *
 * Keys:
 *   element:<id>:<field>  for example element:ancestry-orc:name
 *   enum:<Enum>:<Member>  for example enum:Characteristic:Might
 *   ui:<id>               for example ui:library.ancestries
 *
 * Empty on purpose. Until a later batch fills this in, every lookup misses
 * and the screen keeps the original English string.
 */
export const mapping: Record<string, MappingEntry> = {};
