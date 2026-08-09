import { localizeMessage, localizeUIString } from '@/localization/resolver';
import { AppLocale } from '@/localization/locale';
import { Characteristic } from '@/enums/characteristic';

// How a power roll's header reads to a player, at the panel's presentation boundary only. The
// panel still decides which header it is showing, from which characteristics and with which
// bonus; nothing here reads or rewrites that decision, the power roll or the characteristics.

// A full Record rather than a Partial one: a characteristic added to the enum without an
// approved reading fails to compile here, rather than reaching a player half translated.
const characteristicKeys: Record<Characteristic, string> = {
	[Characteristic.Might]: 'power-roll.characteristic.might',
	[Characteristic.Agility]: 'power-roll.characteristic.agility',
	[Characteristic.Reason]: 'power-roll.characteristic.reason',
	[Characteristic.Intuition]: 'power-roll.characteristic.intuition',
	[Characteristic.Presence]: 'power-roll.characteristic.presence'
};

// The canonical English joins a characteristic list with ' or '; zh-TW joins it with 或 and no
// spaces. The separator is scoped to this list, and is not a reading of the word on its own.
const joinCharacteristics = (locale: AppLocale, characteristics: Characteristic[]) => {
	const separator = localizeUIString(locale, 'power-roll.characteristic-separator', ' or ');

	return characteristics
		.map(characteristic => localizeUIString(locale, characteristicKeys[characteristic], characteristic))
		.join(separator);
};

// A roll against all five characteristics is read as the highest of them, which is one term
// rather than the five joined.
const getSubject = (locale: AppLocale, characteristics: Characteristic[]) => {
	if (characteristics.length === 5) {
		return localizeUIString(locale, 'power-roll.highest-characteristic', 'Highest Characteristic');
	}

	return joinCharacteristics(locale, characteristics);
};

export const getTestHeader = (locale: AppLocale, characteristics: Characteristic[]) => {
	if (characteristics.length === 0) {
		return localizeUIString(locale, 'power-roll.test', 'Test');
	}

	return localizeMessage(locale, 'power-roll.characteristic-test', { characteristics: getSubject(locale, characteristics) }, '{characteristics} Test');
};

export const getCharacteristicsHeader = (locale: AppLocale, characteristics: Characteristic[]) => {
	return localizeMessage(locale, 'power-roll.characteristics', { characteristics: getSubject(locale, characteristics) }, 'Power Roll + {characteristics}');
};

/**
 * The 'Power Roll' label on its own, for the headers the panel builds around a value rather
 * than around a characteristic. Only the label is read: the sign and the number beside it, and
 * the spacing the panel already gives them, are left exactly as they are.
 */
export const getPowerRollLabel = (locale: AppLocale) => {
	return localizeUIString(locale, 'power-roll.power-roll', 'Power Roll');
};
