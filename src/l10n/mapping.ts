/**
 * Forge Steel display key → Master Sheet id.
 *
 * Keys look like `element:ancestry-orc:name`, `enum:Characteristic:Might`,
 * or `ui:library.ancestries`. The sheet id is a row in the generated
 * zh-TW JSON (`heroes.ancestries.orc.name`, `term.might`, …).
 *
 * Empty on purpose. Until a later batch fills this in, every lookup misses
 * and the screen keeps the original English string.
 */
export const mapping: Record<string, string> = {};
