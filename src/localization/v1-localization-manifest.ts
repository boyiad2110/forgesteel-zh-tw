/* eslint-disable sort-imports */

import { CanonicalEnglishSource } from '@/localization/catalog-validator';
import { censor } from '@/data/classes/censor/censor';
import { conduit } from '@/data/classes/conduit/conduit';
import { elementalist } from '@/data/classes/elementalist/elementalist';
import { fury } from '@/data/classes/fury/fury';
import { nullClass } from '@/data/classes/null/null';
import { shadow } from '@/data/classes/shadow/shadow';
import { tactician } from '@/data/classes/tactician/tactician';
import { talent } from '@/data/classes/talent/talent';
import { troubadour } from '@/data/classes/troubadour/troubadour';
import { memonek } from '@/data/ancestries/memonek';
import { timeRaider } from '@/data/ancestries/time-raider';
import { EnvironmentData, OrganizationData, UpbringingData } from '@/data/culture-data';
import { beastheartSourcebook } from '@/data/sourcebooks/official/beastheart';
import { core } from '@/data/sourcebooks/official/core';
import { orden } from '@/data/sourcebooks/official/orden';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { Element } from '@/models/element';
import { Ability } from '@/models/ability';
import { Domain } from '@/models/domain';
import { Feature, FeatureAbility, FeatureChoice, FeatureMultiple } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Kit } from '@/models/kit';
import { SubClass } from '@/models/subclass';
import { Language } from '@/models/language';
import { Skill } from '@/models/skill';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Sourcebook } from '@/models/sourcebook';
import { elementFieldIdentity, languageFieldIdentity, skillFieldIdentity } from '@/localization/catalog';
import {
	abilityDescriptionField,
	abilitySectionEffectField,
	abilitySectionNameField,
	abilitySectionRollField,
	abilitySectionTextField,
	abilityTriggerField,
	powerRollTierField
} from '@/localization/ability-field-path';

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

/** The exact approved Censor Level 1 ability slice; later Censor levels stay unresolved. */
export const v1CensorLevel1AbilityIDs = [
	'censor-1-4',
	'censor-1-6',
	'censor-ability-1',
	'censor-ability-2',
	'censor-ability-3',
	'censor-ability-4',
	'censor-ability-5',
	'censor-ability-6',
	'censor-ability-7',
	'censor-ability-8',
	'censor-ability-9',
	'censor-ability-10',
	'censor-ability-11',
	'censor-ability-12'
] as const;

const isCensorLevel1FeatureAbility = (feature: Feature): feature is FeatureAbility => feature.type === FeatureType.Ability;

/**
 * Enumerates only the two Censor Level 1 feature abilities and Censor abilities 1–12.
 * It intentionally does not traverse subclasses, later levels, or arbitrary Features.
 */
export const getV1CensorLevel1Abilities = (): Ability[] => {
	const levelOne = censor.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Censor Level 1 features are missing');
	}

	const abilities = [
		...levelOne.features.filter(isCensorLevel1FeatureAbility).map(feature => feature.data.ability),
		...censor.abilities
	];
	const abilitiesByID = new Map(abilities.map(ability => [ ability.id, ability ]));

	return v1CensorLevel1AbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Censor Level 1 ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Adds every localizable authored field from one ability's live canonical source. */
const addRequiredAbilityFields = (requiredCanonicalEnglish: CanonicalEnglishSource, ability: Ability) => {
	const addRequiredField = (field: string, canonicalEnglish: string) => {
		if (canonicalEnglish === '') {
			return;
		}

		const identity = elementFieldIdentity(ability.id, field);
		if (requiredCanonicalEnglish[identity] !== undefined) {
			throw new Error(`duplicate localization identity '${identity}'`);
		}
		requiredCanonicalEnglish[identity] = canonicalEnglish;
	};

	addRequiredField('name', ability.name);
	addRequiredField('target', ability.target);
	addRequiredField(abilityDescriptionField, ability.description);
	addRequiredField(abilityTriggerField, ability.type.trigger);

	(ability.sections || []).forEach((section, index) => {
		switch (section.type) {
			case 'text':
				addRequiredField(abilitySectionTextField(index), section.text);
				break;
			case 'field':
				addRequiredField(abilitySectionNameField(index), section.name);
				addRequiredField(abilitySectionEffectField(index), section.effect);
				break;
			case 'roll': {
				const rollField = abilitySectionRollField(index);
				addRequiredField(powerRollTierField(rollField, 1), section.roll.tier1);
				addRequiredField(powerRollTierField(rollField, 2), section.roll.tier2);
				addRequiredField(powerRollTierField(rollField, 3), section.roll.tier3);
				break;
			}
		}
	});
};

/** Builds the bounded 92-identity Censor Level 1 denominator from live canonical data. */
export const createV1CensorLevel1AbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1CensorLevel1Abilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/** The exact approved Conduit Level 1 base-class ability slice; later Conduit levels stay unresolved. */
export const v1ConduitLevel1AbilityIDs = [
	'conduit-1-5',
	'conduit-1-6',
	'conduit-1-7a',
	'conduit-1-7b',
	'conduit-ability-1',
	'conduit-ability-2',
	'conduit-ability-3',
	'conduit-ability-4',
	'conduit-ability-5',
	'conduit-ability-6',
	'conduit-ability-7',
	'conduit-ability-8',
	'conduit-ability-9',
	'conduit-ability-10',
	'conduit-ability-11',
	'conduit-ability-12',
	'conduit-ability-13',
	'conduit-ability-14',
	'conduit-ability-15',
	'conduit-ability-16'
] as const;

const isConduitTriggeredActionChoice = (feature: Feature): feature is FeatureChoice => (
	(feature.type === FeatureType.Choice) && (feature.id === 'conduit-1-7')
);

const isConduitLevel1FeatureAbility = (feature: Feature): feature is FeatureAbility => feature.type === FeatureType.Ability;

/** Enumerates only Conduit's two direct Level 1 abilities, Triggered Action choices, and abilities 1–16. */
export const getV1ConduitLevel1Abilities = (): Ability[] => {
	const levelOne = conduit.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Conduit Level 1 features are missing');
	}

	const triggeredAction = levelOne.features.find(isConduitTriggeredActionChoice);
	if (!triggeredAction) {
		throw new Error('Conduit Triggered Action choices are missing');
	}

	const abilities = [
		...levelOne.features.filter(isConduitLevel1FeatureAbility).map(feature => feature.data.ability),
		...triggeredAction.data.options
			.map(option => option.feature)
			.filter(isConduitLevel1FeatureAbility)
			.map(feature => feature.data.ability),
		...conduit.abilities
	];
	const abilitiesByID = new Map(abilities.map(ability => [ ability.id, ability ]));

	return v1ConduitLevel1AbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Conduit ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Builds the bounded 127-identity Conduit Level 1 denominator from live canonical data. */
export const createV1ConduitLevel1AbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1ConduitLevel1Abilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/**
 * Adds the bounded non-Ability Feature fields reachable from one class's own caller-supplied
 * Level 1 feature roots, in the traversal order `collectNonAbilityFeatureNodes` above defines:
 * Ability nodes stop the walk, and only Choice options and Multiple children are descended
 * into. Ability authored content belongs to each class's own ability slice; Choice options and
 * Multiple children remain player-facing FeaturePanel content, so their own stable fields are
 * included without turning this into a generic class crawler.
 *
 * A heroic resource also contributes the trigger of each way it is gained, addressed by its
 * position in the gains list. An empty trigger carries no reading and is skipped; the gain's
 * tag and value are canonical wiring the Hero's own resource calculation reads, not display
 * text. Each class's Level 1 slice below shares this one walk rather than repeating it.
 */
const addRequiredBoundedNonAbilityFeatureFields = (requiredCanonicalEnglish: CanonicalEnglishSource, features: Feature[]) => {
	collectNonAbilityFeatureNodes(features).forEach(feature => {
		addRequiredElementFields(requiredCanonicalEnglish, feature);

		if (feature.type === FeatureType.HeroicResource) {
			feature.data.gains.forEach((gain, index) => {
				if (gain.trigger === '') {
					return;
				}

				const identity = elementFieldIdentity(feature.id, `gains.${index}.trigger`);
				if (requiredCanonicalEnglish[identity] !== undefined) {
					throw new Error(`duplicate localization identity '${identity}'`);
				}
				requiredCanonicalEnglish[identity] = gain.trigger;
			});
		}
	});
};

/** Builds the bounded 42-identity Conduit Level 1 non-Ability denominator from live data. */
export const createV1ConduitLevel1RemainingRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, getLevelOneFeatures(conduit.featuresByLevel, 'Conduit'));
	return requiredCanonicalEnglish;
};

/**
 * The Conduit's own Level 2 progression roots. This deliberately reads only Conduit's level 2
 * entry rather than generalizing the Level 1 accessor the other class slices share: no other
 * slice reaches past Level 1 yet, and widening that shared accessor would quietly invite a
 * generic level crawler. Conduit Level 3+ stays out of the denominator, so
 * 'class-and-subclass-level-content' remains unresolved.
 */
const getV1ConduitLevel2Features = (): Feature[] => {
	const levelTwo = conduit.featuresByLevel.find(level => level.level === 2);
	if (!levelTwo) {
		throw new Error('Conduit Level 2 features are missing');
	}
	return levelTwo.features;
};

/**
 * Builds the bounded 7-identity Conduit Level 2 denominator from live canonical data, through
 * the same bounded non-Ability walk the Level 1 slices use. Conduit's four Level 2 roots are a
 * Text feature, a Perk choice and two Domain Feature choices; none of them is a Choice or
 * Multiple, so the walk contributes exactly their four names plus their three non-empty
 * descriptions. Two of those canonical values are Feature-factory output rather than authored
 * prose - the Perk's composed 'Crafting / Lore / Supernatural Perk' name, and the Level 2 Domain
 * Ability's default 'Choose a level 2 domain feature.' description - and both are recorded
 * exactly as the factory produces them, because FeaturePanel renders them as this Feature's own
 * player-facing text. The Domain features these two choices lead to carry their own already
 * approved Core Domain identities and are not re-enumerated here.
 */
export const createV1ConduitLevel2RequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, getV1ConduitLevel2Features());
	return requiredCanonicalEnglish;
};

/** The exact approved Elementalist Level 1 base-class ability slice; later levels and subclasses stay unresolved. */
export const v1ElementalistLevel1AbilityIDs = [
	'elementalist-1-4',
	'elementalist-1-6',
	'elementalist-1-8c',
	'elementalist-1-8d',
	'elementalist-ability-1',
	'elementalist-ability-2',
	'elementalist-ability-3',
	'elementalist-ability-4',
	'elementalist-ability-5',
	'elementalist-ability-6',
	'elementalist-ability-7',
	'elementalist-ability-8',
	'elementalist-ability-9',
	'elementalist-ability-10',
	'elementalist-ability-11',
	'elementalist-ability-12',
	'elementalist-ability-13',
	'elementalist-ability-14',
	'elementalist-ability-15',
	'elementalist-ability-16'
] as const;

const isElementalistWardChoice = (feature: Feature): feature is FeatureChoice => (
	(feature.type === FeatureType.Choice) && (feature.id === 'elementalist-1-8')
);

const isElementalistLevel1FeatureAbility = (feature: Feature): feature is FeatureAbility => feature.type === FeatureType.Ability;

/** Enumerates only Elementalist's direct Level 1 abilities, Ward ability choices, and abilities 1–16. */
export const getV1ElementalistLevel1Abilities = (): Ability[] => {
	const levelOne = elementalist.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Elementalist Level 1 features are missing');
	}

	const ward = levelOne.features.find(isElementalistWardChoice);
	if (!ward) {
		throw new Error('Elementalist Ward choices are missing');
	}

	const abilities = [
		...levelOne.features.filter(isElementalistLevel1FeatureAbility).map(feature => feature.data.ability),
		...ward.data.options
			.map(option => option.feature)
			.filter(isElementalistLevel1FeatureAbility)
			.map(feature => feature.data.ability),
		...elementalist.abilities
	];
	const abilitiesByID = new Map(abilities.map(ability => [ ability.id, ability ]));

	return v1ElementalistLevel1AbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Elementalist Level 1 ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Builds the bounded 133-identity Elementalist Level 1 denominator from live canonical data. */
export const createV1ElementalistLevel1AbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1ElementalistLevel1Abilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/** Builds the bounded 44-identity Elementalist Level 1 non-Ability denominator from live data. */
export const createV1ElementalistLevel1RemainingRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, getLevelOneFeatures(elementalist.featuresByLevel, 'Elementalist'));
	return requiredCanonicalEnglish;
};

/** The exact approved Null Level 1 base-class ability slice; later levels and subclasses stay unresolved. */
export const v1NullLevel1AbilityIDs = [
	'null-1-4',
	'null-1-5',
	'null-ability-1',
	'null-ability-2',
	'null-ability-3',
	'null-ability-4',
	'null-ability-5',
	'null-ability-6',
	'null-ability-7',
	'null-ability-8',
	'null-ability-9',
	'null-ability-10',
	'null-ability-11',
	'null-ability-12',
	'null-ability-13',
	'null-ability-14',
	'null-ability-15',
	'null-ability-16'
] as const;

const isNullLevel1FeatureAbility = (feature: Feature): feature is FeatureAbility => feature.type === FeatureType.Ability;

/** Enumerates only Null's direct Level 1 abilities and abilities 1–16. */
export const getV1NullLevel1Abilities = (): Ability[] => {
	const levelOne = nullClass.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Null Level 1 features are missing');
	}

	const abilities = [
		...levelOne.features.filter(isNullLevel1FeatureAbility).map(feature => feature.data.ability),
		...nullClass.abilities
	];
	const abilitiesByID = new Map(abilities.map(ability => [ ability.id, ability ]));

	return v1NullLevel1AbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Null Level 1 ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Builds the bounded 115-identity Null Level 1 denominator from live canonical data. */
export const createV1NullLevel1AbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1NullLevel1Abilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/** Builds the bounded 36-identity Null Level 1 non-Ability denominator from live data. */
export const createV1NullLevel1RemainingRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, getLevelOneFeatures(nullClass.featuresByLevel, 'Null'));
	return requiredCanonicalEnglish;
};

/** The three Null Traditions; later Tradition levels remain outside this Level 1 slice. */
export const v1NullTraditionIDs = [
	'null-sub-1',
	'null-sub-2',
	'null-sub-3'
] as const;

export const getV1NullTraditions = (): SubClass[] => {
	const traditionsByID = new Map(nullClass.subclasses.map(tradition => [ tradition.id, tradition ]));
	return v1NullTraditionIDs.map(id => {
		const tradition = traditionsByID.get(id);
		if (!tradition) {
			throw new Error(`Null Tradition '${id}' is missing`);
		}
		return tradition;
	});
};

/**
 * Builds the bounded 31-identity Null Level 1 subclass completion denominator: the class's
 * `subclassName` category plus each Tradition's own metadata and Level 1 Feature content.
 *
 * Unlike the Tactician, Talent and Troubadour completion slices, this one deliberately leaves
 * the base class alone. Null's Level 1 base content already has two merged, independently
 * tested slices - the 36-identity non-Ability slice above and the frozen 115-identity Ability
 * slice - so folding either into this one would move identities between denominators rather
 * than add the subclass content this batch is for. All three stay disjoint.
 *
 * Each Tradition's Level 1 tree goes through the one shared bounded non-Ability walk, with no
 * per-feature exception. Ability nodes contribute no identity here and are not descended into:
 * authored Ability content belongs to the class's own Ability slice and its Ability workflow,
 * not to this non-Ability denominator. Each Tradition therefore contributes exactly its skill
 * choice, its Mastery grouping and that grouping's two children.
 */
export const createV1NullLevel1SubclassCompletionRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	requiredCanonicalEnglish[elementFieldIdentity(nullClass.id, 'subclassName')] = nullClass.subclassName;

	getV1NullTraditions().forEach(tradition => {
		addRequiredElementFields(requiredCanonicalEnglish, tradition);
		addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, getLevelOneFeatures(tradition.featuresByLevel, `Null Tradition '${tradition.id}'`));
	});

	return requiredCanonicalEnglish;
};

/** The exact approved Fury Level 1 base-class ability slice; later Fury levels stay unresolved. */
export const v1FuryLevel1AbilityIDs = [
	'fury-ability-1',
	'fury-ability-2',
	'fury-ability-3',
	'fury-ability-4',
	'fury-ability-5',
	'fury-ability-6',
	'fury-ability-7',
	'fury-ability-8',
	'fury-ability-9',
	'fury-ability-10',
	'fury-ability-11',
	'fury-ability-12'
] as const;

/** Enumerates only Fury's twelve approved Level 1 base-class abilities. */
export const getV1FuryLevel1Abilities = (): Ability[] => {
	const abilitiesByID = new Map(fury.abilities.map(ability => [ ability.id, ability ]));

	return v1FuryLevel1AbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Fury ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Builds the bounded 80-identity Fury Level 1 denominator from live canonical data. */
export const createV1FuryLevel1AbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1FuryLevel1Abilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/** Builds the bounded 15-identity Fury Level 1 non-Ability denominator from live data. */
export const createV1FuryLevel1RemainingRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, getLevelOneFeatures(fury.featuresByLevel, 'Fury'));
	return requiredCanonicalEnglish;
};

/** The exact approved Shadow Level 1 base-class ability slice; later levels and subclasses stay unresolved. */
export const v1ShadowLevel1AbilityIDs = [
	'shadow-1-5',
	'shadow-ability-1',
	'shadow-ability-2',
	'shadow-ability-3',
	'shadow-ability-4',
	'shadow-ability-5',
	'shadow-ability-6',
	'shadow-ability-7',
	'shadow-ability-8',
	'shadow-ability-9',
	'shadow-ability-10',
	'shadow-ability-11',
	'shadow-ability-12'
] as const;

const isShadowLevel1FeatureAbility = (feature: Feature): feature is FeatureAbility => feature.type === FeatureType.Ability;

/** Enumerates only Shadow's direct Level 1 ability and abilities 1–12. */
export const getV1ShadowLevel1Abilities = (): Ability[] => {
	const levelOne = shadow.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Shadow Level 1 features are missing');
	}

	const abilities = [
		...levelOne.features.filter(isShadowLevel1FeatureAbility).map(feature => feature.data.ability),
		...shadow.abilities
	];
	const abilitiesByID = new Map(abilities.map(ability => [ ability.id, ability ]));

	return v1ShadowLevel1AbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Shadow Level 1 ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Builds the bounded 82-identity Shadow Level 1 denominator from live canonical data. */
export const createV1ShadowLevel1AbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1ShadowLevel1Abilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/** The three Shadow Colleges; later College levels remain outside this Level 1 slice. */
export const v1ShadowCollegeIDs = [
	'shadow-sub-1',
	'shadow-sub-2',
	'shadow-sub-3'
] as const;

export const getV1ShadowColleges = (): SubClass[] => {
	const collegesByID = new Map(shadow.subclasses.map(college => [ college.id, college ]));
	return v1ShadowCollegeIDs.map(id => {
		const college = collegesByID.get(id);
		if (!college) {
			throw new Error(`Shadow College '${id}' is missing`);
		}
		return college;
	});
};

/**
 * Builds the bounded 66-identity Shadow Level 1 completion denominator: the base class's
 * remaining non-Ability fields and Insight details, plus each Shadow College's metadata and
 * Level 1 Feature content. The existing 82-identity base Ability slice stays separate.
 */
export const createV1ShadowLevel1CompletionRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	const shadowLevelOneFeatures = getLevelOneFeatures(shadow.featuresByLevel, 'Shadow');
	requiredCanonicalEnglish[elementFieldIdentity(shadow.id, 'subclassName')] = shadow.subclassName;
	addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, shadowLevelOneFeatures);

	const insight = shadowLevelOneFeatures.find(feature => feature.id === 'shadow-resource');
	if (!insight || (insight.type !== FeatureType.HeroicResource)) {
		throw new Error('Shadow Insight resource is missing');
	}
	const insightDetailsIdentity = elementFieldIdentity(insight.id, 'details');
	if (requiredCanonicalEnglish[insightDetailsIdentity] !== undefined) {
		throw new Error(`duplicate localization identity '${insightDetailsIdentity}'`);
	}
	requiredCanonicalEnglish[insightDetailsIdentity] = insight.data.details;

	getV1ShadowColleges().forEach(college => {
		addRequiredElementFields(requiredCanonicalEnglish, college);
		const collegeLevelOneFeatures = getLevelOneFeatures(college.featuresByLevel, `Shadow College '${college.id}'`);
		addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, collegeLevelOneFeatures);
		collegeLevelOneFeatures
			.filter((feature): feature is FeatureAbility => feature.type === FeatureType.Ability)
			.forEach(feature => addRequiredAbilityFields(requiredCanonicalEnglish, feature.data.ability));
	});

	return requiredCanonicalEnglish;
};

/**
 * The exact approved Tactician Level 1 base-class ability slice. Level 1 selects cost 3 and
 * cost 5 class abilities, so only abilities 1-8 belong here; cost 7+ abilities, later levels
 * and the Tactical Doctrine subclasses stay unresolved.
 */
export const v1TacticianLevel1AbilityIDs = [
	'tactician-1-5a',
	'tactician-1-5b',
	'tactician-1-6',
	'tactician-ability-1',
	'tactician-ability-2',
	'tactician-ability-3',
	'tactician-ability-4',
	'tactician-ability-5',
	'tactician-ability-6',
	'tactician-ability-7',
	'tactician-ability-8'
] as const;

const isTacticianMarkMultiple = (feature: Feature): feature is FeatureMultiple => (
	(feature.type === FeatureType.Multiple) && (feature.id === 'tactician-1-5')
);

const isTacticianLevel1FeatureAbility = (feature: Feature): feature is FeatureAbility => feature.type === FeatureType.Ability;

/** Enumerates only Tactician's two Mark abilities, its direct Level 1 ability, and abilities 1-8. */
export const getV1TacticianLevel1Abilities = (): Ability[] => {
	const levelOne = tactician.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Tactician Level 1 features are missing');
	}

	const mark = levelOne.features.find(isTacticianMarkMultiple);
	if (!mark) {
		throw new Error('Tactician Mark abilities are missing');
	}

	const abilities = [
		...mark.data.features.filter(isTacticianLevel1FeatureAbility).map(feature => feature.data.ability),
		...levelOne.features.filter(isTacticianLevel1FeatureAbility).map(feature => feature.data.ability),
		...tactician.abilities
	];
	const abilitiesByID = new Map(abilities.map(ability => [ ability.id, ability ]));

	return v1TacticianLevel1AbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Tactician Level 1 ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Builds the bounded 59-identity Tactician Level 1 denominator from live canonical data. */
export const createV1TacticianLevel1AbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1TacticianLevel1Abilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/** The three Tactical Doctrines; later Doctrine levels remain outside this Level 1 slice. */
export const v1TacticianDoctrineIDs = [
	'tactician-sub-1',
	'tactician-sub-2',
	'tactician-sub-3'
] as const;

export const getV1TacticianDoctrines = (): SubClass[] => {
	const doctrinesByID = new Map(tactician.subclasses.map(doctrine => [ doctrine.id, doctrine ]));
	return v1TacticianDoctrineIDs.map(id => {
		const doctrine = doctrinesByID.get(id);
		if (!doctrine) {
			throw new Error(`Tactician Doctrine '${id}' is missing`);
		}
		return doctrine;
	});
};

/**
 * Builds the bounded 56-identity Tactician Level 1 completion denominator: the base class's
 * remaining non-Ability fields, plus each Tactical Doctrine's metadata and Level 1 Feature
 * content. The existing 59-identity base Ability slice stays separate.
 *
 * The whole base Level 1 feature tree goes through the one shared bounded walk, with no
 * per-feature exception. The Mark Multiple grouping (`tactician-1-5`) therefore contributes both
 * its `name` and its `description`: FeaturePanel renders that description as this grouping's own
 * player-facing text, so it is a required reading like any other, whether the canonical English
 * was authored directly or composed by the Feature factory from its children's names.
 */
export const createV1TacticianLevel1CompletionRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	const tacticianLevelOneFeatures = getLevelOneFeatures(tactician.featuresByLevel, 'Tactician');
	requiredCanonicalEnglish[elementFieldIdentity(tactician.id, 'subclassName')] = tactician.subclassName;

	addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, tacticianLevelOneFeatures);

	getV1TacticianDoctrines().forEach(doctrine => {
		addRequiredElementFields(requiredCanonicalEnglish, doctrine);
		const doctrineLevelOneFeatures = getLevelOneFeatures(doctrine.featuresByLevel, `Tactician Doctrine '${doctrine.id}'`);
		addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, doctrineLevelOneFeatures);
		doctrineLevelOneFeatures
			.filter((feature): feature is FeatureAbility => feature.type === FeatureType.Ability)
			.forEach(feature => addRequiredAbilityFields(requiredCanonicalEnglish, feature.data.ability));
	});

	return requiredCanonicalEnglish;
};

/**
 * The exact approved Talent Level 1 base-class ability slice. Level 1 selects signature, cost 3
 * and cost 5 class abilities, so only abilities 1-16 belong here; abilities 17+, later levels and
 * the Talent Tradition subclasses stay unresolved.
 */
export const v1TalentLevel1AbilityIDs = [
	'talent-1-2',
	'talent-1-6b',
	'talent-ability-1',
	'talent-ability-2',
	'talent-ability-3',
	'talent-ability-4',
	'talent-ability-5',
	'talent-ability-6',
	'talent-ability-7',
	'talent-ability-8',
	'talent-ability-9',
	'talent-ability-10',
	'talent-ability-11',
	'talent-ability-12',
	'talent-ability-13',
	'talent-ability-14',
	'talent-ability-15',
	'talent-ability-16'
] as const;

const isTalentWardChoice = (feature: Feature): feature is FeatureChoice => (
	(feature.type === FeatureType.Choice) && (feature.id === 'talent-1-6')
);

const isTalentLevel1FeatureAbility = (feature: Feature): feature is FeatureAbility => feature.type === FeatureType.Ability;

/** Enumerates only Talent's direct Level 1 ability, the Talent Ward ability choice, and abilities 1-16. */
export const getV1TalentLevel1Abilities = (): Ability[] => {
	const levelOne = talent.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Talent Level 1 features are missing');
	}

	const ward = levelOne.features.find(isTalentWardChoice);
	if (!ward) {
		throw new Error('Talent Ward choices are missing');
	}

	const abilities = [
		...levelOne.features.filter(isTalentLevel1FeatureAbility).map(feature => feature.data.ability),
		...ward.data.options
			.map(option => option.feature)
			.filter(isTalentLevel1FeatureAbility)
			.map(feature => feature.data.ability),
		...talent.abilities
	];
	const abilitiesByID = new Map(abilities.map(ability => [ ability.id, ability ]));

	return v1TalentLevel1AbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Talent Level 1 ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Builds the bounded 131-identity Talent Level 1 denominator from live canonical data. */
export const createV1TalentLevel1AbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1TalentLevel1Abilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/** The three Talent Traditions; later Tradition levels remain outside this Level 1 slice. */
export const v1TalentTraditionIDs = [
	'talent-sub-1',
	'talent-sub-2',
	'talent-sub-3'
] as const;

export const getV1TalentTraditions = (): SubClass[] => {
	const traditionsByID = new Map(talent.subclasses.map(tradition => [ tradition.id, tradition ]));
	return v1TalentTraditionIDs.map(id => {
		const tradition = traditionsByID.get(id);
		if (!tradition) {
			throw new Error(`Talent Tradition '${id}' is missing`);
		}
		return tradition;
	});
};

/**
 * Builds the bounded 84-identity Talent Level 1 completion denominator: the base class's
 * remaining non-Ability fields plus its Heroic Resource details, and each Talent Tradition's
 * metadata and Level 1 Feature content. The existing 131-identity base Ability slice stays
 * separate, and these two slices do not overlap.
 *
 * The whole base Level 1 feature tree goes through the one shared bounded walk, with no
 * per-feature exception: the Psionic Augmentation and Talent Ward Choice groupings contribute
 * their own readings and are descended into, while the Ability options they carry
 * (`talent-1-6b`) and the class's direct Level 1 ability (`talent-1-2`) belong to the base
 * Ability slice and are neither counted nor walked here.
 */
export const createV1TalentLevel1CompletionRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	const talentLevelOneFeatures = getLevelOneFeatures(talent.featuresByLevel, 'Talent');
	requiredCanonicalEnglish[elementFieldIdentity(talent.id, 'subclassName')] = talent.subclassName;

	addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, talentLevelOneFeatures);

	// The bounded walk supplies a Heroic Resource's name and gain triggers. Clarity's `details`
	// is the remaining player-facing reading FeaturePanel renders for it, so it is required here
	// explicitly rather than by widening the shared walk for every class.
	const clarity = talentLevelOneFeatures.find(feature => feature.id === 'talent-resource');
	if (clarity?.type !== FeatureType.HeroicResource) {
		throw new Error('Talent Clarity resource is missing');
	}
	const clarityDetailsIdentity = elementFieldIdentity(clarity.id, 'details');
	if (requiredCanonicalEnglish[clarityDetailsIdentity] !== undefined) {
		throw new Error(`duplicate localization identity '${clarityDetailsIdentity}'`);
	}
	requiredCanonicalEnglish[clarityDetailsIdentity] = clarity.data.details;

	getV1TalentTraditions().forEach(tradition => {
		addRequiredElementFields(requiredCanonicalEnglish, tradition);
		const traditionLevelOneFeatures = getLevelOneFeatures(tradition.featuresByLevel, `Talent Tradition '${tradition.id}'`);
		addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, traditionLevelOneFeatures);
		traditionLevelOneFeatures
			.filter((feature): feature is FeatureAbility => feature.type === FeatureType.Ability)
			.forEach(feature => addRequiredAbilityFields(requiredCanonicalEnglish, feature.data.ability));
	});

	return requiredCanonicalEnglish;
};

/**
 * The exact approved Troubadour Level 1 base-class ability slice: the two direct Level 1
 * Performance abilities plus the signature, cost 3 and cost 5 class abilities 55-66. Abilities
 * 67+, later levels and the Class Act subclasses stay unresolved.
 */
export const v1TroubadourLevel1AbilityIDs = [
	'troubadour-10',
	'troubadour-11',
	'troubadour-55',
	'troubadour-56',
	'troubadour-57',
	'troubadour-58',
	'troubadour-59',
	'troubadour-60',
	'troubadour-61',
	'troubadour-62',
	'troubadour-63',
	'troubadour-64',
	'troubadour-65',
	'troubadour-66'
] as const;

const isTroubadourLevel1FeatureAbility = (feature: Feature): feature is FeatureAbility => feature.type === FeatureType.Ability;

/** Enumerates only Troubadour's two direct Level 1 Performance abilities and abilities 55-66. */
export const getV1TroubadourLevel1Abilities = (): Ability[] => {
	const levelOne = troubadour.featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error('Troubadour Level 1 features are missing');
	}

	const abilities = [
		...levelOne.features.filter(isTroubadourLevel1FeatureAbility).map(feature => feature.data.ability),
		...troubadour.abilities
	];
	const abilitiesByID = new Map(abilities.map(ability => [ ability.id, ability ]));

	return v1TroubadourLevel1AbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Troubadour Level 1 ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Builds the bounded 89-identity Troubadour Level 1 denominator from live canonical data. */
export const createV1TroubadourLevel1AbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1TroubadourLevel1Abilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/** The three Class Acts; later Class Act levels remain outside this Level 1 slice. */
export const v1TroubadourClassActIDs = [
	'troubadour-auteur',
	'troubadour-duelist',
	'troubadour-virtuoso'
] as const;

export const getV1TroubadourClassActs = (): SubClass[] => {
	const classActsByID = new Map(troubadour.subclasses.map(classAct => [ classAct.id, classAct ]));
	return v1TroubadourClassActIDs.map(id => {
		const classAct = classActsByID.get(id);
		if (!classAct) {
			throw new Error(`Troubadour Class Act '${id}' is missing`);
		}
		return classAct;
	});
};

/**
 * Collects the Ability nodes a Class Act's Level 1 Feature list carries, following the same
 * bounded descent the shared non-Ability walk uses: a Choice only through its options' own
 * Features and a Multiple only through its child Features. Virtuoso authors its two
 * performance abilities inside the `troubadour-virtuoso-3` Multiple rather than at the top
 * level, so a top-level-only filter would silently drop them.
 */
const collectBoundedLevel1Abilities = (features: Feature[], abilities: Ability[] = []): Ability[] => {
	features.forEach(feature => {
		switch (feature.type) {
			case FeatureType.Ability:
				abilities.push(feature.data.ability);
				break;
			case FeatureType.Choice:
				collectBoundedLevel1Abilities(feature.data.options.map(option => option.feature), abilities);
				break;
			case FeatureType.Multiple:
				collectBoundedLevel1Abilities(feature.data.features, abilities);
				break;
		}
	});

	return abilities;
};

/**
 * Builds the bounded 94-identity Troubadour Level 1 completion denominator: the base class's
 * remaining non-Ability fields plus Drama's details, and each Class Act's metadata, Level 1
 * non-Ability content and Level 1 authored Ability content. The existing 89-identity base
 * Ability slice stays separate, and these two slices do not overlap.
 *
 * The whole base Level 1 feature tree goes through the one shared bounded walk, with no
 * per-feature exception: the two direct Performance abilities (`troubadour-10`,
 * `troubadour-11`) belong to the base Ability slice and are neither counted nor walked here.
 */
export const createV1TroubadourLevel1CompletionRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	const troubadourLevelOneFeatures = getLevelOneFeatures(troubadour.featuresByLevel, 'Troubadour');
	requiredCanonicalEnglish[elementFieldIdentity(troubadour.id, 'subclassName')] = troubadour.subclassName;

	addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, troubadourLevelOneFeatures);

	// The bounded walk supplies a Heroic Resource's name and gain triggers. Drama's `details`
	// is the remaining player-facing reading FeaturePanel renders for it, so it is required here
	// explicitly rather than by widening the shared walk for every class.
	const drama = troubadourLevelOneFeatures.find(feature => feature.id === 'troubadour-6');
	if (drama?.type !== FeatureType.HeroicResource) {
		throw new Error('Troubadour Drama resource is missing');
	}
	const dramaDetailsIdentity = elementFieldIdentity(drama.id, 'details');
	if (requiredCanonicalEnglish[dramaDetailsIdentity] !== undefined) {
		throw new Error(`duplicate localization identity '${dramaDetailsIdentity}'`);
	}
	requiredCanonicalEnglish[dramaDetailsIdentity] = drama.data.details;

	getV1TroubadourClassActs().forEach(classAct => {
		addRequiredElementFields(requiredCanonicalEnglish, classAct);
		const classActLevelOneFeatures = getLevelOneFeatures(classAct.featuresByLevel, `Troubadour Class Act '${classAct.id}'`);
		addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, classActLevelOneFeatures);
		collectBoundedLevel1Abilities(classActLevelOneFeatures)
			.forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	});

	return requiredCanonicalEnglish;
};

export const v1ElementalistSubclassIDs = [
	'elementalist-sub-1',
	'elementalist-sub-2',
	'elementalist-sub-3',
	'elementalist-sub-4'
] as const;

export const getV1ElementalistSubclasses = (): SubClass[] => {
	const subclassesByID = new Map(elementalist.subclasses.map(subclass => [ subclass.id, subclass ]));
	return v1ElementalistSubclassIDs.map(id => {
		const subclass = subclassesByID.get(id);
		if (!subclass) {
			throw new Error(`Elementalist subclass '${id}' is missing`);
		}
		return subclass;
	});
};

/**
 * Builds the bounded 59-identity Elementalist Level 1 subclass completion denominator: the
 * class's `subclassName` category plus each of the four elements' own metadata, Level 1
 * non-Ability content and Level 1 authored Ability content.
 *
 * The base class is deliberately untouched. Elementalist's Level 1 base content already has
 * two merged, independently tested slices - the frozen 133-identity Ability slice and the
 * 44-identity non-Ability remaining slice - so this one only adds the subclass content the
 * batch is for. All three stay disjoint.
 *
 * Unlike the Null subclass completion, which is non-Ability only, this slice follows the
 * Shadow/Tactician/Talent/Troubadour completion boundary and includes each element's Level 1
 * authored Ability content: an element's own two or three signature abilities are the player-
 * facing content that choosing it grants, and they belong to no other slice.
 *
 * Each element's Level 1 tree goes through the one shared bounded non-Ability walk and the
 * same bounded Ability collector, with no per-feature exception. Nothing is descended into
 * beyond a Choice's options and a Multiple's children, so this stays a reviewable slice
 * rather than a generic subclass crawler.
 */
export const createV1ElementalistLevel1SubclassCompletionRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	requiredCanonicalEnglish[elementFieldIdentity(elementalist.id, 'subclassName')] = elementalist.subclassName;

	getV1ElementalistSubclasses().forEach(subclass => {
		addRequiredElementFields(requiredCanonicalEnglish, subclass);
		const levelOneFeatures = getLevelOneFeatures(subclass.featuresByLevel, `Elementalist subclass '${subclass.id}'`);
		addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, levelOneFeatures);
		collectBoundedLevel1Abilities(levelOneFeatures)
			.forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	});

	return requiredCanonicalEnglish;
};

export const v1FurySubclassIDs = [
	'fury-sub-1',
	'fury-sub-2',
	'fury-sub-3'
] as const;

/** Enumerates only Fury's three Primordial Aspects, in their canonical order. */
export const getV1FurySubclasses = (): SubClass[] => {
	const subclassesByID = new Map(fury.subclasses.map(subclass => [ subclass.id, subclass ]));
	return v1FurySubclassIDs.map(id => {
		const subclass = subclassesByID.get(id);
		if (!subclass) {
			throw new Error(`Fury subclass '${id}' is missing`);
		}
		return subclass;
	});
};

/**
 * Builds the bounded 49-identity Fury Level 1 subclass completion denominator: the class's
 * `subclassName` category plus each of the three Primordial Aspects' own metadata, Level 1
 * non-Ability content and Level 1 authored Ability content.
 *
 * The base class is deliberately untouched. Fury's Level 1 base content already has two
 * merged, independently tested slices - the 80-identity Ability slice and the 15-identity
 * non-Ability remaining slice - so this one only adds the subclass content the batch is for.
 * All three stay disjoint.
 *
 * Each Aspect's Level 1 tree goes through the one shared bounded non-Ability walk and the
 * same bounded Ability collector, with no per-Aspect exception. Nothing is descended into
 * beyond a Choice's options and a Multiple's children, so this stays a reviewable slice
 * rather than a generic subclass crawler.
 *
 * Stormwight's four kits (Boren, Corven, Raden, Vuken) are Level 2 content and so fall
 * outside this Level 1 slice by the bound itself, not by a class-specific exclusion. Its
 * Level 1 `Beast Shape` kit choice contributes only its own name, exactly as the shared
 * walk treats every other kit choice.
 */
export const createV1FuryLevel1SubclassCompletionRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	requiredCanonicalEnglish[elementFieldIdentity(fury.id, 'subclassName')] = fury.subclassName;

	getV1FurySubclasses().forEach(subclass => {
		addRequiredElementFields(requiredCanonicalEnglish, subclass);
		const levelOneFeatures = getLevelOneFeatures(subclass.featuresByLevel, `Fury subclass '${subclass.id}'`);
		addRequiredBoundedNonAbilityFeatureFields(requiredCanonicalEnglish, levelOneFeatures);
		collectBoundedLevel1Abilities(levelOneFeatures)
			.forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	});

	return requiredCanonicalEnglish;
};

/** The exact approved Orden ancestry Ability slice; all other ancestry Ability content remains unresolved. */
export const v1OrdenAncestryAbilityIDs = [
	'memonek-feature-3-5',
	'time-raider-feature-2-1',
	'time-raider-feature-2-2b',
	'time-raider-feature-2-5-1',
	'time-raider-feature-2-5-2',
	'time-raider-feature-2-5-3'
] as const;

const collectAncestryAbilities = (features: Feature[], abilities: Ability[] = []): Ability[] => {
	features.forEach(feature => {
		if (feature.type === FeatureType.Ability) {
			abilities.push(feature.data.ability);
			return;
		}

		if (feature.type === FeatureType.Choice) {
			collectAncestryAbilities(feature.data.options.map(option => option.feature), abilities);
		}

		if (feature.type === FeatureType.Multiple) {
			collectAncestryAbilities(feature.data.features, abilities);
		}
	});

	return abilities;
};

/** Enumerates only the six approved nested Memonek and Time Raider Ability nodes. */
export const getV1OrdenAncestryAbilities = (): Ability[] => {
	const abilitiesByID = new Map(collectAncestryAbilities([ ...memonek.features, ...timeRaider.features ]).map(ability => [ ability.id, ability ]));

	return v1OrdenAncestryAbilityIDs.map(id => {
		const ability = abilitiesByID.get(id);
		if (!ability) {
			throw new Error(`Orden ancestry ability '${id}' is missing`);
		}
		return ability;
	});
};

/** Builds the bounded 28-identity Orden ancestry Ability denominator from live canonical data. */
export const createV1OrdenAncestryAbilityRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1OrdenAncestryAbilities().forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/**
 * The exact approved Core standard Kit slice. The four Stormwight Kits (Boren, Corven,
 * Raden, Vuken) carry a Kit type and their own animal-form content, and stay outside this
 * batch.
 */
export const v1CoreStandardKitIDs = [
	'kit-arcane-archer',
	'kit-battlemind',
	'kit-cloak-and-dagger',
	'kit-dual-wielder',
	'kit-guisarmier',
	'kit-martial-artist',
	'kit-mountain',
	'kit-panther',
	'kit-pugilist',
	'kit-raider',
	'kit-ranger',
	'kit-rapid-fire',
	'kit-retiarius',
	'kit-shining-armor',
	'kit-sniper',
	'kit-spellsword',
	'kit-stick-and-robe',
	'kit-swashbuckler',
	'kit-sword-and-board',
	'kit-warrior-priest',
	'kit-whirlwind'
] as const;

const isKitSignatureFeatureAbility = (feature: Feature): feature is FeatureAbility => feature.type === FeatureType.Ability;

/**
 * Enumerates only the 21 standard Kits named above, read from the same Core Kit list every
 * other Kit call site already draws from. The ID list is the bound: a Kit that is not named
 * here is never reached, and no arbitrary Sourcebook content is traversed.
 */
export const getV1CoreStandardKits = (sourcebooks: Sourcebook[]): Kit[] => {
	const kitsByID = new Map(SourcebookLogic.getKits(sourcebooks.filter(isV1HeroCreationSourcebook)).map(kit => [ kit.id, kit ]));

	return v1CoreStandardKitIDs.map(id => {
		const kit = kitsByID.get(id);
		if (!kit) {
			throw new Error(`Core standard Kit '${id}' is missing`);
		}
		return kit;
	});
};

/** The one signature Ability each standard Kit grants, taken from that Kit's own top-level features. */
export const getV1CoreStandardKitSignatureAbilities = (sourcebooks: Sourcebook[]): Ability[] => {
	return getV1CoreStandardKits(sourcebooks).flatMap(kit => kit.features.filter(isKitSignatureFeatureAbility).map(feature => feature.data.ability));
};

/**
 * Builds the bounded 181-identity Core standard Kit denominator from live canonical data:
 * 42 Kit name/description fields plus the 139 authored fields of their signature Abilities.
 */
export const createV1CoreStandardKitRequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};
	getV1CoreStandardKits(sourcebooks).forEach(kit => addRequiredElementFields(requiredCanonicalEnglish, kit));
	getV1CoreStandardKitSignatureAbilities(sourcebooks).forEach(ability => addRequiredAbilityFields(requiredCanonicalEnglish, ability));
	return requiredCanonicalEnglish;
};

/**
 * The four Stormwight Kits a Fury's Level 1 Beast Shape choice selects from. They are
 * deliberately kept out of `v1CoreStandardKitIDs`: a standard Kit is chosen by a Kit-using
 * class, while these four are Stormwight-only content with their own approved slice, and the
 * two denominators stay disjoint.
 */
export const v1StormwightKitIDs = [
	'kit-boren',
	'kit-corven',
	'kit-raden',
	'kit-vuken'
] as const;

/**
 * Enumerates only the four Stormwight Kits named above, read from the same Core Kit list
 * every other Kit call site already draws from. The ID list is the bound: a Kit that is not
 * named here is never reached, and no arbitrary Sourcebook content is traversed.
 */
export const getV1StormwightKits = (sourcebooks: Sourcebook[]): Kit[] => {
	const kitsByID = new Map(SourcebookLogic.getKits(sourcebooks.filter(isV1HeroCreationSourcebook)).map(kit => [ kit.id, kit ]));

	return v1StormwightKitIDs.map(id => {
		const kit = kitsByID.get(id);
		if (!kit) {
			throw new Error(`Stormwight Kit '${id}' is missing`);
		}
		return kit;
	});
};

/**
 * Builds the bounded 74-identity Stormwight Kit denominator from live canonical data: each
 * Kit's own name/description pair, the five direct non-Ability Features it grants, and the
 * authored fields of its one signature Ability.
 *
 * A Stormwight Kit's `features` array is walked one level only, exactly as the standard Kit
 * slice reads its signature Ability. A Feature that carries an Ability contributes that
 * Ability's authored fields; every other Feature contributes its own name and description.
 * Nothing nested inside a Feature is descended into, so this stays a reviewable slice rather
 * than a recursive Kit crawler.
 *
 * A `Growing Ferocity` description is one canonical field even though its Markdown bullets
 * mention later levels, so it is required whole rather than sliced by level.
 */
export const createV1StormwightKitRequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};

	getV1StormwightKits(sourcebooks).forEach(kit => {
		addRequiredElementFields(requiredCanonicalEnglish, kit);
		kit.features.forEach(feature => {
			if (isKitSignatureFeatureAbility(feature)) {
				addRequiredAbilityFields(requiredCanonicalEnglish, feature.data.ability);
				return;
			}
			addRequiredElementFields(requiredCanonicalEnglish, feature);
		});
	});

	return requiredCanonicalEnglish;
};

/**
 * The exact approved Core Domain slice: the 12 Core Domains a Conduit chooses from. Only
 * Levels 1-3 are in this batch; Levels 4-10 stay outside it.
 */
export const v1CoreDomainIDs = [
	'domain-creation',
	'domain-death',
	'domain-fate',
	'domain-knowledge',
	'domain-life',
	'domain-love',
	'domain-nature',
	'domain-protection',
	'domain-storm',
	'domain-sun',
	'domain-trickery',
	'domain-war'
] as const;

/** The Domain levels this batch covers. Level 3 authors no content in any of the 12 Domains. */
export const v1CoreDomainLevels = [ 1, 2, 3 ];

/**
 * Enumerates only the 12 Core Domains named above, read from the same Domain list every other
 * Domain call site already draws from. The ID list is the bound: a Domain that is not named
 * here is never reached, and no arbitrary Sourcebook content is traversed.
 */
export const getV1CoreDomains = (sourcebooks: Sourcebook[]): Domain[] => {
	const domainsByID = new Map(SourcebookLogic.getDomains(sourcebooks.filter(isV1HeroCreationSourcebook)).map(domain => [ domain.id, domain ]));

	return v1CoreDomainIDs.map(id => {
		const domain = domainsByID.get(id);
		if (!domain) {
			throw new Error(`Core Domain '${id}' is missing`);
		}
		return domain;
	});
};

/**
 * Adds the player-facing fields of one Domain Feature node.
 *
 * An Ability node contributes its ability's authored content. Every other node contributes its
 * own name and description, including the two whose readings FactoryLogic composes rather than
 * authors: a Multiple container, whose name and description are both built from its children's
 * names, and a SkillChoice, whose label and prompt are built from the Skill lists it offers.
 * Both are shown to the player, so both need a reading of their own.
 *
 * A Multiple is the only node descended into. A SkillChoice's Skills are not walked: they
 * already belong to the Skill denominator, addressed by their own names.
 */
const addRequiredDomainFeatureFields = (requiredCanonicalEnglish: CanonicalEnglishSource, feature: Feature) => {
	if (feature.type === FeatureType.Ability) {
		addRequiredAbilityFields(requiredCanonicalEnglish, feature.data.ability);
		return;
	}

	addRequiredElementFields(requiredCanonicalEnglish, feature);

	if (feature.type === FeatureType.Multiple) {
		feature.data.features.forEach(child => addRequiredDomainFeatureFields(requiredCanonicalEnglish, child));
	}
};

/**
 * Builds the bounded 195-identity Core Domain Level 1-3 denominator from live canonical data:
 * 24 Domain name/description fields, the player-facing content of their Level 1-3 Features
 * (including the 24 Level 1 container fields and the 24 Skill-choice fields), the 12 Piety
 * resource-gain triggers and the 24 default prayer Feature fields.
 */
export const createV1CoreDomainLevel1To3RequiredCanonicalEnglish = (sourcebooks: Sourcebook[]): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};

	getV1CoreDomains(sourcebooks).forEach(domain => {
		addRequiredElementFields(requiredCanonicalEnglish, domain);

		domain.featuresByLevel
			.filter(level => v1CoreDomainLevels.includes(level.level))
			.forEach(level => level.features.forEach(feature => addRequiredDomainFeatureFields(requiredCanonicalEnglish, feature)));

		// The trigger is the only player-facing prose a resource gain carries; its resource and
		// tag are canonical identifiers the Conduit's own resource wiring reads.
		domain.resourceGains.forEach((gain, index) => {
			if (gain.trigger === '') {
				return;
			}

			const identity = elementFieldIdentity(domain.id, `resourceGains.${index}.trigger`);
			if (requiredCanonicalEnglish[identity] !== undefined) {
				throw new Error(`duplicate localization identity '${identity}'`);
			}
			requiredCanonicalEnglish[identity] = gain.trigger;
		});

		domain.defaultFeatures.forEach(feature => addRequiredDomainFeatureFields(requiredCanonicalEnglish, feature));
	});

	return requiredCanonicalEnglish;
};

/** The three Censor Orders. Their Level 2+ content stays outside this batch. */
export const v1CensorOrderIDs = [
	'censor-sub-1',
	'censor-sub-2',
	'censor-sub-3'
] as const;

/**
 * Adds the player-facing fields of one Censor or Order Feature node.
 *
 * An Ability node contributes nothing here: Censor's Level 1 authored Ability content is
 * already enumerated by its own slice above, and an Order's Abilities belong to Levels 2+.
 * Every other node contributes its own name and description, including the ones FactoryLogic
 * labels rather than authors - the Bonus, SkillChoice, DomainChoice, KitChoice, DomainFeature
 * and ClassAbilityChoice Features a player sees on the class page. A heroic resource also
 * contributes the trigger of each way it is gained; its tag and value are canonical wiring the
 * Hero's own resource calculation reads, and are not display text.
 *
 * Nothing is descended into: Censor Level 1 has no nested container Feature.
 */
const addRequiredCensorFeatureFields = (requiredCanonicalEnglish: CanonicalEnglishSource, feature: Feature) => {
	if (feature.type === FeatureType.Ability) {
		return;
	}

	addRequiredElementFields(requiredCanonicalEnglish, feature);

	if (feature.type === FeatureType.HeroicResource) {
		feature.data.gains.forEach((gain, index) => {
			if (gain.trigger === '') {
				return;
			}

			const identity = elementFieldIdentity(feature.id, `gains.${index}.trigger`);
			if (requiredCanonicalEnglish[identity] !== undefined) {
				throw new Error(`duplicate localization identity '${identity}'`);
			}
			requiredCanonicalEnglish[identity] = gain.trigger;
		});
	}
};

/** The Level 1 features of the three Orders, read from the explicit Order ID list. */
export const getV1CensorOrders = (): SubClass[] => {
	const subclassesByID = new Map(censor.subclasses.map(subclass => [ subclass.id, subclass ]));

	return v1CensorOrderIDs.map(id => {
		const subclass = subclassesByID.get(id);
		if (!subclass) {
			throw new Error(`Censor Order '${id}' is missing`);
		}
		return subclass;
	});
};

const getLevelOneFeatures = (featuresByLevel: { level: number, features: Feature[] }[], owner: string) => {
	const levelOne = featuresByLevel.find(level => level.level === 1);
	if (!levelOne) {
		throw new Error(`${owner} Level 1 features are missing`);
	}
	return levelOne.features;
};

/**
 * Builds the bounded 34-identity Censor Level 1 + Order denominator from live canonical data:
 * the Censor's own subclass-category name, the player-facing fields of its Level 1 non-Ability
 * Features including the three Wrath gain triggers, and each Order's name, description and
 * Level 1 Features. Only Level 1 and only these three Orders are reached, so this stays a
 * bounded, reviewable slice rather than a recursive class/subclass crawler.
 */
export const createV1CensorLevel1AndOrderRequiredCanonicalEnglish = (): CanonicalEnglishSource => {
	const requiredCanonicalEnglish: CanonicalEnglishSource = {};

	// The category a Censor's subclasses are called by. The class's own name and description
	// already belong to the Hero creation denominator; only this field is added here.
	requiredCanonicalEnglish[elementFieldIdentity(censor.id, 'subclassName')] = censor.subclassName;

	getLevelOneFeatures(censor.featuresByLevel, 'Censor').forEach(feature => addRequiredCensorFeatureFields(requiredCanonicalEnglish, feature));

	getV1CensorOrders().forEach(order => {
		addRequiredElementFields(requiredCanonicalEnglish, order);
		getLevelOneFeatures(order.featuresByLevel, `Censor Order '${order.id}'`).forEach(feature => addRequiredCensorFeatureFields(requiredCanonicalEnglish, feature));
	});

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
		...createV1LanguageRequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1CensorLevel1AbilityRequiredCanonicalEnglish(),
		...createV1ConduitLevel1AbilityRequiredCanonicalEnglish(),
		...createV1ConduitLevel1RemainingRequiredCanonicalEnglish(),
		...createV1ConduitLevel2RequiredCanonicalEnglish(),
		...createV1ElementalistLevel1AbilityRequiredCanonicalEnglish(),
		...createV1ElementalistLevel1RemainingRequiredCanonicalEnglish(),
		...createV1ElementalistLevel1SubclassCompletionRequiredCanonicalEnglish(),
		...createV1NullLevel1AbilityRequiredCanonicalEnglish(),
		...createV1NullLevel1RemainingRequiredCanonicalEnglish(),
		...createV1NullLevel1SubclassCompletionRequiredCanonicalEnglish(),
		...createV1FuryLevel1AbilityRequiredCanonicalEnglish(),
		...createV1FuryLevel1RemainingRequiredCanonicalEnglish(),
		...createV1FuryLevel1SubclassCompletionRequiredCanonicalEnglish(),
		...createV1ShadowLevel1AbilityRequiredCanonicalEnglish(),
		...createV1ShadowLevel1CompletionRequiredCanonicalEnglish(),
		...createV1TacticianLevel1AbilityRequiredCanonicalEnglish(),
		...createV1TacticianLevel1CompletionRequiredCanonicalEnglish(),
		...createV1TalentLevel1AbilityRequiredCanonicalEnglish(),
		...createV1TalentLevel1CompletionRequiredCanonicalEnglish(),
		...createV1TroubadourLevel1AbilityRequiredCanonicalEnglish(),
		...createV1TroubadourLevel1CompletionRequiredCanonicalEnglish(),
		...createV1OrdenAncestryAbilityRequiredCanonicalEnglish(),
		...createV1CoreStandardKitRequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1StormwightKitRequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1CoreDomainLevel1To3RequiredCanonicalEnglish(v1HeroCreationSourcebooks),
		...createV1CensorLevel1AndOrderRequiredCanonicalEnglish()
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
