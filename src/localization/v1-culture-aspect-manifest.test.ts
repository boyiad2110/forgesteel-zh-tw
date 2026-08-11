/* eslint-disable sort-imports */

import { EnvironmentData, OrganizationData, UpbringingData } from '@/data/culture-data';
import {
	createV1CultureAspectRequiredCanonicalEnglish,
	getV1CultureAspectElements,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { elementFieldIdentity } from '@/localization/catalog';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { describe, expect, it } from 'vitest';

describe('V1 Culture Aspect manifest', () => {
	it('enumerates exactly the 13 Environment, Organization and Upbringing Features', () => {
		const elements = getV1CultureAspectElements();

		expect(elements.map(element => element.id).sort()).toEqual([
			...EnvironmentData.getEnvironments().map(f => f.id),
			...OrganizationData.getOrganizations().map(f => f.id),
			...UpbringingData.getUpbringings().map(f => f.id)
		].sort());
		expect(elements).toHaveLength(13);
	});

	it('requires a name and description identity for every Culture Aspect Feature', () => {
		const elements = getV1CultureAspectElements();
		const required = createV1CultureAspectRequiredCanonicalEnglish();

		expect(Object.keys(required)).toHaveLength(26);
		elements.forEach(element => {
			expect(required[elementFieldIdentity(element.id, 'name')]).toBe(element.name);
			expect(required[elementFieldIdentity(element.id, 'description')]).toBe(element.description);
		});
	});

	it('takes canonical English snapshots from the real culture-data objects', () => {
		const required = createV1CultureAspectRequiredCanonicalEnglish();

		expect(required[elementFieldIdentity('env-nomadic', 'name')]).toBe(EnvironmentData.nomadic.name);
		expect(required[elementFieldIdentity('env-nomadic', 'description')]).toBe(EnvironmentData.nomadic.description);
		expect(required[elementFieldIdentity('up-martial', 'name')]).toBe(UpbringingData.martial.name);
		expect(required[elementFieldIdentity('up-martial', 'description')]).toBe(UpbringingData.martial.description);
	});

	// createSkillChoice() in factory-feature-logic.ts has a pre-existing operator-precedence
	// bug ('data.description || count > 1 ? A : B') that discards the descriptive text a
	// caller passes in and always stores an auto-generated 'Choose N from <skill list>.'
	// sentence as the runtime description instead. This is canonical calculation logic this
	// project does not modify, so the denominator below reflects that actual runtime text,
	// not the descriptive text culture-data.ts appears to author.
	it('requires the actual auto-generated sentence for description, not the descriptive text culture-data.ts passes in', () => {
		const required = createV1CultureAspectRequiredCanonicalEnglish();

		expect(EnvironmentData.nomadic.description).not.toBe('A nomadic culture travels from place to place to survive.');
		expect(EnvironmentData.nomadic.description).toBe('Choose 1 from Exploration skills, Interpersonal skills.');
		expect(required[elementFieldIdentity('env-nomadic', 'description')]).toBe(EnvironmentData.nomadic.description);
	});

	it('is merged into the production V1 manifest without displacing the Hero creation Element denominator', () => {
		const required = v1LocalizationManifest.requiredCanonicalEnglish;

		expect(required[elementFieldIdentity('env-nomadic', 'name')]).toBe('Nomadic');
		expect(required[elementFieldIdentity('org-communal', 'description')]).toBe(OrganizationData.communal.description);
		// A representative top-level Element identity from the pre-existing denominator is
		// still present, so this batch added to the manifest rather than replacing it.
		expect(required['element:culture-artisan-guild/name']).toBe('Artisan Guild');
	});

	it('keeps hero-creation-nested-authored-content unresolved even though these 13 Features are now covered', () => {
		expect(v1LocalizationManifest.unresolvedDomains.map(domain => domain.id)).toContain('hero-creation-nested-authored-content');
	});

	it('has approved catalog entries for all 13 Culture Aspect names, but no description entries pending an Owner decision', () => {
		// The Owner-approved zh-TW description text was written against the descriptive text
		// culture-data.ts authors, not the auto-generated sentence actually shown, so it
		// cannot be attached to these description identities without misrepresenting what was
		// approved. Until that is resolved, these 13 description identities are honestly
		// reported missing rather than paired with mismatched or invented English.
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});
		const elements = getV1CultureAspectElements();
		const nameIdentities = elements.map(element => elementFieldIdentity(element.id, 'name'));
		const descriptionIdentities = elements.map(element => elementFieldIdentity(element.id, 'description'));

		nameIdentities.forEach(identity => {
			expect(result.missing).not.toContain(identity);
			expect(result.unapproved).not.toContain(identity);
		});
		expect(result.missing.filter(identity => descriptionIdentities.includes(identity)).sort()).toEqual([ ...descriptionIdentities ].sort());
		expect(result.catalogIssues).toEqual([]);
	});
});
