import { localizeMessage, localizeUIString } from '@/localization/resolver';
import { AppLocale } from '@/localization/locale';
import { DamageType } from '@/enums/damage-type';

// How the power roll panel's footer reads to a player, at its presentation boundary only. The
// bonuses, the damage types and the potency values are all worked out before they arrive here;
// this reads the wording around them and never the numbers, the kit or the feature they name.

// Scoped to a kit's damage bonus: the whole phrase is what was approved, not the melee and
// ranged distance terms on their own.
const kitDamageKeys: Record<'melee' | 'ranged', string> = {
	melee: 'power-roll.kit-damage.melee',
	ranged: 'power-roll.kit-damage.ranged'
};

export const getKitDamageBonus = (locale: AppLocale, bonus: { type: 'melee' | 'ranged', tier1: number, tier2: number, tier3: number }) => {
	const damage = localizeUIString(locale, kitDamageKeys[bonus.type], `${bonus.type} damage`);

	// The tiers travel as their own values, so each one reaches the screen as the number the
	// kit carries, in the order and with the signs the panel already gave them.
	return localizeMessage(
		locale,
		'power-roll.kit-damage-bonus',
		{ tier1: `${bonus.tier1}`, tier2: `${bonus.tier2}`, tier3: `${bonus.tier3}`, damage: damage },
		'+{tier1} / +{tier2} / +{tier3} {damage}'
	);
};

// A full Record rather than a Partial one: a damage type added to the enum without an approved
// reading fails to compile here rather than reaching a player half translated. These readings
// are display only — the canonical DamageType value is what every rule and modifier still uses.
const damageTypeKeys: Record<DamageType, string> = {
	[DamageType.Damage]: 'power-roll.damage-type.damage',
	[DamageType.Acid]: 'power-roll.damage-type.acid',
	[DamageType.Cold]: 'power-roll.damage-type.cold',
	[DamageType.Corruption]: 'power-roll.damage-type.corruption',
	[DamageType.Fire]: 'power-roll.damage-type.fire',
	[DamageType.Holy]: 'power-roll.damage-type.holy',
	[DamageType.Lightning]: 'power-roll.damage-type.lightning',
	[DamageType.Poison]: 'power-roll.damage-type.poison',
	[DamageType.Psychic]: 'power-roll.damage-type.psychic',
	[DamageType.Sonic]: 'power-roll.damage-type.sonic'
};

export const getFeatureDamageBonus = (locale: AppLocale, bonus: { value: number, type: DamageType }) => {
	const damageType = localizeUIString(locale, damageTypeKeys[bonus.type], bonus.type);

	return localizeMessage(locale, 'power-roll.feature-damage-bonus', { value: `${bonus.value}`, damageType: damageType }, '{value} {damageType}');
};

export const getPotencyLabel = (locale: AppLocale) => {
	return localizeUIString(locale, 'power-roll.potency', 'Potency');
};

/**
 * The three potency strengths and their values. The strengths are named as they are only in
 * this potency line; the values are the ones the hero's potency already worked out, and the
 * punctuation between them belongs to whichever reading is being shown.
 */
export const getPotencyValues = (locale: AppLocale, potency: { weak: number, average: number, strong: number }) => {
	return localizeMessage(
		locale,
		'power-roll.potency-values',
		{ weak: `${potency.weak}`, average: `${potency.average}`, strong: `${potency.strong}` },
		'weak {weak}, average {average}, strong {strong}'
	);
};
