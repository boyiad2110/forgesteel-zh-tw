import { describe, expect, it } from 'vitest';
import { LanguageType } from '@/enums/language-type';
import { SkillList } from '@/enums/skill-list';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';
import { UpdateLogic } from '@/logic/update/update-logic';

// An incomplete homebrew sourcebook file, as it arrives from JSON.parse() on import:
// a plain object that simply has no key for the collections it never used.
const parseImportedFile = (json: Record<string, unknown>): Sourcebook => {
	return JSON.parse(JSON.stringify(json)) as Sourcebook;
};

const incompleteFile = (extra: Record<string, unknown> = {}): Record<string, unknown> => ({
	id: 'imported-homebrew',
	name: 'My Homebrew',
	description: 'A sourcebook saved before these collections existed.',
	type: SourcebookType.Homebrew,
	items: [
		{
			id: 'item-1',
			name: 'Lucky Coin',
			description: 'It is lucky.',
			features: [],
			type: 'Trinket',
			keywords: [],
			crafting: null,
			effect: '',
			featuresByLevel: [ { level: 1, features: [] } ],
			imbuements: []
		}
	],
	...extra
});

describe('UpdateLogic.updateSourcebook incomplete file compatibility', () => {
	it('normalizes a sourcebook file that has no languages', () => {
		const sourcebook = parseImportedFile(incompleteFile({
			skills: [ { name: 'Brew', description: 'Brewing.', list: SkillList.Crafting } ]
		}));

		expect(() => UpdateLogic.updateSourcebook(sourcebook)).not.toThrow();

		expect(sourcebook.languages).toEqual([]);
		expect(sourcebook.skills).toEqual([ { name: 'Brew', description: 'Brewing.', list: SkillList.Crafting } ]);
	});

	it('normalizes a sourcebook file that has no skills', () => {
		const sourcebook = parseImportedFile(incompleteFile({
			languages: [ { name: 'Old Tongue', description: 'Spoken rarely.', type: LanguageType.Dead, related: [] } ]
		}));

		expect(() => UpdateLogic.updateSourcebook(sourcebook)).not.toThrow();

		expect(sourcebook.skills).toEqual([]);
		expect(sourcebook.languages).toEqual([ { name: 'Old Tongue', description: 'Spoken rarely.', type: LanguageType.Dead, related: [] } ]);
	});

	it('normalizes a sourcebook file that has neither languages nor skills', () => {
		const sourcebook = parseImportedFile(incompleteFile());

		expect(() => UpdateLogic.updateSourcebook(sourcebook)).not.toThrow();

		expect(sourcebook.languages).toEqual([]);
		expect(sourcebook.skills).toEqual([]);
	});

	it('leaves populated languages and skills untouched', () => {
		const sourcebook = parseImportedFile(incompleteFile({
			languages: [
				{ name: 'Caelian', description: 'The old imperial tongue.', type: LanguageType.Dead, related: [] },
				{ name: 'Hyrallic', description: 'Spoken by the high elves.', type: LanguageType.Cultural, related: [ 'Caelian' ] }
			],
			skills: [
				{ name: 'Brew', description: 'Brewing.', list: SkillList.Crafting },
				{ name: 'Haggle', description: 'Bargaining.', list: SkillList.Interpersonal }
			]
		}));

		UpdateLogic.updateSourcebook(sourcebook);

		expect(sourcebook.languages).toEqual([
			{ name: 'Caelian', description: 'The old imperial tongue.', type: LanguageType.Dead, related: [] },
			{ name: 'Hyrallic', description: 'Spoken by the high elves.', type: LanguageType.Cultural, related: [ 'Caelian' ] }
		]);
		expect(sourcebook.skills).toEqual([
			{ name: 'Brew', description: 'Brewing.', list: SkillList.Crafting },
			{ name: 'Haggle', description: 'Bargaining.', list: SkillList.Interpersonal }
		]);
	});

	it('keeps the rest of the file intact while filling in the missing collections', () => {
		const sourcebook = parseImportedFile(incompleteFile());

		UpdateLogic.updateSourcebook(sourcebook);

		expect(sourcebook.id).toBe('imported-homebrew');
		expect(sourcebook.name).toBe('My Homebrew');
		expect(sourcebook.description).toBe('A sourcebook saved before these collections existed.');
		expect(sourcebook.type).toBe(SourcebookType.Homebrew);
		expect(sourcebook.items.map(i => i.id)).toEqual([ 'item-1' ]);
		expect(sourcebook.items[0].name).toBe('Lucky Coin');
	});

	it('still normalizes a complete sourcebook file without changing its collections', () => {
		const complete = parseImportedFile(incompleteFile({
			languages: [ { name: 'Caelian', description: 'The old imperial tongue.', type: LanguageType.Dead, related: [] } ],
			skills: [ { name: 'Brew', description: 'Brewing.', list: SkillList.Crafting } ]
		}));
		const before = JSON.parse(JSON.stringify(complete)) as Sourcebook;

		UpdateLogic.updateSourcebook(complete);

		expect(complete.languages).toEqual(before.languages);
		expect(complete.skills).toEqual(before.skills);
		expect(complete.id).toBe(before.id);
		expect(complete.type).toBe(before.type);
	});
});
