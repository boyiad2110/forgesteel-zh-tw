import { Feature, FeatureLanguageChoice, FeatureSkillChoice, isFeature } from '@/models/feature';
import { CultureData } from '@/data/culture-data';
import { AncestryData } from '@/data/ancestry-data';
import { Ancestry } from '@/models/ancestry';
import { FactoryFeatureLogic } from '@/logic/factory-feature-logic';
import { FeatureType } from '@/enums/feature-type';
import { LanguageType } from '@/enums/language-type';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';

const signature = (feature: Feature) => {
	const data = { ...feature.data } as Record<string, unknown>;
	delete data.selected;
	return JSON.stringify({ id: feature.id, name: feature.name, description: feature.description, type: feature.type, data });
};

const sourceIdentity = (feature: Feature) => {
	const data = { ...feature.data } as Record<string, unknown>;
	delete data.selected;
	return JSON.stringify({ id: feature.id, name: feature.name, type: feature.type, data });
};

const indexCache = new WeakMap<Sourcebook[], Map<string, Set<string>>>();
const ancestryIndexCache = new WeakMap<Sourcebook[], Map<string, Feature[]>>();

const officialFeatures = (sourcebooks: Sourcebook[]) => {
	const cached = indexCache.get(sourcebooks);
	if (cached) {
		return cached;
	}

	const index = new Map<string, Set<string>>();
	const seen = new WeakSet<object>();
	const visit = (value: unknown) => {
		if (!value || typeof value !== 'object' || seen.has(value)) {
			return;
		}
		seen.add(value);
		if (isFeature(value)) {
			const signatures = index.get(value.id) || new Set<string>();
			signatures.add(signature(value));
			index.set(value.id, signatures);
		}
		Object.values(value).forEach(visit);
	};

	sourcebooks
		.filter(sourcebook => sourcebook.type === SourcebookType.Official)
		.forEach(visit);
	// The built-in Bespoke Culture is created by the builder, outside sourcebooks.
	visit(CultureData.bespoke);
	indexCache.set(sourcebooks, index);
	return index;
};

/** Match immutable feature source fields against loaded official sourcebooks. */
export const isOfficialFeatureSource = (feature: Feature, sourcebooks: Sourcebook[]): boolean => {
	if (feature.type !== FeatureType.LanguageChoice && feature.type !== FeatureType.SkillChoice) {
		return false;
	}
	return officialFeatures(sourcebooks).get(feature.id)?.has(signature(feature)) === true;
};

const officialAncestryFeatures = (sourcebooks: Sourcebook[]) => {
	const cached = ancestryIndexCache.get(sourcebooks);
	if (cached) {
		return cached;
	}

	const index = new Map<string, Feature[]>();
	const seen = new WeakSet<object>();
	const visit = (value: unknown) => {
		if (!value || typeof value !== 'object' || seen.has(value)) {
			return;
		}
		seen.add(value);
		if (isFeature(value)) {
			const features = index.get(value.id) || [];
			features.push(value);
			index.set(value.id, features);
		}
		Object.values(value).forEach(visit);
	};

	Object.values(AncestryData).forEach(ancestry => ancestry.features.forEach(visit));
	sourcebooks
		.filter(sourcebook => sourcebook.type === SourcebookType.Official)
		.forEach(sourcebook => sourcebook.ancestries.forEach(ancestry => ancestry.features.forEach(visit)));
	ancestryIndexCache.set(sourcebooks, index);
	return index;
};

/** Match an unchanged feature that belongs to an official ancestry. */
export const isOfficialAncestryFeatureSource = (feature: Feature, sourcebooks: Sourcebook[]): boolean => {
	return officialAncestryFeatures(sourcebooks).get(feature.id)?.some(source => signature(source) === signature(feature)) === true;
};

/** Find the canonical ancestry feature while allowing display-only description cleanup. */
export const getOfficialAncestryFeatureSource = (feature: Feature, sourcebooks: Sourcebook[]): Feature | undefined => {
	return officialAncestryFeatures(sourcebooks).get(feature.id)?.find(source => sourceIdentity(source) === sourceIdentity(feature));
};

/** Confirm the exact approved identity and description source for an ancestry. */
export const isOfficialAncestryDescriptionSource = (ancestry: Ancestry, sourcebooks: Sourcebook[]): boolean => {
	const official = [
		...Object.values(AncestryData),
		...sourcebooks
			.filter(sourcebook => sourcebook.type === SourcebookType.Official)
			.flatMap(sourcebook => sourcebook.ancestries)
	];
	return official.some(source => source.id === ancestry.id
		&& source.name === ancestry.name
		&& source.description === ancestry.description);
};

/** The builder-owned default language has no sourcebook record to match. */
export const isDefaultLanguageFeature = (feature: Feature): feature is FeatureLanguageChoice => {
	if (feature.id !== 'default-language' || feature.name !== 'Default Language'
		|| feature.type !== FeatureType.LanguageChoice || feature.description !== 'Choose a Common language.') {
		return false;
	}
	const data = feature.data;
	return data.count === 1
		&& data.allowedTypes.length === 1
		&& data.allowedTypes[0] === LanguageType.Common
		&& data.options.length === 0
		&& data.selectAt === 'build';
};

/** Validate both the original source and the exact DetailsSection projection. */
export const getChoiceDisplaySource = (feature: Feature, sourcebooks: Sourcebook[], detailsSource?: Feature): FeatureLanguageChoice | FeatureSkillChoice | undefined => {
	const source = detailsSource || feature;
	if (!isDefaultLanguageFeature(source) && !isOfficialFeatureSource(source, sourcebooks)) {
		return undefined;
	}
	if (source.type !== FeatureType.LanguageChoice && source.type !== FeatureType.SkillChoice) {
		return undefined;
	}
	if (!detailsSource) {
		return source;
	}
	const factory = new FactoryFeatureLogic();
	const projected = source.type === FeatureType.LanguageChoice
		? factory.createLanguageChoice({
			id: source.id, name: source.name || 'Language', options: [ ...source.data.options ],
			allowedTypes: [ ...source.data.allowedTypes ], count: source.data.count
		})
		: factory.createSkillChoice({
			id: source.id, name: 'Skill', options: [ ...source.data.options ],
			listOptions: [ ...source.data.listOptions ], count: source.data.count
		});
	return signature(feature) === signature(projected) ? source : undefined;
};
