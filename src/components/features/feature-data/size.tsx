import { Feature, FeatureSizeData } from '@/models/feature';
import { Segmented, Space } from 'antd';
import { Field } from '@/components/controls/field/field';
import { FormatLogic } from '@/logic/format-logic';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { NumberSpin } from '@/components/controls/number-spin/number-spin';
import { Sourcebook } from '@/models/sourcebook';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';

interface InfoProps {
	data: FeatureSizeData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoSize = (props: InfoProps) => {
	const ui = useUI();
	return (
		<Field label={ui.text('ui.hero-builder.size.0805dc7c', 'Size')} value={FormatLogic.getSize(props.data.size)} />
	);
};

interface EditProps {
	data: FeatureSizeData;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureSizeData) => void;
}

export const EditSize = (props: EditProps) => {
	const ui = useUI();
	const [ data, setData ] = useState<FeatureSizeData>(Utils.copy(props.data));

	const setSizeValue = (value: number) => {
		const copy = Utils.copy(data);
		copy.size.value = value;
		setData(copy);
		props.setData(copy);
	};

	const setSizeMod = (value: '' | 'T' | 'S' | 'M' | 'L') => {
		const copy = Utils.copy(data);
		copy.size.mod = value;
		setData(copy);
		props.setData(copy);
	};

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<HeaderText>{ui.text('ui.hero-builder.size.0805dc7c', 'Size')}</HeaderText>
			<NumberSpin min={1} value={data.size.value} onChange={setSizeValue} />
			{
				data.size.value === 1 ?
					<HeaderText>Modifier</HeaderText>
					: null
			}
			{
				data.size.value === 1 ?
					<Segmented<'' | 'T' | 'S' | 'M' | 'L'>
						name='sizemodtypes'
						block={true}
						options={[ 'T', 'S', 'M', 'L' ]}
						value={data.size.mod}
						onChange={setSizeMod}
					/>
					: null
			}
		</Space>
	);
};
