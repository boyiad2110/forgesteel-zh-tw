import { Ability } from '@/models/ability';
import { AbilityData } from '@/data/ability-data';
import { AncestryData } from '@/data/ancestry-data';
import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { useL10nText } from '@/l10n/hooks';

const ancestryAbilities = new Map<string, Ability>();

/**
 * Ancestry abilities are the FactoryLogic.createAbility values stored on
 * ancestry features, including ones nested in a choice or a multiple.
 * Dwarf, Hakaan, and Orc have none. Class, kit, domain, and perk abilities
 * are not included.
 */
const collectAncestryAbilities = (feature: Feature) => {
	if (feature.type === FeatureType.Ability) {
		ancestryAbilities.set(feature.data.ability.id, feature.data.ability);
		return;
	}
	if (feature.type === FeatureType.Choice) {
		feature.data.options.forEach(option => collectAncestryAbilities(option.feature));
		return;
	}
	if (feature.type === FeatureType.Multiple) {
		feature.data.features.forEach(child => collectAncestryAbilities(child));
	}
};

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
].forEach(ancestry => ancestry.features.forEach(feature => collectAncestryAbilities(feature)));

const abilities = new Map([ ...AbilityData.standardAbilities, ...ancestryAbilities.values() ].map(ability => [ ability.id, ability ]));

/**
 * The key for a basic action's name, or an ancestry ability's name.
 *
 * Only when the name on screen is still the Forge Steel English stored on
 * the ability. A hero who renamed it through abilityCustomizations keeps
 * that typed name. An ability that is not one of these, including Free
 * Strike (melee) and Free Strike (ranged), has no key.
 */
export const abilityNameKey = (ability: { id: string, name: string }): string | undefined => {
	const dataName = abilities.get(ability.id)?.name;
	if (!ability.name || dataName === undefined || ability.name !== dataName) {
		return undefined;
	}
	return `element:${ability.id}:name`;
};

/**
 * The key for one text section of a basic action or ancestry ability.
 *
 * Only when the ability is one of the standard actions or ancestry abilities, the data section at
 * this index is a text section, and the supplied text still matches that English
 * once `**bold**` marks are removed and both sides are trimmed. A classic-sheet
 * `**Effect:**` prefix, a rewritten sentence, a roll or field section, and an
 * action that is not one of these stay as written. Mapped action sections can
 * receive a key; unmapped ones stay as written.
 */
export const abilitySectionKey = (abilityId: string, index: number, shown: string): string | undefined => {
	const section = abilities.get(abilityId)?.sections[index];
	if (!section || section.type !== 'text') {
		return undefined;
	}
	const plain = shown.replace(/\*\*([^*]+)\*\*/g, '$1').trim();
	if (plain !== section.text.trim()) {
		return undefined;
	}
	return `section:${abilityId}:${index}`;
};

/** Only an ancestry ability's unchanged, non-empty description can be keyed. */
export const abilityDescriptionKey = (ability: { id: string, description?: string }): string | undefined => {
	const description = ancestryAbilities.get(ability.id)?.description;
	if (!ability.description || description === undefined || ability.description !== description) {
		return undefined;
	}
	return `element:${ability.id}:description`;
};

/** A classic card's description. Sheet data and layout estimates remain English. */
export const AbilityDescription = (props: { ability: { id: string, description?: string } }) => {
	return useL10nText(abilityDescriptionKey(props.ability), props.ability.description || '');
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
