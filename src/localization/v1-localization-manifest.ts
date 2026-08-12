/* eslint-disable sort-imports */

import { CanonicalEnglishSource } from '@/localization/catalog-validator';
import { EnvironmentData, OrganizationData, UpbringingData } from '@/data/culture-data';
import { beastheartSourcebook } from '@/data/sourcebooks/official/beastheart';
import { core } from '@/data/sourcebooks/official/core';
import { orden } from '@/data/sourcebooks/official/orden';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { Element } from '@/models/element';
import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Language } from '@/models/language';
import { Skill } from '@/models/skill';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Sourcebook } from '@/models/sourcebook';
import { elementFieldIdentity, languageFieldIdentity, skillFieldIdentity } from '@/localization/catalog';

export interface V1LocalizationUnresolvedDomain {
	id: string;
	description: string;
}

export interface V1LocalizationManifest {
	requiredCanonicalEnglish: CanonicalEnglishSource;
	unresolvedDomains: V1LocalizationUnresolvedDomain[];
}

export const v1HeroCreationSourcebooks: Sourcebook[] = [ core, orden, beastheartSourcebook, summonerSourcebook ];

export const v1HeroCreationSourcebookIDs = v1HeroCreationSourcebooks.map(sourcebook => sourcebook.id);

const isV1HeroCreationSourcebook = (sourcebook: Sourcebook) => v1HeroCreationSourcebookIDs.includes(sourcebook.id);

const deduplicateHeroCreationElements = (elements: Element[]) => {
	const elementsByID = new Map<string, Element>();

	elements.forEach(element => {
		const existing = elementsByID.get(element.id);
		if (!existing) {
			elementsByID.set(element.id, element);
			return;
		}

		if ((existing.name !== element.name) || (existing.description !== element.description)) {
			throw new Error(`duplicate localization identity for Element '${element.id}' has conflicting canonical English`);
		}
	});

	return [ ...elementsByID.values() ];
};

/** The direct Hero creation selections, including ancestry-provided cultures. */
export const getV1HeroCreationElements = (sourcebooks: Sourcebook[]) => {
	const targetSourcebooks = sourcebooks.filter(isV1HeroCreationSourcebook);

	return deduplicateHeroCreationElements([
		...SourcebookLogic.getAncestries(targetSourcebooks),
		...SourcebookLogic.getCultures(targetSourcebooks, true),
		...SourcebookLogic.getCareers(targetSourcebooks),
		...SourcebookLogic.getClasses(targetSourcebooks),
		...SourcebookLogic.getComplications(targetSourcebooks)
	]);
};

/** Adds an Element's name, and its description when non-empty, rejecting a re-used identity. */
const addRequiredElementFields = (requiredCanonicalEnglish: CanonicalEnglishSource, element: Element) => {
	const addRequiredField = (field: 'name' | 'description', canonicalEnglish: string) => {
		const identity = elementFieldIdentity(element.id, field);
		if (requiredCanonicalEnglish[identity] !== undefined) {
			throw new Error(`duplicate localization identity '${identity}'`);
		}
		requiredCanonicalEnglish[identity] = canonicalEnglish;
	};

	addRequiredField('name', element.name);
	if (element.description !== '') {
		addRequiredField('description', element.description);
	}
};

/** Builds the V1 Element-field denominator from live canonical sourcebook metadata. */
export const createV1HeroCreationRequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1HeroCreationElements(sourcebooks).forEach(element => addRequiredElementFields(requiredCanonicalEnglish, element));
	return requiredCanonicalEnglish;
};

/**
 * The V1 Culture Aspect denominator: the Environment, Organization and Upbringing
 * skill-choice Features a Bespoke Culture is built from. These are enumerated explicitly
 * from their own data classes rather than by traversing arbitrary nested Feature content,
 * so this stays a stable, reviewable list rather than a recursive nested-content crawler.
 */
export const getV1CultureAspectElements = (): Element[] => [
	...EnvironmentData.getEnvironments(),
	...OrganizationData.getOrganizations(),
	...UpbringingData.getUpbringings()
];

/** Builds the V1 Element-field denominator for the Culture Aspect Features above. */
export const createV1CultureAspectRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1CultureAspectElements().forEach(element => addRequiredElementFields(requiredCanonicalEnglish, element));
	return requiredCanonicalEnglish;
};

/**
 * The V1 Career Inciting Incident denominator: the `incitingIncidents.options` Elements
 * belonging to each V1 Career, addressed by the Incident's own ID. This does not walk any
 * other nested Career content (Features, Perks, SkillChoice, LanguageChoice, ...), so it
 * stays a bounded, reviewable slice rather than a recursive nested-content crawler.
 */
export const getV1CareerIncitingIncidentElements = (sourcebooks: Sourcebook[]): Element[] => {
	const targetSourcebooks = sourcebooks.filter(isV1HeroCreationSourcebook);
	const careers = SourcebookLogic.getCareers(targetSourcebooks);
	return careers.flatMap(career => career.incitingIncidents.options);
};

/** Builds the V1 Element-field denominator for the Career Inciting Incident options above. */
export const createV1CareerIncitingIncidentRequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1CareerIncitingIncidentElements(sourcebooks).forEach(element => addRequiredElementFields(requiredCanonicalEnglish, element));
	return requiredCanonicalEnglish;
};

/**
 * Walks Feature nodes reachable from a V1 Ancestry's own top-level features, descending only
 * through Choice options and Multiple child Features. A FeatureType.Ability node is collected
 * nowhere: traversal stops there without creating an identity for it, so authored Ability
 * content (name, description, sections, Power Rolls, ...) stays part of the still-unresolved
 * official-ability-authored-content domain instead of being captured piecemeal here. No other
 * Feature type's own selection/child data is walked, so this stays a bounded, reviewable slice
 * rather than an arbitrary all-content recursive crawler.
 */
const collectNonAbilityFeatureNodes = (features: Feature[], collected: Feature[] = []): Feature[] => {
	features.forEach(feature => {
		if (feature.type === FeatureType.Ability) {
			return;
		}

		collected.push(feature);

		if (feature.type === FeatureType.Choice) {
			collectNonAbilityFeatureNodes(feature.data.options.map(option => option.feature), collected);
		}

		if (feature.type === FeatureType.Multiple) {
			collectNonAbilityFeatureNodes(feature.data.features, collected);
		}
	});

	return collected;
};

/** The V1 Ancestry nested Feature denominator: every non-Ability Feature node nested beneath a V1 Ancestry's own top-level features. */
export const getV1AncestryNestedFeatureElements = (sourcebooks: Sourcebook[]): Feature[] => {
	const targetSourcebooks = sourcebooks.filter(isV1HeroCreationSourcebook);
	const ancestries = SourcebookLogic.getAncestries(targetSourcebooks);
	return collectNonAbilityFeatureNodes(ancestries.flatMap(ancestry => ancestry.features));
};

/** Builds the V1 Element-field denominator for the Ancestry nested Features above. */
export const createV1AncestryNestedFeatureRequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1AncestryNestedFeatureElements(sourcebooks).forEach(element => addRequiredElementFields(requiredCanonicalEnglish, element));
	return requiredCanonicalEnglish;
};

/**
 * The V1 Career Feature denominator: only a V1 Career's own top-level `features` array
 * entries, addressed by each Feature's own ID. This does not descend into any Feature's
 * nested content (Choice options, Multiple children, ...) and does not walk a Career's
 * Inciting Incidents, so it stays a bounded, reviewable slice rather than a recursive
 * nested-content crawler.
 */
export const getV1CareerFeatureElements = (sourcebooks: Sourcebook[]): Feature[] => {
	const targetSourcebooks = sourcebooks.filter(isV1HeroCreationSourcebook);
	const careers = SourcebookLogic.getCareers(targetSourcebooks);
	return careers.flatMap(career => career.features);
};

/** Builds the V1 Element-field denominator for the Career Features above. */
export const createV1CareerFeatureRequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1CareerFeatureElements(sourcebooks).forEach(element => addRequiredElementFields(requiredCanonicalEnglish, element));
	return requiredCanonicalEnglish;
};

/**
 * The V1 Skill denominator: every unique Skill record across the V1 target sourcebooks,
 * addressed by the Skill's own canonical English `name` (Skill has no stable ID - see
 * src/models/skill.ts - and `name` is already the value Hero/Feature selection data and
 * save data use to reference a Skill). Reuses SourcebookLogic.getSkills, the same
 * name-deduplicated, sorted list every other Skill call site already draws from.
 */
export const getV1SkillElements = (sourcebooks: Sourcebook[]): Skill[] => {
	const targetSourcebooks = sourcebooks.filter(isV1HeroCreationSourcebook);
	return SourcebookLogic.getSkills(targetSourcebooks);
};

/** Adds a Skill's name, and its description when non-empty, rejecting a re-used identity. */
const addRequiredSkillFields = (requiredCanonicalEnglish: CanonicalEnglishSource, skill: Skill) => {
	const addRequiredField = (field: 'name' | 'description', canonicalEnglish: string) => {
		const identity = skillFieldIdentity(skill.name, field);
		if (requiredCanonicalEnglish[identity] !== undefined) {
			throw new Error(`duplicate localization identity '${identity}'`);
		}
		requiredCanonicalEnglish[identity] = canonicalEnglish;
	};

	addRequiredField('name', skill.name);
	if (skill.description !== '') {
		addRequiredField('description', skill.description);
	}
};

/** Builds the V1 Skill-field denominator from live canonical sourcebook Skill data. */
export const createV1SkillRequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1SkillElements(sourcebooks).forEach(skill => addRequiredSkillFields(requiredCanonicalEnglish, skill));
	return requiredCanonicalEnglish;
};

/**
 * The V1 Language denominator: every unique Language record across the V1 target
 * sourcebooks, addressed by the Language's own canonical English `name` (Language has no
 * stable ID - see src/models/language.ts - and `name` is already the value Feature/Hero
 * selection data and save data use to reference a Language). Reuses
 * SourcebookLogic.getLanguages, the same name-deduplicated, sorted list every other
 * Language call site already draws from.
 */
export const getV1LanguageElements = (sourcebooks: Sourcebook[]): Language[] => {
	const targetSourcebooks = sourcebooks.filter(isV1HeroCreationSourcebook);
	return SourcebookLogic.getLanguages(targetSourcebooks);
};

/** Adds a Language's name, and its description when non-empty, rejecting a re-used identity. */
const addRequiredLanguageFields = (requiredCanonicalEnglish: CanonicalEnglishSource, language: Language) => {
	const addRequiredField = (field: 'name' | 'description', canonicalEnglish: string) => {
		const identity = languageFieldIdentity(language.name, field);
		if (requiredCanonicalEnglish[identity] !== undefined) {
			throw new Error(`duplicate localization identity '${identity}'`);
		}
		requiredCanonicalEnglish[identity] = canonicalEnglish;
	};

	addRequiredField('name', language.name);
	if (language.description !== '') {
		addRequiredField('description', language.description);
	}
};

/** Builds the V1 Language-field denominator from live canonical sourcebook Language data. */
export const createV1LanguageRequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1LanguageElements(sourcebooks).forEach(language => addRequiredLanguageFields(requiredCanonicalEnglish, language));
	return requiredCanonicalEnglish;
};

// This foundation deliberately fails closed. Each domain remains unresolved until a
// later content batch supplies its required identities and current canonical English.
export const v1LocalizationManifest: V1LocalizationManifest = {
	requiredCanonicalEnglish: {
		...createV1HeroCreationRequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1CultureAspectRequiredCanonicalEnglish(),
		...createV1AncestryNestedFeatureRequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1CareerIncitingIncidentRequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1CareerFeatureRequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1SkillRequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1LanguageRequiredCanonicalEnglish(v1HeroCreationSourcebooks)
	},
	// 'skills-and-languages' is removed here: both Skill and Language V1 denominators are
	// now enumerated above (this batch completes Language; Skill was completed previously).
	unresolvedDomains: [
		{ id: 'official-ability-authored-content', description: 'Official ability authored content has not been enumerated.' },
		{ id: 'class-and-subclass-level-content', description: 'Class and subclass level content has not been enumerated.' },
		{ id: 'hero-creation-nested-authored-content', description: 'Nested Hero creation authored content has not been enumerated.' },
		{ id: 'hero-sheet', description: 'Hero Sheet player-facing content has not been bounded.' },
		{ id: 'hero-edit-semantic-keys', description: 'Hero Edit semantic required keys have not been enumerated.' }
	]
};
