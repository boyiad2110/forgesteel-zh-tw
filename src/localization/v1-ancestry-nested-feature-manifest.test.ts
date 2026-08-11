/* eslint-disable sort-imports */

import {
	createV1AncestryNestedFeatureRequiredCanonicalEnglish,
	getV1AncestryNestedFeatureElements,
	v1HeroCreationSourcebooks,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { elementFieldIdentity } from '@/localization/catalog';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { FeatureType } from '@/enums/feature-type';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { describe, expect, it } from 'vitest';

const getTargetSourcebooks = () => v1HeroCreationSourcebooks;

describe('V1 Ancestry nested Feature manifest', () => {
	it('enumerates exactly 108 non-Ability Feature nodes across the 12 V1 Ancestries', () => {
		const elements = getV1AncestryNestedFeatureElements(getTargetSourcebooks());

		expect(elements).toHaveLength(108);
		expect(new Set(elements.map(element => element.id)).size).toBe(108);
	});

	it('draws from exactly the 12 V1 Ancestries', () => {
		const ancestries = SourcebookLogic.getAncestries(getTargetSourcebooks());

		expect(ancestries).toHaveLength(12);
		expect(ancestries.map(a => a.id).sort()).toEqual([
			'ancestry-devil',
			'ancestry-dragon-knight',
			'ancestry-dwarf',
			'ancestry-hakaan',
			'ancestry-high-elf',
			'ancestry-human',
			'ancestry-memonek',
			'ancestry-orc',
			'ancestry-polder',
			'ancestry-revenant',
			'ancestry-time-raider',
			'ancestry-wode-elf'
		].sort());
	});

	it('never collects a FeatureType.Ability node', () => {
		const elements = getV1AncestryNestedFeatureElements(getTargetSourcebooks());

		elements.forEach(element => {
			expect(element.type).not.toBe(FeatureType.Ability);
		});
	});

	it('excludes exactly the 19 known Ability nodes from the denominator', () => {
		const elements = getV1AncestryNestedFeatureElements(getTargetSourcebooks());
		const collectedIDs = new Set(elements.map(element => element.id));

		const excludedAbilityIDs = [
			'devil-feature-2-3',
			'dragon-knight-feature-2-1',
			'dragon-knight-feature-2-8',
			'dragon-knight-feature-2-9',
			'dragon-knight-feature-2-10',
			'high-elf-feature-2-0',
			'wode-elf-feature-2-5',
			'human-feature-1',
			'human-feature-2-3',
			'human-feature-2-4',
			'polder-feature-1',
			'polder-feature-3-4',
			'revenant-feature-4-5-2',
			'memonek-feature-3-5',
			'time-raider-feature-2-1',
			'time-raider-feature-2-2b',
			'time-raider-feature-2-5-1',
			'time-raider-feature-2-5-2',
			'time-raider-feature-2-5-3'
		];

		expect(excludedAbilityIDs).toHaveLength(19);
		excludedAbilityIDs.forEach(id => {
			expect(collectedIDs.has(id)).toBe(false);
		});
	});

	it('includes a Choice node itself alongside its option Features, stopping only at Ability', () => {
		const elements = getV1AncestryNestedFeatureElements(getTargetSourcebooks());
		const ids = elements.map(element => element.id);

		// devil-feature-2 is a Choice; its non-Ability options are collected, its Ability
		// option (devil-feature-2-3) is not.
		expect(ids).toContain('devil-feature-2');
		expect(ids).toContain('devil-feature-2-1');
		expect(ids).toContain('devil-feature-2-2');
		expect(ids).toContain('devil-feature-2-4');
		expect(ids).toContain('devil-feature-2-5');
		expect(ids).toContain('devil-feature-2-6');
		expect(ids).not.toContain('devil-feature-2-3');
	});

	it('includes a Multiple node itself alongside its child Features, walking a nested Multiple inside a Choice option', () => {
		const elements = getV1AncestryNestedFeatureElements(getTargetSourcebooks());
		const ids = elements.map(element => element.id);

		// devil-feature-1 is a top-level Multiple; devil-feature-2-7 is a Multiple nested
		// inside the devil-feature-2 Choice's options.
		expect(ids).toContain('devil-feature-1');
		expect(ids).toContain('devil-feature-1a');
		expect(ids).toContain('devil-feature-1b');
		expect(ids).toContain('devil-feature-2-7');
		expect(ids).toContain('devil-feature-2-7a');
		expect(ids).toContain('devil-feature-2-7b');
	});

	it('requires every collected node\'s name and only non-empty descriptions, using live runtime text', () => {
		const elements = getV1AncestryNestedFeatureElements(getTargetSourcebooks());
		const required = createV1AncestryNestedFeatureRequiredCanonicalEnglish(getTargetSourcebooks());

		let nameCount = 0;
		let descriptionCount = 0;
		elements.forEach(element => {
			expect(required[elementFieldIdentity(element.id, 'name')]).toBe(element.name);
			nameCount += 1;
			if (element.description !== '') {
				expect(required[elementFieldIdentity(element.id, 'description')]).toBe(element.description);
				descriptionCount += 1;
			} else {
				expect(required).not.toHaveProperty(elementFieldIdentity(element.id, 'description'));
			}
		});

		expect(nameCount).toBe(108);
		expect(descriptionCount).toBe(73);
		expect(Object.keys(required)).toHaveLength(181);
	});

	it('is merged into the production V1 manifest without displacing the pre-existing denominator', () => {
		const required = v1LocalizationManifest.requiredCanonicalEnglish;

		expect(required[elementFieldIdentity('devil-feature-2', 'name')]).toBe('Devil Traits');
		// A representative pre-existing top-level Element identity is still present.
		expect(required['element:ancestry-devil/name']).toBe('Devil');
		expect(required['element:env-nomadic/name']).toBe('Nomadic');
	});

	it('keeps hero-creation-nested-authored-content and official-ability-authored-content unresolved, and unresolvedDomains at 6', () => {
		expect(v1LocalizationManifest.unresolvedDomains).toHaveLength(6);
		expect(v1LocalizationManifest.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'hero-creation-nested-authored-content',
			'official-ability-authored-content'
		]));
	});

	it('has approved catalog entries for all 181 Ancestry nested Feature name and description identities', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});
		const elements = getV1AncestryNestedFeatureElements(getTargetSourcebooks());
		const identities = elements.flatMap(element => {
			const ids = [ elementFieldIdentity(element.id, 'name') ];
			if (element.description !== '') {
				ids.push(elementFieldIdentity(element.id, 'description'));
			}
			return ids;
		});

		expect(identities).toHaveLength(181);
		identities.forEach(identity => {
			expect(result.missing).not.toContain(identity);
			expect(result.unapproved).not.toContain(identity);
		});
		expect(result.catalogIssues).toEqual([]);
	});

	it('raises the known V1 required identity count from 362 to 543', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		expect(result.requiredCount).toBe(543);
	});
});
