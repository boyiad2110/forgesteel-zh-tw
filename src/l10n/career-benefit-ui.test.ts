import { describe, expect, test } from 'vitest';
import { FeatureType } from '@/enums/feature-type';
import { SourcebookType } from '@/enums/sourcebook-type';
import { core } from '@/data/sourcebooks/official/core';
import { careerBenefitFieldKey } from '@/l10n/career-benefit-ui';

describe('Career benefit field translations', () => {
	const artisan = core.careers.find(career => career.id === 'career-artisan')!;
	const benefit = artisan.features.find(feature => feature.type === FeatureType.Bonus)!;

	test('maps an unchanged official Career benefit to its approved glossary term', () => {
		expect(careerBenefitFieldKey(benefit, [ core ])).toBe('enum:FeatureField:ProjectPoints');
	});

	test('leaves edited and non-official benefits unchanged', () => {
		expect(careerBenefitFieldKey({ ...benefit, name: 'Custom benefit' }, [ core ])).toBeUndefined();
		expect(careerBenefitFieldKey(benefit, [ { ...core, type: SourcebookType.Homebrew } ])).toBeUndefined();
	});
});
