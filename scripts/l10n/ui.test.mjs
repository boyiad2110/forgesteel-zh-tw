import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import ts from 'typescript';
import { applyUITemplate } from '../../src/l10n/ui-text';
import { mapping } from '../../src/l10n/mapping';
import approvedEnglish from '../../src/l10n/ui-english.json';
import ui from '../../src/l10n/generated/zh-TW/ui.json';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const files = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
	const target = path.join(directory, entry.name);
	return entry.isDirectory() ? files(target) : target.endsWith('.tsx') ? [ target ] : [];
});

describe('approved UI bindings', () => {
	test('every approved row has an exact source call and a guarded mapping', () => {
		const used = new Set();
		for (const file of files(path.join(root, 'src/components'))) {
			const source = readFileSync(file, 'utf8');
			const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
			const visit = node => {
				if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
					&& ts.isIdentifier(node.expression.expression) && node.expression.expression.text === 'ui'
					&& [ 'text', 'format' ].includes(node.expression.name.text)) {
					const [ id, english ] = node.arguments;
					expect(ts.isStringLiteral(id) && ts.isStringLiteral(english), file).toBe(true);
					expect(approvedEnglish[id.text], file).toBe(english.text);
					used.add(id.text);
				}
				ts.forEachChild(node, visit);
			};
			visit(ast);
		}
		const ids = Object.keys(ui);
		expect(used).toEqual(new Set(ids));
		for (const id of ids) {
			expect(approvedEnglish[id]).toBe(ui[id].en);
			expect(mapping[`ui:${id}`]).toEqual({ sheetId: id,
				enHash: createHash('sha256').update(ui[id].en).digest('hex') });
		}
	});

	test('preserves signed modifiers and falls back when a template is incomplete', () => {
		const source = approvedEnglish['ui.hero-builder.heroic-resource-cost-props-d.2f45ea1c'];
		expect(applyUITemplate('英雄資源費用 {modifier}', source, 'Heroic resource cost +2', { modifier: '+2' })).toBe('英雄資源費用 +2');
		expect(applyUITemplate('英雄資源費用 {value}', source, 'Heroic resource cost -1', { modifier: '-1' })).toBe('Heroic resource cost -1');
		expect(applyUITemplate(source, source, 'Heroic resource cost +2', { modifier: '+2' })).toBe('Heroic resource cost +2');
	});
});
