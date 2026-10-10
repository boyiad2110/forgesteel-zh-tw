import { Feature, FeatureMultipleData } from '@/models/feature';
import { Expander } from '@/components/controls/expander/expander';
import { FeatureListEditPanel } from '@/components/panels/edit/list-edit/list-edit-panel';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { Hero } from '@/models/hero';
import { PanelMode } from '@/enums/panel-mode';
import { Sourcebook } from '@/models/sourcebook';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';

interface InfoProps {
	data: FeatureMultipleData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoMultiple = (props: InfoProps) => {
	const ui = useUI();
	if (props.data.features.length === 0) {
		return null;
	}

	if (props.feature.description) {
		return (
			<Expander title={ui.text('ui.hero-builder.features.31d1245f', 'Features')}>
				{props.data.features.map(f => <FeaturePanel key={f.id} feature={f} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />)}
			</Expander>
		);
	}

	return (
		<div>
			{
				props.data.features.map(f => (
					<div key={f.id} className='container'>
						<FeaturePanel feature={f} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />
					</div>
				))
			}
		</div>
	);
};

interface EditProps {
	data: FeatureMultipleData;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureMultipleData) => void;
}

export const EditMultiple = (props: EditProps) => {
	const ui = useUI();
	const [ data, setData ] = useState<FeatureMultipleData>(Utils.copy(props.data));

	const onChange = (features: Feature[]) => {
		const copy = Utils.copy(data);
		copy.features = Utils.copy(features);
		setData(copy);
		props.setData(copy);
	};

	return (
		<FeatureListEditPanel
			title={ui.text('ui.hero-builder.features.31d1245f', 'Features')}
			features={data.features}
			sourcebooks={props.sourcebooks}
			onChange={onChange}
		/>
	);
};
