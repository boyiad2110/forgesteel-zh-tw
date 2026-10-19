import { Drawer, Select, Space } from 'antd';
import { Feature, FeatureAncestryChoiceData } from '@/models/feature';
import { Ancestry } from '@/models/ancestry';
import { AncestryPanel } from '@/components/panels/elements/ancestry-panel/ancestry-panel';
import { Collections } from '@/utils/collections';
import { Empty } from '@/components/controls/empty/empty';
import { Field } from '@/components/controls/field/field';
import { Hero } from '@/models/hero';
import { Markdown } from '@/components/controls/markdown/markdown';
import { Modal } from '@/components/modals/modal/modal';
import { PanelMode } from '@/enums/panel-mode';
import { PlayerName } from '@/l10n/player-name';
import { isOfficialAncestryDescriptionSource } from '@/l10n/official-feature-source';
import { SelectionBox } from '@/components/panels/feature-config-panel/feature-config-panel';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';

interface InfoProps {
	data: FeatureAncestryChoiceData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoAncestryChoice = (props: InfoProps) => {
	if (!props.data.selected) {
		return null;
	}

	return (
		<AncestryPanel
			ancestry={props.data.selected}
			sourcebooks={props.sourcebooks || []}
		/>
	);
};

interface ConfigProps {
	data: FeatureAncestryChoiceData;
	feature: Feature;
	hero: Hero;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureAncestryChoiceData) => void;
}

export const ConfigAncestryChoice = (props: ConfigProps) => {
	const ui = useUI();
	const [ selectedAncestry, setSelectedAncestry ] = useState<Ancestry | null>(null);

	const ancestries = SourcebookLogic.getAncestries(props.sourcebooks);
	const sortedAncestries = Collections.sort(ancestries, a => a.name);
	const selectedSourceAncestry = props.data.selected;
	const selectedAncestryDescription = selectedSourceAncestry ?
		<Markdown
			text={selectedSourceAncestry.description}
			useSpan={true}
			l10nKey={isOfficialAncestryDescriptionSource(selectedSourceAncestry, props.sourcebooks) ? `element:${selectedSourceAncestry.id}:description` : undefined}
		/>
		: undefined;

	if (sortedAncestries.length === 0) {
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
				placeholder={ui.text('ui.hero-builder.select-an-ancestry.942750ad', 'Select an ancestry')}
				options={sortedAncestries.map(a => ({ label: a.name, value: a.id, desc: a.description }))}
				optionRender={option => {
					const ancestry = sortedAncestries.find(a => a.id === option.data.value);
					const approvedAncestry = ancestry && isOfficialAncestryDescriptionSource(ancestry, props.sourcebooks);
					return (
						<Field
							label={ancestry ? <PlayerName element={ancestry} /> : option.data.label}
							value={approvedAncestry
								? <Markdown text={option.data.desc} l10nKey={`element:${ancestry.id}:description`} />
								: option.data.desc}
						/>
					);
				}}
				labelRender={option => {
					const ancestry = sortedAncestries.find(a => a.id === option.value);
					return ancestry ? <PlayerName element={ancestry} /> : option.label;
				}}
				value={props.data.selected ? props.data.selected.id : null}
				onChange={value => {
					const dataCopy = Utils.copy(props.data);
					dataCopy.selected = SourcebookLogic.getAncestries(props.sourcebooks).find(a => a.id === value) || null;
					props.setData(dataCopy);
				}}
			/>
			{
				props.data.selected ?
					<SelectionBox
						content={
							<Field
								style={{ flex: '1 1 0' }}
								label={<PlayerName element={props.data.selected} />}
								value={selectedAncestryDescription}
							/>
						}
						onSelect={() => setSelectedAncestry(props.data.selected)}
					/>
					: null
			}
			<Drawer open={!!selectedAncestry} onClose={() => setSelectedAncestry(null)} closeIcon={null} size={500}>
				<Modal
					content={selectedAncestry ? <AncestryPanel ancestry={selectedAncestry} sourcebooks={props.sourcebooks} mode={PanelMode.Full} /> : null}
					onClose={() => setSelectedAncestry(null)}
				/>
			</Drawer>
		</Space>
	);
};
