import { abilityTargetKey, abilityTriggerKey, perkGrantDistance, perkGrantLabel } from '@/l10n/ability-text';
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
	const sashPhrase = monogram === 'maneuver' ? 'Maneuver' : monogram === 'trigger' ? 'Triggered Action' : monogram === 'free' ? 'Free Triggered Action' : '';
	const translatedSash = sashPhrase ? perkGrantLabel(props.ability.id, sashPhrase, ui) : monogram;
	const sashLabel = !sashPhrase || translatedSash === sashPhrase ? monogram : translatedSash;
	const distanceLabel = props.ability.target !== distance ? 'Distance' : 'Distance / Target';

	return (
		<div className='ability-info-panel'>
			{monogram ? <SashPanel monogram={monogram} label={sashLabel} /> : null}
			<div className='ds-text compact-text bold-text' style={{ position: 'relative', zIndex: '10' }}>
				{perkGrantLabel(props.ability.id, FormatLogic.getAbilityType(props.ability.type), ui)}
			</div>
			{
				distance ?
					<Field
						compact={true}
						label={perkGrantLabel(props.ability.id, distanceLabel, ui)}
						value={<Markdown useSpan={true} text={perkGrantDistance(props.ability.id, distance, ui)} />}
					/>
					: null
			}
			{
				props.ability.target && (props.ability.target !== distance) ?
					<Field
						compact={true}
						label={perkGrantLabel(props.ability.id, 'Target', ui)}
						value={<Markdown useSpan={true} text={props.ability.target} l10nKey={abilityTargetKey(props.ability)} />}
					/>
					: null
			}
			{
				props.ability.type.trigger ?
					<Field
						compact={true}
						label={perkGrantLabel(props.ability.id, 'Trigger', ui)}
						value={<Markdown useSpan={true} text={props.ability.type.trigger} l10nKey={abilityTriggerKey(props.ability.id, props.ability.type.trigger)} />}
					/>
					: null
			}
		</div>
	);
};
