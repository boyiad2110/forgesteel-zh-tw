import { DamageModifier } from '@/models/damage-modifier';
import { DamageModifierType } from '@/enums/damage-modifier-type';
import { DamageType } from '@/enums/damage-type';
import { FormatLogic } from '@/logic/format-logic';
import { useUI } from '@/l10n/ui-text';

type UI = ReturnType<typeof useUI>;
type UIId = Parameters<UI['text']>[0];

const damageTypeIds: Partial<Record<DamageType, UIId>> = {
	[DamageType.Acid]: 'ui.hero-builder.acid.c4fdf6b8',
	[DamageType.Cold]: 'ui.hero-builder.cold.f151cd9e',
	[DamageType.Corruption]: 'ui.hero-builder.corruption.abf56455',
	[DamageType.Fire]: 'ui.hero-builder.fire.c141faa8',
	[DamageType.Lightning]: 'ui.hero-builder.lightning.41e68f2c',
	[DamageType.Poison]: 'ui.hero-builder.poison.d5a78b99',
	[DamageType.Psychic]: 'ui.hero-builder.psychic.2c73e325'
};

const modifierTypeIds: Record<DamageModifierType, UIId> = {
	[DamageModifierType.Immunity]: 'ui.hero-builder.immunity.806f8b53',
	[DamageModifierType.Weakness]: 'ui.hero-builder.weakness.f3e0689e'
};

export const damageModifierTypeName = (ui: UI, type: DamageModifierType): string =>
	type === DamageModifierType.Immunity
		? ui.text('ui.hero-builder.immunity.806f8b53', 'Immunity')
		: ui.text('ui.hero-builder.weakness.f3e0689e', 'Weakness');

export const damageTypeName = (ui: UI, type: DamageType): string => {
	switch (type) {
		case DamageType.Acid: return ui.text('ui.hero-builder.acid.c4fdf6b8', 'Acid');
		case DamageType.Cold: return ui.text('ui.hero-builder.cold.f151cd9e', 'Cold');
		case DamageType.Corruption: return ui.text('ui.hero-builder.corruption.abf56455', 'Corruption');
		case DamageType.Fire: return ui.text('ui.hero-builder.fire.c141faa8', 'Fire');
		case DamageType.Lightning: return ui.text('ui.hero-builder.lightning.41e68f2c', 'Lightning');
		case DamageType.Poison: return ui.text('ui.hero-builder.poison.d5a78b99', 'Poison');
		case DamageType.Psychic: return ui.text('ui.hero-builder.psychic.2c73e325', 'Psychic');
		default: return type;
	}
};

export const damageModifierFeatureName = (ui: UI): string =>
	ui.text('ui.hero-builder.damage-modifier.a9292a2f', 'Damage Modifier');

/** Only translate the exact modifier shapes approved for official ancestry data. */
export const ancestryDamageModifierText = (ui: UI, modifier: DamageModifier): string | undefined => {
	const damageType = damageTypeIds[modifier.damageType];
	const modifierType = modifierTypeIds[modifier.type];
	if (!damageType || !modifierType) {
		return undefined;
	}
	if (ui.language === 'zh-TW'
		&& modifier.damageType === DamageType.Corruption
		&& modifier.type === DamageModifierType.Immunity
		&& modifier.value === 3
		&& modifier.valuePerLevel === 1
		&& modifier.valuePerEchelon === 0
		&& modifier.valueCharacteristics.length === 0) {
		return ui.text('ui.hero-builder.ancestry-corruption-growth.7932cd16', 'Corruption Immunity +3 +1 per level after 1st');
	}

	const amount = FormatLogic.getModifier(modifier);
	if (amount === '+1 per level') {
		const perLevel = ui.text('ui.hero-builder.per-level.1caaa3dd', '+1 per level');
		if (perLevel === '+1 per level') {
			return undefined;
		}
		return `${damageTypeName(ui, modifier.damageType)}${damageModifierTypeName(ui, modifier.type)}${perLevel}`;
	}

	if (!/^[+-]?\d+$/.test(amount)) {
		return undefined;
	}
	return `${damageTypeName(ui, modifier.damageType)}${damageModifierTypeName(ui, modifier.type)} ${amount}`;
};
