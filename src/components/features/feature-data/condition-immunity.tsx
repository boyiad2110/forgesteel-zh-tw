import { Feature, FeatureConditionImmunityData } from '@/models/feature';
import { Select, Space } from 'antd';
import { ConditionName } from '@/l10n/condition-text';
import { ConditionType } from '@/enums/condition-type';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { Sourcebook } from '@/models/sourcebook';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';

interface InfoProps {
	data: FeatureConditionImmunityData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoConditionImmunity = (props: InfoProps) => {
	const ui = useUI();
	return (
		<Field
			label={ui.text('ui.hero-builder.cannot-be.36cd9df2', 'Cannot Be')}
			value={props.data.conditions.map((condition, index) => <span key={`${condition}-${index}`}>{index > 0 ? ', ' : ''}<ConditionName type={condition} /></span>)}
		/>
	);
};

interface EditProps {
	data: FeatureConditionImmunityData;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureConditionImmunityData) => void;
}

export const EditConditionImmunity = (props: EditProps) => {
	const [ data, setData ] = useState<FeatureConditionImmunityData>(Utils.copy(props.data));

	const setConditions = (value: ConditionType[]) => {
		const copy = Utils.copy(data);
		copy.conditions = value;
		setData(copy);
		props.setData(copy);
	};

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<HeaderText>Conditions</HeaderText>
			<Select
				style={{ width: '100%' }}
				placeholder='Select conditions'
				mode='tags'
				allowClear={true}
				options={[ ConditionType.Bleeding, ConditionType.Dazed, ConditionType.Frightened, ConditionType.Grabbed, ConditionType.Prone, ConditionType.Restrained, ConditionType.Slowed, ConditionType.Taunted, ConditionType.Weakened ].map(o => ({ value: o, label: <ConditionName type={o} /> }))}
				optionRender={option => <div className='ds-text'>{option.data.label}</div>}
				value={data.conditions}
				onChange={conditions => setConditions(conditions)}
			/>
		</Space>
	);
};
