import { useL10nText, useLanguage } from '@/l10n/hooks';
import { Culture } from '@/models/culture';
import { Feature } from '@/models/feature';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { playerNameKey } from '@/l10n/player-name';

export interface PlayerCultureSummaryParts {
	environment: Feature;
	organization: Feature;
	upbringing: Feature;
}

export const formatPlayerCultureSummary = (
	description: string,
	parts: PlayerCultureSummaryParts | undefined,
	names: { environment: string, organization: string, upbringing: string },
	language: string
) => {
	if (!parts || language === 'en') {
		return description;
	}
	return `${names.environment}、${names.organization}、${names.upbringing}。`;
};

/** Returns parts only when this remains the exact, canonical summary of an official culture. */
export const getPlayerCultureSummaryParts = (culture: Culture, sourcebooks: Sourcebook[]): PlayerCultureSummaryParts | undefined => {
	const officialSourcebooks = sourcebooks.filter(sourcebook => sourcebook.type === SourcebookType.Official);
	const canonical = SourcebookLogic.getCultures(officialSourcebooks, true).find(item => item.id === culture.id);
	if (!canonical || canonical.name !== culture.name || canonical.description !== culture.description) {
		return undefined;
	}

	const { environment, organization, upbringing } = culture;
	if (!environment || !organization || !upbringing) {
		return undefined;
	}
	const parts: PlayerCultureSummaryParts = { environment, organization, upbringing };

	const { environment: canonicalEnvironment, organization: canonicalOrganization, upbringing: canonicalUpbringing } = canonical;
	if (!canonicalEnvironment || !canonicalOrganization || !canonicalUpbringing) {
		return undefined;
	}
	const canonicalParts: PlayerCultureSummaryParts = {
		environment: canonicalEnvironment,
		organization: canonicalOrganization,
		upbringing: canonicalUpbringing
	};

	const keysMatch = (key: keyof PlayerCultureSummaryParts) => {
		const actual = parts[key];
		const expected = canonicalParts[key];
		return actual.id === expected.id
			&& actual.name === expected.name
			&& playerNameKey(actual, officialSourcebooks) === `element:${actual.id}:name`;
	};
	if (!(Object.keys(parts) as (keyof PlayerCultureSummaryParts)[]).every(keysMatch)) {
		return undefined;
	}

	const expectedDescription = `${parts.environment.name}, ${parts.organization.name}, ${parts.upbringing.name}.`;
	return culture.description.toLowerCase() === expectedDescription.toLowerCase() ? parts : undefined;
};

export const usePlayerCultureSummary = (culture: Culture, sourcebooks: Sourcebook[]) => {
	const parts = getPlayerCultureSummaryParts(culture, sourcebooks);
	const officialSourcebooks = sourcebooks.filter(sourcebook => sourcebook.type === SourcebookType.Official);
	const environment = useL10nText(parts ? playerNameKey(parts.environment, officialSourcebooks) : undefined, parts?.environment.name || '');
	const organization = useL10nText(parts ? playerNameKey(parts.organization, officialSourcebooks) : undefined, parts?.organization.name || '');
	const upbringing = useL10nText(parts ? playerNameKey(parts.upbringing, officialSourcebooks) : undefined, parts?.upbringing.name || '');
	const { language } = useLanguage();

	return formatPlayerCultureSummary(culture.description, parts, { environment, organization, upbringing }, language);
};
