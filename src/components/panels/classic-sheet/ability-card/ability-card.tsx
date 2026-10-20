import { AbilityDescription, AbilityName, abilitySectionKey, abilityTriggerKey, ancestryAbilityTierById, ancestryAbilityTriggerText, isOfficialAncestryAbility, perkGrantDistance, perkGrantLabel, perkGrantTarget, perkGrantUi } from '@/l10n/ability-text';
import { kitAbilityClassicRollHeader, kitAbilityMetadataValue, kitAbilityTier } from '@/l10n/kit-ability-details';
import { AbilitySheet, PowerRollSection } from '@/models/classic-sheets/ability-sheet';
import { Collections } from '@/utils/collections';
import { DrawSteelSymbolText } from '@/components/panels/classic-sheet/components/ds-symbol-text-component';
import { Markdown } from '@/components/controls/markdown/markdown';
import { mapping } from '@/l10n/mapping';
import { arcaneTrickSection } from '@/l10n/perk-prose';
import { useUI } from '@/l10n/ui-text';
import { isStandardKitAbility, kitBonusSourceName, kitFieldLabel } from '@/l10n/kit-text';
import { translate } from '@/l10n/text';

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
		const keywords = ability.keywords?.split(', ').map((keyword, index) => kitAbilityMetadataValue(ability, 'keywords', keyword, index) ?? perkGrantLabel(ability.id, keyword, ui)).join(isStandardKitAbility(ability) ? '、' : ', ');
		const label = (english: 'Distance' | 'Target') => {
			if (!isStandardKitAbility(ability)) {
				return perkGrantLabel(ability.id, english, ui);
			}
			return english === 'Distance'
				? ui.text('ui.hero-builder.distance.b7bdf7a2', 'Distance')
				: ui.text('ui.hero-builder.target.978354db', 'Target');
		};
		return (
			<div className='stats'>
				<div className='keywords-action-type'>
					<div className='keywords'>{keywords}</div>
					<div className='action-type'>{kitAbilityMetadataValue(ability, 'actionType', ability.actionType || '') ?? (isOfficialAncestryAbility(ability) ? perkGrantUi(ui, ability.actionType || '') : perkGrantLabel(ability.id, ability.actionType || '', ui))}</div>
				</div>
				<div className='distance-target'>
					<div className='distance'>
						{ability.distance?.length ?
							<img src={distanceIcon} alt={label('Distance')} />
							: undefined }
						<span>{kitAbilityMetadataValue(ability, 'distance', ability.distance || '') ?? perkGrantDistance(ability.id, ability.distance || '', ui)}</span>
					</div>
					<div className='target'>
						{ability.target?.length ?
							<img src={targetIcon} alt={label('Target')} />
							: undefined }
						<span>{kitAbilityMetadataValue(ability, 'target', ability.target || '') ?? perkGrantTarget(ability.id, ability.target || '', ui)}</span>
					</div>
				</div>
			</div>
		);
	};

	const getTriggerSection = () => {
		if (ability.trigger) {
			const ancestryTrigger = ancestryAbilityTriggerText(ability, ability.trigger, ui);
			const label = perkGrantLabel(ability.id, 'Trigger', ui);
			if (label !== 'Trigger') {
				return (
					<div className='trigger'>
						<Markdown text={`**${label}:**`} className='trigger' />
						<Markdown text={ancestryTrigger ?? ability.trigger} className='trigger' l10nKey={ancestryTrigger ? undefined : abilityTriggerKey(ability.id, ability.trigger)} />
					</div>
				);
			}
			return (
				<Markdown text={'**Trigger:** ' + (ancestryTrigger ?? ability.trigger)} className='trigger' />
			);
		}
	};

	const ancestryTierText = (tier: number, text: string) => isOfficialAncestryAbility(ability)
		? ancestryAbilityTierById(ability, tier, text, ui)
		: text;

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
		const kitRollHeader = kitAbilityClassicRollHeader(ability, section.rollPower || '');
		const rollHeader = kitRollHeader ?? (isStandardKitAbility(ability) && section.rollPower && /^\d+$/.test(section.rollPower)
			? `${translate('term.power-roll', 'Power Roll')} + ${section.rollPower}`
			: `Power Roll + ${section.rollPower}`);
		return (
			<div className='power-roll' key={key}>
				<div className='power'>{kitRollHeader ?? <>{rollHeader.replace(section.rollPower || '', '')}<DrawSteelSymbolText content={section.rollPower} lookFor='characteristics' /></>}</div>
				<div className='roll-tiers'>
					<div className='tier t1'>
						<img src={rollT1} alt='≤ 11' className='range' />
						<div className='effect'>
							<DrawSteelSymbolText content={isStandardKitAbility(ability) ? kitAbilityTier(ability, 1, section.rollT1Effect || '') : ancestryTierText(1, section.rollT1Effect || '')} lookFor='potencies' />
						</div>
					</div>
					<div className='tier t2'>
						<img src={rollT2} alt='12 - 16' className='range' />
						<div className='effect'>
							<DrawSteelSymbolText content={isStandardKitAbility(ability) ? kitAbilityTier(ability, 2, section.rollT2Effect || '') : ancestryTierText(2, section.rollT2Effect || '')} lookFor='potencies' />
						</div>
					</div>
					<div className='tier t3'>
						<img src={rollT3} alt='17 +' className='range' />
						<div className='effect'>
							<DrawSteelSymbolText content={isStandardKitAbility(ability) ? kitAbilityTier(ability, 3, section.rollT3Effect || '') : ancestryTierText(3, section.rollT3Effect || '')} lookFor='potencies' />
						</div>
					</div>
				</div>
				{
					section.rollBonuses ?
						<div className='roll-bonuses'>
							{section.rollBonuses.map(bonus => (
								<p key={bonus.name}>
									<strong>{kitBonusSourceName(bonus.name)}</strong>: {bonus.tier1} | {bonus.tier2} | {bonus.tier3} {kitFieldLabel(ui, bonus.type === 'melee' ? 'Melee Damage' : 'Ranged Damage')}
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
		const sectionKey = !listed && !kitKey ? abilitySectionKey(ability.id, key, text) : undefined;
		const splitEffect = !!kitKey || (!!sectionKey && !!mapping[sectionKey] && text.startsWith('**Effect:** '));
		return (
			<div className='effect' key={key}>
				{splitEffect ? <Markdown text={`**${ui.text('ui.hero-builder.effect.2252d5cf', 'Effect')}:**`} className='ability-effect' /> : null}
				{split ? <Markdown text={`**${label}:**`} className='ability-effect' /> : null}
				<Markdown
					text={splitEffect ? section : text}
					className='ability-effect'
					l10nKey={kitKey ?? sectionKey ?? (listed ? undefined : abilitySectionKey(ability.id, key, text))}
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
				<h3>
					{isStandardKitAbility(ability) && ability.abilityType === 'Signature Ability'
						? ui.text('ui.hero-builder.signature-ability.5252b981', 'Signature Ability')
						: perkGrantLabel(ability.id, ability.abilityType || '', ui)}
				</h3>
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
