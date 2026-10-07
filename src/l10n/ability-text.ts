import { AbilityData } from '@/data/ability-data';
import { useL10nText } from '@/l10n/hooks';

const standardNames = new Map(AbilityData.standardAbilities.map(ability => [ ability.id, ability.name ]));
const standardSections = new Map(AbilityData.standardAbilities.map(ability => [ ability.id, ability.sections ]));

/**
 * The key for a basic action's name.
 *
 * Only when the name on screen is still the Forge Steel English stored on
 * the standard action. A hero who renamed it through abilityCustomizations
 * keeps that typed name. An action that is not one of these, including
 * Free Strike (melee) and Free Strike (ranged), has no key.
 */
export const abilityNameKey = (ability: { id: string, name: string }): string | undefined => {
	const dataName = standardNames.get(ability.id);
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
