const familiarStats: Record<string, string> = {
	'Free Strike': 'element:free-strike:name',
	'Size': 'enum:FeatureType:Size',
	'Speed': 'enum:FeatureField:Speed',
	'Stability': 'enum:FeatureField:Stability',
	'Stamina': 'enum:FeatureField:Stamina'
};

/** An approved label on the familiar stat block. Other monsters stay as written. */
export const familiarStatKey = (monsterId: string, english: string): string | undefined => {
	if (monsterId !== 'familiar') {
		return undefined;
	}
	return familiarStats[english];
};

/** The familiar stamina bonus uses the same approved word as the stat block. */
export const familiarStaminaKey = (feature: { id: string }): string | undefined => {
	return feature.id === 'familiar-1' ? 'enum:FeatureField:Stamina' : undefined;
};

/** The monster name reuses the perk name while it is still the stored English. */
export const familiarNameKey = (monster: { id: string, name: string }): string | undefined => {
	return monster.id === 'familiar' && monster.name === 'Familiar' ? 'element:perk-familiar:name' : undefined;
};

/**
 * Heroes 1.01b prints an em dash when the familiar has no movement mode.
 * The label stays English: no enum value equals Movement.
 */
export const familiarMovementDash = (monster: { id: string, speed: { modes: readonly unknown[] } }): string | undefined => {
	if (monster.id !== 'familiar' || monster.speed.modes.length > 0) {
		return undefined;
	}
	return '\u2014';
};
