/* eslint-disable sort-imports */

import { AbilityData } from '@/data/ability-data';
import { Ability } from '@/models/ability';
import {
	abilityDescriptionField,
	abilitySectionEffectField,
	abilitySectionNameField,
	abilitySectionRollField,
	abilitySectionTextField,
	abilityTriggerField,
	powerRollTierField
} from '@/localization/ability-field-path';
import { CanonicalEnglishSource, validateLocalizationCatalog } from '@/localization/catalog-validator';
import { elementFieldIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { describe, expect, it } from 'vitest';

// Reads the canonical English straight out of the ability data, at the same field paths the
// panels localize at. Comparing that against the catalog's snapshots is what turns an
// upstream rewording into a failing test rather than a stale reading on screen.
const readCanonicalEnglish = (ability: Ability): CanonicalEnglishSource => {
	const source: CanonicalEnglishSource = {};

	const record = (field: string, text: string) => {
		if (text !== '') {
			source[elementFieldIdentity(ability.id, field)] = text;
		}
	};

	record('name', ability.name);
	record('target', ability.target);
	record(abilityDescriptionField, ability.description);
	record(abilityTriggerField, ability.type.trigger);

	(ability.sections || []).forEach((section, index) => {
		switch (section.type) {
			case 'text':
				record(abilitySectionTextField(index), section.text);
				break;
			case 'field':
				record(abilitySectionNameField(index), section.name);
				record(abilitySectionEffectField(index), section.effect);
				break;
			case 'roll': {
				const rollField = abilitySectionRollField(index);
				record(powerRollTierField(rollField, 1), section.roll.tier1);
				record(powerRollTierField(rollField, 2), section.roll.tier2);
				record(powerRollTierField(rollField, 3), section.roll.tier3);
				break;
			}
		}
	});

	return source;
};

const canonicalEnglish = [ AbilityData.freeStrike, AbilityData.escapeGrab ]
	.reduce<CanonicalEnglishSource>((source, ability) => ({ ...source, ...readCanonicalEnglish(ability) }), {});

describe('ability authored content catalog', () => {
	it('still matches the canonical English the approved readings were written against', () => {
		expect(validateLocalizationCatalog(productionLocalizationEntries, canonicalEnglish)).toEqual([]);
	});

	it('addresses the approved readings by the ability ID and the field path the panels use', () => {
		expect(canonicalEnglish[elementFieldIdentity('free-strike', abilitySectionTextField(0))]).toBe('A creature can use this main action to make a free strike.');
		expect(canonicalEnglish[elementFieldIdentity('escape-grab', powerRollTierField(abilitySectionRollField(1), 1))]).toBe('No effect.');
	});

	it('reports the drift when the canonical English behind an approved reading changes', () => {
		const drifted = {
			...canonicalEnglish,
			[elementFieldIdentity('free-strike', abilitySectionTextField(0))]: 'A creature can use this main action to make a free strike, once.'
		};

		const issues = validateLocalizationCatalog(productionLocalizationEntries, drifted);

		expect(issues.map(issue => issue.code)).toEqual([ 'canonical-drift' ]);
		expect(issues[0].identity).toBe('element:free-strike/sections.0.text');
	});
});
