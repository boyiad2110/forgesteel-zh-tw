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

	test('registers the approved UI-05 literals and skill templates', () => {
		const expected = {
			'ui.hero-builder.default-language.28bee244': [ 'Default Language', '預設語言' ],
			'ui.hero-builder.languages.318655ce': [ 'Languages', '語言' ],
			'ui.hero-builder.common-language-description.cc9ef9be': [ 'Choose a Common language.', '選擇 1 種通用語。' ],
			'ui.hero-builder.two-languages-description.0139e42b': [ 'Choose 2  languages.', '選擇 2 種語言。' ],
			'ui.hero-builder.skill-choice-description.9172d5a4': [ '`Choose a skill from ${source}.`', '從{source}中選擇 1 項技能。' ],
			'ui.hero-builder.skills-choice-description.1a7008a2': [ '`Choose ${count} from ${source}.`', '從{source}中選擇 {count} 項技能。' ],
			'ui.hero-builder.skill-list-description.f94c20ab': [ '`${list} skills`', '{list}技能' ],
			'ui.hero-builder.any-skill-list.7f7a6841': [ 'any list', '任意技能類別' ],
			'ui.hero-builder.language-type-common.309955e0': [ 'Common', '通用語' ],
			'ui.hero-builder.language-type-cultural.faf2dbb3': [ 'Cultural', '文化語言' ],
			'ui.hero-builder.language-type-regional.299a03b1': [ 'Regional', '地區語言' ],
			'ui.hero-builder.language-type-dead.ec9b10a4': [ 'Dead', '絕跡語言' ],
			'ui.hero-builder.skill-list-custom.494ca78f': [ 'Custom', '自訂' ],
			'ui.hero-builder.unnamed-extension.04301825': [ 'Unnamed Extension', '未命名擴充項目' ],
			'ui.hero-builder.unknown-extension-target.b764cdc0': [ 'Unknown', '不明' ],
			'ui.hero-builder.unnamed-sourcebook.ff62ab3a': [ 'Unnamed Sourcebook', '未命名來源書' ]
		};
		for (const [ id, [ english, chinese ] ] of Object.entries(expected)) {
			expect(approvedEnglish[id]).toBe(english);
			expect(ui[id]?.en).toBe(english);
			expect(ui[id]?.zh).toBe(chinese);
		}
		expect(Object.keys(expected)).toHaveLength(16);
	});

	test('formats approved skill source and category templates with half-width separators', () => {
		const single = approvedEnglish['ui.hero-builder.skill-choice-description.9172d5a4'];
		const plural = approvedEnglish['ui.hero-builder.skills-choice-description.1a7008a2'];
		const category = approvedEnglish['ui.hero-builder.skill-list-description.f94c20ab'];
		expect(applyUITemplate('從{source}中選擇 1 項技能。', single, 'Choose a skill from Climb, Lore skills.', {
			source: '攀爬 / 學識類技能'
		})).toBe('從攀爬 / 學識類技能中選擇 1 項技能。');
		expect(applyUITemplate('從{source}中選擇 {count} 項技能。', plural, 'Choose 2 from any list.', {
			count: 2,
			source: '任意技能類別'
		})).toBe('從任意技能類別中選擇 2 項技能。');
		expect(applyUITemplate('{list}技能', category, 'Crafting skills', { list: '工藝類' })).toBe('工藝類技能');
		expect(applyUITemplate('從{source}中選擇 {count} 項技能。', plural, 'Choose 2 from Home Brew.', { source: 'Home Brew' })).toBe('Choose 2 from Home Brew.');
	});
});
