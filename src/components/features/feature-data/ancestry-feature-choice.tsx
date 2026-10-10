import { Feature, FeatureAncestryFeatureChoiceData } from '@/models/feature';
import { Select, Space } from 'antd';
import { Ancestry } from '@/models/ancestry';
import { Collections } from '@/utils/collections';
import { Empty } from '@/components/controls/empty/empty';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { FeatureType } from '@/enums/feature-type';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { HeroLogic } from '@/logic/hero-logic';
import { NumberSpin } from '@/components/controls/number-spin/number-spin';
import { PlayerName } from '@/l10n/player-name';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Toggle } from '@/components/controls/toggle/toggle';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';

interface InfoProps {
	data: FeatureAncestryFeatureChoiceData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoAncestryFeatureChoice = (props: InfoProps) => {
	const ui = useUI();
	if (!props.data.selected) {
		const fragment = ui.text('ui.hero-builder.pt-ancestry-feature.c76f6671', 'pt ancestry feature.');
		const localized = fragment !== 'pt ancestry feature.';
		return (
			<div className='ds-text'>{localized ? '' : 'A '}{props.data.value}{localized ? ' ' : ''}{fragment}</div>
		);
	}

	return null;
};

interface EditProps {
	data: FeatureAncestryFeatureChoiceData;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureAncestryFeatureChoiceData) => void;
}

export const EditAncestryFeatureChoice = (props: EditProps) => {
	const [ data, setData ] = useState<FeatureAncestryFeatureChoiceData>(Utils.copy(props.data));

	const setSourceCurrent = (value: boolean) => {
		const copy = Utils.copy(data);
		copy.source.current = value;
		setData(copy);
		props.setData(copy);
	};

	const setSourceFormer = (value: boolean) => {
		const copy = Utils.copy(data);
		copy.source.former = value;
		setData(copy);
		props.setData(copy);
	};

	const setValue = (value: number) => {
		const copy = Utils.copy(data);
		copy.value = value;
		setData(copy);
		props.setData(copy);
	};

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<HeaderText>Source</HeaderText>
			<Toggle label='Current ancestry' value={data.source.current} onChange={setSourceCurrent} />
			<Toggle label='Former ancestry' value={data.source.former} onChange={setSourceFormer} />
			<HeaderText>Value</HeaderText>
			<NumberSpin value={data.value} onChange={setValue} />
		</Space>
	);
};

interface ConfigProps {
	data: FeatureAncestryFeatureChoiceData;
	feature: Feature;
	hero: Hero;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureAncestryFeatureChoiceData) => void;
}

export const ConfigAncestryFeatureChoice = (props: ConfigProps) => {
	const ui = useUI();
	const currentFeatureIDs = HeroLogic.getFeatures(props.hero)
		.map(f => f.feature)
		.filter(f => f.id !== props.feature.id)
		.map(f => f.id);

	const ancestries: Ancestry[] = [];
	if (props.data.source.customID && props.sourcebooks) {
		const a = SourcebookLogic.getAncestries(props.sourcebooks).find(a => a.id === props.data.source.customID);
		if (a) {
			ancestries.push(a);
		}
	} else {
		if (props.data.source.current && props.hero.ancestry) {
			ancestries.push(props.hero.ancestry);
		}
		if (props.data.source.former) {
			ancestries.push(...HeroLogic.getFormerAncestries(props.hero));
		}
	}

	const features = ancestries
		.flatMap(a => a.features)
		.filter(f => f.type === FeatureType.Choice)
		.flatMap(f => f.data.options)
		.filter(opt => props.data.value === opt.value)
		.filter(opt => opt.feature.type !== FeatureType.AncestryFeatureChoice)
		.map(opt => opt.feature);
	const sortedFeatures = Collections.sort(features, f => f.name);

	if (sortedFeatures.length === 0) {
		return (
			<Empty text='There are no options to choose for this feature.' />
		);
	}

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<Select
				style={{ width: '100%' }}
				status={!props.data.selected ? 'warning' : ''}
				allowClear={true}
				placeholder={ui.text('ui.hero-builder.select-a-feature-from-an-anc.baf83c80', 'Select a feature from an ancestry')}
				options={sortedFeatures.map(f => ({ label: f.name, value: f.id, desc: f.description || f.type, disabled: currentFeatureIDs.includes(f.id) }))}
				optionRender={option => {
					const feature = sortedFeatures.find(f => f.id === option.data.value);
					return <Field disabled={option.data.disabled} label={feature ? <PlayerName element={feature} /> : option.data.label} value={option.data.desc} />;
				}}
				labelRender={option => {
					const feature = sortedFeatures.find(f => f.id === option.value);
					return feature ? <PlayerName element={feature} /> : option.label;
				}}
				value={props.data.selected ? props.data.selected.id : null}
				onChange={value => {
					const dataCopy = Utils.copy(props.data);
					dataCopy.selected = features.find(f => f.id === value) || null;
					props.setData(dataCopy);
				}}
			/>
			{
				props.data.selected ?
					<FeaturePanel feature={props.data.selected} />
					: null
			}
		</Space>
	);
};
