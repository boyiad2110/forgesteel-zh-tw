import { Feature, FeatureSpeedData } from '@/models/feature';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { NumberSpin } from '@/components/controls/number-spin/number-spin';
import { Sourcebook } from '@/models/sourcebook';
import { Space } from 'antd';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';

interface InfoProps {
	data: FeatureSpeedData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoSpeed = (props: InfoProps) => {
	const ui = useUI();
	return (
		<Field label={ui.text('ui.hero-builder.speed.a2b81141', 'Speed')} value={props.data.speed} />
	);
};

interface EditProps {
	data: FeatureSpeedData;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureSpeedData) => void;
}

export const EditSpeed = (props: EditProps) => {
	const ui = useUI();
	const [ data, setData ] = useState<FeatureSpeedData>(Utils.copy(props.data));

	const setSpeed = (value: number) => {
		const copy = Utils.copy(data);
		copy.speed = value;
		setData(copy);
		props.setData(copy);
	};

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<HeaderText>{ui.text('ui.hero-builder.speed.a2b81141', 'Speed')}</HeaderText>
			<NumberSpin min={1} value={data.speed} onChange={setSpeed} />
		</Space>
	);
};
