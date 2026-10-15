import { hasCalculationBinding, plainForLookup } from '@/l10n/calculated-text';
import { Ability } from '@/models/ability';
import { AbilityData } from '@/data/ability-data';
import { AncestryData } from '@/data/ancestry-data';
import { ExplorationPerkData } from '@/data/perks/exploration';
import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { IntriguePerkData } from '@/data/perks/intrigue';
import { SupernaturalPerkData } from '@/data/perks/supernatural';
import { mapping } from '@/l10n/mapping';
import { translate } from '@/l10n/text';
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

/** Segment 3 grants. Arcane Trick and Familiar stay in segment 4. */
const perkGrantAbilityIds = new Set([
	'perk-friend-catapult-1',
	'perk-ive-got-you-1',
	'perk-gum-up-the-works-1',
	'perk-creature-sense-1',
	'perk-invisible-force-1',
	'perk-psychic-whisper-1'
]);

const perkGrantNames = new Map<string, { name: string, key: string }>();

const rememberPerkGrant = (perk: { id: string, name: string, type: FeatureType, data: { ability: { id: string, name: string } } | null }) => {
	if (perk.type !== FeatureType.Ability || !perk.data) {
		return;
	}
	const ability = perk.data.ability;
	if (!perkGrantAbilityIds.has(ability.id) || ability.name !== perk.name) {
		return;
	}
	const key = `element:${perk.id}:name`;
	if (!mapping[key]) {
		return;
	}
	perkGrantNames.set(ability.id, { name: ability.name, key });
};

[ ExplorationPerkData, IntriguePerkData, SupernaturalPerkData ].forEach(group => {
	Object.values(group).forEach(perk => {
		if (perk && typeof perk === 'object' && 'id' in perk) {
			rememberPerkGrant(perk);
		}
	});
});

const perkGrantLabelKeys: Record<string, string> = {
	Maneuver: 'enum:AbilityUsage:Maneuver',
	Ranged: 'enum:AbilityKeyword:Ranged'
};

/** An approved glossary word on one of these six abilities. Anything else stays as written. */
export const perkGrantLabel = (abilityId: string, english: string): string => {
	if (!perkGrantAbilityIds.has(abilityId)) {
		return english;
	}
	const key = perkGrantLabelKeys[english];
	if (!key) {
		return english;
	}
	return translate(key, english);
};

/** Comma-separated keywords. Only a word with its own approved row changes. */
export const perkGrantList = (abilityId: string, english: string): string => {
	if (!english) {
		return english;
	}
	return english.split(', ').map(part => perkGrantLabel(abilityId, part)).join(', ');
};

/** "Ranged 10" keeps the upstream number and replaces only the approved word. */
export const perkGrantDistance = (abilityId: string, english: string): string => {
	if (!perkGrantAbilityIds.has(abilityId)) {
		return english;
	}
	const match = /^Ranged( \d+.*)$/.exec(english);
	if (!match) {
		return english;
	}
	return `${translate('enum:AbilityKeyword:Ranged', 'Ranged')}${match[1]}`;
};

/**
 * The key for a basic action's name, or an ancestry ability's name.
 *
 * Only when the name on screen is still the Forge Steel English stored on
 * the ability. A hero who renamed it through abilityCustomizations keeps
 * that typed name. An ability that is not one of these, including Free
 * Strike (melee) and Free Strike (ranged), has no key.
 */
export const abilityNameKey = (ability: { id: string, name: string }): string | undefined => {
	const perk = perkGrantNames.get(ability.id);
	if (perk) {
		if (!ability.name || ability.name !== perk.name) {
			return undefined;
		}
		return perk.key;
	}
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
 * receive a key; unmapped ones stay as written. With canonical source supplied,
 * only an approved calculation binding may key rewritten display text.
 */
export const abilitySectionKey = (abilityId: string, index: number, shown: string, canonical?: string): string | undefined => {
	const section = abilities.get(abilityId)?.sections[index];
	if (!section || section.type !== 'text') {
		return undefined;
	}
	const source = plainForLookup(section.text).trim();
	if (canonical !== undefined && plainForLookup(canonical).trim() !== source) {
		return undefined;
	}
	const key = `section:${abilityId}:${index}`;
	const lookup = canonical !== undefined && hasCalculationBinding(key) ? canonical : shown;
	if (plainForLookup(lookup).trim() !== source) {
		return undefined;
	}
	return key;
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
