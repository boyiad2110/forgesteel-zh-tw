import { describe, expect, test } from 'vitest';
import { AncestryData } from '@/data/ancestry-data';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { beastheartSourcebook } from '@/data/sourcebooks/official/beastheart';
import { core } from '@/data/sourcebooks/official/core';
import { getPlayerCultureSummaryParts } from '@/l10n/player-culture-summary';
import { orden } from '@/data/sourcebooks/official/orden';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';

const officialSourcebooks = [ core, orden, beastheartSourcebook, summonerSourcebook ];
const officialCultures = SourcebookLogic.getCultures(officialSourcebooks, true);

describe('player culture summaries', () => {
	test('recognizes all 27 approved official culture summaries and their three approved aspects', () => {
		const cultures = [ ...core.cultures, ...Object.values(AncestryData).map(ancestry => ancestry.culture).filter(culture => !!culture) ];
		const recognized = cultures.map(culture => getPlayerCultureSummaryParts(culture, officialSourcebooks));

		expect(cultures).toHaveLength(27);
		expect(cultures.filter((_, index) => !recognized[index]).map(culture => culture.name)).toEqual([]);
		expect(new Set(recognized.flatMap(parts => parts ? [ parts.environment.id, parts.organization.id, parts.upbringing.id ] : []))).toEqual(
			new Set([ 'env-nomadic', 'env-rural', 'env-secluded', 'env-urban', 'env-wilderness', 'org-bureaucratic', 'org-communal', 'up-academic', 'up-creative', 'up-labor', 'up-lawless', 'up-martial', 'up-noble' ])
		);
	});

	test('preserves renamed, edited, custom, and non-composition summaries', () => {
		const culture = officialCultures.find(item => item.name === 'Artisan Guild')!;
		expect(getPlayerCultureSummaryParts({ ...culture, name: 'My Guild' }, officialSourcebooks)).toBeUndefined();
		expect(getPlayerCultureSummaryParts({ ...culture, description: 'A user written summary.' }, officialSourcebooks)).toBeUndefined();
		expect(getPlayerCultureSummaryParts({ ...culture, id: 'homebrew-culture' }, officialSourcebooks)).toBeUndefined();
		const homebrew = { ...core, id: 'homebrew', type: SourcebookType.Homebrew } as Sourcebook;
		expect(getPlayerCultureSummaryParts(culture, [ homebrew ])).toBeUndefined();
	});
});
