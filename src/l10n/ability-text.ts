import { hasCalculationBinding, isProjectedCalculation, plainForLookup } from '@/l10n/calculated-text';
import { Ability } from '@/models/ability';
import { AbilityData } from '@/data/ability-data';
import { AncestryData } from '@/data/ancestry-data';
import { ExplorationPerkData } from '@/data/perks/exploration';
import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { IntriguePerkData } from '@/data/perks/intrigue';
import { SupernaturalPerkData } from '@/data/perks/supernatural';
import { mapping } from '@/l10n/mapping';
import { kitAbilityNameKey } from '@/l10n/kit-text';
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
	Ranged: 'enum:AbilityKeyword:Ranged'
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
	const section = abilities.get(abilityId)?.sections[index];
	if (!section || section.type !== 'text') {
		return undefined;
	}
	return sectionKeyForSource(abilityId, index, shown, section.text, canonical, false);
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
