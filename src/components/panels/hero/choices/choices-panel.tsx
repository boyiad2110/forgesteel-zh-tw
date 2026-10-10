import { Ancestry } from '@/models/ancestry';
import { Career } from '@/models/career';
import { Complication } from '@/models/complication';
import { Culture } from '@/models/culture';
import { Domain } from '@/models/domain';
import { Element } from '@/models/element';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { HeroClass } from '@/models/class';
import { HeroLogic } from '@/logic/hero-logic';
import { HeroModalType } from '@/enums/hero-modal-type';
import { Kit } from '@/models/kit';
import { ProjectLogic } from '@/logic/project-logic';
import { Sourcebook } from '@/models/sourcebook';
import { Title } from '@/models/title';
import { useOptions } from '@/contexts/data-context';
import { PlayerName } from '@/l10n/player-name';
import { useUI } from '@/l10n/ui-text';

import './choices-panel.scss';

interface Props {
	hero: Hero;
	sourcebooks: Sourcebook[];
	onSelectAncestry: (ancestry: Ancestry) => void;
	onSelectCulture: (culture: Culture) => void;
	onSelectCareer: (career: Career) => void;
	onSelectClass: (heroClass: HeroClass) => void;
	onSelectComplication: (complication: Complication) => void;
	onSelectDomain: (domain: Domain) => void;
	onSelectKit: (kit: Kit) => void;
	onSelectTitle: (title: Title) => void;
	onShowState: (state: HeroModalType) => void;
}

export const ChoicesPanel = (props: Props) => {
	const options = useOptions();
	const ui = useUI();
	let incitingIncident: Element | null = null;
	if (props.hero.career) {
		incitingIncident = props.hero.career.incitingIncidents.selected;
	}

	const useRows = options.compactView;

	return (
		<div className={`choices-section ${useRows ? 'compact' : ''}`}>
			{
				props.hero.ancestry ?
					useRows ?
						<div className='selectable-row clickable' onClick={() => props.onSelectAncestry(props.hero.ancestry!)}>
							<div>{ui.text('ui.hero-builder.ancestry.638cf5ee', 'Ancestry')}: <b><PlayerName element={props.hero.ancestry} /></b></div>
						</div>
						:
						<div className='overview-tile clickable' onClick={() => props.onSelectAncestry(props.hero.ancestry!)}>
							<HeaderText>{ui.text('ui.hero-builder.ancestry.f8f07987', 'Ancestry')}</HeaderText>
							<Field label={ui.text('ui.hero-builder.ancestry.f8f07987', 'Ancestry')} value={<PlayerName element={props.hero.ancestry} />} />
							{HeroLogic.getFormerAncestries(props.hero).map(a => <Field key={a.id} label={ui.text('ui.hero-builder.former-life.2d120c9d', 'Former Life')} value={<PlayerName element={a} />} />)}
						</div>
					:
					<div className='overview-tile'>
						<HeaderText>{ui.text('ui.hero-builder.ancestry.f8f07987', 'Ancestry')}</HeaderText>
						<div className='ds-text dimmed-text'>{ui.text('ui.hero-builder.no-ancestry-chosen.c7dff4d7', 'No ancestry chosen')}</div>
					</div>
			}
			{
				props.hero.culture ?
					useRows ?
						<div className='selectable-row clickable' onClick={() => props.onSelectCulture(props.hero.culture!)}>
							<div>{ui.text('ui.hero-builder.culture.a3132ad2', 'Culture')}: <b><PlayerName element={props.hero.culture} /></b></div>
						</div>
						:
						<div className='overview-tile clickable' onClick={() => props.onSelectCulture(props.hero.culture!)}>
							<HeaderText>{ui.text('ui.hero-builder.culture.06f1b137', 'Culture')}</HeaderText>
							{props.hero.culture ? <Field label={ui.text('ui.hero-builder.culture.06f1b137', 'Culture')} value={<PlayerName element={props.hero.culture} />} /> : null}
							{props.hero.culture.environment ? <Field label={ui.text('ui.hero-builder.environment.b9b1aade', 'Environment')} value={<PlayerName element={props.hero.culture.environment} />} /> : null}
							{props.hero.culture.organization ? <Field label={ui.text('ui.hero-builder.organization.a6425036', 'Organization')} value={<PlayerName element={props.hero.culture.organization} />} /> : null}
							{props.hero.culture.upbringing ? <Field label={ui.text('ui.hero-builder.upbringing.402fbf01', 'Upbringing')} value={<PlayerName element={props.hero.culture.upbringing} />} /> : null}
						</div>
					:
					<div className='overview-tile'>
						<HeaderText>{ui.text('ui.hero-builder.culture.06f1b137', 'Culture')}</HeaderText>
						<div className='ds-text dimmed-text'>{ui.text('ui.hero-builder.no-culture-chosen.6b98c260', 'No culture chosen')}</div>
					</div>
			}
			{
				props.hero.career ?
					useRows ?
						<div className='selectable-row clickable' onClick={() => props.onSelectCareer(props.hero.career!)}>
							<div>{ui.text('ui.hero-builder.career.bb829dbb', 'Career')}: <b>{props.hero.career.name}</b></div>
						</div>
						:
						<div className='overview-tile clickable' onClick={() => props.onSelectCareer(props.hero.career!)}>
							<HeaderText>{ui.text('ui.hero-builder.career.d360a160', 'Career')}</HeaderText>
							<Field label={ui.text('ui.hero-builder.career.d360a160', 'Career')} value={props.hero.career.name} />
							{incitingIncident ? <Field label={ui.text('ui.hero-builder.inciting-incident.181ce686', 'Inciting Incident')} value={incitingIncident.name} /> : null}
						</div>
					:
					<div className='overview-tile'>
						<HeaderText>{ui.text('ui.hero-builder.career.d360a160', 'Career')}</HeaderText>
						<div className='ds-text dimmed-text'>{ui.text('ui.hero-builder.no-career-chosen.9451b589', 'No career chosen')}</div>
					</div>
			}
			{
				props.hero.class ?
					useRows ?
						<div className='selectable-row clickable' onClick={() => props.onSelectClass(props.hero.class!)}>
							<div>{ui.text('ui.hero-builder.class.9be228a0', 'Class')}: <b>{props.hero.class.name} ({[ ui.format('ui.hero-builder.level.b63ee29c', '`level ${props.hero.class.level}`', `level ${props.hero.class.level}`, { level: props.hero.class.level }), ...HeroLogic.getClassSpecialization(props.hero) ].join(' ')})</b></div>
						</div>
						:
						<div className='overview-tile clickable' onClick={() => props.onSelectClass(props.hero.class!)}>
							<HeaderText>{ui.text('ui.hero-builder.class.93255bb9', 'Class')}</HeaderText>
							<Field label={ui.text('ui.hero-builder.class.93255bb9', 'Class')} value={props.hero.class.name} />
							<Field label={ui.text('ui.hero-builder.level.b383f415', 'Level')} value={props.hero.class.level} />
							{
								HeroLogic.getClassSpecialization(props.hero).length > 0 ?
									<Field label={props.hero.class.subclassName || ui.text('ui.hero-builder.domains.26a6e690', 'Domains')} value={HeroLogic.getClassSpecialization(props.hero).join(', ')} />
									: null
							}
						</div>
					:
					<div className='overview-tile'>
						<HeaderText>{ui.text('ui.hero-builder.class.93255bb9', 'Class')}</HeaderText>
						<div className='ds-text dimmed-text'>{ui.text('ui.hero-builder.no-class-chosen.f0123fb0', 'No class chosen')}</div>
					</div>
			}
			{
				HeroLogic.getDomains(props.hero).length > 0 ?
					HeroLogic.getDomains(props.hero).map(domain =>
						useRows ?
							<div key={domain.id} className='selectable-row clickable' onClick={() => props.onSelectDomain(domain)}>
								<div>{ui.text('ui.hero-builder.domain.67b22e3e', 'Domain')}: <b>{domain.name}</b></div>
							</div>
							:
							<div key={domain.id} className='overview-tile clickable' onClick={() => props.onSelectDomain(domain)}>
								<HeaderText>{ui.text('ui.hero-builder.domain.67b22e3e', 'Domain')}</HeaderText>
								<Field label={ui.text('ui.hero-builder.domain.67b22e3e', 'Domain')} value={domain.name} />
							</div>
					)
					:
					null
			}
			{
				HeroLogic.getKits(props.hero).length > 0 ?
					HeroLogic.getKits(props.hero).map(kit =>
						useRows ?
							<div key={kit.id} className='selectable-row clickable' onClick={() => props.onSelectKit(kit)}>
								<div>{ui.text('ui.hero-builder.kit.63d5adfa', 'Kit')}: <b>{kit.name}</b></div>
							</div>
							:
							<div key={kit.id} className='overview-tile clickable' onClick={() => props.onSelectKit(kit)}>
								<HeaderText>{ui.text('ui.hero-builder.kit.63d5adfa', 'Kit')}</HeaderText>
								<Field label={ui.text('ui.hero-builder.kit.63d5adfa', 'Kit')} value={kit.name} />
								{kit.armor.length > 0 ? <Field label={ui.text('ui.hero-builder.armor.d165ace3', 'Armor')} value={kit.armor.join(', ')} /> : null}
								{kit.weapon.length > 0 ? <Field label={ui.text('ui.hero-builder.weapons.3189d297', 'Weapons')} value={kit.weapon.join(', ')} /> : null}
							</div>
					)
					:
					null
			}
			{
				HeroLogic.getTitles(props.hero).length > 0 ?
					HeroLogic.getTitles(props.hero).map(title =>
						useRows ?
							<div key={title.id} className='selectable-row clickable' onClick={() => props.onSelectTitle(title)}>
								<div>{ui.text('ui.hero-builder.title.f0bf18b2', 'Title')}: <b>{title.name}</b></div>
							</div>
							:
							<div key={title.id} className='overview-tile clickable' onClick={() => props.onSelectTitle(title)}>
								<HeaderText>{ui.text('ui.hero-builder.title.f0bf18b2', 'Title')}</HeaderText>
								<Field label={ui.text('ui.hero-builder.title.f0bf18b2', 'Title')} value={title.name} />
							</div>
					)
					:
					null
			}
			{
				HeroLogic.getComplications(props.hero).map(complication =>
					useRows ?
						<div key={complication.id} className='selectable-row clickable' onClick={() => props.onSelectComplication(complication)}>
							<div>{ui.text('ui.hero-builder.complication.d37d8e77', 'Complication')}: <b>{complication.name}</b></div>
						</div>
						:
						<div key={complication.id} className='overview-tile clickable' onClick={() => props.onSelectComplication(complication)}>
							<HeaderText>{ui.text('ui.hero-builder.complication.312ac90f', 'Complication')}</HeaderText>
							<Field label={ui.text('ui.hero-builder.complication.312ac90f', 'Complication')} value={complication.name} />
						</div>
				)
			}
			{
				props.hero.state.projects.length > 0 ?
					props.hero.state.projects.map(project =>
						useRows ?
							<div key={project.id} className='selectable-row clickable' onClick={() => props.onShowState(HeroModalType.Projects)}>
								<div>{ui.text('ui.hero-builder.project.7dc34b5f', 'Project')}: <b>{project.name}</b></div>
							</div>
							:
							<div key={project.id} className='overview-tile clickable' onClick={() => props.onShowState(HeroModalType.Projects)}>
								<HeaderText>{ui.text('ui.hero-builder.project.7dc34b5f', 'Project')}</HeaderText>
								<Field label={ui.text('ui.hero-builder.project.7dc34b5f', 'Project')} value={project.name} />
								{project.progress ? <Field label={ui.text('ui.hero-builder.state.31408083', 'State')} value={ProjectLogic.getStatus(project)} /> : null}
							</div>
					)
					:
					null
			}
		</div>
	);
};
