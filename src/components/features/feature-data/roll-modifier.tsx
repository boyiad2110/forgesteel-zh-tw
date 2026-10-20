import { Feature, FeatureRollModifierData, RollModifierScope } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Select, Space } from 'antd';
import { Characteristic } from '@/enums/characteristic';
import { FeatureLogic } from '@/logic/feature-logic';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { RollModifierType } from '@/enums/roll-modifier-type';
import { RollType } from '@/enums/roll-type';
import { SkillList } from '@/enums/skill-list';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { TextInput } from '@/components/controls/text-input/text-input';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';
import { ancestryUiText } from '@/l10n/ancestry-ui';
import { getOfficialAncestryFeatureSource } from '@/l10n/official-feature-source';
import { useL10nText } from '@/l10n/hooks';

interface InfoProps {
	data: FeatureRollModifierData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoRollModifier = (props: InfoProps) => {
	const ui = useUI();
	const scope = FeatureLogic.getRollModifierScope(props.data);
	const ancestrySource = getOfficialAncestryFeatureSource(props.feature, props.sourcebooks || []);
	const ancestryModifier = ancestrySource?.type === FeatureType.RollModifier
		? ancestrySource.data as FeatureRollModifierData
		: undefined;
	const approvedAncestryScope = ancestryModifier
		&& FeatureLogic.getRollModifierScope(ancestryModifier) === scope
		? ancestryUiText(scope, ui)
		: undefined;
	const isImprovedFieldArsenal = props.feature.id === 'tactician-4-3'
		&& props.feature.name === 'Improved Field Arsenal'
		&& props.feature.description === 'Your expertise with weapons has grown.';
	const displayedScope = isImprovedFieldArsenal && scope === 'Ability rolls'
		? ui.text('ui.hero-builder.tactician-ability-rolls.39be354e', 'Ability rolls')
		: approvedAncestryScope ?? scope;
	const displayedCondition = isImprovedFieldArsenal
		&& props.data.condition === 'When you use a signature ability from one of your equipped kits, or make a free strike using a weapon from one of your equipped kits'
		? ui.text('ui.hero-builder.tactician-arsenal-condition.d5a7fdcd', 'When you use a signature ability from one of your equipped kits, or make a free strike using a weapon from one of your equipped kits')
		: ancestryModifier?.condition === props.data.condition
			? ancestryUiText(props.data.condition, ui) ?? props.data.condition
			: props.data.condition;
	const modifierKey = props.data.modifier === RollModifierType.Edge
		? 'enum:RollModifierType:Edge'
		: props.data.modifier === RollModifierType.DoubleEdge
			? 'enum:RollModifierType:DoubleEdge'
			: undefined;
	const displayedModifier = useL10nText(modifierKey, props.data.modifier);
	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<Field label={displayedModifier} value={displayedScope} />
			{
				props.data.condition ?
					<Field label={ui.text('ui.hero-builder.when.ec4ba8f6', 'When')} value={displayedCondition} />
					: null
			}
		</Space>
	);
};

interface EditProps {
	data: FeatureRollModifierData;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureRollModifierData) => void;
}

export const EditRollModifier = (props: EditProps) => {
	const [ data, setData ] = useState<FeatureRollModifierData>(Utils.copy(props.data));

	const update = (changed: Partial<FeatureRollModifierData>) => {
		// Changing the roll type drops any scope it doesn't allow, so nothing is left set but hidden
		const copy = FeatureLogic.clearRollModifierScopes({ ...Utils.copy(data), ...changed });
		setData(copy);
		props.setData(copy);
	};

	const allows = (scope: RollModifierScope) => FeatureLogic.getRollModifierScopes(data.rollType).includes(scope);

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<HeaderText>Modifier</HeaderText>
			<Select
				style={{ width: '100%' }}
				options={[ RollModifierType.Edge, RollModifierType.DoubleEdge, RollModifierType.Bane, RollModifierType.DoubleBane ].map(o => ({ value: o }))}
				optionRender={option => <div className='ds-text'>{option.data.value}</div>}
				value={data.modifier}
				onChange={modifier => update({ modifier: modifier })}
			/>
			<HeaderText>Applies To</HeaderText>
			<Select
				style={{ width: '100%' }}
				options={[ RollType.Test, RollType.Ability, RollType.Strike, RollType.Grab, RollType.EscapeGrab, RollType.Knockback, RollType.Project ].map(o => ({ value: o }))}
				optionRender={option => <div className='ds-text'>{option.data.value}</div>}
				value={data.rollType}
				onChange={rollType => update({ rollType: rollType })}
			/>
			{
				allows('characteristics') ?
					<>
						<HeaderText>Characteristics</HeaderText>
						<Select
							style={{ width: '100%' }}
							placeholder='Any characteristic'
							mode='multiple'
							allowClear={true}
							options={[ Characteristic.Might, Characteristic.Agility, Characteristic.Reason, Characteristic.Intuition, Characteristic.Presence ].map(o => ({ value: o }))}
							optionRender={option => <div className='ds-text'>{option.data.value}</div>}
							value={data.characteristics}
							onChange={characteristics => update({ characteristics: characteristics })}
						/>
					</>
					: null
			}
			{
				allows('skills') ?
					<>
						<HeaderText>Skills</HeaderText>
						<Select
							style={{ width: '100%' }}
							placeholder='Any skill'
							mode='multiple'
							allowClear={true}
							options={SourcebookLogic.getSkills(props.sourcebooks).map(option => ({ value: option.name, description: option.description }))}
							optionRender={option => <Field label={option.data.value} value={option.data.description} />}
							value={data.skills}
							onChange={skills => update({ skills: skills })}
						/>
					</>
					: null
			}
			{
				allows('skillLists') ?
					<>
						<HeaderText>Skill Groups</HeaderText>
						<Select
							style={{ width: '100%' }}
							placeholder='Any skill group'
							mode='multiple'
							allowClear={true}
							options={[ SkillList.Crafting, SkillList.Exploration, SkillList.Interpersonal, SkillList.Intrigue, SkillList.Lore ].map(o => ({ value: o }))}
							optionRender={option => <div className='ds-text'>{option.data.value}</div>}
							value={data.skillLists}
							onChange={skillLists => update({ skillLists: skillLists })}
						/>
					</>
					: null
			}
			<HeaderText>Condition</HeaderText>
			<TextInput
				placeholder='Always applies'
				value={data.condition}
				onChange={condition => update({ condition: condition })}
			/>
		</Space>
	);
};
