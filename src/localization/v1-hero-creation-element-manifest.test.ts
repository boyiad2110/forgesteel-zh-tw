/* eslint-disable sort-imports */

import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import {
	createV1HeroCreationRequiredCanonicalEnglish,
	getV1HeroCreationElements,
	v1HeroCreationSourcebooks,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { elementFieldIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { beastheartSourcebook } from '@/data/sourcebooks/official/beastheart';
import { core } from '@/data/sourcebooks/official/core';
import { orden } from '@/data/sourcebooks/official/orden';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { describe, expect, it } from 'vitest';

const getTargetSourcebooks = () => v1HeroCreationSourcebooks;

describe('V1 Hero creation Element metadata manifest', () => {
	it('uses the four explicit canonical sourcebook objects', () => {
		expect(v1HeroCreationSourcebooks).toEqual([ core, orden, beastheartSourcebook, summonerSourcebook ]);
	});

	it('uses Core, Orden, Beastheart, and Summoner only', () => {
		const sourcebooks = getTargetSourcebooks();

		expect(sourcebooks.map(sourcebook => sourcebook.id).sort()).toEqual([ 'beastheart', 'core', 'orden', 'summoner' ]);
	});

	it('includes direct Hero creation Ancestry, Culture, Career, Class, and Complication Elements', () => {
		const elements = getV1HeroCreationElements(getTargetSourcebooks());
		const expected = [
			...SourcebookLogic.getAncestries(getTargetSourcebooks()),
			...SourcebookLogic.getCultures(getTargetSourcebooks(), true),
			...SourcebookLogic.getCareers(getTargetSourcebooks()),
			...SourcebookLogic.getClasses(getTargetSourcebooks()),
			...SourcebookLogic.getComplications(getTargetSourcebooks())
		];

		expect(elements.map(element => element.id).sort()).toEqual([ ...new Set(expected.map(element => element.id)) ].sort());
	});

	it('requires every Element name and only non-empty descriptions', () => {
		const elements = getV1HeroCreationElements(getTargetSourcebooks());
		const required = createV1HeroCreationRequiredCanonicalEnglish(getTargetSourcebooks());

		elements.forEach(element => {
			expect(required[elementFieldIdentity(element.id, 'name')]).toBe(element.name);
			if (element.description !== '') {
				expect(required[elementFieldIdentity(element.id, 'description')]).toBe(element.description);
			} else {
				expect(required).not.toHaveProperty(elementFieldIdentity(element.id, 'description'));
			}
		});
	});

	it('keeps a name identity when an Element description is empty', () => {
		const sourcebooks = getTargetSourcebooks();
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

	it('takes canonical English snapshots from real sourcebook objects', () => {
		const elements = getV1HeroCreationElements(getTargetSourcebooks());
		const required = createV1HeroCreationRequiredCanonicalEnglish(getTargetSourcebooks());
		const representative = elements.find(element => element.id === 'devil') || elements[0];

		expect(required[elementFieldIdentity(representative.id, 'name')]).toBe(representative.name);
		expect(required[elementFieldIdentity(representative.id, 'description')]).toBe(representative.description);
	});

	it('uses stable Element ID and field identities', () => {
		const element = getV1HeroCreationElements(getTargetSourcebooks()).find(candidate => candidate.id === 'devil')
			|| getV1HeroCreationElements(getTargetSourcebooks())[0];

		expect(elementFieldIdentity(element.id, 'name')).toBe(`element:${element.id}/name`);
		expect(elementFieldIdentity(element.id, 'description')).toBe(`element:${element.id}/description`);
	});

	it('rejects ambiguous duplicate Element identities', () => {
		const sourcebooks = getTargetSourcebooks();
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
		const heroCreationElementIdentities = getV1HeroCreationElements(getTargetSourcebooks())
			.flatMap(element => [ elementFieldIdentity(element.id, 'name'), elementFieldIdentity(element.id, 'description') ]);

		expect(result.requiredCount).toBeGreaterThan(0);
		// This denominator (direct Hero creation Ancestry/Culture/Career/Class/Complication
		// Elements) is fully satisfied. A separate, later Culture Aspect denominator can leave
		// its own identities missing without this test failing for an unrelated reason.
		heroCreationElementIdentities.forEach(identity => expect(result.missing).not.toContain(identity));
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('hero-creation-nested-authored-content');
		expect(result.complete).toBe(false);
	});

	it('does not add GM Element types to the required identities', () => {
		const sourcebooks = getTargetSourcebooks();
		const required = createV1HeroCreationRequiredCanonicalEnglish(sourcebooks);
		const gmElements = sourcebooks
			.flatMap(sourcebook => [
				...sourcebook.adventures,
				...sourcebook.encounters,
				...sourcebook.monsterGroups,
				...sourcebook.tacticalMaps,
				...sourcebook.terrain
			]);

		gmElements.forEach(element => {
			expect(required).not.toHaveProperty(elementFieldIdentity(element.id, 'name'));
			expect(required).not.toHaveProperty(elementFieldIdentity(element.id, 'description'));
		});
	});
});
