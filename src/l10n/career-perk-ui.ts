import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';
import { useUI } from '@/l10n/ui-text';

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

export const careerPerkNameText = (feature: Feature, sourcebooks: Sourcebook[], ui: ReturnType<typeof useUI>) => {
	const name = careerPerkName(feature, sourcebooks);
	if (!name) {
		return undefined;
	}

	switch (name) {
		case 'Crafting Perk': return ui.text('ui.hero-builder.crafting-perk.cc40cc14', 'Crafting Perk');
		case 'Exploration Perk': return ui.text('ui.hero-builder.exploration-perk.5091cd7a', 'Exploration Perk');
		case 'Interpersonal Perk': return ui.text('ui.hero-builder.interpersonal-perk.a44c4965', 'Interpersonal Perk');
		case 'Intrigue Perk': return ui.text('ui.hero-builder.intrigue-perk.9db0cc87', 'Intrigue Perk');
		case 'Lore Perk': return ui.text('ui.hero-builder.lore-perk.9eddcd07', 'Lore Perk');
		case 'Supernatural Perk': return ui.text('ui.hero-builder.supernatural-perk.a9143d55', 'Supernatural Perk');
	}
};

export const isSingleCareerPerk = (feature: Feature, sourcebooks: Sourcebook[]) => {
	return !!getOfficialCareerPerkName(feature, sourcebooks)
		&& feature.type === FeatureType.Perk
		&& feature.data.count === 1
		&& feature.data.lists.length === 1
		&& feature.description === '';
};
