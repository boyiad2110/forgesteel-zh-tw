import { useUI } from '@/l10n/ui-text';

type UI = ReturnType<typeof useUI>;

/** Approved Forge Steel labels used only after a caller verifies official ancestry source data. */
export const ancestryUiText = (english: string, ui: UI): string | undefined => {
	if (ui.language !== 'zh-TW') {
		return undefined;
	}
	switch (english) {
		case 'When you can use all your arms in the attempt': return ui.text('ui.hero-builder.ancestry-condition-all-arms.8cc038d7', 'When you can use all your arms in the attempt');
		case 'When resisting environmental effects or a creature’s traits or abilities': return ui.text('ui.hero-builder.ancestry-condition-resisting-effects.4dc8b301', 'When resisting environmental effects or a creature’s traits or abilities');
		case 'When noticing threats': return ui.text('ui.hero-builder.ancestry-condition-noticing-threats.82f01689', 'When noticing threats');
		case 'When recalling lore': return ui.text('ui.hero-builder.ancestry-condition-recalling-lore.41dee668', 'When recalling lore');
		case 'When lifting and hauling heavy objects': return ui.text('ui.hero-builder.ancestry-condition-lifting-hauling.153ce9f9', 'When lifting and hauling heavy objects');
		case 'When parsing schematics, maps, and other systematic documents that aren’t inherently chaotic': return ui.text('ui.hero-builder.ancestry-condition-parsing-documents.3e54cb37', 'When parsing schematics, maps, and other systematic documents that aren’t inherently chaotic');
		case 'When interacting with undead creatures': return ui.text('ui.hero-builder.ancestry-condition-interacting-undead.488ee1e7', 'When interacting with undead creatures');
		case 'You are targeted with a strike': return ui.text('ui.hero-builder.ancestry-trigger-targeted-by-strike.3b5a09c7', 'You are targeted with a strike');
		case 'Might tests': return ui.text('ui.hero-builder.ancestry-scope-might-tests.1fdd0d78', 'Might tests');
		case 'All tests': return ui.text('ui.hero-builder.ancestry-scope-all-tests.c8966d43', 'All tests');
		case 'Reason, Intuition, Presence tests': return ui.text('ui.hero-builder.ancestry-scope-reason-intuition-presence.56765d20', 'Reason, Intuition, Presence tests');
		case 'Presence tests using Flirt, Persuade': return ui.text('ui.hero-builder.ancestry-scope-presence-flirt-persuade.50bb7256', 'Presence tests using Flirt, Persuade');
		case 'Hide, Sneak': return ui.text('ui.hero-builder.ancestry-scope-hide-sneak.ace7141d', 'Hide, Sneak');
		case 'Climb, Gymnastics, Swim': return ui.text('ui.hero-builder.ancestry-scope-climb-gymnastics-swim.4aa03efa', 'Climb, Gymnastics, Swim');
		case 'MOVEMENT MODE': return ui.text('ui.hero-builder.ancestry-movement-mode-label.3251952c', 'MOVEMENT MODE');
		case 'Power Roll + Might or Presence': return ui.text('ui.hero-builder.ancestry-power-roll-might-presence.0ea0eaad', 'Power Roll + Might or Presence');
		case 'Power Roll + Might or Agility': return ui.text('ui.hero-builder.ancestry-power-roll-might-agility.ad066156', 'Power Roll + Might or Agility');
		case 'Power Roll + Reason or Intuition or Presence': return ui.text('ui.hero-builder.ancestry-power-roll-reason-intuition-presence.c37df268', 'Power Roll + Reason or Intuition or Presence');
		case 'Forced Movement: Push': return ui.text('ui.hero-builder.ancestry-forced-movement-push.14a22b13', 'Forced Movement: Push');
		case 'Forced Movement: Pull': return ui.text('ui.hero-builder.ancestry-forced-movement-pull.f6e02a59', 'Forced Movement: Pull');
		case 'Forced Movement: Slide': return ui.text('ui.hero-builder.ancestry-forced-movement-slide.8b9656a6', 'Forced Movement: Slide');
		case 'Stamina +6 per echelon': return ui.text('ui.hero-builder.ancestry-stamina-per-echelon.56bdc7d5', 'Stamina +6 per echelon');
		case '+1 SURGE PER ENCOUNTER': return ui.text('ui.hero-builder.ancestry-surge-per-encounter.9459bbc7', '+1 SURGE PER ENCOUNTER');
		case 'Start of combat': return ui.text('ui.hero-builder.ancestry-surge-start-of-combat.787b64ff', 'Start of combat');
		default: return undefined;
	}
};
