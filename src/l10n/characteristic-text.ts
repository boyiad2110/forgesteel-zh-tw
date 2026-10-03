import { getCatalogTick, subscribeToCatalog } from '@/l10n/catalog';
import { getLanguage, subscribeToLanguage } from '@/l10n/language';
import { Characteristic } from '@/enums/characteristic';
import { translate } from '@/l10n/text';
import { useL10nText } from '@/l10n/hooks';
import { useSyncExternalStore } from 'react';

/** The key for a characteristic's name, or nothing when that text stays English. */
export const characteristicNameKey = (characteristic: Characteristic): string | undefined => {
	switch (characteristic) {
		case Characteristic.Might:
			return 'enum:Characteristic:Might';
		case Characteristic.Agility:
			return 'enum:Characteristic:Agility';
		case Characteristic.Reason:
			return 'enum:Characteristic:Reason';
		case Characteristic.Intuition:
			return 'enum:Characteristic:Intuition';
		case Characteristic.Presence:
			return 'enum:Characteristic:Presence';
		default:
			return undefined;
	}
};

/**
 * Text that follows the Draw Steel symbol letter on the classic sheet.
 * English mode, and a missing translation, keep the rest of the English name.
 * Chinese mode uses the full Chinese name, so the letter stays and the
 * English remainder does not.
 */
export const textAfterCharacteristicSymbol = (characteristic: Characteristic, shown: string): string => {
	if (shown === characteristic) {
		return characteristic.substring(1);
	}
	return shown;
};

/** The characteristic name to draw. The value passed in is still the English enum. */
export const useCharacteristicName = (characteristic: Characteristic): string => {
	return useL10nText(characteristicNameKey(characteristic), characteristic);
};

/**
 * Names for a list, in order. One subscription, so the list length can change.
 * English mode returns the enum values unchanged.
 */
export const useCharacteristicNames = (characteristics: readonly Characteristic[]): string[] => {
	useSyncExternalStore(subscribeToLanguage, getLanguage);
	useSyncExternalStore(subscribeToCatalog, getCatalogTick);
	return characteristics.map(characteristic => translate(characteristicNameKey(characteristic), characteristic));
};

/** The classic-sheet label after the symbol letter. */
export const CharacteristicAfterSymbol = (props: { characteristic: Characteristic }) => {
	return textAfterCharacteristicSymbol(props.characteristic, useCharacteristicName(props.characteristic));
};
