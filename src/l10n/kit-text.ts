import { FeatureType } from '@/enums/feature-type';
import { Kit } from '@/models/kit';
import { KitData } from '@/data/kit-data';
import { mapping } from '@/l10n/mapping';
import { translate } from '@/l10n/text';
import { useUI } from '@/l10n/ui-text';

export const stormwightKitIds = new Set([ 'kit-boren', 'kit-corven', 'kit-raden', 'kit-vuken' ]);

/** The 21 core kits covered by the approved Book Master entries. */
export const standardKits: Kit[] = (Object.values(KitData) as Kit[]).filter(kit => !stormwightKitIds.has(kit.id));

const kitAbilityNames = new Map<string, { name: string, key: string }>();

standardKits.forEach(kit => kit.features.forEach(feature => {
	if (feature.type !== FeatureType.Ability) {
		return;
	}
	const ability = feature.data.ability;
	const key = `element:${ability.id}:name`;
	if (mapping[key]) {
		kitAbilityNames.set(ability.id, { name: ability.name, key });
	}
}));

/** A signature name is translated only when its current text is unchanged. */
export const kitAbilityNameKey = (ability: { id: string, name: string }): string | undefined => {
	const canonical = kitAbilityNames.get(ability.id);
	if (!canonical || ability.name !== canonical.name) {
		return undefined;
	}
	return canonical.key;
};

type KitUi = ReturnType<typeof useUI>;

/** Only labels with an approved UI or glossary row are translated. */
export const kitFieldLabel = (ui: KitUi, english: string): string => {
	switch (english) {
		case 'Armor': return ui.text('ui.hero-builder.armor.d165ace3', 'Armor');
		case 'Speed': return ui.text('ui.hero-builder.speed.a2b81141', 'Speed');
		case 'Stamina': return translate('enum:FeatureField:Stamina', 'Stamina');
		case 'Stability': return translate('enum:FeatureField:Stability', 'Stability');
		default: return english;
	}
};

/** Translate canonical standard kit names individually; preserve custom or unknown names as shown. */
export const kitModifierName = (shown: string, kits: Kit[]): string => {
	const names = shown.split(' & ');
	if (names.length !== kits.length) {
		return shown;
	}
	return kits.map((kit, index) => {
		const name = names[index];
		const canonical = standardKits.find(item => item.id === kit.id && item.name === kit.name);
		if (name !== kit.name || !canonical) {
			return name;
		}
		const key = `element:${kit.id}:name`;
		return mapping[key] ? translate(key, name) : name;
	}).join(' & ');
};

/** Hook wrapper keeps the classic card subscribed to language and catalog updates. */
export const useKitModifierName = (shown: string, kits: Kit[]): string => {
	useUI();
	return kitModifierName(shown, kits);
};
