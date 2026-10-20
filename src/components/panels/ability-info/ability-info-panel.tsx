import { abilityMetadataLabel, abilitySashLabel, abilityTargetKey, abilityTriggerKey, ancestryAbilityMetadataValue, ancestryAbilityTarget, ancestryAbilityTriggerText, isOfficialAncestryAbility, perkGrantDistance } from '@/l10n/ability-text';
import { kitAbilityMetadataValue } from '@/l10n/kit-ability-details';
import { Ability } from '@/models/ability';
import { AbilityKeyword } from '@/enums/ability-keyword';
import { AbilityLogic } from '@/logic/ability-logic';
import { AbilityUsage } from '@/enums/ability-usage';
import { Field } from '@/components/controls/field/field';
import { FormatLogic } from '@/logic/format-logic';
import { Hero } from '@/models/hero';
import { Markdown } from '@/components/controls/markdown/markdown';
import { SashPanel } from '@/components/panels/sash/sash-panel';
import { useUI } from '@/l10n/ui-text';

import './ability-info-panel.scss';

interface Props {
	ability: Ability;
	hero?: Hero;
}

export const AbilityInfoPanel = (props: Props) => {
	const ui = useUI();
	if ((props.ability.type.usage === AbilityUsage.NoAction) && (props.ability.distance.length === 0) && (props.ability.target === '') && (props.ability.type.trigger === '')) {
		return null;
	}

	const getMonogram = () => {
		let monogram = '';

		switch (props.ability.type.usage) {
			case AbilityUsage.MainAction:
				monogram = 'main';
				break;
			case AbilityUsage.Maneuver:
				monogram = 'maneuver';
				break;
			case AbilityUsage.Trigger:
				monogram = 'trigger';
				break;
			case AbilityUsage.Move:
				monogram = 'move';
				break;
			case AbilityUsage.VillainAction:
				monogram = 'villain';
				break;
			case AbilityUsage.ChampionAction:
				monogram = 'champion';
				break;
		}

		if (props.ability.type.free) {
			monogram = 'free';
		}

		const keywords = AbilityLogic.getKeywords(props.ability, props.hero);
		if (keywords.includes(AbilityKeyword.Performance)) {
			monogram = 'perform';
		}

		return monogram;
	};

	const distance = props.ability.distance.map(d => AbilityLogic.getDistance(d, props.ability, props.hero)).join(' or ');
	const monogram = getMonogram();
	const sashLabel = abilitySashLabel(ui, monogram);
	const distanceLabel = props.ability.target !== distance ? 'Distance' : 'Distance / Target';
	const kitActionType = kitAbilityMetadataValue(props.ability, 'actionType', FormatLogic.getAbilityType(props.ability.type));
	const kitDistance = kitAbilityMetadataValue(props.ability, 'distance', distance);
	const kitTarget = kitAbilityMetadataValue(props.ability, 'target', props.ability.target);
	const ancestryTrigger = ancestryAbilityTriggerText(props.ability, props.ability.type.trigger, ui);
	const label = (source: 'Distance' | 'Distance / Target' | 'Target') => {
		if (!kitActionType) {
			return abilityMetadataLabel(props.ability, source, ui);
		}
		switch (source) {
			case 'Distance': return ui.text('ui.hero-builder.distance.b7bdf7a2', 'Distance');
			case 'Distance / Target': return ui.text('ui.hero-builder.distance-target.2c3fa3ef', 'Distance / Target');
			case 'Target': return ui.text('ui.hero-builder.target.978354db', 'Target');
		}
	};

	return (
		<div className='ability-info-panel'>
			{monogram ? <SashPanel monogram={monogram} label={sashLabel} /> : null}
			<div className='ds-text compact-text bold-text' style={{ position: 'relative', zIndex: '10' }}>
				{kitActionType ?? abilityMetadataLabel(props.ability, FormatLogic.getAbilityType(props.ability.type), ui)}
			</div>
			{
				distance ?
					<Field
						compact={true}
						label={label(distanceLabel)}
						value={<Markdown useSpan={true} text={kitDistance ?? (isOfficialAncestryAbility(props.ability) ? ancestryAbilityMetadataValue(props.ability, distance, ui) : perkGrantDistance(props.ability.id, distance, ui))} />}
					/>
					: null
			}
			{
				props.ability.target && (props.ability.target !== distance) ?
					<Field
						compact={true}
						label={label('Target')}
						value={<Markdown useSpan={true} text={kitTarget ?? ancestryAbilityTarget(props.ability, ancestryAbilityMetadataValue(props.ability, props.ability.target, ui), ui)} l10nKey={kitTarget ? undefined : abilityTargetKey(props.ability)} />}
					/>
					: null
			}
			{
				props.ability.type.trigger ?
					<Field
						compact={true}
						label={abilityMetadataLabel(props.ability, 'Trigger', ui)}
						value={<Markdown useSpan={true} text={ancestryTrigger ?? props.ability.type.trigger} l10nKey={ancestryTrigger ? undefined : abilityTriggerKey(props.ability.id, props.ability.type.trigger)} />}
					/>
					: null
			}
		</div>
	);
};
