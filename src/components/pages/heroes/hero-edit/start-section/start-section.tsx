import { localizeMessage, localizeUIString } from '@/localization/resolver';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { HeroSourcebooksPanel } from '@/components/panels/hero-sourcebooks/hero-sourcebooks-panel';
import { ReactNode } from 'react';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { Sourcebook } from '@/models/sourcebook';
import { useLocalization } from '@/contexts/localization-context';

import './start-section.scss';

const appName = 'FORGE STEEL';

// The canonical English each sentence falls back to. The terms the copy names are
// placeholders so a translation can put them wherever the sentence needs them.
const canonicalEnglish = {
	intro: 'Creating a hero in {appName} is simple.',
	chooseTabs: 'Use the tabs above to select your hero\'s {ancestry}, {culture}, {career}, and {class}. If there are any choices to be made, you\'ll be prompted to make your selections.',
	chooseComplication: 'Optionally, you can choose a {complication} - but you can skip this if you\'d prefer.',
	nameYourHero: 'Finally, go to the {details} tab and give your hero a name.',
	finish: 'When you\'re done, click {saveChanges} in the toolbar at the top, and you\'ll see your hero sheet.'
};

/**
 * Draws a localized sentence with the terms it names still set apart. The terms are the
 * values the sentence was interpolated with, so the emphasis the canonical English gave
 * them lands on the same terms however the translated sentence is worded.
 */
const emphasizeTerms = (sentence: string, terms: string[], Tag: 'b' | 'code') => {
	const nodes: ReactNode[] = [];
	let rest = sentence;

	terms.forEach((term, index) => {
		const at = rest.indexOf(term);
		if (at < 0) {
			// A term the sentence does not read back is simply not emphasized; the
			// sentence itself is still drawn in full.
			return;
		}

		nodes.push(rest.slice(0, at));
		nodes.push(<Tag key={index}>{term}</Tag>);
		rest = rest.slice(at + term.length);
	});

	nodes.push(rest);
	return nodes;
};

interface Props {
	sourcebookIDs: string[];
	sourcebooks: Sourcebook[];
	setSourcebookIDs: (settingIDs: string[]) => void;
	importSourcebook: (sourcebook: Sourcebook) => void;
}

export const StartSection = (props: Props) => {
	const { locale } = useLocalization();

	// The tabs the copy points at, named the same way the tabs themselves are.
	const ancestry = localizeUIString(locale, 'hero-edit.tab.ancestry', 'Ancestry');
	const culture = localizeUIString(locale, 'hero-edit.tab.culture', 'Culture');
	const career = localizeUIString(locale, 'hero-edit.tab.career', 'Career');
	const heroClass = localizeUIString(locale, 'hero-edit.tab.class', 'Class');
	const complication = localizeUIString(locale, 'hero-edit.tab.complication', 'Complication');
	const details = localizeUIString(locale, 'hero-edit.tab.details', 'Details');
	const saveChanges = localizeUIString(locale, 'hero-edit.save-changes', 'Save Changes');

	return (
		<div className='hero-edit-content start-section'>
			<div className='hero-edit-content-column selected'>
				<SelectablePanel>
					<HeaderText>{localizeUIString(locale, 'hero-edit.start.creating-a-hero', 'Creating a Hero')}</HeaderText>
					<div className='ds-text'>
						{emphasizeTerms(localizeMessage(locale, 'hero-edit.start.intro', { appName: appName }, canonicalEnglish.intro), [ appName ], 'b')}
					</div>
					<ul>
						<li>
							{
								emphasizeTerms(
									localizeMessage(locale, 'hero-edit.start.choose-tabs', { ancestry: ancestry, culture: culture, career: career, class: heroClass }, canonicalEnglish.chooseTabs),
									[ ancestry, culture, career, heroClass ],
									'code'
								)
							}
						</li>
						<li>
							{
								emphasizeTerms(
									localizeMessage(locale, 'hero-edit.start.choose-complication', { complication: complication }, canonicalEnglish.chooseComplication),
									[ complication ],
									'code'
								)
							}
						</li>
						<li>
							{
								emphasizeTerms(
									localizeMessage(locale, 'hero-edit.start.name-your-hero', { details: details }, canonicalEnglish.nameYourHero),
									[ details ],
									'code'
								)
							}
						</li>
					</ul>
					<div className='ds-text'>
						{
							emphasizeTerms(
								localizeMessage(locale, 'hero-edit.start.finish', { saveChanges: saveChanges }, canonicalEnglish.finish),
								[ saveChanges ],
								'code'
							)
						}
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
