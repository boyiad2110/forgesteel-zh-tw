import { describe, expect, test } from 'vitest';
import { getChoiceDisplaySource, isDefaultLanguageFeature, isOfficialFeatureSource } from '@/l10n/official-feature-source';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { SourcebookType } from '@/enums/sourcebook-type';

describe('official hero-builder UI feature guards', () => {
	test('accepts a rebuilt official narrative choice but rejects altered display fields and forged provenance', () => {
		const sourcebook = FactoryLogic.createSourcebook();
		sourcebook.type = SourcebookType.Official;
		const source = FactoryLogic.feature.createSkillChoice({ id: 'official-narrative', name: 'Training', description: 'Narrative.', options: [ 'Climb' ] });
		sourcebook.careers = [ { ...FactoryLogic.createCareer(), features: [ source ] } ];
		const books = [ sourcebook ];
		const display = FactoryLogic.feature.createSkillChoice({ id: source.id, name: 'Skill', options: [ 'Climb' ], selected: [ 'Climb' ] });
		expect(getChoiceDisplaySource(display, books, source)).toBe(source);
		const changes = [
			{ id: 'unknown' },
			{ name: 'Renamed' },
			{ description: 'Custom prompt.' },
			{ data: { ...display.data, count: 2 } },
			{ data: { ...display.data, options: [ 'Lead' ] } },
			{ data: { ...display.data, listOptions: [ 'Lore' ] } },
			{ data: { ...display.data, selectAt: 'other' } }
		];
		for (const change of changes) {
			expect(getChoiceDisplaySource({ ...display, ...change } as typeof display, books, source)).toBeUndefined();
		}
		expect(getChoiceDisplaySource(display, books, { ...source, description: 'Forged source.' })).toBeUndefined();
		expect(getChoiceDisplaySource(FactoryLogic.feature.createSkillChoice({ id: 'unknown-any-list' }), books)).toBeUndefined();
		const changedSource = { ...source, description: 'Changed narrative.' };
		expect(getChoiceDisplaySource(display, books, changedSource)).toBeUndefined();
	});

	test('checks direct and rebuilt languages against their complete source and projection', () => {
		const book = FactoryLogic.createSourcebook();
		book.type = SourcebookType.Official;
		const source = FactoryLogic.feature.createLanguageChoice({ id: 'official-language', count: 2 });
		book.careers = [ { ...FactoryLogic.createCareer(), features: [ source ] } ];
		const books = [ book ];
		const display = structuredClone(source);
		display.data.selected = [ 'Caelian' ];
		expect(getChoiceDisplaySource(display, books)).toBe(display);
		expect(getChoiceDisplaySource(display, books, source)).toBe(source);
		display.data.allowedTypes.reverse();
		expect(getChoiceDisplaySource(display, books, source)).toBeUndefined();
		expect(getChoiceDisplaySource(display, books)).toBeUndefined();
		const defaultLanguage = FactoryLogic.createHero().features[0];
		expect(getChoiceDisplaySource(defaultLanguage, books)).toBe(defaultLanguage);
	});

	test('matches the unmodified official source while allowing its saved selections', () => {
		const sourcebook = FactoryLogic.createSourcebook();
		sourcebook.type = SourcebookType.Official;
		const sourceFeature = FactoryLogic.feature.createSkillChoice({ id: 'official-skill-choice', options: [ 'Climb' ], count: 1 });
		sourcebook.careers = [ { ...FactoryLogic.createCareer(), features: [ sourceFeature ] } ];

		const savedFeature = structuredClone(sourceFeature);
		savedFeature.data.selected.push('Climb');
		expect(isOfficialFeatureSource(savedFeature, [ sourcebook ])).toBe(true);

		savedFeature.description += ' Custom text.';
		expect(isOfficialFeatureSource(savedFeature, [ sourcebook ])).toBe(false);
	});

	test('does not trust an identical feature from a Homebrew sourcebook', () => {
		const sourcebook = FactoryLogic.createSourcebook();
		sourcebook.type = SourcebookType.Homebrew;
		const feature = FactoryLogic.feature.createLanguageChoice({ id: 'homebrew-language' });
		sourcebook.careers = [ { ...FactoryLogic.createCareer(), features: [ feature ] } ];

		expect(isOfficialFeatureSource(feature, [ sourcebook ])).toBe(false);
	});

	test('recognizes only the builder-owned default language shape', () => {
		const feature = FactoryLogic.createHero().features[0];
		expect(feature.type).toBe(FeatureType.LanguageChoice);
		expect(isDefaultLanguageFeature(feature)).toBe(true);

		const altered = structuredClone(feature);
		if (altered.type === FeatureType.LanguageChoice) {
			altered.data.allowedTypes = [];
		}
		expect(isDefaultLanguageFeature(altered)).toBe(false);
	});
});
