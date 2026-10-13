import { CareerIncident } from '@/l10n/career-incident';
import { CareerSheet } from '@/models/classic-sheets/hero-sheet';
import { FeatureComponent } from '@/components/panels/classic-sheet/components/feature-component';
import { Hero } from '@/models/hero';
import { PlayerName } from '@/l10n/player-name';
import { useOptionalSourcebooks } from '@/contexts/data-context';
import { useUI } from '@/l10n/ui-text';
import './career-card.scss';

interface Props {
	career?: CareerSheet;
	hero: Hero;
}

export const CareerCard = (props: Props) => {
	const ui = useUI();
	const sourcebooks = useOptionalSourcebooks() || [];
	const career = props.career;
	return (
		<div className='career card'>
			<h2>Career</h2>
			<div className='name'>{career && props.hero.career ? <PlayerName element={props.hero.career} fallback={career.name} /> : career?.name}</div>
			<section className='bordered benefit'>
				<h3>{ui.text('ui.hero-builder.benefit.0c0829d3', 'Benefit')}</h3>
				{career?.benefits?.map(f =>
					<FeatureComponent
						feature={f}
						hero={props.hero}
						key={f.id}
					/>
				)}
			</section>

			<section className='bordered inciting-incident'>
				<h3>Inciting Incident</h3>
				{career?.incitingIncident
					? (
						<CareerIncident career={props.hero.career || undefined} incident={career.incitingIncident} sourcebooks={sourcebooks}>
							{incident => <><h4>{incident.name}</h4><p>{incident.description}</p></>}
						</CareerIncident>
					)
					: null}
			</section>
		</div>
	);
};
