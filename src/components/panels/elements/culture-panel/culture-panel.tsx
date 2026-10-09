import { Culture } from '@/models/culture';
import { ElementScope } from '@/l10n/element-scope';
import { ErrorBoundary } from '@/components/controls/error-boundary/error-boundary';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { Markdown } from '@/components/controls/markdown/markdown';
import { PanelMode } from '@/enums/panel-mode';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { usePlayerCultureSummary } from '@/l10n/player-culture-summary';

import './culture-panel.scss';

interface Props {
	culture: Culture;
	sourcebooks: Sourcebook[];
	hero?: Hero;
	mode?: PanelMode;
}

export const CulturePanel = (props: Props) => {
	const cultureDescription = usePlayerCultureSummary(props.culture, props.sourcebooks);
	const tags: string[] = [ props.culture.type ];
	if (props.sourcebooks.length > 0) {
		const sourcebookType = SourcebookLogic.getCultureSourcebook(props.sourcebooks, props.culture)?.type || SourcebookType.Official;
		if (sourcebookType !== SourcebookType.Official) {
			tags.push(sourcebookType);
		}
	}

	return (
		<ErrorBoundary>
			<ElementScope element={props.culture}>
				<div className={props.mode === PanelMode.Full ? 'culture-panel' : 'culture-panel compact'} id={props.mode === PanelMode.Full ? SheetFormatter.getPageId('culture', props.culture.id) : undefined}>
					<HeaderText
						level={1}
						tags={tags}
					>
						{props.culture.name || 'Unnamed Culture'}
					</HeaderText>
					<Markdown text={cultureDescription} />
					{
						props.mode === PanelMode.Full ?
							<div style={{ paddingTop: '10px' }}>
								<FeaturePanel feature={props.culture.language} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />
								{props.culture.environment ? <FeaturePanel feature={props.culture.environment} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} /> : null}
								{props.culture.organization ? <FeaturePanel feature={props.culture.organization} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} /> : null}
								{props.culture.upbringing ? <FeaturePanel feature={props.culture.upbringing} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} /> : null}
							</div>
							: null
					}
				</div>
			</ElementScope>
		</ErrorBoundary>
	);
};
