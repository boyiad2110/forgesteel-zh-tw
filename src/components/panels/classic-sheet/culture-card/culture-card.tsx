import { FeatureComponent } from '@/components/panels/classic-sheet/components/feature-component';
import { HeroSheet } from '@/models/classic-sheets/hero-sheet';
import { useLanguageNames } from '@/l10n/language-text';
import { PlayerName } from '@/l10n/player-name';

import './culture-card.scss';

interface Props {
	character: HeroSheet;
}

export const CultureCard = (props: Props) => {
	const character = props.character;
	const languageNames = useLanguageNames(character.languages ?? []);

	const getLanguages = () => {
		return character.languages?.map((l, n) => {
			const name = languageNames[n];
			let lang = <li key={l}>{name}</li>;
			if (l.includes('I Speak')) {
				lang = <li key={l}><em>{name}</em></li>;
			}
			return lang;
		});
	};

	return (
		<div className='culture card'>
			<h2>Culture</h2>
			<section className='name bordered'>
				<h3>Culture Name</h3>
				<div className='content'>
					{character.culture ? <PlayerName element={character.culture} /> : null}
				</div>
			</section>
			<section className='culture-language bordered'>
				<h3>Culture Language</h3>
				{
					character.culture?.language ?
						<FeatureComponent
							feature={character.culture?.language}
							hero={character.hero}
						/>
						: null
				}
			</section>
			<div className='culture-edge'>
				<p>
					You gain an edge on tests made to recall lore about your culture,
					and on tests made to influence and interact with people of your culture.
				</p>
			</div>
			<section className='bordered'>
				<h3>Environment</h3>
				<h4>{character.culture?.environment ? <PlayerName element={character.culture.environment} /> : null}</h4>
				{character.culture?.environment ?
					<FeatureComponent
						feature={character.culture?.environment}
						hero={character.hero}
					/>
					: undefined}
			</section>
			<section className='bordered'>
				<h3>Organization</h3>
				<h4>{character.culture?.organization ? <PlayerName element={character.culture.organization} /> : null}</h4>
				{character.culture?.organization ?
					<FeatureComponent
						feature={character.culture?.organization}
						hero={character.hero}
					/>
					: undefined}
			</section>
			<section className='bordered'>
				<h3>Upbringing</h3>
				<h4>{character.culture?.upbringing ? <PlayerName element={character.culture.upbringing} /> : null}</h4>
				{character.culture?.upbringing ?
					<FeatureComponent
						feature={character.culture?.upbringing}
						hero={character.hero}
					/>
					: undefined}
			</section>
			<section className='bordered languages'>
				<h3>Languages</h3>
				<ul>
					{getLanguages()}
				</ul>
			</section>
		</div>
	);
};
