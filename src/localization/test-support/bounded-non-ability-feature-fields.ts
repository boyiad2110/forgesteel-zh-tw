import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { elementFieldIdentity } from '@/localization/catalog';

/**
 * Extracts the player-facing canonical English a bounded non-Ability Feature tree carries,
 * addressed by the same Element-field identities the localization catalog uses.
 *
 * This is deliberately an *independent* second implementation of that walk. The V1 manifest
 * builds the same slice in production; a test that reused the production walk to compute its
 * own expected values could only ever prove the production walk agrees with itself, so a
 * traversal regression would still pass. Nothing here imports the manifest's traversal, its
 * field collector, or any remaining-content builder - only the shared Feature model, the
 * FeatureType enum and the identity primitive, none of which encode traversal semantics.
 *
 * The bounded walk:
 *
 * - A FeatureType.Ability node contributes no identity and is not descended into. Its authored
 *   content (name, description, sections, Power Rolls, ...) belongs to each class's own ability
 *   slice, not here.
 * - Every other node contributes its own `name`, and its `description` when non-empty.
 * - A FeatureType.HeroicResource additionally contributes the trigger of each way it is gained,
 *   addressed by that gain's position in the list. An empty trigger carries no reading and is
 *   skipped, which leaves the surviving triggers on their original indices. A gain's tag and
 *   value are canonical wiring the Hero's own resource calculation reads, not display text.
 * - A FeatureType.Choice is descended into only through `data.options[].feature`, and a
 *   FeatureType.Multiple only through `data.features`. No other Feature type's own selection or
 *   child data is walked, so this stays a bounded, reviewable slice rather than an arbitrary
 *   all-content crawler.
 *
 * Values are recorded exactly as authored - never trimmed, normalized or rewritten - because
 * leading newlines and interior line breaks are part of the canonical text the catalog snapshots.
 * Traversal is deterministic depth-first preorder: a node is recorded before its own children,
 * and each child subtree is finished before the next sibling begins. A re-used identity is a
 * defect in the slice rather than something to silently overwrite, so it throws.
 */
export const extractLiveBoundedNonAbilityFeatureFields = (features: Feature[]): Record<string, string> => {
	const fields: Record<string, string> = {};

	const addField = (elementID: string, field: string, canonicalEnglish: string) => {
		const identity = elementFieldIdentity(elementID, field);
		if (fields[identity] !== undefined) {
			throw new Error(`duplicate localization identity '${identity}'`);
		}
		fields[identity] = canonicalEnglish;
	};

	const walk = (nodes: Feature[]) => {
		nodes.forEach(feature => {
			if (feature.type === FeatureType.Ability) {
				return;
			}

			addField(feature.id, 'name', feature.name);
			if (feature.description !== '') {
				addField(feature.id, 'description', feature.description);
			}

			if (feature.type === FeatureType.HeroicResource) {
				feature.data.gains.forEach((gain, index) => {
					if (gain.trigger === '') {
						return;
					}
					addField(feature.id, `gains.${index}.trigger`, gain.trigger);
				});
			}

			if (feature.type === FeatureType.Choice) {
				walk(feature.data.options.map(option => option.feature));
			}

			if (feature.type === FeatureType.Multiple) {
				walk(feature.data.features);
			}
		});
	};

	walk(features);
	return fields;
};
