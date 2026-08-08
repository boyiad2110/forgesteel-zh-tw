import { Culture } from '@/models/culture';
import { CultureType } from '@/enums/culture-type';
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
import { localizeUIString } from '@/localization/resolver';
import { useLocalization } from '@/contexts/localization-context';

import './culture-panel.scss';

// How each culture type's tag reads. The CultureType value is what the culture is and what
// filters and compares; a type with no reading here is tagged with that value as it stands.
const cultureTypeTags = [
	{ type: CultureType.Bespoke, key: 'culture-panel.type.bespoke', tag: 'Bespoke' },
	{ type: CultureType.Ancestral, key: 'culture-panel.type.ancestral', tag: 'Ancestral' },
	{ type: CultureType.Professional, key: 'culture-panel.type.professional', tag: 'Professional' },
	{ type: CultureType.Regional, key: 'culture-panel.type.regional', tag: 'Regional' }
];

interface Props {
	culture: Culture;
	sourcebooks: Sourcebook[];
	hero?: Hero;
	mode?: PanelMode;
}

export const CulturePanel = (props: Props) => {
	const { locale } = useLocalization();

	const cultureTypeTag = cultureTypeTags.find(t => t.type === props.culture.type);
	// The sourcebook type tag beside it is not localized here, and is still its canonical value.
	const tags: string[] = [ cultureTypeTag ? localizeUIString(locale, cultureTypeTag.key, cultureTypeTag.tag) : props.culture.type ];
	if (props.sourcebooks.length > 0) {
		const sourcebookType = SourcebookLogic.getCultureSourcebook(props.sourcebooks, props.culture)?.type || SourcebookType.Official;
		if (sourcebookType !== SourcebookType.Official) {
			tags.push(sourcebookType);
		}
	}

	return (
		<ErrorBoundary>
			<div className={props.mode === PanelMode.Full ? 'culture-panel' : 'culture-panel compact'} id={props.mode === PanelMode.Full ? SheetFormatter.getPageId('culture', props.culture.id) : undefined}>
				<HeaderText
					level={1}
					tags={tags}
				>
					{props.culture.name || localizeUIString(locale, 'culture-panel.unnamed', 'Unnamed Culture')}
				</HeaderText>
				<Markdown text={props.culture.description} />
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
		</ErrorBoundary>
	);
};
