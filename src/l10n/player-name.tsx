import { AncestryData } from '@/data/ancestry-data';
import { Ancestry } from '@/models/ancestry';
import { FeatureType } from '@/enums/feature-type';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';
import { mapping } from '@/l10n/mapping';
import { useL10nText } from '@/l10n/hooks';
import { useSourcebooks } from '@/contexts/data-context';
import { Feature } from '@/models/feature';

interface NamedElement {
	id: string;
	name: string;
}

const ancestryElements: Ancestry[] = Object.values(AncestryData);
const sourcebookIndexes = new WeakMap<Sourcebook[], Map<string, string>>();

export const isPlayerNameKey = (element: NamedElement) => {
	const entry = mapping[`element:${element.id}:name`];
	return !!entry && (entry.sheetId.startsWith('heroes.ancestries.') || entry.sheetId.startsWith('heroes.background.culture.'));
};

const addName = (names: Map<string, string>, element: NamedElement) => {
	if (isPlayerNameKey(element)) {
		names.set(element.id, element.name);
	}
};

const addFeature = (names: Map<string, string>, feature: Feature) => {
	addName(names, feature);
	switch (feature.type) {
		case FeatureType.Choice:
			feature.data.options.forEach(option => addFeature(names, option.feature));
			break;
		case FeatureType.Multiple:
			feature.data.features.forEach(child => addFeature(names, child));
			break;
	}
};

const getPlayerNameIndex = (sourcebooks: Sourcebook[]) => {
	const cached = sourcebookIndexes.get(sourcebooks);
	if (cached) {
		return cached;
	}

	const names = new Map<string, string>();
	ancestryElements.forEach(ancestry => {
		addName(names, ancestry);
		ancestry.features.forEach(feature => addFeature(names, feature));
		if (ancestry.culture) {
			addCulture(names, ancestry.culture);
		}
	});
	sourcebooks
		.filter(sourcebook => sourcebook.type === SourcebookType.Official)
		.forEach(sourcebook => {
			sourcebook.ancestries.forEach(ancestry => {
				addName(names, ancestry);
				ancestry.features.forEach(feature => addFeature(names, feature));
				if (ancestry.culture) {
					addCulture(names, ancestry.culture);
				}
			});
			sourcebook.cultures.forEach(culture => addCulture(names, culture));
		});

	sourcebookIndexes.set(sourcebooks, names);
	return names;
};

const addCulture = (names: Map<string, string>, culture: { id: string, name: string, environment: Feature | null, organization: Feature | null, upbringing: Feature | null }) => {
	addName(names, culture);
	[ culture.environment, culture.organization, culture.upbringing ]
		.filter((feature): feature is Feature => feature !== null)
		.forEach(feature => addFeature(names, feature));
};

export const playerNameKey = (element: NamedElement, sourcebooks: Sourcebook[]) => {
	const canonical = getPlayerNameIndex(sourcebooks).get(element.id);
	if (canonical !== element.name) {
		return undefined;
	}
	const key = `element:${element.id}:name`;
	return mapping[key] ? key : undefined;
};

export const usePlayerName = (element: NamedElement | undefined, fallback = '') => {
	const sourcebooks = useSourcebooks();
	const name = element ? fallback || element.name : fallback;
	return useL10nText(element ? playerNameKey(element, sourcebooks) : undefined, name);
};

export const PlayerName = (props: { element: NamedElement, fallback?: string }) => {
	return usePlayerName(props.element, props.fallback);
};
