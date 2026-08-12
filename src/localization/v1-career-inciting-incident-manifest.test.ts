/* eslint-disable sort-imports */

import {
	createV1CareerIncitingIncidentRequiredCanonicalEnglish,
	getV1CareerIncitingIncidentElements,
	v1HeroCreationSourcebooks,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { elementFieldIdentity } from '@/localization/catalog';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { describe, expect, it } from 'vitest';

const getTargetSourcebooks = () => v1HeroCreationSourcebooks;

describe('V1 Career Inciting Incident manifest', () => {
	it('draws from exactly 18 V1 Careers', () => {
		const careers = SourcebookLogic.getCareers(getTargetSourcebooks());

		expect(careers).toHaveLength(18);
		expect(careers.map(c => c.id).sort()).toEqual([
			'career-agent',
			'career-aristocrat',
			'career-artisan',
			'career-beggar',
			'career-criminal',
			'career-disciple',
			'career-explorer',
			'career-farmer',
			'career-gladiator',
			'career-laborer',
			'career-mages-apprentice',
			'career-performer',
			'career-politician',
			'career-sage',
			'career-sailor',
			'career-soldier',
			'career-warden',
			'career-watch-officer'
		].sort());
	});

	it('enumerates exactly 108 Inciting Incident Elements (6 per Career), each with a unique ID', () => {
		const elements = getV1CareerIncitingIncidentElements(getTargetSourcebooks());

		expect(elements).toHaveLength(108);
		expect(new Set(elements.map(element => element.id)).size).toBe(108);

		const careers = SourcebookLogic.getCareers(getTargetSourcebooks());
		careers.forEach(career => {
			expect(career.incitingIncidents.options).toHaveLength(6);
		});
	});

	it('walks only Career -> incitingIncidents.options, not Career Features or any other nested content', () => {
		const elements = getV1CareerIncitingIncidentElements(getTargetSourcebooks());
		const careers = SourcebookLogic.getCareers(getTargetSourcebooks());
		const expectedIDs = careers.flatMap(career => career.incitingIncidents.options.map(option => option.id)).sort();

		expect(elements.map(element => element.id).sort()).toEqual(expectedIDs);

		// None of the collected identities belong to a Career's own top-level record or its
		// Features/Perks/SkillChoice/LanguageChoice nested content.
		const careerTopLevelIDs = new Set(careers.map(career => career.id));
		const careerFeatureIDs = new Set(careers.flatMap(career => career.features.map(f => f.id)));
		elements.forEach(element => {
			expect(careerTopLevelIDs.has(element.id)).toBe(false);
			expect(careerFeatureIDs.has(element.id)).toBe(false);
		});
	});

	it('requires every Incident\'s name and description, using live runtime canonical text', () => {
		const elements = getV1CareerIncitingIncidentElements(getTargetSourcebooks());
		const required = createV1CareerIncitingIncidentRequiredCanonicalEnglish(getTargetSourcebooks());

		expect(Object.keys(required)).toHaveLength(216);
		elements.forEach(element => {
			expect(required[elementFieldIdentity(element.id, 'name')]).toBe(element.name);
			expect(required[elementFieldIdentity(element.id, 'description')]).toBe(element.description);
		});
	});

	it('takes canonical English from the real career-data Inciting Incident, e.g. career-agent-ii-1', () => {
		const required = createV1CareerIncitingIncidentRequiredCanonicalEnglish(getTargetSourcebooks());
		const careers = SourcebookLogic.getCareers(getTargetSourcebooks());
		const agent = careers.find(c => c.id === 'career-agent')!;
		const disavowed = agent.incitingIncidents.options.find(o => o.id === 'career-agent-ii-1')!;

		expect(required[elementFieldIdentity('career-agent-ii-1', 'name')]).toBe(disavowed.name);
		expect(required[elementFieldIdentity('career-agent-ii-1', 'name')]).toBe('Disavowed');
	});

	it('is merged into the production V1 manifest without displacing the pre-existing denominator', () => {
		const required = v1LocalizationManifest.requiredCanonicalEnglish;

		expect(required[elementFieldIdentity('career-agent-ii-1', 'name')]).toBe('Disavowed');
		// A representative pre-existing identity from an earlier batch is still present.
		expect(required[elementFieldIdentity('career-agent', 'name')]).toBe('Agent');
		expect(required['element:ancestry-devil/name']).toBe('Devil');
		expect(required['element:env-nomadic/name']).toBe('Nomadic');
	});

	it('keeps all 6 unresolved domains, including hero-creation-nested-authored-content', () => {
		expect(v1LocalizationManifest.unresolvedDomains).toHaveLength(6);
		expect(v1LocalizationManifest.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'hero-creation-nested-authored-content'
		]));
	});

	it('has approved catalog entries for all 216 Career Inciting Incident name and description identities', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});
		const elements = getV1CareerIncitingIncidentElements(getTargetSourcebooks());
		const identities = elements.flatMap(element => [
			elementFieldIdentity(element.id, 'name'),
			elementFieldIdentity(element.id, 'description')
		]);

		expect(identities).toHaveLength(216);
		identities.forEach(identity => {
			expect(result.missing).not.toContain(identity);
			expect(result.unapproved).not.toContain(identity);
		});
	});

	it('raises requiredCount from 543 to 759, with zero missing, zero unapproved and zero catalog issues, and stays incomplete', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		expect(result.requiredCount).toBe(759);
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains).toHaveLength(6);
		expect(result.complete).toBe(false);
	});
});
