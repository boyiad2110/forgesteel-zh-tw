import { AbilityData } from '@/data/ability-data';
import { AncestryData } from '@/data/ancestry-data';
import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { useL10nText } from '@/l10n/hooks';

const standardSections = new Map(AbilityData.standardAbilities.map(ability => [ ability.id, ability.sections ]));

/**
 * Ancestry abilities are the FactoryLogic.createAbility values stored on
 * ancestry features, including ones nested in a choice or a multiple.
 * Dwarf, Hakaan, and Orc have none. Class, kit, domain, and perk abilities
 * are not included.
 */
const collectAncestryAbilityNames = (feature: Feature, names: Map<string, string>) => {
	if (feature.type === FeatureType.Ability) {
		names.set(feature.data.ability.id, feature.data.ability.name);
		return;
	}
	if (feature.type === FeatureType.Choice) {
		feature.data.options.forEach(option => collectAncestryAbilityNames(option.feature, names));
		return;
	}
	if (feature.type === FeatureType.Multiple) {
		feature.data.features.forEach(child => collectAncestryAbilityNames(child, names));
	}
};

const abilityNames = new Map(AbilityData.standardAbilities.map(ability => [ ability.id, ability.name ]));
[
	AncestryData.devil,
	AncestryData.dragonKnight,
	AncestryData.dwarf,
	AncestryData.highElf,
	AncestryData.wodeElf,
	AncestryData.hakaan,
	AncestryData.human,
	AncestryData.memonek,
	AncestryData.orc,
	AncestryData.polder,
	AncestryData.revenant,
	AncestryData.timeRaider
].forEach(ancestry => ancestry.features.forEach(feature => collectAncestryAbilityNames(feature, abilityNames)));

/**
 * The key for a basic action's name, or an ancestry ability's name.
 *
 * Ancestry ability names are batch 8-1. Their descriptions and text
 * sections stay for later batches.
 *
 * Only when the name on screen is still the Forge Steel English stored on
 * the ability. A hero who renamed it through abilityCustomizations keeps
 * that typed name. An ability that is not one of these, including Free
 * Strike (melee) and Free Strike (ranged), has no key.
 */
export const abilityNameKey = (ability: { id: string, name: string }): string | undefined => {
	const dataName = abilityNames.get(ability.id);
	if (!ability.name || dataName === undefined || ability.name !== dataName) {
		return undefined;
	}
	return `element:${ability.id}:name`;
};

/**
 * The key for one text section of a basic action.
 *
 * Only when the ability is one of the standard actions, the data section at
 * this index is a text section, and the text on screen is still that English
 * once `**bold**` marks are removed and both sides are trimmed. A classic-sheet
 * `**Effect:**` prefix, a rewritten sentence, a roll or field section, and an
 * action that is not one of these stay as written. Escape Grab, Grab, and
 * Knockback can receive a key; nothing maps it, so they stay English.
 * Ancestry ability descriptions and text sections are not keyed here.
 * Those stay for later batches.
 */
export const abilitySectionKey = (abilityId: string, index: number, shown: string): string | undefined => {
	const section = standardSections.get(abilityId)?.[index];
	if (!section || section.type !== 'text') {
		return undefined;
	}
	const plain = shown.replace(/\*\*([^*]+)\*\*/g, '$1').trim();
	if (plain !== section.text.trim()) {
		return undefined;
	}
	return `section:${abilityId}:${index}`;
};

/**
 * The action name to draw. English mode stays as written. A renamed action,
 * and an action with no approved row, stays as written.
 */
export const useAbilityName = (ability: { id: string, name: string }): string => {
	return useL10nText(abilityNameKey(ability), ability.name);
};

/** One action name. Use this inside a list, where a hook cannot be called. */
export const AbilityName = (props: { ability: { id: string, name: string } }) => {
	return useAbilityName(props.ability);
};
