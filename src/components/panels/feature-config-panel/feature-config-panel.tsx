import { Button, Flex } from 'antd';
import { CloseOutlined, InfoCircleOutlined, ThunderboltFilled, ThunderboltOutlined } from '@ant-design/icons';
import { Feature, FeatureData } from '@/models/feature';
import { ReactNode, useState } from 'react';
import { AbilityLogic } from '@/logic/ability-logic';
import { ConfigFeature } from '@/components/features/feature';
import { DangerButton } from '@/components/controls/danger-button/danger-button';
import { FeatureLogic } from '@/logic/feature-logic';
import { FeatureType } from '@/enums/feature-type';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { Markdown } from '@/components/controls/markdown/markdown';
import { Perk } from '@/models/perk';
import { Sourcebook } from '@/models/sourcebook';
import { useUI } from '@/l10n/ui-text';

import './feature-config-panel.scss';

const purchasedTraitFeatureIDs = new Set([
	'devil-feature-2',
	'dragon-knight-feature-2',
	'dwarf-feature-2',
	'wode-elf-feature-2',
	'high-elf-feature-2',
	'hakaan-feature-2',
	'human-feature-2',
	'memonek-feature-3',
	'orc-feature-2',
	'polder-feature-3',
	'revenant-feature-4',
	'time-raider-feature-2'
]);

const cultureLanguageFeatureIDs = new Set([
	'culture-bespoke-culture-language',
	'culture-artisan-guild-language',
	'culture-borderland-homestead-language',
	'culture-college-conclave-language',
	'culture-criminal-gang-language',
	'culture-farming-village-language',
	'culture-herding-community-language',
	'culture-knightly-order-language',
	'culture-mercenary-band-language',
	'culture-merchant-caravan-language',
	'culture-monastic-order-language',
	'culture-noble-house-language',
	'culture-outlaw-band-language',
	'culture-pauper-neighborhood-language',
	'culture-pirate-crew-language',
	'culture-telepathic-hive-language',
	'culture-traveling-entertainers-language',
	'culture-devil-language',
	'culture-dragon-knight-language',
	'culture-dwarf-language',
	'culture-wode-elf-language',
	'culture-high-elf-language',
	'culture-hakaan-language',
	'culture-human-language',
	'culture-memonek-language',
	'culture-orc-language',
	'culture-polder-language',
	'culture-time-raider-language'
]);

const choiceDescription = 'This feature allows you to choose from a collection of features.';
const interpersonalSkillDescription = 'Choose a skill from Interpersonal skills.';
const cultureLanguageDescription = 'Choose a  language.';

interface Props {
	feature: Feature | Perk;
	hero: Hero;
	sourcebooks: Sourcebook[];
	setData: (featureID: string, data: FeatureData) => void;
	onDelete?: () => void;
}

export const FeatureConfigPanel = (props: Props) => {
	const ui = useUI();
	const [ autoCalc, setAutoCalc ] = useState<boolean>(true);

	const autoCalcAvailable = () => {
		return (props.feature.type === FeatureType.Text) && (AbilityLogic.getTextEffect(props.feature.description, props.hero) !== props.feature.description);
	};

	const getDescription = () => {
		let desc;

		if (props.feature.type === FeatureType.Ability) {
			desc = props.feature.data.ability.description;
		} else {
			desc = props.feature.description;
		}

		if (!desc) {
			desc = FeatureLogic.getFeatureTypeDescription(props.feature.type);
		}

		if (purchasedTraitFeatureIDs.has(props.feature.id)
			&& props.feature.name === 'Purchased Traits'
			&& props.feature.type === FeatureType.Choice
			&& desc === choiceDescription) {
			desc = ui.text('ui.hero-builder.choice-feature-description.3a5f7705', 'This feature allows you to choose from a collection of features.');
		}
		if (props.feature.id === 'devil-feature-1b'
			&& props.feature.name === 'Interpersonal Skill'
			&& props.feature.type === FeatureType.SkillChoice
			&& desc === interpersonalSkillDescription) {
			desc = ui.text('ui.hero-builder.interpersonal-skill-description.3ff1394b', 'Choose a skill from Interpersonal skills.');
		}
		if (cultureLanguageFeatureIDs.has(props.feature.id)
			&& props.feature.name === 'Language'
			&& props.feature.type === FeatureType.LanguageChoice
			&& desc === cultureLanguageDescription) {
			desc = ui.text('ui.hero-builder.culture-language-description.ad467037', 'Choose a  language.');
		}

		if (autoCalc) {
			desc = AbilityLogic.getTextEffect(desc, props.hero);
		}

		return desc;
	};

	const getName = () => {
		if (purchasedTraitFeatureIDs.has(props.feature.id) && props.feature.name === 'Purchased Traits') {
			return ui.text('ui.hero-builder.purchased-traits.394205e5', 'Purchased Traits');
		}
		if (props.feature.id === 'devil-feature-1b'
			&& props.feature.name === 'Interpersonal Skill'
			&& props.feature.type === FeatureType.SkillChoice
			&& props.feature.description === interpersonalSkillDescription) {
			return ui.text('ui.hero-builder.interpersonal-skill.3095ff6f', 'Interpersonal Skill');
		}
		if (cultureLanguageFeatureIDs.has(props.feature.id)
			&& props.feature.name === 'Language'
			&& props.feature.type === FeatureType.LanguageChoice
			&& props.feature.description === cultureLanguageDescription) {
			return ui.text('ui.hero-builder.language.996aaf3b', 'Language');
		}
		return props.feature.name || ui.text('ui.hero-builder.unnamed-feature.fe5fa185', 'Unnamed Feature');
	};

	return (
		<div className='feature-config-panel'>
			<HeaderText
				extra={
					<>
						{
							autoCalcAvailable() ?
								<Button
									key='autocalc'
									type='text'
									title={ui.text('ui.hero-builder.auto-calculate-damage-potenc.dfd07bc3', 'Auto-calculate damage, potency, etc')}
									icon={autoCalc ? <ThunderboltFilled style={{ color: 'var(--fs-accent)' }} /> : <ThunderboltOutlined />}
									onClick={e => { e.stopPropagation(); setAutoCalc(!autoCalc); }}
								/>
								: null
						}
						{
							props.onDelete ?
								<DangerButton
									key='delete'
									mode='clear'
									onConfirm={() => props.onDelete!()}
								/>
								: null
						}
					</>
				}
			>
				{getName()}
			</HeaderText>
			<Markdown text={getDescription()} />
			<ConfigFeature
				feature={props.feature}
				hero={props.hero}
				sourcebooks={props.sourcebooks}
				setData={data => props.setData(props.feature.id, data)}
			/>
		</div>
	);
};

interface SelectionBoxProps {
	content: ReactNode;
	customizeContent?: ReactNode;
	transparent?: boolean;
	onSelect?: () => void;
	onRemove?: () => void;
}

export const SelectionBox = (props: SelectionBoxProps) => {
	const ui = useUI();
	return (
		<div className={props.transparent ? 'selection-box' : 'selection-box with-border'}>
			<Flex align='center' justify='space-between' gap={10}>
				{props.content}
				<Flex vertical={true}>
					{
						props.onSelect ?
							<Button
								type='text'
								title={ui.text('ui.hero-builder.show-details.257cf510', 'Show details')}
								icon={<InfoCircleOutlined />}
								onClick={e => {
									e.stopPropagation();
									props.onSelect!();
								}}
							/>
							: null
					}
					{
						props.onRemove ?
							<Button
								type='text'
								title={ui.text('ui.hero-builder.remove.5fd82c75', 'Remove')}
								icon={<CloseOutlined />}
								onClick={e => {
									e.stopPropagation();
									props.onRemove!();
								}}
							/>
							: null
					}
				</Flex>
			</Flex>
			{props.customizeContent}
		</div>
	);
};
