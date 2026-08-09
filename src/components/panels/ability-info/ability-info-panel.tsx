/* eslint-disable sort-imports */

import { Ability } from '@/models/ability';
import { AbilityKeyword } from '@/enums/ability-keyword';
import { AbilityLogic } from '@/logic/ability-logic';
import { AbilityUsage } from '@/enums/ability-usage';
import { localizeElementField, localizeMessage, localizeUIString } from '@/localization/resolver';
import { Field } from '@/components/controls/field/field';
import { getAbilityTypeDisplay } from '@/components/panels/ability-info/ability-type-display';
import { Hero } from '@/models/hero';
import { Markdown } from '@/components/controls/markdown/markdown';
import { SashPanel } from '@/components/panels/sash/sash-panel';
import { useLocalization } from '@/contexts/localization-context';

import './ability-info-panel.scss';

interface Props {
	ability: Ability;
	hero?: Hero;
}

export const AbilityInfoPanel = (props: Props) => {
	const { locale } = useLocalization();
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
	const displayTarget = localizeElementField(locale, props.ability.id, 'target', props.ability.target);
	const displaySummary = props.ability.id === 'free-melee' ?
		localizeMessage(locale, 'ability.free-melee.summary', { abilityName: props.ability.name, target: displayTarget }, '{abilityName} | Target: {target}') :
		null;

	return (
		<div className='ability-info-panel'>
			{monogram ? <SashPanel monogram={monogram} /> : null}
			{displaySummary ? <div className='ability-summary-message'>{displaySummary}</div> : null}
			<div className='ds-text compact-text bold-text' style={{ position: 'relative', zIndex: '10' }}>
				{getAbilityTypeDisplay(locale, props.ability.type)}
			</div>
			{
				distance ?
					<Field
						compact={true}
						label={props.ability.target !== distance ? localizeUIString(locale, 'ability-info.distance', 'Distance') : localizeUIString(locale, 'ability-info.distance-target', 'Distance / Target')}
						value={<Markdown useSpan={true} text={distance} />}
					/>
					: null
			}
			{
				props.ability.target && (props.ability.target !== distance) ?
					<Field
						compact={true}
						label={localizeUIString(locale, 'ability-info.target', 'Target')}
						value={<Markdown useSpan={true} text={displayTarget} />}
					/>
					: null
			}
			{
				props.ability.type.trigger ?
					<Field
						compact={true}
						label={localizeUIString(locale, 'ability-info.trigger', 'Trigger')}
						value={<Markdown useSpan={true} text={props.ability.type.trigger} />}
					/>
					: null
			}
		</div>
	);
};
