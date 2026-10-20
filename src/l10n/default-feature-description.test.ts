import { Feature, isFeature } from '@/models/feature';
import { defaultFeatureDescriptionText, isOfficialDefaultDescriptionSource } from '@/l10n/default-feature-description';
import { describe, expect, test } from 'vitest';
import { core } from '@/data/sourcebooks/official/core';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { FeatureLogic } from '@/logic/feature-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { SourcebookType } from '@/enums/sourcebook-type';
import { useUI } from '@/l10n/ui-text';
import uiRows from '@/l10n/generated/zh-TW/ui.json';

const books = [ core, summonerSourcebook ];
const cases = [
	[ 'revenant-feature-4-1', 'ui.hero-builder.default-ancestry-feature-choice.9f684d5a' ],
	[ 'career-artisan-feature-4', 'ui.hero-builder.this-feature-allows-you-to-choos.f843efd3' ],
	[ 'censor-2-1', 'ui.hero-builder.this-feature-allows-you-to-choos.f843efd3' ],
	[ 'censor-1-2', 'ui.hero-builder.default-domain-choice.f9ddbbd3' ],
	[ 'censor-1-5', 'ui.hero-builder.default-kit-choice.24ea1aa2' ],
	[ 'censor-1-8', 'ui.hero-builder.default-class-ability-choice.40b32187' ],
	[ 'summoner-1-1-4', 'ui.hero-builder.default-summon-choice.10f57c03' ],
	[ 'comp-artifactBonded-ba', 'ui.hero-builder.default-item-choice.7348d5a4' ],
	[ 'comp-meddlingButler-b', 'ui.hero-builder.default-retainer.fbf28dbf' ],
	[ 'comp-shatteredLegacy-b', 'ui.hero-builder.default-toggle.c42fc5cd' ]
] as const;

const findOfficialFeature = (id: string): Feature => {
	const seen = new WeakSet<object>();
	let found: Feature | undefined;
	const visit = (value: unknown) => {
		if (!value || typeof value !== 'object' || seen.has(value) || found) {
			return;
		}
		seen.add(value);
		if (isFeature(value) && value.id === id) {
			found = value;
			return;
		}
		Object.values(value).forEach(visit);
	};
	books.forEach(book => [ ...book.ancestries, ...book.careers, ...book.classes, ...book.complications ].forEach(visit));
	if (!found) {
		throw new Error(`Missing official feature ${id}`);
	}
	return found;
};

const approvedUI = {
	text: (id: keyof typeof uiRows, english: string) => uiRows[id]?.en === english ? uiRows[id].zh : english
} as ReturnType<typeof useUI>;

describe('approved official default feature descriptions', () => {
	for (const [ id, key ] of cases) {
		test(`${id} uses its approved text and retains English without official provenance`, () => {
			const source = findOfficialFeature(id);
			const english = FeatureLogic.getFeatureTypeDescription(source.type);
			expect(source.description).toBe('');
			expect(isOfficialDefaultDescriptionSource(source, books)).toBe(true);
			expect(uiRows[key].en).toBe(english);
			expect(defaultFeatureDescriptionText(source, books, english, approvedUI)).toBe(uiRows[key].zh);

			const renamed = { ...source, name: 'My feature' };
			const unknown = { ...source, id: 'my-feature' };
			const edited = { ...source, description: 'My custom rule.' };
			const altered = { ...source, data: { ...source.data, count: 999 } } as Feature;
			for (const candidate of [ renamed, unknown, edited, altered ]) {
				expect(isOfficialDefaultDescriptionSource(candidate, books)).toBe(false);
				expect(defaultFeatureDescriptionText(candidate, books, english, approvedUI)).toBe(english);
			}
			const homebrew = FactoryLogic.createSourcebook();
			homebrew.type = SourcebookType.Homebrew;
			homebrew.careers = [ { ...FactoryLogic.createCareer(), features: [ source ] } ];
			expect(isOfficialDefaultDescriptionSource(source, [ homebrew ])).toBe(false);
		});
	}

	test('allows saved selection state while retaining source checks', () => {
		const source = findOfficialFeature('career-artisan-feature-4');
		const selected = structuredClone(source);
		if (selected.type === FeatureType.Perk) {
			selected.data.selected = [ core.perks[0] ];
		}
		expect(isOfficialDefaultDescriptionSource(selected, books)).toBe(true);
	});
});
