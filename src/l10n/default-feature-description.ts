import { Feature, isFeature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';
import { useUI } from '@/l10n/ui-text';

const sourceGroups: Partial<Record<FeatureType, Array<keyof Sourcebook>>> = {
	[FeatureType.AncestryFeatureChoice]: [ 'ancestries' ],
	[FeatureType.Perk]: [ 'careers', 'classes' ],
	[FeatureType.Domain]: [ 'classes' ],
	[FeatureType.Kit]: [ 'classes' ],
	[FeatureType.ClassAbility]: [ 'classes' ],
	[FeatureType.SummonChoice]: [ 'classes' ],
	[FeatureType.ItemChoice]: [ 'complications' ],
	[FeatureType.Retainer]: [ 'complications' ],
	[FeatureType.Toggle]: [ 'complications' ]
};

const selectionFields = new Set([ 'selected', 'selectedIDs', 'checked' ]);
const stableData = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(stableData);
	}
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value)
			.filter(([ key ]) => !selectionFields.has(key))
			.map(([ key, entry ]) => [ key, stableData(entry) ]));
	}
	return value;
};

const signature = (feature: Feature) => JSON.stringify({
	id: feature.id,
	name: feature.name,
	type: feature.type,
	description: feature.description,
	data: stableData(feature.data)
});

const cache = new WeakMap<Sourcebook[], Map<string, Set<string>>>();
const officialDefaults = (sourcebooks: Sourcebook[]) => {
	const cached = cache.get(sourcebooks);
	if (cached) {
		return cached;
	}
	const index = new Map<string, Set<string>>();
	const seen = new WeakSet<object>();
	const visit = (value: unknown, group: keyof Sourcebook) => {
		if (!value || typeof value !== 'object' || seen.has(value)) {
			return;
		}
		seen.add(value);
		if (isFeature(value) && value.description === '' && sourceGroups[value.type]?.includes(group)) {
			const signatures = index.get(value.id) || new Set<string>();
			signatures.add(signature(value));
			index.set(value.id, signatures);
		}
		Object.values(value).forEach(child => visit(child, group));
	};
	sourcebooks.filter(book => book.type === SourcebookType.Official).forEach(book => {
		([ 'ancestries', 'careers', 'classes', 'complications' ] as const).forEach(group => {
			book[group].forEach(entry => visit(entry, group));
		});
	});
	cache.set(sourcebooks, index);
	return index;
};

export const isOfficialDefaultDescriptionSource = (feature: Feature, sourcebooks: Sourcebook[]) => {
	return feature.description === ''
		&& !!sourceGroups[feature.type]
		&& officialDefaults(sourcebooks).get(feature.id)?.has(signature(feature)) === true;
};

/** Use only approved UI rows, after verifying the unchanged official feature. */
export const defaultFeatureDescriptionText = (feature: Feature, sourcebooks: Sourcebook[], english: string, ui: ReturnType<typeof useUI>) => {
	if (!isOfficialDefaultDescriptionSource(feature, sourcebooks)) {
		return english;
	}
	switch (feature.type) {
		case FeatureType.AncestryFeatureChoice: return english === 'This feature allows you to select a feature from an ancestry.'
			? ui.text('ui.hero-builder.default-ancestry-feature-choice.9f684d5a', 'This feature allows you to select a feature from an ancestry.')
			: english;
		case FeatureType.Perk: return english === 'This feature allows you to choose a perk.'
			? ui.text('ui.hero-builder.this-feature-allows-you-to-choos.f843efd3', 'This feature allows you to choose a perk.')
			: english;
		case FeatureType.Domain: return english === 'This feature allows you to choose a domain.'
			? ui.text('ui.hero-builder.default-domain-choice.f9ddbbd3', 'This feature allows you to choose a domain.')
			: english;
		case FeatureType.Kit: return english === 'This feature allows you to choose a kit.'
			? ui.text('ui.hero-builder.default-kit-choice.24ea1aa2', 'This feature allows you to choose a kit.')
			: english;
		case FeatureType.ClassAbility: return english === 'This feature allows you to choose an ability from your class.'
			? ui.text('ui.hero-builder.default-class-ability-choice.40b32187', 'This feature allows you to choose an ability from your class.')
			: english;
		case FeatureType.SummonChoice: return english === 'This feature allows you to choose monsters you can summon.'
			? ui.text('ui.hero-builder.default-summon-choice.10f57c03', 'This feature allows you to choose monsters you can summon.')
			: english;
		case FeatureType.ItemChoice: return english === 'This feature allows you to choose an item.'
			? ui.text('ui.hero-builder.default-item-choice.7348d5a4', 'This feature allows you to choose an item.')
			: english;
		case FeatureType.Retainer: return english === 'This feature grants you a retainer.'
			? ui.text('ui.hero-builder.default-retainer.fbf28dbf', 'This feature grants you a retainer.')
			: english;
		case FeatureType.Toggle: return english === 'This feature allows you to turn a feature on or off.'
			? ui.text('ui.hero-builder.default-toggle.c42fc5cd', 'This feature allows you to turn a feature on or off.')
			: english;
		default: return english;
	}
};
