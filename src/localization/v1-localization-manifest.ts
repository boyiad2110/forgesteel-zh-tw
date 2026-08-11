/* eslint-disable sort-imports */

import { CanonicalEnglishSource } from '@/localization/catalog-validator';
import { EnvironmentData, OrganizationData, UpbringingData } from '@/data/culture-data';
import { beastheartSourcebook } from '@/data/sourcebooks/official/beastheart';
import { core } from '@/data/sourcebooks/official/core';
import { orden } from '@/data/sourcebooks/official/orden';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Element } from '@/models/element';
import { Sourcebook } from '@/models/sourcebook';
import { elementFieldIdentity } from '@/localization/catalog';

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

// This foundation deliberately fails closed. Each domain remains unresolved until a
// later content batch supplies its required identities and current canonical English.
export const v1LocalizationManifest: V1LocalizationManifest = {
	requiredCanonicalEnglish: {
		...createV1HeroCreationRequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1CultureAspectRequiredCanonicalEnglish()
	},
	unresolvedDomains: [
		{ id: 'official-ability-authored-content', description: 'Official ability authored content has not been enumerated.' },
		{ id: 'class-and-subclass-level-content', description: 'Class and subclass level content has not been enumerated.' },
		{ id: 'hero-creation-nested-authored-content', description: 'Nested Hero creation authored content has not been enumerated.' },
		{ id: 'skills-and-languages', description: 'Skill and language localization identities have not been defined.' },
		{ id: 'hero-sheet', description: 'Hero Sheet player-facing content has not been bounded.' },
		{ id: 'hero-edit-semantic-keys', description: 'Hero Edit semantic required keys have not been enumerated.' }
	]
};
