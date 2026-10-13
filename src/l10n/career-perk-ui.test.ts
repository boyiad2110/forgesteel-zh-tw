import { describe, expect, test } from 'vitest';
import { FeatureType } from '@/enums/feature-type';
import { SourcebookType } from '@/enums/sourcebook-type';
import { core } from '@/data/sourcebooks/official/core';
import { careerPerkNameText, isSingleCareerPerk } from '@/l10n/career-perk-ui';

describe('career perk UI translations', () => {
	const artisan = core.careers.find(career => career.id === 'career-artisan')!;
	const perk = artisan.features.find(feature => feature.type === FeatureType.Perk)!;
	const ui = { text: (id: string) => id } as unknown as ReturnType<typeof import('@/l10n/ui-text').useUI>;

	test('translates only the unchanged official career perk and its single-choice fallback', () => {
		expect(careerPerkNameText(perk, [ core ], ui)).toBe('ui.hero-builder.crafting-perk.cc40cc14');
		expect(isSingleCareerPerk(perk, [ core ])).toBe(true);
	});

	test('leaves edited, expanded, and non-official perk features unchanged', () => {
		expect(careerPerkNameText({ ...perk, name: 'Custom Perk' }, [ core ], ui)).toBeUndefined();
		expect(isSingleCareerPerk({ ...perk, data: { ...perk.data, count: 2 } }, [ core ])).toBe(false);
		expect(careerPerkNameText(perk, [ { ...core, type: SourcebookType.Homebrew } ], ui)).toBeUndefined();
	});
});
