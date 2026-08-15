/* eslint-disable sort-imports */

import { Alert, Flex, Segmented } from 'antd';
import { Domain } from '@/models/domain';
import { Empty } from '@/components/controls/empty/empty';
import { ErrorBoundary } from '@/components/controls/error-boundary/error-boundary';
import { Expander } from '@/components/controls/expander/expander';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { Markdown } from '@/components/controls/markdown/markdown';
import { PanelMode } from '@/enums/panel-mode';
import { Pill } from '@/components/controls/pill/pill';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { localizeElementField, localizeMessage, localizeUIString } from '@/localization/resolver';
import { useLocalization } from '@/contexts/localization-context';
import { useState } from 'react';

import './domain-panel.scss';

interface Props {
	domain: Domain;
	sourcebooks: Sourcebook[];
	hero?: Hero;
	mode?: PanelMode;
}

export const DomainPanel = (props: Props) => {
	const { locale } = useLocalization();
	const [ page, setPage ] = useState<string>('overview');

	const domainName = props.domain.name
		? localizeElementField(locale, props.domain.id, 'name', props.domain.name)
		: localizeUIString(locale, 'domain-panel.unnamed', 'Unnamed Domain');
	const domainDescription = localizeElementField(locale, props.domain.id, 'description', props.domain.description);

	const getOverview = () => {
		return (
			<Markdown text={domainDescription} />
		);
	};

	const getFeatures = () => {
		return (
			<div className='domain-features-list'>
				{
					props.domain.featuresByLevel.filter(lvl => lvl.features.length > 0).map(lvl => {
						return (
							<Expander
								key={lvl.level}
								title={
									<Field
										label={localizeMessage(locale, 'domain-panel.level', { level: lvl.level.toString() }, 'Level {level}')}
										value={lvl.features.map(f => localizeElementField(locale, f.id, 'name', f.name)).join(', ')}
									/>
								}
							>
								{
									...lvl.features.map(f =>
										<FeaturePanel key={f.id} feature={f} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />
									)
								}
							</Expander>
						);
					})
				}
			</div>
		);
	};

	const getAdditional = () => {
		return (
			<div className='domain-features-list'>
				<Alert
					type='info'
					showIcon={true}
					title={localizeUIString(locale, 'domain-panel.conduit-only-note', 'The features on this page are used by the Conduit class.')}
				/>
				{
					props.domain.resourceGains.length > 0 ?
						<>
							<HeaderText>{localizeUIString(locale, 'domain-panel.resource-gains', 'Resource Gains')}</HeaderText>
							<ul>
								{
									props.domain.resourceGains.map((g, n) => (
										<li key={n}>
											<Flex align='center' justify='space-between' gap={10}>
												<div className='ds-text compact-text'>
													{localizeElementField(locale, props.domain.id, `resourceGains.${n}.trigger`, g.trigger)}
												</div>
												<Pill>+{g.value}</Pill>
											</Flex>
										</li>
									))
								}
							</ul>
						</>
						: null
				}
				{
					props.domain.defaultFeatures.map(f => {
						return (
							<FeaturePanel key={f.id} feature={f} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />
						);
					})
				}
				{
					(props.domain.resourceGains.length === 0) && (props.domain.defaultFeatures.length === 0) ?
						<Empty />
						: null
				}
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
			case 'additional':
				content = getAdditional();
				break;
		}

		// The value is what the panel is on; the label beside it is only how that page reads.
		const pages = [
			{ value: 'overview', label: localizeUIString(locale, 'domain-panel.page.overview', 'Overview') },
			{ value: 'features', label: localizeUIString(locale, 'domain-panel.page.features', 'Features') },
			{ value: 'additional', label: localizeUIString(locale, 'domain-panel.page.additional', 'Additional') }
		];

		return (
			<>
				<Segmented
					style={{ marginBottom: '20px' }}
					block={true}
					options={pages}
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
		const sourcebookType = SourcebookLogic.getDomainSourcebook(props.sourcebooks, props.domain)?.type || SourcebookType.Official;
		if (sourcebookType !== SourcebookType.Official) {
			tags.push(sourcebookType);
		}
	}

	if (props.mode !== PanelMode.Full) {
		return (
			<div className='domain-panel compact'>
				<HeaderText level={1} tags={tags}>
					{domainName}
				</HeaderText>
				<Markdown text={domainDescription} />
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<div className='domain-panel' id={SheetFormatter.getPageId('domain', props.domain.id)}>
				<HeaderText level={1} tags={tags}>
					{domainName}
				</HeaderText>
				{getContent()}
			</div>
		</ErrorBoundary>
	);
};
