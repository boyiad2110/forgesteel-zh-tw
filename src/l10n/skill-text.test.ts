import { describe, expect, test } from 'vitest';
import { Catalog } from '@/l10n/catalog';
import { SkillList } from '@/enums/skill-list';
import { resolveSkillDescription } from '@/l10n/skill-text';
import strings from '@/l10n/generated/zh-TW/strings.json';

const catalog = strings as unknown as Catalog;
const expectedUse = catalog['heroes.skills.lore.rules'].zh.split('\n')
	.find(line => line.includes('（Magic）｜'))
	?.split('｜')[1];
const expectedLeadUse = catalog['heroes.skills.interpersonal.rules'].zh.split('\n')
	.find(line => line.includes('（Lead）｜'))
	?.split('｜')[1];

describe('skill descriptions', () => {
	test('reuses the approved skill-group table description for an exact official skill', () => {
		expect(resolveSkillDescription({
			name: 'Magic',
			description: 'Knowing about magical places, spells, rituals, items, and phenomena.',
			list: SkillList.Lore
		}, catalog)).toBe(`${expectedUse}。`);
	});

	test('matches the skill category and restores sentence punctuation', () => {
		expect(resolveSkillDescription({
			name: 'Lead',
			description: 'Inspire people to action.',
			list: SkillList.Interpersonal
		}, catalog)).toBe(`${expectedLeadUse}。`);
	});

	test('keeps changed and custom skill descriptions in their original language', () => {
		expect(resolveSkillDescription({
			name: 'Magic',
			description: 'A changed description.',
			list: SkillList.Lore
		}, catalog)).toBe('A changed description.');
		expect(resolveSkillDescription({
			name: 'Homebrew Magic',
			description: 'A custom skill description.',
			list: SkillList.Custom
		}, catalog)).toBe('A custom skill description.');
	});
});
