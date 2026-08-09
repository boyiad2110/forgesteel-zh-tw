/* eslint-disable sort-imports */

import { CanonicalEnglishSource } from '@/localization/catalog-validator';
import { SourcebookData } from '@/data/sourcebook-data';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Element } from '@/models/element';
import { Sourcebook, SourcebookElementKind } from '@/models/sourcebook';
import { elementFieldIdentity } from '@/localization/catalog';

export interface V1LocalizationUnresolvedDomain {
	id: string;
	description: string;
}

export interface V1LocalizationManifest {
	requiredCanonicalEnglish: CanonicalEnglishSource;
	unresolvedDomains: V1LocalizationUnresolvedDomain[];
}

export const v1HeroCreationSourcebookIDs = [ 'core', 'orden', 'beastheart', 'summoner' ];

const heroCreationElementKinds: SourcebookElementKind[] = [ 'ancestry', 'culture', 'career', 'class', 'complication' ];

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
	const directSelections = targetSourcebooks
		.flatMap(SourcebookLogic.getElements)
		.filter(entry => heroCreationElementKinds.includes(entry.type))
		.map(entry => entry.element);
	const cultures = SourcebookLogic.getCultures(targetSourcebooks, true);

	return deduplicateHeroCreationElements([ ...directSelections, ...cultures ]);
};

/** Builds the V1 Element-field denominator from live canonical sourcebook metadata. */
export const createV1HeroCreationRequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};

	getV1HeroCreationElements(sourcebooks).forEach(element => {
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
	});

	return requiredCanonicalEnglish;
};

// This foundation deliberately fails closed. Each domain remains unresolved until a
// later content batch supplies its required identities and current canonical English.
const sourcebooks = await SourcebookData.loadAll();

export const v1LocalizationManifest: V1LocalizationManifest = {
	requiredCanonicalEnglish: createV1HeroCreationRequiredCanonicalEnglish(sourcebooks),
	unresolvedDomains: [
		{ id: 'official-ability-authored-content', description: 'Official ability authored content has not been enumerated.' },
		{ id: 'class-and-subclass-level-content', description: 'Class and subclass level content has not been enumerated.' },
		{ id: 'hero-creation-nested-authored-content', description: 'Nested Hero creation authored content has not been enumerated.' },
		{ id: 'skills-and-languages', description: 'Skill and language localization identities have not been defined.' },
		{ id: 'hero-sheet', description: 'Hero Sheet player-facing content has not been bounded.' },
		{ id: 'hero-edit-semantic-keys', description: 'Hero Edit semantic required keys have not been enumerated.' }
	]
};
