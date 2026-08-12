/* eslint-disable sort-imports */

import {
	createV1SkillRequiredCanonicalEnglish,
	getV1SkillElements,
	v1HeroCreationSourcebooks,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { skillFieldIdentity } from '@/localization/catalog';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { describe, expect, it } from 'vitest';

const getTargetSourcebooks = () => v1HeroCreationSourcebooks;

describe('V1 Skill manifest', () => {
	it('enumerates exactly 57 unique V1 Skills, drawn from the live Core/Orden/Beastheart/Summoner sourcebook data', () => {
		const skills = getV1SkillElements(getTargetSourcebooks());

		expect(skills).toHaveLength(57);
		expect(new Set(skills.map(s => s.name)).size).toBe(57);

		// Matches SourcebookLogic.getSkills over the same target sourcebooks - no separate
		// enumeration logic is introduced for this denominator.
		expect(skills).toEqual(SourcebookLogic.getSkills(getTargetSourcebooks()));
	});

	it('requires every Skill name, and description only when non-empty, using live runtime canonical text - 57 names + 57 descriptions = 114 identities', () => {
		const skills = getV1SkillElements(getTargetSourcebooks());
		const required = createV1SkillRequiredCanonicalEnglish(getTargetSourcebooks());

		expect(Object.keys(required)).toHaveLength(114);

		let descriptionCount = 0;
		skills.forEach(skill => {
			expect(required[skillFieldIdentity(skill.name, 'name')]).toBe(skill.name);
			if (skill.description !== '') {
				descriptionCount++;
				expect(required[skillFieldIdentity(skill.name, 'description')]).toBe(skill.description);
			}
		});
		expect(descriptionCount).toBe(57);
	});

	it('takes canonical English from the real sourcebook Skill data, e.g. Alchemy and the Orden-only Timescape', () => {
		const required = createV1SkillRequiredCanonicalEnglish(getTargetSourcebooks());

		expect(required[skillFieldIdentity('Alchemy', 'name')]).toBe('Alchemy');
		expect(required[skillFieldIdentity('Alchemy', 'description')]).toBe('Make bombs and potions.');
		expect(required[skillFieldIdentity('Timescape', 'name')]).toBe('Timescape');
		expect(required[skillFieldIdentity('Timescape', 'description')]).toBe('Knowing about the various planets of the timescape');
	});

	it('is merged into the production V1 manifest without displacing the pre-existing denominator', () => {
		const required = v1LocalizationManifest.requiredCanonicalEnglish;

		expect(required[skillFieldIdentity('Alchemy', 'name')]).toBe('Alchemy');
		// A representative pre-existing identity from an earlier batch is still present.
		expect(required['element:career-agent/name']).toBe('Agent');
	});

	it('keeps all 6 unresolved domains, including skills-and-languages (Languages remain undefined)', () => {
		expect(v1LocalizationManifest.unresolvedDomains).toHaveLength(6);
		expect(v1LocalizationManifest.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'skills-and-languages'
		]));
	});

	it('has approved catalog entries for all 114 required Skill identities', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});
		const required = createV1SkillRequiredCanonicalEnglish(getTargetSourcebooks());
		const identities = Object.keys(required);

		expect(identities).toHaveLength(114);
		identities.forEach(identity => {
			expect(result.missing).not.toContain(identity);
			expect(result.unapproved).not.toContain(identity);
		});
	});

	it('regression: preserves the Reviewer-corrected Culture / Criminal Underworld identity mapping', () => {
		const culture = productionLocalizationEntries.find(e => (e.kind === 'skill-field') && (e.skillName === 'Culture') && (e.field === 'name'));
		const criminalUnderworld = productionLocalizationEntries.find(e => (e.kind === 'skill-field') && (e.skillName === 'Criminal Underworld') && (e.field === 'name'));

		expect(culture?.zhTW).toBe('文化');
		expect(criminalUnderworld?.zhTW).toBe('江湖');
		// Guards specifically against the swap the Reviewer corrected: neither Skill's
		// approved zh-TW should ever end up on the other's identity.
		expect(culture?.zhTW).not.toBe('江湖');
		expect(criminalUnderworld?.zhTW).not.toBe('文化');
	});

	it('raises requiredCount from 894 to 1008, with zero missing, zero unapproved and zero catalog issues, and stays incomplete', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		expect(result.requiredCount).toBe(1008);
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains).toHaveLength(6);
		expect(result.complete).toBe(false);
	});
});
