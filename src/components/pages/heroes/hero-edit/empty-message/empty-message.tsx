import { Alert, Button, Divider } from 'antd';
import { Hero } from '@/models/hero';
import { useNavigation } from '@/hooks/use-navigation';
import { useUI } from '@/l10n/ui-text';

import './empty-message.scss';

interface Props {
	hero: Hero;
}

export const EmptyMessage = (props: Props) => {
	const ui = useUI();
	const navigation = useNavigation();

	return (
		<Alert
			type='info'
			showIcon={true}
			title={
				<div className='empty-message'>
					{ui.text('ui.hero-builder.looking-for-something-specif.65c7e1a8', 'Looking for something specific? If it\'s third-party or homebrew, make sure you\'ve included the sourcebook it\'s in.')}
					<Divider orientation='vertical' />
					<Button type='primary' onClick={() => navigation.goToHeroEdit(props.hero.id, 'start')}>
						{ui.text('ui.hero-builder.click-here.319b8c1e', 'Click Here')}
					</Button>
				</div>
			}
		/>
	);
};
