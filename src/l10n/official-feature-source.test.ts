import { describe, expect, test } from 'vitest';
import { isDefaultLanguageFeature, isOfficialFeatureSource } from '@/l10n/official-feature-source';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { SourcebookType } from '@/enums/sourcebook-type';

describe('official hero-builder UI feature guards', () => {
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
