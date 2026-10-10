import { Feature, FeatureLanguageChoice, FeatureSkillChoice, isFeature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { LanguageType } from '@/enums/language-type';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';

const signature = (feature: Feature) => {
	const data = { ...feature.data } as Record<string, unknown>;
	delete data.selected;
	return JSON.stringify({ id: feature.id, name: feature.name, description: feature.description, type: feature.type, data });
};

const indexCache = new WeakMap<Sourcebook[], Map<string, Set<string>>>();

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

export const isOfficialSkillChoice = (feature: Feature): feature is FeatureSkillChoice => feature.type === FeatureType.SkillChoice;
