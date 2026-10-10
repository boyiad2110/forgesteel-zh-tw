import { Feature, FeatureMovementModeData } from '@/models/feature';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { Sourcebook } from '@/models/sourcebook';
import { Space } from 'antd';
import { TextInput } from '@/components/controls/text-input/text-input';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';

interface InfoProps {
	data: FeatureMovementModeData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoMovementMode = (props: InfoProps) => {
	const ui = useUI();
	return (
		<div className='ds-text'>
			{ui.text('ui.hero-builder.you-gain-the.4aa6e0b7', 'You gain the')} <b>{props.data.mode}</b> {ui.text('ui.hero-builder.movement-mode.56db4b3c', 'movement mode.')}
		</div>
	);
};

interface EditProps {
	data: FeatureMovementModeData;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureMovementModeData) => void;
}

export const EditMovementMode = (props: EditProps) => {
	const [ data, setData ] = useState<FeatureMovementModeData>(Utils.copy(props.data));

	const setMode = (value: string) => {
		const copy = Utils.copy(data);
		copy.mode = value;
		setData(copy);
		props.setData(copy);
	};

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<HeaderText>Mode</HeaderText>
			<TextInput
				status={data.mode === '' ? 'warning' : ''}
				placeholder='Mode'
				allowClear={true}
				value={data.mode}
				onChange={setMode}
			/>
		</Space>
	);
};
