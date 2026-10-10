import { Button, Flex } from 'antd';
import { CloseOutlined, InfoCircleOutlined, ThunderboltFilled, ThunderboltOutlined } from '@ant-design/icons';
import { Feature, FeatureData, FeatureSkillChoice } from '@/models/feature';
import { ReactNode, useState } from 'react';
import { isDefaultLanguageFeature, isOfficialFeatureSource } from '@/l10n/official-feature-source';
import { skillListKey, skillNameKey, useSkillListNames, useSkillNames } from '@/l10n/skill-text';
import { AbilityLogic } from '@/logic/ability-logic';
import { ConfigFeature } from '@/components/features/feature';
import { DangerButton } from '@/components/controls/danger-button/danger-button';
import { FeatureLogic } from '@/logic/feature-logic';
import { FeatureType } from '@/enums/feature-type';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { Markdown } from '@/components/controls/markdown/markdown';
import { Perk } from '@/models/perk';
import { SkillList } from '@/enums/skill-list';
import { Sourcebook } from '@/models/sourcebook';
import { mapping } from '@/l10n/mapping';
import { peekCatalog } from '@/l10n/catalog';
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
const allStandardSkillLists = [ SkillList.Crafting, SkillList.Exploration, SkillList.Interpersonal, SkillList.Intrigue, SkillList.Lore ];

const isGeneratedAnyListSkillChoice = (feature: Feature | Perk): feature is FeatureSkillChoice => {
	if (feature.type !== FeatureType.SkillChoice) {
		return false;
	}

	const { options, listOptions, count } = feature.data;
	if (options.length !== 0 || count < 1 || ![ 1, 2, 3, 5 ].includes(count)
		|| listOptions.length !== allStandardSkillLists.length
		|| !allStandardSkillLists.every((list, index) => listOptions[index] === list)
		|| feature.name !== (count === 1 ? 'Skill' : 'Skills')) {
		return false;
	}

	const expectedDescription = count === 1
		? 'Choose a skill from any list.'
		: `Choose ${count} from any list.`;
	return feature.description === expectedDescription;
};

interface Props {
	feature: Feature | Perk;
	detailsSourceFeature?: Feature;
	hero: Hero;
	sourcebooks: Sourcebook[];
	setData: (featureID: string, data: FeatureData) => void;
	onDelete?: () => void;
}

export const FeatureConfigPanel = (props: Props) => {
	const ui = useUI();
	const [ autoCalc, setAutoCalc ] = useState<boolean>(true);
	const detailsSkillChoice = props.detailsSourceFeature?.type === FeatureType.SkillChoice
		? props.detailsSourceFeature as FeatureSkillChoice
		: undefined;
	const sourceSkillChoice = detailsSkillChoice || (isOfficialFeatureSource(props.feature as Feature, props.sourcebooks)
		&& props.feature.type === FeatureType.SkillChoice
		? props.feature as FeatureSkillChoice
		: isGeneratedAnyListSkillChoice(props.feature) ? props.feature : undefined);
	const skillOptions = sourceSkillChoice?.data.options || [];
	const skillLists = sourceSkillChoice?.data.listOptions || [];
	const translatedSkillOptions = useSkillNames(skillOptions);
	const translatedSkillLists = useSkillListNames(skillLists);

	const hasLoadedTarget = (key: string) => {
		const sheetID = mapping[key]?.sheetId;
		return !!sheetID && !!peekCatalog()?.[sheetID]?.zh?.trim();
	};

	const getDetailsSkillDescription = () => {
		if (!sourceSkillChoice || props.feature.type !== FeatureType.SkillChoice || ui.language !== 'zh-TW') {
			return undefined;
		}

		const count = sourceSkillChoice.data.count;
		if (![ 1, 2, 3, 5 ].includes(count)) {
			return undefined;
		}

		const sourceParts = [
			...sourceSkillChoice.data.options,
			...(sourceSkillChoice.data.listOptions.length === 5
				? [ 'any list' ]
				: sourceSkillChoice.data.listOptions.map(list => `${list} skills`))
		];
		if (sourceParts.length === 0) {
			return undefined;
		}

		const expected = count > 1
			? `Choose ${count} from ${sourceParts.join(', ')}.`
			: `Choose a skill from ${sourceParts.join(', ')}.`;
		// The source feature can use its description for narrative flavor text.
		// DetailsSection rebuilds the feature with the generated choice prompt,
		// which is the string we need to guard here.
		if (props.feature.description !== expected) {
			return undefined;
		}

		const translatedParts: string[] = [];
		let optionIndex = 0;
		let listIndex = 0;
		for (const part of sourceParts) {
			if (part === 'any list') {
				if (!hasLoadedTarget('ui:ui.hero-builder.any-skill-list.7f7a6841')) {
					return undefined;
				}
				translatedParts.push(ui.text('ui.hero-builder.any-skill-list.7f7a6841', 'any list'));
				listIndex = sourceSkillChoice.data.listOptions.length;
				continue;
			}

			if (part.endsWith(' skills')) {
				const list = sourceSkillChoice.data.listOptions[listIndex];
				const groupKey = skillListKey(list);
				if (`${list} skills` !== part || !hasLoadedTarget(groupKey)) {
					return undefined;
				}
				const translated = ui.format('ui.hero-builder.skill-list-description.f94c20ab', '`${list} skills`', part, { list: translatedSkillLists[listIndex] });
				if (translated === part) {
					return undefined;
				}
				translatedParts.push(translated);
				listIndex += 1;
				continue;
			}

			const key = skillNameKey(part);
			if (sourceSkillChoice.data.options[optionIndex] !== part || !hasLoadedTarget(key)) {
				return undefined;
			}
			translatedParts.push(translatedSkillOptions[optionIndex]);
			optionIndex += 1;
		}

		if (optionIndex !== skillOptions.length || listIndex !== skillLists.length) {
			return undefined;
		}

		const source = translatedParts.join(' / ');
		return count > 1
			? ui.format('ui.hero-builder.skills-choice-description.1a7008a2', '`Choose ${count} from ${source}.`', expected, { count, source })
			: ui.format('ui.hero-builder.skill-choice-description.9172d5a4', '`Choose a skill from ${source}.`', expected, { source });
	};

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
		if (props.detailsSourceFeature && isDefaultLanguageFeature(props.detailsSourceFeature)
			&& props.feature.id === 'default-language' && props.feature.type === FeatureType.LanguageChoice) {
			desc = ui.text('ui.hero-builder.common-language-description.cc9ef9be', 'Choose a Common language.');
		} else if (props.detailsSourceFeature?.type === FeatureType.LanguageChoice
			&& props.detailsSourceFeature.description === 'Choose 2  languages.'
			&& props.detailsSourceFeature.data.count === 2
			&& props.detailsSourceFeature.data.allowedTypes.length === 4
			&& props.feature.type === FeatureType.LanguageChoice
			&& props.feature.description === props.detailsSourceFeature.description) {
			desc = ui.text('ui.hero-builder.two-languages-description.0139e42b', 'Choose 2  languages.');
		}

		const skillChoiceDescription = getDetailsSkillDescription();
		if (skillChoiceDescription) {
			desc = skillChoiceDescription;
		}

		if (autoCalc) {
			desc = AbilityLogic.getTextEffect(desc, props.hero);
		}

		return desc;
	};

	const getName = () => {
		if (!detailsSkillChoice && sourceSkillChoice && props.feature.type === FeatureType.SkillChoice) {
			const prefix = (sourceSkillChoice.data.listOptions.length < 5)
				&& (sourceSkillChoice.data.options.length === 0)
				? `${sourceSkillChoice.data.listOptions.join(' / ')} `
				: '';
			const generatedName = `${prefix}${sourceSkillChoice.data.count === 1 ? 'Skill' : 'Skills'}`;
			if (props.feature.name === generatedName && prefix) {
				const list = translatedSkillLists.join(' / ');
				return ui.format('ui.hero-builder.skill-list-description.f94c20ab', '`${list} skills`', generatedName, { list });
			}
		}
		if (props.detailsSourceFeature && props.feature.type === FeatureType.LanguageChoice
			&& props.detailsSourceFeature.type === FeatureType.LanguageChoice) {
			if (isDefaultLanguageFeature(props.detailsSourceFeature) && props.feature.id === 'default-language') {
				return ui.text('ui.hero-builder.default-language.28bee244', 'Default Language');
			}
			if (props.feature.name === 'Languages' && props.detailsSourceFeature.name === 'Languages') {
				return ui.text('ui.hero-builder.languages.318655ce', 'Languages');
			}
			if (props.feature.name === 'Language' && props.detailsSourceFeature.name === 'Language') {
				return ui.text('ui.hero-builder.language.996aaf3b', 'Language');
			}
		}
		if (props.detailsSourceFeature?.type === FeatureType.SkillChoice
			&& props.feature.type === FeatureType.SkillChoice && props.feature.name === 'Skill') {
			return ui.text('ui.hero-builder.skill.a5ed2dcb', 'Skill');
		}
		if (sourceSkillChoice && isGeneratedAnyListSkillChoice(props.feature)) {
			return ui.text('ui.hero-builder.skill.a5ed2dcb', 'Skill');
		}
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
