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
const canonicalKitAbilityNames = new Map<string, string>();

standardKits.forEach(kit => kit.features.forEach(feature => {
	if (feature.type !== FeatureType.Ability) {
		return;
	}
	const ability = feature.data.ability;
	canonicalKitAbilityNames.set(ability.id, ability.name);
	const key = `element:${ability.id}:name`;
	if (mapping[key]) {
		kitAbilityNames.set(ability.id, { name: ability.name, key });
	}
}));

/** True only for an unchanged official kit ability or an approved case-only variant. */
export const isStandardKitAbility = (ability: { id: string, name: string }): boolean => {
	const canonical = canonicalKitAbilityNames.get(ability.id);
	return canonical !== undefined && (ability.name === canonical
		|| ability.name.toLocaleLowerCase('en-US') === canonical.toLocaleLowerCase('en-US'));
};

/** A signature name is translated only when its current text is unchanged. */
export const kitAbilityNameKey = (ability: { id: string, name: string }): string | undefined => {
	const canonical = kitAbilityNames.get(ability.id);
	if (!canonical || (ability.name !== canonical.name
		&& ability.name.toLocaleLowerCase('en-US') !== canonical.name.toLocaleLowerCase('en-US'))) {
		return undefined;
	}
	return canonical.key;
};

type KitUi = ReturnType<typeof useUI>;

/** Only labels with an approved UI or glossary row are translated. */
export const kitFieldLabel = (ui: KitUi, english: string): string => {
	switch (english) {
		case 'Armor': return ui.text('ui.hero-builder.armor.d165ace3', 'Armor');
		case 'Weapon': return ui.text('ui.hero-builder.weapon.1710782c', 'Weapon');
		case 'Kit': return ui.text('ui.hero-builder.kit.63d5adfa', 'Kit');
		case 'Melee Damage': return ui.text('ui.hero-builder.melee-damage.025e8b60', 'Melee Damage');
		case 'Ranged Damage': return ui.text('ui.hero-builder.ranged-damage.ed353d2b', 'Ranged Damage');
		case 'Melee Distance': return ui.text('ui.hero-builder.melee-distance.7c498629', 'Melee Distance');
		case 'Ranged Distance': return ui.text('ui.hero-builder.ranged-distance.b55a9de7', 'Ranged Distance');
		case 'Disengage': return translate('element:disengage:name', 'Disengage');
		case 'Main Action': return ui.text('ui.hero-builder.main-action.147a0625', 'Main Action');
		case 'Speed': return ui.text('ui.hero-builder.speed.a2b81141', 'Speed');
		case 'Uses': return ui.text('ui.hero-builder.uses.9e6151ac', 'Uses');
		case 'Stats': return ui.text('ui.hero-builder.stats.b4a73657', 'Stats');
		case 'Stamina': return translate('enum:FeatureField:Stamina', 'Stamina');
		case 'Stability': return translate('enum:FeatureField:Stability', 'Stability');
		default: return english;
	}
};

/** Translate an exact selected kit source label, preserving custom and renamed kits. */
export const kitSourceName = (shown: string, kits: Kit[]): string => {
	const kit = kits.find(item => item.name === shown);
	return kit ? kitModifierName(shown, [ kit ]) : shown;
};

const kitEquipmentTerms: Record<string, string> = {
	'Light Armor': 'enum:KitArmor:Light',
	'Medium Armor': 'enum:KitArmor:Medium',
	'Heavy Armor': 'enum:KitArmor:Heavy',
	'Shield': 'enum:KitArmor:Shield',
	'Light Weapon': 'enum:KitWeapon:Light',
	'Medium Weapon': 'enum:KitWeapon:Medium',
	'Heavy Weapon': 'enum:KitWeapon:Heavy',
	'Bow': 'enum:KitWeapon:Bow',
	'Ensnaring Weapon': 'enum:KitWeapon:Ensnaring',
	'Polearm': 'enum:KitWeapon:Polearm',
	'Unarmed Strike': 'enum:KitWeapon:Unarmed',
	'Whip': 'enum:KitWeapon:Whip'
};

/** Translate only the exact, approved kit armor and weapon enum values. */
export const kitEquipmentLabel = (english: string): string => {
	const key = kitEquipmentTerms[english];
	return key && mapping[key] ? translate(key, english) : english;
};

/** Translate a displayed list without changing custom or unknown values. */
export const kitEquipmentLabels = (english: string[]): string => {
	return english.map(kitEquipmentLabel).join(', ');
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

/** Translate only complete, canonical kit names in Classic View damage rows. */
export const kitBonusSourceName = (shown: string): string => {
	const separator = shown.includes(' / ') ? ' / ' : ' & ';
	const parts = shown.split(separator);
	const kits = parts.map(name => standardKits.find(kit => kit.name === name));
	if (kits.some(kit => !kit)) {
		return shown;
	}
	return (kits as Kit[]).map((kit, index) => {
		const name = parts[index];
		const key = `element:${kit.id}:name`;
		return mapping[key] ? translate(key, name) : name;
	}).join(separator);
};

/** Hook wrapper keeps the classic card subscribed to language and catalog updates. */
export const useKitModifierName = (shown: string, kits: Kit[]): string => {
	useUI();
	return kitModifierName(shown, kits);
};
