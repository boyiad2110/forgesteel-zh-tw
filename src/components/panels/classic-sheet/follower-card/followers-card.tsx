import { CharacteristicsComponent } from '@/components/panels/classic-sheet/components/characteristics-component';
import { FollowerSheet } from '@/models/classic-sheets/hero-sheet';
import { useLanguageNames } from '@/l10n/language-text';
import { useMemo } from 'react';

import './follower-card.scss';

const FollowerLanguages = (props: { languages?: string[] }) => {
	const names = useLanguageNames(props.languages ?? []);
	return (
		<span>{names.join(', ')}</span>
	);
};

interface Props {
	followers: FollowerSheet[];
}

export const FollowersCard = (props: Props) => {
	const followers = useMemo(() => props.followers, [ props.followers ]);

	const getFollowerBlock = (follower: FollowerSheet) => {
		return (
			<div className='follower' key={follower.id}>
				<div className='name-wrapper'>
					<h2>
						<span className='name'>{follower.name}</span>
						<span className='type'>{follower.type} {follower.classification}</span>
						<span className='keywords'>{follower.keywords}</span>
					</h2>
				</div>
				<CharacteristicsComponent characteristics={follower.characteristics} />
				<div className='stat skills'>
					<label>Skills:</label>
					<span>{follower.skills?.join(', ')}</span>
				</div>
				<div className='stat languages'>
					<label>Languages:</label>
					<FollowerLanguages languages={follower.languages} />
				</div>
			</div>
		);
	};

	return (
		<div className='followers card'>
			<h2>Followers</h2>
			{followers.map(f => getFollowerBlock(f))}
		</div>
	);
};
