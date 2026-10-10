import { HeaderText } from '@/components/controls/header-text/header-text';
import { HeroSourcebooksPanel } from '@/components/panels/hero-sourcebooks/hero-sourcebooks-panel';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { Sourcebook } from '@/models/sourcebook';
import { useUI } from '@/l10n/ui-text';

import './start-section.scss';

interface Props {
	sourcebookIDs: string[];
	sourcebooks: Sourcebook[];
	setSourcebookIDs: (settingIDs: string[]) => void;
	importSourcebook: (sourcebook: Sourcebook) => void;
}

export const StartSection = (props: Props) => {
	const ui = useUI();
	return (
		<div className='hero-edit-content start-section'>
			<div className='hero-edit-content-column selected'>
				<SelectablePanel>
					<HeaderText>{ui.text('ui.hero-builder.creating-a-hero.09586add', 'Creating a Hero')}</HeaderText>
					<div className='ds-text'>
						{ui.text('ui.hero-builder.creating-a-hero-in.9a412045', 'Creating a hero in')} <b>FORGE STEEL</b> {ui.text('ui.hero-builder.is-simple.dde61b97', 'is simple.')}
					</div>
					<ul>
						<li>
							{ui.text('ui.hero-builder.use-the-tabs-above-to-select.03b413ab', 'Use the tabs above to select your hero\'s')} <code>{ui.text('ui.hero-builder.ancestry.638cf5ee', 'Ancestry')}</code>{ui.language === 'zh-TW' ? '、' : ', '}<code>{ui.text('ui.hero-builder.culture.a3132ad2', 'Culture')}</code>{ui.language === 'zh-TW' ? '、' : ', '}<code>{ui.text('ui.hero-builder.career.bb829dbb', 'Career')}</code>{ui.text('ui.hero-builder.and.a8dce43d', ', and')} <code>{ui.text('ui.hero-builder.class.9be228a0', 'Class')}</code>{ui.text('ui.hero-builder.if-there-are-any-choices-to-.f393a771', '. If there are any choices to be made, you\'ll be prompted to make your selections.')}
						</li>
						<li>
							{ui.text('ui.hero-builder.optionally-you-can-choose-a.1b063f03', 'Optionally, you can choose a')} <code>{ui.text('ui.hero-builder.complication.d37d8e77', 'Complication')}</code>{ui.language === 'zh-TW' ? '' : ' '}{ui.text('ui.hero-builder.but-you-can-skip-this-if-you.21d25869', '- but you can skip this if you\'d prefer.')}
						</li>
						<li>
							{ui.text('ui.hero-builder.finally-go-to-the.3f9b524b', 'Finally, go to the')} <code>{ui.text('ui.hero-builder.details.a3eba45b', 'Details')}</code>{ui.language === 'zh-TW' ? '' : ' '}{ui.text('ui.hero-builder.tab-and-give-your-hero-a-nam.eead94f6', 'tab and give your hero a name.')}
						</li>
					</ul>
					<div className='ds-text'>
						{ui.text('ui.hero-builder.when-you-re-done-click.a682c8f7', 'When you\'re done, click')} <code>{ui.text('ui.hero-builder.save-changes.7215be78', 'Save Changes')}</code>{ui.language === 'zh-TW' ? '' : ' '}{ui.text('ui.hero-builder.in-the-toolbar-at-the-top-an.73c2771b', 'in the toolbar at the top, and you\'ll see your hero sheet.')}
					</div>
				</SelectablePanel>
			</div>
			<div className='hero-edit-content-column selected'>
				<HeroSourcebooksPanel
					sourcebooks={props.sourcebooks}
					sourcebookIDs={props.sourcebookIDs}
					onImportSourcebook={props.importSourcebook}
					onChange={props.setSourcebookIDs}
				/>
			</div>
		</div>
	);
};
