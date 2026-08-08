import { Space, Steps } from 'antd';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Info } from '@/components/controls/info/info';
import { Toggle } from '@/components/controls/toggle/toggle';
import { TutorialMode } from '@/enums/tutorial-mode';
import { localizeUIString } from '@/localization/resolver';
import { useLocalization } from '@/contexts/localization-context';

import './hero-tutorial-panel.scss';

interface Props {
	value: TutorialMode;
	onChange: (value: TutorialMode) => void;
}

export const HeroTutorialPanel = (props: Props) => {
	const { locale } = useLocalization();

	const indexToStage = (value: number) => {
		switch (value) {
			case 0:
				return TutorialMode.Stage1;
			case 1:
				return TutorialMode.Stage2;
			case 2:
				return TutorialMode.Stage3;
		}

		return TutorialMode.Complete;
	};

	const stateToIndex = (value: TutorialMode) => {
		switch (value) {
			case TutorialMode.Stage1:
				return 0;
			case TutorialMode.Stage2:
				return 1;
			case TutorialMode.Stage3:
				return 2;
		}

		return -1;
	};

	return (
		<div className='hero-tutorial-panel'>
			<HeaderText
				extra={<Info>{localizeUIString(locale, 'hero-tutorial.explanation', 'Switch this on if you want to gain your abilities incrementally.')}</Info>}
			>
				{localizeUIString(locale, 'hero-tutorial.title', 'Tutorial Mode')}
			</HeaderText>
			<Space orientation='vertical' style={{ width: '100%' }}>
				<Toggle
					label={localizeUIString(locale, 'hero-tutorial.title', 'Tutorial Mode')}
					value={props.value !== TutorialMode.Complete}
					onChange={value => props.onChange(value ? TutorialMode.Stage1 : TutorialMode.Complete)}
				/>
				{
					props.value !== TutorialMode.Complete ?
						<Steps
							orientation='vertical'
							current={stateToIndex(props.value)}
							onChange={value => props.onChange(indexToStage(value))}
							items={[
								{
									// The stage a step stands for is its position, as it always was; the
									// title beside it is only how that stage is read.
									title: localizeUIString(locale, 'hero-tutorial.stage-1', 'Stage 1'),
									content: (
										<ul>
											<li>{localizeUIString(locale, 'hero-tutorial.no-triggered-action-abilities', 'No triggered action abilities')}</li>
											<li>{localizeUIString(locale, 'hero-tutorial.no-heroic-resource-abilities', 'No abilities with a heroic resource cost')}</li>
											<li>{localizeUIString(locale, 'hero-tutorial.no-disengage-bonus', 'No disengage bonus')}</li>
											<li>{localizeUIString(locale, 'hero-tutorial.no-perks', 'No perks')}</li>
										</ul>
									)
								},
								{
									title: localizeUIString(locale, 'hero-tutorial.stage-2', 'Stage 2'),
									content: (
										<ul>
											<li>{localizeUIString(locale, 'hero-tutorial.no-costly-heroic-resource-abilities', 'No abilities with a heroic resource cost of more than 3')}</li>
											<li>{localizeUIString(locale, 'hero-tutorial.no-perks', 'No perks')}</li>
										</ul>
									)
								},
								{
									title: localizeUIString(locale, 'hero-tutorial.stage-3', 'Stage 3'),
									content: (
										<ul>
											<li>{localizeUIString(locale, 'hero-tutorial.no-perks', 'No perks')}</li>
										</ul>
									)
								}
							]}
						/>
						: null
				}
			</Space>
		</div>
	);
};
