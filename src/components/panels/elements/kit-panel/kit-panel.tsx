import { ErrorBoundary } from '@/components/controls/error-boundary/error-boundary';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { AbilityName } from '@/l10n/ability-text';
import { ElementScope } from '@/l10n/element-scope';
import { FeatureType } from '@/enums/feature-type';
import { Hero } from '@/models/hero';
import { Kit } from '@/models/kit';
import { Markdown } from '@/components/controls/markdown/markdown';
import { PanelMode } from '@/enums/panel-mode';
import { Segmented } from 'antd';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';
import { kitEquipmentLabels, kitFieldLabel } from '@/l10n/kit-text';

import './kit-panel.scss';

interface Props {
	kit: Kit;
	sourcebooks: Sourcebook[];
	hero?: Hero;
	mode?: PanelMode;
}

export const KitStats = (props: { kit: Kit }) => {
	const ui = useUI();
	return (
		<>
			{props.kit.armor.length > 0 ? <Field label={kitFieldLabel(ui, 'Armor')} value={kitEquipmentLabels(props.kit.armor)} /> : null}
			{props.kit.weapon.length > 0 ? <Field label='Weapon' value={kitEquipmentLabels(props.kit.weapon)} /> : null}
			{props.kit.stamina > 0 ? <Field label={kitFieldLabel(ui, 'Stamina')} value={`+${props.kit.stamina}`} /> : null}
			{props.kit.speed > 0 ? <Field label={kitFieldLabel(ui, 'Speed')} value={`+${props.kit.speed}`} /> : null}
			{props.kit.stability > 0 ? <Field label={kitFieldLabel(ui, 'Stability')} value={`+${props.kit.stability}`} /> : null}
			{props.kit.meleeDamage ? <Field label='Melee Damage' value={`+${props.kit.meleeDamage.tier1} / +${props.kit.meleeDamage.tier2} / +${props.kit.meleeDamage.tier3}`} /> : null}
			{props.kit.rangedDamage ? <Field label='Ranged Damage' value={`+${props.kit.rangedDamage.tier1} / +${props.kit.rangedDamage.tier2} / +${props.kit.rangedDamage.tier3}`} /> : null}
			{props.kit.meleeDistance > 0 ? <Field label='Melee Distance' value={`+${props.kit.meleeDistance}`} /> : null}
			{props.kit.rangedDistance > 0 ? <Field label='Ranged Distance' value={`+${props.kit.rangedDistance}`} /> : null}
			{props.kit.disengage > 0 ? <Field label='Disengage' value={`+${props.kit.disengage}`} /> : null}
		</>
	);
};

export const KitPanel = (props: Props) => {
	const ui = useUI();
	const [ page, setPage ] = useState<string>('overview');

	const getOverview = () => {
		return (
			<>
				<Markdown text={props.kit.description} />
				<Field label={kitFieldLabel(ui, 'Uses')} value={kitEquipmentLabels([ ...props.kit.armor, ...props.kit.weapon ])} />
				<Field
					label={ui.text('ui.hero-builder.features.31d1245f', 'Features')}
					value={props.kit.features.map((feature, index) => (
						<span key={feature.id}>
							{index > 0 ? ', ' : ''}
							{feature.type === FeatureType.Ability ? <AbilityName ability={feature.data.ability} /> : feature.name}
						</span>
					))}
				/>
			</>
		);
	};

	const getStats = () => {
		return <KitStats kit={props.kit} />;
	};

	const getFeatures = () => {
		return (
			<>
				{props.kit.features.map(f => <FeaturePanel key={f.id} feature={f} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />)}
			</>
		);
	};

	const getContent = () => {
		let content = null;
		switch (page) {
			case 'overview':
				content = getOverview();
				break;
			case 'stats':
				content = getStats();
				break;
			case 'features':
				content = getFeatures();
				break;
		}

		return (
			<>
				<Segmented
					style={{ marginBottom: '20px' }}
					block={true}
					options={[
						{ value: 'overview', label: ui.text('ui.hero-builder.overview.d4b1ea57', 'Overview') },
						{ value: 'stats', label: kitFieldLabel(ui, 'Stats') },
						{ value: 'features', label: ui.text('ui.hero-builder.features.31d1245f', 'Features') }
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
	if (props.kit.type) {
		tags.push(props.kit.type);
	}
	if (props.sourcebooks.length > 0) {
		const sourcebookType = SourcebookLogic.getKitSourcebook(props.sourcebooks, props.kit)?.type || SourcebookType.Official;
		if (sourcebookType !== SourcebookType.Official) {
			tags.push(sourcebookType);
		}
	}

	if (props.mode !== PanelMode.Full) {
		return (
			<ElementScope element={props.kit}>
				<div className='kit-panel compact'>
					<HeaderText level={1} tags={tags}>
						{props.kit.name || 'Unnamed Kit'}
					</HeaderText>
					<Markdown text={props.kit.description} />
				</div>
			</ElementScope>
		);
	}

	return (
		<ErrorBoundary>
			<ElementScope element={props.kit}>
				<div className='kit-panel' id={SheetFormatter.getPageId('kit', props.kit.id)}>
					<HeaderText level={1} tags={tags}>{props.kit.name || 'Unnamed Kit'}</HeaderText>
					{getContent()}
				</div>
			</ElementScope>
		</ErrorBoundary>
	);
};
