import { Feature } from '@/models/feature';
import { FeatureField } from '@/enums/feature-field';
import { FeatureType } from '@/enums/feature-type';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';

const signature = (feature: Feature) => {
	const data = { ...feature.data } as Record<string, unknown>;
	delete data.selected;
	return JSON.stringify({ id: feature.id, name: feature.name, description: feature.description, type: feature.type, data });
};

const careerFeatureIndex = new WeakMap<Sourcebook[], Map<string, Set<string>>>();

const officialCareerFeatures = (sourcebooks: Sourcebook[]) => {
	const cached = careerFeatureIndex.get(sourcebooks);
	if (cached) {
		return cached;
	}

	const index = new Map<string, Set<string>>();
	sourcebooks
		.filter(sourcebook => sourcebook.type === SourcebookType.Official)
		.flatMap(sourcebook => sourcebook.careers)
		.flatMap(career => career.features)
		.forEach(feature => {
			const signatures = index.get(feature.id) || new Set<string>();
			signatures.add(signature(feature));
			index.set(feature.id, signatures);
		});
	careerFeatureIndex.set(sourcebooks, index);
	return index;
};

/** Return an approved glossary key only for an unchanged official Career bonus. */
export const careerBenefitFieldKey = (feature: Feature, sourcebooks: Sourcebook[]): string | undefined => {
	if (feature.type !== FeatureType.Bonus || !feature.id.startsWith('career-')
		|| !officialCareerFeatures(sourcebooks).get(feature.id)?.has(signature(feature))) {
		return undefined;
	}

	switch (feature.data.field) {
		case FeatureField.ProjectPoints: return 'enum:FeatureField:ProjectPoints';
		case FeatureField.Renown: return 'enum:FeatureField:Renown';
		case FeatureField.Wealth: return 'enum:FeatureField:Wealth';
		default: return undefined;
	}
};
