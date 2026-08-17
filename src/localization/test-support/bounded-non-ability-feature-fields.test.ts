import { Feature, FeatureAbility, FeatureChoice, FeatureHeroicResource, FeatureMultiple, FeatureText } from '@/models/feature';
import { describe, expect, it } from 'vitest';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';

const makeText = (id: string, name: string, description = ''): FeatureText => ({ id, name, description, type: FeatureType.Text, data: null });

const makeAbility = (id: string, name: string, description = ''): FeatureAbility => ({
	id,
	name,
	description,
	type: FeatureType.Ability,
	data: {
		ability: FactoryLogic.createAbility({
			id: `${id}-ability`,
			name: `${name} Authored Name`,
			description: `${name} Authored Description`,
			sections: [ FactoryLogic.createAbilitySectionText(`${name} Authored Section`) ]
		})
	}
});

const makeChoice = (id: string, name: string, options: Feature[], description = ''): FeatureChoice => ({
	id,
	name,
	description,
	type: FeatureType.Choice,
	data: {
		options: options.map(feature => ({ feature, value: 1 })),
		count: 1,
		selectAt: 'build',
		selected: []
	}
});

const makeMultiple = (id: string, name: string, features: Feature[], description = ''): FeatureMultiple => ({
	id,
	name,
	description,
	type: FeatureType.Multiple,
	data: { features }
});

const makeHeroicResource = (id: string, name: string, gains: { tag: string, trigger: string, value: string }[]): FeatureHeroicResource => ({
	id,
	name,
	description: '',
	type: FeatureType.HeroicResource,
	data: { type: 'heroic', gains, details: '', canBeNegative: false, value: 0 }
});

describe('extractLiveBoundedNonAbilityFeatureFields', () => {
	it('records a non-Ability node name, and its description only when non-empty', () => {
		const fields = extractLiveBoundedNonAbilityFeatureFields([
			makeText('described', 'Described', 'Its description.'),
			makeText('bare', 'Bare')
		]);

		expect(fields).toEqual({
			'element:described/name': 'Described',
			'element:described/description': 'Its description.',
			'element:bare/name': 'Bare'
		});
	});

	it('contributes nothing for an Ability root and never reaches its authored content', () => {
		const fields = extractLiveBoundedNonAbilityFeatureFields([ makeAbility('root-ability', 'Root Ability', 'Root Ability Feature description') ]);

		expect(fields).toEqual({});
		expect(JSON.stringify(fields)).not.toContain('Authored');
	});

	it('stops at a nested Ability inside a Choice option or a Multiple child', () => {
		const fields = extractLiveBoundedNonAbilityFeatureFields([
			makeChoice('choice', 'Choice', [ makeAbility('choice-ability', 'Choice Ability'), makeText('choice-option', 'Choice Option') ]),
			makeMultiple('multiple', 'Multiple', [ makeAbility('multiple-ability', 'Multiple Ability'), makeText('multiple-child', 'Multiple Child') ])
		]);

		expect(Object.keys(fields)).toEqual([
			'element:choice/name',
			'element:choice-option/name',
			'element:multiple/name',
			'element:multiple-child/name'
		]);
		expect(JSON.stringify(fields)).not.toContain('Authored');
	});

	it('descends a Choice only through its option Features', () => {
		const choice = makeChoice('choice', 'Choice', [ makeText('option', 'Option', 'Option description.') ]);
		choice.data.selected = [ makeText('selected-only', 'Selected Only') ];

		const fields = extractLiveBoundedNonAbilityFeatureFields([ choice ]);

		expect(fields).toEqual({
			'element:choice/name': 'Choice',
			'element:option/name': 'Option',
			'element:option/description': 'Option description.'
		});
		expect(Object.keys(fields)).not.toContain('element:selected-only/name');
	});

	it('descends a Multiple only through its child Features', () => {
		const fields = extractLiveBoundedNonAbilityFeatureFields([
			makeMultiple('multiple', 'Multiple', [ makeText('child-a', 'Child A'), makeText('child-b', 'Child B') ])
		]);

		expect(fields).toEqual({
			'element:multiple/name': 'Multiple',
			'element:child-a/name': 'Child A',
			'element:child-b/name': 'Child B'
		});
	});

	it('does not walk any other Feature type own data', () => {
		const resource = makeHeroicResource('resource', 'Resource', []);
		resource.data.details = 'Resource details prose';

		const fields = extractLiveBoundedNonAbilityFeatureFields([ resource ]);

		expect(fields).toEqual({ 'element:resource/name': 'Resource' });
	});

	it('records HeroicResource gain triggers on their original index and skips empty triggers', () => {
		const fields = extractLiveBoundedNonAbilityFeatureFields([
			makeHeroicResource('resource', 'Resource', [
				{ tag: 'start', trigger: 'Start of your turn', value: '1d3' },
				{ tag: 'silent', trigger: '', value: '1' },
				{ tag: 'winded', trigger: 'The first time you become winded', value: '2' }
			])
		]);

		expect(fields).toEqual({
			'element:resource/name': 'Resource',
			'element:resource/gains.0.trigger': 'Start of your turn',
			'element:resource/gains.2.trigger': 'The first time you become winded'
		});
		expect(Object.keys(fields)).not.toContain('element:resource/gains.1.trigger');
	});

	it('records a gain trigger exactly as authored, without trimming or normalizing', () => {
		const authored = '\n  Start of your turn,\nafter you’ve  moved ';
		const fields = extractLiveBoundedNonAbilityFeatureFields([
			makeHeroicResource('resource', 'Resource', [ { tag: 'start', trigger: authored, value: '1' } ])
		]);

		expect(fields['element:resource/gains.0.trigger']).toBe(authored);
	});

	it('records a name and description exactly as authored, without trimming or normalizing', () => {
		const description = '\nYou can wield\na light weapon.  ';
		const fields = extractLiveBoundedNonAbilityFeatureFields([ makeText('node', ' Spaced Name ', description) ]);

		expect(fields['element:node/name']).toBe(' Spaced Name ');
		expect(fields['element:node/description']).toBe(description);
	});

	it('throws on a re-used identity rather than silently overwriting it', () => {
		expect(() => extractLiveBoundedNonAbilityFeatureFields([
			makeText('shared', 'First'),
			makeText('shared', 'Second')
		])).toThrow('duplicate localization identity \'element:shared/name\'');
	});

	it('walks depth-first preorder, finishing each subtree before the next sibling', () => {
		const fields = extractLiveBoundedNonAbilityFeatureFields([
			makeChoice('first', 'First', [
				makeMultiple('first-a', 'First A', [ makeText('first-a-1', 'First A1') ]),
				makeText('first-b', 'First B')
			]),
			makeText('second', 'Second')
		]);

		expect(Object.keys(fields)).toEqual([
			'element:first/name',
			'element:first-a/name',
			'element:first-a-1/name',
			'element:first-b/name',
			'element:second/name'
		]);
	});
});
