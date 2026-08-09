// @vitest-environment jsdom

/* eslint-disable sort-imports */

import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import {
	createV1HeroCreationRequiredCanonicalEnglish,
	getV1HeroCreationElements,
	v1HeroCreationSourcebookIDs,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { elementFieldIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { SourcebookData } from '@/data/sourcebook-data';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { describe, expect, it } from 'vitest';

const getTargetSourcebooks = async () => {
	const sourcebooks = await SourcebookData.loadAll();
	return sourcebooks.filter(sourcebook => v1HeroCreationSourcebookIDs.includes(sourcebook.id));
};

describe('V1 Hero creation Element metadata manifest', () => {
	it('uses Core, Orden, Beastheart, and Summoner only', async () => {
		const sourcebooks = await getTargetSourcebooks();

		expect(sourcebooks.map(sourcebook => sourcebook.id).sort()).toEqual([ 'beastheart', 'core', 'orden', 'summoner' ]);
	});

	it('includes direct Hero creation Ancestry, Culture, Career, Class, and Complication Elements', async () => {
		const elements = getV1HeroCreationElements(await getTargetSourcebooks());
		const expected = [
			...SourcebookLogic.getAncestries(await getTargetSourcebooks()),
			...SourcebookLogic.getCultures(await getTargetSourcebooks(), true),
			...SourcebookLogic.getCareers(await getTargetSourcebooks()),
			...SourcebookLogic.getClasses(await getTargetSourcebooks()),
			...SourcebookLogic.getComplications(await getTargetSourcebooks())
		];

		expect(elements.map(element => element.id).sort()).toEqual([ ...new Set(expected.map(element => element.id)) ].sort());
	});

	it('requires every Element name and only non-empty descriptions', async () => {
		const elements = getV1HeroCreationElements(await getTargetSourcebooks());
		const required = createV1HeroCreationRequiredCanonicalEnglish(await getTargetSourcebooks());

		elements.forEach(element => {
			expect(required[elementFieldIdentity(element.id, 'name')]).toBe(element.name);
			if (element.description !== '') {
				expect(required[elementFieldIdentity(element.id, 'description')]).toBe(element.description);
			} else {
				expect(required).not.toHaveProperty(elementFieldIdentity(element.id, 'description'));
			}
		});
	});

	it('keeps a name identity when an Element description is empty', async () => {
		const sourcebooks = await getTargetSourcebooks();
		const element = sourcebooks[0].ancestries[0];
		const sourcebookWithEmptyDescription = {
			...sourcebooks[0],
			ancestries: [ { ...element, description: '' } ],
			careers: [],
			classes: [],
			complications: [],
			cultures: []
		};
		const required = createV1HeroCreationRequiredCanonicalEnglish([ sourcebookWithEmptyDescription ]);

		expect(required[elementFieldIdentity(element.id, 'name')]).toBe(element.name);
		expect(required).not.toHaveProperty(elementFieldIdentity(element.id, 'description'));
	});

	it('takes canonical English snapshots from real sourcebook objects', async () => {
		const elements = getV1HeroCreationElements(await getTargetSourcebooks());
		const required = createV1HeroCreationRequiredCanonicalEnglish(await getTargetSourcebooks());
		const representative = elements.find(element => element.id === 'devil') || elements[0];

		expect(required[elementFieldIdentity(representative.id, 'name')]).toBe(representative.name);
		expect(required[elementFieldIdentity(representative.id, 'description')]).toBe(representative.description);
	});

	it('uses stable Element ID and field identities', async () => {
		const element = getV1HeroCreationElements(await getTargetSourcebooks()).find(candidate => candidate.id === 'devil')
			|| getV1HeroCreationElements(await getTargetSourcebooks())[0];

		expect(elementFieldIdentity(element.id, 'name')).toBe(`element:${element.id}/name`);
		expect(elementFieldIdentity(element.id, 'description')).toBe(`element:${element.id}/description`);
	});

	it('rejects ambiguous duplicate Element identities', async () => {
		const sourcebooks = await getTargetSourcebooks();
		const conflictingSourcebook = {
			...sourcebooks[0],
			ancestries: [ { ...sourcebooks[0].ancestries[0], name: 'Conflicting canonical name' } ],
			careers: [],
			classes: [],
			complications: [],
			cultures: []
		};

		expect(() => createV1HeroCreationRequiredCanonicalEnglish([ sourcebooks[0], conflictingSourcebook ])).toThrow(/duplicate localization identity/i);
	});

	it('integrates required metadata into the production completeness result', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		expect(result.requiredCount).toBeGreaterThan(0);
		expect(result.missing.length).toBeGreaterThan(0);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('hero-creation-nested-authored-content');
		expect(result.complete).toBe(false);
	});

	it('does not add GM Element types to the required identities', async () => {
		const sourcebooks = await getTargetSourcebooks();
		const required = createV1HeroCreationRequiredCanonicalEnglish(sourcebooks);
		const gmElements = sourcebooks
			.flatMap(SourcebookLogic.getElements)
			.filter(entry => [ 'adventure', 'encounter', 'monster-group', 'tactical-map', 'terrain' ].includes(entry.type))
			.map(entry => entry.element);

		gmElements.forEach(element => {
			expect(required).not.toHaveProperty(elementFieldIdentity(element.id, 'name'));
			expect(required).not.toHaveProperty(elementFieldIdentity(element.id, 'description'));
		});
	});
});
