import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';

const careerPerkNames = new Set([
	'Crafting Perk',
	'Exploration Perk',
	'Interpersonal Perk',
	'Intrigue Perk',
	'Lore Perk',
	'Supernatural Perk'
]);

/**
 * Career perk labels and their default description are translated only when
 * the exact feature is still present in an official career sourcebook.
 */
const getOfficialCareerPerkName = (feature: Feature, sourcebooks: Sourcebook[]) => {
	if (feature.type !== FeatureType.Perk) {
		return undefined;
	}

	const sourceFeature = sourcebooks
		.filter(sourcebook => sourcebook.type === SourcebookType.Official)
		.flatMap(sourcebook => sourcebook.careers)
		.flatMap(career => career.features)
		.find(candidate => candidate.id === feature.id);

	if (!sourceFeature || sourceFeature.type !== FeatureType.Perk
		|| sourceFeature.name !== feature.name
		|| sourceFeature.description !== feature.description
		|| sourceFeature.data.count !== feature.data.count
		|| sourceFeature.data.lists.length !== feature.data.lists.length
		|| sourceFeature.data.lists.some((list, index) => list !== feature.data.lists[index])) {
		return undefined;
	}

	return careerPerkNames.has(sourceFeature.name) ? sourceFeature.name : undefined;
};

export const careerPerkName = (feature: Feature, sourcebooks: Sourcebook[]) => getOfficialCareerPerkName(feature, sourcebooks);

export const isSingleCareerPerk = (feature: Feature, sourcebooks: Sourcebook[]) => {
	return !!getOfficialCareerPerkName(feature, sourcebooks)
		&& feature.type === FeatureType.Perk
		&& feature.data.count === 1
		&& feature.data.lists.length === 1
		&& feature.description === '';
};
