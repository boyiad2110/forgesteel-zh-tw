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

		if (autoCalc) {
			desc = AbilityLogic.getTextEffect(desc, props.hero);
		}

		return desc;
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
				{props.feature.name || ui.text('ui.hero-builder.unnamed-feature.fe5fa185', 'Unnamed Feature')}
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
