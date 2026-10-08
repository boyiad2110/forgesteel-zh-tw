import { ErrorBoundary } from '@/components/controls/error-boundary/error-boundary';
import { Field } from '@/components/controls/field/field';
import { Follower } from '@/models/follower';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Markdown } from '@/components/controls/markdown/markdown';
import { PanelMode } from '@/enums/panel-mode';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { StatsRow } from '@/components/panels/stats-row/stats-row';
import { useLanguageNames } from '@/l10n/language-text';
import { useSkillNames } from '@/l10n/skill-text';

import './follower-panel.scss';

interface Props {
	follower: Follower;
	mode?: PanelMode;
}

const FollowerDetails = (props: { follower: Follower }) => {
	const skills = useSkillNames([ ...props.follower.skills ].sort());
	const languages = useLanguageNames([ 'Caelian', ...props.follower.languages ].sort());

	return (
		<>
			<StatsRow>
				{props.follower.characteristics.map(ch => <Field key={ch.characteristic} orientation='vertical' label={ch.characteristic} value={ch.value} />)}
			</StatsRow>
			<Field label='Skills' value={skills.join(', ') || '(none)'} />
			<Field label='Languages' value={languages.join(', ') || '(none)'} />
		</>
	);
};

export const FollowerPanel = (props: Props) => {
	return (
		<ErrorBoundary>
			<div className={props.mode === PanelMode.Full ? 'follower-panel' : 'follower-panel compact'} id={props.mode === PanelMode.Full ? SheetFormatter.getPageId('follower', props.follower.id) : undefined}>
				<HeaderText
					level={1}
					tags={[ props.follower.type ]}
				>
					{props.follower.name || 'Unnamed Follower'}
				</HeaderText>
				<Markdown text={props.follower.description || `${props.follower.type} follower.`} />
				{
					props.mode === PanelMode.Full ?
						<FollowerDetails follower={props.follower} />
						: null
				}
			</div>
		</ErrorBoundary>
	);
};
