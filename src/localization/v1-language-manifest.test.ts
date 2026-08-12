/* eslint-disable sort-imports */

import {
	createV1LanguageRequiredCanonicalEnglish,
	getV1LanguageElements,
	v1HeroCreationSourcebooks,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { languageFieldIdentity } from '@/localization/catalog';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { describe, expect, it } from 'vitest';

const getTargetSourcebooks = () => v1HeroCreationSourcebooks;

describe('V1 Language manifest', () => {
	it('enumerates exactly 42 unique V1 Languages, drawn from the live Core/Orden/Beastheart/Summoner sourcebook data', () => {
		const languages = getV1LanguageElements(getTargetSourcebooks());

		expect(languages).toHaveLength(42);
		expect(new Set(languages.map(l => l.name)).size).toBe(42);

		// Matches SourcebookLogic.getLanguages over the same target sourcebooks - no
		// separate enumeration logic is introduced for this denominator.
		expect(languages).toEqual(SourcebookLogic.getLanguages(getTargetSourcebooks()));
	});

	it('requires every Language name, and description only when non-empty, using live runtime canonical text - 42 names + 42 descriptions = 84 identities', () => {
		const languages = getV1LanguageElements(getTargetSourcebooks());
		const required = createV1LanguageRequiredCanonicalEnglish(getTargetSourcebooks());

		expect(Object.keys(required)).toHaveLength(84);

		let descriptionCount = 0;
		languages.forEach(language => {
			expect(required[languageFieldIdentity(language.name, 'name')]).toBe(language.name);
			if (language.description !== '') {
				descriptionCount++;
				expect(required[languageFieldIdentity(language.name, 'description')]).toBe(language.description);
			}
		});
		expect(descriptionCount).toBe(42);
	});

	it('takes canonical English from the real Orden sourcebook Language data, e.g. Caelian, Proto-Ctholl and Tholl', () => {
		const required = createV1LanguageRequiredCanonicalEnglish(getTargetSourcebooks());

		expect(required[languageFieldIdentity('Caelian', 'name')]).toBe('Caelian');
		expect(required[languageFieldIdentity('Caelian', 'description')]).toBe('The language of the ancient Caelian Empire; the common tongue of Orden.');
		expect(required[languageFieldIdentity('Proto-Ctholl', 'description')]).toBe('Spoken by demons; an incomplete offshoot of Tholl.');
		expect(required[languageFieldIdentity('Tholl', 'description')]).toBe('Spoken by gnolls.');
	});

	it('is merged into the production V1 manifest without displacing the pre-existing denominator', () => {
		const required = v1LocalizationManifest.requiredCanonicalEnglish;

		expect(required[languageFieldIdentity('Caelian', 'name')]).toBe('Caelian');
		// A representative pre-existing identity from an earlier batch is still present.
		expect(required['skill:Alchemy/name']).toBe('Alchemy');
	});

	it('removes skills-and-languages now that both denominators are enumerated: 6 unresolved domains -> 5', () => {
		expect(v1LocalizationManifest.unresolvedDomains).toHaveLength(5);
		expect(v1LocalizationManifest.unresolvedDomains.map(domain => domain.id)).not.toContain('skills-and-languages');
		expect(v1LocalizationManifest.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([
			'hero-creation-nested-authored-content'
		]));
	});

	it('has approved catalog entries for all 84 required Language identities', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});
		const required = createV1LanguageRequiredCanonicalEnglish(getTargetSourcebooks());
		const identities = Object.keys(required);

		expect(identities).toHaveLength(84);
		identities.forEach(identity => {
			expect(result.missing).not.toContain(identity);
			expect(result.unapproved).not.toContain(identity);
		});
	});

	it('regression: preserves the Owner-reconfirmed Proto-Ctholl / Tholl readings exactly, without normalizing toward canonical English', () => {
		const protoCtholl = productionLocalizationEntries.find(e => (e.kind === 'language-field') && (e.languageName === 'Proto-Ctholl') && (e.field === 'name'));
		const protoCthollDesc = productionLocalizationEntries.find(e => (e.kind === 'language-field') && (e.languageName === 'Proto-Ctholl') && (e.field === 'description'));
		const tholl = productionLocalizationEntries.find(e => (e.kind === 'language-field') && (e.languageName === 'Tholl') && (e.field === 'name'));
		const thollDesc = productionLocalizationEntries.find(e => (e.kind === 'language-field') && (e.languageName === 'Tholl') && (e.field === 'description'));

		expect(protoCtholl?.zhTW).toBe('原墮語');
		expect(protoCthollDesc?.zhTW).toBe('低等惡魔的語言；墮語的不完整分支。');
		expect(tholl?.zhTW).toBe('墮語');
		expect(thollDesc?.zhTW).toBe('高等惡魔和鬣狗人的語言。');
	});

	it('leaves related[] as untouched canonical data, e.g. Khoursirian -> Khamish', () => {
		const languages = getV1LanguageElements(getTargetSourcebooks());
		const khoursirian = languages.find(l => l.name === 'Khoursirian')!;
		const kethaic = languages.find(l => l.name === 'Kethaic')!;

		expect(khoursirian.related).toEqual([ 'Khamish' ]);
		expect(kethaic.related).toEqual([ 'Caelian', 'Vastariax' ]);
	});

	it('raises requiredCount from 1008 to 1092, with zero missing, zero unapproved and zero catalog issues, and stays incomplete', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		expect(result.requiredCount).toBe(1092);
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains).toHaveLength(5);
		expect(result.complete).toBe(false);
	});
});
