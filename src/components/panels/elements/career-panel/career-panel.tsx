import { Segmented, Space } from 'antd';
import { Career } from '@/models/career';
import { CareerIncident } from '@/l10n/career-incident';
import { ElementScope } from '@/l10n/element-scope';
import { useUI } from '@/l10n/ui-text';
import { ErrorBoundary } from '@/components/controls/error-boundary/error-boundary';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { Markdown } from '@/components/controls/markdown/markdown';
import { PanelMode } from '@/enums/panel-mode';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { useState } from 'react';

import './career-panel.scss';

interface Props {
	career: Career;
	sourcebooks: Sourcebook[];
	hero?: Hero;
	mode?: PanelMode;
}

export const CareerPanel = (props: Props) => {
	const ui = useUI();
	const [ page, setPage ] = useState<string>('overview');

	const getOverview = () => {
		return (
			<Markdown text={props.career.description} />
		);
	};

	const getFeatures = () => {
		return (
			<Space orientation='vertical' style={{ width: '100%' }}>
				{
					props.career.features.map(f => (
						<SelectablePanel key={f.id}>
							<FeaturePanel feature={f} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />
						</SelectablePanel>
					))
				}
			</Space>
		);
	};

	const getIncidents = () => {
		const option = props.career.incitingIncidents.selected;
		if (option) {
			return (
				<CareerIncident career={props.career} incident={option} sourcebooks={props.sourcebooks}>
					{incident => <Field key={option.id} label={incident.name} value={incident.description} />}
				</CareerIncident>
			);
		}

		return (
			<div>
				{props.career.incitingIncidents.options.map(option => (
					<CareerIncident key={option.id} career={props.career} incident={option} sourcebooks={props.sourcebooks}>
						{incident => <Field label={incident.name} value={incident.description} />}
					</CareerIncident>
				))}
			</div>
		);
	};

	const getContent = () => {
		let content = null;
		switch (page) {
			case 'overview':
				content = getOverview();
				break;
			case 'features':
				content = getFeatures();
				break;
			case 'incidents':
				content = getIncidents();
				break;
		}

		return (
			<>
				<Segmented
					style={{ marginBottom: '20px' }}
					block={true}
					options={[
						{ value: 'overview', label: ui.text('ui.hero-builder.overview.d4b1ea57', 'Overview') },
						{ value: 'features', label: 'Features' },
						{ value: 'incidents', label: ui.text('ui.hero-builder.inciting-incidents.e87c535d', 'Inciting Incidents') }
					]}
					value={page}
					onChange={setPage}
					onClick={e => e.stopPropagation()}
				/>
				{content}
			</>
		);
	};

	const tags = [];
	if (props.sourcebooks.length > 0) {
		const sourcebookType = SourcebookLogic.getCareerSourcebook(props.sourcebooks, props.career)?.type || SourcebookType.Official;
		if (sourcebookType !== SourcebookType.Official) {
			tags.push(sourcebookType);
		}
	}

	if (props.mode !== PanelMode.Full) {
		return (
			<ElementScope element={props.career}>
				<div className='career-panel compact'>
					<HeaderText level={1} tags={tags}>
						{props.career.name || ui.text('ui.hero-builder.unnamed-career.137894c6', 'Unnamed Career')}
					</HeaderText>
					<Markdown text={props.career.description} />
				</div>
			</ElementScope>
		);
	}

	return (
		<ElementScope element={props.career}>
			<ErrorBoundary>
				<div className='class-panel' id={SheetFormatter.getPageId('career', props.career.id)}>
					<HeaderText level={1} tags={tags}>
						{props.career.name || ui.text('ui.hero-builder.unnamed-career.137894c6', 'Unnamed Career')}
					</HeaderText>
					{getContent()}
				</div>
			</ErrorBoundary>
		</ElementScope>
	);
};
