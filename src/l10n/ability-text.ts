import { hasCalculationBinding, isProjectedCalculation, plainForLookup } from '@/l10n/calculated-text';
import { Ability } from '@/models/ability';
import { AbilityData } from '@/data/ability-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { AncestryData } from '@/data/ancestry-data';
import { ExplorationPerkData } from '@/data/perks/exploration';
import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { IntriguePerkData } from '@/data/perks/intrigue';
import { SupernaturalPerkData } from '@/data/perks/supernatural';
import { mapping } from '@/l10n/mapping';
import { ancestryUiText } from '@/l10n/ancestry-ui';
import { kitAbilityNameKey, standardKits } from '@/l10n/kit-text';
import { translate } from '@/l10n/text';
import { useL10nText } from '@/l10n/hooks';
import { useUI } from '@/l10n/ui-text';

const ancestryAbilities = new Map<string, Ability>();

/**
 * Ancestry abilities are the FactoryLogic.createAbility values stored on
 * ancestry features, including ones nested in a choice or a multiple.
 * Dwarf, Hakaan, and Orc have none. Class, kit, domain, and perk abilities
 * are not included.
 */
const collectAncestryAbilities = (feature: Feature) => {
	if (feature.type === FeatureType.Ability) {
		ancestryAbilities.set(feature.data.ability.id, feature.data.ability);
		return;
	}
	if (feature.type === FeatureType.Choice) {
		feature.data.options.forEach(option => collectAncestryAbilities(option.feature));
		return;
	}
	if (feature.type === FeatureType.Multiple) {
		feature.data.features.forEach(child => collectAncestryAbilities(child));
	}
};

[
	AncestryData.devil,
	AncestryData.dragonKnight,
	AncestryData.dwarf,
	AncestryData.highElf,
	AncestryData.wodeElf,
	AncestryData.hakaan,
	AncestryData.human,
	AncestryData.memonek,
	AncestryData.orc,
	AncestryData.polder,
	AncestryData.revenant,
	AncestryData.timeRaider
].forEach(ancestry => ancestry.features.forEach(feature => collectAncestryAbilities(feature)));

const abilities = new Map([ ...AbilityData.standardAbilities, ...ancestryAbilities.values() ].map(ability => [ ability.id, ability ]));

/** True only for an unchanged built-in ancestry ability. */
export const isOfficialAncestryAbility = (ability: { id: string, name: string, actionType?: string }): boolean => {
	const source = ancestryAbilities.get(ability.id);
	return source?.name === ability.name
		&& (ability.actionType === undefined || source.type.usage.toString() === ability.actionType);
};

/** Canonical signature abilities from the 21 standard kits; Stormwight is excluded. */
const standardKitAbilities = new Map<string, Ability>();
standardKits.forEach(kit => kit.features.forEach(feature => {
	if (feature.type === FeatureType.Ability) {
		standardKitAbilities.set(feature.data.ability.id, feature.data.ability);
	}
}));

/** Segment 3 grants plus Arcane Trick. Familiar is a summon, not an ability. */
const perkGrantAbilityIds = new Set([
	'perk-friend-catapult-1',
	'perk-ive-got-you-1',
	'perk-gum-up-the-works-1',
	'perk-creature-sense-1',
	'perk-invisible-force-1',
	'perk-psychic-whisper-1',
	'perk-arcane-trick-1'
]);

const perkGrantNames = new Map<string, { name: string, key: string }>();
const perkGrantDescriptions = new Map<string, { text: string, key: string }>();
const perkGrantSections = new Map<string, (string | null)[]>();
const perkGrantTriggers = new Map<string, string>();
const perkGrantTargets = new Map<string, string>();

const rememberPerkGrant = (perk: {
	id: string,
	name: string,
	type: FeatureType,
	data: {
		ability: {
			id: string,
			name: string,
			description: string,
			target: string,
			type: { trigger: string },
			sections: { type: string, text?: string }[]
		}
	} | null
}) => {
	if (perk.type !== FeatureType.Ability || !perk.data) {
		return;
	}
	const ability = perk.data.ability;
	if (!perkGrantAbilityIds.has(ability.id)) {
		return;
	}
	if (ability.name === perk.name && mapping[`element:${perk.id}:name`]) {
		perkGrantNames.set(ability.id, { name: ability.name, key: `element:${perk.id}:name` });
	}
	const descriptionKey = `element:${perk.id}:description`;
	if (ability.description && mapping[descriptionKey]) {
		perkGrantDescriptions.set(ability.id, { text: ability.description, key: descriptionKey });
	}
	perkGrantSections.set(ability.id, ability.sections.map(section => section.type === 'text' ? section.text ?? null : null));
	const triggerKey = `element:${ability.id}:trigger`;
	if (ability.type.trigger && mapping[triggerKey]) {
		perkGrantTriggers.set(ability.id, ability.type.trigger);
	}
	const targetKey = `element:${ability.id}:target`;
	if (ability.target && mapping[targetKey]) {
		perkGrantTargets.set(ability.id, ability.target);
	}
};

[ ExplorationPerkData, IntriguePerkData, SupernaturalPerkData ].forEach(group => {
	Object.values(group).forEach(perk => {
		if (perk && typeof perk === 'object' && 'id' in perk) {
			rememberPerkGrant(perk);
		}
	});
});

type PerkUi = ReturnType<typeof useUI>;

const perkGrantLabelKeys: Record<string, string> = {
	Magic: 'enum:AbilityKeyword:Magic',
	Maneuver: 'enum:AbilityUsage:Maneuver',
	Ranged: 'enum:AbilityKeyword:Ranged',
	Strike: 'term.strike'
};

/** Approved labels for these perk abilities. The calls are the UI test's source bindings. */
export const perkGrantUi = (ui: PerkUi, english: string): string => {
	switch (english) {
		case 'Distance': return ui.text('ui.hero-builder.distance.b7bdf7a2', 'Distance');
		case 'Target': return ui.text('ui.hero-builder.target.978354db', 'Target');
		case 'Distance / Target': return ui.text('ui.hero-builder.distance-target.2c3fa3ef', 'Distance / Target');
		case 'Self': return ui.text('ui.hero-builder.self.85bc0f95', 'Self');
		case 'Effect': return ui.text('ui.hero-builder.effect.2252d5cf', 'Effect');
		case 'Trigger': return ui.text('ui.hero-builder.trigger.8b9c6437', 'Trigger');
		case 'Psionic': return ui.text('ui.hero-builder.psionic.cd9fca98', 'Psionic');
		case 'Triggered Action': return ui.text('ui.hero-builder.triggered-action.5550c36a', 'Triggered Action');
		case 'Free Triggered Action': return ui.text('ui.hero-builder.free-triggered-action.acb2b603', 'Free Triggered Action');
		case 'Main Action': return ui.text('ui.hero-builder.main-action.147a0625', 'Main Action');
		default: return english;
	}
};

/** Two-character sash labels for every ability that uses these monograms. */
export const abilitySashLabel = (ui: PerkUi, monogram: string): string => {
	switch (monogram) {
		case 'main': return ui.text('ui.hero-builder.main-sash.0d6e4079', 'main');
		case 'maneuver': return ui.text('ui.hero-builder.maneuver-sash.ce99528b', 'maneuver');
		case 'move': return ui.text('ui.hero-builder.move-sash.683a62ce', 'move');
		case 'free': return ui.text('ui.hero-builder.free-sash.ad95d5fa', 'free');
		case 'trigger': return ui.text('ui.hero-builder.trigger-sash.683259fe', 'trigger');
		default: return monogram;
	}
};

/** An approved glossary or UI word on one of these perk abilities. Anything else stays as written. */
export const perkGrantLabel = (abilityId: string, english: string, ui: PerkUi): string => {
	if (!perkGrantAbilityIds.has(abilityId)) {
		return english;
	}
	const glossary = perkGrantLabelKeys[english];
	if (glossary) {
		return translate(glossary, english);
	}
	return perkGrantUi(ui, english);
};

/** Approved action labels and glossary words shared by perk and official ancestry abilities. */
export const abilityMetadataLabel = (ability: { id: string, name: string, actionType?: string }, english: string, ui: PerkUi): string => {
	if (isOfficialAncestryAbility(ability)) {
		const source = ancestryAbilities.get(ability.id);
		if (english === 'Area' && ui.language === 'zh-TW' && source?.keywords.includes(english as Ability['keywords'][number])) {
			return ui.text('ui.hero-builder.ancestry-area.024dc204', 'Area');
		}
		const glossary = perkGrantLabelKeys[english];
		return glossary ? translate(glossary, english) : perkGrantUi(ui, english);
	}
	return perkGrantLabel(ability.id, english, ui);
};

/** Safe built-in values shared by official ancestry ability metadata. */
export const ancestryAbilityMetadataValue = (ability: { id: string, name: string, actionType?: string }, english: string, ui: PerkUi): string => {
	if (!isOfficialAncestryAbility(ability)) {
		return english;
	}
	const source = ancestryAbilities.get(ability.id);
	if (english === 'Self') {
		return perkGrantUi(ui, 'Self');
	}
	if (ui.language === 'zh-TW') {
		const isCanonicalDistance = source?.distance.some(distance => AbilityLogic.getDistance(distance, source, undefined) === english);
		const burst = /^(\d+) Burst$/.exec(english);
		if (isCanonicalDistance && burst) {
			return ui.format('ui.hero-builder.ancestry-burst.b3ee1661', '{value} Burst', english, { value: burst[1] });
		}
		const cube = /^(\d+) Cube within (\d+)$/.exec(english);
		if (isCanonicalDistance && cube) {
			return ui.format('ui.hero-builder.ancestry-cube-within.7de28835', '{size} Cube within {distance}', english, { size: cube[1], distance: cube[2] });
		}
	}
	const ranged = /^(Ranged)( \d+.*)$/.exec(english);
	if (ranged) {
		return `${translate('enum:AbilityKeyword:Ranged', ranged[1])}${ranged[2]}`;
	}
	return english;
};

/** Approved ancestry targeting phrase. Custom and non-ancestry targets stay as written. */

export const ancestryAbilityTarget = (ability: { id: string, name: string, actionType?: string }, target: string, ui: PerkUi): string => {
	if (isOfficialAncestryAbility(ability) && ui.language === 'zh-TW') {
		const canonicalTarget = ancestryAbilities.get(ability.id)?.target;
		if (canonicalTarget !== target) {
			return target;
		}
		if (target === 'Each enemy in the area') {
			return ui.text('ui.hero-builder.ancestry-each-enemy.9f98d4d1', 'Each enemy in the area');
		}
		switch (target) {
			case 'One creature': return ui.text('ui.hero-builder.target-one-creature.bdc53e7b', 'One creature');
			case 'One creature bearing your sigil': return ui.text('ui.hero-builder.target-one-creature-sigil.e1206b59', 'One creature bearing your sigil');
			case 'One creature or object': return ui.text('ui.hero-builder.target-creature-object.1c9539cc', 'One creature or object');
			case 'Self or one ally': return ui.text('ui.hero-builder.target-self-ally.d296a449', 'Self or one ally');
		}
	}
	return target;
};

/** Approved full ancestry trigger phrases, guarded by the unchanged official ability source. */
export const ancestryAbilityTriggerText = (ability: { id: string, name: string, actionType?: string }, trigger: string, ui: PerkUi): string | undefined => {
	if (!isOfficialAncestryAbility(ability) || ui.language !== 'zh-TW'
		|| ancestryAbilities.get(ability.id)?.type.trigger !== trigger) {
		return undefined;
	}
	switch (trigger) {
		case 'You, or a creature adjacent to you, takes damage from a strike': return ui.text('ui.hero-builder.trigger-draconian-guard.59674111', 'You, or a creature adjacent to you, takes damage from a strike');
		case 'You take damage from a creature': return ui.text('ui.hero-builder.trigger-creature-damage.d99e1985', 'You take damage from a creature');
		case 'You take damage that isn’t untyped': return ui.text('ui.hero-builder.trigger-untyped-damage.c921df18', 'You take damage that isn’t untyped');
		case 'You, or a creature adjacent to you, makes a power roll': return ui.text('ui.hero-builder.trigger-adjacent-power-roll.66545558', 'You, or a creature adjacent to you, makes a power roll');
		case 'Whenever you are force moved': return ui.text('ui.hero-builder.trigger-force-moved.86b1e2b2', 'Whenever you are force moved');
		case 'You are targeted with a strike': return ancestryUiText(trigger, ui);
		default: return undefined;
	}
};

/** Translate approved roll headers only when the official ancestry roll is unchanged. */
export const ancestryAbilityRollHeader = (ability: Ability, header: string, ui: PerkUi): string => {
	if (!isOfficialAncestryAbility(ability) || ui.language !== 'zh-TW') {
		return header;
	}
	const canonical = ancestryAbilities.get(ability.id);
	const sourceRoll = canonical?.sections.find(section => section.type === 'roll');
	const currentRoll = ability.sections.find(section => section.type === 'roll');
	if (!sourceRoll || sourceRoll.type !== 'roll' || !currentRoll || currentRoll.type !== 'roll'
		|| currentRoll.roll.characteristic.join('|') !== sourceRoll.roll.characteristic.join('|')) {
		return header;
	}
	const sourceHeader = `Power Roll + ${sourceRoll.roll.characteristic.join(' or ')}`;
	return header === sourceHeader ? ancestryUiText(sourceHeader, ui) ?? header : header;
};

/** Approved ancestry tier text by official ID, guarded against user-renamed abilities. */
export const ancestryAbilityTierById = (ability: { id: string, name: string, actionType?: string }, tier: number, shown: string, ui: PerkUi): string => {
	if (!isOfficialAncestryAbility(ability) || !Number.isInteger(tier) || tier < 1 || tier > 3) {
		return shown;
	}
	const canonicalAbility = ancestryAbilities.get(ability.id);
	const source = canonicalAbility?.sections.find(section => section.type === 'roll');
	if (!source || source.type !== 'roll') {
		return shown;
	}
	const canonical = [ source.roll.tier1, source.roll.tier2, source.roll.tier3 ][tier - 1];
	if (ui.language === 'zh-TW' && shown === canonical) {
		const localized = ancestryAbilityTierText(ability.id, tier, ui);
		if (localized) {
			return localized;
		}
	}
	if (ui.language === 'zh-TW') {
		const projected = computedAncestryTierText(ability.id, tier, shown, ui);
		if (projected) {
			return projected;
		}
	}
	if (!/^\d+ damage(?:; push \d+)?$/.test(canonical)) {
		return shown;
	}
	const damage = /^(\d+) damage$/.exec(shown);
	if (damage) {
		return ui.format('ui.hero-builder.ancestry-damage.04b5358f', '{value} damage', shown, { value: damage[1] });
	}
	const pushed = /^(\d+) damage; push (\d+)$/.exec(shown);
	if (pushed && /; push \d+$/.test(canonical)) {
		return ui.format('ui.hero-builder.ancestry-damage-push.002730d6', '{damage} damage; push {distance}', shown, { damage: pushed[1], distance: pushed[2] });
	}
	return shown;
};

/** Reuse each ability's approved Chinese tier while projecting upstream-calculated values. */
const computedAncestryTierText = (abilityId: string, tier: number, shown: string, ui: PerkUi): string | undefined => {
	const result = plainForLookup(shown).trim();
	const approved = ancestryAbilityTierText(abilityId, tier, ui);
	if (!approved) {
		return undefined;
	}
	if (abilityId === 'wode-elf-feature-2-5') {
		const match = /^(\d+) damage; A < (\d+) (slowed|restrained) \(save ends\)$/.exec(result);
		if (!match) {
			return undefined;
		}
		const [ damageText, effectText ] = approved.split('；');
		const damageUnitLength = 2;
		const effectParts = effectText.split('，');
		const threshold = effectParts[0];
		const thresholdSeparator = threshold.lastIndexOf(' < ');
		if (!damageText || !effectParts[1] || thresholdSeparator < 0) {
			return undefined;
		}
		return `${match[1]} ${damageText.slice(-damageUnitLength)}；${threshold.slice(0, thresholdSeparator + 3)}\`${match[2]}\`，${effectParts.slice(1).join('，')}`;
	}
	if (abilityId === 'revenant-feature-4-5-2') {
		const match = /^(\d+) damage; slide (\d+)$/.exec(result);
		if (!match) {
			return undefined;
		}
		const parts = approved.split('；');
		if (parts.length !== 2) {
			return undefined;
		}
		parts[0] = `${match[1]} ${parts[0].slice(-2)}`;
		parts[1] = `${parts[1].slice(0, parts[1].lastIndexOf(' ') + 1)}${match[2]}`;
		return parts.join('；');
	}
	if (abilityId === 'time-raider-feature-2-5-1') {
		const match = /^(\d+) damage(?:; push (\d+))?(?:; M < (\d+) prone)?$/.exec(result);
		if (!match) {
			return undefined;
		}
		const parts = approved.split('；');
		if (parts.length < 1 || parts.length > 3) {
			return undefined;
		}
		parts[0] = `${match[1]} ${parts[0].slice(-2)}`;
		if (match[2] && parts[1]) {
			parts[1] = `${parts[1].slice(0, parts[1].lastIndexOf(' ') + 1)}${match[2]}`;
		}
		if (match[3] && parts[2]) {
			const thresholdSeparator = parts[2].lastIndexOf(' < ');
			if (thresholdSeparator < 0) {
				return undefined;
			}
			const conditionParts = parts[2].slice(thresholdSeparator + 3).split('，');
			parts[2] = `${parts[2].slice(0, thresholdSeparator + 3)}\`${match[3]}\`${conditionParts.length > 1 ? `，${conditionParts.slice(1).join('，')}` : ''}`;
		}
		return parts.join('；');
	}
	if (abilityId === 'time-raider-feature-2-5-2') {
		const match = /^(\d+) psychic damage; slide (\d+)$/.exec(result);
		if (!match) {
			return undefined;
		}
		const parts = approved.split('；');
		if (parts.length !== 2) {
			return undefined;
		}
		parts[0] = `${match[1]} ${parts[0].slice(-4)}`;
		parts[1] = `${parts[1].slice(0, parts[1].lastIndexOf(' ') + 1)}${match[2]}`;
		return parts.join('；');
	}
	return undefined;
};

const ancestryAbilityTierText = (abilityId: string, tier: number, ui: PerkUi): string | undefined => {
	if (abilityId === 'wode-elf-feature-2-5') {
		switch (tier) {
			case 1: return ui.text('ui.hero-builder.wode-tier-1.3703ac76', '2 + M or A damage; A < [weak] slowed (save ends)');
			case 2: return ui.text('ui.hero-builder.wode-tier-2.954a7369', '3 + M or A damage; A < [average] slowed (save ends)');
			case 3: return ui.text('ui.hero-builder.wode-tier-3.e40c6a44', '5 + M or A damage; A < [strong] restrained (save ends)');
		}
	}
	if (abilityId === 'revenant-feature-4-5-2') {
		switch (tier) {
			case 1: return ui.text('ui.hero-builder.sigil-tier-1.7d9ec74e', '3 + R, I, or P damage; slide 1');
			case 2: return ui.text('ui.hero-builder.sigil-tier-2.22746c9f', '5 + R, I, or P damage; slide 2');
			case 3: return ui.text('ui.hero-builder.sigil-tier-3.fc65f971', '7 + R, I, or P damage; slide 3');
		}
	}
	if (abilityId === 'time-raider-feature-2-5-1') {
		switch (tier) {
			case 1: return ui.text('ui.hero-builder.slam-tier-1.2c6b0e34', '2 + R, I, or P damage');
			case 2: return ui.text('ui.hero-builder.slam-tier-2.719485ce', '5 + R, I, or P damage; push 1');
			case 3: return ui.text('ui.hero-builder.slam-tier-3.9cbf7f6d', '7 + R, I, or P damage; push 2; M < [strong] prone');
		}
	}
	if (abilityId === 'time-raider-feature-2-5-2') {
		switch (tier) {
			case 1: return ui.text('ui.hero-builder.bolt-tier-1.c23fccd2', '2 + R, I, or P psychic damage; slide 1');
			case 2: return ui.text('ui.hero-builder.bolt-tier-2.d520ad1c', '5 + R, I, or P psychic damage; slide 2');
			case 3: return ui.text('ui.hero-builder.bolt-tier-3.644c6a0d', '7 + R, I, or P psychic damage; slide 3');
		}
	}
	return undefined;
};

/** Approved compact ancestry power-roll patterns; only unchanged source rolls are localized. */
export const ancestryAbilityTier = (ability: Ability, tier: number, shown: string, ui: PerkUi): string => {
	const canonical = ancestryAbilities.get(ability.id);
	const sourceRoll = canonical?.sections.find(section => section.type === 'roll');
	const currentRoll = ability.sections.find(section => section.type === 'roll');
	if (!sourceRoll || sourceRoll.type !== 'roll' || !currentRoll || currentRoll.type !== 'roll'
		|| currentRoll.roll.tier1 !== sourceRoll.roll.tier1 || currentRoll.roll.tier2 !== sourceRoll.roll.tier2 || currentRoll.roll.tier3 !== sourceRoll.roll.tier3) {
		return shown;
	}
	return ancestryAbilityTierById(ability, tier, shown, ui);
};

/** Comma-separated keywords. Only a word with its own approved row changes. */
export const perkGrantList = (abilityId: string, english: string, ui: PerkUi): string => {
	if (!english) {
		return english;
	}
	return english.split(', ').map(part => perkGrantLabel(abilityId, part, ui)).join(', ');
};

/** Approved stat-block labels for the familiar. Other monsters stay as written. */
export const familiarBlockLabel = (ui: PerkUi, monsterId: string, english: string): string => {
	if (monsterId !== 'familiar') {
		return english;
	}
	switch (english) {
		case 'Movement': return ui.text('ui.hero-builder.movement.49ba63e8', 'Movement');
		case 'Immunities': return ui.text('ui.hero-builder.immunities.3721f3cd', 'Immunities');
		case 'Weaknesses': return ui.text('ui.hero-builder.weaknesses.af393b75', 'Weaknesses');
		default: return english;
	}
};

/** The classic-sheet type word for this summon perk. */
export const familiarSummonLabel = (ui: PerkUi, feature: { id: string, type: string }): string | undefined => {
	if (feature.id !== 'perk-familiar' || feature.type !== 'Summon') {
		return undefined;
	}
	return ui.text('ui.hero-builder.summon.759c2262', 'Summon');
};

/**
 * The familiar stamina bonus prints the approved per-level template.
 * `{value}` keeps the stored sign. English mode stays on the upstream phrase.
 */
export const familiarPerLevelLine = (ui: PerkUi, modifier: { value: number, valuePerLevel: number }): string | undefined => {
	if (!modifier.value || modifier.value !== modifier.valuePerLevel) {
		return undefined;
	}
	const signed = `${modifier.value >= 0 ? '+' : ''}${modifier.value}`;
	const shown = ui.format(
		'ui.hero-builder.bonus-per-level.f68c64a2',
		'`${mod.value >= 0 ? \'+\' : \'\'}${mod.value} per level`',
		`${signed} per level`,
		{ value: signed }
	);
	return shown === `${signed} per level` ? undefined : shown;
};

/** "Ranged 10" keeps the upstream number. "Self" uses the approved UI word. */
export const perkGrantDistance = (abilityId: string, english: string, ui: PerkUi): string => {
	if (!perkGrantAbilityIds.has(abilityId)) {
		return english;
	}
	if (english === 'Self') {
		return perkGrantUi(ui, 'Self');
	}
	const match = /^Ranged( \d+.*)$/.exec(english);
	if (!match) {
		return english;
	}
	return `${translate('enum:AbilityKeyword:Ranged', 'Ranged')}${match[1]}`;
};

/** The approved target sentence, or the approved word for Self. */
export const perkGrantTarget = (abilityId: string, target: string, ui: PerkUi): string => {
	const ancestry = ancestryAbilities.get(abilityId);
	if (ancestry && ui.language === 'zh-TW' && ancestry.target === target) {
		if (target === 'Self') {
			return perkGrantUi(ui, 'Self');
		}
		switch (target) {
			case 'Each enemy in the area': return ui.text('ui.hero-builder.ancestry-each-enemy.9f98d4d1', 'Each enemy in the area');
			case 'One creature': return ui.text('ui.hero-builder.target-one-creature.bdc53e7b', 'One creature');
			case 'One creature bearing your sigil': return ui.text('ui.hero-builder.target-one-creature-sigil.e1206b59', 'One creature bearing your sigil');
			case 'One creature or object': return ui.text('ui.hero-builder.target-creature-object.1c9539cc', 'One creature or object');
			case 'Self or one ally': return ui.text('ui.hero-builder.target-self-ally.d296a449', 'Self or one ally');
		}
	}
	const key = abilityTargetKey({ id: abilityId, target });
	if (key) {
		return translate(key, target);
	}
	if (target === 'Self') {
		return perkGrantLabel(abilityId, 'Self', ui);
	}
	return target;
};

export const abilityTriggerKey = (abilityId: string, shown: string): string | undefined => {
	const source = perkGrantTriggers.get(abilityId);
	if (source === undefined || shown !== source) {
		return undefined;
	}
	const key = `element:${abilityId}:trigger`;
	return mapping[key] ? key : undefined;
};

export const abilityTargetKey = (ability: { id: string, target: string }): string | undefined => {
	const source = perkGrantTargets.get(ability.id);
	if (source === undefined || ability.target !== source) {
		return undefined;
	}
	const key = `element:${ability.id}:target`;
	return mapping[key] ? key : undefined;
};

/**
 * The key for a basic action's name, or an ancestry ability's name.
 *
 * Only when the name on screen is still the Forge Steel English stored on
 * the ability. A hero who renamed it through abilityCustomizations keeps
 * that typed name. An ability that is not one of these, including Free
 * Strike (melee) and Free Strike (ranged), has no key.
 */
export const abilityNameKey = (ability: { id: string, name: string }): string | undefined => {
	const kit = kitAbilityNameKey(ability);
	if (kit) {
		return kit;
	}
	const perk = perkGrantNames.get(ability.id);
	if (perk) {
		if (!ability.name || ability.name !== perk.name) {
			return undefined;
		}
		return perk.key;
	}
	const dataName = abilities.get(ability.id)?.name;
	if (!ability.name || dataName === undefined || ability.name !== dataName) {
		return undefined;
	}
	return `element:${ability.id}:name`;
};

const sectionKeyForSource = (abilityId: string, index: number, shown: string, source: string, canonical: string | undefined, requireMapping: boolean): string | undefined => {
	const stored = plainForLookup(source).trim();
	if (canonical !== undefined && plainForLookup(canonical).trim() !== stored) {
		return undefined;
	}
	const key = `section:${abilityId}:${index}`;
	if (requireMapping && !mapping[key]) {
		return undefined;
	}
	const lookup = canonical !== undefined && hasCalculationBinding(key) ? canonical : shown;
	if (plainForLookup(lookup).trim() !== stored && !isProjectedCalculation(key, source, shown)) {
		return undefined;
	}
	return key;
};

/**
 * The key for one text section of a basic action, ancestry ability, or one of
 * these perk grants.
 *
 * Only when the data section at this index is a text section, and the supplied
 * text still matches that English once `**bold**` marks are removed and both
 * sides are trimmed. A classic-sheet `**Effect:**` prefix, a rewritten sentence,
 * a roll or field section, and an action that is not one of these stay as
 * written. Mapped action sections can receive a key; unmapped ones stay as
 * written. Perk sections require an approved usage key. With canonical source
 * supplied, only an approved calculation binding may key rewritten display text.
 */
export const abilitySectionKey = (abilityId: string, index: number, shown: string, canonical?: string): string | undefined => {
	const perkSections = perkGrantSections.get(abilityId);
	if (perkSections) {
		const stored = perkSections[index];
		if (!stored) {
			return undefined;
		}
		return sectionKeyForSource(abilityId, index, shown, stored, canonical, true);
	}
	const kitSection = standardKitAbilities.get(abilityId)?.sections[index];
	if (kitSection) {
		if (kitSection.type !== 'text') {
			return undefined;
		}
		const kitShown = shown.replace(/^\*\*Effect:\*\*\s*/, '');
		return sectionKeyForSource(abilityId, index, kitShown, kitSection.text, canonical, true);
	}
	const section = abilities.get(abilityId)?.sections[index];
	if (!section || section.type !== 'text') {
		return undefined;
	}
	const ancestryShown = ancestryAbilities.has(abilityId) ? shown.replace(/^\*\*Effect:\*\*\s*/, '') : shown;
	return sectionKeyForSource(abilityId, index, ancestryShown, section.text, canonical, false);
};

/**
 * An ancestry ability's unchanged description, or one of these perk grants
 * when the short description is still the stored English.
 */
export const abilityDescriptionKey = (ability: { id: string, description?: string }): string | undefined => {
	const perk = perkGrantDescriptions.get(ability.id);
	if (perk) {
		if (!ability.description || ability.description !== perk.text) {
			return undefined;
		}
		return perk.key;
	}
	const kitDescription = standardKitAbilities.get(ability.id)?.description;
	if (kitDescription !== undefined) {
		if (!ability.description || ability.description !== kitDescription) {
			return undefined;
		}
		const key = `element:${ability.id}:description`;
		return mapping[key] ? key : undefined;
	}
	const description = ancestryAbilities.get(ability.id)?.description;
	if (!ability.description || description === undefined || ability.description !== description) {
		return undefined;
	}
	return `element:${ability.id}:description`;
};

/** A classic card's description. Sheet data and layout estimates remain English. */
export const AbilityDescription = (props: { ability: { id: string, description?: string } }) => {
	return useL10nText(abilityDescriptionKey(props.ability), props.ability.description || '');
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
