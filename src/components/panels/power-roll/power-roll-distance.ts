import { AbilityDistanceType } from '@/enums/ability-distance-type';
import { AppLocale } from '@/localization/locale';
import { localizeUIString } from '@/localization/resolver';

// How the distances an ability can be used at read to a player, in the power roll panel's
// selector only. Each option carries its canonical AbilityDistanceType as its value, so the
// selection, the state it sets and every calculation that reads it stay canonical; the reading
// below is the label beside it and never becomes the value.

// A full Record rather than a Partial one: a distance type added to the enum without an
// approved reading fails to compile here rather than reaching a player half translated.
const distanceTypeKeys: Record<AbilityDistanceType, string> = {
	[AbilityDistanceType.Self]: 'power-roll.distance-type.self',
	[AbilityDistanceType.Melee]: 'power-roll.distance-type.melee',
	[AbilityDistanceType.Ranged]: 'power-roll.distance-type.ranged',
	[AbilityDistanceType.Aura]: 'power-roll.distance-type.aura',
	[AbilityDistanceType.Burst]: 'power-roll.distance-type.burst',
	[AbilityDistanceType.Cube]: 'power-roll.distance-type.cube',
	[AbilityDistanceType.Line]: 'power-roll.distance-type.line',
	[AbilityDistanceType.Wall]: 'power-roll.distance-type.wall',
	[AbilityDistanceType.Summoner]: 'power-roll.distance-type.summoner',
	[AbilityDistanceType.Special]: 'power-roll.distance-type.special'
};

export const getDistanceOptions = (locale: AppLocale, types: AbilityDistanceType[]) => {
	return types.map(type => ({
		label: localizeUIString(locale, distanceTypeKeys[type], type),
		value: type
	}));
};
