import { AbilityDescription, AbilityName, abilitySectionKey, abilityTriggerKey, perkGrantDistance, perkGrantLabel, perkGrantList, perkGrantTarget } from '@/l10n/ability-text';
import { AbilitySheet, PowerRollSection } from '@/models/classic-sheets/ability-sheet';
import { Collections } from '@/utils/collections';
import { DrawSteelSymbolText } from '@/components/panels/classic-sheet/components/ds-symbol-text-component';
import { Markdown } from '@/components/controls/markdown/markdown';
import { arcaneTrickSection } from '@/l10n/perk-prose';
import { useUI } from '@/l10n/ui-text';
import { isStandardKitAbility } from '@/l10n/kit-text';

import './ability-card.scss';

import distanceIcon from '@/assets/icons/distance.svg';
import rollT1 from '@/assets/icons/power-roll-t1.svg';
import rollT2 from '@/assets/icons/power-roll-t2.svg';
import rollT3 from '@/assets/icons/power-roll-t3.svg';
import targetIcon from '@/assets/icons/target.svg';

interface Props {
	ability: AbilitySheet;
}

export const AbilityCard = (props: Props) => {
	const ability = props.ability;
	const ui = useUI();

	const getAbilityCost = () => {
		if (ability.cost > 0) {
			return (
				<span className='cost'>{ability.cost}</span>
			);
		}
	};

	const getStatsSection = () => {
		return (
			<div className='stats'>
				<div className='keywords-action-type'>
					<div className='keywords'>{perkGrantList(ability.id, ability.keywords || '', ui)}</div>
					<div className='action-type'>{perkGrantLabel(ability.id, ability.actionType || '', ui)}</div>
				</div>
				<div className='distance-target'>
					<div className='distance'>
						{ability.distance?.length ?
							<img src={distanceIcon} alt={perkGrantLabel(ability.id, 'Distance', ui)} />
							: undefined }
						<span>{perkGrantDistance(ability.id, ability.distance || '', ui)}</span>
					</div>
					<div className='target'>
						{ability.target?.length ?
							<img src={targetIcon} alt={perkGrantLabel(ability.id, 'Target', ui)} />
							: undefined }
						<span>{perkGrantTarget(ability.id, ability.target || '', ui)}</span>
					</div>
				</div>
			</div>
		);
	};

	const getTriggerSection = () => {
		if (ability.trigger) {
			const label = perkGrantLabel(ability.id, 'Trigger', ui);
			if (label !== 'Trigger') {
				return (
					<div className='trigger'>
						<Markdown text={`**${label}:**`} className='trigger' />
						<Markdown text={ability.trigger} className='trigger' l10nKey={abilityTriggerKey(ability.id, ability.trigger)} />
					</div>
				);
			}
			return (
				<Markdown
					text={'**Trigger:** ' + ability.trigger}
					className='trigger'
				/>
			);
		}
	};

	const getSections = () => {
		let isFirstText = true;
		return ability.sections.map((s, n) => {
			if (typeof s === 'string') {
				const result = getEffectSection(s, isFirstText, n);
				isFirstText = false;
				return result;
			} else {
				return getPowerRollSection(s, n);
			}
		});
	};

	const getPowerRollSection = (section: PowerRollSection, key: number) => {
		return (
			<div className='power-roll' key={key}>
				<div className='power'>Power Roll + <DrawSteelSymbolText content={section.rollPower} lookFor='characteristics' /></div>
				<div className='roll-tiers'>
					<div className='tier t1'>
						<img src={rollT1} alt='≤ 11' className='range' />
						<div className='effect'>
							<DrawSteelSymbolText content={section.rollT1Effect} lookFor='potencies' />
						</div>
					</div>
					<div className='tier t2'>
						<img src={rollT2} alt='12 - 16' className='range' />
						<div className='effect'>
							<DrawSteelSymbolText content={section.rollT2Effect} lookFor='potencies' />
						</div>
					</div>
					<div className='tier t3'>
						<img src={rollT3} alt='17 +' className='range' />
						<div className='effect'>
							<DrawSteelSymbolText content={section.rollT3Effect} lookFor='potencies' />
						</div>
					</div>
				</div>
				{
					section.rollBonuses ?
						<div className='roll-bonuses'>
							{section.rollBonuses.map(bonus => (
								<p key={bonus.name}>
									<strong>{bonus.name}</strong>: {bonus.tier1} | {bonus.tier2} | {bonus.tier3} {bonus.type} damage
								</p>
							))}
						</div>
						: null
				}
			</div>
		);
	};

	const getEffectSection = (section: string, isFirstText: boolean, key: number) => {
		const label = perkGrantLabel(ability.id, 'Effect', ui);
		const listed = arcaneTrickSection(ability.id, section);
		const kitKey = !listed && isStandardKitAbility(ability) ? abilitySectionKey(ability.id, key, section) : undefined;
		const split = isFirstText && label !== 'Effect' && !(section.startsWith('##') || ability.isNotTrueAbility);
		let text = listed ?? section;
		if (!listed && !split && isFirstText && !(section.startsWith('##') || ability.isNotTrueAbility)) {
			text = '**Effect:** ' + section;
		}
		return (
			<div className='effect' key={key}>
				{kitKey ? <Markdown text={`**${ui.text('ui.hero-builder.effect.2252d5cf', 'Effect')}:**`} className='ability-effect' /> : null}
				{split ? <Markdown text={`**${label}:**`} className='ability-effect' /> : null}
				<Markdown
					text={kitKey ? section : text}
					className='ability-effect'
					l10nKey={kitKey ?? (listed ? undefined : abilitySectionKey(ability.id, key, text))}
				/>
			</div>
		);
	};

	const getCardClasses = (ability: AbilitySheet) => {
		const classes = [ 'ability', 'card' ];
		if (ability.actionType) {
			classes.push(ability.actionType.toLocaleLowerCase().split(' ').join('-'));
		}
		if (ability.abilityType) {
			classes.push(ability.abilityType.toLocaleLowerCase().split(' ').join('-'));
		}
		return Collections.distinct(classes, c => c).join(' ');
	};

	return (
		<div className={getCardClasses(ability)}>
			<section className='bordered'>
				<h3>{perkGrantLabel(ability.id, ability.abilityType || '', ui)}</h3>
				<h2><span className='ability-name'><AbilityName ability={ability} /></span>{getAbilityCost()}</h2>
				{ability.description?.length ?
					<p className='description'><AbilityDescription ability={ability} /></p>
					: undefined }
				{getStatsSection()}
				{ability.qualifiers?.map((q, i) => {
					return (<div className='action-qualifier' key={`qualifier-${i}`}>{q}</div>);
				})}
				{getTriggerSection()}
				{getSections()}
			</section>
		</div>
	);
};
