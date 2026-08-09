// Presentation-only field paths for the text an ability carries.
//
// An ability section has no canonical ID of its own, and giving it one would change the
// model and the save format. Its localization identity is instead the ability's own ID
// plus the canonical path the text sits at, which these helpers spell out in one place so
// every call site and every catalog entry agree on it.
//
// Nothing here is ever written back to an ability, and none of these paths is a parser
// input, a save key, an option value or a sort key.

/** The description authored on the ability itself. */
export const abilityDescriptionField = 'description';

/** The trigger authored on the ability's type. */
export const abilityTriggerField = 'type.trigger';

const sectionField = (index: number, field: string) => `sections.${index}.${field}`;

/** The body of the text section at this position, e.g. 'sections.0.text'. */
export const abilitySectionTextField = (index: number) => sectionField(index, 'text');

/** The label of the field section at this position, e.g. 'sections.1.name'. */
export const abilitySectionNameField = (index: number) => sectionField(index, 'name');

/** The body of the field section at this position, e.g. 'sections.1.effect'. */
export const abilitySectionEffectField = (index: number) => sectionField(index, 'effect');

/** The power roll the roll section at this position carries; its tiers hang off this path. */
export const abilitySectionRollField = (index: number) => sectionField(index, 'roll');

/** One tier of a power roll reached by the given path, e.g. 'sections.2.roll.tier1'. */
export const powerRollTierField = (rollField: string, tier: number) => `${rollField}.tier${tier}`;
