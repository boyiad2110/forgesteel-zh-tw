import { AbilityData } from '@/data/ability-data';
import { useL10nText } from '@/l10n/hooks';

const standardNames = new Map(AbilityData.standardAbilities.map(ability => [ ability.id, ability.name ]));

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
