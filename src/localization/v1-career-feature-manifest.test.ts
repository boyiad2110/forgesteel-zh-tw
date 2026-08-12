/* eslint-disable sort-imports */

import {
	createV1CareerFeatureRequiredCanonicalEnglish,
	getV1CareerFeatureElements,
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

describe('V1 Career Feature manifest', () => {
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

	it('enumerates exactly 84 direct Career Feature Elements, each with a unique ID', () => {
		const elements = getV1CareerFeatureElements(getTargetSourcebooks());

		expect(elements).toHaveLength(84);
		expect(new Set(elements.map(element => element.id)).size).toBe(84);
	});

	it('walks only Career -> features (direct children), not Inciting Incidents or any nested Feature content', () => {
		const elements = getV1CareerFeatureElements(getTargetSourcebooks());
		const careers = SourcebookLogic.getCareers(getTargetSourcebooks());
		const expectedIDs = careers.flatMap(career => career.features.map(f => f.id)).sort();

		expect(elements.map(element => element.id).sort()).toEqual(expectedIDs);

		// None of the collected identities belong to a Career's own top-level record or its
		// Inciting Incident options.
		const careerTopLevelIDs = new Set(careers.map(career => career.id));
		const incitingIncidentIDs = new Set(careers.flatMap(career => career.incitingIncidents.options.map(o => o.id)));
		elements.forEach(element => {
			expect(careerTopLevelIDs.has(element.id)).toBe(false);
			expect(incitingIncidentIDs.has(element.id)).toBe(false);
		});
	});

	it('keeps every direct Career Feature within the current bounded type set (SkillChoice, LanguageChoice, Bonus, Perk)', () => {
		const elements = getV1CareerFeatureElements(getTargetSourcebooks());
		const allowedTypes = new Set([ FeatureType.SkillChoice, FeatureType.LanguageChoice, FeatureType.Bonus, FeatureType.Perk ]);

		elements.forEach(element => {
			expect(allowedTypes.has(element.type)).toBe(true);
		});
	});

	it('requires every Feature name, and description only when non-empty, using live runtime canonical text - 84 names + 51 descriptions = 135 identities', () => {
		const elements = getV1CareerFeatureElements(getTargetSourcebooks());
		const required = createV1CareerFeatureRequiredCanonicalEnglish(getTargetSourcebooks());

		expect(Object.keys(required)).toHaveLength(135);

		let descriptionCount = 0;
		elements.forEach(element => {
			expect(required[elementFieldIdentity(element.id, 'name')]).toBe(element.name);
			if (element.description !== '') {
				descriptionCount++;
				expect(required[elementFieldIdentity(element.id, 'description')]).toBe(element.description);
			} else {
				expect(required[elementFieldIdentity(element.id, 'description')]).toBeUndefined();
			}
		});
		expect(descriptionCount).toBe(51);
	});

	it('takes canonical English from the real career-data Feature, e.g. career-agent-feature-2', () => {
		const required = createV1CareerFeatureRequiredCanonicalEnglish(getTargetSourcebooks());
		const careers = SourcebookLogic.getCareers(getTargetSourcebooks());
		const agent = careers.find(c => c.id === 'career-agent')!;
		const interpersonalSkill = agent.features.find(f => f.id === 'career-agent-feature-2')!;

		expect(required[elementFieldIdentity('career-agent-feature-2', 'name')]).toBe(interpersonalSkill.name);
		expect(required[elementFieldIdentity('career-agent-feature-2', 'name')]).toBe('Interpersonal Skill');
		expect(required[elementFieldIdentity('career-agent-feature-2', 'description')]).toBe('Choose a skill from Interpersonal skills.');
	});

	it('is merged into the production V1 manifest without displacing the pre-existing denominator', () => {
		const required = v1LocalizationManifest.requiredCanonicalEnglish;

		expect(required[elementFieldIdentity('career-agent-feature-2', 'name')]).toBe('Interpersonal Skill');
		// Representative pre-existing identities from earlier batches are still present.
		expect(required[elementFieldIdentity('career-agent', 'name')]).toBe('Agent');
		expect(required[elementFieldIdentity('career-agent-ii-1', 'name')]).toBe('Disavowed');
		expect(required['element:ancestry-devil/name']).toBe('Devil');
		expect(required['element:env-nomadic/name']).toBe('Nomadic');
	});

	it('keeps all 6 unresolved domains, including hero-creation-nested-authored-content', () => {
		expect(v1LocalizationManifest.unresolvedDomains).toHaveLength(6);
		expect(v1LocalizationManifest.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'hero-creation-nested-authored-content'
		]));
	});

	it('has approved catalog entries for all 135 required Career Feature identities', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});
		const required = createV1CareerFeatureRequiredCanonicalEnglish(getTargetSourcebooks());
		const identities = Object.keys(required);

		expect(identities).toHaveLength(135);
		identities.forEach(identity => {
			expect(result.missing).not.toContain(identity);
			expect(result.unapproved).not.toContain(identity);
		});
	});

	it('applies the Owner-approved rule expansions exactly for representative Features', () => {
		const catalogByIdentity = new Map(productionLocalizationEntries.map(entry => [ `${entry.kind === 'element-field' ? `element:${entry.elementID}/${entry.field}` : ''}`, entry ]));

		const expectEntry = (elementID: string, field: 'name' | 'description', zhTW: string) => {
			const entry = catalogByIdentity.get(elementFieldIdentity(elementID, field));
			expect(entry?.zhTW).toBe(zhTW);
			expect(entry?.approval).toBe('approved');
		};

		// [Category] Skill -> [Category]技能
		expectEntry('career-agent-feature-2', 'name', '交涉類技能');
		expectEntry('career-agent-feature-2', 'description', '從交涉類技能中選擇 1 項技能。');
		// [Category] Skills (count 2) -> [Category]技能
		expectEntry('career-artisan-feature-1', 'name', '工藝類技能');
		expectEntry('career-artisan-feature-1', 'description', '從工藝類技能中選擇 2 項技能。');
		// Multi-list Skills
		expectEntry('laborer-feature-2', 'name', '工藝類 / 探索類技能');
		expectEntry('laborer-feature-2', 'description', '從工藝類技能、探索類技能中選擇 2 項技能。');
		// Choose a skill from any list.
		expectEntry('career-agent-feature-1', 'name', '技能');
		expectEntry('career-agent-feature-1', 'description', '從任意列表中選擇 1 項技能。');
		// Choose a skill from Music, Perform.
		expectEntry('performer-feature-1', 'description', '從音樂、表演中選擇 1 項技能。');
		// [Category] Perk -> [Category]專長
		expectEntry('career-agent-feature-5', 'name', '隱密類專長');
		// Language, canonical count 1 (double-space canonical preserved, zh-TW normalized)
		expectEntry('career-aristocrat-feature-3', 'name', '語言');
		expectEntry('career-aristocrat-feature-3', 'description', '選擇 1 種語言。');
		// Languages, canonical count 2
		expectEntry('career-agent-feature-4', 'name', '語言');
		expectEntry('career-agent-feature-4', 'description', '選擇 2 種語言。');
		// Renown / Wealth / Project Points
		expectEntry('career-aristocrat-feature-4', 'name', '聲望');
		expectEntry('career-aristocrat-feature-5', 'name', '財富');
		expectEntry('career-artisan-feature-3', 'name', '專案點數');
	});

	it('adds its own 135 required identities on top of the pre-existing V1 denominator, with zero missing, zero unapproved and zero catalog issues, and stays incomplete', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		// This denominator (84 direct Career Features, 135 identities) is additive; a
		// separate, later batch (e.g. Skills) can raise requiredCount further without this
		// test failing for an unrelated reason.
		expect(result.requiredCount).toBeGreaterThanOrEqual(894);
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains).toHaveLength(6);
		expect(result.complete).toBe(false);
	});
});
