import { EnvironmentData, OrganizationData, UpbringingData } from '@/data/culture-data';
import { AncestryData } from '@/data/ancestry-data';
import { describe, expect, test } from 'vitest';
import { FeatureType } from '@/enums/feature-type';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';
import { core } from '@/data/sourcebooks/official/core';
import { Feature } from '@/models/feature';
import { elementScopeFields } from '@/l10n/element-scope';
import { mapping } from '@/l10n/mapping';
import { playerNameKey } from '@/l10n/player-name';

const officialSourcebooks = [ core ];

describe('player name lookup', () => {
	test('recognizes the approved ancestry, feature, culture, and aspect names', () => {
		const ancestries = Object.values(AncestryData);
		const ancestryIds = new Set(ancestries.map(ancestry => ancestry.id));
		const ancestryFeatureIds = new Set<string>();
		const visit = (feature: Feature) => {
			ancestryFeatureIds.add(feature.id);
			if (feature.type === FeatureType.Choice) {
				feature.data.options.forEach(option => visit(option.feature));
			}
			if (feature.type === FeatureType.Multiple) {
				feature.data.features.forEach(visit);
			}
		};
		ancestries.forEach(ancestry => ancestry.features.forEach(visit));
		const cultures = [ ...core.cultures, ...ancestries.map(ancestry => ancestry.culture).filter(culture => culture !== undefined) ];
		const cultureIds = new Set(cultures.map(culture => culture.id));
		const aspects = cultures.flatMap(culture => [ culture.environment, culture.organization, culture.upbringing ]).filter(feature => feature !== null);
		const aspectIds = new Set(aspects.map(feature => feature.id));
		const approvedIds = (prefix: string) => Object.entries(mapping)
			.filter(([ , value ]) => value.sheetId.startsWith(prefix))
			.map(([ key ]) => key.slice('element:'.length, -':name'.length));

		expect(approvedIds('heroes.ancestries.').filter(id => ancestryIds.has(id))).toHaveLength(12);
		const ancestryFeatureIdsMapped = approvedIds('heroes.ancestries.').filter(id => ancestryFeatureIds.has(id));
		expect(new Set(ancestryFeatureIdsMapped)).toHaveLength(113);
		expect(approvedIds('heroes.background.culture.').filter(id => cultureIds.has(id))).toHaveLength(27);
		expect(approvedIds('heroes.background.culture.').filter(id => aspectIds.has(id))).toHaveLength(13);
	});

	test('keys only an unchanged official name and leaves edited or unknown names alone', () => {
		const ancestry = AncestryData.highElf;
		expect(playerNameKey(ancestry, officialSourcebooks)).toBe('element:ancestry-high-elf:name');
		expect(playerNameKey({ ...ancestry, name: 'My Elf' }, officialSourcebooks)).toBeUndefined();
		expect(playerNameKey({ id: 'homebrew-ancestry', name: 'Orc' }, officialSourcebooks)).toBeUndefined();
	});

	test('looks up cultures and their three aspects from official sourcebooks only', () => {
		const culture = core.cultures.find(c => c.name === 'Artisan Guild')!;
		expect(playerNameKey(culture, officialSourcebooks)).toBe('element:culture-artisan-guild:name');
		expect(playerNameKey(culture.environment!, officialSourcebooks)).toBe('element:env-urban:name');
		const aspects = [ ...EnvironmentData.getEnvironments(), ...OrganizationData.getOrganizations(), ...UpbringingData.getUpbringings() ];
		expect(aspects).toHaveLength(13);
		expect(aspects.every(aspect => playerNameKey(aspect, officialSourcebooks) === `element:${aspect.id}:name`)).toBe(true);
		const homebrew = { ...core, id: 'homebrew', type: SourcebookType.Homebrew, cultures: [ culture ] } as Sourcebook;
		expect(playerNameKey(culture, [ homebrew ])).toBeUndefined();
	});

	test('keeps a renamed mapped feature out of the surrounding name scope', () => {
		expect(elementScopeFields({ id: 'ancestry-high-elf', name: 'A custom elf', description: 'An approved description.' }, null, false))
			.toEqual([ { field: 'description', text: 'An approved description.' } ]);
	});
});
