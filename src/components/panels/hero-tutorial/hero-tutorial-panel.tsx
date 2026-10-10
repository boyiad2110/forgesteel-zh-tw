import { Space, Steps } from 'antd';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Info } from '@/components/controls/info/info';
import { Toggle } from '@/components/controls/toggle/toggle';
import { TutorialMode } from '@/enums/tutorial-mode';
import { useUI } from '@/l10n/ui-text';

import './hero-tutorial-panel.scss';

interface Props {
	value: TutorialMode;
	onChange: (value: TutorialMode) => void;
}

export const HeroTutorialPanel = (props: Props) => {
	const ui = useUI();
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
				extra={<Info>{ui.text('ui.hero-builder.switch-this-on-if-you-want-t.402c5efc', 'Switch this on if you want to gain your abilities incrementally.')}</Info>}
			>
				{ui.text('ui.hero-builder.tutorial-mode.6b8e85d4', 'Tutorial Mode')}
			</HeaderText>
			<Space orientation='vertical' style={{ width: '100%' }}>
				<Toggle
					label={ui.text('ui.hero-builder.tutorial-mode.6b8e85d4', 'Tutorial Mode')}
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
									title: ui.text('ui.hero-builder.stage-1.7031dbb9', 'Stage 1'),
									content: (
										<ul>
											<li>{ui.text('ui.hero-builder.no-triggered-action-abilitie.a6aa88d8', 'No triggered action abilities')}</li>
											<li>{ui.text('ui.hero-builder.no-abilities-with-a-heroic-r.6ba2f307', 'No abilities with a heroic resource cost')}</li>
											<li>{ui.text('ui.hero-builder.no-disengage-bonus.3ee0d1c6', 'No disengage bonus')}</li>
											<li>{ui.text('ui.hero-builder.no-perks.b95a0ec8', 'No perks')}</li>
										</ul>
									)
								},
								{
									title: ui.text('ui.hero-builder.stage-2.d05b49f4', 'Stage 2'),
									content: (
										<ul>
											<li>{ui.text('ui.hero-builder.no-abilities-with-a-heroic-r.8216a4ec', 'No abilities with a heroic resource cost of more than 3')}</li>
											<li>{ui.text('ui.hero-builder.no-perks.b95a0ec8', 'No perks')}</li>
										</ul>
									)
								},
								{
									title: ui.text('ui.hero-builder.stage-3.9c7fa387', 'Stage 3'),
									content: (
										<ul>
											<li>{ui.text('ui.hero-builder.no-perks.b95a0ec8', 'No perks')}</li>
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
